import { expect, it } from "vitest";
import { summarize } from "./budget";
import type { PlanItem } from "./types";

const item = (p: Partial<PlanItem>): PlanItem => ({
  id: crypto.randomUUID(),
  roomId: "r",
  title: "x",
  kind: "furniture",
  status: "idea",
  createdAt: "",
  ...p,
});

it("totals by kind and status, and counts ordered or done as spent", () => {
  const s = summarize([
    item({ kind: "renovation", status: "done", costEur: 1200 }),
    item({ kind: "lighting", status: "ordered", costEur: 180 }),
    item({ kind: "furniture", status: "idea", costEur: 900 }),
    item({ kind: "furniture", status: "planned" }),
  ]);
  expect(s.total).toBe(2280);
  expect(s.spent).toBe(1380);
  expect(s.unpriced).toBe(1);
  expect(s.byKind).toEqual({ renovation: 1200, furniture: 900, lighting: 180 });
  expect(s.byStatus.idea).toBe(900);
});
