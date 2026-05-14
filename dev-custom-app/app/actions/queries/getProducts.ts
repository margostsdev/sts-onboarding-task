import type {
  GetProductsJsonBody,
  GetProductsParams,
  GetProductsProduct,
  GetProductsResult,
} from "../../types/products";
import { buildInventoryTotalQuery } from "../../utils/buildInventoryTotalQuery";
import { mapPageInfo, mapProductNode } from "../../utils/mapGetProducts";

export type {
  GetProductsFeaturedMedia,
  GetProductsMoneyV2,
  GetProductsPageInfo,
  GetProductsProduct,
  GetProductsProductImage,
  GetProductsProductPriceRange,
  GetProductsResult,
} from "../../types/products";

const GET_PRODUCTS = `
  #graphql
  query GetProducts(
    $first: Int
    $last: Int
    $after: String
    $before: String
    $query: String
  ) {
    products(
      first: $first
      last: $last
      after: $after
      before: $before
      query: $query
    ) {
      edges {
        node {
          id
          title
          totalInventory
          status
           featuredMedia {
            preview {
              image {
                altText
                url
              }
            }
          }
          priceRangeV2 {
            minVariantPrice {
              amount
              currencyCode
            }
          }
        }
      }
      pageInfo {
        endCursor
        startCursor
        hasNextPage
        hasPreviousPage
      }
    }
  }
`;

export const getProducts = async ({
  admin,
  count = 10,
  after = null,
  before = null,
  inventoryTotalFilter = null,
}: GetProductsParams): Promise<GetProductsResult> => {
  try {
    const searchQuery =
      inventoryTotalFilter != null
        ? buildInventoryTotalQuery(inventoryTotalFilter)
        : null;

    const useBackward =
      typeof before === "string" && before.length > 0;

    const variables = useBackward
      ? { last: count, before, query: searchQuery }
      : {
          first: count,
          after:
            typeof after === "string" && after.length > 0 ? after : null,
          query: searchQuery,
        };

    const response = await admin.graphql(GET_PRODUCTS, {
      variables,
    });

    const jsonResponse = (await response.json()) as GetProductsJsonBody;

    if (jsonResponse.errors?.length) {
      return {
        products: [],
        pageInfo: null
      };
    }

    const connection = jsonResponse.data?.products;
    if (!connection) {
      return {
        products: [],
        pageInfo: null
      };
    }

    const pageInfo = mapPageInfo(connection.pageInfo);
    if (!pageInfo) {
      return {
        products: [],
        pageInfo: null
      };
    }

    const edges = connection.edges ?? [];
    const products: GetProductsProduct[] = [];
    for (const edge of edges) {
      const node = edge?.node;
      if (!node) {
        continue;
      }
      const mapped = mapProductNode(node);
      if (!mapped) {
        continue;
      }
      products.push(mapped);
    }

    return { products, pageInfo };
  } catch (error: unknown) {
    console.error("Failed to get products", error);
    return {
      products: [],
      pageInfo: null
    };
  }
};
