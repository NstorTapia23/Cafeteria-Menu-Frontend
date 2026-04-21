import { getOpenOrders } from "@/repositories/orders";
import OrdersAndPendsClient from "@/components/OrdersAndPendsClient";

const productosPendientes = [
  { id: 101, producto: "Hamburguesa", cantidad: 2, numberTable: 5 },
  { id: 102, producto: "Pizza", cantidad: 1, numberTable: 3 },
  { id: 103, producto: "Sushi", cantidad: 1, numberTable: 8 },
];

export default async function OrdersPage() {
  const ordenesAbiertas = await getOpenOrders();
  return (
    <OrdersAndPendsClient
      ordenesIniciales={ordenesAbiertas}
      pendientesIniciales={productosPendientes}
    />
  );
}
