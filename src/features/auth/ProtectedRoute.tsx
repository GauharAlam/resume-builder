import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/context";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // ✅ Wait until localStorage check is done
  if (loading) {
    return <div>Loading...</div>; // or spinner
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
