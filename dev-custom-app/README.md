# dev-custom-app

Embedded [Shopify admin app](https://shopify.dev/docs/apps/getting-started) built with [React Router](https://reactrouter.com/) and [`@shopify/shopify-app-react-router`](https://shopify.dev/docs/api/shopify-app-react-router). The main experience is a **product table**: browse products, filter by total inventory, sort by price on the client, paginate through results, and update each product’s status (ACTIVE / DRAFT / UNLISTED).

For generic template topics (deployment, hosting, upgrading from Remix), see the [Shopify React Router app template](https://github.com/Shopify/shopify-app-template-react-router).

## Stack

| Area | Technology |
|------|------------|
| Framework | React 18, React Router 7 (`@react-router/*`) |
| Shopify | `@shopify/shopify-app-react-router`, App Bridge via `AppProvider` |
| Sessions | Prisma + `@shopify/shopify-app-session-storage-prisma` ([`app/shopify.server.ts`](app/shopify.server.ts), [`app/db.server.ts`](app/db.server.ts)) |
| API | Shopify Admin GraphQL (`authenticate.admin` → `admin.graphql`) |
| UI | [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components) (`<s-*>` custom elements), TypeScript types from `@shopify/polaris-types` |

UI is built with Polaris **web components** inside the embedded admin context.

## Prerequisites

- [Shopify CLI](https://shopify.dev/docs/apps/tools/cli/getting-started)
- Node.js per [`package.json`](package.json) engines (`>=20.19 <22 || >=22.12`)
- `DATABASE_URL` for PostgreSQL (see [`prisma/schema.prisma`](prisma/schema.prisma))

## Quick start

From this directory:

```shell
npm install
npm run setup
shopify app dev
```

`setup` runs `prisma generate` and `prisma migrate deploy`. Use `shopify app dev` so CLI injects env vars, tunneling, and app config.

## npm scripts

| Script | Command |
|--------|---------|
| `dev` | `shopify app dev` |
| `build` | `react-router build` |
| `start` | Serve production build |
| `setup` | `prisma generate && prisma migrate deploy` |
| `lint` | ESLint |
| `typecheck` | React Router typegen + `tsc --noEmit` |
| `graphql-codegen` | GraphQL codegen (if configured) |

## Features

### Product list (server)

- **Loader:** [`app/routes/app._index.tsx`](app/routes/app._index.tsx) → [`app/actions/indexActions.ts`](app/actions/indexActions.ts) (`indexLoader`).
- **Query:** [`app/actions/queries/getProducts.ts`](app/actions/queries/getProducts.ts) loads products with: `title`, `totalInventory`, `status`, `featuredMedia` (image), `priceRangeV2.minVariantPrice`.
- **Pagination:** Cursor-based `after` / `before` URL params; default page size **10**. `pageInfo` drives `<s-table paginate>` via [`useProductIndexPagination`](app/hooks/useProductIndexPagination.ts).

### Total inventory filter (server)

- URL search params are parsed by [`app/utils/parseInventoryTotalFilterFromUrl.ts`](app/utils/parseInventoryTotalFilterFromUrl.ts).
- Translated to Admin API search syntax by [`app/utils/buildInventoryTotalQuery.ts`](app/utils/buildInventoryTotalQuery.ts): `inventory_total:>N`, `inventory_total:<N`, or `inventory_total:N`.
- UI: [`app/components/ProductFilters.tsx`](app/components/ProductFilters.tsx) + [`app/hooks/useProductInventoryFilters.ts`](app/hooks/useProductInventoryFilters.ts) (popover with condition + quantity).

### Price column sort (client)

- [`app/hooks/useProductsPriceSort.ts`](app/hooks/useProductsPriceSort.ts) sorts the current page by minimum variant price; toggled from the Price header in [`app/components/TableHeaderRow.tsx`](app/components/TableHeaderRow.tsx).

### Update product status (server action)

- [`app/components/ProductStatusModal.tsx`](app/components/ProductStatusModal.tsx) opens a modal, submits via `useFetcher` with `intent=updateProductStatus`, `productId`, `productStatus`.
- **Action:** `indexAction` in [`app/actions/indexActions.ts`](app/actions/indexActions.ts) calls [`app/actions/mutations/updateProductStatus.ts`](app/actions/mutations/updateProductStatus.ts) (`productUpdate` mutation).
- Allowed statuses: [`app/constants/product.ts`](app/constants/product.ts) — `ACTIVE`, `DRAFT`, `UNLISTED`.

### Auth and webhooks

- **Embedded shell:** [`app/routes/app.tsx`](app/routes/app.tsx) — `authenticate.admin`, `AppProvider` with `embedded` + `apiKey`.
- **Login (non-embedded):** [`app/routes/auth.login/route.tsx`](app/routes/auth.login/route.tsx).
- **`app/uninstalled`:** [`app/routes/webhooks.app.uninstalled.tsx`](app/routes/webhooks.app.uninstalled.tsx) deletes Prisma sessions for the shop.
- **`app/scopes_update`:** [`app/routes/webhooks.app.scopes_update.tsx`](app/routes/webhooks.app.scopes_update.tsx) updates session scope when that webhook is subscribed (declare in `shopify.app.toml` if needed).

## App configuration

[`shopify.app.toml`](shopify.app.toml) defines app name, URLs, embedded flag, webhook subscriptions, and [access scopes](https://shopify.dev/docs/apps/tools/cli/configuration#access_scopes). Example scopes used for this app: `read_products`, `write_products`. CLI updates dev URLs when `automatically_update_urls_on_dev` is enabled.

## Project layout

| Path | Role |
|------|------|
| [`app/routes/`](app/routes/) | Route modules (app shell, index, auth, webhooks) |
| [`app/components/`](app/components/) | `Table`, rows, filters, status modal |
| [`app/actions/`](app/actions/) | Loaders/actions helpers: queries, mutations |
| [`app/hooks/`](app/hooks/) | Pagination, filters, price sort |
| [`app/utils/`](app/utils/) | URL parsing, GraphQL query builders, mappers |
| [`app/types/`](app/types/) | Shared product / loader types |
| [`prisma/`](prisma/) | Schema and migrations |

## Polaris Web Components used

These tags are Polaris [App Home web components](https://shopify.dev/docs/api/app-home/polaris-web-components), not imports from `@shopify/polaris`.

| Tag | Used in |
|-----|---------|
| `s-page` | [`app/routes/app._index.tsx`](app/routes/app._index.tsx), [`app/routes/auth.login/route.tsx`](app/routes/auth.login/route.tsx) |
| `s-section` | [`app/components/Table.tsx`](app/components/Table.tsx), auth login |
| `s-table`, `s-table-header-row`, `s-table-header`, `s-table-body`, `s-table-row`, `s-table-cell` | [`Table.tsx`](app/components/Table.tsx), [`TableHeaderRow.tsx`](app/components/TableHeaderRow.tsx), [`TableRow.tsx`](app/components/TableRow.tsx) |
| `s-stack`, `s-box`, `s-text`, `s-badge`, `s-thumbnail`, `s-icon`, `s-clickable` | Table, filters, row |
| `s-button` | Filters, modal, login |
| `s-popover`, `s-select`, `s-option`, `s-number-field` | [`ProductFilters.tsx`](app/components/ProductFilters.tsx) |
| `s-modal` | [`ProductStatusModal.tsx`](app/components/ProductStatusModal.tsx) |
| `s-text-field` | Auth login |

## Authenticating and querying (pattern)

Server modules use `authenticate` from [`app/shopify.server.ts`](app/shopify.server.ts). Example used in this codebase: `indexLoader` obtains `admin`, then calls `getProducts` with optional inventory search and cursors. See [`app/actions/indexActions.ts`](app/actions/indexActions.ts) and [`app/actions/queries/getProducts.ts`](app/actions/queries/getProducts.ts).

## Resources

- [Shopify app React Router package](https://shopify.dev/docs/api/shopify-app-react-router)
- [Polaris Web Components](https://shopify.dev/docs/api/app-home/polaris-web-components)
- [Admin GraphQL API](https://shopify.dev/docs/api/admin-graphql)
- [React Router](https://reactrouter.com/home)
