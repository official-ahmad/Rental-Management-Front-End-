import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";

// Lazy load all components for better performance
const Home = lazy(() => import("./pages/Home"));
const LandingPage = lazy(() => import("./pages/landingpage"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const AdminDashboard = lazy(() => import("../dashboard/AdminDashboard"));
const ManagerDashboard = lazy(() => import("../dashboard/ManagerDashboard"));
const TenantDashboard = lazy(() => import("../dashboard/TenantDashboard"));

// Loading spinner component
const LoadingSpinner = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    }}
  >
    <div
      style={{
        width: "50px",
        height: "50px",
        border: "4px solid rgba(255, 255, 255, 0.3)",
        borderTop: "4px solid #fff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page" element={<LandingPage />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/property/:id" element={<PropertyDetails />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/manager-dashboard" element={<ManagerDashboard />} />
          <Route path="/tenant-dashboard" element={<TenantDashboard />} />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
