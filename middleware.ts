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
  role: "admin" | "dependiente" | "cocinero" | "bartender";
  // otros campos si los tienes
}

async function verifyToken(token: string): Promise<TokenPayload> {
  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as TokenPayload;
}

// 🔐 Definición de permisos por prefijo de ruta (solo para rutas protegidas)
const routePermissions: Record<string, string[]> = {
  "/admin/workspace/dashboard": ["admin"],
  "/admin/workspace/system": ["cocinero", "bartender", "lunch", "admin"],
  "/admin/workspace/orders": ["dependiente", "admin"],
  // Puedes agregar más rutas protegidas aquí, por ejemplo:
  // "/admin/reports": ["admin"],
  // "/admin/profile": ["admin", "dependiente", "cocinero", "bartender", "lunch"], // todos
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
      return "/admin/workspace/dashboard";
    default:
      return "/admin";
  }
}

// 🔍 Verifica si una ruta está protegida y si el rol tiene acceso
function hasAccess(pathname: string, role: string): boolean {
  // Si la ruta no empieza con "/admin", asumimos que es pública (ajusta si hay más áreas protegidas)
  if (!pathname.startsWith("/admin")) {
    return true; // rutas no-admin son públicas (ej. "/", "/contacto", etc.)
  }

  // Buscar el prefijo más específico que coincida
  const matchedPath = Object.keys(routePermissions).find((path) =>
    pathname.startsWith(path),
  );

  // Si la ruta no está en el mapa de permisos, denegar acceso (evita agujeros de seguridad)
  if (!matchedPath) {
    return false;
  }

  const allowedRoles = routePermissions[matchedPath];
  return allowedRoles.includes(role);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 📌 Rutas públicas (sin autenticación)
  const publicPaths = ["/api/auth/login", "/api/auth/register"];
  const isPublic = publicPaths.some((path) => pathname.startsWith(path));

  if (isPublic) {
    return NextResponse.next();
  }

  const token = req.cookies.get("session")?.value;

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("from", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  try {
    const payload = await verifyToken(token);
    const userRole = payload.role;

    // 3️⃣ Ruta raíz: redirigir al dashboard según rol
    if (pathname === "/") {
      const defaultRoute = getDefaultRedirectForRole(userRole);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // 4️⃣ Verificar acceso a la ruta solicitada
    const allowed = hasAccess(pathname, userRole);

    if (!allowed) {
      // Si no tiene permiso, redirigir a su ruta por defecto
      const defaultRoute = getDefaultRedirectForRole(userRole);
      return NextResponse.redirect(new URL(defaultRoute, req.url));
    }

    // 5️⃣ Acceso permitido
    return NextResponse.next();
  } catch {
    // Token inválido o expirado
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("session");
    return response;
  }
}

// 🧩 Configuración del matcher (excluye assets estáticos)
export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - favicon.ico
     * - archivos con extensión (opcional, para no interceptar assets)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
