import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

import type { ProductStatus } from "../../constants/product";

const PRODUCT_UPDATE = `#graphql
  mutation updateProductStatus($input: ProductInput!) {
    productUpdate(input: $input) {
      product {
        id
        status
      }
      userErrors {
        field
        message
      }
    }
  }
`;

type GraphQLUserError = {
  field?: string[] | null;
  message: string;
};

type ProductUpdateData = {
  productUpdate?: {
    product?: { id: string; status: string } | null;
    userErrors?: GraphQLUserError[];
  } | null;
};

export type UpdateProductStatusSuccess = {
  ok: true;
  product: { id: string; status: string };
};

export type UpdateProductStatusFailure = {
  ok: false;
  error: string;
  userErrors?: GraphQLUserError[];
};

export type UpdateProductStatusResult =
  | UpdateProductStatusSuccess
  | UpdateProductStatusFailure;

export async function updateProductStatus(
  admin: AdminApiContext,
  {
    productId,
    status,
  }: { productId: string; status: ProductStatus },
): Promise<UpdateProductStatusResult> {
  const response = await admin.graphql(PRODUCT_UPDATE, {
    variables: {
      input: {
        id: productId,
        status,
      },
    },
  });

  const json = (await response.json()) as {
    data?: ProductUpdateData | null;
    errors?: ReadonlyArray<{ message?: string }>;
  };

  if (json.errors?.length) {
    return {
      ok: false,
      error: json.errors.map((e) => e.message ?? "GraphQL error").join("; "),
    };
  }

  const payload = json.data?.productUpdate;
  if (!payload) {
    return { ok: false, error: "No productUpdate in response" };
  }

  const userErrors = payload.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      ok: false,
      error: userErrors.map((e) => e.message).join("; "),
      userErrors,
    };
  }

  const product = payload.product;
  if (!product) {
    return { ok: false, error: "Product update returned no product" };
  }

  return { ok: true, product };
}
