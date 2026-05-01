"use client";

import { useAuthContext } from "@/contexts/AuthContext";

export default function DashboardMetricsPage() {
  const { isAuthenticated, user } = useAuthContext();

  if (!isAuthenticated || user?.role !== "admin") {
    return null; 
  }

  return (
    <div>
      {/* Contenido real del dashboard de métricas */}
    </div>
  );
}