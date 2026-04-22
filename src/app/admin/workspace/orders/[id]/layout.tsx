import { ReactNode } from "react";

export default async function IdPageLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
