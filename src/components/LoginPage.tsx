"use client";

import { useAuthContext } from "@/contexts/AuthContext";
import LoginForm from "@/components/commons/LoginForm";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuthContext();
  const { isAuthenticated, loading } = auth;

  // Redirige cuando el usuario ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      router.push("admin/workspace/system");
    }
  }, [isAuthenticated, router]);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
        }}
      >
        Cargando...
      </div>
    );
  }

  // Si no está autenticado y ya terminó de cargar, muestra el formulario
  return <LoginForm />;
}
