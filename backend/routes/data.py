import os
from datetime import datetime
from pathlib import Path

import pandas as pd
from fastapi import APIRouter

router   = APIRouter()
DATA_DIR = Path(os.environ.get("TALLY_DATA_DIR", Path(__file__).parent.parent.parent / "tally"))

CREDITOR_GROUPS = {"Sundry Creditors", "Creditors", "Accounts Payable"}
DEBTOR_GROUPS   = {"Sundry Debtors",   "Debtors",   "Accounts Receivable",
                   "South Debtors",    "North Debtors"}


def _read(filename):
    p = DATA_DIR / filename
    if not p.exists():
        return pd.DataFrame()
    try:
        return pd.read_csv(p)
    except Exception:
        return pd.DataFrame()


def _source(filename, df, label=None):
    p = DATA_DIR / filename
    if not p.exists():
        return {"file": label or filename, "rows": 0, "updated": None, "confidence": "low"}
    mtime    = datetime.fromtimestamp(p.stat().st_mtime)
    age_days = (datetime.now() - mtime).days
    rows     = len(df)
    conf     = "high" if rows > 0 and age_days <= 1 else "medium" if rows > 0 and age_days <= 7 else "low"
    return {"file": label or filename, "rows": rows,
            "updated": mtime.strftime("%d %b %Y, %H:%M"), "confidence": conf}


def _latest_out(df):
    """Return rows for the most-recent as_on date only, then dedup per (party, bill_ref)."""
    if df.empty:
        return df
    if "as_on" in df.columns:
        df = df[df["as_on"] == df["as_on"].max()]
    if "bill_ref" in df.columns:
        df = df.drop_duplicates(subset=["party", "bill_ref"])
    return df


