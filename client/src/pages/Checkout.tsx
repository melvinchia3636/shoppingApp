import React, { useContext, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthContext";
import { CartItem } from "../types";
import { Icon } from "@iconify/react/dist/iconify.js";
import toast from "react-hot-toast";

interface CheckoutProps {
  cartItems: CartItem[];
  fetchCartItems: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ cartItems, fetchCartItems }) => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName || !formData.email || !formData.address) {
      toast.error("Please fill out all required fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderItems: cartItems.map((item) => ({
            id: item.id,
            productId: item.product.id,
            quantity: item.quantity,
          })),
          shippingAddress: formData,
        }),
      });

      if (response.ok) {
        toast.success("Order placed successfully!");
        fetchCartItems();
        navigate(`/orders`);
      } else {
        const errorData = await response.json();
        console.error("Error during checkout:", errorData.error);
        toast.error(errorData.error || "Failed to place order.");
      }
    } catch (error) {
      console.error("Error during checkout:", error);
      toast.error("An error occurred while placing the order.");
    }
  };

  return cartItems.length === 0 ? (
    <Navigate to="/cart" />
  ) : (
    <div className="flex w-full p-4 gap-12">
      <div className="w-1/2 px-8 mt-28">
        <h2 className="text-2xl font-semibold mb-4 text-center">Checkout</h2>

        {/* Order Summary */}
        <div className="mb-4">
          <h3 className="text-lg font-medium mb-2">Order Summary</h3>
          <ul className="divide-y divide-gray-200">
            {cartItems.map((item) => (
              <li
                key={item.product.id}
                className="py-4 px-2 flex justify-between"
              >
                <span>
                  {item.product.title} x {item.quantity}
                </span>
                <span>${(item.product.price * item.quantity).toFixed(2)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 text-right text-lg">
            <p className="font-bold">Total: ${calculateTotal().toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Checkout Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white w-1/2 sticky mt-28 h-fit top-28 shadow-md rounded-md px-8 mr-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            htmlFor="fullName"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Full Name*
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Email*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="johndoe@gmail.com"
            value={formData.email}
            onChange={handleChange}
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Address*
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="123 Main St"
            value={formData.address}
            onChange={handleChange}
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="city"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="San Francisco"
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="state"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            State
          </label>
          <input
            type="text"
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="CA"
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="zip"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Zip
          </label>
          <input
            type="text"
            id="zip"
            name="zip"
            value={formData.zip}
            onChange={handleChange}
            placeholder="12345"
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-700 text-white w-full mt-6 justify-center font-semibold py-4 px-5 flex items-center gap-2 rounded-md focus:outline-none focus:shadow-outline"
        >
          Place Order
          <Icon icon="uil:arrow-right" className="w-6 h-6" />
        </button>
      </form>
    </div>
  );
};

export default Checkout;
