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

// Style variables ko component ke bahar rakh diya taake "undefined" error na aaye
const buttonStyle = {
  borderRadius: "25px",
  padding: "10px 20px",
  transition: "all 0.3s ease",
};

const buttonHover = {
  transform: "scale(1.05)",
};

const TenantDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Tenant";
  const userId = localStorage.getItem("userId"); // Isko check karna hai

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Logic States
  const [property, setProperty] = useState(null);
  const [selectedProp, setSelectedProp] = useState(null); // Home page se aayi hui property
  const [rentHistory, setRentHistory] = useState([
    { month: "December 2025", amount: "$1,450.00", status: "Paid" },
  ]);

  useEffect(() => {
    if (!role || role !== "Tenant") {
      toast.error("Access denied. Please login as Tenant");
      navigate("/login", { replace: true });
      return;
    }

    // 1. Check if there is a pending selection from Home Page
    const savedProp = localStorage.getItem("selectedProperty");
    if (savedProp) {
      setSelectedProp(JSON.parse(savedProp));
    }

    const fetchTenantData = async () => {
      // 2. userId undefined wala fix
      if (!userId || userId === "undefined") {
        console.error("User ID is missing!");
        setLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `http://localhost:8000/api/properties/my-property/${userId}`
        );
        setProperty(res.data);
      } catch (err) {
        console.log("No property assigned yet");
      } finally {
        setLoading(false);
      }
    };

    fetchTenantData();
  }, [role, navigate, userId]);

  // --- NEW LOGIC: Confirm Booking Function ---
  const handleConfirmBooking = async () => {
    try {
      const bookingData = {
        propertyId: selectedProp._id,
        tenantId: userId,
        managerId: selectedProp.managerId, // Property ke sath managerId honi chahiye
        status: "Pending",
      };

      await axios.post(
        "http://localhost:8000/api/bookings/request",
        bookingData
      );

      toast.success("Request sent to Manager! Please wait for approval.");
      localStorage.removeItem("selectedProperty"); // Clean up
      setSelectedProp(null);
    } catch (error) {
      toast.error("Failed to send request. Check backend.");
      console.error(error);
    }
  };

  const handleLogoutClick = () => setLogoutModalOpen(true);

  const confirmLogout = () => {
    localStorage.clear();
    toast.success("Logged out successfully");
    setLogoutModalOpen(false);
    setTimeout(() => navigate("/login"), 1000);
  };

  const cancelLogout = () => setLogoutModalOpen(false);

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

  const cardStyle = {
    borderRadius: "15px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
    transition: "transform 0.3s ease",
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

      {/* Navbar - Your Original Code */}
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
          <MDBNavbarToggler onClick={() => setNavbarOpen(!navbarOpen)}>
            <FaBars />
          </MDBNavbarToggler>
          <MDBCollapse navbar isOpen={navbarOpen}>
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
                >
                  <FaSignOutAlt className="me-1" /> Logout
                </MDBBtn>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-5">
        {/* --- NEW LOGIC: Conditional Booking Card (Design Integrated) --- */}
        {selectedProp && (
          <MDBCard
            className="mb-5 border-0 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #fff 0%, #f0fff0 100%)",
              borderRadius: "15px",
            }}
          >
            <MDBCardBody className="p-4 d-flex align-items-center justify-content-between flex-wrap">
              <div>
                <h4 className="fw-bold text-success mb-1">
                  Finish Your Booking!
                </h4>
                <p className="text-muted mb-0">
                  You selected <strong>{selectedProp.propertyName}</strong>.
                  Send request to manager?
                </p>
              </div>
              <div className="mt-3 mt-md-0">
                <MDBBtn
                  color="success"
                  style={buttonStyle}
                  onClick={handleConfirmBooking}
                >
                  <FaCheck className="me-2" /> Confirm Request
                </MDBBtn>
                <MDBBtn
                  outline
                  color="danger"
                  className="ms-2"
                  style={buttonStyle}
                  onClick={() => {
                    localStorage.removeItem("selectedProperty");
                    setSelectedProp(null);
                  }}
                >
                  Discard
                </MDBBtn>
              </div>
            </MDBCardBody>
          </MDBCard>
        )}

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
            onClick={() => toast("Property details viewing...")}
          />
          {/* ... Baqi StatusCards Same ... */}
          <StatusCard
            icon={<FaFileInvoiceDollar />}
            title="Monthly Rent"
            value={property ? `$${property.rentAmount}` : "$0.00"}
            subtitle={property ? "Due on 1st of month" : "No balance due"}
            color="#dc3545"
            progress={75}
            tooltip="Pay your rent now"
            onClick={() => toast("Redirecting to Payments...")}
          />
          <StatusCard
            icon={<FaTools />}
            title="Maintenance Status"
            value="Unit Active"
            subtitle="System is working fine"
            color="#ffc107"
            progress={100}
            tooltip="Report an issue if needed"
            onClick={() => toast("No active maintenance requests")}
          />
        </MDBRow>

        {/* Quick Actions & Table - Your Original Design */}
        <MDBCard className="shadow-2 border-0 mb-5" style={cardStyle}>
          <MDBCardBody className="p-4">
            <h5 className="fw-bold mb-4 text-dark">Quick Actions</h5>
            <div className="d-flex flex-wrap gap-3 justify-content-center">
              <MDBBtn
                color="success"
                style={buttonStyle}
                onClick={() => toast.success("Opening Payment Gateway...")}
              >
                <FaFileInvoiceDollar className="me-2" /> Pay Rent
              </MDBBtn>
              <MDBBtn
                outline
                color="primary"
                style={buttonStyle}
                onClick={() => toast("Rent history is below")}
              >
                <FaHistory className="me-2" /> View Rent History
              </MDBBtn>
              <MDBBtn
                outline
                color="dark"
                style={buttonStyle}
                onClick={() => toast("Request form opening...")}
              >
                <FaPlusCircle className="me-2" /> Report an Issue
              </MDBBtn>
            </div>
          </MDBCardBody>
        </MDBCard>

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
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {filteredHistory.map((item, idx) => (
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
                  </tr>
                ))}
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      {/* Logout Modal - Your Original Code */}
      <MDBModal
        show={logoutModalOpen}
        setShow={setLogoutModalOpen}
        tabIndex="-1"
        centered
      >
        <MDBModalDialog>
          <MDBModalContent style={{ borderRadius: "15px" }}>
            <MDBModalHeader className="bg-light">
              <MDBModalTitle className="text-danger fw-bold">
                <FaSignOutAlt className="me-2" /> Confirm Logout
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center py-4">
              <p>Are you sure you want to log out?</p>
            </MDBModalBody>
            <MDBModalFooter className="justify-content-center">
              <MDBBtn
                color="secondary"
                onClick={cancelLogout}
                style={{ borderRadius: "25px" }}
              >
                <FaTimes className="me-1" /> Cancel
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={confirmLogout}
                style={{ borderRadius: "25px" }}
              >
                <FaCheck className="me-1" /> Confirm Logout
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

// --- Status Card Component (Modified to fix cardHover error) ---
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
  return (
    <MDBCol md="4" className="mb-3">
      <MDBTooltip tag="div" title={tooltip}>
        <MDBCard
          className="shadow-2 border-0 h-100"
          style={{ cursor: "pointer", borderRadius: "15px" }}
          onClick={onClick}
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
