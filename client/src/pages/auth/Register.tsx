import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Icon } from "@iconify/react/dist/iconify.js";

const Register: React.FC = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        toast.success("Registration successful! You can now login.");
        navigate("/login");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Registration failed");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return (
    <div className="container mx-auto mt-28 p-4 max-w-md">
      <div className="flex flex-col items-center gap-2">
        <Icon icon="uil:user" className="w-10 h-10" />
        <h2 className="text-3xl font-semibold mb-4 text-center">Register</h2>
      </div>
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-md rounded-md px-8 pt-6 pb-8 mb-4"
      >
        <div className="mb-4">
          <label
            htmlFor="username"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Username
          </label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Enter your username"
            required
          />
        </div>

        <div className="mb-4">
          <label
            htmlFor="password"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="******************"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="confirmPassword"
            className="block text-gray-700 text-sm font-bold mb-2"
          >
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="shadow appearance-none border rounded-md w-full py-4 px-5 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="******************"
            required
          />
        </div>
        <div className="flex items-center justify-between flex-col gap-4">
          <button
            type="submit"
            className="bg-teal-500 hover:bg-teal-700 w-full text-white font-bold py-4 px-5 rounded-md focus:outline-none focus:shadow-outline"
          >
            Register
          </button>
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link
              to="/login"
              className="inline-block align-baseline text-gray-900 font-semibold hover:text-teal-500"
            >
              Login!
            </Link>
          </p>
        </div>
      </form>
      <p className="text-center text-gray-500 text-xs">
        &copy;2024 My Shop Corp. All rights reserved.
      </p>
    </div>
  );
};

export default Register;
