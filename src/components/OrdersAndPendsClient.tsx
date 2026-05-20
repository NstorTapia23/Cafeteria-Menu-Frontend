"use client";

import { useState } from "react";
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { OrdersCard } from "./commons/ordersCards";
import { NewOrderForm } from "./commons/newOrdersForm";
import { useAuth } from "@/hooks/useAuthContext";

interface OrderCardData {
  id: number;
  numberTable: number;
  status: "open" | "closed" | "canceled";
  workerName: string;
}

interface OrdersAndPendsClientProps {
  ordenesIniciales: OrderCardData[];
}

export default function OrdersAndPendsClient({
  ordenesIniciales,
}: OrdersAndPendsClientProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();

  const canCreateOrder = Boolean(user?.id);

  return (
    <main className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <header className="flex flex-col gap-3 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Órdenes</h1>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={() => setIsFormOpen(true)}
            disabled={!canCreateOrder}
            className={cn("gap-2", !canCreateOrder && "cursor-not-allowed opacity-70")}
            title={
              !canCreateOrder
                ? "Inicia sesión para crear una orden"
                : "Crear nueva orden"
            }
          >
            <Plus className="h-4 w-4" />
            Nueva Orden
          </Button>

          {!canCreateOrder && (
            <p className="text-xs sm:text-sm text-gray-500">
              Inicia sesión para crear una orden
            </p>
          )}
        </div>
      </header>

      <OrdersSection ordenes={ordenesIniciales} />

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nueva Orden</DialogTitle>
          </DialogHeader>

          {canCreateOrder && (
            <NewOrderForm
              workerId={Number(user!.id)}
              onSuccess={() => setIsFormOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}

const OrdersSection = React.memo(function OrdersSection({
  ordenes,
}: {
  ordenes: OrderCardData[];
}) {
  if (!ordenes.length) {
    return (
      <p className="text-center text-gray-500 py-12">
        No hay órdenes disponibles.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-3">
      {ordenes.map((orden) => {
        const { ...dataWithoutItems } = orden as OrderCardData & { items?: string[] };
        return <OrdersCard key={orden.id} data={dataWithoutItems} type="orden" />;
      })}
    </div>
  );
});