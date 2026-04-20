"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div>
      <Image src="/Favicon.webp" alt="Logo" width={120} height={120} priority />
      <button onClick={() => router.push("/admin")}>Ir a admin</button>
    </div>
  );
}
