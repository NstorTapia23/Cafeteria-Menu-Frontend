"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useElaborationItems } from "@/hooks/use-elaboration-items";
import { updateStatus } from "@/app/admin/workspace/orders/[id]/actions";

type ElaborationArea = "bar" | "cocina" | "lunch";

type Props = {
  area: ElaborationArea;
  title: string;
};

export function ElaborationBoard({ area, title }: Props) {
  const { data, loading, error, refetch } = useElaborationItems(area);
  const [busyId, setBusyId] = useState<number | null>(null);

  const handleMarkCooked = async (itemId: number, orderId: number) => {
    setBusyId(itemId);

    try {
      const formData = new FormData();
      formData.append("id", itemId.toString());
      formData.append("status", "cooked");
      formData.append("orderId", orderId.toString());

      await updateStatus(formData);

      toast.success("Ítem marcado como cocinado");
      await refetch();
    } catch (err) {
      toast.error("No se pudo actualizar el estado");
      console.error(err);
    } finally {
      setBusyId(null);
    }
  };

  return (
    <section className="mx-auto w-full max-w-5xl p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{title}</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading && (
            <p className="text-sm text-muted-foreground">Cargando pedidos...</p>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {!loading && data.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay pedidos pendientes en esta área.
            </p>
          )}

          <div className="grid gap-3">
            {data.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-3 rounded-lg border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="space-y-1">
                  <Label>Orden #{row.orderId}</Label>
                  <p className="text-sm text-muted-foreground">
                    Mesa #{row.numberTable}
                  </p>
                  <p className="font-medium">{row.itemName}</p>
                  <p className="text-sm text-muted-foreground">
                    Cantidad: {row.quantity}
                  </p>
                </div>

                <Button
                  onClick={() => handleMarkCooked(row.id, row.orderId)}
                  disabled={busyId === row.id}
                >
                  {busyId === row.id ? "Procesando..." : "Registrar salida"}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
