"use client";

import * as React from "react";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
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
    <Card className={cn("overflow-hidden rounded-2xl shadow-sm", className)}>
      <div className="relative aspect-4/3 w-full bg-muted">
        {showImage ? (
          <Image
            src={item.url as string}
            alt={item.name}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-muted to-muted/60">
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-background/80 shadow-sm">
                <ImageOff className="h-7 w-7" />
              </div>
              <span className="text-xs font-medium">Sin imagen</span>
            </div>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold leading-none">
              {item.name}
            </h3>
            {item.description ? (
              <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>

          <div className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
            ${item.price.toFixed(2)}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
