"use server";

import { db } from "@/db";
import { items, prices } from "@/db/schema";
import { createItemSchema } from "@/schemas/ItemsSchemas";

export type ItemType = {
  name: string;
  description?: string;
  url?: string | null;
  price: number;
  elaborationArea: "cocina" | "bar" | "lunch";
};

export async function createItemMenu(item: ItemType) {
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
