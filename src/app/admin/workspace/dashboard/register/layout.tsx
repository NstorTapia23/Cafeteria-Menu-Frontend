import { ReactNode } from "react";

export default async function RegisterLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <div>{children}</div>;
}
