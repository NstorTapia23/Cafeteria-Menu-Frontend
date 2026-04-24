"use client";

import { useState } from "react";
import type React from "react";

import { cn } from "@/lib/utils";
import { OrdersCard } from "./commons/ordersCards";
import { NewOrderForm } from "./commons/newOrdersForm";
import { useAuth } from "@/hooks/useAuthContext";
import type { orderItemStatusType } from "@/repositories/orderItems";

interface OrderCardData {
  id: number;
  numberTable: number;
  status: "open" | "closed" | "canceled";
  workerName: string;
  items?: string[];
}

interface PendingProductCardData {
  orderId: number;
  itemName: string;
  quantity: number;
  numberTable: number;
  status: orderItemStatusType;
}

interface OrdersAndPendsClientProps {
  ordenesIniciales: OrderCardData[];
  pendientesIniciales: PendingProductCardData[];
}

type TabType = "ordenes" | "pendientes" | "nueva";

export default function OrdersAndPendsClient({
  ordenesIniciales,
  pendientesIniciales,
}: OrdersAndPendsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ordenes");
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <nav className="flex gap-2 border-b border-gray-200 pb-3">
        <TabButton
          active={activeTab === "ordenes"}
          onClick={() => setActiveTab("ordenes")}
        >
          Órdenes
        </TabButton>

        <TabButton
          active={activeTab === "pendientes"}
          onClick={() => setActiveTab("pendientes")}
        >
          Pendientes
        </TabButton>

        <TabButton
          active={activeTab === "nueva"}
          onClick={() => setActiveTab("nueva")}
        >
          Nueva Orden
        </TabButton>
      </nav>

      <section className="mt-6">
        {activeTab === "ordenes" && (
          <OrdersSection ordenes={ordenesIniciales} />
        )}

        {activeTab === "pendientes" && (
          <PendingSection pendientes={pendientesIniciales} />
        )}

        {activeTab === "nueva" && user?.id && (
          <NewOrderForm
            workerId={Number(user.id)}
            onSuccess={() => setActiveTab("ordenes")}
          />
        )}

        {activeTab === "nueva" && !user?.id && (
          <p className="text-center text-gray-500">
            Debes iniciar sesión para crear una orden.
          </p>
        )}
      </section>
    </main>
  );
}

function OrdersSection({ ordenes }: { ordenes: OrderCardData[] }) {
  if (!ordenes.length) {
    return (
      <p className="text-center text-gray-500">No hay órdenes disponibles.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ordenes.map((orden) => (
        <OrdersCard key={orden.id} data={orden} type="orden" />
      ))}
    </div>
  );
}

function PendingSection({
  pendientes,
}: {
  pendientes: PendingProductCardData[];
}) {
  if (!pendientes.length) {
    return (
      <p className="text-center text-gray-500">No hay productos pendientes.</p>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {pendientes.map((pendiente) => (
        <PendingProductCard
          key={`${pendiente.orderId}-${pendiente.itemName}`}
          pendiente={pendiente}
        />
      ))}
    </div>
  );
}

function PendingProductCard({
  pendiente,
}: {
  pendiente: PendingProductCardData;
}) {
  const statusStyles: Record<orderItemStatusType, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    cooked: "bg-green-100 text-green-800",
    delivered: "bg-blue-100 text-blue-800",
    canceled: "bg-red-100 text-red-800",
  } as Record<orderItemStatusType, string>;

  return (
    <article className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-500">
            Mesa {pendiente.numberTable}
          </p>
          <h3 className="text-lg font-semibold text-gray-900">
            {pendiente.itemName}
          </h3>
        </div>

        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-medium capitalize",
            statusStyles[pendiente.status] ?? "bg-gray-100 text-gray-700",
          )}
        >
          {pendiente.status}
        </span>
      </div>

      <div className="space-y-1 text-sm text-gray-600">
        <p>
          Cantidad: <span className="font-semibold">{pendiente.quantity}</span>
        </p>
        <p>
          Orden: <span className="font-semibold">#{pendiente.orderId}</span>
        </p>
      </div>
    </article>
  );
}

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

function TabButton({ active, onClick, children }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-md px-6 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      {children}
    </button>
  );
}
