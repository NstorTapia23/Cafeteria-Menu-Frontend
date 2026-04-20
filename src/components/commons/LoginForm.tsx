// src/components/LoginForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/useAuthContext";
import { cn } from "@/lib/utils";

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

const loginSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(255, "El nombre no puede exceder 255 caracteres"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(255, "La contraseña no puede exceder 255 caracteres"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { login, loading, error, clearError, isAuthenticated } = useAuth();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && isAuthenticated) {
      router.push("/admin/system");
    }
  }, [mounted, isAuthenticated, router]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      name: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    clearError();
    const result = await login(data.name, data.password);
    if (result.success) {
      router.push("/admin/system");
    }
  };

  const inputClassName = cn(
    "h-12 rounded-xl border-slate-200 bg-slate-50/80 px-4 text-base shadow-inner",
    "placeholder:text-slate-400",
    "transition-all duration-200",
    "hover:border-slate-300",
    "focus:border-slate-900 focus:bg-white focus:shadow-md focus:ring-4 focus:ring-slate-900/5",
  );

  if (!mounted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-linear-to-br from-slate-100 via-slate-50 to-white px-4 sm:px-6 lg:px-8">
        <Card className="relative w-full max-w-md rounded-3xl border-0 bg-white/95 shadow-2xl shadow-slate-300/50 backdrop-blur-sm">
          <CardContent className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative flex min-h-screen items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8",
        "bg-linear-to-br from-slate-100 via-slate-50 to-white",
      )}
    >
      <Card
        className={cn(
          "relative w-full max-w-md rounded-3xl border-0 bg-white/95 shadow-2xl shadow-slate-300/50 backdrop-blur-sm",
          "transition-all duration-300",
        )}
      >
        <CardHeader className={cn("space-y-3 pb-2 pt-10 text-center")}>
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
          <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6")}>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-slate-700"
                  >
                    Nombre de usuario
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="ej. admin"
                    className={inputClassName}
                    {...field}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                      {errors.name.message}
                    </p>
                  )}
                </div>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field }) => (
                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-slate-700"
                  >
                    Contraseña
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={inputClassName}
                    {...field}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                      {errors.password.message}
                    </p>
                  )}
                </div>
              )}
            />

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
                "bg-linear-to-r from-slate-800 to-slate-900",
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
