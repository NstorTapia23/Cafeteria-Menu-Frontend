"use client";

import OrdersFilterForm from "@/components/OrdersFiltersForm";
import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardMetricsPage() {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated || user?.role !== "admin") {
    return null; 
  }

  return (
    <div>
      <OrdersFilterForm></OrdersFilterForm>
    </div>
  );
}