"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { OrdersCard } from "./commons/ordersCards";
import { NewOrderForm } from "./commons/newOrdersForm";
import { useAuth } from "@/hooks/useAuthContext";

interface Order {
  id: number;
  numberTable: number;
  status: "open" | "closed" | "canceled";
  workerName: string;
  items?: string[];
}

interface PendingProduct {
  id: number;
  producto: string;
  cantidad: number;
  numberTable: number;
}

interface OrdersAndPendsClientProps {
  ordenesIniciales: Order[];
  pendientesIniciales: PendingProduct[];
}

type TabType = "ordenes" | "pendientes" | "nueva";

export default function OrdersAndPendsClient({
  ordenesIniciales,
  pendientesIniciales,
}: OrdersAndPendsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>("ordenes");
  const { user } = useAuth(); // Obtiene el ID del trabajador logueado

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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ordenesIniciales.map((orden) => (
              <OrdersCard key={orden.id} data={orden} type="orden" />
            ))}
          </div>
        )}

        {activeTab === "pendientes" && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {pendientesIniciales.map((pendiente) => (
              <OrdersCard
                key={pendiente.id}
                data={pendiente}
                type="pendiente"
              />
            ))}
          </div>
        )}

        {activeTab === "nueva" && user?.id && (
          <NewOrderForm
            workerId={parseInt(user.id)}
            onSuccess={() => setActiveTab("ordenes")} // Vuelve a órdenes tras crear
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
        "px-6 py-2 text-sm font-medium rounded-md transition-colors",
        active
          ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      )}
    >
      {children}
    </button>
  );
}
