// src/app/actions.ts
"use server";

import { db } from "@/db";
import { items, prices } from "@/db/schema";
import { SoftDeleteItem, updateItem } from "@/repositories/items";
import { CreateItemInput, createItemSchema, updateItemSchema } from "@/schemas/ItemsSchemas";
import { revalidatePath } from "next/cache";



export async function createItemMenu(item: CreateItemInput) {
  const validated = createItemSchema.safeParse(item);
  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  return db.transaction(async (tx) => {
    const newItem = await tx
      .insert(items)
      .values({
        name: item.name,
        elaborationArea: item.elaborationArea,
        description: item.description,
        categoryId: item.itemCategory,
        imageUrl: item.url || null,
        is_active: true,
      })
      .returning();

    if (!newItem[0]) throw new Error("No se pudo crear el item");

    const newPrice = await tx
      .insert(prices)
      .values({
        itemId: newItem[0].id,
        amount: item.price,
        validFrom: new Date(),
        validTo: null,
      })
      .returning();

    if (!newPrice[0]) throw new Error("No se pudo crear el precio");
    revalidatePath("/");
    revalidatePath("/admin/workspace/dashboard/menu");

    return {
      item: newItem[0],
      price: newPrice[0],
    };
  });
}

function buildWebpUrl(publicId: string) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  if (!cloudName) {
    throw new Error("Falta CLOUDINARY_CLOUD_NAME");
  }

  return `https://res.cloudinary.com/${cloudName}/image/upload/f_webp,q_auto/${publicId}`;
}

async function uploadImageToCloudinary(file: File) {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName) throw new Error("Falta CLOUDINARY_CLOUD_NAME");
  if (!uploadPreset) throw new Error("Falta CLOUDINARY_UPLOAD_PRESET");

  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: "POST",
      body,
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Error subiendo imagen a Cloudinary: ${errorText}`);
  }

  const data: { public_id?: string } = await response.json();

  if (!data.public_id) {
    throw new Error("Cloudinary no devolvió public_id");
  }

  return buildWebpUrl(data.public_id);
}

export async function createItemWithImageAction(formData: FormData) {
  const rawValues = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
    price: Number(formData.get("price") ?? 0),
    elaborationArea: String(formData.get("elaborationArea") ?? ""),
    itemCategory: Number(formData.get("itemCategory") ?? 0), 
  };

  const validated = createItemSchema.safeParse({
    ...rawValues,
    url: null,
  });

  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  const file = formData.get("image");

  let imageUrl: string | null = null;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }

    imageUrl = await uploadImageToCloudinary(file);
  }

  return createItemMenu({
    ...validated.data,
    url: imageUrl ?? null,
  });
}

export async function updateItemWithImageAction(formData: FormData) {
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const descriptionRaw = String(formData.get("description") ?? "").trim();
  const elaborationArea = String(formData.get("elaborationArea") ?? "").trim();
  const priceRaw = String(formData.get("price") ?? "").trim();
  const urlRaw = String(formData.get("url") ?? "").trim();

  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("ID inválido");
  }

  if (!name) {
    throw new Error("El nombre es obligatorio");
  }

  if (!elaborationArea) {
    throw new Error("El área de elaboración es obligatoria");
  }

  const allowedAreas = ["cocina", "bar", "lunch"] as const;
  if (!allowedAreas.includes(elaborationArea as (typeof allowedAreas)[number])) {
    throw new Error("El área de elaboración no es válida");
  }

  const price =
    priceRaw.length > 0 ? Number(priceRaw) : undefined;

  if (price !== undefined && Number.isNaN(price)) {
    throw new Error("El precio no es válido");
  }

  const file = formData.get("image");
  let imageUrl: string | null | undefined = undefined;

  if (file instanceof File && file.size > 0) {
    if (!file.type.startsWith("image/")) {
      throw new Error("El archivo debe ser una imagen");
    }
    imageUrl = await uploadImageToCloudinary(file);
  } else if (urlRaw.length > 0) {
    imageUrl = urlRaw;
  }

  const validated = updateItemSchema.safeParse({
    id,
    name,
    description: descriptionRaw.length > 0 ? descriptionRaw : null,
    url: imageUrl,
    price,
    elaborationArea: elaborationArea as "cocina" | "bar" | "lunch",
  });

  if (!validated.success) {
    throw new Error(validated.error.message);
  }

  const result = await updateItem(validated.data);
  revalidatePath("/");
  revalidatePath("/admin/workspace/dashboard/menu");

  return {
    item: {
      id: result.id,
      name: result.name,
      description: result.description,
      url: result.imageUrl ?? null,
      price: result.activePrice?.amount ?? validated.data.price ?? 0,
      elaborationArea: result.elaborationArea,
    },
  };
}

export async function DeleteItemAction(itemId: number) {
  try {
    await SoftDeleteItem(itemId);
  revalidatePath("/");
  revalidatePath("/admin/workspace/dashboard/menu");
  } catch (err) {
    throw new Error("Algo ha ido mal eliminando el elemento: " + err);
  }
}