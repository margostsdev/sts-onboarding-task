import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { InventoryTotalFilter } from "../types/products";
import { buildProductIndexSearchParams } from "../utils/buildProductIndexSearchParams";
import { parseInventoryTotalFilterFromUrl } from "../utils/parseInventoryTotalFilterFromUrl";

/**
 * Local form state for the product index inventory URL filter, kept in sync
 * with the parsed filter from the loader, plus apply/clear navigation.
 */
export function useProductInventoryFilters(
  inventoryFilter: InventoryTotalFilter | null,
) {
  const location = useLocation();
  const navigate = useNavigate();

  const [inventoryOp, setInventoryOp] = useState(
    () => inventoryFilter?.operator ?? "",
  );
  const [inventoryValue, setInventoryValue] = useState(
    () => (inventoryFilter != null ? String(inventoryFilter.value) : ""),
  );

  useEffect(() => {
    setInventoryOp(inventoryFilter?.operator ?? "");
    setInventoryValue(
      inventoryFilter != null ? String(inventoryFilter.value) : "",
    );
  }, [inventoryFilter]);

  const applyFilters = useCallback(() => {
    const params = new URLSearchParams();
    if (inventoryOp !== "") {
      params.set("inventoryOp", inventoryOp);
      params.set("inventoryValue", inventoryValue);
    }
    const parsed = parseInventoryTotalFilterFromUrl(params);
    const next = buildProductIndexSearchParams(parsed);
    const qs = next.toString();
    navigate(qs ? `${location.pathname}?${qs}` : location.pathname);
  }, [inventoryOp, inventoryValue, location.pathname, navigate]);

  const clearFilters = useCallback(() => {
    navigate(location.pathname);
  }, [location.pathname, navigate]);

  return {
    inventoryOp,
    setInventoryOp,
    inventoryValue,
    setInventoryValue,
    applyFilters,
    clearFilters,
  };
}
