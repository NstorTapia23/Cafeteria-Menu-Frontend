import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";
import { getOpenOrdersActions } from "./actions";

export default async function OrdersPage() {
  const ordenesAbiertas = await getOpenOrdersActions();
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
    />
  );
}

