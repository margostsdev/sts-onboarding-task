import { useCallback } from "react";
import { useLocation, useNavigate, useNavigation } from "react-router";
import type {
  GetProductsPageInfo,
  InventoryTotalFilter,
} from "../types/products";
import { buildProductIndexSearchParams } from "../utils/buildProductIndexSearchParams";

/**
 * Cursor pagination for the product index: updates URL (`after` / `before`)
 * and exposes handlers for `s-table` plus loader transition state.
 */
export function useProductIndexPagination(
  inventoryFilter: InventoryTotalFilter | null,
  pagination: GetProductsPageInfo | null,
) {
  const navigate = useNavigate();
  const location = useLocation();
  const navigation = useNavigation();

  const onNextPage = useCallback(() => {
    if (
      !pagination?.hasNextPage ||
      pagination.endCursor == null ||
      pagination.endCursor.length === 0
    ) {
      return;
    }
    const params = buildProductIndexSearchParams(inventoryFilter, {
      after: pagination.endCursor,
    });
    const qs = params.toString();
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname);
  }, [
    inventoryFilter,
    location.pathname,
    navigate,
    pagination?.endCursor,
    pagination?.hasNextPage,
  ]);

  const onPreviousPage = useCallback(() => {
    if (
      !pagination?.hasPreviousPage ||
      pagination.startCursor == null ||
      pagination.startCursor.length === 0
    ) {
      return;
    }
    const params = buildProductIndexSearchParams(inventoryFilter, {
      before: pagination.startCursor,
    });
    const qs = params.toString();
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname);
  }, [
    inventoryFilter,
    location.pathname,
    navigate,
    pagination?.hasPreviousPage,
    pagination?.startCursor,
  ]);

  const isPaginationLoading = navigation.state === "loading";

  return { onNextPage, onPreviousPage, isPaginationLoading };
}
