// app/admin/items/create/page.tsx
"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { createItemMenu } from "@/app/admin/workspace/dashboard/actions";
import { createItemSchema, type CreateItemInput } from "@/schemas/ItemsSchemas";

export default function CreateItemPage() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateItemInput>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      elaborationArea: "cocina",
    },
  });

  const elaborationArea = watch("elaborationArea");

  async function onSubmit(values: CreateItemInput) {
    try {
      const result = await createItemMenu({
        name: values.name,
        description: values.description || null,
        price: values.price,
        elaborationArea: values.elaborationArea,
      });

      toast.success("Item creado correctamente", {
        description: `Se ha creado "${result.item.name}" con precio $${result.price.amount}`,
      });

      router.refresh();
    } catch (error) {
      console.error("Error al crear item:", error);
      toast.error("Error al crear el item", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Crear nuevo item del menú</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              placeholder="Ej: Hamburguesa Clásica"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
            <p className="text-sm text-muted-foreground">
              Nombre visible para los clientes y el personal.
            </p>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción del plato o bebida..."
              className="resize-none"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-destructive">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label htmlFor="price">Precio</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && (
              <p className="text-sm text-destructive">{errors.price.message}</p>
            )}
            <p className="text-sm text-muted-foreground">Precio (ej: 10.99)</p>
          </div>

          {/* Área de elaboración */}
          <div className="space-y-2">
            <Label htmlFor="elaborationArea">Área de elaboración</Label>
            <Select
              value={elaborationArea}
              onValueChange={(value) =>
                setValue("elaborationArea", value as "cocina" | "bar" | "lunch")
              }
            >
              <SelectTrigger id="elaborationArea">
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

          {/* Botones */}
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear item"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
