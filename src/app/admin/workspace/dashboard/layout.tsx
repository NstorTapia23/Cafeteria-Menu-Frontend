import DashBoardNavBar from "@/components/DashBoardNavBar";
import { ReactNode } from "react";
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <DashBoardNavBar></DashBoardNavBar>
      <main>{children}</main>
    </div>
  );
}
