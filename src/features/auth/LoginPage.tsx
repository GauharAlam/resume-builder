import React from "react";
import { SignIn } from "@clerk/clerk-react";
import { FileText } from "lucide-react";

const LoginPage: React.FC = () => {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: "#0D1512" }}
    >
      {/* Ambient blob */}
      <div
        className="pointer-events-none absolute animate-blob"
        aria-hidden="true"
        style={{
          top: "-20%",
          left: "-15%",
          width: "60vw",
          height: "60vw",
          borderRadius: "50%",
          background: "#16532d",
          opacity: 0.28,
          filter: "blur(100px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center">
        {/* Logo */}
        <div className="flex items-center gap-3 mb-8 animate-fade-rise">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{
              background: "rgba(74,222,128,0.15)",
              border: "1px solid rgba(74,222,128,0.28)",
            }}
          >
            <FileText className="w-5 h-5" style={{ color: "#4ade80" }} />
          </div>
          <span
            className="text-lg font-bold tracking-tight"
            style={{ color: "#F0FDF4" }}
          >
            ResumeAI
          </span>
        </div>

        {/* Sign In Form */}
        <div className="animate-fade-rise" style={{ animationDelay: "150ms" }}>
          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            forceRedirectUrl="/history"
            fallbackRedirectUrl="/history"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
