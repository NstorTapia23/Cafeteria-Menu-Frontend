import { ReactNode } from "react";
import { SystemNavBar } from "@/components/commons/SystemNavBar";

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-stone-50">
      <SystemNavBar />
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
