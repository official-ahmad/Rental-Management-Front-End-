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
        navigate("/login", { state: { selectedRole: "Admin" } });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Access Key!");
      setAccessKey("");
    }
  };

  const closeAccessModal = () => {
    setShowAccessModal(false);
    navigate("/login", { state: { selectedRole: "Admin" } });
  };

  if (showAccessModal) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <Toaster />
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] p-10 rounded-3xl max-w-md w-[90%] relative shadow-2xl border border-white/10 animate-slideUp">
            <button
              onClick={closeAccessModal}
              className="absolute top-4 right-4 w-9 h-9 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 hover:rotate-90 transition-all duration-300"
            >
              <FaTimes />
            </button>

            <div className="w-20 h-20 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaShieldAlt className="text-white text-3xl" />
            </div>

            <h3 className="text-white text-2xl font-bold text-center mb-3">
              Admin Access Required!
            </h3>
            <p className="text-white/60 text-center mb-6 text-sm">
              This area is for Admins only. Enter the access key to continue.
            </p>

            <input
              type="password"
              placeholder="Enter Access Key"
              value={accessKey}
              onChange={(e) => setAccessKey(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && verifyPageAccess()}
              className="w-full px-5 py-4 bg-white/5 border-2 border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-emerald-500 focus:shadow-lg focus:shadow-emerald-500/20 transition-all mb-5"
            />

            <button
              onClick={verifyPageAccess}
              className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold rounded-xl hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-500/40 transition-all"
            >
              Verify Access
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default LandingPage;
