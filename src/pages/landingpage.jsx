import React from "react";
import { useNavigate } from "react-router-dom";
import "./landingpage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  const handleNavigate = (role) => {
    navigate("/signup", { state: { selectedRole: role } });
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
     
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-blue-100/50 blur-[120px]" />
        <div className="absolute bottom-[0%] right-[0%] w-[30%] h-[30%] rounded-full bg-indigo-100/50 blur-[100px]" />
      </div>

      <div className="text-center mb-16 relative">
        <h1 className="text-5xl md:text-7xl font-black text-gray-900 mb-6 tracking-tight">
          Welcome to Our <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            Property Management
          </span>
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Streamline your rental experience with secure, efficient tools. Choose
          your portal to get started.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
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
              Manage users, view comprehensive reports, and oversee system
              security and control.
            </p>
            <button
              onClick={() => handleNavigate("Admin")}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-red-200 transition-all active:scale-95 button"
            >
              Login as Admin
            </button>
          </div>
        </div>

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
              Add properties, track tenant leases, and manage listings with
              user-friendly tools.
            </p>
            <button
              onClick={() => handleNavigate("Manager")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-blue-200 transition-all active:scale-95 button"
            >
              Login as Manager
            </button>
          </div>
        </div>

        <div className="group bg-white/80 backdrop-blur-sm rounded-[2.5rem] p-10 border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl transition-all duration-500 hover:-translate-y-3">
          <div className="flex flex-col h-full text-center">
            <div className="w-20 h-20 bg-green-50 rounded-3xl flex items-center justify-center mb-8 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-green-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Tenant Portal
            </h2>
            <p className="text-gray-500 mb-10 flex-grow leading-relaxed">
              Pay rent online, view payment history, and submit maintenance
              requests easily.
            </p>
            <button
              onClick={() => handleNavigate("Tenant")}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg shadow-green-200 transition-all active:scale-95 button"
            >
              Login as Tenant
            </button>
          </div>
        </div>
      </div>
 
      <footer className="mt-20 text-gray-400 text-gray font-medium tracking-wide">
        &copy; {new Date().getFullYear()} RENTAL SYSTEM MANAGEMENT &bull; ALL
        RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default LandingPage;
