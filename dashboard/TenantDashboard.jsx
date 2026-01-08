import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaTools,
  FaSignOutAlt,
  FaUserCircle,
  FaHistory,
  FaPlusCircle,
  FaBars,
  FaEye,
  FaSearch,
  FaCheck,
  FaTimes,
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
  MDBInput,
  MDBProgress,
  MDBTooltip,
  MDBNavbar,
  MDBNavbarBrand,
  MDBNavbarNav,
  MDBNavbarItem,
  MDBNavbarLink,
  MDBCollapse,
  MDBNavbarToggler,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";

const TenantDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Tenant";
  const userId = localStorage.getItem("userId");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false); // For custom logout confirmation

  // Sample data (replace with API calls if needed)
  const [property, setProperty] = useState(null);
  const [rentHistory, setRentHistory] = useState([
    { month: "December 2025", amount: "$1,450.00", status: "Paid" },
  ]);

  useEffect(() => {
    if (!role || role !== "Tenant") {
      toast.error("Access denied. Please login as Tenant");
      navigate("/login", { replace: true });
      return;
    }

    const fetchTenantData = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8000/api/properties/my-property/${userId}`
        );
        setProperty(res.data);
        setLoading(false);
      } catch (err) {
        console.log("No property assigned yet");
        setLoading(false);
      }
    };

    if (userId) fetchTenantData();
  }, [role, navigate, userId]);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true); // Open custom modal instead of window.confirm
  };

  const confirmLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    setLogoutModalOpen(false);
    setTimeout(() => navigate("/login"), 1000);
  };

  const cancelLogout = () => {
    setLogoutModalOpen(false);
  };

  if (!role || role !== "Tenant") return null;

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          backgroundColor: "#f8f9fb",
        }}
      >
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const filteredHistory = rentHistory.filter(
    (item) =>
      item.month.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.amount.includes(searchQuery) ||
      item.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Custom styles
  const cardStyle = {
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
  };

  const buttonStyle = {
    borderRadius: "25px",
    padding: "10px 20px",
    transition: "all 0.3s ease",
  };

  const buttonHover = {
    transform: "scale(1.05)",
  };

  return (
    <div
      style={{
        backgroundColor: "#f8f9fb",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* Enhanced Top Navbar */}
      <MDBNavbar
        expand="lg"
        dark
        style={{
          background: "linear-gradient(135deg, #2c3e50 0%, #34495e 100%)",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
        className="p-3"
      >
        <MDBContainer fluid>
          <MDBNavbarBrand className="fw-bold text-success">
            TENANT PORTAL
          </MDBNavbarBrand>
          <MDBNavbarToggler
            aria-controls="navbarNav"
            aria-expanded={navbarOpen}
            aria-label="Toggle navigation"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <FaBars />
          </MDBNavbarToggler>
          <MDBCollapse navbar id="navbarNav" isOpen={navbarOpen}>
            <MDBNavbarNav className="ms-auto d-flex align-items-center">
              <MDBNavbarItem className="me-3">
                <span className="text-white">
                  <FaUserCircle className="me-2" /> Welcome, {userName}
                </span>
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBBtn
                  color="danger"
                  size="sm"
                  onClick={handleLogoutClick}
                  style={buttonStyle}
                  onMouseEnter={(e) =>
                    Object.assign(e.target.style, buttonHover)
                  }
                  onMouseLeave={(e) =>
                    Object.assign(e.target.style, buttonStyle)
                  }
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </MDBBtn>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>

      {/* Custom Logout Confirmation Modal */}
      <MDBModal
        show={logoutModalOpen}
        setShow={setLogoutModalOpen}
        tabIndex="-1"
        centered
        animation="fade"
      >
        <MDBModalDialog>
          <MDBModalContent style={{ borderRadius: "15px" }}>
            <MDBModalHeader className="bg-light">
              <MDBModalTitle className="text-danger fw-bold">
                <FaSignOutAlt className="me-2" /> Confirm Logout
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center py-4">
              <p className="mb-0">
                Are you sure you want to log out? You'll need to log in again to
                access your account.
              </p>
            </MDBModalBody>
            <MDBModalFooter className="justify-content-center">
              <MDBBtn
                color="secondary"
                onClick={cancelLogout}
                style={{ borderRadius: "25px", padding: "8px 20px" }}
              >
                <FaTimes className="me-1" /> Cancel
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={confirmLogout}
                style={{ borderRadius: "25px", padding: "8px 20px" }}
              >
                <FaCheck className="me-1" /> Confirm Logout
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <MDBContainer className="py-5">
        <header className="mb-5 text-center">
          <h2 className="fw-bold text-primary">My Rental Overview</h2>
          <p className="text-muted">
            Manage your stay and track your payments with ease.
          </p>
        </header>

        <MDBRow className="mb-4">
          <StatusCard
            icon={<FaHome />}
            title="Current Property"
            value={property ? property.propertyName : "Not Assigned"}
            subtitle={
              property ? property.location : "Contact Manager for details"
            }
            color="#007bff"
            progress={property ? 100 : 0}
            tooltip="View property details"
            onClick={() => toast("Property details viewing...")} // Fixed: Changed toast.info to toast
          />
          <StatusCard
            icon={<FaFileInvoiceDollar />}
            title="Monthly Rent"
            value={property ? `$${property.rentAmount}` : "$0.00"}
            subtitle={property ? "Due on 1st of month" : "No balance due"}
            color="#dc3545"
            progress={75}
            tooltip="Pay your rent now"
            onClick={() => toast("Redirecting to Payments...")} // Fixed: Changed toast.info to toast
          />
          <StatusCard
            icon={<FaTools />}
            title="Maintenance Status"
            value="Unit Active"
            subtitle="System is working fine"
            color="#ffc107"
            progress={100}
            tooltip="Report an issue if needed"
            onClick={() => toast("No active maintenance requests")} // Fixed: Changed toast.info to toast
          />
        </MDBRow>

        {/* Quick Action Buttons */}
        <MDBCard className="shadow-2 border-0 mb-5" style={cardStyle}>
          <MDBCardBody className="p-4">
            <h5 className="fw-bold mb-4 text-dark">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <MDBBtn
                color="success"
                onClick={() => toast.success("Opening Payment Gateway...")} // Fixed: Changed toast.info to toast.success
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                <FaFileInvoiceDollar className="me-2" /> Pay Rent
              </MDBBtn>
              <MDBBtn
                outline
                color="primary"
                onClick={() => toast("Rent history is below")} // Fixed: Changed toast.info to toast
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                <FaHistory className="me-2" /> View Rent History
              </MDBBtn>
              <MDBBtn
                outline
                color="dark"
                onClick={() => toast("Request form opening...")} // Fixed: Changed toast.info to toast
                style={buttonStyle}
                onMouseEnter={(e) => Object.assign(e.target.style, buttonHover)}
                onMouseLeave={(e) => Object.assign(e.target.style, buttonStyle)}
              >
                <FaPlusCircle className="me-2" /> Report an Issue
              </MDBBtn>
            </div>
          </MDBCardBody>
        </MDBCard>

        {/* Enhanced Rent History Table */}
        <MDBCard style={cardStyle}>
          <MDBCardBody>
            <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
              <h5 className="fw-bold m-0 text-dark">Rent Payment History</h5>
              <div className="d-flex align-items-center">
                <FaSearch className="me-2 text-muted" />
                <MDBInput
                  type="search"
                  placeholder="Search history..."
                  size="sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: "200px" }}
                />
              </div>
            </div>
            <MDBTable hover align="middle" responsive striped>
              <MDBTableHead className="bg-light">
                <tr>
                  <th>Month</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((item, idx) => (
                    <tr key={idx}>
                      <td className="fw-bold">{item.month}</td>
                      <td className="text-success fw-bold">{item.amount}</td>
                      <td>
                        <span
                          className={`badge ${
                            item.status === "Paid"
                              ? "bg-success"
                              : "bg-warning text-dark"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <MDBTooltip tag="span" title="View Receipt">
                          <MDBBtn color="link" size="sm">
                            <FaEye />
                          </MDBBtn>
                        </MDBTooltip>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-muted">
                      No rent history found matching your search.
                    </td>
                  </tr>
                )}
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>
    </div>
  );
};

