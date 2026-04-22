import React, { useState } from "react";
import { useAuth } from "@/context";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, Loader, ArrowLeft } from "lucide-react";
import apiRequest from "@/services/api";
import { trackEvent } from "@/services/analytics";
import GoogleAuthButton from "./GoogleAuthButton";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (token: string) => {
    login(token);
    navigate("/history");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (!result || !result.success) {
        throw new Error(result?.message || "Failed to login");
      }

      const { token, user } = result.data;
      trackEvent("funnel_login_success", { method: "email" });
      handleAuthSuccess(token);

    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred during login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4">
      <Link to="/" className="absolute top-6 left-6 text-gray-500 hover:text-gray-900 transition flex items-center gap-2 font-medium">
        <ArrowLeft className="w-4 h-4" /> Back to Home
      </Link>

      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-200 w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 bg-emerald-50 rounded-xl mb-4">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Welcome back
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Please enter your details to sign in.</p>
        </div>

        <GoogleAuthButton
          mode="login"
          onSuccess={handleAuthSuccess}
          onError={(message) => setError(message || null)}
        />

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or continue with email</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
              <span className="text-base leading-none">⚠️</span>
              <p>{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Mail className="h-5 w-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <Lock className="h-5 w-5" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-12 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <span className="text-gray-600 font-medium">Remember me</span>
            </label>
            <Link
              to="#"
              className="text-emerald-600 hover:text-emerald-700 font-medium transition"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading || !email || !password}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all flex items-center justify-center gap-2 mt-2 ${
              isLoading || !email || !password
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow"
              }`}
          >
            {isLoading ? (
              <>
                <Loader className="h-5 w-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in</span>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
