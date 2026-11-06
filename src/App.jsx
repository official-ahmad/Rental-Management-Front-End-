import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Loader from "./components/Loader";
import MaintenancePage from "./pages/MaintenancePage";
import "./maintenance.css";


const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const AdminDashboard = lazy(() => import("../dashboard/AdminDashboard"));
const ManagerDashboard = lazy(() => import("../dashboard/ManagerDashboard"));
const TenantDashboard = lazy(() => import("../dashboard/TenantDashboard"));
const maintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === "true";


function App() {
  if (maintenanceMode) {
    return <MaintenancePage />;
  }

  return (
    <Router>
      <Suspense fallback={<Loader label="Loading..." />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page" element={<Navigate to="/login" replace />} />
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
