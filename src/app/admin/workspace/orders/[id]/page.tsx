// app/admin/workspace/orders/[id]/page.tsx
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

  // Obtener los ítems de la orden (con precios calculados)
  const orderItems = await getOrderItemsByOrderId(orderId);
  // Validar con Zod
  const parsedOrderItems = OrderItemsSchema.parse(orderItems);

  // Obtener los ítems activos del menú (id, nombre, precio actual)
  const menuItems = await getActiveItemsWithPrice();

  return (
    <OrderDetailPage
      orderId={orderId}
      initialItems={parsedOrderItems}
      menuItems={menuItems}
    />
  );
}
