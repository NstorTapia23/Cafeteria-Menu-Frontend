"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { createOrder } from "@/app/admin/workspace/orders/actions";

interface NewOrderFormProps {
  workerId: number;
  onSuccess?: () => void;
}

export function NewOrderForm({ workerId, onSuccess }: NewOrderFormProps) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [numberTable, setNumberTable] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    const formData = new FormData();
    formData.append("numberTable", numberTable);
    formData.append("workerId", workerId.toString());

    const result = await createOrder(formData);

    if (result.success) {
      setNumberTable("");
      onSuccess?.();
      router.refresh(); // Actualiza la lista de órdenes
    } else {
      setError(result.error || "Error al crear la orden");
    }
    setIsPending(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-6">Nueva Orden</h2>

      <form onSubmit={handleSubmit}>
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
            name="numberTable"
            min="1"
            max="20"
            required
            value={numberTable}
            onChange={(e) => setNumberTable(e.target.value)}
            className={cn(
              "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2",
              error
                ? "border-red-300 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-500",
            )}
            disabled={isPending}
          />
        </div>

        {/* workerId oculto */}
        <input type="hidden" name="workerId" value={workerId} />

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className={cn(
            "w-full py-2 px-4 rounded-md text-white font-medium transition-colors",
            isPending
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700",
          )}
        >
          {isPending ? "Creando..." : "Crear Orden"}
        </button>
      </form>
    </div>
  );
}
