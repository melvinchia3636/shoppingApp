import { useContext, useState } from "react";
import { Order } from "../../types";
import { AuthContext } from "../../providers/AuthContext";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react/dist/iconify.js";

function OrderItem({
  order,
  orders,
  setOrders,
  fetchCartItem,
}: {
  order: Order;
  orders: Order[];
  setOrders: (orders: Order[]) => void;
  fetchCartItem: () => void;
}) {
  const { token } = useContext(AuthContext);
  const [detailExpanded, setDetailExpanded] = useState(false);

  const cancelOrder = async (orderId: number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) {
      return;
    }
    try {
      const response = await fetch(`http://localhost:3001/orders/${orderId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedOrders = orders.map((order) => {
          if (order.id === orderId) {
            return { ...order, status: "CANCELLED" };
          }
          return order;
        });

        setOrders(updatedOrders);
        toast.success("Order cancelled successfully!");
      } else {
        console.error("Error cancelling order:", response.statusText);
        toast.error("Failed to cancel order.");
      }
    } catch (error) {
      console.error("Error cancelling order:", error);
      toast.error("An error occurred while cancelling the order.");
    }
  };

  const reorderItem = async (productId: number) => {
    try {
      const response = await fetch(`http://localhost:3001/cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId, quantity: 1 }),
      });

      if (response.ok) {
        fetchCartItem();
        toast.success("Item added to cart!");
      } else {
        console.error("Error reordering item:", response.statusText);
        toast.error("Failed to reorder item.");
      }
    } catch (error) {
      console.error("Error reordering item:", error);
      toast.error("An error occurred while reordering the item.");
    }
  };

  return (
    <div
      key={order.id}
      className="border flex flex-col rounded-lg min-h-0 p-4 mb-4 shadow-md w-full min-w-0"
    >
      <div className="flex w-full h-[4.6rem] min-h-0 items-start justify-between">
        <div className="h-full">
          <p className="font-semibold">Order ID: {order.id}</p>
          <p>Date: {new Date(order.orderDate).toLocaleDateString()}</p>
          <p>Total: ${order.total.toFixed(2)}</p>
        </div>
        <div className="flex flex-col min-h-0 items-center gap-2 justify-between h-full">
          <div
            className={`text-white px-4 py-1 rounded-full text-sm shadow-sm font-semibold ${
              {
                PENDING: "bg-yellow-500",
                SHIPPED: "bg-teal-500",
                DELIVERED: "bg-green-500",
                CANCELLED: "bg-red-500",
              }[order.status] || "bg-gray-500"
            }`}
          >
            {order.status}
          </div>
          <button
            onClick={() => setDetailExpanded(!detailExpanded)}
            className="text-sm text-gray-500 hover:text-gray-700 font-semibold flex items-center pl-4 pr-2"
          >
            {detailExpanded ? "Hide Details" : "Show Details"}
            <Icon
              icon={detailExpanded ? "uil:angle-up" : "uil:angle-down"}
              className="w-5 h-5 mt-0.5"
            />
          </button>
        </div>
      </div>

      {detailExpanded && (
        <ul className="mt-6 divide-y divide-gray-200 w-full min-w-0">
          {order.orderItems.map((item) => (
            <li
              key={item.product.id}
              className="flex items-center py-4 px-2 justify-between gap-24 w-full min-w-0"
            >
              <div className="flex items-center w-full min-w-0">
                <img
                  src={item.product.image}
                  alt={item.product.title}
                  className="w-12 h-12 object-cover rounded-md mr-6"
                />
                <div className="w-full">
                  <p className="font-semibold w-full truncate">
                    {item.product.title}
                  </p>
                  <p>Quantity: {item.quantity}</p>
                  <p>
                    Price: ${(item.product.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
              <button
                onClick={() => reorderItem(item.product.id)}
                className="ml-4 bg-gray-200 flex-shrink-0 hover:bg-gray-300 text-gray-500 hover:text-gray-900 font-semibold py-4 px-5 rounded-md"
              >
                Order Again
              </button>
            </li>
          ))}
        </ul>
      )}
      {order.status === "PENDING" && (
        <button
          onClick={() => cancelOrder(order.id)}
          className="mt-4 w-full bg-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-semibold py-4 px-5 rounded-md"
        >
          Cancel Order
        </button>
      )}
    </div>
  );
}

export default OrderItem;
