"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("emilys");
  const [password, setPassword] = useState("emilyspass");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    // guard: ignore extra clicks while a login request is already in flight
    if (submitting) return;
    setSubmitting(true);

    try {
      const res = await api.post("/auth/login", {
        username,
        password,
        expiresInMins: 60,
      });
      login(res.data.accessToken, {
        id: res.data.id,
        username: res.data.username,
        email: res.data.email,
        image: res.data.image,
      });
      router.replace("/products");
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 401) {
        setError("Invalid username or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-sky-600 p-4">
      {/* subtle background texture, no borrowed illustration */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-sky-500/40" />
        <div className="absolute right-0 top-1/3 h-56 w-56 rounded-full bg-sky-400/30" />
        <div className="absolute bottom-0 left-1/4 h-64 w-64 rounded-full bg-sky-700/30" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-white">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6">
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </div>
          <h1 className="text-lg font-semibold">Product Admin</h1>
          <p className="text-sm text-sky-100/90">Sign in to manage your catalog</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl sm:p-8">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border px-3 py-2.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-1 w-full rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-700 disabled:opacity-50"
            >
              {submitting ? "Signing in..." : "Login"}
            </button>

            {error && (
              <div className="flex items-center justify-between rounded-lg bg-red-50 px-3 py-2.5 text-sm text-red-700">
                <span className="flex items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4 shrink-0">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M12 8v5M12 16h.01" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                  {error}
                </span>
                <button
                  type="button"
                  onClick={() => setError("")}
                  aria-label="Dismiss"
                  className="text-red-400 hover:text-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-sky-100/70">
          Demo credentials are pre-filled — this is a DummyJSON test account.
        </p>
      </div>
    </div>
  );
}
