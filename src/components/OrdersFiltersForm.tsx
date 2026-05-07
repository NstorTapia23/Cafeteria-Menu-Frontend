// components/OrdersFilterForm.tsx
"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { z } from "zod";
import {
  getOrdersByDateRange,
  type OrdersFilterInput,
} from "@/app/admin/workspace/dashboard/metrics/actions";
import { useState } from "react";
import {
  CalendarRange,
  Filter,
  Loader2,
  Search,
  Table2,
  UserRound,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const formSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  status: z.enum(["open", "closed", "canceled", "all"]).optional(),
});

type FormValues = z.infer<typeof formSchema>;

function getLocalDateString(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getUserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

export default function OrdersFilterForm() {
  const [results, setResults] =
    useState<Awaited<ReturnType<typeof getOrdersByDateRange>>>([]);

  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: getLocalDateString(),
      endDate: getLocalDateString(),
      status: "all",
    },
  });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);

    try {
      const input: OrdersFilterInput = {
        ...data,
        timezone: getUserTimezone(),
      };

      const orders = await getOrdersByDateRange(input);

      setResults(orders);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-4 md:p-6">
      {/* FORMULARIO */}
      <Card className="border border-zinc-200 bg-white/95 shadow-sm shadow-zinc-200/50 backdrop-blur-sm">
        <CardHeader className="border-b border-zinc-100 pb-4">
          <CardTitle className="flex items-center gap-2 text-2xl font-semibold tracking-tight text-zinc-900">
            <Filter className="h-5 w-5 text-zinc-700" />
            Filtrar Órdenes
          </CardTitle>
        </CardHeader>

        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* FECHAS */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="startDate"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                >
                  <CalendarRange className="h-4 w-4 text-zinc-500" />
                  Fecha inicio
                </Label>

                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  className="h-11 border-zinc-300 bg-white text-zinc-900 shadow-sm focus-visible:ring-zinc-900"
                />

                {errors.startDate && (
                  <p className="text-xs text-zinc-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="endDate"
                  className="flex items-center gap-2 text-sm font-medium text-zinc-700"
                >
                  <CalendarRange className="h-4 w-4 text-zinc-500" />
                  Fecha fin
                </Label>

                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  className="h-11 border-zinc-300 bg-white text-zinc-900 shadow-sm focus-visible:ring-zinc-900"
                />

                {errors.endDate && (
                  <p className="text-xs text-zinc-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            {/* ESTADO */}
            <div className="w-full space-y-2 sm:w-56">
              <Label
                htmlFor="status"
                className="flex items-center gap-2 text-sm font-medium text-zinc-700"
              >
                <Filter className="h-4 w-4 text-zinc-500" />
                Estado
              </Label>

              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id="status"
                      className="h-11 border-zinc-300 bg-white text-zinc-900 shadow-sm focus:ring-zinc-900"
                    >
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Abierta</SelectItem>
                      <SelectItem value="closed">Cerrada</SelectItem>
                      <SelectItem value="canceled">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* BOTÓN */}
            <Button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center gap-2 bg-zinc-900 text-white shadow-sm transition hover:bg-zinc-800 sm:w-auto"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Filtrar
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* LOADING */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Cargando órdenes...
        </div>
      )}

      {/* RESULTADOS */}
      {!loading && results.length > 0 && (
        <Card className="border border-zinc-200 bg-white/95 shadow-sm shadow-zinc-200/50 backdrop-blur-sm">
          <CardHeader className="border-b border-zinc-100 pb-3">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-zinc-900">
              <Table2 className="h-5 w-5 text-zinc-700" />
              Órdenes encontradas ({results.length})
            </CardTitle>
          </CardHeader>

          <CardContent className="pt-5">
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow className="hover:bg-zinc-50">
                    <TableHead className="text-zinc-700">
                      Mesa
                    </TableHead>

                    <TableHead className="text-zinc-700">
                      Estado
                    </TableHead>

                    <TableHead className="text-zinc-700">
                      Creado
                    </TableHead>

                    <TableHead className="text-zinc-700">
                      Cerrado
                    </TableHead>

                    <TableHead className="text-zinc-700">
                      Empleado
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {results.map((order) => (
                    <TableRow
                      key={order.id}
                      onClick={() =>
                        router.push(`/admin/workspace/orders/${order.id}`)
                      }
                      className="cursor-pointer transition-all hover:bg-zinc-50 active:scale-[0.998]"
                    >
                      <TableCell className="text-zinc-700">
                        {order.numberTable}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                            order.status === "open"
                              ? "bg-zinc-100 text-zinc-800 ring-zinc-200"
                              : order.status === "closed"
                              ? "bg-zinc-50 text-zinc-700 ring-zinc-200"
                              : "bg-zinc-200 text-zinc-800 ring-zinc-300"
                          }`}
                        >
                          {order.status}
                        </span>
                      </TableCell>

                      <TableCell className="text-zinc-700">
                        {order.createdAt}
                      </TableCell>

                      <TableCell className="text-zinc-700">
                        {order.closedAt ?? "—"}
                      </TableCell>

                      <TableCell className="flex items-center gap-2 text-zinc-700">
                        <UserRound className="h-4 w-4 text-zinc-500" />
                        {order.workerName}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* SIN RESULTADOS */}
      {!loading && results.length === 0 && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 text-center text-sm text-zinc-600 shadow-sm">
          No se encontraron órdenes para este período.
        </div>
      )}
    </div>
  );
}