"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Minus, Plus, ArrowLeft } from "lucide-react";
import { addItemsBatch } from "@/app/admin/workspace/orders/[id]/new-items/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Category = {
  id: number;
  name: string;
};

type MenuItem = {
  id: number;
  name: string;
  price: number;
  categoryId: number;
};

type OrderItemsPickerProps = {
  orderId: number;
  categories: Category[];
  menuItems: MenuItem[];
};

export function OrderItemsPicker({
  orderId,
  categories,
  menuItems,
}: OrderItemsPickerProps) {
  const router = useRouter();
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | "all">(
    "all"
  );
  const [quantities, setQuantities] = useState<Record<number, number>>({});
  const [isPending, startTransition] = useTransition();

  const filteredItems = useMemo(() => {
    if (selectedCategoryId === "all") return menuItems;
    return menuItems.filter((item) => item.categoryId === selectedCategoryId);
  }, [menuItems, selectedCategoryId]);

  const totalSelected = useMemo(() => {
    return Object.values(quantities).reduce((acc, value) => acc + value, 0);
  }, [quantities]);

  function incrementQuantity(itemId: number) {
    setQuantities((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] ?? 0) + 1,
    }));
  }

  function decrementQuantity(itemId: number) {
    setQuantities((prev) => {
      const current = prev[itemId] ?? 0;

      if (current <= 1) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }

      return {
        ...prev,
        [itemId]: current - 1,
      };
    });
  }

  function handleSubmit() {
    const payload = Object.entries(quantities)
      .filter(([, quantity]) => quantity > 0)
      .map(([itemId, quantity]) => ({
        itemId: Number(itemId),
        quantity,
      }));

    if (payload.length === 0) {
      toast.error("Selecciona al menos un item");
      return;
    }

    startTransition(async () => {
      try {
        await addItemsBatch(orderId, payload);

        toast.success("Items agregados correctamente");
        setQuantities({});
        router.refresh();
        router.push(`/admin/workspace/orders/${orderId}`);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudieron agregar los items";

        toast.error(message);
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Agregar items a la orden #{orderId}
          </h1>
          <p className="text-sm text-muted-foreground">
            Filtra por categoría, selecciona cantidades y confirma el agregado.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/admin/workspace/orders/${orderId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategoryId === "all" ? "default" : "outline"}
          onClick={() => setSelectedCategoryId("all")}
        >
          Todos
        </Button>

        {categories.map((category) => (
          <Button
            key={category.id}
            variant={
              selectedCategoryId === category.id ? "default" : "outline"
            }
            onClick={() => setSelectedCategoryId(category.id)}
          >
            {category.name}
          </Button>
        ))}
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
        <p className="text-sm text-muted-foreground">
          Items seleccionados: <span className="font-semibold">{totalSelected}</span>
        </p>

        <Button
  onClick={handleSubmit}
  disabled={Boolean(isPending || totalSelected === 0)}
>
  {isPending ? "Agregando..." : "Agregar a la orden"}
</Button>
      </div>

      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No hay items para esta categoría.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredItems.map((item) => {
            const quantity = quantities[item.id] ?? 0;

            return (
              <Card
                key={item.id}
                className={`transition-shadow ${
                  quantity > 0 ? "ring-2 ring-primary" : ""
                }`}
              >
                <CardContent className="flex h-full flex-col justify-between p-4">
                  <div className="space-y-2">
                    <h3 className="text-base font-semibold leading-tight">
                      {item.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => decrementQuantity(item.id)}
                      disabled={quantity === 0}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>

                    <div className="min-w-10 text-center text-lg font-semibold">
                      {quantity}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => incrementQuantity(item.id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}