"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { api, ApiClientError } from "./api";
import { User } from "@/types";

interface AuthContextValue {
  user: User | null;
  loading: boolean; // true tant qu'on n'a pas vérifié le token au chargement de la page
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "beautyshop_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Au premier rendu côté client : si un token existe déjà, on tente de récupérer le profil
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get<{ success: boolean; data: User }>("/auth/me")
      .then((res) => setUser(res.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY)) // token expiré/invalide
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>(
      "/auth/login",
      { email, password },
      { auth: false }
    );
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  }

  async function register(name: string, email: string, password: string) {
    const res = await api.post<{ success: boolean; data: { user: User; token: string } }>(
      "/auth/register",
      { name, email, password },
      { auth: false }
    );
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé à l'intérieur de <AuthProvider>");
  return ctx;
}

export { ApiClientError };
