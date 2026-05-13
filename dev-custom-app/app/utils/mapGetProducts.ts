import type {
  GetProductsFeaturedMedia,
  GetProductsGraphQLNode,
  GetProductsGraphQLPageInfo,
  GetProductsPageInfo,
  GetProductsProduct,
  GetProductsProductImage,
  GetProductsProductPriceRange,
} from "../types/products";
import { isProductStatus } from "./getProductStatusBadgeTone";

export function mapProductNode(
  node: GetProductsGraphQLNode,
): GetProductsProduct | null {
  if (
    typeof node.id !== "string" ||
    typeof node.title !== "string" ||
    typeof node.status !== "string"
  ) {
    return null;
  }

  let featuredMedia: GetProductsFeaturedMedia | null = null;
  if (node.featuredMedia != null) {
    const preview = node.featuredMedia.preview;
    if (preview == null) {
      featuredMedia = { preview: null };
    } else {
      let image: GetProductsProductImage | null = null;
      if (preview.image != null && typeof preview.image.url === "string") {
        image = {
          altText:
            typeof preview.image.altText === "string"
              ? preview.image.altText
              : null,
          url: preview.image.url,
        };
      }
      featuredMedia = { preview: { image } };
    }
  }

  console.log('node.priceRangeV2', node.priceRangeV2)

  const priceRangeV2: GetProductsProductPriceRange = {
    minVariantPrice: {
      amount: node.priceRangeV2.minVariantPrice.amount,
      currencyCode: node.priceRangeV2.minVariantPrice.currencyCode,
    },
  };

  return {
    id: node.id,
    title: node.title,
    totalInventory: node.totalInventory,
    status: isProductStatus(node.status) ? node.status : "DRAFT",
    featuredMedia,
    priceRangeV2,
  };
}

export function mapPageInfo(
  raw: GetProductsGraphQLPageInfo | null | undefined,
): GetProductsPageInfo | null {
  if (
    raw == null ||
    typeof raw.hasNextPage !== "boolean" ||
    typeof raw.hasPreviousPage !== "boolean"
  ) {
    return null;
  }
  return {
    endCursor:
      raw.endCursor === undefined || raw.endCursor === null
        ? null
        : String(raw.endCursor),
    startCursor:
      raw.startCursor === undefined || raw.startCursor === null
        ? null
        : String(raw.startCursor),
    hasNextPage: raw.hasNextPage,
    hasPreviousPage: raw.hasPreviousPage,
  };
}
