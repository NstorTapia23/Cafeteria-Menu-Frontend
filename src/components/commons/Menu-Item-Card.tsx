"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number;
};

interface MenuItemCardProps {
  item: MenuInfoType;
  className?: string;
}

export function MenuItemCard({ item, className }: MenuItemCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const showImage = Boolean(item.url) && !imageError;

  return (
    <Card
      className={cn(
        "w-full rounded-xl shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-1",
        className,
      )}
    >
      <div className="flex items-center gap-4 p-4">
        {/* Imagen */}
        <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          {showImage ? (
            <Image
              src={item.url as string}
              alt={item.name}
              fill
              className="object-cover"
              onError={() => setImageError(true)}
              unoptimized
              sizes="80px"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <ImageOff className="h-5 w-5 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Contenido */}
        <div className="flex min-w-0 flex-1 flex-col">
          <h3 className="truncate text-sm font-semibold">{item.name}</h3>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {item.description}
            </p>
          )}

          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Disponible</span>

            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              ${item.price.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
