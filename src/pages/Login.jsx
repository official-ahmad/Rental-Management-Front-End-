import React, { useEffect, useState } from "react";
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
  const [adminLockoutSeconds, setAdminLockoutSeconds] = useState(0);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminAttemptsRemaining, setAdminAttemptsRemaining] = useState(null);

  useEffect(() => {
    if (adminLockoutSeconds <= 0) return undefined;
    const timer = window.setInterval(() => {
      setAdminLockoutSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [adminLockoutSeconds]);

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
    if (adminLockoutSeconds > 0 || adminLoading) return;
    setAdminLoading(true);
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
          localStorage.setItem("userEmail", loginRes.data.adminEmail);
          localStorage.setItem("userRole", "Admin");

          toast.success("Admin access granted!");
          setShowAdminModal(false);
          setTimeout(() => navigate("/admin-dashboard"), 1000);
        }
      }
    } catch (error) {
      const responseData = error.response?.data;
      if (error.response?.status === 429) {
        setAdminLockoutSeconds(responseData.retryAfterSeconds || 900);
      }
      if (typeof responseData?.attemptsRemaining === "number") {
        setAdminAttemptsRemaining(responseData.attemptsRemaining);
      }
      toast.error(
        responseData?.message || "Admin verification failed!",
      );
    } finally {
      setAdminLoading(false);
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
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group relative mb-8 h-14 w-48 overflow-hidden rounded-2xl border-4 border-white bg-white text-center text-xl font-semibold text-black"
          >
            <span className="absolute left-0 top-0 z-10 grid h-12 w-1/4 place-items-center rounded-xl bg-green-400 duration-500 group-hover:w-full">
              <svg
                width="25"
                height="25"
                viewBox="0 0 1024 1024"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >
                <path
                  fill="#000000"
                  d="M224 480h640a32 32 0 1 1 0 64H224a32 32 0 1 1 0-64z"
                />
                <path
                  fill="#000000"
                  d="m237.248 512 265.408 265.344a32 32 0 0 1-45.312 45.312l-288-288a32 32 0 0 1 0-45.312l288-288a32 32 0 1 1 45.312 45.312L237.248 512z"
                />
              </svg>
            </span>
            {/* <span className="relative z-20 translate-x-4">Go Back</span> */}
          </button>
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

          <button
            type="button"
            onClick={() => setShowAdminModal(true)}
            className="w-full mb-6 rounded-2xl border border-white/60 bg-white/40 px-4 py-3 text-sm font-semibold text-slate-700 shadow-lg shadow-slate-300/20 backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-700"
          >
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Admin Login here
            </span>
          </button>

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
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md z-50 animate-[fadeIn_0.2s_ease]">
          <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/30 bg-gradient-to-br from-white/80 via-white/65 to-emerald-50/70 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-2xl animate-[fadeSlideUp_0.3s_ease]">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-300/30 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-16 h-44 w-44 rounded-full bg-cyan-300/25 blur-3xl" />
            <button
              onClick={() => !adminLoading && setShowAdminModal(false)}
              className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 bg-white/60 text-slate-500 shadow-sm transition-all hover:rotate-90 hover:bg-white hover:text-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="relative mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/30">
              <ShieldCheck className="h-8 w-8 text-white" />
            </div>

            <h3 className="relative text-center text-2xl font-extrabold tracking-tight text-slate-900">
              Admin Access
            </h3>
            <p className="relative mb-7 mt-2 text-center text-sm leading-6 text-slate-600">
              Secure sign-in for your management dashboard
            </p>

            <div className="relative space-y-3.5">
              <input
                type="password"
                placeholder="Access Key"
                value={adminAccessKey}
                onChange={(e) => setAdminAccessKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
              />
              <input
                type="email"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
              />
              <input
                type="password"
                placeholder="Admin Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdminAccess()}
                className="w-full rounded-2xl border border-white/80 bg-white/65 px-4 py-3.5 text-slate-900 shadow-sm outline-none placeholder:text-slate-400 transition-all focus:border-emerald-400 focus:bg-white focus:ring-4 focus:ring-emerald-500/15"
              />
              {adminAttemptsRemaining !== null && adminLockoutSeconds === 0 && (
                <p className="px-1 text-xs font-medium text-amber-700">
                  {adminAttemptsRemaining} attempt
                  {adminAttemptsRemaining === 1 ? "" : "s"} remaining
                </p>
              )}
              <button
                onClick={handleAdminAccess}
                disabled={adminLockoutSeconds > 0 || adminLoading}
                className="w-full rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 font-bold text-white shadow-lg shadow-emerald-600/25 transition-all hover:-translate-y-0.5 hover:from-emerald-700 hover:to-teal-700 active:translate-y-0 disabled:cursor-not-allowed disabled:from-slate-400 disabled:to-slate-500"
              >
                {adminLockoutSeconds > 0
                  ? `Locked — try again in ${Math.floor(adminLockoutSeconds / 60)}:${String(adminLockoutSeconds % 60).padStart(2, "0")}`
                  : adminLoading
                    ? "Checking..."
                    : "Verify & Login"}
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
