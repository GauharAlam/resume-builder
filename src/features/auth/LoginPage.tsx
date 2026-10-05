import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/context";
import { getPostAuthRedirect } from "@/utils/authRedirect";
import AuthShell from "./AuthShell";

const LoginPage: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  // Where the visitor was headed before being asked to sign in (default: dashboard)
  const redirectUrl = getPostAuthRedirect();

  // Already signed in: no reason to show the form again
  if (!loading && isAuthenticated) return <Navigate to={redirectUrl} replace />;

  return (
    <AuthShell>
      <SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl={redirectUrl} fallbackRedirectUrl={redirectUrl} />
    </AuthShell>
  );
};

export default LoginPage;
