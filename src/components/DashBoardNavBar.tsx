"use client";
import { Menu, Wallet, Workflow } from "lucide-react";
import Link from "next/link"; // ✅ importación correcta para navegación
import { usePathname } from "next/navigation";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

type NavLinkDashboard = {
  name: string;
  href: string;
  icon: React.ElementType;
};

const TabMenu: NavLinkDashboard[] = [
  {
    name: "Metricas Generales",
    href: "/admin/workspace/dashboard/metrics",
    icon: Wallet,
  },
  {
    name: "Menu Virtual",
    href: "/admin/workspace/dashboard/menu",
    icon: Menu,
  },
  {
    name: "Trabajadores",
    href: "/admin/workspace/dashboard/workers",
    icon: Workflow,
  },
];

export default function DashBoardNavBar() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-stone-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center h-16">
          {/* Desktop navigation tabs */}
          <div className="hidden sm:flex items-center justify-center space-x-1 w-full">
            {TabMenu.map((item) => {
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
            {TabMenu.map((item) => {
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
