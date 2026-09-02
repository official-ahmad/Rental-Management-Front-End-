import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  ShieldCheck,
  X,
  Building2,
  ChevronDown,
} from "lucide-react";
import { API, API_BASE_URL } from "../config/api";

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: location.state?.selectedRole || "Tenant",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);


  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAccessKey, setAdminAccessKey] = useState("");
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.role === "Admin") {
      setShowAdminModal(true);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(API.AUTH.LOGIN, {
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const { token, user } = response.data;
      localStorage.setItem("token", token);
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("userRole", user.role);

      toast.success(`Welcome back, ${user.name}!`);
      setTimeout(() => {
        navigate(`/${user.role.toLowerCase()}-dashboard`);
      }, 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Login failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleAdminAccess = async () => {
    try {
      const verifyRes = await axios.post(
        `${API_BASE_URL}/api/auth/verify-admin-access`,
        { accessKey: adminAccessKey },
      );

      if (verifyRes.data.success) {
        const loginRes = await axios.post(
          `${API_BASE_URL}/api/auth/admin-login`,
          { email: adminEmail, password: adminPassword },
        );

        if (loginRes.data.success) {
          localStorage.setItem("token", loginRes.data.token);
          localStorage.setItem("userId", loginRes.data.adminId);
          localStorage.setItem("userName", loginRes.data.adminName);
          localStorage.setItem("userRole", "Admin");

          toast.success("Admin access granted!");
          setShowAdminModal(false);
          setTimeout(() => navigate("/admin-dashboard"), 1000);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Admin verification failed!",
      );
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f8]">
      <Toaster position="top-center" />

      {/* Left Panel — Branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden flex-col justify-between p-12">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-teal-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              Rentify.software
            </span>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Manage your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              properties
            </span>{" "}
            with ease.
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Streamlined rental management for landlords, managers, and tenants —
            all in one place.
          </p>
          <div className="flex items-center gap-4 pt-4">
            <div className="flex -space-x-3">
              {[
                "bg-emerald-500",
                "bg-cyan-500",
                "bg-teal-500",
                "bg-sky-500",
              ].map((bg, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 ${bg} rounded-full border-2 border-[#0f172a] flex items-center justify-center text-white text-xs font-bold`}
                >
                  {["A", "M", "T", "R"][i]}
                </div>
              ))}
            </div>
            <p className="text-slate-500 text-sm">
              Trusted by <span className="text-white font-semibold">100+</span>{" "}
              property managers
            </p>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-slate-600 text-xs">
            &copy; 2026 Rentify.software. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] animate-[fadeSlideUp_0.5s_ease]">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-slate-800">
              Rentify.software
            </span>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            Welcome back
          </h1>
          <p className="text-slate-500 mb-8">
            Enter your credentials to access your account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Login As
              </label>
              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="Tenant">Tenant</option>
                  <option value="Manager">Manager</option>
                  {location.state?.selectedRole === "Admin" && (
                    <option value="Admin">Admin</option>
                  )}
                </select>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-7">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              or
            </span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>

          {/* Bottom Link */}
          <p className="text-center text-slate-500 text-sm">
            Don't have an account?{" "}
            <span
              onClick={() => navigate("/signup")}
              className="text-emerald-600 hover:text-emerald-700 font-semibold cursor-pointer transition-colors"
            >
              Create Account
            </span>
          </p>
        </div>
      </div>

      {/* Admin Access Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white p-8 rounded-2xl max-w-sm w-[90%] relative shadow-2xl animate-[fadeSlideUp_0.3s_ease]">
            <button
              onClick={() => setShowAdminModal(false)}
              className="absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <ShieldCheck className="w-7 h-7 text-emerald-600" />
            </div>

            <h3 className="text-slate-900 text-xl font-bold text-center mb-1">
              Admin Access
            </h3>
            <p className="text-slate-500 text-sm text-center mb-6">
              Enter your admin credentials to continue
            </p>

            <div className="space-y-3">
              <input
                type="password"
                placeholder="Access Key"
                value={adminAccessKey}
                onChange={(e) => setAdminAccessKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <input
                type="email"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
              />
              <button
                onClick={handleAdminAccess}
                className="w-full py-3.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 active:scale-[0.98] transition-all shadow-lg shadow-emerald-600/20 mt-2"
              >
                Verify & Login
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default Login;
