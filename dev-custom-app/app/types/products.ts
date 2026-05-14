import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

import type { ProductStatus } from "../utils/getProductStatusBadgeTone";

/** Money amount from Admin API (decimal string). */
export type GetProductsMoneyV2 = {
  amount: string;
  currencyCode: string;
};

export type GetProductsProductImage = {
  altText: string | null;
  url: string;
};

export type GetProductsFeaturedMedia = {
  preview: {
    image: GetProductsProductImage | null;
  } | null;
};

export type GetProductsProductPriceRange = {
  minVariantPrice: GetProductsMoneyV2;
};

export type GetProductsProduct = {
  id: string;
  title: string;
  totalInventory: number;
  status: ProductStatus;
  featuredMedia: GetProductsFeaturedMedia | null;
  priceRangeV2: GetProductsProductPriceRange;
};

export type GetProductsPageInfo = {
  endCursor: string | null;
  startCursor: string | null;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type GetProductsResult = {
  products: GetProductsProduct[];
  pageInfo: GetProductsPageInfo | null;
};

/** Operator for total inventory filter (maps to inventory_total search syntax). */
export type InventoryTotalFilterOperator = "gt" | "lt" | "eq";

export type InventoryTotalFilter = {
  operator: InventoryTotalFilterOperator;
  value: number;
};

export interface GetProductsParams {
  admin: AdminApiContext;
  /** Page size */
  count?: number;
  /** Forward pagination: cursor after which to fetch (`endCursor` of the current page). */
  after?: string | null;
  /** Backward pagination: cursor before which to fetch (`startCursor` of the current page). */
  before?: string | null;
  /** When set, Admin `products` receives `query` with `inventory_total` filter. */
  inventoryTotalFilter?: InventoryTotalFilter | null;
}

/** Loader payload for the product index route. */
export type ProductIndexLoaderData = GetProductsResult & {
  inventoryFilter: InventoryTotalFilter | null;
};

/** Raw node shape from Admin GraphQL JSON (before mapping). */
export interface GetProductsGraphQLNode {
  id: string;
  title: string;
  totalInventory: number;
  status: ProductStatus;
  featuredMedia?: {
    preview?: {
      image?: { altText?: string | null; url?: string } | null;
    } | null;
  } | null;
  priceRangeV2: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    }
  };
}

export interface GetProductsGraphQLPageInfo {
  endCursor?: string | null;
  startCursor?: string | null;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

/** Narrow JSON shape from admin.graphql before mapping to domain types */
export interface GetProductsGraphQLData {
  products?: {
    edges?: Array<{ node?: GetProductsGraphQLNode | null } | null>;
    pageInfo?: GetProductsGraphQLPageInfo | null;
  } | null;
}

export interface GetProductsJsonBody {
  data?: GetProductsGraphQLData | null;
  errors?: ReadonlyArray<{ message?: string }>;
}
