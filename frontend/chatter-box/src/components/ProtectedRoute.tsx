import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const auth = useContext(AuthContext);
  console.log("ProtectedRoute-->", auth);
  return auth?.token
    ? <Outlet />
    : <Navigate to="/login" replace />;
}
