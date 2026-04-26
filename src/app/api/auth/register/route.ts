import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createSessionToken } from "@/lib/auth";
import { UserRole } from "@/types/roles";

const registerSchema = z.object({
  name: z.string().min(3).max(255),
  password: z.string().min(6).max(255),
  role: z.nativeEnum(UserRole),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { name, password, role } = parsed.data;

    const existing = await db
      .select()
      .from(workers)
      .where(eq(workers.name, name))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json(
        { error: "El username ya existe" },
        { status: 409 },
      );
    }

    const hashedPassword = await hashPassword(password);

    const inserted = await db
      .insert(workers)
      .values({
        name,
        password: hashedPassword,
        role,
        create_at: new Date(),
      })
      .returning({
        id: workers.id,
        name: workers.name,
        role: workers.role,
      });

    const worker = inserted[0];
    const token = await createSessionToken({
      id: worker.id,
      name: worker.name,
      role: worker.role as UserRole,
    });

    const response = NextResponse.json(
      { message: "Registro exitoso", worker },
      { status: 201 },
    );

    response.cookies.set("session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
