"use client";

import { useCallback, useEffect, useState } from "react";

type Role = "dependiente" | "bartender" | "cocinero" | "admin" | "superadmin";

interface User {
  id: string;
  name: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

type MeResponse = {
  user: User | null;
};

type LoginResponse = {
  worker?: User;
  error?: string;
  message?: string;
};

function buildUnauthedState(error: string | null = null): AuthState {
  return {
    user: null,
    loading: false,
    error,
    isAuthenticated: false,
  };
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  const syncAuthState = useCallback(
    (user: User | null, error: string | null = null) => {
      setState({
        user,
        loading: false,
        error,
        isAuthenticated: Boolean(user),
      });
    },
    [],
  );

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
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const user = await fetchCurrentUser();
      syncAuthState(user);
      return { success: Boolean(user), user };
    } catch {
      setState(buildUnauthedState("Error de conexión"));
      return { success: false, user: null, error: "Error de conexión" };
    }
  }, [fetchCurrentUser, syncAuthState]);

  const login = useCallback(
    async (name: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, password }),
        });

        const data: LoginResponse = await response.json();

        if (!response.ok || !data.worker?.id) {
          const message = data.error || "Error en login";
          setState(buildUnauthedState(message));
          return { success: false, error: message };
        }

        syncAuthState(data.worker);
        return { success: true, user: data.worker };
      } catch {
        const message = "Error de conexión";
        setState(buildUnauthedState(message));
        return { success: false, error: message };
      }
    },
    [syncAuthState],
  );

  const register = useCallback(
    async (name: string, password: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ name, password }),
        });

        const data: LoginResponse = await response.json();

        if (!response.ok || !data.worker?.id) {
          const message = data.error || "Error en registro";
          setState(buildUnauthedState(message));
          return { success: false, error: message };
        }

        syncAuthState(data.worker);
        return { success: true, user: data.worker };
      } catch {
        const message = "Error de conexión";
        setState(buildUnauthedState(message));
        return { success: false, error: message };
      }
    },
    [syncAuthState],
  );

  const logout = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error en logout:", error);
    } finally {
      setState({
        user: null,
        loading: false,
        error: null,
        isAuthenticated: false,
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        const user = await fetchCurrentUser();
        if (cancelled) return;
        syncAuthState(user);
      } catch {
        if (cancelled) return;
        setState(buildUnauthedState("Error de conexión"));
      }
    };

    void init();

    return () => {
      cancelled = true;
    };
  }, [fetchCurrentUser, syncAuthState]);

  return {
    ...state,
    login,
    register,
    logout,
    checkAuth,
    clearError,
  };
}
