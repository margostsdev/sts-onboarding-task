import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import { authenticate } from "../shopify.server";
import { isProductStatus } from "../utils/getProductStatusBadgeTone";
import { updateProductStatus } from "./mutations/updateProductStatus";
import { getProducts } from "./queries/getProducts";

export const indexLoader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);

  const productData = await getProducts({ admin });
  return productData;
};

export const indexAction = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent === "updateProductStatus") {
    const productId = formData.get("productId");
    const productStatus = formData.get("productStatus");

    if (typeof productId !== "string" || productId.length === 0) {
      return { ok: false as const, error: "Missing productId" };
    }
    if (typeof productStatus !== "string" || !isProductStatus(productStatus)) {
      return { ok: false as const, error: "Invalid product status" };
    }

    const result = await updateProductStatus(admin, {
      productId,
      status: productStatus,
    });

    if (!result.ok) {
      return {
        ok: false as const,
        error: result.error,
        userErrors: result.userErrors,
      };
    }

    return {
      ok: true as const,
      product: result.product,
    };
  }


};
