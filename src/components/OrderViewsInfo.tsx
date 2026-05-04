"use client";

import { memo, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MoreHorizontal } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import type { OrderItem } from "@/schemas/orderItemsSchemas";
import {
  updateQuantity,
  updateStatus,
  CloseOrderById,
} from "@/app/admin/workspace/orders/[id]/actions";

type OrderItemRowProps = {
  item: OrderItem;
  unitPrice: number;
  isEditing: boolean;
  draftQuantity: number;
  isActionPending: boolean;
  onDeliver: (itemId: number) => void;
  onOpenQuantityEditor: (itemId: number, currentQuantity: number) => void;
  onCloseQuantityEditor: () => void;
  onDraftDecrease: () => void;
  onDraftIncrease: () => void;
  onAcceptQuantityChange: (
    itemId: number,
    currentQuantity: number,
    newQuantity: number,
  ) => void;
};

function sameOrderItem(a: OrderItem, b: OrderItem) {
  return (
    a.id === b.id &&
    a.itemId === b.itemId &&
    a.name === b.name &&
    a.cantidad === b.cantidad &&
    a.status === b.status &&
    a.totalAmount === b.totalAmount
  );
}

function mergeItemsPreserveReferences(prev: OrderItem[], next: OrderItem[]) {
  const prevMap = new Map(prev.map((item) => [item.id, item]));

  return next.map((nextItem) => {
    const prevItem = prevMap.get(nextItem.id);
    if (prevItem && sameOrderItem(prevItem, nextItem)) {
      return prevItem;
    }
    return nextItem;
  });
}

function getStatusLabel(status: OrderItem["status"]) {
  switch (status) {
    case "pending":
      return "PENDIENTE";
    case "cooked":
      return "LISTO";
    case "delivered":
      return "ENTREGADO";
    default:
      return status;
  }
}

function getStatusStyles(status: OrderItem["status"]) {
  switch (status) {
    case "pending":
      return "bg-yellow-100 text-yellow-800";
    case "cooked":
      return "bg-blue-100 text-blue-800";
    case "delivered":
      return "bg-green-100 text-green-800";
    default:
      return "bg-muted text-foreground";
  }
}
const OrderItemRow = memo(function OrderItemRow({
  item,
  unitPrice,
  isEditing,
  draftQuantity,
  isActionPending,
  onDeliver,
  onOpenQuantityEditor,
  onCloseQuantityEditor,
  onDraftDecrease,
  onDraftIncrease,
  onAcceptQuantityChange,
}: OrderItemRowProps) {
  const isDelivered = item.status === "delivered";
  const canEditQuantity = item.status === "pending";
  const canDeliver = item.status === "cooked";

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3",
        isDelivered && "bg-muted/40 opacity-75",
      )}
    >
      <div className="min-w-[120px] flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-muted-foreground">
          ${unitPrice.toFixed(2)} c/u
        </p>
        <p className="text-xs text-muted-foreground">
          Total ítem: ${Number(item.totalAmount ?? 0).toFixed(2)}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <span
          className={cn(
            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
            getStatusStyles(item.status),
          )}
        >
          {getStatusLabel(item.status)}
        </span>

        <span className="w-6 text-center text-sm font-medium">
          {item.cantidad}
        </span>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onDeliver(item.id)}
          disabled={!canDeliver || isActionPending}
        >
          Entregar
        </Button>

        <Popover
          open={isEditing}
          onOpenChange={(open) => {
            if (!open) {
              onCloseQuantityEditor();
              return;
            }
            if (canEditQuantity) {
              onOpenQuantityEditor(item.id, item.cantidad);
            }
          }}
        >
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label="Opciones de cantidad"
              disabled={!canEditQuantity || isActionPending}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>

          <PopoverContent className="w-auto p-2" align="end">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 rounded-full"
                  onClick={onDraftDecrease}
                  disabled={isActionPending || draftQuantity <= 0}
                >
                  -
                </Button>

                <span className="w-6 text-center text-sm font-medium">
                  {draftQuantity}
                </span>

                <Button
                  size="icon"
                  variant="outline"
                  className="h-7 w-7 rounded-full"
                  onClick={onDraftIncrease}
                  disabled={isActionPending}
                >
                  +
                </Button>
              </div>

              <Button
                size="sm"
                variant="default"
                onClick={() =>
                  onAcceptQuantityChange(item.id, item.cantidad, draftQuantity)
                }
                disabled={isActionPending || draftQuantity === item.cantidad}
              >
                Aceptar cambios
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
});

