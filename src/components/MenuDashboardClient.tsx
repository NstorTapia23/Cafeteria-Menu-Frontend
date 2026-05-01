"use client";

import { useState } from "react";

import { updateItemWithImageAction } from "@/app/admin/workspace/dashboard/menu/actions"; // ajusta la ruta si moviste el actions

import CreateItemPage from "@/components/commons/newItemForm";
import EditItemForm from "@/components/commons/EditItemForm";
import {
  MenuItemCard,
  type MenuInfoType,
} from "@/components/commons/Menu-Item-Card";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { useAuthContext } from "@/contexts/AuthContext";

export default function MenuDashboardClient({
  initialItems,
}: {
  initialItems: MenuInfoType[];
}) {
  const { isAuthenticated, user } = useAuthContext();

  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>(initialItems);

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuInfoType | null>(null);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  if (!isAuthenticated || user?.role !== "admin") return null;

  const handleOpenEdit = (item: MenuInfoType) => {
    setSelectedItem(item);
    setEditError(null);
    setEditOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSaving(true);
    setEditError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const res = await updateItemWithImageAction(formData);
      const updated = res.item;

      setItemsMenu((prev) =>
        prev.map((i) => (i.id === updated.id ? updated : i))
      );
      setEditOpen(false);
      setSelectedItem(null);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : "Error inesperado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      {/* CREATE */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetTrigger asChild>
          <Button>Agregar</Button>
        </SheetTrigger>

        <SheetContent side="right" className="p-4 sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Nuevo elemento</SheetTitle>
          </SheetHeader>
          <CreateItemPage />
        </SheetContent>
      </Sheet>

      {/* LIST */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itemsMenu.map((item) => (
          <MenuItemCard
            key={item.id}
            item={item}
            onClick={handleOpenEdit}
          />
        ))}
      </div>

      {/* EDIT */}
      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent side="right" className="p-0 sm:max-w-xl">
          <SheetHeader className="border-b px-4 py-4">
            <SheetTitle>Editar elemento del menú</SheetTitle>
          </SheetHeader>

          {selectedItem && (
            <EditItemForm
              item={selectedItem}
              onSubmit={handleUpdate}
              loading={saving}
              error={editError}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}