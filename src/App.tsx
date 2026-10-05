import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { Loader2 } from "lucide-react";
import { AuthProvider } from "./context";
import { ResumeProvider } from "./hooks";
import LandingPage from "./features/resume/LandingPage";
import ProtectedRoute from "./features/auth/ProtectedRoute";
import ToastHost from "./components/common/ToastHost";
import "./styles/app.css";

// Everything past the landing page is loaded on demand, so first-time
// visitors only download what the landing page needs.
const EditorPage = lazy(() => import("./features/resume/EditorPage"));
const PublicResumePage = lazy(() => import("./features/resume/PublicResumePage"));
const ResumeHistory = lazy(() => import("./components/editor/ResumeHistory"));
const LoginPage = lazy(() => import("./features/auth/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/RegisterPage"));

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

/* Clerk's forms, matched to the app's light theme */
const clerkAppearance = {
  variables: {
    colorPrimary: "#2B5FD9",
    colorBackground: "#FFFFFF",
    colorText: "#14161A",
    colorTextSecondary: "#6B7280",
    colorInputBackground: "#FFFFFF",
    colorInputText: "#14161A",
    colorDanger: "#DC2626",
    borderRadius: "0.75rem",
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  elements: {
    card: {
      border: "1px solid #E9EAEE",
      boxShadow: "0 12px 40px rgba(16,24,40,0.08)",
      borderRadius: "1rem",
    },
    headerTitle: { fontWeight: "600", letterSpacing: "-0.02em" },
    formButtonPrimary: {
      background: "#2B5FD9",
      textTransform: "none",
      fontWeight: "500",
      fontSize: "0.9rem",
      boxShadow: "none",
      "&:hover": { background: "#2450BD" },
    },
    formFieldInput: {
      border: "1px solid #E3E5EA",
      "&:focus": { borderColor: "#2B5FD9", boxShadow: "0 0 0 3px rgba(43,95,217,0.15)" },
    },
    socialButtonsBlockButton: {
      border: "1px solid #E3E5EA",
      "&:hover": { background: "#F6F7F9" },
    },
    footerActionLink: { color: "#2B5FD9", fontWeight: "500" },
  },
};

const PageLoader: React.FC = () => (
  <div className="flex h-[100dvh] items-center justify-center bg-[#F3F4F6]">
    <Loader2 className="h-6 w-6 animate-spin text-[#2B5FD9]" aria-label="Loading" />
  </div>
);

const App: React.FC = () => {
  const navigate = useNavigate();

  if (!clerkPubKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
    return (
      <div className="flex h-[100dvh] items-center justify-center bg-[#F3F4F6] p-6 text-center font-inter text-sm text-[#6B7280]">
        The app isn't configured yet: VITE_CLERK_PUBLISHABLE_KEY is missing.
      </div>
    );
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      appearance={clerkAppearance}
    >
      <AuthProvider>
        <ResumeProvider>
          <div className="min-h-screen">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login/*" element={<LoginPage />} />
                <Route path="/register/*" element={<RegisterPage />} />
                <Route path="/view/:shareId" element={<PublicResumePage />} />

                {/* Private Routes */}
                <Route element={<ProtectedRoute />}>
                  {/* /try starts a new resume; it needs an account like the rest of the editor */}
                  <Route path="/try" element={<EditorPage />} />
                  <Route path="/edit-resume/:id" element={<EditorPage />} />
                  <Route path="/history" element={<ResumeHistory />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
            <ToastHost />
          </div>
        </ResumeProvider>
      </AuthProvider>
    </ClerkProvider>
  );
};

export default App;
