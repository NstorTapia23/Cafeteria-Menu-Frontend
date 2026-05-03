"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CreateItemCategoryAction } from "@/app/admin/workspace/dashboard/menu/actions";

export default function CreateCategory({
  onSuccess,
}: {
  onSuccess?: () => void;
}) {
  const [categoryState, setCategoryState] = useState(false);
  const [newCategory, setNewCategory] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!newCategory.trim()) return;

    try {
      setSaving(true);
      CreateItemCategoryAction(newCategory)

      setNewCategory("");
      setCategoryState(false);
      onSuccess?.();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="p-4 space-y-3 border-0 shadow-none">
      <Button onClick={() => setCategoryState((prev) => !prev)}>
        {categoryState ? "Cancelar" : "Agregar categoría"}
      </Button>

      {categoryState && (
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="Nombre de la categoría"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
          />

          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      )}
    </Card>
  );
}