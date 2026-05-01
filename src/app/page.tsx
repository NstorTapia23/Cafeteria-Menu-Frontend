// app/page.tsx
import { getAllItems } from "@/repositories/items";
import MenuClient from "@/components/menu/MenuClient";

export const dynamic = 'force-static';

export default async function HomePage() {
  const items = await getAllItems();

  return <MenuClient items={items} />;
}