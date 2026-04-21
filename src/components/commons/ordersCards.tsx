import { cn } from "@/lib/utils";

type OrderType = "orden" | "pendiente";

interface BaseOrder {
  id: number;
  numberTable: number;
}

interface Order extends BaseOrder {
  status: "open" | "closed" | "canceled";
  workerName: string;
  items?: string[]; // Opcional hasta que se implemente
}

interface PendingProduct extends BaseOrder {
  producto: string;
  cantidad: number;
}

type CardData = Order | PendingProduct;

interface OrdersCardProps {
  data: CardData;
  type: OrderType;
}

export function OrdersCard({ data, type }: OrdersCardProps) {
  if (type === "orden") {
    const orden = data as Order;
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold text-lg">Mesa {orden.numberTable}</h3>
          <span className="text-sm text-gray-500">#{orden.id}</span>
        </div>

        {/* Nombre del trabajador */}
        <p className="text-sm text-gray-600 mb-2">👤 {orden.workerName}</p>

        {/* Ítems (placeholder) */}
        {orden.items && orden.items.length > 0 ? (
          <ul className="list-disc list-inside text-gray-700 mb-3">
            {orden.items.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400 text-sm mb-3">Sin detalles de ítems</p>
        )}

        {/* Estado */}
        <div className="flex justify-end">
          <span
            className={cn(
              "text-xs px-2 py-1 rounded-full",
              orden.status === "open" && "bg-yellow-100 text-yellow-800",
              orden.status === "closed" && "bg-green-100 text-green-800",
              orden.status === "canceled" && "bg-red-100 text-red-800",
            )}
          >
            {orden.status === "open" && "Abierta"}
            {orden.status === "closed" && "Cerrada"}
            {orden.status === "canceled" && "Cancelada"}
          </span>
        </div>
      </div>
    );
  }

  // Renderizado para pendientes (sin cambios)
  const pendiente = data as PendingProduct;
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="font-medium text-gray-900">{pendiente.producto}</p>
        <p className="text-sm text-gray-500">
          Mesa {pendiente.numberTable} · Cantidad: {pendiente.cantidad}
        </p>
      </div>
      <span className="text-sm bg-orange-100 text-orange-800 px-3 py-1 rounded-full">
        Listo para entregar
      </span>
    </div>
  );
}
