
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import type { ItemCategoryType } from "@/components/commons/newItemForm";

type CategoryListProps = {
  categories: ItemCategoryType[];
  onDelete: (id: number) => Promise<void>;
};

export function CategoryList({ categories, onDelete }: CategoryListProps) {
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (deletingId === null) return;
    setLoading(true);
    try {
      await onDelete(deletingId);
      setDeletingId(null); 
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado";
      toast.error(message); 
    } finally {
      setLoading(false);
    }
  };

  if (categories.length === 0) {
    return <p className="text-sm text-muted-foreground">No hay categorías.</p>;
  }

  return (
    <>
      <div className="mt-4 space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center justify-between rounded border px-3 py-2"
          >
            <span className="text-sm font-medium">{cat.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => setDeletingId(cat.id)}
              aria-label={`Eliminar categoría ${cat.name}`}
            >
              ✕
            </Button>
          </div>
        ))}
      </div>

      <AlertDialog
        open={deletingId !== null}
        onOpenChange={(open) => {
          if (!open) setDeletingId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción desactivará la categoría. Si tiene ítems activos, no
              podrá eliminarse hasta que los reasignes o desactives.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? "Eliminando…" : "Sí, eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}