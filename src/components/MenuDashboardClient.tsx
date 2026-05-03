"use client";

import { useState } from "react";

import {
  updateItemWithImageAction,
  DeleteItemAction,
} from "@/app/admin/workspace/dashboard/menu/actions";

import CreateItemPage, { ItemCategoryType } from "@/components/commons/newItemForm";
import CreateCategory from "./CreateCategory";
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
  itemCategories,
}: {
  initialItems: MenuInfoType[];
  itemCategories: ItemCategoryType[];
}) {
  const { isAuthenticated, user } = useAuthContext();

  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>(initialItems);
  const [createOpen, setCreateOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
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

  const handleDelete = async (id: number) => {
    setEditError(null);
    setSaving(true);

    try {
      await DeleteItemAction(id);

      setItemsMenu((prev) => prev.filter((item) => item.id !== id));
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
      <div className="flex gap-3">
        <Sheet open={createOpen} onOpenChange={setCreateOpen}>
          <SheetTrigger asChild>
            <Button>Agregar ítem</Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="flex h-[100dvh] w-full flex-col overflow-hidden p-0 sm:h-[min(90vh,48rem)] sm:max-w-md"
          >
            <SheetHeader className="border-b px-4 py-4 sm:px-6">
              <SheetTitle>Nuevo elemento</SheetTitle>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col">
              <CreateItemPage
                onSuccess={() => setCreateOpen(false)}
                categories={itemCategories}
              />
            </div>
          </SheetContent>
        </Sheet>

        <Sheet open={categoryOpen} onOpenChange={setCategoryOpen}>
          <SheetTrigger asChild>
            <Button variant="outline">Agregar categoría</Button>
          </SheetTrigger>

          <SheetContent
            side="right"
            className="flex h-[100dvh] w-full flex-col overflow-hidden p-0 sm:h-[min(90vh,32rem)] sm:max-w-md"
          >
            <SheetHeader className="border-b px-4 py-4 sm:px-6">
              <SheetTitle>Nueva categoría</SheetTitle>
            </SheetHeader>

            <div className="flex min-h-0 flex-1 flex-col p-4">
              <CreateCategory onSuccess={() => setCategoryOpen(false)} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {itemsMenu.map((item) => (
          <MenuItemCard key={item.id} item={item} onClick={handleOpenEdit} />
        ))}
      </div>

      <Sheet open={editOpen} onOpenChange={setEditOpen}>
        <SheetContent
          side="right"
          className="flex h-[100dvh] w-full flex-col overflow-hidden p-0 sm:h-[min(90vh,48rem)] sm:max-w-xl"
        >
          <SheetHeader className="border-b px-4 py-4 sm:px-6">
            <SheetTitle>Editar elemento del menú</SheetTitle>
          </SheetHeader>

          <div className="flex min-h-0 flex-1 flex-col">
            {selectedItem && (
              <EditItemForm
                item={selectedItem}
                onSubmit={handleUpdate}
                onDelete={handleDelete}
                loading={saving}
                error={editError}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}