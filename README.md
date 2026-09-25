# Product Admin Dashboard

Frontend assignment for Nexgensis Technologies - Next.js (App Router) + Tailwind CSS + Axios, using the DummyJSON API.

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000. Log in with:

- Username: `emilys`
- Password: `emilyspass`

## What's finished

- Login page (POST /auth/login), token stored, protected routes redirect to /login when logged out, logout button
- Product list: table on desktop, cards on mobile
- Pagination: limit/skip, page numbers, Previous/Next, page-size selector (10/20/50), "Showing X-Y of total" text
- Debounced search (`/products/search`), resets to page 1 on change
- Category filter (`/products/categories`) and sort by title/price/rating
- Product details page (`/products/[id]`) with images, description, reviews, and a "not found" state for bad ids
- Add / edit product with validation, delete with a confirm popup
- Loading, empty, and error (with Retry) states
- One shared Axios instance (`src/lib/axios.js`) that attaches the token and handles 401s in one place
- Page, search, filter, and sort are all kept in the URL

## Decisions worth explaining

**Search vs. category filter.** DummyJSON can't search and filter by category in the same request, so when there's an active search term, the app ignores the category param and disables the category dropdown (with a short explanation in the UI) instead of silently doing the wrong thing.

**Sorting.** Sort is applied client-side to whichever page was just fetched, rather than relying on the API's `sortBy`/`order` params. Those params aren't reliably supported across `/products`, `/products/search`, and `/products/category/:slug`, so sorting the fetched page client-side keeps behavior identical no matter which endpoint served the data.

**Add/edit/delete don't really save.** DummyJSON simulates these endpoints - it returns a "success" response but never persists anything server-side. To make the app behave correctly on a refresh, `src/lib/localOverrides.js` keeps a small localStorage layer: added products (negative ids, so they never collide with real ones), edited fields per id, and deleted ids - all merged into whatever the API returns. This is a documented workaround for a fake API, not something you'd do against a real backend.

**Preventing stale search results.** Each fetch is tagged with an incrementing request id (`requestIdRef`). If a slower, older request resolves after a newer one has already started, its response is discarded. Tested by appending `&delay=2000` to the DummyJSON URL while typing quickly.

**Bad URL values don't crash the page.** `?page=abc`, `?page=-1`, and `?page=999` are all sanitized (`parsePage`/`parseLimit` in `src/app/products/page.js`) - invalid values fall back to sane defaults, and a valid-but-empty page shows a "Page N is empty - Go to page 1" message instead of a blank/broken screen.

**Double-submit / double-click.** The login button and the product form's submit button both track an in-flight `submitting` boolean and ignore extra clicks until the request resolves.

## A problem I ran into

`useSearchParams()` requires a `<Suspense>` boundary in the Next.js App Router, or the production build fails with a prerender error on `/products`. Fixed by splitting the page into an outer component (wrapped in `<Suspense>`) and an inner component that actually calls the hook.

## Where AI helped

Used AI assistance to scaffold the project structure and get the URL-sync/debounce/race-condition logic right on the first pass, then reviewed and adjusted it line by line so I can explain and modify any part of it live.
