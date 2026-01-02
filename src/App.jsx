import AdminDashboard from "../dashboard/AdminDashboard";
import ManagerDashboard from "../dashboard/ManagerDashboard";
import TenantDashboard from "../dashboard/TenantDashboard";
import "./App.css";
import LandingPage from "./pages/landingpage";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
// Dashboards import karein (Jab aap file bana lein)
// import AdminDashboard from "./pages/AdminDashboard";
// import ManagerDashboard from "./pages/ManagerDashboard";
// import TenantDashboard from "./pages/TenantDashboard";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
        <Route path="/tenant-dashboard" element={<TenantDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
