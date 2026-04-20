// src/components/LoginForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils"; // 👈 Importa tu función cn

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
import { Loader2 } from "lucide-react";

export default function LoginForm() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");

  const router = useRouter();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin/system");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    const result = await login(name, password);

    if (result.success) {
      router.push("/admin/system");
    }
  };

  // Clases comunes para los inputs
  const inputClassName = cn(
    "h-12 rounded-xl border-slate-200 bg-slate-50/80 px-4 text-base shadow-inner",
    "placeholder:text-slate-400",
    "transition-all duration-200",
    "hover:border-slate-300",
    "focus:border-slate-900 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-slate-900/5",
  );

  return (
    <div
      className={cn(
        "relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8",
        "bg-gradient-to-br from-slate-100 via-slate-50 to-white",
      )}
    >
      {/* Patrón de fondo sutil */}
      <div
        className={cn(
          "absolute inset-0 bg-[url('/grid.svg')] bg-center",
          "[mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]",
        )}
      />

      <Card
        className={cn(
          "relative w-full max-w-md border-0 shadow-2xl shadow-slate-300/50 rounded-3xl",
          "backdrop-blur-sm bg-white/95",
          "transition-all duration-300",
        )}
      >
        <CardHeader className={cn("space-y-3 text-center pt-10 pb-2")}>
          <CardTitle
            className={cn("text-4xl font-bold tracking-tight text-slate-900")}
          >
            Iniciar sesión
          </CardTitle>
          <CardDescription className={cn("text-base text-slate-500")}>
            Accede con tu usuario y contraseña
          </CardDescription>
        </CardHeader>

        <CardContent className={cn("px-8 pb-10")}>
          <form onSubmit={handleSubmit} className={cn("space-y-6")}>
            {/* Campo: nombre de usuario */}
            <div className={cn("space-y-2")}>
              <Label
                htmlFor="name"
                className={cn("text-sm font-medium text-slate-700")}
              >
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
                placeholder="ej. admin"
                className={inputClassName}
              />
            </div>

            {/* Campo: contraseña */}
            <div className={cn("space-y-2")}>
              <Label
                htmlFor="password"
                className={cn("text-sm font-medium text-slate-700")}
              >
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
                placeholder="••••••••"
                className={inputClassName}
              />
            </div>

            {/* Mensaje de error con animación */}
            {error && (
              <div
                className={cn(
                  "animate-in slide-in-from-top-2 fade-in-0 duration-300",
                  "rounded-xl border border-red-100 bg-red-50/90 px-4 py-3",
                  "text-sm font-medium text-red-700 shadow-sm backdrop-blur-sm",
                )}
              >
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className={cn(
                "relative h-12 w-full rounded-xl text-base font-medium text-white",
                "bg-gradient-to-r from-slate-800 to-slate-900",
                "shadow-lg shadow-slate-400/30",
                "transition-all duration-300",
                "hover:from-slate-900 hover:to-black hover:shadow-slate-500/40",
                "focus-visible:ring-4 focus-visible:ring-slate-400",
                "disabled:cursor-not-allowed disabled:opacity-70",
              )}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Verificando credenciales...
                </span>
              ) : (
                "Iniciar sesión"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
