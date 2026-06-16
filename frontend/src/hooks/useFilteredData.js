import { useMemo } from "react";
import { useApp } from "../context/AppContext";

function applyFilters(rows, filters, dateKey = "date", partyKey = "party_ledger") {
  if (!rows?.length) return [];
  return rows.filter((r) => {
    if (filters.dateFrom && r[dateKey] < filters.dateFrom) return false;
    if (filters.dateTo   && r[dateKey] > filters.dateTo)   return false;
    if (filters.party    && r[partyKey] !== filters.party)  return false;
    return true;
  });
}

export function useFilteredData() {
  const { data, filters } = useApp();

  return useMemo(() => {
    if (!data) return { sales: [], purchases: [], inventory: [] };

    const sales     = applyFilters(data.sales?.invoices     ?? [], filters, "date", "party_ledger");
    const purchases = applyFilters(data.purchases?.invoices ?? [], filters, "date", "party_ledger");
    const inventory = applyFilters(data.products?.top_items ?? [], filters, "date", "voucher_type");

    // re-aggregate sales by party
    const salesByParty = Object.values(
      sales.reduce((acc, r) => {
        if (!acc[r.party_ledger]) acc[r.party_ledger] = { party: r.party_ledger, total: 0, invoices: 0 };
        acc[r.party_ledger].total    += r.invoice_total;
        acc[r.party_ledger].invoices += 1;
        return acc;
      }, {})
    ).sort((a, b) => b.total - a.total);

    const purchByParty = Object.values(
      purchases.reduce((acc, r) => {
        if (!acc[r.party_ledger]) acc[r.party_ledger] = { party: r.party_ledger, total: 0, invoices: 0 };
        acc[r.party_ledger].total    += r.invoice_total;
        acc[r.party_ledger].invoices += 1;
        return acc;
      }, {})
    ).sort((a, b) => b.total - a.total);

    const rev = sales.reduce((s, r) => s + r.invoice_total, 0);
    const pur = purchases.reduce((s, r) => s + r.invoice_total, 0);
    const gm  = rev > 0 ? Math.round((rev - pur) / rev * 1000) / 10 : 0;

    return { sales, purchases, inventory, salesByParty, purchByParty, rev, pur, gm };
  }, [data, filters]);
}

export function useAllParties() {
  const { data } = useApp();
  return useMemo(() => {
    const s = (data?.sales?.invoices     ?? []).map((r) => r.party_ledger);
    const p = (data?.purchases?.invoices ?? []).map((r) => r.party_ledger);
    return [...new Set([...s, ...p])].sort();
  }, [data]);
}
