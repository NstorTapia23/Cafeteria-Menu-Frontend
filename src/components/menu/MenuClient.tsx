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

export default function MenuClient({ items }: { items: MenuInfoType[] }) {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Fondo de pantalla */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <Image
          src="/islazul.jpg"
          alt="Fondo Islazul"
          fill
          sizes="100vw"
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Contenido */}
      <div className="relative z-10 flex flex-col items-center justify-center pt-10 pb-6">
        <div
          className="relative transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translateY(${scrollY * 0.15}px) scale(${
              1 + scrollY * 0.0002
            })`,
          }}
        >
          <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden shadow-[0_0_25px_rgba(255,255,255,0.4)] animate-fade-in">
            <Image
              src="/Favicon.webp"
              alt="Santiago Habana Logo"
              sizes="(max-width: 640px) 112px, 144px"
              fill
              className="object-cover"
              priority
            />
          </div>
        </div>

       <div className="mt-6 px-6 py-3 rounded-2xl bg-white/70 backdrop-blur-md shadow-md animate-fade-in text-center">
  <h1 className="text-2xl font-bold tracking-tight">
    Menu Virtual
  </h1>

  <p className="text-sm text-muted-foreground mt-1">
    Calidad, sabor y experiencia
  </p>
</div>

        <div className="mt-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
          {items.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}