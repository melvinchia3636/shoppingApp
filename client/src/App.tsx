import { useState, useEffect, useContext } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "./pages/ProductRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductDetail from "./components/products/ProductDetail";
import { CartItem, Product } from "./types";
import toast from "react-hot-toast";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import { AuthContext } from "./providers/AuthContext";
import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import NotFoundPage from "./pages/NotFound";

function App() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { isLoggedIn, token } = useContext(AuthContext);

  const calculateTotalQuantity = () => {
    console.log(cartItems);
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      if (!isLoggedIn) {
        toast.error("Please log in to add items to cart.");
        return;
      }

      const response = await fetch("http://localhost:3001/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ productId: product.id, quantity: 1 }),
      });

      if (response.ok) {
        const updatedCartItem = await response.json();
        const newCartItems = cartItems.map((item) => {
          if (item.product.id === updatedCartItem.product.id) {
            return updatedCartItem;
          }
          return item;
        });

        if (
          !cartItems.some(
            (item) => item.product.id === updatedCartItem.product.id
          )
        ) {
          newCartItems.push(updatedCartItem);
        }

        setCartItems(newCartItems);

        toast.success("Item added to cart!", {
          icon: "🛒",
        });
      } else {
        const errorData = await response.json();
        console.error("Error adding to cart:", errorData.error);

        toast.error(errorData.error || "Failed to add item to cart.");
      }
    } catch (error) {
      console.error("Unexpected error during add to bag:", error);
      toast.error("An error occurred while adding the item to cart.");
    }
  };

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch("http://localhost:3001/cart", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setCartItems(data);
      } else {
        const errorData = await response.json();
        console.error("Error fetching cart items:", errorData.error);
      }
    } catch (error) {
      console.error("Error fetching cart items:", error);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCartItems();
    }
  }, [isLoggedIn]);

  return (
    <main className="w-full min-h-dvh text-gray-900 flex flex-col">
      <BrowserRouter>
        <Navbar
          cartItemCount={calculateTotalQuantity()}
          setCartItems={setCartItems}
        />
        <Routes>
          <Route path="/" element={<Home onAddToCart={handleAddToCart} />} />
          <Route
            path="/product/:id"
            element={<ProductDetail onAddToCart={handleAddToCart} />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/cart"
              element={
                <Cart cartItems={cartItems} setCartItems={setCartItems} />
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout
                  cartItems={cartItems}
                  fetchCartItems={fetchCartItems}
                />
              }
            />
            <Route
              path="/orders"
              element={<Orders fetchCartItem={fetchCartItems} />}
            />
          </Route>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;
