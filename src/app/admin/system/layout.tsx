import { ReactNode } from "react";

export default function SystemLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen flex">{children}</div>;
}
