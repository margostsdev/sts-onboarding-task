import type {
  InventoryTotalFilter,
  InventoryTotalFilterOperator,
} from "../types/products";

const OPERATORS: ReadonlySet<InventoryTotalFilterOperator> = new Set([
  "gt",
  "lt",
  "eq",
]);

/** Parses inventory filter from product index URL search params. */
export function parseInventoryTotalFilterFromUrl(
  searchParams: URLSearchParams,
): InventoryTotalFilter | null {
  const op = searchParams.get("inventoryOp");
  const rawVal = searchParams.get("inventoryValue");
  if (op == null || rawVal == null || rawVal === "") {
    return null;
  }
  if (!OPERATORS.has(op as InventoryTotalFilterOperator)) {
    return null;
  }
  const value = Number.parseInt(rawVal, 10);
  if (!Number.isFinite(value) || value < 0) {
    return null;
  }
  return { operator: op as InventoryTotalFilterOperator, value };
}
