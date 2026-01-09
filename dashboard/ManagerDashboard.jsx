import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import {
  FaBuilding,
  FaPlus,
  FaUsers,
  FaClipboardList,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBars,
  FaEye,
} from "react-icons/fa";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBProgress,
  MDBTooltip,
  MDBInput,
} from "mdb-react-ui-kit";

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const managerName = localStorage.getItem("userName") || "Manager";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Sample properties data
  const [properties, setProperties] = useState([
    {
      name: "Grand Sapphire Palace",
      location: "Model Town, LHR",
      rent: "$1,500",
      status: "Occupied",
    },
    {
      name: "Palm View Residency",
      location: "Gulberg, LHR",
      rent: "$2,200",
      status: "Vacant",
    },
    {
      name: "Skyline Apartments",
      location: "DHA, LHR",
      rent: "$1,800",
      status: "Occupied",
    },
  ]);

  useEffect(() => {
    if (!role || role !== "Manager") {
      toast.error("Access denied. Please login as Manager");
      navigate("/login", { replace: true });
    } else {
      setTimeout(() => setLoading(false), 800);
    }
  }, [role, navigate]);

  const handleLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    setTimeout(() => navigate("/login"), 1000);
  };

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  const filteredProperties = properties.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!role || role !== "Manager") return null;

  if (loading)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f3f4f7",
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

      <div
        style={{
          width: sidebarOpen ? "250px" : "60px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          padding: sidebarOpen ? "25px" : "25px 10px",
          transition: "width 0.3s",
          boxShadow: "2px 0 10px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-4">
          {sidebarOpen && <h4 className="fw-bold">MANAGER HUB</h4>}
          <FaBars
            onClick={toggleSidebar}
            style={{ cursor: "pointer", fontSize: "20px" }}
          />
        </div>
        <div className="d-flex flex-column gap-3">
          <div style={{ cursor: "pointer", padding: "12px" }}>
            <FaBuilding className="me-2" /> {sidebarOpen && "My Properties"}
          </div>
          <div style={{ cursor: "pointer", padding: "12px" }}>
            <FaUsers className="me-2" /> {sidebarOpen && "Tenants List"}
          </div>
          <div style={{ cursor: "pointer", padding: "12px" }}>
            <FaClipboardList className="me-2" /> {sidebarOpen && "Maintenance"}
          </div>
          <hr style={{ borderColor: "rgba(255,255,255,0.3)" }} />
          <div
            onClick={handleLogout}
            style={{ cursor: "pointer", padding: "12px", color: "#ffd700" }}
          >
            <FaSignOutAlt className="me-2" /> {sidebarOpen && "Logout"}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, backgroundColor: "#f8f9fa", padding: "20px" }}>
        <MDBContainer fluid>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold text-primary">Property Dashboard</h2>
              <small>
                Welcome back, <strong>{managerName}</strong>!
              </small>
            </div>
            <MDBBtn color="primary">
              <FaPlus className="me-2" /> Add Property
            </MDBBtn>
          </div>

          {/* Stats Cards */}
          <MDBRow className="mb-4">
            <MDBCol md="4" className="mb-3">
              <MDBCard
                className="text-center py-4"
                style={{
                  borderRadius: "15px",
                  background: "linear-gradient(135deg,#74b9ff,#0984e3)",
                }}
              >
                <MDBCardBody>
                  <FaBuilding size={40} className="mb-3 text-white" />
                  <h3 className="text-white fw-bold">{properties.length}</h3>
                  <p className="text-white">Total Properties</p>
                  <MDBProgress
                    value={
                      (properties.filter((p) => p.status === "Occupied")
                        .length /
                        properties.length) *
                      100
                    }
                    className="mb-0"
                  />
                  <small className="text-white">
                    {Math.round(
                      (properties.filter((p) => p.status === "Occupied")
                        .length /
                        properties.length) *
                        100
                    )}
                    % Occupied
                  </small>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          </MDBRow>

          <MDBRow className="mb-3">
            <MDBCol md="6">
              <MDBInput
                label="Search Properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </MDBCol>
          </MDBRow>

          <MDBCard>
            <MDBCardBody>
              <h5 className="mb-3">Recently Added Properties</h5>
              <MDBTable hover striped responsive>
                <MDBTableHead className="bg-light">
                  <tr>
                    <th>Name</th>
                    <th>Location</th>
                    <th>Rent</th>
                    <th>Status</th>
                    {/* <th>Action</th> */}
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {filteredProperties.map((p, i) => (
                    <tr key={i}>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>
                        <FaMapMarkerAlt className="text-danger me-1" />{" "}
                        {p.location}
                      </td>
                      <td>{p.rent}</td>
                      <td>
                        <span
                          className={`badge ${
                            p.status === "Occupied"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td>
                        {/* <MDBTooltip tag="span" title="View Details">
                          <MDBBtn color="link" size="sm">
                            <FaEye />
                          </MDBBtn>
                        </MDBTooltip> */}
                      </td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>
    </div>
  );
};

export default ManagerDashboard;
