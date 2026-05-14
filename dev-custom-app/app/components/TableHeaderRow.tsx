import type { PriceSortMode } from "../hooks/useProductsPriceSort";

interface TableHeaderRowProps {
  onPriceHeaderClick: () => void;
  priceSortMode: PriceSortMode;
}

const TableHeaderRow = ({
  onPriceHeaderClick,
  priceSortMode,
}: TableHeaderRowProps) => {
  const priceIcon =
    priceSortMode === "unsorted" ? null : (
      <s-icon
        type={priceSortMode === "desc" ? "arrow-down" : "arrow-up"}
        size={"small"}
      />
    );

  return (
    <s-table-header-row>
      <s-table-header>Product</s-table-header>
      <s-table-header>
        <s-clickable onClick={onPriceHeaderClick}>
          <s-stack direction={"inline"}>
            Price
            {priceIcon}
          </s-stack>
        </s-clickable>
      </s-table-header>
      <s-table-header>Inventory</s-table-header>
      <s-table-header>Status</s-table-header>
    </s-table-header-row>
  );
};

export default TableHeaderRow;