// --- Status Card Component ---
const StatusCard = ({
  icon,
  title,
  value,
  subtitle,
  color,
  progress,
  tooltip,
  onClick,
}) => {
  // Define cardHover locally to fix the  error
  const cardHover = {
    transform: "translateY(-5px)",
  };

  return (
    <MDBCol md="4" className="mb-3">
      <MDBTooltip tag="div" title={tooltip}>
        <MDBCard
          className="shadow-2 border-0 h-100"
          style={{
            cursor: "pointer",
            borderRadius: "15px",
            transition: "transform 0.3s ease",
          }}
          onClick={onClick}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, cardHover)}
          onMouseLeave={(e) =>
            Object.assign(e.currentTarget.style, { transform: "scale(1)" })
          }
        >
          <MDBCardBody className="text-center py-4">
            <div style={{ fontSize: "40px", color }} className="mb-3">
              {icon}
            </div>
            <h6 className="text-muted mb-1">{title}</h6>
            <h5 className="fw-bold">{value}</h5>
            {subtitle && <p className="small text-muted mb-2">{subtitle}</p>}
            <MDBProgress value={progress} className="mt-2" />
            <small className="text-muted">{progress}% Complete</small>
          </MDBCardBody>
        </MDBCard>
      </MDBTooltip>
    </MDBCol>
  );
};

export default TenantDashboard;
