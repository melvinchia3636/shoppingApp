import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../providers/AuthContext";
import { Order } from "../types";
import OrderItem from "../components/orders/OrderItem";

interface OrderHistoryProps {
  fetchCartItem: () => void;
}

const OrderHistory: React.FC<OrderHistoryProps> = ({ fetchCartItem }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("http://localhost:3001/orders", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        } else {
          console.error("Error fetching orders:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
      }
    };

    fetchOrders();
  }, [token]);

  return (
    <div className="container mx-auto mt-28 p-4 w-full min-w-0">
      <h1 className="text-3xl font-bold mb-6 text-center">Order History</h1>

      {orders.length > 0 ? (
        <div className="space-y-4 w-full min-w-0">
          {orders.map((order) => (
            <OrderItem
              key={order.id}
              order={order}
              orders={orders}
              setOrders={setOrders}
              fetchCartItem={fetchCartItem}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-gray-500 text-lg">No orders found.</p>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
