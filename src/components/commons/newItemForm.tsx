"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import { createItemSchema, type CreateItemInput } from "@/schemas/ItemsSchemas";
import { createItemWithImageAction } from "@/app/admin/workspace/dashboard/menu/actions";

export type ItemCategoryType = {
  id: number;
  name: string;
};

interface CreateItemPageProps {
  categories: ItemCategoryType[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateItemPage({
  categories,
  onSuccess,
  onCancel,
}: CreateItemPageProps) {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      itemCategory: undefined as unknown as number,
      price: 0,
      elaborationArea: "cocina",
      url: null,
    },
  });

  const elaborationArea = watch("elaborationArea");
  const itemCategory = watch("itemCategory");

  async function onSubmit(values: CreateItemInput) {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description ?? "");
      formData.append("price", String(values.price));
      formData.append("elaborationArea", values.elaborationArea);
      formData.append("itemCategory", String(values.itemCategory));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      const result = await createItemWithImageAction(formData);

      toast.success("Item creado correctamente", {
        description: `Se ha creado "${result.item.name}" con precio $${result.price.amount}`,
      });

      reset({
        name: "",
        description: "",
        itemCategory: undefined as unknown as number,
        price: 0,
        elaborationArea: "cocina",
        url: null,
      });
      setImageFile(null);

      router.refresh();
      onSuccess?.();
    } catch (error) {
      console.error("Error al crear item:", error);
      toast.error("Error al crear el item", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex min-h-0 flex-1 flex-col"
    >
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-6">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Hamburguesa Clásica"
              className="w-full"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Nombre visible para los clientes y el personal.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción del plato o bebida..."
              className="w-full resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="itemCategory">Categoría</Label>
            <Select
              value={itemCategory ? String(itemCategory) : ""}
              onValueChange={(value) =>
                setValue("itemCategory", Number(value), {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="itemCategory" className="w-full">
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={String(category.id)}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.itemCategory && (
              <p className="text-sm text-destructive">
                {errors.itemCategory.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Define la categoría del item para el filtro del menú.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
            <p className="text-sm text-muted-foreground">Precio (ej: 10.99)</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="elaborationArea">Área de elaboración</Label>
            <Select
              value={elaborationArea}
              onValueChange={(value) =>
                setValue("elaborationArea", value as "cocina" | "bar" | "lunch", {
                  shouldValidate: true,
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="elaborationArea" className="w-full">
                <SelectValue placeholder="Selecciona un área" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cocina">Cocina</SelectItem>
                <SelectItem value="bar">Bar</SelectItem>
                <SelectItem value="lunch">Lunch</SelectItem>
              </SelectContent>
            </Select>
            {errors.elaborationArea && (
              <p className="text-sm text-destructive">
                {errors.elaborationArea.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Determina dónde se preparará este item.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">Imagen del item</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              className="w-full"
              onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            />
            <p className="text-sm text-muted-foreground">
              La imagen se subirá automáticamente al crear el item.
            </p>
            {imageFile && (
              <p className="text-sm text-green-600">
                Imagen seleccionada: {imageFile.name}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 border-t bg-background px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6">
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              if (onCancel) {
                onCancel();
              } else {
                router.back();
              }
            }}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            disabled={isSubmitting || categories.length === 0}
            className="w-full sm:w-auto"
          >
            {isSubmitting ? "Creando..." : "Crear item"}
          </Button>
        </div>
      </div>
    </form>
  );
}