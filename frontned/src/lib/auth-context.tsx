"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import type { User } from "./types";
import { ApiError, getMe, login as apiLogin } from "./api";

const TOKEN_KEY = "cms_token";

interface AuthContextValue {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const stored = typeof window !== "undefined" ? localStorage.getItem(TOKEN_KEY) : null;
      if (!stored) {
        if (!cancelled) setLoading(false);
        return;
      }
      try {
        const u = await getMe(stored);
        if (!cancelled) {
          setUser(u);
          setToken(stored);
        }
      } catch {
        localStorage.removeItem(TOKEN_KEY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token: newToken, user: newUser } = await apiLogin(email, password);
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiError };
