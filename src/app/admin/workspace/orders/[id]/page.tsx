import OrderDetailPage from "@/components/OrderViewsInfo";
import {
  getOrderItemsByOrderId,
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

  return (
    <OrderDetailPage
      orderId={orderId}
      initialItems={parsedOrderItems}
    />
  );
}
