import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { workers } from "@/db/schema";
import { eq } from "drizzle-orm";
import { comparePassword, createSessionToken } from "@/lib/auth";

const loginSchema = z.object({
  name: z.string().min(3).max(255),
  password: z.string().min(6).max(255),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const { name, password } = parsed.data;

    const user = await db
      .select()
      .from(workers)
      .where(eq(workers.name, name))
      .limit(1);

    if (user.length === 0) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    const worker = user[0];
    const isValid = await comparePassword(password, worker.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Credenciales incorrectas" },
        { status: 401 },
      );
    }

    const token = await createSessionToken({
      id: worker.id,
      name: worker.name,
      role: worker.role,
    });

    const response = NextResponse.json(
      {
        message: "Login exitoso",
        worker: {
          id: worker.id,
          name: worker.name,
          role: worker.role,
        },
      },
      { status: 200 },
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
