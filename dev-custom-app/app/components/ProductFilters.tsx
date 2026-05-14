import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { InventoryTotalFilter } from "../types/products";
import { buildProductIndexSearchParams } from "../utils/buildProductIndexSearchParams";
import { parseInventoryTotalFilterFromUrl } from "../utils/parseInventoryTotalFilterFromUrl";

const POPOVER_ID = "product-inventory-filters-popover";

function formatOperatorSymbol(
  op: InventoryTotalFilter["operator"],
): string {
  if (op === "gt") {
    return ">";
  }
  if (op === "lt") {
    return "<";
  }
  return "=";
}

function activeFilterSummary(filter: InventoryTotalFilter | null): string {
  if (filter == null) {
    return "No inventory filter applied.";
  }
  return `Active: total inventory ${formatOperatorSymbol(filter.operator)} ${filter.value}`;
}

interface ProductFiltersProps {
  inventoryFilter: InventoryTotalFilter | null;
}

const ProductFilters = ({ inventoryFilter }: ProductFiltersProps) => {
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

  return (
    <s-stack slot="filters" direction="inline" gap="base" alignItems="center" justifyContent="end">
      <s-button
        type="button"
        variant="secondary"
        commandFor={POPOVER_ID}
        command="--toggle"
        accessibilityLabel="Open inventory filters"
      >
        Filters
      </s-button>

      <s-popover id={POPOVER_ID}>
        <s-box padding="base">
          <s-stack direction="block" gap="base">
            <s-stack gap="small-100">
              <s-text type="strong">Inventory filter</s-text>
              <s-text color="subdued">
                {activeFilterSummary(inventoryFilter)}
              </s-text>
            </s-stack>

            <s-stack direction="block" gap="small-200">
              <s-select
                label="Condition"
                name="inventoryOp"
                value={inventoryOp}
                onChange={(e) => {
                  setInventoryOp(e.currentTarget.value);
                }}
              >
                <s-option value="">Any</s-option>
                <s-option value="gt">&gt;</s-option>
                <s-option value="lt">&lt;</s-option>
                <s-option value="eq">=</s-option>
              </s-select>

              <s-number-field
                label="Quantity"
                name="inventoryValue"
                value={inventoryValue}
                placeholder="0"
                step={1}
                min={0}
                onChange={(e) => {
                  setInventoryValue(e.currentTarget.value);
                }}
              />
            </s-stack>

            <s-stack direction="inline" gap="small-200" justifyContent="end">
              <s-button
                type="button"
                variant="primary"
                commandFor={POPOVER_ID}
                command="--hide"
                onClick={applyFilters}
              >
                Apply
              </s-button>
              <s-button
                type="button"
                variant="secondary"
                commandFor={POPOVER_ID}
                command="--hide"
                onClick={clearFilters}
              >
                Clear filters
              </s-button>
            </s-stack>
          </s-stack>
        </s-box>
      </s-popover>
    </s-stack>
  );
};

export default ProductFilters;
