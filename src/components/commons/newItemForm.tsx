// @/components/commons/newItemForm.tsx
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

interface CreateItemPageProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CreateItemPage({
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
      price: 0,
      elaborationArea: "cocina",
      url: null,
    },
  });

  const elaborationArea = watch("elaborationArea");

  async function onSubmit(values: CreateItemInput) {
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description ?? "");
      formData.append("price", String(values.price));
      formData.append("elaborationArea", values.elaborationArea);

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
        price: 0,
        elaborationArea: "cocina",
        url: null,
      });
      setImageFile(null);

      router.refresh();
      onSuccess?.(); // cierra el Sheet después de crear
    } catch (error) {
      console.error("Error al crear item:", error);
      toast.error("Error al crear el item", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return (
    // Sin Card, sólo un contenedor con padding mínimo
    <div className="py-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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
            className="resize-none w-full"
            {...register("description")}
          />
          {errors.description && (
            <p className="text-sm text-destructive">
              {errors.description.message}
            </p>
          )}
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
              setValue("elaborationArea", value as "cocina" | "bar" | "lunch")
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

        <div className="flex justify-end gap-3">
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
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear item"}
          </Button>
        </div>
      </form>
    </div>
  );
}
