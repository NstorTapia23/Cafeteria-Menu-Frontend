"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { MenuItemCard } from "@/components/commons/Menu-Item-Card";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  categoryId: number;
  url: string | null;
  price: number;
  elaborationArea: "cocina" | "bar" | "lunch";
};

type FilterType = {
  id: number;
  name: string;
};

export default function MenuClient({
  items,
  filters,
}: {
  items: MenuInfoType[];
  filters: FilterType[];
}) {
  const [scrollY, setScrollY] = useState(0);
  const [selectedFilter, setSelectedFilter] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const filteredItems = useMemo(() => {
    if (selectedFilter === null) return items;
    return items.filter((item) => item.categoryId === selectedFilter);
  }, [items, selectedFilter]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      <div className="relative z-10 flex flex-col items-center pt-10 pb-6">
        
        {/* Logo con parallax */}
        <div
          className="transition-transform duration-300 ease-out will-change-transform"
          style={{
            transform: `translateY(${scrollY * 0.15}px) scale(${
              1 + scrollY * 0.0002
            })`,
          }}
        >
          <div className="relative h-28 w-28 overflow-hidden rounded-full shadow-xl sm:h-36 sm:w-36">
            <Image
              src="/Favicon.webp"
              alt="Santiago Habana Logo"
              fill
              sizes="(max-width: 640px) 112px, 144px"
              className="object-cover"
              priority
            />
          </div>
        </div>

        {/* Header */}
        <Card className="mt-6 border-none bg-white/70 backdrop-blur-md shadow-lg">
          <CardContent className="px-6 py-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight">
              Bienvenido al Santiago Habana.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Calidad, sabor y experiencia
            </p>
          </CardContent>
        </Card>

        {/* Filtros */}
        <div className="mt-8 w-full max-w-4xl px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            
            <Button
              variant={selectedFilter === null ? "default" : "secondary"}
              className="rounded-full shrink-0"
              onClick={() => setSelectedFilter(null)}
            >
              Todos
            </Button>

            {filters.map((filter) => (
              <Button
                key={filter.id}
                variant={
                  selectedFilter === filter.id ? "default" : "secondary"
                }
                className="rounded-full shrink-0"
                onClick={() => setSelectedFilter(filter.id)}
              >
                {filter.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Lista */}
        <div className="mt-8 w-full max-w-4xl grid grid-cols-1 gap-4 px-4 sm:grid-cols-2">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} />
            ))
          ) : (
            <Card className="col-span-full bg-white/70 backdrop-blur-md border-none shadow-sm">
              <CardContent className="px-6 py-10 text-center">
                <p className="text-sm text-muted-foreground">
                  No hay productos en esta categoría.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}