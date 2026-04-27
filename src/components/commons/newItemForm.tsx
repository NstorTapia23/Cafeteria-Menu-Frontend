// app/admin/items/create/page.tsx
"use client";

import { useEffect, useState } from "react";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { createItemSchema, type CreateItemInput } from "@/schemas/ItemsSchemas";
import { createItemWithImageAction } from "@/app/admin/workspace/dashboard/menu/actions";

export default function CreateItemPage() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

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
  const name = watch("name");
  const description = watch("description");
  const price = watch("price");

  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(imageFile);
    setPreviewUrl(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [imageFile]);

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
    } catch (error) {
      console.error("Error al crear item:", error);
      toast.error("Error al crear el item", {
        description:
          error instanceof Error ? error.message : "Error desconocido",
      });
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Crear nuevo item del menú
          </h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            Completa los datos del producto y revisa la vista previa antes de
            guardarlo.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="overflow-hidden border bg-background shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xl">Datos del producto</CardTitle>
              <CardDescription>
                Información visible para clientes y personal.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      placeholder="Ej: Hamburguesa Clásica"
                      className="h-11"
                      {...register("name")}
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive">
                        {errors.name.message}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground">
                      Nombre principal del producto.
                    </p>
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Descripción del plato o bebida..."
                      className="min-h-28 resize-none"
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
                      className="h-11"
                      {...register("price", { valueAsNumber: true })}
                    />
                    {errors.price && (
                      <p className="text-sm text-destructive">
                        {errors.price.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="elaborationArea">Área de elaboración</Label>
                    <Select
                      value={elaborationArea}
                      onValueChange={(value) =>
                        setValue(
                          "elaborationArea",
                          value as "cocina" | "bar" | "lunch",
                          { shouldValidate: true },
                        )
                      }
                    >
                      <SelectTrigger id="elaborationArea" className="h-11">
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
                  </div>

                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="image">Imagen del item</Label>
                    <Input
                      id="image"
                      type="file"
                      accept="image/*"
                      className="h-11 file:mr-4 file:rounded-md file:border-0 file:bg-muted file:px-4 file:py-2 file:text-sm file:font-medium"
                      onChange={(e) =>
                        setImageFile(e.target.files?.[0] ?? null)
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      La imagen se subirá automáticamente al crear el item.
                    </p>
                    {imageFile && (
                      <p className="text-sm font-medium text-emerald-600">
                        Imagen seleccionada: {imageFile.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.back()}
                    className="w-full sm:w-auto"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto"
                  >
                    {isSubmitting ? "Creando..." : "Crear item"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border bg-background shadow-sm">
            <CardHeader className="border-b bg-muted/20">
              <CardTitle className="text-xl">Vista previa</CardTitle>
              <CardDescription>
                Así se vería el producto en una presentación visual.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5 p-4 sm:p-6">
              <div className="overflow-hidden rounded-3xl border bg-muted/10 shadow-sm">
                <div className="aspect-[4/3] w-full">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt={name || "Vista previa del producto"}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center bg-gradient-to-br from-muted/40 to-background px-6 text-center">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">
                          Sin imagen seleccionada
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Cuando subas una foto, aparecerá aquí la vista previa.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 rounded-3xl border bg-card p-4 sm:p-5">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Nombre
                  </p>
                  <h2 className="text-lg font-semibold leading-tight">
                    {name?.trim() ? name : "Nombre del producto"}
                  </h2>
                </div>

                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    Descripción
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {description?.trim()
                      ? description
                      : "Agrega una descripción breve para resaltar ingredientes, sabor o presentación."}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 rounded-2xl bg-muted/50 p-4">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Precio
                    </p>
                    <p className="text-xl font-semibold">
                      ${Number(price || 0).toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Área
                    </p>
                    <p className="text-sm font-medium capitalize">
                      {elaborationArea}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
