import React from "react";
import "./landingpage.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-page flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 p-6">
      <h1 className="text-4xl md:text-5xl font-extrabold mb-12 text-gray-800 text-center">
        Rental Property Management System
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Admin Card */}
        <div className="portal-card admin border-red-500 hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-semibold mb-4">Admin Portal</h2>
          <p className="text-gray-600 mb-6">
            Manage users, view reports, and control the system.
          </p>
          <button
            className="portal-btn bg-red-500 hover:bg-red-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-colors duration-300"
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Admin" } })
            }
          >
            Login as Admin
          </button>
        </div>

        {/* Manager Card */}
        <div className="portal-card manager border-blue-500 hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-semibold mb-4">Manager Portal</h2>
          <p className="text-gray-600 mb-6">
            Add properties, track tenants, and manage listings.
          </p>
          <button
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Manager" } })
            }
            className="portal-btn bg-blue-500 hover:bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-colors duration-300  "
          >
            Login as Manager
          </button>
        </div>

        {/* Tenant Card */}
        <div className="portal-card tenant border-green-500 hover:scale-105 transition-transform duration-300">
          <h2 className="text-2xl font-semibold mb-4">Tenant Portal</h2>
          <p className="text-gray-600 mb-6">
            View payments, rent history, and maintenance requests.
          </p>
          <button
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Tenant" } })
            }
            className="portal-btn bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2 rounded-lg shadow-lg transition-colors duration-300"
          >
            Login as Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
