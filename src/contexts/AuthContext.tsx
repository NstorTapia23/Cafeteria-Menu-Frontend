"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { UserRole } from "@/types/roles";

type Role = UserRole;

export interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (
    name: string,
    password: string,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (
    name: string,
    password: string,
    role: Role,
  ) => Promise<{ success: boolean; user?: User; error?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<{
    success: boolean;
    user: User | null;
    error?: string;
  }>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

type MeResponse = {
  user: User | null;
};

type AuthMutationResponse = {
  worker?: User;
  error?: string;
};

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasBootstrapped = useRef(false);

  const isAuthenticated = Boolean(user);

  const fetchCurrentUser = useCallback(async (): Promise<User | null> => {
    const response = await fetch("/api/auth/me", {
      method: "GET",
      cache: "no-store",
      credentials: "include",
    });

    const data: MeResponse = await response.json();

    if (!response.ok || !data.user?.id) {
      return null;
    }

    return data.user;
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const currentUser = await fetchCurrentUser();

      return {
        success: Boolean(currentUser),
        user: currentUser,
      };
    } catch {
      return {
        success: false,
        user: null,
        error: "Error de conexión",
      };
    }
  }, [fetchCurrentUser]);

  useEffect(() => {
    if (hasBootstrapped.current) return;
    hasBootstrapped.current = true;

    let cancelled = false;

    const bootstrapAuth = async () => {
      setLoading(true);
      setError(null);

      try {
        const result = await checkAuth();

        if (!cancelled) {
          setUser(result.user);
          setError(result.error ?? null);
        }
      } catch {
        if (!cancelled) {
          setUser(null);
          setError("Error inesperado al verificar autenticación");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      cancelled = true;
    };
  }, [checkAuth]);

  const login = useCallback(async (name: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, password }),
      });

      const data: AuthMutationResponse = await response.json();

      if (!response.ok || !data.worker?.id) {
        const msg = data.error || "Error en login";
        setUser(null);
        setError(msg);
        return { success: false, error: msg };
      }

      setUser(data.worker);
      setError(null);
      return { success: true, user: data.worker };
    } catch {
      const msg = "Error de conexión";
      setUser(null);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const register = useCallback(async (name: string, password: string, role: Role) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name, password, role }),
      });

      const data: AuthMutationResponse = await response.json();

      if (!response.ok || !data.worker?.id) {
        const msg = data.error || "Error en registro";
        setUser(null);
        setError(msg);
        return { success: false, error: msg };
      }

      setUser(data.worker);
      setError(null);
      return { success: true, user: data.worker };
    } catch {
      const msg = "Error de conexión";
      setUser(null);
      setError(msg);
      return { success: false, error: msg };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error en logout:", err);
    } finally {
      setUser(null);
      setLoading(false);
      setError(null);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      checkAuth,
      clearError,
    }),
    [
      user,
      loading,
      error,
      isAuthenticated,
      login,
      register,
      logout,
      checkAuth,
      clearError,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe usarse dentro de AuthProvider");
  }
  return context;
}