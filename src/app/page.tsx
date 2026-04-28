"use client";

import { MenuItemCard } from "@/components/commons/Menu-Item-Card";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getItemsForMenu } from "./actions";
import RegisterForm from "@/components/RegisterForm";

type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number;
};

export default function Home() {
  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>([]);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const fetchItems = async () => {
      const response = await getItemsForMenu();

      if (!response) {
        console.log("Algo ha ido mal");
        return;
      }

      setItemsMenu(response);
    };

    fetchItems();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);

    handleScroll();
    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center pt-10 pb-6 overflow-hidden">
      {/* Fondo base */}
      <div className="absolute inset-0 -z-20 bg-gradient-to-b from-blue-50 via-white to-white" />

      {/* Parallax decorativo 2 (islazul) */}
      <div
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          transform: `translateY(${scrollY * 0.08}px)`,
        }}
      >
        <Image
          src="/islazul.jpg"
          alt="Decoración Islazul"
          priority
          fill
          className="object-cover opacity-20 scale-110"
        />
      </div>

      {/* Logo con parallax principal */}
      <div
        className="relative transition-transform duration-300 ease-out will-change-transform"
        style={{
          transform: `translateY(${scrollY * 0.15}px) scale(${
            1 + scrollY * 0.0002
          })`,
        }}
      >
        <div className="relative h-28 w-28 sm:h-36 sm:w-36 rounded-full overflow-hidden shadow-xl ring-4 ring-white animate-fade-in">
          <Image
            src="/Favicon.webp"
            alt="Santiago Habana Logo"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      {/* Título */}
      <h1 className="mt-6 text-2xl font-bold tracking-tight animate-fade-in">
        Menú Cafetería
      </h1>

      <p className="text-sm text-muted-foreground mt-1 animate-fade-in">
        Calidad, sabor y experiencia
      </p>

      {/* Items */}
      <div className="mt-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {itemsMenu.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
      <RegisterForm />
    </div>
  );
}
