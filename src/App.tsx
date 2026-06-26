import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { AuthProvider, ThemeProvider } from "./context";
import { ResumeProvider } from "./hooks";
import { HomePage, EditorPage, PublicResumePage } from "./features/resume";
import { LoginPage, RegisterPage, ProtectedRoute } from "./features/auth";
import { ResumeHistory } from "./components/editor";
import "./styles/app.css";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

const App: React.FC = () => {
  const navigate = useNavigate();

  if (!clerkPubKey) {
    console.error("Missing VITE_CLERK_PUBLISHABLE_KEY environment variable");
    return <div>Missing Clerk Publishable Key</div>;
  }

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      appearance={{
        variables: {
          colorPrimary: "#4ade80",
          colorBackground: "#0D1512",
          colorText: "#F0FDF4",
          colorTextSecondary: "rgba(209,250,229,0.65)",
          colorInputBackground: "rgba(255,255,255,0.06)",
          colorInputText: "#F0FDF4",
          colorBorder: "rgba(255,255,255,0.08)",
          colorTextOnPrimaryBackground: "#0D1512",
        },
        elements: {
          card: {
            background: "linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow: "0 24px 64px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255, 255, 255, 0.16)",
            borderRadius: "1.25rem",
          },
          headerTitle: {
            color: "#F0FDF4",
            fontWeight: "800",
            letterSpacing: "-0.025em",
          },
          headerSubtitle: {
            color: "rgba(209,250,229,0.55)",
          },
          socialButtonsBlockButton: {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.09)",
            borderRadius: "0.75rem",
            color: "#F0FDF4",
            transition: "all 0.22s ease",
            "&:hover": {
              background: "rgba(255,255,255,0.09)",
              borderColor: "rgba(74,222,128,0.42)",
              boxShadow: "0 0 12px rgba(74,222,128,0.15)",
            },
          },
          socialButtonsBlockButtonText: {
            color: "#F0FDF4",
            fontWeight: "600",
          },
          formButtonPrimary: {
            background: "linear-gradient(135deg, #4ade80 0%, #22c55e 100%)",
            borderRadius: "0.75rem",
            color: "#0D1512",
            fontWeight: "700",
            textTransform: "none",
            boxShadow: "0 4px 16px rgba(74,222,128,0.25)",
            transition: "all 0.22s ease",
            "&:hover": {
              background: "linear-gradient(135deg, #5bef91 0%, #22c55e 100%)",
              transform: "translateY(-1px)",
              boxShadow: "0 6px 20px rgba(74,222,128,0.35)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          },
          formFieldInput: {
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.11)",
            borderRadius: "0.75rem",
            color: "#F0FDF4",
            transition: "all 0.2s ease",
            "&:focus": {
              background: "rgba(255,255,255,0.08)",
              borderColor: "rgba(74,222,128,0.52)",
              boxShadow: "0 0 0 3px rgba(74,222,128,0.1)",
            },
          },
          formFieldLabel: {
            color: "rgba(209,250,229,0.70)",
            fontWeight: "600",
            fontSize: "0.775rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          },
          footerActionText: {
            color: "rgba(209,250,229,0.45)",
          },
          footerActionLink: {
            color: "#4ade80",
            fontWeight: "600",
            transition: "color 0.2s ease",
            "&:hover": {
              color: "#22c55e",
              textDecoration: "none",
            },
          },
          dividerLine: {
            background: "rgba(255,255,255,0.08)",
          },
          dividerText: {
            color: "rgba(209,250,229,0.35)",
            fontSize: "0.75rem",
          },
          identityPreviewText: {
            color: "#F0FDF4",
          },
          identityPreviewEditButtonIcon: {
            color: "#4ade80",
          },
        },
      }}
    >
      <ThemeProvider>
        <AuthProvider>
          <ResumeProvider>
            <div className="min-h-screen">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<HomePage />} />
                <Route path="/login/*" element={<LoginPage />} />
                <Route path="/register/*" element={<RegisterPage />} />
                <Route path="/view/:shareId" element={<PublicResumePage />} />

                {/* Private Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/edit-resume/:id" element={<EditorPage />} />
                  <Route path="/history" element={<ResumeHistory />} />
                </Route>
              </Routes>
            </div>
          </ResumeProvider>
        </AuthProvider>
      </ThemeProvider>
    </ClerkProvider>
  );
};

export default App;
