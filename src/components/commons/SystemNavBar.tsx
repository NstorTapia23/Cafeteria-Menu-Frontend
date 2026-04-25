"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { UtensilsCrossed, ChefHat, Martini } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { UserRole } from "@/types/roles";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  allowedRoles: UserRole[];
}

const allNavItems: NavItem[] = [
  {
    name: "Lunch",
    href: "/admin/workspace/system/lunch",
    icon: UtensilsCrossed,
    allowedRoles: [UserRole.LUNCH, UserRole.ADMIN],
  },
  {
    name: "Cocina",
    href: "/admin/workspace/system/kitchen",
    icon: ChefHat,
    allowedRoles: [UserRole.COCINERO, UserRole.ADMIN],
  },
  {
    name: "Bar",
    href: "/admin/workspace/system/bar",
    icon: Martini,
    allowedRoles: [UserRole.BARTENDER, UserRole.ADMIN],
  },
];

export function SystemNavBar() {
  const pathname = usePathname();
  const { user } = useAuthContext();

  // Filtrar items según el rol del usuario
  const navItems = allNavItems.filter(
    (item) => user && item.allowedRoles.includes(user.role as UserRole),
  );

  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Desktop navigation tabs */}
          <div className="hidden sm:flex items-center justify-center space-x-1 w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="ghost"
                  asChild
                  className={cn(
                    "h-auto px-4 py-2 rounded-none border-b-2 border-transparent",
                    "text-sm font-medium transition-colors",
                    "hover:bg-transparent hover:text-stone-700 hover:border-stone-300",
                    isActive
                      ? "text-blue-600 border-blue-500"
                      : "text-stone-500",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="mr-2 h-4 w-4" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </div>

          {/* Mobile centered chip-style buttons */}
          <div className="flex items-center justify-center space-x-2 sm:hidden w-full">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Button
                  key={item.href}
                  variant="outline"
                  size="sm"
                  asChild
                  className={cn(
                    "text-xs font-medium rounded-md inline-flex items-center gap-1",
                    isActive
                      ? "bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200"
                      : "text-stone-500 bg-stone-100 border-transparent hover:bg-stone-200",
                  )}
                >
                  <Link href={item.href}>
                    <item.icon className="h-3.5 w-3.5" />
                    {item.name}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
