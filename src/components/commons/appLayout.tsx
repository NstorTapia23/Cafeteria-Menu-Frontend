// src/components/layout/AppLayout.tsx
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

import { useAuthContext } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { SidebarContent } from "./SideBarContent";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const router = useRouter();
  const { user, logout } = useAuthContext();

  const handleLogout = async () => {
    await logout();
    router.push("/admin");
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <div className="flex min-h-screen bg-stone-50">
      <aside className="hidden w-64 flex-col border-r border-stone-200 bg-white md:flex">
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed left-4 top-4 z-40 md:hidden"
            aria-label="Abrir menú"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent side="left" className="w-64 p-0">
          <VisuallyHidden>
            <SheetTitle>Menú lateral</SheetTitle>
          </VisuallyHidden>

          <SidebarContent
            user={user}
            onLogout={handleLogout}
            onNavigate={closeMobileMenu}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-y-auto">
        <div className="h-16 md:h-0" />
        <div className="container mx-auto p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
