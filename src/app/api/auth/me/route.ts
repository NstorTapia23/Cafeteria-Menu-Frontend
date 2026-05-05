import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("session")?.value;

  if (!token) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const payload = await verifySessionToken(token);

  return NextResponse.json({
    user: {
      id: payload.sub,
      name: payload.name,
      role: payload.role,
    },
  });
}