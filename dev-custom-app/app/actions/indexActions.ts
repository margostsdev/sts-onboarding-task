import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
} from "react-router";
import type { ProductIndexLoaderData } from "../types/products";
import { authenticate } from "../shopify.server";
import { isProductStatus } from "../utils/getProductStatusBadgeTone";
import { parseInventoryTotalFilterFromUrl } from "../utils/parseInventoryTotalFilterFromUrl";
import { updateProductStatus } from "./mutations/updateProductStatus";
import { getProducts } from "./queries/getProducts";

export const indexLoader = async ({
  request,
}: LoaderFunctionArgs): Promise<ProductIndexLoaderData> => {
  const { admin } = await authenticate.admin(request);
  const url = new URL(request.url);
  const inventoryFilter = parseInventoryTotalFilterFromUrl(url.searchParams);

  const rawAfter = url.searchParams.get("after")?.trim() ?? "";
  const rawBefore = url.searchParams.get("before")?.trim() ?? "";
  let after: string | null = null;
  let before: string | null = null;
  if (rawAfter.length > 0 && rawBefore.length > 0) {
    after = rawAfter;
  } else if (rawBefore.length > 0) {
    before = rawBefore;
  } else if (rawAfter.length > 0) {
    after = rawAfter;
  }

  const productData = await getProducts({
    admin,
    inventoryTotalFilter: inventoryFilter,
    after,
    before,
  });

  return { ...productData, inventoryFilter };
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
