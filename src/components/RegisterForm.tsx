// src/components/RegisterForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthContext";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Role = "dependiente" | "bartender" | "cocinero" | "admin" | "superadmin";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("dependiente");
  const [passwordError, setPasswordError] = useState("");

  const router = useRouter();
  const { register, loading, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/system");
    }
  }, [isAuthenticated, router]);

  const validatePasswords = () => {
    if (password.length < 6) {
      setPasswordError("La contraseña debe tener al menos 6 caracteres");
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden");
      return false;
    }

    setPasswordError("");
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setPasswordError("");

    if (!validatePasswords()) return;

    const result = await register(name, password, role);

    if (result.success) {
      router.push("/admin/system");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4">
      <Card className="w-full max-w-md border-slate-200 shadow-xl rounded-2xl">
        <CardHeader className="space-y-2 text-center pt-8">
          <CardTitle className="text-3xl font-bold text-slate-900">
            Crear cuenta
          </CardTitle>
          <CardDescription className="text-slate-500">
            Completa los datos para registrarte
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700">
                Nombre de usuario
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={3}
                maxLength={255}
                placeholder="Ingresa tu nombre de usuario"
                className="h-11 rounded-xl border-slate-300 bg-white focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                maxLength={255}
                placeholder="Ingresa tu contraseña"
                className="h-11 rounded-xl border-slate-300 bg-white focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-slate-700">
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                maxLength={255}
                placeholder="Confirma tu contraseña"
                className="h-11 rounded-xl border-slate-300 bg-white focus-visible:ring-slate-900"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-slate-700">
                Rol
              </Label>
              <select
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="dependiente">Dependiente</option>
                <option value="bartender">Bartender</option>
                <option value="cocinero">Cocinero</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
              </select>
            </div>

            {(error || passwordError) && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error || passwordError}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-xl bg-slate-900 text-white hover:bg-slate-800"
            >
              {loading ? "Procesando..." : "Registrarse"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
