"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Role } from "@/types";

/**
 * Redirige vers /connexion si non connecté, ou vers / si le rôle ne correspond pas.
 * `requiredRole` omis = juste "être connecté" suffit (n'importe quel rôle).
 */
export function useRequireAuth(requiredRole?: Role) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (requiredRole && user.role !== requiredRole) {
      router.replace("/");
    }
  }, [user, loading, requiredRole, router]);

  return { user, loading };
}
