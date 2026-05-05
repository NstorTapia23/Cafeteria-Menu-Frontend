import { getAllItems } from "@/repositories/items";
import MenuDashboardClient from "@/components/MenuDashboardClient";
import { getActiveItemCategories } from "@/repositories/categories";
export const dynamic = "force-static";

export default async function MenuDashboardPage() {
  const items = await getAllItems();
  const categories = await getActiveItemCategories()
  return <MenuDashboardClient initialItems={items} itemCategories= {categories} />;
} 