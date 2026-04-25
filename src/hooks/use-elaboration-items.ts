"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PendsForCookType } from "@/schemas/orderItemsSchemas";

type ElaborationArea = "bar" | "cocina" | "lunch";

export function useElaborationItems(area: ElaborationArea) {
  const [data, setData] = useState<PendsForCookType>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const esRef = useRef<EventSource | null>(null);

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

    const es = new EventSource(`/api/order-items/stream?area=${area}`);
    esRef.current = es;

    const refresh = () => {
      void fetchData();
    };

    es.addEventListener("item-created", refresh);
    es.addEventListener("item-updated", refresh);
    es.addEventListener("item-deleted", refresh);
    es.addEventListener("order-closed", refresh);

    es.onerror = () => {
      setError("Se perdió la conexión en tiempo real");
    };

    return () => {
      es.close();
      esRef.current = null;
    };
  }, [area, fetchData]);

  return { data, loading, error, refetch: fetchData };
}
