"use client";
import { getItemsForMenu } from "@/app/actions";
import { MenuItemCard } from "@/components/commons/Menu-Item-Card";
import CreateItemPage from "@/components/commons/newItemForm";
import { useAuthContext } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number;
};

export default function DashboardMenuPage() {
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>([]);
  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/admin");
    }
    const fetchItems = async () => {
      const response = await getItemsForMenu();
      if (!response) return null;
      setItemsMenu(response);
    };
    fetchItems();
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "admin") {
    return null;
  }
  return (
    <div>
      <div className="mt-10 w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 gap-4 px-4">
        {itemsMenu.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
      <CreateItemPage></CreateItemPage>
    </div>
  );
}
