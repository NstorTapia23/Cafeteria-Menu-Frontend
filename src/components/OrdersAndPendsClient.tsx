"use client";

import { useState } from "react";
import  React from "react";

import { cn } from "@/lib/utils";
import { OrdersCard } from "./commons/ordersCards";
import { NewOrderForm } from "./commons/newOrdersForm";
import { useAuth } from "@/hooks/useAuthContext";

interface OrderCardData {
  id: number;
  numberTable: number;
  status: "open" | "closed" | "canceled";
  workerName: string;
  items?: string[];
}

interface OrdersAndPendsClientProps {
  ordenesIniciales: OrderCardData[];
}

type TabType = "ordenes" | "nueva";

export default function OrdersAndPendsClient({
  ordenesIniciales,
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
const OrdersSection = React.memo(function OrdersSection({ ordenes }: { ordenes: OrderCardData[] }) {
  if (!ordenes.length) {
    return <p className="text-center text-gray-500">No hay órdenes disponibles.</p>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ordenes.map((orden) => (
        <OrdersCard key={orden.id} data={orden} type="orden" />
      ))}
    </div>
  );
});

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}


const TabButton = React.memo(function TabButton({ active, onClick, children }: TabButtonProps) {
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
});
