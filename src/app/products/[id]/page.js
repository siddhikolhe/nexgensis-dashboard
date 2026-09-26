"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { applyOverridesToOne, deleteLocalProduct, findLocalProduct } from "@/lib/localOverrides";
import { PLACEHOLDER_IMAGE } from "@/lib/placeholder";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";
import ConfirmModal from "@/components/ConfirmModal";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | success | notfound | error
  const [activeImage, setActiveImage] = useState(0);
  const [tab, setTab] = useState("description"); // description | reviews
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  function load() {
    // A locally-added product (negative id) never existed on the real API,
    // so we read it straight from the overrides layer instead of fetching.
    if (Number(id) < 0) {
      const local = findLocalProduct(id);
      if (local) {
        setProduct(local);
        setStatus("success");
      } else {
        setStatus("notfound");
      }
      return;
    }

    // guard against a non-numeric id in the URL (e.g. /products/abc)
    if (!id || Number.isNaN(Number(id))) {
      setStatus("notfound");
      return;
    }

    setStatus("loading");
    api
      .get(`/products/${id}`)
      .then((res) => {
        const merged = applyOverridesToOne(res.data);
        if (!merged) {
          setStatus("notfound"); // was deleted locally
        } else {
          setProduct(merged);
          setActiveImage(0);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (err.response?.status === 404) setStatus("notfound");
        else setStatus("error");
      });
  }

  useEffect(load, [id]);

  async function handleDelete() {
    setDeleting(true);
    try {
      if (Number(id) > 0) {
        await api.delete(`/products/${id}`);
      }
    } catch {
      // DummyJSON's delete is simulated anyway - hide it locally regardless
    } finally {
      deleteLocalProduct(id);
      setDeleting(false);
      setConfirmOpen(false);
      router.push("/products");
    }
  }

  const gallery = product?.images?.length ? product.images : product?.thumbnail ? [product.thumbnail] : [];

  return (
    <ProtectedRoute>
      <AppShell title="Product Details" subtitle="View, edit or remove this product">
        <div className="mx-auto max-w-4xl p-4">
          <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
            <Link href="/products" className="text-sky-600 hover:underline">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-700">Product Details</span>
          </div>

          {status === "loading" && <Loader />}
          {status === "error" && <ErrorState message="Couldn't load this product." onRetry={load} />}

          {status === "notfound" && (
            <div className="rounded-lg border bg-white py-16 text-center">
              <h2 className="text-lg font-semibold text-gray-900">Product not found</h2>
              <p className="mt-1 text-sm text-gray-500">
                No product exists with id &quot;{id}&quot;.
              </p>
              <Link
                href="/products"
                className="mt-4 inline-block rounded-md bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-700"
              >
                Back to products
              </Link>
            </div>
          )}

          {status === "success" && product && (
            <div className="rounded-lg border bg-white p-5">
              <div className="flex flex-col gap-6 md:flex-row">
                {/* Gallery */}
                <div className="flex gap-3 md:w-64 md:shrink-0">
                  {gallery.length > 1 && (
                    <div className="flex flex-col gap-2">
                      {gallery.slice(0, 5).map((src, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={`h-12 w-12 shrink-0 overflow-hidden rounded-md border-2 ${
                            i === activeImage ? "border-sky-500" : "border-transparent"
                          }`}
                        >
                          <img src={src || PLACEHOLDER_IMAGE} alt="" className="h-full w-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="aspect-square flex-1 overflow-hidden rounded-lg bg-gray-50">
                    <img
                      src={gallery[activeImage] || product.thumbnail || PLACEHOLDER_IMAGE}
                      alt={product.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="mb-2 inline-block rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-medium capitalize text-sky-700">
                        {product.category}
                      </span>
                      <h1 className="text-xl font-semibold text-gray-900">{product.title}</h1>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Link
                        href={`/products/${product.id}/edit`}
                        className="rounded-md bg-sky-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-sky-700"
                      >
                        Edit Product
                      </Link>
                      <button
                        onClick={() => setConfirmOpen(true)}
                        className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete Product
                      </button>
                    </div>
                  </div>

                  <p className="mt-2 text-2xl font-semibold text-gray-900">${product.price}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <span className="text-amber-500">★</span> {product.rating}
                    {product.reviews?.length ? ` (${product.reviews.length} reviews)` : ""}
                    <span className="mx-1">·</span> Stock: {product.stock}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
                    <div>
                      <p className="text-gray-400">Brand</p>
                      <p className="text-gray-800">{product.brand || "—"}</p>
                    </div>
                    <div>
                      <p className="text-gray-400">Category</p>
                      <p className="capitalize text-gray-800">{product.category}</p>
                    </div>
                    {product.sku && (
                      <div>
                        <p className="text-gray-400">SKU</p>
                        <p className="text-gray-800">{product.sku}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="mt-6 border-t pt-4">
                <div className="mb-3 flex gap-4 border-b text-sm">
                  <button
                    onClick={() => setTab("description")}
                    className={`-mb-px border-b-2 px-1 pb-2 font-medium ${
                      tab === "description"
                        ? "border-sky-600 text-sky-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Description
                  </button>
                  <button
                    onClick={() => setTab("reviews")}
                    className={`-mb-px border-b-2 px-1 pb-2 font-medium ${
                      tab === "reviews"
                        ? "border-sky-600 text-sky-700"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Reviews ({product.reviews?.length || 0})
                  </button>
                </div>

                {tab === "description" && (
                  <p className="text-sm leading-relaxed text-gray-700">{product.description}</p>
                )}

                {tab === "reviews" && (
                  <div className="flex flex-col gap-3">
                    {product.reviews?.length ? (
                      product.reviews.map((r, i) => (
                        <div key={i} className="rounded-md bg-gray-50 p-3 text-sm">
                          <p className="font-medium">
                            {r.reviewerName} <span className="text-amber-500">· {r.rating}★</span>
                          </p>
                          <p className="text-gray-600">{r.comment}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400">No reviews yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </AppShell>

      <ConfirmModal
        open={confirmOpen}
        title="Delete product"
        message={`Delete "${product?.title}"? This can't be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
        busy={deleting}
      />
    </ProtectedRoute>
  );
}