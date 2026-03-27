import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Mail,
  KeyRound,
  ChevronDown,
  Building2,
  ArrowLeft,
  ShieldX,
} from "lucide-react";
import { API_BASE_URL } from "../config/api";
import Swal from "sweetalert2";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(location.state?.selectedRole || "Tenant");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (role === "Admin") {
      await Swal.fire({
        icon: "error",
        title: "Access Denied",
        text: "Password cannot be reset. Contact Developer to access it.",
        confirmButtonColor: "#059669",
        confirmButtonText: "OK",
      });
      navigate("/login");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
        role,
      });
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 3000);
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      if (error.response?.status === 403) {
        await Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: msg,
          confirmButtonColor: "#059669",
          confirmButtonText: "OK",
        });
        navigate("/login");
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f8]">
      <Toaster position="top-center" />

      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />

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
            Forgot your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              password?
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            No worries — we'll send a reset link to your email so you can get
            back in quickly.
          </p>
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

          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound className="w-7 h-7 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            Reset Password
          </h1>
          <p className="text-slate-500 mb-8">
            Enter your email and we'll send you a reset link
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Role */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Account Type
              </label>
              <div className="relative">
                <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all appearance-none cursor-pointer shadow-sm"
                >
                  <option value="Tenant">Tenant</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-emerald-600/20"
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
                  Sending...
                </span>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Login
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ForgotPassword;
