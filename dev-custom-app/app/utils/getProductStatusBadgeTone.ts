import {
  PRODUCT_STATUSES,
  type ProductStatus,
  type ProductStatusBadgeTone,
} from "../constants/product";

export type {ProductStatus};

export function isProductStatus(value: string): value is ProductStatus {
  return (PRODUCT_STATUSES as readonly string[]).includes(value);
}

export function getProductStatusBadgeTone(
  status: ProductStatus | string,
): ProductStatusBadgeTone {
  switch (status) {
    case "ACTIVE":
      return "success";
    case "UNLISTED":
      return "caution";
    case "DRAFT":
      return "info";
    default:
      return "auto";
  }
}
