import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FaUsers,
  FaBuilding,
  FaMoneyBillWave,
  FaSignOutAlt,
  FaChartLine,
  FaPlus,
  FaBars,
  FaEye,
  FaEdit,
  FaSearch,
  FaUserTie,
  FaUserFriends,
} from "react-icons/fa";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBBtn,
  MDBProgress,
} from "mdb-react-ui-kit";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");

  // States
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // DB Data States
  const [managers, setManagers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    if (!role || role !== "Admin") {
      toast.error("Access denied. Admin only!");
      navigate("/login", { replace: true });
    } else {
      fetchAllData();
    }
  }, [role, navigate]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      // API Calls
      const resUsers = await axios.get(
        "http://localhost:8000/api/admin/users",
        config
      );
      const resProps = await axios.get(
        "http://localhost:8000/api/admin/properties",
        config
      );

      // Data Extraction with Safety Checks
      const allUsers = Array.isArray(resUsers.data)
        ? resUsers.data
        : resUsers.data.users || [];
      const allProps = Array.isArray(resProps.data)
        ? resProps.data
        : resProps.data.properties || [];

      setManagers(
        allUsers.filter((u) => u.role === "Manager" || u.role === "manager")
      );
      setTenants(
        allUsers.filter((u) => u.role === "Tenant" || u.role === "tenant")
      );
      setProperties(allProps);

      setLoading(false);
    } catch (err) {
      console.error("Fetch Error:", err);
      toast.error("Database se data nahi mila!");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out!");
    setTimeout(() => navigate("/login"), 500);
  };

  const getDisplayData = () => {
    let data = [];
    if (activeTab === "managers") data = managers;
    else if (activeTab === "tenants") data = tenants;
    else if (activeTab === "properties") return properties;
    else data = [...managers, ...tenants];

    return data.filter(
      (item) =>
        (item.name || item.title || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        (item.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <div className="spinner-border text-primary"></div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f3f4f6",
      }}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "80px",
          background: "#1e293b",
          color: "white",
          padding: "20px 15px",
          transition: "0.3s ease",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-5 mt-2">
          {sidebarOpen && <h4 className="fw-bold text-info m-0">ADMIN</h4>}
          <FaBars
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: "pointer" }}
          />
        </div>

        <div className="d-flex flex-column gap-2">
          <SidebarItem
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<FaChartLine />}
            label={sidebarOpen ? "Overview" : ""}
          />
          <SidebarItem
            active={activeTab === "managers"}
            onClick={() => setActiveTab("managers")}
            icon={<FaUserTie />}
            label={sidebarOpen ? "Managers" : ""}
          />
          <SidebarItem
            active={activeTab === "tenants"}
            onClick={() => setActiveTab("tenants")}
            icon={<FaUserFriends />}
            label={sidebarOpen ? "Tenants" : ""}
          />
          <SidebarItem
            active={activeTab === "properties"}
            onClick={() => setActiveTab("properties")}
            icon={<FaBuilding />}
            label={sidebarOpen ? "Properties" : ""}
          />
          <hr style={{ opacity: 0.2 }} />
          <div
            onClick={handleLogout}
            className="text-danger p-3 cursor-pointer d-flex align-items-center"
          >
            <FaSignOutAlt className="me-3" /> {sidebarOpen && "Logout"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "30px", overflowY: "auto" }}>
        <MDBContainer fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="fw-bold">
              System Control:{" "}
              <span className="text-primary">{activeTab.toUpperCase()}</span>
            </h2>
            <MDBBtn color="dark" onClick={fetchAllData}>
              Refresh DB
            </MDBBtn>
          </div>

          {/* Stats */}
          <MDBRow className="mb-4">
            <StatsCard
              title="Staff"
              value={managers.length}
              icon={<FaUserTie />}
              color="#3b82f6"
              progress={100}
            />
            <StatsCard
              title="Tenants"
              value={tenants.length}
              icon={<FaUsers />}
              color="#10b981"
              progress={85}
            />
            <StatsCard
              title="Properties"
              value={properties.length}
              icon={<FaBuilding />}
              color="#f59e0b"
              progress={60}
            />
          </MDBRow>

          {/* Data Table */}
          <MDBCard className="border-0 shadow-sm">
            <MDBCardBody>
              <div className="d-flex justify-content-between mb-4">
                <h5 className="fw-bold">Database Records</h5>
                <input
                  type="text"
                  placeholder="Search..."
                  className="form-control w-25 shadow-none"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <MDBTable hover borderless align="middle">
                <MDBTableHead className="bg-light">
                  {activeTab === "properties" ? (
                    <tr>
                      <th>Image</th>
                      <th>Title</th>
                      <th>Price</th>
                      <th>Location</th>
                      <th>Action</th>
                    </tr>
                  ) : (
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Actions</th>
                    </tr>
                  )}
                </MDBTableHead>
                <MDBTableBody>
                  {getDisplayData().length > 0 ? (
                    getDisplayData().map((item) => (
                      <tr key={item._id}>
                        {activeTab === "properties" ? (
                          <>
                            <td>
                              <img
                                src={
                                  item.image || "https://via.placeholder.com/50"
                                }
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  borderRadius: "8px",
                                }}
                                alt=""
                              />
                            </td>
                            <td className="fw-bold">{item.title}</td>
                            <td className="text-success fw-bold">
                              Rs. {item.price}
                            </td>
                            <td>{item.location}</td>
                          </>
                        ) : (
                          <>
                            <td className="small text-muted">
                              #{item._id?.substring(0, 7)}
                            </td>
                            <td className="fw-bold">{item.name}</td>
                            <td>{item.email}</td>
                            <td>
                              <span
                                className={`badge ${
                                  item.role === "Manager"
                                    ? "bg-primary"
                                    : "bg-warning text-dark"
                                }`}
                              >
                                {item.role}
                              </span>
                            </td>
                          </>
                        )}
                        <td>
                          <MDBBtn color="link" className="text-info p-0 me-2">
                            <FaEdit />
                          </MDBBtn>
                          <MDBBtn color="link" className="text-danger p-0">
                            <FaEye />
                          </MDBBtn>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center p-5">
                        No Data Found in Database
                      </td>
                    </tr>
                  )}
                </MDBTableBody>
              </MDBTable>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>
    </div>
  );
};

// Sidebar Item Component
const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: "12px 15px",
      borderRadius: "10px",
      backgroundColor: active ? "rgba(59, 130, 246, 0.2)" : "transparent",
      color: active ? "#60a5fa" : "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      transition: "0.2s",
    }}
  >
    {icon} <span>{label}</span>
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, icon, color, progress }) => (
  <MDBCol md="4">
    <MDBCard className="border-0 shadow-sm rounded-4">
      <MDBCardBody className="d-flex justify-content-between align-items-center">
        <div>
          <p className="text-muted small mb-1 fw-bold">{title}</p>
          <h2 className="fw-black mb-1">{value}</h2>
          <MDBProgress value={progress} height="4" />
        </div>
        <div
          className="p-3 rounded-3"
          style={{
            backgroundColor: `${color}15`,
            color: color,
            fontSize: "1.8rem",
          }}
        >
          {icon}
        </div>
      </MDBCardBody>
    </MDBCard>
  </MDBCol>
);

export default AdminDashboard;
