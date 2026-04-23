"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import type { OrderItem } from "@/schemas/orderItemsSchemas";
import {
  updateQuantity,
  updateStatus,
  addItem,
} from "@/app/admin/workspace/orders/[id]/actions";

interface MenuItem {
  id: number;
  name: string;
  price: number;
}

export default function OrderDetailClient({
  orderId,
  initialItems,
  menuItems,
}: {
  orderId: number;
  initialItems: OrderItem[];
  menuItems: MenuItem[];
}) {
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [selectedMenuItemId, setSelectedMenuItemId] = useState<string>(
    menuItems[0]?.id.toString() ?? "",
  );
  const [editingItemId, setEditingItemId] = useState<number | null>(null);
  const [draftQuantity, setDraftQuantity] = useState<number>(1);
  const [isPending, startTransition] = useTransition();

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.totalAmount, 0),
    [items],
  );

  const getUnitPrice = (item: OrderItem) =>
    item.cantidad > 0 ? item.totalAmount / item.cantidad : 0;

  const openQuantityEditor = (item: OrderItem) => {
    if (item.status !== "pending") return;
    setEditingItemId(item.id);
    setDraftQuantity(item.cantidad);
  };

  const closeQuantityEditor = () => setEditingItemId(null);

  const incrementDraft = () => setDraftQuantity((prev) => prev + 1);

  const decrementDraft = () =>
    setDraftQuantity((prev) => Math.max(0, prev - 1));
  const acceptQuantityChange = (itemId: number, newQuantity: number) => {
    const currentItem = items.find((i) => i.id === itemId);
    if (!currentItem) return;
    const delta = newQuantity - currentItem.cantidad;
    if (delta === 0) {
      closeQuantityEditor();
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("id", itemId.toString());
      formData.append("delta", delta.toString()); // <-- enviar delta
      formData.append("orderId", orderId.toString());
      const newItems = await updateQuantity(formData);
      setItems(newItems);
      closeQuantityEditor();
    });
  };

  const deliverItem = (itemId: number) => {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("id", itemId.toString());
        formData.append("status", "delivered");
        formData.append("orderId", orderId.toString());

        const newItems = await updateStatus(formData);
        setItems(newItems);
      } catch (error) {
        toast.error("Error al marcar como entregado");
        console.error(error);
      }
    });
  };

  const addItemHandler = () => {
    const selectedId = parseInt(selectedMenuItemId);
    const menuItem = menuItems.find((i) => i.id === selectedId);
    if (!menuItem) return;

    const existingItem = items.find(
      (i) => i.itemId === selectedId && i.status === "pending",
    );

    if (existingItem) {
      acceptQuantityChange(existingItem.id, 1);
    } else {
      startTransition(async () => {
        try {
          const formData = new FormData();
          formData.append("orderId", orderId.toString());
          formData.append("itemId", selectedId.toString());

          const newItems = await addItem(formData);
          setItems(newItems);
        } catch (error) {
          toast.error("Error al agregar item");
          console.error(error);
        }
      });
    }
  };

  return (
    <main className="container mx-auto py-6 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Comanda</h1>
        <Link href="/admin/workspace/orders">
          <Button variant="outline" size="sm">
            ← Volver al panel
          </Button>
        </Link>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <CardTitle className="text-3xl">Orden {orderId}</CardTitle>
              <p className="text-muted-foreground mt-1">Mesa 3</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">${total.toFixed(2)}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-3 items-end p-4 bg-muted/30 rounded-lg">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1 block">
                Agregar Items
              </label>
              <Select
                value={selectedMenuItemId}
                onValueChange={setSelectedMenuItemId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems.map((item) => (
                    <SelectItem key={item.id} value={item.id.toString()}>
                      {item.name} - ${item.price.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={addItemHandler} disabled={isPending}>
              + Agregar
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const unitPrice = getUnitPrice(item);
              const isEditing = editingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className={cn(
                    "flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg border",
                    item.status === "delivered" && "bg-muted/40 opacity-75",
                  )}
                >
                  <div className="min-w-[120px] flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      ${unitPrice.toFixed(2)} c/u
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Total ítem: ${item.totalAmount.toFixed(2)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                        item.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800",
                      )}
                    >
                      {item.status === "pending" ? "PENDIENTE" : "ENTREGADO"}
                    </span>

                    <span className="text-sm font-medium w-6 text-center">
                      {item.cantidad}
                    </span>

                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => deliverItem(item.id)}
                      disabled={item.status !== "pending" || isPending}
                    >
                      Entregar
                    </Button>

                    <Popover
                      open={isEditing}
                      onOpenChange={(open) => {
                        if (!open) closeQuantityEditor();
                        else openQuantityEditor(item);
                      }}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          aria-label="Opciones de cantidad"
                          disabled={item.status !== "pending" || isPending}
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
                              onClick={decrementDraft}
                              disabled={isPending}
                            >
                              -
                            </Button>
                            <span className="text-sm font-medium w-6 text-center">
                              {draftQuantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7 rounded-full"
                              onClick={incrementDraft}
                              disabled={isPending}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() =>
                              acceptQuantityChange(item.id, draftQuantity)
                            }
                            disabled={isPending}
                          >
                            Aceptar cambios
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })}

            {items.length === 0 && (
              <p className="text-center text-muted-foreground py-6">
                No hay ítems en esta orden. Usa el menú para agregar.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
