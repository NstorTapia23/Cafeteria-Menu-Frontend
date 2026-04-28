'use client';
import { useEffect, useRef } from "react";
// ...

export default function DashboardMenuPage() {
  const { isAuthenticated, user } = useAuthContext();
  const router = useRouter();
  const [itemsMenu, setItemsMenu] = useState<MenuInfoType[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== "admin") {
      router.push("/admin");
      return; // ✔️ Evita el fetch si no tiene permisos
    }

    if (fetchedRef.current) return; // ✔️ Evita doble fetch
    fetchedRef.current = true;

    const abortController = new AbortController();

    const fetchItems = async () => {
      try {
        const response = await getItemsForMenu();
        if (!abortController.signal.aborted) setItemsMenu(response);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();

    return () => abortController.abort(); // ✔️ Cancela la petición al desmontar
  }, [isAuthenticated, user?.role, router]); // ✔️ Dependencia más precisa

  if (!isAuthenticated || user?.role !== "admin") return null;
  if (loading) return <div>Cargando menú...</div>;

  return (...);
}