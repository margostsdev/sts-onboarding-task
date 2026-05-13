import {GetProductsPageInfo, GetProductsProduct} from "../types/products";
import TableHeaderRow from "./TableHeaderRow";
import TableRow from "./TableRow";

interface TableProps  {
  products: GetProductsProduct[];
  pagination: GetProductsPageInfo | null;
}
const Table = ({products, pagination}: TableProps) => {
  return (
    <s-section padding="none">
    <s-table paginate hasNextPage={pagination?.hasNextPage} hasPreviousPage={pagination?.hasPreviousPage}>
      <TableHeaderRow />
      <s-table-body>
        {
          products.map((product) => (
            <TableRow
              key={product.id}
              title={product.title}
              totalInventory={product.totalInventory}
              status={product.status}
              imageUrl={product.featuredMedia?.preview?.image?.url}
              alt={product.featuredMedia?.preview?.image?.altText}
              price={product.priceRangeV2.minVariantPrice.amount}/>
          ))
        }
      </s-table-body>
    </s-table>
    </s-section>
  )
}

export default Table;
