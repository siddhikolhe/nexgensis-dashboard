"use client";

import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // `loading` = "have we finished checking localStorage yet?"
  // Without this flag, ProtectedRoute would redirect to /login for a
  // split second on every refresh, even for a logged-in user, because
  // localStorage hasn't been read yet on first render.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const savedUser = localStorage.getItem("authUser");
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  function login(token, userData) {
    localStorage.setItem("accessToken", token);
    localStorage.setItem("authUser", JSON.stringify(userData));
    setUser(userData);
  }

  function logout() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("authUser");
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, isAuthenticated: !!user, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
