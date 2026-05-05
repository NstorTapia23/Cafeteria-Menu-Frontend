import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";
import { getCookedElementsCard } from "@/repositories/orderItems";
import { getOpenOrders } from "@/repositories/orders";

export default async function OrdersPage() {
  const ordenesAbiertas = await getOpenOrders();
  const orderItemsCooked = await getCookedElementsCard("cooked");
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
      pendientesIniciales={orderItemsCooked}
    />
  );
}

