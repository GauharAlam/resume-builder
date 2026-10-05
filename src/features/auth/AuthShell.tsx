import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { FileText } from "lucide-react";

/** Shared page frame for the sign-in and sign-up forms. */
const AuthShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const previous = document.body.style.background;
    document.body.style.background = "#F3F4F6";
    return () => {
      document.body.style.background = previous;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#F3F4F6] p-4 font-inter">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        aria-hidden="true"
        style={{ background: "radial-gradient(60% 60% at 50% 0%, rgba(43,95,217,0.14) 0%, rgba(43,95,217,0) 100%)" }}
      />
      <div className="relative z-10 flex flex-col items-center">
        <Link to="/" className="animate-fade-rise mb-7 flex items-center gap-2.5" aria-label="ResumeAI home">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#2B5FD9]">
            <FileText className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
          </span>
          <span className="text-xl font-semibold tracking-tight text-[#14161A]">ResumeAI</span>
        </Link>
        <div className="animate-fade-rise" style={{ animationDelay: "120ms" }}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
