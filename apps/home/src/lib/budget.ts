import { ITEM_KINDS, ITEM_STATUSES, type ItemKind, type ItemStatus, type PlanItem } from "./types";

export const KIND_LABEL: Record<ItemKind, string> = {
  renovation: "Renovation",
  furniture: "Furniture & decor",
  lighting: "Lighting",
};

export const STATUS_LABEL: Record<ItemStatus, string> = {
  idea: "Idea",
  planned: "Planned",
  ordered: "Ordered",
  done: "Done",
};

export interface BudgetSummary {
  total: number;
  spent: number;
  /** Items with no cost yet, so the total is known to be incomplete. */
  unpriced: number;
  byKind: Record<ItemKind, number>;
  byStatus: Record<ItemStatus, number>;
}

/** "Spent" counts what is ordered or done; ideas still count towards the total. */
export function summarize(items: PlanItem[]): BudgetSummary {
  const byKind = Object.fromEntries(ITEM_KINDS.map((k) => [k, 0])) as Record<ItemKind, number>;
  const byStatus = Object.fromEntries(ITEM_STATUSES.map((s) => [s, 0])) as Record<ItemStatus, number>;
  let total = 0;
  let spent = 0;
  let unpriced = 0;
  for (const item of items) {
    const cost = item.costEur ?? 0;
    if (item.costEur === undefined) unpriced++;
    total += cost;
    byKind[item.kind] += cost;
    byStatus[item.status] += cost;
    if (item.status === "ordered" || item.status === "done") spent += cost;
  }
  return { total, spent, unpriced, byKind, byStatus };
}

const eur = new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
export const formatEur = (n: number) => eur.format(n);
