// app/dashboard/page.tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils"; // función típica de shadcn/ui

// Datos de ejemplo (podrían venir de una API o server component)
const ordenesAbiertas = [
  { id: 1, mesa: 5, items: ["Hamburguesa", "Papas"], estado: "En cocina" },
  { id: 2, mesa: 3, items: ["Pizza", "Ensalada"], estado: "Listo para servir" },
  { id: 3, mesa: 8, items: ["Sushi", "Gaseosa"], estado: "En preparación" },
];

const productosPendientes = [
  { id: 101, producto: "Hamburguesa", cantidad: 2, mesa: 5 },
  { id: 102, producto: "Pizza", cantidad: 1, mesa: 3 },
  { id: 103, producto: "Sushi", cantidad: 1, mesa: 8 },
];

export default function OrdersAndPendsPage() {
  const [activeTab, setActiveTab] = useState<"ordenes" | "pendientes">(
    "ordenes",
  );

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
      </nav>

      {/* Contenido dinámico */}
      <section className="mt-6">
        {activeTab === "ordenes" ? (
          <OrdenesList ordenes={ordenesAbiertas} />
        ) : (
          <PendientesList productos={productosPendientes} />
        )}
      </section>
    </main>
  );
}

// Componente de botón para las pestañas
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

// Componente para mostrar órdenes
function OrdenesList({ ordenes }: { ordenes: typeof ordenesAbiertas }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {ordenes.map((orden) => (
        <div
          key={orden.id}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-lg">Mesa {orden.mesa}</h3>
            <span className="text-sm text-gray-500">#{orden.id}</span>
          </div>
          <ul className="list-disc list-inside text-gray-700 mb-3">
            {orden.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
          <div className="flex justify-end">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full",
                orden.estado === "Listo para servir" &&
                  "bg-green-100 text-green-800",
                orden.estado === "En cocina" && "bg-yellow-100 text-yellow-800",
                orden.estado === "En preparación" &&
                  "bg-blue-100 text-blue-800",
              )}
            >
              {orden.estado}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Componente para mostrar productos pendientes
function PendientesList({
  productos,
}: {
  productos: typeof productosPendientes;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {productos.map((prod) => (
        <div
          key={prod.id}
          className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-gray-900">{prod.producto}</p>
            <p className="text-sm text-gray-500">
              Mesa {prod.mesa} · Cantidad: {prod.cantidad}
            </p>
          </div>
          <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
            Listo para entregar
          </span>
        </div>
      ))}
    </div>
  );
}
