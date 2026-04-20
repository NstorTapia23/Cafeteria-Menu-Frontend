"use client";
import { useAuth } from "@/hooks/useAuth";
import LoginForm from "./commons/LoginForm";

export default function LoginPage() {
  const { isAuthenticated, loading } = useAuth();

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

  if (isAuthenticated) {
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
        Redirigiendo...
      </div>
    );
  }

  return <LoginForm />;
}
