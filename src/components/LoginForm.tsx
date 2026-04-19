"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthContext";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const router = useRouter();

  const { login, register, loading, error, clearError, isAuthenticated } =
    useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      console.log({ isAuthenticated, loading });
    }
  }, [isAuthenticated, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = isRegister
      ? await register(name, password)
      : await login(name, password);

    if (result.success) {
      // Redirección automática al dashboard
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    clearError();
    setName("");
    setPassword("");
  };

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
        {isRegister ? "Registrarse" : "Iniciar Sesión"}
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "15px" }}
      >
        <div>
          <label
            htmlFor="name"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Usuario:
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingrese su usuario"
            minLength={3}
            maxLength={255}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            style={{
              display: "block",
              marginBottom: "5px",
              fontWeight: "bold",
            }}
          >
            Contraseña:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingrese su contraseña"
            minLength={6}
            maxLength={255}
            required
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        {error && (
          <div
            style={{
              color: "#d32f2f",
              backgroundColor: "#ffebee",
              padding: "10px",
              borderRadius: "4px",
              fontSize: "14px",
              border: "1px solid #ffcdd2",
            }}
          >
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: "12px",
            backgroundColor: loading ? "#ccc" : "#1976d2",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s",
          }}
        >
          {loading
            ? "Procesando..."
            : isRegister
              ? "Registrarse"
              : "Iniciar Sesión"}
        </button>
      </form>

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          type="button"
          onClick={toggleMode}
          style={{
            background: "none",
            border: "none",
            color: "#1976d2",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "14px",
          }}
        >
          {isRegister
            ? "¿Ya tienes cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "#f5f5f5",
          borderRadius: "4px",
          fontSize: "12px",
          color: "#666",
        }}
      >
        <strong>Requisitos:</strong>
        <br />
        - Usuario: mínimo 3 caracteres
        <br />
        - Contraseña: mínimo 6 caracteres
        <br />- Rol por defecto: dependiente
      </div>
    </div>
  );
}
