import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET ||
    (() => {
      throw new Error("JWT_SECRET no configurado");
    })(),
);

interface TokenPayload {
  id: string;
  name: string;
  role:
    | "admin"
    | "dependiente"
    | "cocinero"
    | "bartender"
    | "lunch";
}

async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}

const routePermissions: Record<string, string[]> = {
  "/admin/workspace/dashboard": ["admin"],
  "/admin/workspace/system": ["cocinero", "bartender", "lunch", "admin"],
  "/admin/workspace/orders": ["dependiente", "admin"],
};

function getDefaultRedirectForRole(role: string): string {
  switch (role) {
    case "dependiente":
      return "/admin/workspace/orders";
    case "cocinero":
      return "/admin/workspace/system/kitchen";
    case "bartender":
      return "/admin/workspace/system/bar";
    case "lunch":
      return "/admin/workspace/system/lunch";
    case "admin":
      return "/admin/workspace/dashboard";
    default:
      return "/admin";
  }
}

function hasAccess(pathname: string, role: string): boolean {
  const matchedPath = Object.keys(routePermissions).find((path) =>
    pathname.startsWith(path),
  );

  if (!matchedPath) return true;

  return routePermissions[matchedPath].includes(role);
}

function clearSessionAndRedirect(req: NextRequest, destination: string) {
  const res = NextResponse.redirect(new URL(destination, req.url));
  res.cookies.delete("session");
  return res;
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  const isAdmin = pathname === "/admin";
  const isWorkspace = pathname.startsWith("/admin/workspace");

  if (isAdmin) {
    if (!token) {
      return NextResponse.next();
    }

    try {
      const payload = await verifyToken(token);
      return NextResponse.redirect(
        new URL(getDefaultRedirectForRole(payload.role), req.url),
      );
    } catch {
      return clearSessionAndRedirect(req, "/admin");
    }
  }

  if (isWorkspace) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      const payload = await verifyToken(token);

      if (!hasAccess(pathname, payload.role)) {
        return NextResponse.redirect(
          new URL(getDefaultRedirectForRole(payload.role), req.url),
        );
      }

      return NextResponse.next();
    } catch {
      return clearSessionAndRedirect(req, "/admin");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};