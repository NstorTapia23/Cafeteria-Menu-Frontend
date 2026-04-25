import { NextResponse } from "next/server";
import {
  getOrderItemsByStatus,
  type orderItemStatusType,
} from "@/repositories/orderItems";

const validAreas = ["bar", "cocina", "lunch"] as const;

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const area = searchParams.get("area");

  if (!area || !validAreas.includes(area as (typeof validAreas)[number])) {
    return NextResponse.json({ message: "Área inválida" }, { status: 400 });
  }

  const data = await getOrderItemsByStatus(
    "pending" as orderItemStatusType,
    area as "bar" | "cocina" | "lunch",
  );

  return NextResponse.json(data);
}