@router.get("/data")
def get_data():
    sales_df = _read("sales_register.csv")
    purch_df = _read("purchase_register.csv")
    out_df   = _read("outstanding_comparative.csv")
    led_df   = _read("ledgers.csv")
    inv_df   = _read("voucher_inventory.csv")

    # ── KPIs ──────────────────────────────────────────────────────────────────
    rev = float(sales_df["invoice_total"].sum()) if not sales_df.empty else 0
    pur = float(purch_df["invoice_total"].sum()) if not purch_df.empty else 0
    gm  = round((rev - pur) / rev * 100, 1)      if rev > 0 else 0

    # Receivables: from outstanding bills (latest date, deduped)
    od   = _latest_out(out_df.copy()) if not out_df.empty else pd.DataFrame()
    recv = float(od[od["outstanding_type"] == "Receivable"]["pending_amount"].sum()) if not od.empty else 0

    # Payables: from ledgers (Sundry Creditors closing balance) — outstanding CSV has no payable bills
    pay = 0.0
    creditor_rows = []
    if not led_df.empty:
        cred = led_df[led_df["parent_group"].isin(CREDITOR_GROUPS)].copy()
        cred["closing_balance"] = pd.to_numeric(cred["closing_balance"], errors="coerce").fillna(0)
        creditor_rows = cred[cred["closing_balance"] > 0][["ledger_name", "parent_group", "closing_balance"]].to_dict(orient="records")
        pay = float(cred[cred["closing_balance"] > 0]["closing_balance"].sum())

    # Cash & Bank — use actual balance (positive = funds, negative = overdraft in Tally)
    cash_bank = 0
    if not led_df.empty:
        bk = led_df[led_df["parent_group"].isin(["Bank Accounts", "Cash-in-Hand"])].copy()
        bk["closing_balance"] = pd.to_numeric(bk["closing_balance"], errors="coerce").fillna(0)
        cash_bank = float(bk["closing_balance"].sum())   # algebraic sum; negative = net overdraft

    mtimes = []
    for fn in ["sales_register.csv", "purchase_register.csv", "ledgers.csv"]:
        p = DATA_DIR / fn
        if p.exists():
            mtimes.append(datetime.fromtimestamp(p.stat().st_mtime))
    last_sync = max(mtimes).strftime("%d %b %Y, %H:%M") if mtimes else None

    summary = {
        "company":          "Ravi Super Market",
        "last_sync":        last_sync,
        "total_revenue":    round(rev, 2),
        "total_purchases":  round(pur, 2),
        "gross_margin_pct": gm,
        "net_receivables":  round(recv, 2),
        "net_payables":     round(pay, 2),
        "cash_bank":        round(cash_bank, 2),
    }

    # ── Sales ─────────────────────────────────────────────────────────────────
    sales_by_party, sales_invoices = [], []
    if not sales_df.empty:
        sales_by_party = (
            sales_df.groupby("party_ledger")
            .agg(total=("invoice_total", "sum"), invoices=("voucher_number", "nunique"))
            .reset_index().rename(columns={"party_ledger": "party"})
            .sort_values("total", ascending=False)
            .to_dict(orient="records")
        )
        sales_invoices = sales_df.to_dict(orient="records")

    # ── Purchases ─────────────────────────────────────────────────────────────
    purch_by_party, purch_invoices = [], []
    if not purch_df.empty:
        purch_by_party = (
            purch_df.groupby("party_ledger")
            .agg(total=("invoice_total", "sum"), invoices=("voucher_number", "nunique"))
            .reset_index().rename(columns={"party_ledger": "party"})
            .sort_values("total", ascending=False)
            .to_dict(orient="records")
        )
        purch_invoices = purch_df.to_dict(orient="records")

    # ── Outstanding ───────────────────────────────────────────────────────────
    out_rows, by_bucket, by_type = [], {}, {}
    if not od.empty:
        out_rows  = od.to_dict(orient="records")
        by_bucket = od.groupby("ageing_bucket")["pending_amount"].sum().to_dict()
        by_type   = od.groupby("outstanding_type")["pending_amount"].sum().to_dict()

    # Creditor summary for outstanding section
    by_type["Payable (Ledger)"] = round(pay, 2)

    # ── GST ───────────────────────────────────────────────────────────────────
    gst_in_total = gst_out_total = 0
    gst_input = gst_output = gst_other = []
    if not led_df.empty:
        gst_df = led_df[led_df["parent_group"] == "Duties & Taxes"].copy()
        gst_df["closing_balance"] = pd.to_numeric(gst_df["closing_balance"], errors="coerce").fillna(0)
        in_mask  = gst_df["ledger_name"].str.lower().str.contains("input",        na=False)
        out_mask = gst_df["ledger_name"].str.lower().str.contains("output|ouput", na=False)
        gst_input  = gst_df[in_mask] [["ledger_name", "closing_balance"]].to_dict(orient="records")
        gst_output = gst_df[out_mask][["ledger_name", "closing_balance"]].to_dict(orient="records")
        gst_other  = gst_df[~in_mask & ~out_mask][["ledger_name", "closing_balance"]].to_dict(orient="records")
        gst_in_total  = float(gst_df[in_mask] ["closing_balance"].apply(abs).sum())
        gst_out_total = float(gst_df[out_mask]["closing_balance"].apply(abs).sum())

    # ── Cash & Bank ───────────────────────────────────────────────────────────
    cash_accounts = []
    if not led_df.empty:
        bk = led_df[led_df["parent_group"].isin(["Bank Accounts", "Cash-in-Hand"])].copy()
        bk["closing_balance"] = pd.to_numeric(bk["closing_balance"], errors="coerce").fillna(0)
        bk["is_overdraft"] = bk["closing_balance"] < 0
        cash_accounts = bk[["ledger_name", "parent_group", "closing_balance", "is_overdraft"]].to_dict(orient="records")

    # ── Products ──────────────────────────────────────────────────────────────
    top_products = []
    if not inv_df.empty:
        inv_df["amt_abs"] = inv_df["amount"].apply(
            lambda x: abs(float(x)) if x is not None and str(x) not in ("", "nan") else 0
        )
        top_products = (
            inv_df.groupby(["stock_item", "voucher_type"])
            .agg(total_amount=("amt_abs", "sum"), lines=("quantity", "count"))
            .reset_index()
            .sort_values("total_amount", ascending=False)
            .head(20)
            .to_dict(orient="records")
        )

    sources = {
        "sales":       _source("sales_register.csv",        sales_df, "sales_register.csv"),
        "purchases":   _source("purchase_register.csv",     purch_df, "purchase_register.csv"),
        "outstanding": _source("outstanding_comparative.csv", out_df,  "outstanding_comparative.csv"),
        "ledgers":     _source("ledgers.csv",               led_df,   "ledgers.csv"),
        "inventory":   _source("voucher_inventory.csv",     inv_df,   "voucher_inventory.csv"),
    }

    return {
        "summary":     summary,
        "sources":     sources,
        "sales":       {"by_party": sales_by_party, "invoices": sales_invoices},
        "purchases":   {"by_party": purch_by_party, "invoices": purch_invoices},
        "outstanding": {
            "rows": out_rows, "by_bucket": by_bucket, "by_type": by_type,
            "creditors": creditor_rows,
        },
        "gst": {
            "input": gst_input, "output": gst_output, "other": gst_other,
            "input_total":  round(gst_in_total, 2),
            "output_total": round(gst_out_total, 2),
            "net_payable":  round(gst_out_total - gst_in_total, 2),
        },
        "cash_bank": {"accounts": cash_accounts, "total": round(cash_bank, 2)},
        "products":  {"top_items": top_products},
    }


@router.get("/status")
def status():
    p = DATA_DIR / "ledgers.csv"
    return {"ready": p.exists(), "data_dir": str(DATA_DIR)}
