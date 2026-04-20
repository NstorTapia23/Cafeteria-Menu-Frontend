// src/components/RegisterForm.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuthContext } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { UserRole, ROLE_OPTIONS } from "@/types/roles";

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
import { registerSchema } from "@/schemas/registerSchema";
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm() {
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const auth = useAuthContext();
  const { register: registerUser, loading, error, clearError } = auth;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      password: "",
      confirmPassword: "",
      role: UserRole.DEPENDIENTE,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    clearError();
    const result = await registerUser(data.name, data.password, data.role);
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
      <div className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8 bg-linear-to-br from-slate-100 via-slate-50 to-white">
        <Card className="relative w-full max-w-md border-0 shadow-2xl shadow-slate-300/50 rounded-3xl backdrop-blur-sm bg-white/95">
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
        "relative min-h-screen flex items-center justify-center overflow-hidden px-4 sm:px-6 lg:px-8",
        "bg-linear-to-br from-slate-100 via-slate-50 to-white",
      )}
    >
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
            Crear trabajador
          </CardTitle>
          <CardDescription className={cn("text-base text-slate-500")}>
            Completa los datos para registrar al trabajador
          </CardDescription>
        </CardHeader>

        <CardContent className={cn("px-8 pb-10")}>
          <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-6")}>
            <div className={cn("space-y-2")}>
              <Label
                htmlFor="name"
                className={cn("text-sm font-medium text-slate-700")}
              >
                Nombre del trabajador
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="ej. juanperez"
                className={inputClassName}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                placeholder="••••••••"
                className={inputClassName}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className={cn("space-y-2")}>
              <Label
                htmlFor="confirmPassword"
                className={cn("text-sm font-medium text-slate-700")}
              >
                Confirmar contraseña
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="••••••••"
                className={inputClassName}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className={cn("space-y-2")}>
              <Label
                htmlFor="role"
                className={cn("text-sm font-medium text-slate-700")}
              >
                Rol
              </Label>
              <select
                id="role"
                className={cn(
                  inputClassName,
                  "appearance-none bg-no-repeat bg-right pr-10",
                  "bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM0NzU1NjkiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cG9seWxpbmUgcG9pbnRzPSI2IDkgMTIgMTUgMTggOSI+PC9wb2x5bGluZT48L3N2Zz4=')]",
                )}
                {...register("role")}
              >
                {ROLE_OPTIONS.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              {errors.role && (
                <p className="text-sm text-red-600 animate-in slide-in-from-top-1 fade-in-0">
                  {errors.role.message}
                </p>
              )}
            </div>

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
                  Generando Trabajador...
                </span>
              ) : (
                "Registrarse"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
