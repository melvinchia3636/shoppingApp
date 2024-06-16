import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import toast from "react-hot-toast";
import { CartItem } from "../types";
import { AuthContext } from "../providers/AuthContext";

interface CartProps {
  cartItems: CartItem[];
  setCartItems: (cartItems: CartItem[]) => void;
}

function Cart({ cartItems, setCartItems }: CartProps) {
  const { isLoggedIn, token } = useContext(AuthContext);

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleRemoveFromCart = async (cartItemId: number) => {
    try {
      if (!isLoggedIn) {
        toast.error("Please log in");
        return;
      }

      const response = await fetch(`http://localhost:3001/cart/${cartItemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const updatedCart = cartItems.filter((item) => item.id !== cartItemId);
        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));

        toast.success("Item removed from cart.");
      } else {
        const errorData = await response.json();
        console.error("Error adding to cart:", errorData.error);

        toast.error(errorData.error || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Unexpected error during remove from cart:", error);
      toast.error("An error occurred while removing the item from cart.");
    }
  };

  const updateQuantity = async (cartItemId: number, quantity: number) => {
    try {
      if (!isLoggedIn) {
        toast.error("Please log in");
        return;
      }

      const response = await fetch(`http://localhost:3001/cart/${cartItemId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          quantity:
            (cartItems.find((item) => item.id === cartItemId)?.quantity || 0) +
            quantity,
        }),
      });

      if (response.ok) {
        const updatedCart = cartItems.map((item) => {
          if (item.id === cartItemId) {
            return {
              ...item,
              quantity: item.quantity + quantity,
            };
          }
          return item;
        });

        setCartItems(updatedCart);
        localStorage.setItem("cart", JSON.stringify(updatedCart));
      } else {
        toast.error("Failed to update quantity.");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("An error occurred while updating the quantity.");
    }
  };

  return (
    <div className="container mx-auto mt-28 mb-8 p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Shopping Cart</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 bg-white rounded-md shadow-md">
          <p className="text-gray-500 text-lg">Your cart is empty.</p>
          <Link
            to="/"
            className="bg-teal-500 hover:bg-teal-700 text-white font-bold py-3 px-5 flex items-center gap-2 rounded-md mt-6 transition-all duration-200"
          >
            Start Shopping
            <Icon icon="uil:arrow-right" className="w-6 h-6" />
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-md shadow-md p-6">
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row items-center justify-between py-4 gap-12"
              >
                <div className="flex-1 flex w-full gap-4">
                  <img
                    src={item.product.image}
                    alt={item.product.title}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                  <div>
                    <Link to={`/product/${item.product.id}`}>
                      <h2 className="text-lg font-semibold hover:text-teal-500 transition-colors duration-200">
                        {item.product.title}
                      </h2>
                    </Link>
                    <p className="text-gray-600">${item.product.price}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 justify-end w-full sm:w-auto">
                  <div className="flex items-center w-full border rounded-md overflow-hidden border-gray-300">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-2 sm:py-3 sm:px-4 transition-colors duration-200"
                      disabled={item.quantity === 1}
                    >
                      <Icon icon="uil:minus" className="w-5 h-5" />
                    </button>
                    <span className="px-4 py-2 w-full text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-2 sm:py-3 sm:px-4 transition-colors duration-200"
                    >
                      <Icon icon="uil:plus" className="w-5 h-5" />
                    </button>
                  </div>

                  <button
                    onClick={() => handleRemoveFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 py-2 px-2 sm:py-2 sm:px-4 rounded-md ml-4 transition-colors duration-200"
                  >
                    <Icon icon="uil:minus-circle" className="w-7 h-7" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <p className="text-xl font-bold">
              Total: ${calculateTotal().toFixed(2)}
            </p>
            <Link
              to="/checkout"
              className="bg-gradient-to-r from-teal-500 to-green-500 hover:from-teal-700 hover:to-green-700 text-white font-semibold py-3 px-6 flex items-center gap-2 rounded-md transition-all duration-200"
            >
              Checkout <Icon icon="uil:arrow-right" className="w-6 h-6" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;
