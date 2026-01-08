import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
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
  MDBInput,
  MDBProgress,
  MDBTooltip,
} from "mdb-react-ui-kit";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  const [users, setUsers] = useState([
    {
      id: "#001",
      name: "Ahmad Raza",
      email: "ahmad@example.com",
      role: "Manager",
    },
    { id: "#002", name: "Zain Ali", email: "zain@example.com", role: "Tenant" },
    {
      id: "#003",
      name: "Eman Shah",
      email: "eman@example.com",
      role: "Tenant",
    },
  ]);

  useEffect(() => {
    if (!role || role !== "Admin") {
      toast.error("Access denied. Please login as Admin");
      navigate("/login", { replace: true });
    } else {
      setTimeout(() => setLoading(false), 800);
    }
  }, [role, navigate]);

  const handleLogout = () => {
    if (role === "Admin") {
      localStorage.clear();
      toast.success("Logged out successfully");
      setTimeout(() => navigate("/login"), 1000);
    }
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!role || role !== "Admin") return null;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f4f7f6",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        fontFamily: "Roboto, sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "60px",
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
          color: "white",
          padding: sidebarOpen ? "25px" : "25px 10px",
          transition: "width 0.3s, padding 0.3s",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          {sidebarOpen && <h4 style={{ color: "#3498db" }}>ADMIN PANEL</h4>}
          <FaBars
            onClick={toggleSidebar}
            style={{ cursor: "pointer", fontSize: "20px" }}
          />
        </div>
        <div className="d-flex flex-column gap-3">
          <SidebarItem
            icon={<FaChartLine />}
            label={sidebarOpen ? "Dashboard" : ""}
          />
          <SidebarItem
            icon={<FaUsers />}
            label={sidebarOpen ? "All Users" : ""}
          />
          <SidebarItem
            icon={<FaBuilding />}
            label={sidebarOpen ? "Properties" : ""}
          />
          <SidebarItem
            icon={<FaMoneyBillWave />}
            label={sidebarOpen ? "Finances" : ""}
          />
          <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />
          <div
            onClick={handleLogout}
            style={{ cursor: "pointer", padding: "12px", color: "#e74c3c" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "transparent")
            }
          >
            <FaSignOutAlt className="me-3" /> {sidebarOpen && "Logout"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, backgroundColor: "#f8f9fa", padding: "20px" }}>
        <MDBContainer fluid>
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
            <div>
              <h2 className="fw-bold text-primary">Admin Overview</h2>
              <small className="text-muted">
                Manage users, properties, and finances efficiently.
              </small>
            </div>
            <div className="d-flex gap-2 flex-wrap">
              <MDBBtn color="primary" size="sm">
                Download Report
              </MDBBtn>
              <MDBBtn color="success" size="sm">
                <FaPlus className="me-1" /> Add User
              </MDBBtn>
              <MDBBtn color="warning" size="sm">
                <FaPlus className="me-1" /> Add Property
              </MDBBtn>
            </div>
          </div>

          {/* Stats Cards */}
          <MDBRow className="mb-4">
            <StatsCard
              title="Total Users"
              value={users.length}
              icon={<FaUsers />}
              color="#1266f1"
              progress={100}
              tooltip="All active users"
            />
            <StatsCard
              title="Listed Properties"
              value={32}
              icon={<FaBuilding />}
              color="#00b74a"
              progress={80}
              tooltip="Properties available"
            />
            <StatsCard
              title="Total Rent Collected"
              value="$12,450"
              icon={<FaMoneyBillWave />}
              color="#ffa900"
              progress={65}
              tooltip="Revenue from leased properties"
            />
          </MDBRow>

          {/* Users Table */}
          <MDBCard>
            <MDBCardBody>
              <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                <h5 className="fw-bold m-0 text-dark">Recent Users</h5>
                <div className="d-flex align-items-center">
                  <FaSearch className="me-2 text-muted" />
                  <MDBInput
                    type="search"
                    placeholder="Search Users..."
                    size="sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{ width: "200px" }}
                  />
                </div>
              </div>
              <MDBTable hover striped responsive>
                <MDBTableHead className="bg-light">
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {filteredUsers.length ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td>{user.id}</td>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span
                            className={`badge ${
                              user.role === "Tenant"
                                ? "bg-warning text-dark"
                                : "bg-info text-dark"
                            }`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <MDBTooltip tag="span" title="View">
                            <MDBBtn color="link" size="sm">
                              <FaEye />
                            </MDBBtn>
                          </MDBTooltip>
                          <MDBTooltip tag="span" title="Edit">
                            <MDBBtn color="link" size="sm">
                              <FaEdit />
                            </MDBBtn>
                          </MDBTooltip>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center text-muted">
                        No users found
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

// Sidebar item component
const SidebarItem = ({ icon, label }) => (
  <div
    className="d-flex align-items-center p-2 rounded"
    style={{ cursor: "pointer", transition: "all 0.3s ease", gap: "10px" }}
    onMouseEnter={(e) =>
      (e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.1)")
    }
    onMouseLeave={(e) =>
      (e.currentTarget.style.backgroundColor = "transparent")
    }
  >
    {icon} {label}
  </div>
);

// Stats card component
const StatsCard = ({ title, value, icon, color, progress, tooltip }) => (
  <MDBCol md="4" className="mb-3">
    <MDBTooltip tag="div" title={tooltip}>
      <MDBCard
        className="shadow-2 border-0"
        style={{
          borderLeft: `5px solid ${color}`,
          borderRadius: "15px",
          transition: "transform 0.3s ease",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.transform = "translateY(-5px)")
        }
        onMouseLeave={(e) =>
          (e.currentTarget.style.transform = "translateY(0)")
        }
      >
        <MDBCardBody className="d-flex justify-content-between align-items-center">
          <div>
            <p className="text-muted mb-1">{title}</p>
            <h3 className="fw-bold">{value}</h3>
            <MDBProgress value={progress} className="mt-2" />
            <small className="text-muted">{progress}% Progress</small>
          </div>
          <div style={{ color, fontSize: "35px" }}>{icon}</div>
        </MDBCardBody>
      </MDBCard>
    </MDBTooltip>
  </MDBCol>
);

export default AdminDashboard;
