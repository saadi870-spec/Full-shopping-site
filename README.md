# ShopSphere

A premium, editorial-style e-commerce front end: storefront, cart, checkout, customer account and an admin dashboard — built with React, TypeScript, Tailwind CSS v4 and TanStack Query.

Product data comes from the public [DummyJSON](https://dummyjson.com/docs/products) API. There is **no backend**: cart, wishlist, orders, admin edits and accounts live in the browser's `localStorage`.

---

## Features

**Storefront**

- Home page with hero, category showcase, curated product rails and newsletter form
- Product listing with search, category filter, sale-only filter, price range, seven sort orders and pagination (12 per page) — all reflected in the URL, so filtered views are shareable and survive reload/back
- Product detail: gallery, pricing with compare-at and savings, rating breakdown and reviews, variant (colour/size) selection, quantity, stock state, related products, add to cart / buy now
- Wishlist (header shortcut plus a page), persisted across sessions
- Dark / light theme toggle, persisted
- Responsive from 360 px phones up to wide desktop; skeleton loaders, empty states and error states with retry throughout

**Cart & checkout**

- Cart with quantity steppers, per-option line items (colour + size), remove with confirmation, order summary, coupon entry and free-shipping progress
- Coupons: `SPHERE10` (10% off), `WELCOME15` ($15 off orders over $100), `FREESHIP` (free shipping)
- Shipping is free from $75, otherwise $6.95
- Checkout with React Hook Form + Zod validation (contact, shipping address, payment method, review)
- Order confirmation page with order number, items and totals, linked from the order it created

**Accounts (mock authentication)**

- Login, register and forgot-password screens with inline validation
- Protected routes: `/account/*` needs a signed-in user, `/admin/*` needs the `admin` role
- Account area: overview, order history with status badges, wishlist, profile editing, password change
- Toasts for every action; confirmation dialogs for destructive ones

**Admin dashboard**

- Overview with revenue/order KPIs, 12-month revenue chart and top-selling products (Recharts)
- Products: add, edit (title, price, stock, discount, category) and delete catalogue items as browser-local changes on top of the API data, with a reset action
- Orders: filter by status, update order status
- Customers: derived from order history with spend and last-order dates

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | React 18 + TypeScript (strict, `noUnusedLocals` / `noUnusedParameters`) |
| Build | Vite 6 |
| Styling | Tailwind CSS v4 with CSS-variable design tokens |
| Routing | React Router 6 (nested layouts, lazy routes) |
| Server state | TanStack Query 5 |
| Client state | Zustand 5 (`persist` middleware) |
| HTTP | Axios |
| Forms | React Hook Form + Zod (`@hookform/resolvers`) |
| Charts | Recharts |
| Icons | Lucide React |

---

## Getting started

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

The dev server runs at <http://localhost:5173>.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run typecheck` | Type-check only |

### Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Customer | `demo@shopsphere.dev` | `demo1234` |
| Admin | `admin@shopsphere.dev` | `admin123` |

The login screen also has one-click buttons that fill these in.

---

## Deployment (Vercel)

The repo ships a [`vercel.json`](./vercel.json), so importing the GitHub repo is enough — no dashboard configuration required:

- Framework preset: **Vite**
- Build command: `npm run build`
- Output directory: `dist`
- All paths rewrite to `index.html` so client-side routes (`/products/12`, `/admin/orders`, …) work on direct load and refresh

Dependencies are installed by Vercel from `package-lock.json`; `node_modules/` and `dist/` are git-ignored. Do **not** commit `node_modules` — a `node_modules` generated on Windows ships a `node_modules/.bin/tsc` without an executable bit, which makes the Linux build fail with `Permission denied` (exit 126).

Any static host works if you add the same SPA fallback. For Netlify, `_redirects` should contain `/* /index.html 200`.

---

## Project structure

```
src/
├── components/
│   ├── auth/        AuthShell (split marketing/form layout)
│   ├── home/        Hero, CategoryShowcase, PromoBanner, TrustBar, Newsletter
│   ├── layout/      Navbar, Footer, AnnouncementBar
│   ├── orders/      OrderStatusBadge
│   ├── product/     ProductCard, ProductGrid, ProductGallery, FiltersPanel, ProductReviews
│   ├── ui/          Button, Input, Checkbox, Modal, Accordion, Pagination, Price,
│   │                Rating, Badge, EmptyState, Skeleton, Toaster, Breadcrumbs, …
│   ├── ProtectedRoute.tsx
│   └── ScrollToTop.tsx
├── hooks/           useProducts (TanStack Query hooks), useDebounce
├── layouts/         RootLayout, AdminLayout
├── lib/             cart maths + coupons, product filtering/sorting, Zod schemas,
│                    formatting, analytics helpers, class-name merge
├── pages/           Home, Products, ProductDetail, Cart, Checkout,
│                    OrderConfirmation, Wishlist, NotFound
│   ├── account/     AccountLayout, Overview, Orders, Wishlist, Profile, Settings
│   ├── admin/       Dashboard, Products, Orders, Customers
│   └── auth/        Login, Register, ForgotPassword
├── routes/          AppRoutes (route table, lazy imports, protected branches)
├── services/        Axios instance, product endpoints, deterministic mock orders
├── stores/          auth, cart, orders, wishlist, admin product overrides,
│                    UI preferences, toasts
└── types/           Shared domain types
```

---

## Data model notes

- **Catalogue** — the whole catalogue is fetched once (`GET /products?limit=0`, ~194 items) and cached by TanStack Query; search, filtering, sorting and pagination are computed client-side in `lib/productFilters.ts`.
- **Product filters** — `ProductsPage` treats the query string as the single source of truth. `readFilters` parses `q`, `category`, `sale`, `min`, `max`, `sort` and `page`; `writeFilters` writes them back. Anything invalid falls back to a default instead of throwing.
- **Orders** — seeded deterministically on first run so the admin dashboard has data, then stored in `shopsphere-orders`.
- **Customers** — derived from orders; there is no separate customer record.
- **Admin product edits** — stored as overrides in `shopsphere-admin-products`, merged over the API catalogue, and resettable.
- **Persisted keys** — `shopsphere-auth`, `shopsphere-cart`, `shopsphere-orders`, `shopsphere-wishlist`, `shopsphere-admin-products`, `shopsphere-ui`.

---

## Limitations

This is a portfolio/demo front end, and a few things are deliberately not real:

- **Authentication is mock authentication.** Credentials and sessions are stored in `localStorage` and checked in the browser. It demonstrates routing and UI flows only — it is not security, and nothing here should be used to protect real data.
- **No server and no payments.** Checkout validates, records an order locally and shows a confirmation; no card is charged and nothing is sent anywhere.
- **No emails.** Newsletter signup and password reset only show a success message; no message is sent.
- **Catalogue is read-only.** Admin changes are local overrides, not API writes.
- **No order tracking or tax calculation** beyond the flat shipping rule and coupons described above.
- Sensitive-looking UI copy is intentionally absent: the app never claims to encrypt, track shipments or send mail that it doesn't.

## License

No license file is included; the source is published for portfolio and educational use.
