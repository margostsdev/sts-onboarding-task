import type {
  GetProductsPageInfo,
  GetProductsProduct,
  InventoryTotalFilter,
} from "../types/products";
import { useProductIndexPagination } from "../hooks/useProductIndexPagination";
import ProductFilters from "./ProductFilters";
import TableHeaderRow from "./TableHeaderRow";
import TableRow from "./TableRow";

interface TableProps {
  products: GetProductsProduct[];
  inventoryFilter: InventoryTotalFilter | null;
  pagination: GetProductsPageInfo | null;
}

const Table = ({ products, inventoryFilter, pagination }: TableProps) => {
  const { onNextPage, onPreviousPage, isPaginationLoading } =
    useProductIndexPagination(inventoryFilter, pagination);

  return (
    <s-section padding="none">
      <s-table
        paginate
        hasNextPage={pagination?.hasNextPage}
        hasPreviousPage={pagination?.hasPreviousPage}
        loading={isPaginationLoading}
        onNextPage={onNextPage}
        onPreviousPage={onPreviousPage}
      >
        <ProductFilters inventoryFilter={inventoryFilter} />

        <TableHeaderRow />
        <s-table-body>
          {products.length === 0 ? (
            <s-table-row>
              <s-table-cell>
                <s-text color="subdued">Products not found</s-text>
              </s-table-cell>
            </s-table-row>
          ) : null}
          {products.length > 0 &&
            products.map((product) => (
              <TableRow
                key={product.id}
                productId={product.id}
                title={product.title}
                totalInventory={product.totalInventory}
                status={product.status}
                imageUrl={product.featuredMedia?.preview?.image?.url}
                alt={product.featuredMedia?.preview?.image?.altText}
                price={product.priceRangeV2.minVariantPrice.amount}
              />
            ))}
        </s-table-body>
      </s-table>
    </s-section>
  );
};

export default Table;
