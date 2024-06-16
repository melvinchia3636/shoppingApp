import React, { useContext, useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "../providers/AuthContext";
import toast from "react-hot-toast";
import { CartItem } from "../types";

interface NavbarProps {
  cartItemCount: number;
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
}

function Navbar({ cartItemCount, setCartItems }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isLoggedIn, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully!");
    setCartItems([]);
    navigate("/");
  };

  return (
    <nav className="bg-teal-500 fixed top-0 z-50 w-full shadow-md">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link
          to="/"
          className="text-white text-2xl font-bold flex items-center"
        >
          <Icon icon="uil:store" className="w-8 h-8 mr-2" />
          My Shop
        </Link>

        <div className="hidden sm:flex items-center space-x-8">
          <Link
            to="/"
            className={`text-white hover:text-gray-300 transition duration-200 ${
              location.pathname === "/" ? "underline" : ""
            }`}
          >
            <Icon icon="mingcute:home-1-line" className="w-6 h-6" />
          </Link>
          {isLoggedIn && (
            <>
              <div className="flex items-center gap-2">
                <Link
                  to="/cart"
                  className={`text-white hover:text-gray-300 transition duration-200 ${
                    location.pathname === "/cart" ? "underline" : ""
                  }`}
                  aria-label="View Cart"
                >
                  <Icon
                    icon="mingcute:shopping-bag-1-line"
                    className="w-6 h-6"
                  />
                </Link>
                {cartItemCount > 0 && (
                  <span className="bg-red-500 text-white rounded-md aspect-square px-2 py-1 flex items-center justify-center text-xs">
                    {cartItemCount}
                  </span>
                )}
              </div>
              <Link
                to="/orders"
                className={`text-white hover:text-gray-300 transition duration-200 ${
                  location.pathname === "/orders" ? "underline" : ""
                }`}
              >
                <Icon icon="uil:receipt" className="w-6 h-6" />
              </Link>
            </>
          )}
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-300 transition duration-200"
            >
              <Icon icon="uil:sign-out-alt" className="w-6 h-6" />
            </button>
          ) : (
            <Link
              to="/login"
              className="bg-white text-teal-500 px-5 py-3 rounded-md font-medium flex items-center gap-2 hover:bg-gray-100 transition duration-200"
            >
              Login
              <Icon icon="uil:arrow-right" className="w-5 h-5 mt-0.5" />
            </Link>
          )}
        </div>

        {/* Hamburger Menu for Mobile */}
        <button
          className="sm:hidden text-white focus:outline-none"
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
        >
          <Icon
            icon={isMenuOpen ? "uil:times" : "uil:bars"}
            className="w-8 h-8"
          />
        </button>

        {/* Mobile Menu Links */}
        {isMenuOpen && (
          <div className="sm:hidden absolute top-20 left-0 w-full bg-teal-500 py-4 shadow-lg">
            <Link
              to="/"
              className="block text-white hover:text-gray-300 py-2 px-4 text-center transition duration-200"
              onClick={toggleMenu}
            >
              Home
            </Link>
            {isLoggedIn && (
              <>
                <Link
                  to="/cart"
                  className="block text-white hover:text-gray-300 py-2 px-4 text-center transition duration-200"
                  onClick={toggleMenu}
                >
                  Cart
                </Link>
                <Link
                  to="/orders"
                  className="block text-white hover:text-gray-300 py-2 px-4 text-center transition duration-200"
                  onClick={toggleMenu}
                >
                  Orders
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="block text-white hover:text-gray-300 py-2 px-4 text-center transition duration-200"
                >
                  Logout
                </button>
              </>
            )}
            {!isLoggedIn && (
              <Link
                to="/login"
                className="block text-teal-500 bg-white hover:bg-gray-100 py-2 px-4 text-center rounded-md transition duration-200"
                onClick={toggleMenu}
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
