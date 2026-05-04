import { notFound } from "next/navigation";
import { getMenuItems } from "./actions";
import { getActiveItemCategories } from "@/repositories/categories";
import { OrderItemsPicker } from "@/components/order-items-picker";

type PageProps = {
  params: {
    id: string;
  };
};
export default async function OrderItemsPage({ params }: PageProps) {
  const { id } = await params;
  const orderId = Number(id);

  if (!Number.isInteger(orderId) || orderId <= 0) {
    notFound();
  }

  const [categories, menuItems] = await Promise.all([
    getActiveItemCategories(),
    getMenuItems(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl p-4 md:p-6">
      <OrderItemsPicker
        orderId={orderId}
        categories={categories}
        menuItems={menuItems}
      />
    </div>
  );
}