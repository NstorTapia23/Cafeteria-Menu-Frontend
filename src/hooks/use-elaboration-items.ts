"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import type { PendsForCookType } from "@/schemas/orderItemsSchemas";
import { supabase } from "@/lib/supabase";
import type { OrderItemsRealtimeEvent } from "@/lib/realtime/order-items-bus";

type ElaborationArea = "bar" | "cocina" | "lunch";
type PendsForCookItem = PendsForCookType[number];

type State = {
  data: PendsForCookType;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "loading" }
  | { type: "success"; payload: PendsForCookType }
  | { type: "error"; payload: string }
  | { type: "clear-error" }
  | { type: "remove-item"; payload: number }
  | { type: "add-item"; payload: PendsForCookItem };

const initialState: State = {
  data: [],
  loading: true,
  error: null,
};

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "loading":
      return { ...state, loading: true, error: null };
    case "success":
      return { data: action.payload, loading: false, error: null };
    case "error":
      return { ...state, loading: false, error: action.payload };
    case "clear-error":
      return { ...state, error: null };
    case "remove-item":
      return {
        ...state,
        data: state.data.filter((item) => item.id !== action.payload),
      };
    case "add-item":
      if (state.data.some((item) => item.id === action.payload.id)) {
        return state;
      }
      return { ...state, data: [...state.data, action.payload] };
    default:
      return state;
  }
}

export function useElaborationItems(area: ElaborationArea) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      dispatch({ type: "loading" });
      try {
        const res = await fetch(`/api/order-items/pending?area=${area}`, {
          cache: "no-store",
          signal,
        });
        if (!res.ok) throw new Error("No se pudo obtener la lista");
        const result = (await res.json()) as PendsForCookType;
        dispatch({ type: "success", payload: result });
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        dispatch({
          type: "error",
          payload: err instanceof Error ? err.message : "Error desconocido",
        });
      }
    },
    [area],
  );

  const scheduleLoad = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const controller = new AbortController();
      load(controller.signal);
    }, 150);
  }, [load]);

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);

    const channel = supabase
      .channel("order-items")
      .on("broadcast", { event: "order-event" }, (payload) => {
        const event = payload.payload as OrderItemsRealtimeEvent;
        if ("area" in event && event.area !== area) return;

        switch (event.type) {
          case "item-updated":
          case "item-deleted":
            dispatch({ type: "remove-item", payload: event.itemId });
            break;

          case "item-created":
          case "items-batch-created":
          case "order-closed":
            scheduleLoad();
            break;
        }
      })
      .subscribe((status) => {
        if (status === "CLOSED" || status === "CHANNEL_ERROR") {
          dispatch({
            type: "error",
            payload: "Se perdió la conexión en tiempo real",
          });
        }
      });

    return () => {
      controller.abort();
      if (debounceRef.current) clearTimeout(debounceRef.current);
      supabase.removeChannel(channel);
    };
  }, [area, load, scheduleLoad]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch: () => {
      const controller = new AbortController();
      load(controller.signal);
    },
  };
}