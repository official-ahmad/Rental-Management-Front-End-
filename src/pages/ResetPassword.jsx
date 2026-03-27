import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Lock, Eye, EyeOff, Building2, ShieldCheck } from "lucide-react";
import { API_BASE_URL } from "../config/api";

const ResetPassword = () => {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "Tenant";
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${token}`,
        { password, role },
      );
      toast.success(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Reset failed");
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
            Set your new <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
              password
            </span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
            Choose a strong password to keep your account secure.
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
            <ShieldCheck className="w-7 h-7 text-emerald-600" />
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            New Password
          </h1>
          <p className="text-slate-500 mb-8">
            Resetting password for{" "}
            <span className="font-semibold text-slate-700">{role}</span> account
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 characters"
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

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Re-enter password"
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
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

export default ResetPassword;
