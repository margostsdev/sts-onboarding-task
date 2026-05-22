import type {
  AttributeOutput,
  CartTransformRunInput,
  CartTransformRunResult,
  LinesMergeOperation,
  Operation,
} from "../generated/api";

const NO_CHANGES: CartTransformRunResult = {
  operations: [],
};

const BUNDLE_COMPONENTS_ATTRIBUTE = "_bundle_components";
const FIXED_PRICE_ATTRIBUTE = "_fixed_price";

type CartLine = CartTransformRunInput["cart"]["lines"][number];

type ProductVariantLine = CartLine & {
  merchandise: {
    __typename: "ProductVariant";
    id: string;
    title?: string | null;
    product: { title: string };
  };
};

type BundleComponent = {
  variantId: string;
  productTitle: string;
  variantTitle?: string | null;
  quantity: number;
};

function isProductVariantLine(line: CartLine): line is ProductVariantLine {
  return line.merchandise.__typename === "ProductVariant";
}

function parseComponentVariantIds(jsonValue: unknown): string[] {
  if (!Array.isArray(jsonValue)) {
    return [];
  }

  return jsonValue.filter(
    (id): id is string => typeof id === "string" && id.length > 0,
  );
}

function parseDecimal(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function toPresentmentAmount(
  shopAmount: number,
  presentmentCurrencyRate: number,
): number {
  return shopAmount * presentmentCurrencyRate;
}

function buildBundleComponents(
  matchedLines: ProductVariantLine[],
  bundleQuantity: number,
): BundleComponent[] {
  return matchedLines.map((line) => ({
    variantId: line.merchandise.id,
    productTitle: line.merchandise.product.title,
    variantTitle: line.merchandise.title ?? null,
    quantity: bundleQuantity,
  }));
}

function buildMergeAttributes(
  components: BundleComponent[],
  fixedPriceRaw: string,
): AttributeOutput[] {
  return [
    {
      key: BUNDLE_COMPONENTS_ATTRIBUTE,
      value: JSON.stringify(components),
    },
    {
      key: FIXED_PRICE_ATTRIBUTE,
      value: fixedPriceRaw,
    },
  ];
}

export function cartTransformRun(
  input: CartTransformRunInput,
): CartTransformRunResult {
  const bundleConfig = input.shop.bundleConfig;
  if (!bundleConfig) {
    return NO_CHANGES;
  }

  const componentVariantIds = parseComponentVariantIds(
    bundleConfig.componentVariants?.jsonValue,
  );
  const parentVariantId = bundleConfig.parentVariant?.value;
  const fixedPriceRaw = bundleConfig.fixedPrice?.value;
  const fixedPriceShop = parseDecimal(fixedPriceRaw);

  if (
    componentVariantIds.length === 0 ||
    !parentVariantId ||
    fixedPriceShop == null ||
    fixedPriceRaw == null
  ) {
    return NO_CHANGES;
  }

  const presentmentCurrencyRate =
    parseDecimal(input.presentmentCurrencyRate) ?? 1;
  const fixedPricePresentment = toPresentmentAmount(
    fixedPriceShop,
    presentmentCurrencyRate,
  );

  const variantLines = input.cart.lines.filter(isProductVariantLine);
  const variantIdToLine = new Map<string, ProductVariantLine>();

  for (const line of variantLines) {
    variantIdToLine.set(line.merchandise.id, line);
  }

  const matchedLines: ProductVariantLine[] = [];

  for (const variantId of componentVariantIds) {
    const line = variantIdToLine.get(variantId);
    if (!line) {
      return NO_CHANGES;
    }
    matchedLines.push(line);
  }

  const bundleQuantity = Math.min(...matchedLines.map((line) => line.quantity));
  if (bundleQuantity <= 0) {
    return NO_CHANGES;
  }

  const bundleComponents = buildBundleComponents(matchedLines, bundleQuantity);

  const sortedCartLines = [...matchedLines]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((line) => ({
      cartLineId: line.id,
      quantity: bundleQuantity,
    }));

  console.log('........fixedPriceRaw',fixedPriceRaw)

  const mergeOperation: LinesMergeOperation = {
    cartLines: sortedCartLines,
    parentVariantId,
    title: bundleConfig.bundleTitle?.value ?? undefined,
    attributes: buildMergeAttributes(bundleComponents, fixedPriceRaw),
  };

  const bundleLineId = sortedCartLines[0].cartLineId;
  const fixedPricePerUnitAmount = fixedPricePresentment / bundleQuantity;

  console.log('fixedPricePerUnitAmount', fixedPricePerUnitAmount)
  console.log('bundleQuantity', bundleQuantity)



  const operations: Operation[] = [
    { linesMerge: mergeOperation },
    {
      lineUpdate: {
        cartLineId: bundleLineId,
        price: {
          adjustment: {
            fixedPricePerUnit: {
              amount: 170.0,
            },
          },
        },
      },
    },
  ];

  return { operations };
}
