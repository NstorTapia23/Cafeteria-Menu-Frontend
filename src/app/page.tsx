"use client";
import { MenuItemCard } from "@/components/commons/Menu-Item-Card";
import RegisterForm from "@/components/RegisterForm";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getItemsForMenu } from "./actions";
type MenuInfoType = {
  id: number;
  name: string;
  description: string | null;
  url: string | null;
  price: number;
};
export default function Home() {
  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>([]);

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
  const router = useRouter();
  return (
    <div>
      <Image src="/Favicon.webp" alt="Logo" width={120} height={120} priority />
      <button onClick={() => router.push("/admin")}>Ir a admin</button>
      <h1>Menu Cafeteria</h1>
      {itemsMenu.map((x) => (
        <MenuItemCard key={x.id} item={x} />
      ))}

      <RegisterForm></RegisterForm>
    </div>
  );
}
