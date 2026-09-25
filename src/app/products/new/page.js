"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { addLocalProduct } from "@/lib/localOverrides";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import ProductForm from "@/components/ProductForm";

export default function NewProductPage() {
  const [categories, setCategories] = useState([]);
  const router = useRouter();

  useEffect(() => {
    api
      .get("/products/categories")
      .then((res) => setCategories(res.data))
      .catch(() => setCategories([]));
  }, []);

  async function handleSubmit(values) {
    // POST /products/add is simulated by DummyJSON - it returns a "created"
    // product with a new id, but never actually stores it server-side.
    const res = await api.post("/products/add", values);
    // so we keep our own local copy to show it in the list afterwards
    addLocalProduct({ ...values, thumbnail: values.thumbnail || res.data.thumbnail });
    router.push("/products");
  }

  return (
    <ProtectedRoute>
      <AppShell title="Add product" subtitle="Create a new catalog item">
        <div className="mx-auto max-w-2xl p-4">
          <div className="rounded-lg border bg-white p-5">
            <ProductForm categories={categories} onSubmit={handleSubmit} submitLabel="Create product" />
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
