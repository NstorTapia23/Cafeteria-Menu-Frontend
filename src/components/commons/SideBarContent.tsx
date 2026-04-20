// src/components/layout/SidebarContent.tsx
"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { LayoutDashboard, Package, Settings, LogOut, User } from "lucide-react";

// Definición de los elementos de navegación
interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  roles?: string[];
}

const allNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin/workspace/dashboard",
    icon: LayoutDashboard,
    roles: ["admin", "superadmin"],
  },
  {
    title: "Pedidos",
    href: "/admin/workspace/orders",
    icon: Package,
    roles: ["dependiente", "admin", "superadmin"],
  },
  {
    title: "Sistema",
    href: "/admin/workspace/system",
    icon: Settings,
    roles: ["cocinero", "bartender", "admin", "superadmin"],
  },
];

interface SidebarContentProps {
  user: { name?: string; role?: string } | null;
  onLogout: () => void;
  onNavigate?: () => void;
}

// Componente memoizado para cada item de navegación
const NavItemLink = React.memo(function NavItemLink({
  item,
  isActive,
  onNavigate,
}: {
  item: NavItem;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-amber-50 text-amber-900"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900",
      )}
      onClick={onNavigate}
    >
      <item.icon className="h-5 w-5" />
      {item.title}
    </Link>
  );
});

export function SidebarContent({
  user,
  onLogout,
  onNavigate,
}: SidebarContentProps) {
  const pathname = usePathname();
  const userRole = user?.role || "";

  // Memoizar elementos de navegación visibles según rol
  const visibleNavItems = React.useMemo(() => {
    return allNavItems.filter((item) => {
      if (!item.roles) return true;
      return item.roles.includes(userRole);
    });
  }, [userRole]);

  // Memoizar el estado activo de cada ruta para evitar recálculos
  const isActiveMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    visibleNavItems.forEach((item) => {
      map.set(
        item.href,
        pathname === item.href || pathname?.startsWith(item.href + "/"),
      );
    });
    return map;
  }, [visibleNavItems, pathname]);

  // Memoizar el avatar fallback
  const avatarFallback = React.useMemo(() => {
    return user?.name?.charAt(0).toUpperCase() || "U";
  }, [user?.name]);

  return (
    <div className="flex h-full flex-col">
      {/* Logo / Brand */}
      <div className="flex h-16 items-center border-b border-stone-200 px-4">
        <div className="relative h-12 w-12 shrink-0">
          <Image
            src="/Favicon.webp"
            alt="Hotel Santiago Habana"
            fill
            sizes="48px"
            className="object-contain"
            priority
            placeholder="blur"
            blurDataURL="data:image/webp;base64,..."
          />
        </div>
        <span className="text-lg md:text-xl font-semibold text-stone-800">
          Hotel Santiago Habana
        </span>
      </div>

      {/* Navegación */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleNavItems.map((item) => (
          <NavItemLink
            key={item.href}
            item={item}
            isActive={isActiveMap.get(item.href) ?? false}
            onNavigate={onNavigate}
          />
        ))}
      </nav>

      {/* Sección de usuario (pie de sesión) */}
      <div className="border-t border-stone-200 p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="h-auto w-full justify-start gap-3 px-3 py-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-amber-100 text-amber-800">
                  {avatarFallback}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-1 flex-col items-start text-left">
                <span className="text-sm font-medium text-stone-800">
                  {user?.name || "Usuario"}
                </span>
                <span className="text-xs text-stone-500 capitalize">
                  {user?.role || "Invitado"}
                </span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link
                href="/admin/profile"
                className="flex items-center"
                onClick={onNavigate}
              >
                <User className="mr-2 h-4 w-4" />
                Perfil
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
