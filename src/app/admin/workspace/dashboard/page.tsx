"use client";
import CreateItemPage from "@/components/commons/newItemForm";
import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardPage() {
  const auth = useAuthContext();
  return (
    <div>
      <CreateItemPage></CreateItemPage>
    </div>
  );
}
