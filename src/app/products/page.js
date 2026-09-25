"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import useDebounce from "@/lib/useDebounce";
import { applyOverridesToList, getAddedProducts, deleteLocalProduct } from "@/lib/localOverrides";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import SearchFilterBar from "@/components/SearchFilterBar";
import ProductTable from "@/components/ProductTable";
import ProductCardList from "@/components/ProductCard";
import Pagination from "@/components/Pagination";
import Loader from "@/components/Loader";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import ConfirmModal from "@/components/ConfirmModal";
import Link from "next/link";

const ALLOWED_LIMITS = [10, 20, 50];

// --- helpers to read + sanitize URL params (page=abc / page=999 must not crash) ---
function parsePage(raw) {
  const n = Number(raw);
  return Number.isInteger(n) && n > 0 ? n : 1;
}
function parseLimit(raw) {
  const n = Number(raw);
  return ALLOWED_LIMITS.includes(n) ? n : 10;
}

export default function ProductsPage() {
  // useSearchParams() opts the page out of static rendering and requires a
  // Suspense boundary in the App Router - this is that boundary.
  return (
    <Suspense fallback={<Loader />}>
      <ProductsPageInner />
    </Suspense>
  );
}

function ProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ---- URL is the single source of truth for these 5 values ----
  const page = parsePage(searchParams.get("page"));
  const limit = parseLimit(searchParams.get("limit"));
  const q = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const sort = searchParams.get("sort") || "";

  // local input state so typing feels instant; debounced before it touches the URL
  const [searchInput, setSearchInput] = useState(q);
  const debouncedSearch = useDebounce(searchInput, 400);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Tracks the most recently *started* request so an old, slow response
  // (e.g. a stale search fired before the user kept typing) can never
  // overwrite state set by a newer one - this is the fix for the
  // "&delay=2000" race-condition test in the assignment.
  const requestIdRef = useRef(0);

  // helper: push new params onto the URL, so refresh/share always
  // reproduces the exact same view
  const updateParams = useCallback(
    (updates) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === "" || value === undefined || value === null) {
          params.delete(key);
        } else {
          params.set(key, value);
        }
      });
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  // when the debounced search value changes, sync it to the URL and reset to page 1
  useEffect(() => {
    if (debouncedSearch !== q) {
      updateParams({ q: debouncedSearch || undefined, page: 1 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  // load categories once
  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  const fetchProducts = useCallback(() => {
    const myRequestId = ++requestIdRef.current;
    setStatus("loading");

    const skip = (page - 1) * limit;
    // The API can't search AND filter by category at once, so when a
    // search term is present we prioritize search and ignore category
    // (the category dropdown is also disabled in the UI for this reason).
    let url = "/products";
    if (q.trim()) {
      url = `/products/search?q=${encodeURIComponent(q)}&limit=${limit}&skip=${skip}`;
    } else if (category) {
      url = `/products/category/${category}?limit=${limit}&skip=${skip}`;
    } else {
      url = `/products?limit=${limit}&skip=${skip}`;
    }

    api
      .get(url)
      .then((res) => {
        // ignore this response if a newer request has already started
        if (myRequestId !== requestIdRef.current) return;

        let list = applyOverridesToList(res.data.products || []);

        // Sorting is applied client-side to the current page only. The
        // API's sortBy/order params aren't reliably supported on the
        // /search and /category endpoints, so sorting per-fetched-page
        // keeps behavior identical no matter which endpoint was used.
        if (sort) {
          const [key, dir] = sort.split("-");
          list = [...list].sort((a, b) => {
            const av = a[key];
            const bv = b[key];
            if (typeof av === "string") {
              return dir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
            }
            return dir === "asc" ? av - bv : bv - av;
          });
        }

        // Locally-added products only make sense to show on page 1 of the
        // unfiltered, unsorted, unsearched view - that's the "default" list.
        if (page === 1 && !q.trim() && !category && !sort) {
          list = [...getAddedProducts(), ...list];
        }

        setProducts(list);
        setTotal(res.data.total || 0);
        setStatus("success");
      })
      .catch(() => {
        if (myRequestId !== requestIdRef.current) return;
        setStatus("error");
      });
  }, [page, limit, q, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.id > 0) {
        // real DummyJSON product -> call the (simulated) DELETE endpoint
        await api.delete(`/products/${deleteTarget.id}`);
      }
      // DummyJSON doesn't actually delete anything server-side, so we
      // also record the deletion locally to hide it from future fetches
      deleteLocalProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      // even if the network call fails, DummyJSON's delete is fake anyway -
      // still hide it locally so the UI stays consistent
      deleteLocalProduct(deleteTarget.id);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  }

  const showingEmptyOnLatePage = status === "success" && products.length === 0 && page > 1;

  function handleReset() {
    setSearchInput("");
    router.push("/products");
  }

  return (
    <ProtectedRoute>
      <AppShell
        title="Products"
        subtitle={`All products · ${total} results`}
        actions={
          <Link
            href="/products/new"
            className="hidden items-center gap-1.5 rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700 sm:flex"
          >
            + Add product
          </Link>
        }
      >
        <div className="mx-auto max-w-6xl p-4">
          <div className="mb-3 flex justify-end sm:hidden">
            <Link
              href="/products/new"
              className="rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
            >
              + Add product
            </Link>
          </div>

          <div className="rounded-lg border bg-white">
          <SearchFilterBar
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            category={category}
            onCategoryChange={(val) => updateParams({ category: val, page: 1 })}
            categories={categories}
            sort={sort}
            onSortChange={(val) => updateParams({ sort: val })}
            onReset={handleReset}
          />

          {status === "loading" && <Loader label="Loading products..." />}

          {status === "error" && (
            <ErrorState message="Couldn't load products." onRetry={fetchProducts} />
          )}

          {status === "success" && products.length === 0 && !showingEmptyOnLatePage && (
            <EmptyState message="No products match your search/filter." />
          )}

          {showingEmptyOnLatePage && (
            <EmptyState
              message={`Page ${page} is empty.`}
              action={
                <button
                  onClick={() => updateParams({ page: 1 })}
                  className="mt-2 rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                  Go to page 1
                </button>
              }
            />
          )}

          {status === "success" && products.length > 0 && (
            <>
              <ProductTable products={products} onDelete={setDeleteTarget} />
              <ProductCardList products={products} onDelete={setDeleteTarget} />
              <Pagination
                page={page}
                limit={limit}
                total={total}
                onPageChange={(p) => updateParams({ page: p })}
                onLimitChange={(l) => updateParams({ limit: l, page: 1 })}
              />
            </>
          )}
        </div>
        </div>
      </AppShell>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete product"
        message={`Delete "${deleteTarget?.title}"? This can't be undone.`}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        busy={deleting}
      />
    </ProtectedRoute>
  );
}
