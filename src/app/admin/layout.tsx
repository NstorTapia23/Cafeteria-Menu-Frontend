import AppLayout from "@/components/commons/appLayout";
import type { ReactNode } from "react";

export default function WorkspaceLayout({ children }: { children: ReactNode }) {
  return <AppLayout>{children}</AppLayout>;
}
