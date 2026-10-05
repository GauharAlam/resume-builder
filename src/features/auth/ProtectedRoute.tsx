import React, { useEffect } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context";
import { setPostAuthRedirect, clearPostAuthRedirect } from "@/utils/authRedirect";

const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Once the visitor is in, the remembered destination has served its purpose
  useEffect(() => {
    if (!loading && isAuthenticated) clearPostAuthRedirect();
  }, [loading, isAuthenticated]);

  // Wait for Clerk before deciding, so signed-in users aren't bounced to /login
  if (loading) {
    return (
      <div className="flex h-[100dvh] items-center justify-center" style={{ background: "#F3F4F6" }}>
        <Loader2 className="h-6 w-6 animate-spin text-[#2B5FD9]" aria-label="Loading" />
      </div>
    );
  }

  if (!isAuthenticated) {
    // Come back here after signing in
    setPostAuthRedirect(`${location.pathname}${location.search}`);
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
