"use client";
import { useAuth } from "@/hooks/useAuthContext";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const auth = useAuth();
  return (
    <div>
      <Image src="/favicon.ico" alt="Logo" width={120} height={120} priority />
      <button onClick={() => router.push("/admin")}>Ir a admin</button>
      <button
        className="flex justify-center rounded-xl shadow-md shadow-blue-200"
        onClick={() => auth.logout()}
      >
        Cerrar sesión
      </button>
    </div>
  );
}
