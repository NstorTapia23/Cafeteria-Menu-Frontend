import { ReactNode } from "react";

export default function SystemLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
