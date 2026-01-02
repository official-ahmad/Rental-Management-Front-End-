import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const AdminDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (!role || role !== "Admin") {
      toast.error("Login ");

      const timer = setTimeout(() => {
        navigate("/login");
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [navigate]);

  const currentRole = localStorage.getItem("userRole");
  if (currentRole !== "Admin") {
    return (
      <div className="flex items-center justify-center h-screen">
        <h1>Admin Portal</h1>
      </div>
    );
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
    </div>
  );
};

export default AdminDashboard;
