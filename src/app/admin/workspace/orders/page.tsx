import { getOpenOrders } from "@/repositories/orders";
import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";
import { getOrderItemsCooked } from "./actions";

export default async function OrdersPage() {
  const ordenesAbiertas = await getOpenOrders();
  const orderItemsCooked = await getOrderItemsCooked();
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
      pendientesIniciales={orderItemsCooked}
    />
  );
}
