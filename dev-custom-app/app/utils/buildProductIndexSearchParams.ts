import type { InventoryTotalFilter } from "../types/products";

/** Builds URLSearchParams for the product index (inventory filter only). */
export function buildProductIndexSearchParams(
  inventoryFilter: InventoryTotalFilter | null,
): URLSearchParams {
  const params = new URLSearchParams();
  if (inventoryFilter) {
    params.set("inventoryOp", inventoryFilter.operator);
    params.set("inventoryValue", String(inventoryFilter.value));
  }
  return params;
}
