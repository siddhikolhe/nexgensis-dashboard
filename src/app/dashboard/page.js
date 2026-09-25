"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/axios";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppShell from "@/components/AppShell";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [total, setTotal] = useState(null);

  useEffect(() => {
    api
      .get("/products?limit=1")
      .then((res) => setTotal(res.data.total))
      .catch(() => setTotal(null));
  }, []);

  return (
    <ProtectedRoute>
      <AppShell title="Dashboard" subtitle="Quick overview">
        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-lg border bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Welcome back, {user?.username || "there"}.
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here&apos;s a quick snapshot of your catalog.
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-lg border bg-sky-50 p-4">
                <p className="text-xs font-medium text-sky-700">Total products</p>
                <p className="mt-1 text-2xl font-semibold text-sky-900">
                  {total ?? "—"}
                </p>
              </div>
              <Link
                href="/products"
                className="flex flex-col justify-between rounded-lg border p-4 hover:bg-gray-50"
              >
                <p className="text-xs font-medium text-gray-500">Manage catalog</p>
                <p className="mt-1 text-sm font-medium text-sky-600">
                  Go to Products →
                </p>
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    </ProtectedRoute>
  );
}
