import React from "react";
import "./landingpage.css";
import { useNavigate } from "react-router-dom";

const LandingPage = () => {
  const navigate = useNavigate();
  return (
    <div className="landing-page flex flex-col items-center justify-center min-h-screen bg-gray-50 p-6">
      <h1 className="heading text-3xl md:text-5xl font-extrabold mb-8 text-gray-800 text-center tracking-tight">
        Rental Property Management System
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
        {/* Admin Card */}
        <div className="portal-card admin flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Admin Portal
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Manage users, view reports, and control the entire system
              securely.
            </p>
          </div>
          <button
            className="portal-btn bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 rounded-lg shadow-md"
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Admin" } })
            }
          >
            Login as Admin
          </button>
        </div>

        {/* Manager Card */}
        <div className="portal-card manager flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Manager Portal
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Add properties, track tenants, and manage your listings
              efficiently.
            </p>
          </div>
          <button
            className="portal-btn bg-blue-500 hover:bg-blue-600 text-white font-bold py-2.5 rounded-lg shadow-md"
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Manager" } })
            }
          >
            Login as Manager
          </button>
        </div>

        {/* Tenant Card */}
        <div className="portal-card tenant flex flex-col justify-between hover:shadow-2xl transition-all duration-300">
          <div>
            <h2 className="text-xl font-bold mb-3 text-gray-800">
              Tenant Portal
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              View payments, rent history, and submit maintenance requests.
            </p>
          </div>
          <button
            className="portal-btn bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg shadow-md"
            onClick={() =>
              navigate("/signup", { state: { selectedRole: "Tenant" } })
            }
          >
            Login as Tenant
          </button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
