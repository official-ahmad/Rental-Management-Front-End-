import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { Mail, KeyRound, ChevronDown, Building2, ArrowLeft, Lock } from "lucide-react";
import { API_BASE_URL } from "../config/api";
import CodeSlots from "../components/CodeSlots";

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(location.state?.selectedRole || "Tenant");
  const [otp, setOtp] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [step, setStep] = useState("email");
  const [otpStatus, setOtpStatus] = useState("idle");
  const [loading, setLoading] = useState(false);

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, {
        email,
        role,
      });
      toast.success(response.data.message);
      setStep("otp");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (code) => {
    setOtpStatus("idle");
    try {
      const response = await axios.post(`${API_BASE_URL}/api/auth/verify-reset-otp`, {
        email,
        role,
        otp: code,
      });
      setResetToken(response.data.resetToken);
      setOtpStatus("success");
      toast.success("OTP verified");
      window.setTimeout(() => setStep("password"), 700);
    } catch (error) {
      setOtpStatus("error");
      toast.error(error.response?.data?.message || "Invalid OTP");
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (password.length < 8) return toast.error("Password must be at least 8 characters");
    if (password !== confirmPassword) return toast.error("Passwords do not match");
    setLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/auth/reset-password/${resetToken}`,
        { password, role },
      );
      toast.success(response.data.message);
      setTimeout(() => navigate("/login"), 1200);
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f0f4f8]">
      <Toaster position="top-center" />
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl">Rentify.software</span>
        </div>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight">
            Secure account <span className="text-emerald-400">recovery</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-sm mt-5">
            Verify your email with a one-time code and choose a new password.
          </p>
        </div>
        <p className="relative z-10 text-slate-600 text-xs">&copy; 2026 Rentify.software. All rights reserved.</p>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[440px]">
          <div className="flex items-center gap-2 mb-10 lg:hidden">
            <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center"><Building2 className="w-4 h-4 text-white" /></div>
            <span className="font-bold text-lg text-slate-800">Rentify.software</span>
          </div>
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-6">
            {step === "password" ? <Lock className="w-7 h-7 text-emerald-600" /> : <KeyRound className="w-7 h-7 text-emerald-600" />}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-1">
            {step === "email" ? "Forgot Password" : step === "otp" ? "Verify OTP" : "New Password"}
          </h1>
          <p className="text-slate-500 mb-8">
            {step === "email" && "Enter your email and we will send a 6-digit OTP."}
            {step === "otp" && <>Enter the OTP sent to <strong>{email}</strong>.</>}
            {step === "password" && "Choose a strong password for your account."}
          </p>

          {step === "email" && (
            <form onSubmit={requestOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Account Type</label>
                <div className="relative">
                  <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <select value={role} onChange={(event) => setRole(event.target.value)} className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200 appearance-none shadow-sm">
                    <option value="Tenant">Tenant</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gmail Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required placeholder="you@gmail.com" className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-slate-200 shadow-sm" />
                </div>
              </div>
              <button disabled={loading} className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50">
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <div className="space-y-6">
              <CodeSlots value={otp} status={otpStatus} onChange={(value) => { setOtp(value); setOtpStatus("idle"); }} onComplete={verifyOtp} />
              <p className="text-center text-xs text-slate-500">The OTP expires in 10 minutes.</p>
              <button type="button" onClick={() => { setStep("email"); setOtp(""); }} className="w-full py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold">
                Change email
              </button>
            </div>
          )}

          {step === "password" && (
            <form onSubmit={resetPassword} className="space-y-5">
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} minLength={8} required placeholder="New password (min. 8 characters)" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200" />
              <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} minLength={8} required placeholder="Confirm new password" className="w-full px-4 py-3 rounded-xl bg-white border border-slate-200" />
              <button disabled={loading} className="w-full py-3.5 rounded-xl bg-emerald-600 text-white font-semibold disabled:opacity-50">
                {loading ? "Updating..." : "Set New Password"}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <button onClick={() => navigate("/login")} className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
