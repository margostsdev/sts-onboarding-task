import type { HeadersFunction } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { useLoaderData } from "react-router";
import { indexAction, indexLoader } from "../actions/indexActions";
import Table from "../components/Table";

export const loader = indexLoader;

export const action = indexAction;

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <s-page heading="Product table custom app">
      <Table
        products={loaderData.products}
        inventoryFilter={loaderData.inventoryFilter}
        pagination={loaderData.pageInfo}
      />
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
