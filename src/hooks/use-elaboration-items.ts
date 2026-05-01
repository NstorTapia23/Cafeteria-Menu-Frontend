"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PendsForCookType } from "@/schemas/orderItemsSchemas";
import { supabase } from "@/lib/supabase";

type ElaborationArea = "bar" | "cocina" | "lunch";

export function useElaborationItems(area: ElaborationArea) {
  const [data, setData] = useState<PendsForCookType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setError(null);
      const res = await fetch(`/api/order-items/pending?area=${area}`, {
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener la lista");
      }

      const result = (await res.json()) as PendsForCookType;
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }, [area]);

  useEffect(() => {
    fetchData();

    // Suscripción a canal de Supabase
    const channel = supabase.channel("order-items").on(
      "broadcast",
      { event: "order-event" },
      (payload) => {
        // Reaccionamos a cualquier evento del pedido, recargamos datos de esta área
        // Podrías filtrar por área, pero recargar no es costoso
        void fetchData();
      }
    ).subscribe((status) => {
      if (status === "SUBSCRIBED") {
        // opcional: log
      }
      if (status === "CLOSED" || status === "CHANNEL_ERROR") {
        setError("Se perdió la conexión en tiempo real");
      }
    });

    channelRef.current = channel;

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [area, fetchData]);

  return { data, loading, error, refetch: fetchData };
}