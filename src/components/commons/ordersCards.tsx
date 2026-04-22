"use client";

import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type OrderType = "orden" | "pendiente";

interface BaseOrder {
  id: number;
  numberTable: number;
}

interface Order extends BaseOrder {
  status: "open" | "closed" | "canceled";
  workerName: string;
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
  const router = useRouter();

  const handleCardClick = () => {
    if (type === "orden") {
      const orden = data as Order;
      router.push(`/admin/workspace/orders/${orden.id}`);
    }
  };
  if (type === "orden") {
    const orden = data as Order;

    const statusClasses: Record<Order["status"], string> = {
      open: "bg-yellow-100 text-yellow-800",
      closed: "bg-green-100 text-green-800",
      canceled: "bg-red-100 text-red-800",
    };

    const statusText: Record<Order["status"], string> = {
      open: "Abierta",
      closed: "Cerrada",
      canceled: "Cancelada",
    };

    return (
      <Card
        className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
        onClick={handleCardClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Mesa {orden.numberTable}</CardTitle>
            <CardDescription>#{orden.id}</CardDescription>
          </div>
          <CardDescription className="flex items-center gap-1 pt-1">
            👤 {orden.workerName}
          </CardDescription>
        </CardHeader>

        <CardFooter className="justify-end pt-0">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
              statusClasses[orden.status],
            )}
          >
            {statusText[orden.status]}
          </span>
        </CardFooter>
      </Card>
    );
  }

  // Renderizado para pendientes
  const pendiente = data as PendingProduct;
  return (
    <Card
      className="shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="flex items-center justify-between p-4">
        <div className="space-y-1">
          <p className="font-medium">{pendiente.producto}</p>
          <p className="text-sm text-muted-foreground">
            Mesa {pendiente.numberTable} · Cantidad: {pendiente.cantidad}
          </p>
        </div>
        <span className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-800">
          Listo para entregar
        </span>
      </CardContent>
    </Card>
  );
}
