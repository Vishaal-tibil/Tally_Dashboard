import json
import os
from pathlib import Path
from typing import List

import httpx
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

MISTRAL_KEY = os.environ.get("MISTRAL_API_KEY", "")
MISTRAL_URL = "https://api.mistral.ai/v1/chat/completions"
DATA_DIR    = Path(os.environ.get("TALLY_DATA_DIR", Path(__file__).parent.parent.parent / "tally"))


def _call_mistral(messages, model="mistral-small-latest", max_tokens=800):
    if not MISTRAL_KEY:
        raise ValueError("MISTRAL_API_KEY not set in .env")
    r = httpx.post(
        MISTRAL_URL,
        headers={"Authorization": f"Bearer {MISTRAL_KEY}", "Content-Type": "application/json"},
        json={"model": model, "messages": messages, "max_tokens": max_tokens},
        timeout=30,
    )
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]


def _build_context():
    def rd(fn):
        p = DATA_DIR / fn
        return pd.read_csv(p) if p.exists() else pd.DataFrame()

    sales = rd("sales_register.csv")
    purch = rd("purchase_register.csv")
    leds  = rd("ledgers.csv")
    out   = rd("outstanding_comparative.csv")
    inv   = rd("voucher_inventory.csv")

    lines = ["TALLY ERP — Ravi Super Market (Supermarket)", ""]

    if not sales.empty:
        rev = sales["invoice_total"].sum()
        lines.append(f"SALES: {len(sales)} invoices | Total ₹{rev/1e5:.1f}L")
        for p, t in sales.groupby("party_ledger")["invoice_total"].sum().items():
            lines.append(f"  {p}: ₹{t/1e5:.1f}L")

    if not purch.empty:
        pur = purch["invoice_total"].sum()
        lines.append(f"PURCHASES: {len(purch)} invoices | Total ₹{pur/1e7:.2f}Cr")
        for p, t in purch.groupby("party_ledger")["invoice_total"].sum().items():
            lines.append(f"  {p}: ₹{t/1e7:.2f}Cr")

    if not leds.empty:
        bk = leds[leds["parent_group"].isin(["Bank Accounts", "Cash-in-Hand"])]
        lines.append(f"CASH & BANK: ₹{bk['closing_balance'].dropna().apply(abs).sum()/1e7:.2f}Cr")
        for _, r in bk.iterrows():
            lines.append(f"  {r['ledger_name']}: ₹{abs(r['closing_balance'] or 0)/1e7:.2f}Cr")

        gst  = leds[leds["parent_group"] == "Duties & Taxes"]
        out_ = gst[gst["ledger_name"].str.lower().str.contains("output|ouput", na=False)]["closing_balance"].apply(abs).sum()
        in_  = gst[gst["ledger_name"].str.lower().str.contains("input",        na=False)]["closing_balance"].apply(abs).sum()
        lines.append(f"GST: Output ₹{out_/1e7:.2f}Cr | Input ₹{in_/1e7:.2f}Cr | Net Payable ₹{(out_-in_)/1e7:.2f}Cr")

    if not out.empty and "bill_ref" in out.columns:
        od   = out.drop_duplicates(subset=["party", "bill_ref"])
        recv = od[od["outstanding_type"] == "Receivable"]["pending_amount"].sum()
        pay  = od[od["outstanding_type"] == "Payable"]["pending_amount"].sum()
        lines.append(f"OUTSTANDING: Receivable ₹{recv/1e7:.2f}Cr | Payable ₹{pay/1e7:.2f}Cr")
        for _, r in od.iterrows():
            lines.append(f"  {r['outstanding_type']} — {r['party']} | Bill {r.get('bill_ref','')} | ₹{r['pending_amount']/1e5:.1f}L | {r['ageing_bucket']} days")

    if not inv.empty:
        top = inv.groupby("stock_item").size().sort_values(ascending=False).head(8)
        lines.append(f"TOP PRODUCTS: {', '.join(top.index.tolist())}")

    return "\n".join(lines)


def _parse_json(raw):
    text = raw.strip()
    if text.startswith("```"):
        text = "\n".join(text.splitlines()[1:])
    if text.endswith("```"):
        text = text[: text.rfind("```")]
    try:
        return json.loads(text)
    except Exception:
        return {}


INSIGHTS_PROMPT = """Analyse this Tally ERP data for an Indian supermarket. Return EXACTLY this JSON (no markdown, no extra keys):

{
  "bullets": [
    "<insight 1 — specific metric with number>",
    "<insight 2>",
    "<insight 3>",
    "<insight 4>",
    "<insight 5>"
  ],
  "metrics": [
    {"label": "<KPI name>", "value": "<value with ₹ or %>", "highlight": "positive|negative|neutral"},
    {"label": "<KPI name>", "value": "<value>", "highlight": "positive|negative|neutral"},
    {"label": "<KPI name>", "value": "<value>", "highlight": "positive|negative|neutral"},
    {"label": "<KPI name>", "value": "<value>", "highlight": "positive|negative|neutral"}
  ]
}

Focus on: cash position vs GST liability, overdue outstanding recovery, purchase vs sales spread, top revenue party.
Exactly 5 bullets and 4 metric cards."""


@router.post("/insights")
def insights():
    try:
        ctx = _build_context()
        raw = _call_mistral([
            {"role": "system", "content": "You are a financial analyst for an Indian SME supermarket. Be concise and specific."},
            {"role": "user",   "content": f"{INSIGHTS_PROMPT}\n\nData:\n{ctx}"},
        ], max_tokens=900)
        data = _parse_json(raw)
        return {"insights": data.get("bullets", []), "metrics": data.get("metrics", [])}
    except ValueError as e:
        return {"insights": [str(e)], "metrics": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ChatMsg(BaseModel):
    message: str
    history: List[dict] = []


@router.post("/chat")
def chat(body: ChatMsg):
    try:
        ctx    = _build_context()
        system = (
            "You are a financial assistant for Ravi Super Market. "
            "Answer questions about their Tally ERP data. "
            "Use ₹ for INR amounts. Be concise (2-4 sentences max). "
            "If data is missing, say so honestly.\n\n"
            f"Current financial data:\n{ctx}"
        )
        msgs = [{"role": "system", "content": system}]
        for h in body.history[-12:]:
            msgs.append({"role": h["role"], "content": h["content"]})
        msgs.append({"role": "user", "content": body.message})

        reply = _call_mistral(msgs, model="mistral-small-latest", max_tokens=400)
        return {"reply": reply}
    except ValueError as e:
        return {"reply": f"⚠ {e}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
