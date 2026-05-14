import { useCallback, useMemo, useState } from "react";
import type { GetProductsProduct } from "../types/products";

export type PriceSortMode = "unsorted" | "asc" | "desc";

function productPriceAmount(product: GetProductsProduct): number {
  return parseFloat(product.priceRangeV2.minVariantPrice.amount);
}

/**
 * Client-side sort of the current products array by min variant price.
 * First header click applies asc; further clicks toggle asc/desc.
 */
export function useProductsPriceSort(products: GetProductsProduct[]) {
  const [priceSortMode, setPriceSortMode] = useState<PriceSortMode>("unsorted");

  const togglePriceSort = useCallback(() => {
    setPriceSortMode((prev) => {
      if (prev === "unsorted") return "asc";
      return prev === "asc" ? "desc" : "asc";
    });
  }, []);

  const sortedProducts = useMemo(() => {
    if (priceSortMode === "unsorted") {
      return products;
    }
    const copy = [...products];
    copy.sort((a, b) => {
      const diff = productPriceAmount(a) - productPriceAmount(b);
      if (diff !== 0) {
        return priceSortMode === "asc" ? diff : -diff;
      }
      return a.id.localeCompare(b.id);
    });
    return copy;
  }, [products, priceSortMode]);

  return {
    sortedProducts,
    priceSortMode,
    togglePriceSort,
  };
}
