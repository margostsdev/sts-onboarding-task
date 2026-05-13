import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

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
  status: string;
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

export interface GetProductsParams {
  admin: AdminApiContext;
  /** Page size */
  count?: number;
  after?: string | null;
}

/** Raw node shape from Admin GraphQL JSON (before mapping). */
export interface GetProductsGraphQLNode {
  id: string;
  title: string;
  totalInventory: number;
  status: string;
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
