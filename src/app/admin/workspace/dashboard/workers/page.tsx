"use client";
import RegisterForm from "@/components/RegisterForm";
import { useAuthContext } from "@/contexts/AuthContext";

export default function RegisterPage() {
  const { isAuthenticated, user } = useAuthContext();
  
  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }

  return <RegisterForm />;
}
