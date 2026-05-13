import { HeadersFunction, useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {indexAction, indexLoader} from "../actions/indexActions";
import Table from "../components/Table";

export const loader = indexLoader;

export const action = indexAction;

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();

  return (
    <s-page heading="Shopify app template">
      <Table products={loaderData.products} pagination={loaderData.pageInfo}/>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
