import type { InventoryTotalFilter } from "../types/products";

/**
 * Builds Admin API `products` search `query` filter for inventory_total
 * (matches Product.totalInventory). See products query `query` argument docs.
 */
export function buildInventoryTotalQuery(
  filter: InventoryTotalFilter,
): string {
  const { operator, value } = filter;
  if (operator === "gt") {
    return `inventory_total:>${value}`;
  }
  if (operator === "lt") {
    return `inventory_total:<${value}`;
  }
  return `inventory_total:${value}`;
}
