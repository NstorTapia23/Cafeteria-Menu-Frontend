import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";
import { getOrderItemsCooked, OrdersAction } from "./actions";

export default async function OrdersPage() {
  const ordenesAbiertas = await OrdersAction();
  const orderItemsCooked = await getOrderItemsCooked();
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
      pendientesIniciales={orderItemsCooked}
    />
  );
}
