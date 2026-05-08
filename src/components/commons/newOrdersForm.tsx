"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateOrderSchema, type CreateOrderInput } from "@/schemas/ordersSchema";
import { createOrderAction } from "@/app/admin/workspace/orders/actions"; 

interface NewOrderFormProps {
  workerId: number;
  onSuccess?: () => void;
}

export function NewOrderForm({ workerId, onSuccess }: NewOrderFormProps) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CreateOrderInput>({
    resolver: zodResolver(CreateOrderSchema),
    defaultValues: {
      numberTable: undefined,
      workerId, 
    },
  });

  const onSubmit = async (data: CreateOrderInput) => {
    setServerError(null);

    const result = await createOrderAction(data);

    if (result.success) {
      reset({ numberTable: undefined, workerId });
      onSuccess?.();
      router.refresh();
    } else {
      setServerError(result.error || "Error al crear la orden");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Nueva Orden</h2>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="mb-4">
          <label
            htmlFor="numberTable"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Número de mesa
          </label>
          <input
            type="number"
            id="numberTable"
            min="1"
            max="20"
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2",
              errors.numberTable
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500",
            )}
            {...register("numberTable", { valueAsNumber: true })}
            disabled={isSubmitting}
          />
          {errors.numberTable && (
            <p className="mt-1 text-sm text-red-600">
              {errors.numberTable.message}
            </p>
          )}
        </div>
        {serverError && (
          <p className="mb-4 text-sm text-red-600">{serverError}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className={cn(
            "w-full py-2 px-4 rounded-md text-white font-medium transition-colors",
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700",
          )}
        >
          {isSubmitting ? "Creando..." : "Crear Orden"}
        </button>
      </form>
    </div>
  );
}