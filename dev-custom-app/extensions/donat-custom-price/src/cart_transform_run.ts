import type {
  CartTransformRunInput,
  CartTransformRunResult,
  Operation,
} from "../generated/api";

const NO_CHANGES: CartTransformRunResult = {
  operations: [],
};

type CartLine = CartTransformRunInput["cart"]["lines"][number];

type ProductVariantLine = CartLine & {
  merchandise: {
    __typename: "ProductVariant";
    id: string;
    product: {
      donationAmount?: { value: string } | null;
    };
  };
};

function isProductVariantLine(line: CartLine): line is ProductVariantLine {
  return line.merchandise.__typename === "ProductVariant";
}

function parseDecimal(value: unknown): number | null {
  if (value == null || value === "") {
    return null;
  }

  const parsed =
    typeof value === "number" ? value : Number.parseFloat(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function isZeroPrice(amount: unknown): boolean {
  const parsed = parseDecimal(amount);
  return parsed !== null && parsed === 0;
}

function parsePositiveDonationAmount(value: unknown): number | null {
  const parsed = parseDecimal(value);
  if (parsed === null || parsed <= 0) {
    return null;
  }
  return parsed;
}

function formatDecimalAmount(amount: number): string {
  return amount.toFixed(2);
}

function buildDonationPriceOperation(
  line: ProductVariantLine,
  amount: number,
): Operation {
  return {
    lineUpdate: {
      cartLineId: line.id,
      price: {
        adjustment: {
          fixedPricePerUnit: {
            amount: formatDecimalAmount(amount),
          },
        },
      },
    },
  };
}

export function cartTransformRun(
  input: CartTransformRunInput,
): CartTransformRunResult {
  const operations: Operation[] = [];

  for (const line of input.cart.lines) {
    if (!isProductVariantLine(line)) {
      continue;
    }

    if (!isZeroPrice(line.cost.amountPerQuantity.amount)) {
      continue;
    }

    const donationAmount = parsePositiveDonationAmount(
      line.merchandise.product.donationAmount?.value,
    );
    if (donationAmount === null) {
      continue;
    }

    operations.push(buildDonationPriceOperation(line, donationAmount));
  }

  if (operations.length === 0) {
    return NO_CHANGES;
  }

  return { operations };
}
