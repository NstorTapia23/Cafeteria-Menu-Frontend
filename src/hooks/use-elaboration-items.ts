"use client";

import { useCallback, useEffect, useReducer } from "react";
import type { PendsForCookType } from "@/schemas/orderItemsSchemas";
import { supabase } from "@/lib/supabase";

type ElaborationArea = "bar" | "cocina" | "lunch";

type State = {
  data: PendsForCookType;
  loading: boolean;
  error: string | null;
};

type Action =
  | { type: "loading" }
  | { type: "success"; payload: PendsForCookType }
  | { type: "error"; payload: string }
  | { type: "clear-error" };

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
    default:
      return state;
  }
}

export function useElaborationItems(area: ElaborationArea) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const load = useCallback(async (signal?: AbortSignal) => {
    dispatch({ type: "loading" });

    try {
      const res = await fetch(`/api/order-items/pending?area=${area}`, {
        cache: "no-store",
        signal,
      });

      if (!res.ok) {
        throw new Error("No se pudo obtener la lista");
      }

      const result = (await res.json()) as PendsForCookType;
      dispatch({ type: "success", payload: result });
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;

      dispatch({
        type: "error",
        payload: err instanceof Error ? err.message : "Error desconocido",
      });
    }
  }, [area]);

  useEffect(() => {
    const controller = new AbortController();

    void load(controller.signal);

    const channel = supabase
      .channel("order-items")
      .on("broadcast", { event: "order-event" }, () => {
        void load(controller.signal);
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
      channel.unsubscribe();
    };
  }, [load]);

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    refetch: load,
  };
}