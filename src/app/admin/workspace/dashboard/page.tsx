"use client";
import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const auth = useAuthContext();
  return (
    <div>{auth.user?.role !== "dependiente" && <label>Hola Hola</label>}</div>
  );
}
