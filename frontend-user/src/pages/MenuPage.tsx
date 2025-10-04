import React from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchMenu } from "../api/menu.api";
import MenuGrid from "../components/Menu/MenuGrid";
import { useCart } from "../stores/cart.store";
import CartDrawer from "../components/Cart/CartDrawer";
import { useTableFromUrl } from "../hooks/useTable";
import type { MenuItem } from "../types/types";
import RestaurantMenuApp from "../components/Menu/MenuGrid";

export default function MenuPage() {
  const { tableId } = useTableFromUrl();
  const rid = import.meta.env.VITE_RID || "restro10";

const {
  data: menu,
  isLoading,
  error,
} = useQuery({
  queryKey: ["menu"],
  queryFn: async () => {
    const res = await fetchMenu(); // <-- already usable JSON

    if (!res?.response || res.response.length === 0) {
      throw new Error("Menu not found");
    }

    return res.response[0]; // clean object
  },
  staleTime: 1000 * 60 * 2,
  retry: 1,
});





  const add = useCart((s) => s.addItem);

  const handleAdd = (payload: {
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }) => {
    add(payload);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* <header className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{menu?.title || "Menu"}</h1>
            <div className="text-sm text-gray-500">
              Table: {tableId || "Select a table"}
            </div>
          </div>
        </div>
      </header> */}

      <main className="max-w-5xl mx-auto">
        {isLoading && (
          <div className="text-center text-gray-500">Loading menu…</div>
        )}
        {error && (
          <div className="text-center text-red-500">Failed to load menu {error.message}</div>
        )}
        {/* {menu && (
          <MenuGrid
            items={menu.items.filter((i:MenuItem) => i.isActive !== false)}
            onAdd={handleAdd}
          />
        )} */}
        {menu && (
  <RestaurantMenuApp 
    menuData={menu}
    tableId={tableId}
    onAddToCart={handleAdd}
  />
)}
      </main>

      {/* <CartDrawer /> */}
    </div>
  );
}
