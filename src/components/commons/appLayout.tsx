// src/components/layout/AppLayout.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuthContext } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

import { SidebarContent } from "./SideBarContent";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const router = useRouter();
  const auth = useAuthContext();
  const { user, logout } = auth;

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Sidebar de escritorio (visible en md o más grande) */}
      <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white md:flex">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* Menú hamburguesa móvil */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <SidebarContent
            user={user}
            onLogout={handleLogout}
            onNavigate={closeMobileMenu}
          />
        </SheetContent>
      </Sheet>

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        <div className="h-16 md:h-0" /> {/* Espacio para el botón móvil */}
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
