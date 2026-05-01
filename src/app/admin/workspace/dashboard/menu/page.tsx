// app/admin/workspace/dashboard/menu/page.tsx
import { getAllItems } from "@/repositories/items";
import MenuDashboardClient from "@/components/MenuDashboardClient";

// Página completamente estática, revalidada manualmente con revalidatePath
export const dynamic = "force-static";

export default async function MenuDashboardPage() {
  const items = await getAllItems();
  return <MenuDashboardClient initialItems={items} />;
}