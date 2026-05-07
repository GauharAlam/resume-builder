import React from "react";
import { SignUp } from "@clerk/clerk-react";

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <SignUp routing="path" path="/register" signInUrl="/login" forceRedirectUrl="/history" fallbackRedirectUrl="/history" />
    </div>
  );
};

export default RegisterPage;
