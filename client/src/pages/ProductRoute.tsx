import { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../providers/AuthContext";

const ProtectedRoute = () => {
  const { isLoggedIn, isLoading } = useContext(AuthContext);
  return isLoading ? null : isLoggedIn ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;
