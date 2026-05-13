/** Shopify Admin GraphQL ProductStatus enum values. */
export const PRODUCT_STATUSES = [
  "ACTIVE",
  "ARCHIVED",
  "DRAFT",
  "UNLISTED",
] as const;

export type ProductStatus = (typeof PRODUCT_STATUSES)[number];

/** Tone values used for product status badges (subset of s-badge tones). */
export type ProductStatusBadgeTone =
  | "auto"
  | "caution"
  | "info"
  | "success";

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function getProductStatusBadgeTone(
  status: ProductStatus | string,
): ProductStatusBadgeTone {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "ARCHIVED":
      return "auto";
    case "DRAFT":
      return "info";
    case "UNLISTED":
      return "caution";
    default:
      return "auto";
  }
}
