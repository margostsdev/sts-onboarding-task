# Store setup: product bundle metafields

## Prerequisites

- App installed; Cart Transform registered (`ensureCartTransform` on app load).
- `shopify app deploy` so product metafield definition `$app:product-bundle` / `bundle` exists.
- Shopify Plus if you need `lineUpdate` fixed bundle price.

## Products

For each bundle:

1. **Parent product** — one variant (e.g. `bundle_123`) used as `parentVariantId` in merge.
2. **Component products** — variants customers add to cart before merge (e.g. product_1, product_2, product_3).

Repeat for additional bundles (e.g. bundle_456 with product_4, product_5, product_6).

## Metafield on component products

On **every component product** of a bundle, set metafield:

- Namespace: `$app:product-bundle`
- Key: `bundle`
- Type: JSON

Example value (same JSON on all components of one bundle):

```json
{
  "parentVariantId": "gid://shopify/ProductVariant/PARENT_ID",
  "componentVariantIds": [
    "gid://shopify/ProductVariant/COMP_1",
    "gid://shopify/ProductVariant/COMP_2",
    "gid://shopify/ProductVariant/COMP_3"
  ],
  "fixedPrice": "99.00",
  "bundleTitle": "Bundle 123"
}
```

Use Admin → Product → Metafields, or Admin GraphQL `metafieldsSet` with product `ownerId`.

## Cart test

1. Add all component variants of bundle_123 to cart.
2. Optionally add all components of bundle_456 in the same cart.
3. Open checkout — lines should merge per bundle with configured title and price.

## Notes

- Parent variant does not need to be in cart before merge.
- If a component is missing, that bundle is skipped; other bundles can still merge.
- Re-install app after scope changes (`write_metaobjects` removed).
