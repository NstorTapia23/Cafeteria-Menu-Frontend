"use client";

import { useAuthContext } from "@/contexts/AuthContext";

export function useAuth() {
  const context = useAuthContext();

  return {
    user: context.user,
    loading: context.loading,
    error: context.error,
    isAuthenticated: context.isAuthenticated,
    login: context.login,
    register: context.register,
    logout: context.logout,
    checkAuth: context.checkAuth,
    clearError: context.clearError,
  };
}
