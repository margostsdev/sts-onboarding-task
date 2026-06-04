import type { AdminApiContext } from "@shopify/shopify-app-react-router/server";

import { DONATION_CUSTOM_PRICE_FUNCTION_HANDLE } from "../../constants/cartTransform";

const CART_TRANSFORMS = `#graphql
  query CartTransforms {
    cartTransforms(first: 1) {
      nodes {
        id
      }
    }
  }
`;

const CART_TRANSFORM_CREATE = `#graphql
  mutation CartTransformCreate($functionHandle: String!) {
    cartTransformCreate(functionHandle: $functionHandle) {
      cartTransform {
        id
        functionId
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

type CartTransformsData = {
  cartTransforms?: {
    nodes?: Array<{ id: string }> | null;
  } | null;
};

type CartTransformCreateData = {
  cartTransformCreate?: {
    cartTransform?: { id: string; functionId: string } | null;
    userErrors?: GraphQLUserError[];
  } | null;
};

export type EnsureCartTransformSuccess = {
  ok: true;
  created: boolean;
  cartTransform?: { id: string; functionId: string };
};

export type EnsureCartTransformFailure = {
  ok: false;
  error: string;
  userErrors?: GraphQLUserError[];
};

export type EnsureCartTransformResult =
  | EnsureCartTransformSuccess
  | EnsureCartTransformFailure;

async function hasCartTransform(
  admin: AdminApiContext,
): Promise<boolean> {
  const response = await admin.graphql(CART_TRANSFORMS);
  const json = (await response.json()) as {
    data?: CartTransformsData | null;
    errors?: ReadonlyArray<{ message?: string }>;
  };

  if (json.errors?.length) {
    throw new Error(
      json.errors.map((e) => e.message ?? "GraphQL error").join("; "),
    );
  }

  const nodes = json.data?.cartTransforms?.nodes ?? [];
  return nodes.length > 0;
}

export async function ensureCartTransform(
  admin: AdminApiContext,
): Promise<EnsureCartTransformResult> {
  try {
    if (await hasCartTransform(admin)) {
      return { ok: true, created: false };
    }
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : "Failed to query cart transforms",
    };
  }

  const response = await admin.graphql(CART_TRANSFORM_CREATE, {
    variables: {
      functionHandle: DONATION_CUSTOM_PRICE_FUNCTION_HANDLE,
    },
  });

  const json = (await response.json()) as {
    data?: CartTransformCreateData | null;
    errors?: ReadonlyArray<{ message?: string }>;
  };

  if (json.errors?.length) {
    return {
      ok: false,
      error: json.errors.map((e) => e.message ?? "GraphQL error").join("; "),
    };
  }

  const payload = json.data?.cartTransformCreate;
  if (!payload) {
    return { ok: false, error: "No cartTransformCreate in response" };
  }

  const userErrors = payload.userErrors ?? [];
  if (userErrors.length > 0) {
    return {
      ok: false,
      error: userErrors.map((e) => e.message).join("; "),
      userErrors,
    };
  }

  const cartTransform = payload.cartTransform;
  if (!cartTransform) {
    return { ok: false, error: "Cart transform create returned no cartTransform" };
  }

  return {
    ok: true,
    created: true,
    cartTransform,
  };
}
