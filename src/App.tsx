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
        <ClerkProvider publishableKey={clerkPubKey} routerPush={(to) => navigate(to)} routerReplace={(to) => navigate(to, { replace: true })}>
            <ThemeProvider>
                <AuthProvider>
                    <ResumeProvider>
                        <div className="min-h-screen bg-white dark:bg-slate-950 transition-colors duration-300">
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
