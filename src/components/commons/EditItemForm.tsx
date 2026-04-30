"use client";

import { useMemo } from "react";
import { MenuInfoType } from "@/components/commons/Menu-Item-Card";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

type Props = {
  item: MenuInfoType;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  loading: boolean;
  error: string | null;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  elaborationArea: "cocina" | "bar" | "lunch";
};

export default function EditItemForm({
  item,
  onSubmit,
  loading,
  error,
}: Props) {
  const initialForm = useMemo<FormState>(() => {
    return {
      name: item.name ?? "",
      description: item.description ?? "",
      price: item.price?.toString() ?? "",
      elaborationArea: item.elaborationArea ?? "cocina",
    };
  }, [item]);

  return (
    <form onSubmit={onSubmit} className="flex h-full flex-col">
      <div className="border-b px-4 py-4 sm:px-6">
        <h2 className="text-lg font-semibold">Editar elemento</h2>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-6">
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        )}

        <input type="hidden" name="id" value={item.id} />

        <Card className="overflow-hidden rounded-2xl">
          <CardContent className="p-0">
            <div className="aspect-square w-full bg-muted sm:aspect-[4/3]">
              {item.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                  Sin imagen
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Nombre</Label>
            <Input name="name" defaultValue={initialForm.name} />
          </div>

          <div className="grid gap-2">
            <Label>Descripción</Label>
            <Textarea
              name="description"
              defaultValue={initialForm.description}
            />
          </div>

          <div className="grid gap-2">
            <Label>Precio</Label>
            <Input
              name="price"
              type="number"
              defaultValue={initialForm.price}
            />
          </div>

          <div className="grid gap-2">
            <Label>Área</Label>
            <Select
              name="elaborationArea"
              defaultValue={initialForm.elaborationArea}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cocina">cocina</SelectItem>
                <SelectItem value="bar">bar</SelectItem>
                <SelectItem value="lunch">lunch</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Reemplazar imagen</Label>
            <Input name="image" type="file" accept="image/*" />
          </div>
        </div>
      </div>

      <div className="border-t px-4 py-4 sm:px-6">
        <Separator className="mb-4" />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Guardando..." : "Guardar cambios"}
        </Button>
      </div>
    </form>
  );
}