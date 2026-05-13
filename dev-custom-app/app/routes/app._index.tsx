import {
  HeadersFunction, useLoaderData,useFetcher
} from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";
import { boundary } from "@shopify/shopify-app-react-router/server";
import {indexAction, indexLoader} from "../actions/indexActions";
import Table from "../components/Table";

export const loader = indexLoader;

export default function Index() {
  const loaderData = useLoaderData<typeof loader>();
  const fetcher = useFetcher<typeof indexAction>();

  console.log('loaderData', loaderData)

  const shopify = useAppBridge();


  return (
    <s-page heading="Shopify app template">
      <Table products={loaderData.products} pagination={loaderData.pageInfo}/>
    </s-page>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
