"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { MenuItemCard } from "@/components/commons/Menu-Item-Card";

type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number;
  elaborationArea: "cocina" | "bar" | "lunch";
};

export default function MenuClient({
  items,
}: {
  items: MenuInfoType[];
}) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center pt-10 pb-6 overflow-hidden">
      <div className="absolute inset-0 -z-20 bg-linear-to-b from-blue-50 via-white to-white" />

      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{ transform: `translateY(${scrollY * 0.08}px)` }}
      >
        <Image
          src="/islazul.jpg"
          alt="Decoración"
          fill
          className="object-cover opacity-20 scale-110"
        />
      </div>

      <h1 className="mt-6 text-2xl font-bold">Menú Cafetería</h1>

      <div className="mt-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}