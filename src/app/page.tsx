import { getAllItems } from "@/repositories/items";
import MenuClient from "@/components/menu/MenuClient";
import { getActiveItemCategories } from "@/repositories/categories";
export const dynamic = 'force-static';

export default async function HomePage() {
  const items = await getAllItems();
  const filtersItems = await getActiveItemCategories();
  return <MenuClient items={items}  filters = {filtersItems} />;
}