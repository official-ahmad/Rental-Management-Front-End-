import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const ManagerDashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("userRole");

    if (role !== "Manager") {
      toast.error("Login First!");
      const timer = setTimeout(() => {
        navigate("/login");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [navigate]);

  return (
    <div className="p-10">
      <h1>Manager Dashboard</h1>
    </div>
  );
};
export default ManagerDashboard;
