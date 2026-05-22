import {
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
    product: {
      title: string;
      bundleRecipe?: { jsonValue?: unknown } | null;
    };
  };
};

type BundleRecipe = {
  parentVariantId: string;
  componentVariantIds: string[];
  fixedPrice: string;
  bundleTitle?: string;
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

function parseBundleRecipe(jsonValue: unknown): BundleRecipe | null {
  if (jsonValue == null || typeof jsonValue !== "object") {
    return null;
  }

  const raw = jsonValue as Record<string, unknown>;
  const parentVariantId = raw.parentVariantId;
  const fixedPrice = raw.fixedPrice;

  if (typeof parentVariantId !== "string" || parentVariantId.length === 0) {
    return null;
  }
  if (typeof fixedPrice !== "string" || fixedPrice.length === 0) {
    return null;
  }

  const componentVariantIds = Array.isArray(raw.componentVariantIds)
    ? raw.componentVariantIds.filter(
        (id): id is string => typeof id === "string" && id.length > 0,
      )
    : [];

  if (componentVariantIds.length === 0) {
    return null;
  }

  const bundleTitle =
    typeof raw.bundleTitle === "string" && raw.bundleTitle.length > 0
      ? raw.bundleTitle
      : undefined;

  return {
    parentVariantId,
    componentVariantIds,
    fixedPrice,
    bundleTitle,
  };
}

function recipeKey(recipe: BundleRecipe): string {
  const sortedComponents = [...recipe.componentVariantIds].sort().join(",");
  return `${recipe.parentVariantId}|${sortedComponents}`;
}

function collectUniqueRecipes(lines: ProductVariantLine[]): BundleRecipe[] {
  const seen = new Set<string>();
  const recipes: BundleRecipe[] = [];

  for (const line of lines) {
    const recipe = parseBundleRecipe(line.merchandise.product.bundleRecipe?.jsonValue);
    if (!recipe) {
      continue;
    }

    const key = recipeKey(recipe);
    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    recipes.push(recipe);
  }

  return recipes;
}

function parseDecimal(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
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

function buildBundleOperations(
  recipe: BundleRecipe,
  matchedLines: ProductVariantLine[],
  bundleQuantity: number,
): Operation[] {
  const bundleComponents = buildBundleComponents(matchedLines, bundleQuantity);
  const fixedPriceRaw = recipe.fixedPrice;

  const sortedCartLines = [...matchedLines]
    .sort((a, b) => a.id.localeCompare(b.id))
    .map((line) => ({
      cartLineId: line.id,
      quantity: bundleQuantity,
    }));

  const mergeOperation: LinesMergeOperation = {
    cartLines: sortedCartLines,
    parentVariantId: recipe.parentVariantId,
    attributes: buildMergeAttributes(bundleComponents, fixedPriceRaw),

  };

  return [
    {linesMerge: mergeOperation }
  ];
}

export function cartTransformRun(
  input: CartTransformRunInput,
): CartTransformRunResult {
  const variantLines = input.cart.lines.filter(isProductVariantLine);
  const recipes = collectUniqueRecipes(variantLines);

  if (recipes.length === 0) {
    return NO_CHANGES;
  }

  const variantIdToLine = new Map<string, ProductVariantLine>();
  for (const line of variantLines) {
    variantIdToLine.set(line.merchandise.id, line);
  }

  const usedLineIds = new Set<string>();
  const operations: Operation[] = [];

  for (const recipe of recipes) {
    const fixedPriceShop = parseDecimal(recipe.fixedPrice);
    if (fixedPriceShop == null) {
      continue;
    }

    const matchedLines: ProductVariantLine[] = [];
    let skipRecipe = false;

    for (const variantId of recipe.componentVariantIds) {
      const line = variantIdToLine.get(variantId);
      if (!line || usedLineIds.has(line.id)) {
        skipRecipe = true;
        break;
      }
      matchedLines.push(line);
    }

    if (skipRecipe || matchedLines.length !== recipe.componentVariantIds.length) {
      continue;
    }

    const bundleQuantity = Math.min(
      ...matchedLines.map((line) => line.quantity),
    );
    if (bundleQuantity <= 0) {
      continue;
    }

    operations.push(
      ...buildBundleOperations(
        recipe,
        matchedLines,
        bundleQuantity
      ),
    );

    for (const line of matchedLines) {
      usedLineIds.add(line.id);
    }
  }

  if (operations.length === 0) {
    return NO_CHANGES;
  }

  return { operations };
}
