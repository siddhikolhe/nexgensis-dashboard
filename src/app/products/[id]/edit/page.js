"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/axios";
import { applyOverridesToOne, editLocalProduct, findLocalProduct } from "@/lib/localOverrides";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import ProductForm from "@/components/ProductForm";
import Loader from "@/components/Loader";
import ErrorState from "@/components/ErrorState";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api.get("/products/categories").then((res) => setCategories(res.data)).catch(() => {});

    if (Number(id) < 0) {
      const local = findLocalProduct(id);
      setProduct(local);
      setStatus(local ? "success" : "notfound");
      return;
    }

    api
      .get(`/products/${id}`)
      .then((res) => {
        const merged = applyOverridesToOne(res.data);
        setProduct(merged);
        setStatus(merged ? "success" : "notfound");
      })
      .catch((err) => setStatus(err.response?.status === 404 ? "notfound" : "error"));
  }, [id]);

  async function handleSubmit(values) {
    // PUT /products/:id is also simulated - it echoes back the merged
    // object but doesn't persist it, so we store the change locally too.
    await api.put(`/products/${id}`, values);
    editLocalProduct(id, values);
    router.push(`/products/${id}`);
  }

  return (
    <ProtectedRoute>
      <AppShell title="Edit product" subtitle={product ? product.title : ""}>
        <div className="mx-auto max-w-2xl p-4">
          {status === "loading" && <Loader />}
          {status === "error" && <ErrorState message="Couldn't load this product." />}
          {status === "notfound" && (
            <div className="rounded-lg border bg-white py-16 text-center text-sm text-gray-500">
              Product not found.
            </div>
          )}

          {status === "success" && product && (
            <div className="rounded-lg border bg-white p-5">
              <ProductForm
                initialValues={{
                  title: product.title,
                  category: product.category,
                  price: String(product.price),
                  stock: String(product.stock),
                  rating: String(product.rating ?? ""),
                  thumbnail: product.thumbnail || "",
                  description: product.description || "",
                }}
                categories={categories}
                onSubmit={handleSubmit}
                submitLabel="Save changes"
              />
            </div>
          )}
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
