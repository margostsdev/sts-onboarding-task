/** Shopify Admin GraphQL ProductStatus enum values. */
export const PRODUCT_STATUSES = [
  "ACTIVE",
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
