import OrderDetailPage from "@/components/OrderViewsInfo";
import {
  getOrderItemsByOrderId,
  getActiveItemsWithPrice,
} from "@/repositories/orderItems";
import { OrderItemsSchema } from "@/schemas/orderItemsSchemas";

export default async function IdOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);

  const orderItems = await getOrderItemsByOrderId(orderId);
  const parsedOrderItems = OrderItemsSchema.parse(orderItems);
  const menuItems = await getActiveItemsWithPrice();

  return (
    <OrderDetailPage
      orderId={orderId}
      initialItems={parsedOrderItems}
      menuItems={menuItems}
    />
  );
}