export default function OrderDetailClient({
  orderId,
  initialItems,
}: {
  orderId: number;
  initialItems: OrderItem[];
}) {
  const router = useRouter();

  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [draftQuantity, setDraftQuantity] = useState<number>(1);

  const [closingOrder, setClosingOrder] = useState(false);
  const [busyItemId, setBusyItemId] = useState<number | null>(null);
  const [closeDialogOpen, setCloseDialogOpen] = useState(false);

  const total = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.totalAmount ?? 0), 0),
    [items],
  );

  const getUnitPrice = useCallback((item: OrderItem) => {
    return item.cantidad > 0 ? Number(item.totalAmount) / item.cantidad : 0;
  }, []);

  const closeQuantityEditor = useCallback(() => {
    setEditingItemId(null);
  }, []);

  const openQuantityEditor = useCallback(
    (itemId: number, currentQuantity: number) => {
      setEditingItemId(itemId);
      setDraftQuantity(currentQuantity);
    },
    [],
  );

  const incrementDraft = useCallback(() => {
    setDraftQuantity((prev) => prev + 1);
  }, []);

  const decrementDraft = useCallback(() => {
    setDraftQuantity((prev) => Math.max(0, prev - 1));
  }, []);

  const acceptQuantityChange = useCallback(
    async (itemId: number, currentQuantity: number, newQuantity: number) => {
      const delta = newQuantity - currentQuantity;

      if (delta === 0) {
        closeQuantityEditor();
        return;
      }

      setBusyItemId(itemId);
      try {
        const formData = new FormData();
        formData.append("id", itemId.toString());
        formData.append("delta", delta.toString());
        formData.append("orderId", orderId.toString());

        const newItems = await updateQuantity(formData);
        setItems((prev) => mergeItemsPreserveReferences(prev, newItems));
        closeQuantityEditor();
      } catch (error) {
        toast.error("Error al actualizar la cantidad");
        console.error(error);
      } finally {
        setBusyItemId(null);
      }
    },
    [closeQuantityEditor, orderId],
  );

  const deliverItem = useCallback(
    async (itemId: number) => {
      setBusyItemId(itemId);
      try {
        const formData = new FormData();
        formData.append("id", itemId.toString());
        formData.append("status", "delivered");
        formData.append("orderId", orderId.toString());

        const newItems = await updateStatus(formData);
        setItems((prev) => mergeItemsPreserveReferences(prev, newItems));
      } catch (error) {
        toast.error("Error al marcar como entregado");
        console.error(error);
      } finally {
        setBusyItemId(null);
      }
    },
    [orderId],
  );

  const closeOrderAction = useCallback(async () => {
    setClosingOrder(true);
    try {
      const response = await CloseOrderById(orderId);

      if (!response.ok) {
        toast.error(response.message);
        return;
      }

      toast.success("Orden cerrada");
      setCloseDialogOpen(false);
      router.replace("/admin/workspace/orders");
      router.refresh();
    } catch (error) {
      toast.error("Error al procesar la petición");
      console.error(error);
    } finally {
      setClosingOrder(false);
    }
  }, [orderId, router]);

  const isAnyActionPending = closingOrder || busyItemId !== null;

  return (
    <main className="container mx-auto px-4 py-6 md:px-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Comanda</h1>
        <Link href="/admin/workspace/orders">
          <Button variant="outline" size="sm">
            ← Volver al panel
          </Button>
        </Link>
      </div>

      <Card className="mx-auto max-w-3xl">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardTitle className="text-3xl">Orden {orderId}</CardTitle>
            </div>

            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex justify-end gap-2">
  <Link href={`/admin/workspace/orders/${orderId}/new-items`}>
    <Button variant="outline" disabled={isAnyActionPending}>
      Agregar...
    </Button>
  </Link>

  <Button
    variant="destructive"
    disabled={isAnyActionPending}
    onClick={() => setCloseDialogOpen(true)}
  >
    Cerrar orden
  </Button>
</div>

          <div className="space-y-3">
            {items.map((item) => {
              const unitPrice = getUnitPrice(item);
              const isEditing = editingItemId === item.id;
              const isActionPending = busyItemId === item.id;

              return (
                <OrderItemRow
                  key={item.id}
                  item={item}
                  unitPrice={unitPrice}
                  isEditing={isEditing}
                  draftQuantity={isEditing ? draftQuantity : item.cantidad}
                  isActionPending={isActionPending}
                  onDeliver={deliverItem}
                  onOpenQuantityEditor={openQuantityEditor}
                  onCloseQuantityEditor={closeQuantityEditor}
                  onDraftDecrease={decrementDraft}
                  onDraftIncrease={incrementDraft}
                  onAcceptQuantityChange={acceptQuantityChange}
                />
              );
            })}

            {items.length === 0 && (
              <p className="py-6 text-center text-muted-foreground">
                No hay ítems en esta orden.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={closeDialogOpen} onOpenChange={setCloseDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar orden?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se marcará la orden como
              cerrada.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={closingOrder}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                closeOrderAction();
              }}
              disabled={closingOrder}
            >
              {closingOrder ? "Cerrando..." : "Cerrar orden"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  );
}