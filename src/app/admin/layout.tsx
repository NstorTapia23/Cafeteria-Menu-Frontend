import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata = {
  title: "Santiago Habana | Panel de Administración",
  description: "Panel de Administración del bar-cafeteria Santiago Habana",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <Toaster />
      <TooltipProvider>
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </SidebarProvider>
      </TooltipProvider>
    </AuthProvider>
  );
}
