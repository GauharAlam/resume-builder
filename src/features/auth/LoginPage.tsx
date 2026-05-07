import React from "react";
import { SignIn } from "@clerk/clerk-react";

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <SignIn routing="path" path="/login" signUpUrl="/register" forceRedirectUrl="/history" fallbackRedirectUrl="/history" />
    </div>
  );
};

export default LoginPage;
