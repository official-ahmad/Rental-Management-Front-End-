import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { FaLock, FaTimes, FaShieldAlt } from "react-icons/fa";
import "./landingpage.css";
import { API_BASE_URL } from "../config/api";

const LandingPage = () => {
  const navigate = useNavigate();
  const [showAccessModal, setShowAccessModal] = useState(true);
  const [accessKey, setAccessKey] = useState("");
  const [isAccessGranted, setIsAccessGranted] = useState(false);

  const verifyPageAccess = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/verify-page-access`,
        {
          accessKey: accessKey,
        },
      );
      if (res.data.success) {
        toast.success("Access Granted!");
        setIsAccessGranted(true);
        setShowAccessModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Access Key!");
      setAccessKey("");
    }
  };

  const closeAccessModal = () => {
    setShowAccessModal(false);
    navigate("/");
  };

  const handleAdminLogin = () => {
    navigate("/login", { state: { selectedRole: "Admin" } });
  };

  const handleManagerSignup = () => {
    navigate("/signup", { state: { selectedRole: "Manager" } });
  };

  // If access not granted, only show the modal
  if (!isAccessGranted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Toaster />
        {showAccessModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-10 rounded-3xl max-w-md w-[90%] relative shadow-2xl border border-white/10 animate-slideUp">
              <button
                onClick={closeAccessModal}
                className="absolute top-4 right-4 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300"
              >
                <FaTimes />
              </button>

              <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <FaShieldAlt className="text-white text-3xl" />
              </div>

              <h3 className="text-white text-2xl font-bold text-center mb-3">
                Restricted Access
              </h3>
              <p className="text-white/60 text-center mb-6 text-sm">
                This area is for Admin and Manager only. Enter the access key to
                continue.
              </p>

              <input
                type="password"
                placeholder="Enter Access Key"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyPageAccess()}
                className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500 focus:shadow-lg focus:shadow-blue-500/20 transition-all mb-5"
              />

              <button
                onClick={verifyPageAccess}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/40 transition-all"
              >
                Verify Access
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      <Toaster />
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      <div className="text-center mb-16 relative">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
          Admin & Manager <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Control Panel
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Secure access portal for system administrators and property managers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Admin Card */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
          <div className="flex flex-col h-full text-center">
            <div className="w-20 h-20 bg-red-50 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-red-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Admin Portal
            </h2>
            <p className="text-gray-500 mb-10 flex-grow leading-relaxed">
              System administrator access. Manage users, view reports, and
              control system settings.
            </p>
            <button
              onClick={handleAdminLogin}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95"
            >
              Login as Admin
            </button>
            <p className="text-gray-400 text-sm mt-3">
              <FaLock className="inline mr-1" /> Admin can only login
            </p>
          </div>
        </div>

        {/* Manager Card */}
        <div className="group bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
          <div className="flex flex-col h-full text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Manager Portal
            </h2>
            <p className="text-gray-500 mb-10 flex-grow leading-relaxed">
              Property manager access. Add properties, manage listings, and
              track tenant leases.
            </p>
            <button
              onClick={handleManagerSignup}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95"
            >
              Sign Up as Manager
            </button>
            <p className="text-gray-400 text-sm mt-3">
              Already have account?{" "}
              <span
                onClick={() =>
                  navigate("/login", { state: { selectedRole: "Manager" } })
                }
                className="text-blue-500 cursor-pointer hover:underline"
              >
                Login here
              </span>
            </p>
          </div>
        </div>
      </div>

      <footer className="mt-20 text-gray-400 text-sm font-medium tracking-wide">
        &copy; {new Date().getFullYear()} RENTAL SYSTEM MANAGEMENT &bull; ALL
        RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default LandingPage;
