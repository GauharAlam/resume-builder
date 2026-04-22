import React, { useState } from "react";
import { useAuth } from "@/context";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import apiRequest from "@/services/api";
import { trackEvent } from "@/services/analytics";
import GoogleAuthButton from "./GoogleAuthButton";

const RegisterPage: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAuthSuccess = (token: string) => {
    login(token);
    navigate("/history");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    if (confirmPassword) {
      setPasswordMatch(newPassword === confirmPassword);
    }
  };

  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newConfirmPassword = e.target.value;
    setConfirmPassword(newConfirmPassword);
    setPasswordMatch(password === newConfirmPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    if (!name.trim()) {
      setError("Name is required.");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const result = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email, password }),
      });

      if (!result || !result.success) {
        throw new Error(result?.message || "Failed to register");
      }

      trackEvent("funnel_register_success", { method: "email" });
      setSuccess("Account created successfully! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err.message);
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Create an account
          </h1>
          <p className="text-gray-500 mt-2 text-sm">Start building your optimal resume</p>
        </div>

        <GoogleAuthButton
          mode="register"
          onSuccess={handleAuthSuccess}
          onError={(message) => setError(message || null)}
        />

        <div className="my-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
          <div className="h-px flex-1 bg-gray-200" />
          <span>or create an account with email</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 p-3 rounded-lg text-sm">
              {success}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Minimum 6 characters"
              required
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Re-enter your password"
              required
              className={`w-full px-4 py-2.5 rounded-lg border outline-none transition text-sm ${
                confirmPassword
                  ? passwordMatch
                    ? "border-gray-300 focus:ring-2 focus:ring-emerald-500"
                    : "border-red-300 focus:ring-2 focus:ring-red-400"
                  : "border-gray-300 focus:ring-2 focus:ring-emerald-500"
              }`}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !!success || !passwordMatch || !name || !password || !confirmPassword}
            className={`w-full py-2.5 rounded-lg font-medium text-white transition-all mt-6 ${
              isLoading || success || !passwordMatch || !name || !password || !confirmPassword
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 shadow-sm hover:shadow"
            }`}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-emerald-600 font-semibold hover:text-emerald-700 transition"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
