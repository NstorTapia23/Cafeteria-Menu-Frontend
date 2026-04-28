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
    | "superadmin"
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
  "/admin/workspace/dashboard": ["admin", "superadmin"],
  "/admin/workspace/register": ["admin", "superadmin"],
  "/admin/workspace/system": [
    "cocinero",
    "bartender",
    "lunch",
    "admin",
    "superadmin",
  ],
  "/admin/workspace/orders": ["dependiente", "admin", "superadmin"],
  "/admin/workspace/profile": [
    "admin",
    "superadmin",
    "dependiente",
    "cocinero",
    "bartender",
    "lunch",
  ],
};

function getDefaultRedirectForRole(role: string): string {
  switch (role) {
    case "dependiente":
      return "/admin/workspace/orders";
    case "cocinero":
    case "bartender":
    case "lunch":
      return "/admin/workspace/system";
    case "admin":
    case "superadmin":
      return "/admin/workspace/dashboard";
    default:
      return "/admin/workspace";
  }
}

function hasAccess(pathname: string, role: string): boolean {
  const matchedPath = Object.keys(routePermissions).find((path) =>
    pathname.startsWith(path),
  );

  if (!matchedPath) {
    return true;
  }

  return routePermissions[matchedPath].includes(role);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("session")?.value;

  const isRoot = pathname === "/";
  const isLogin = pathname === "/admin" || pathname.startsWith("/admin/");
  const isWorkspace = pathname.startsWith("/workspace");

  // Raíz pública
  if (isRoot) {
    if (!token) return NextResponse.next();

    try {
      const payload = await verifyToken(token);
      return NextResponse.redirect(
        new URL(getDefaultRedirectForRole(payload.role), req.url),
      );
    } catch {
      const res = NextResponse.next();
      res.cookies.delete("session");
      return res;
    }
  }

  // Login público
  if (isLogin) {
    if (!token) return NextResponse.next();

    try {
      const payload = await verifyToken(token);
      return NextResponse.redirect(
        new URL(getDefaultRedirectForRole(payload.role), req.url),
      );
    } catch {
      const res = NextResponse.next();
      res.cookies.delete("session");
      return res;
    }
  }

  // Zona protegida
  if (isWorkspace) {
    if (!token) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }

    try {
      const payload = await verifyToken(token);

      // Si entra a /workspace, lo mandamos a su ruta por defecto
      if (pathname === "/workspace") {
        return NextResponse.redirect(
          new URL(getDefaultRedirectForRole(payload.role), req.url),
        );
      }

      if (!hasAccess(pathname, payload.role)) {
        return NextResponse.redirect(
          new URL(getDefaultRedirectForRole(payload.role), req.url),
        );
      }

      return NextResponse.next();
    } catch {
      const res = NextResponse.redirect(new URL("/admin", req.url));
      res.cookies.delete("session");
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
