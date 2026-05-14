import type { InventoryTotalFilter } from "../types/products";

export type ProductIndexPaginationParams = {
  after?: string;
  before?: string;
};

/** Builds URLSearchParams for the product index (inventory filter and optional cursors). */
export function buildProductIndexSearchParams(
  inventoryFilter: InventoryTotalFilter | null,
  pagination?: ProductIndexPaginationParams | null,
): URLSearchParams {
  const params = new URLSearchParams();
  if (inventoryFilter) {
    params.set("inventoryOp", inventoryFilter.operator);
    params.set("inventoryValue", String(inventoryFilter.value));
  }
  if (pagination?.after != null && pagination.after.length > 0) {
    params.set("after", pagination.after);
  } else if (pagination?.before != null && pagination.before.length > 0) {
    params.set("before", pagination.before);
  }
  return params;
}
