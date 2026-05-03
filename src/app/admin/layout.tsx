import { AuthProvider } from "@/contexts/AuthContext";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AuthProvider> <Toaster></Toaster>
    {children}</AuthProvider>
}
