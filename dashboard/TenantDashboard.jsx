import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import axios from "axios";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaTools,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaTrashAlt,
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

const buttonStyle = {
  borderRadius: "25px",
  padding: "12px 24px",
  transition: "all 0.3s ease",
  fontWeight: "600",
  textTransform: "none",
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
};

const TenantDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Tenant";
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);

  // --- Logic: Fetch Tenant Bookings ---
  const fetchTenantData = useCallback(async () => {
    if (!userId || userId === "") {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/api/bookings/my-booking/${userId}`
      );
      setBookings(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // --- Logic: Cancel Pending Request ---
  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this request?"))
      return;

    try {
      const res = await axios.delete(
        `http://localhost:8000/api/bookings/cancel/${bookingId}`
      );
      if (res.status === 200) {
        toast.success("Request cancelled successfully!");
        fetchTenantData(); // Refresh table
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to cancel request.");
    }
  };

  useEffect(() => {
    if (!role || role !== "Tenant") {
      toast.error("Access denied. Please login as Tenant");
      navigate("/login", { replace: true });
      return;
    }
    const savedProp = localStorage.getItem("selectedProperty");
    if (savedProp) setSelectedProp(JSON.parse(savedProp));
    fetchTenantData();
  }, [role, navigate, fetchTenantData]);

  const handleConfirmBooking = async () => {
    if (!selectedProp || !userId) return;
    try {
      const payload = {
        propertyId: selectedProp._id,
        tenantId: userId,
        managerId: selectedProp.managerId || "6784d8583be59d1b64010915",
      };
      const res = await axios.post(
        "http://localhost:8000/api/bookings/request",
        payload
      );
      if (res.status === 201 || res.status === 200) {
        toast.success("Request sent successfully!");
        localStorage.removeItem("selectedProperty");
        setSelectedProp(null);
        fetchTenantData();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Booking request failed.");
    }
  };

  const latestBooking = bookings.length > 0 ? bookings[0] : null;
  const confirmLogout = () => {
    localStorage.clear();
    navigate("/page");
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        <div className="text-center">
          <div
            className="spinner-border text-primary"
            role="status"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#f8f9fa",
        minHeight: "100vh",
        fontFamily: "'Roboto', sans-serif",
      }}
    >
      <Toaster position="top-right" />

      {/* Enhanced Navbar */}
      <MDBNavbar
        expand="lg"
        dark
        style={{
          background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
        }}
        className="p-3"
      >
        <MDBContainer fluid>
          <MDBBtn
            color="light"
            outline
            size="sm"
            className="me-3 d-flex align-items-center gap-2"
            onClick={() => navigate("/")}
            style={{ ...buttonStyle, borderColor: "#fff", color: "#fff" }}
          >
            <FaArrowLeft /> Back to Home
          </MDBBtn>
          <MDBNavbarBrand
            className="fw-bold text-white"
            style={{ fontSize: "1.5rem" }}
          >
            TENANT PORTAL
          </MDBNavbarBrand>
          <MDBNavbarToggler onClick={() => setNavbarOpen(!navbarOpen)}>
            <FaBars />
          </MDBNavbarToggler>
          <MDBCollapse navbar isOpen={navbarOpen}>
            <MDBNavbarNav className="ms-auto d-flex align-items-center">
              <MDBNavbarItem className="me-3 text-white d-flex align-items-center">
                <FaUserCircle className="me-2" style={{ fontSize: "1.2rem" }} />{" "}
                Welcome, {userName}
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBBtn
                  color="danger"
                  size="sm"
                  onClick={() => setLogoutModalOpen(true)}
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
        {/* Enhanced Confirmation Card */}
        {selectedProp && (
          <MDBCard
            className="mb-5 border-0 shadow-lg"
            style={{
              background: "linear-gradient(90deg, #e8f5e8 0%, #f0f9ff 100%)",
              borderRadius: "20px",
              border: "1px solid #d4edda",
            }}
          >
            <MDBCardBody className="p-4 d-flex align-items-center justify-content-between flex-wrap">
              <div className="d-flex align-items-center">
                <div
                  style={{
                    fontSize: "3rem",
                    color: "#28a745",
                    marginRight: "15px",
                  }}
                >
                  <FaHome />
                </div>
                <div>
                  <h4 className="fw-bold text-success mb-1">
                    Complete Your Booking
                  </h4>
                  <p className="mb-0 text-muted">
                    Selected: <strong>{selectedProp.propertyName}</strong> in{" "}
                    {selectedProp.location}
                  </p>
                </div>
              </div>
              <MDBBtn
                color="success"
                style={{
                  ...buttonStyle,
                  backgroundColor: "#28a745",
                  borderColor: "#28a745",
                }}
                onClick={handleConfirmBooking}
              >
                <FaCheck className="me-2" /> Confirm & Send Request
              </MDBBtn>
            </MDBCardBody>
          </MDBCard>
        )}

        {/* Enhanced Status Cards */}
        <MDBRow className="mb-5">
          <StatusCard
            icon={<FaHome />}
            title="Active Property"
            value={
              latestBooking
                ? latestBooking.propertyId?.propertyName
                : "No Selection"
            }
            subtitle={
              latestBooking
                ? latestBooking.propertyId?.location
                : "Browse properties on the Home page"
            }
            color="#007bff"
            progress={latestBooking ? 100 : 0}
          />
          <StatusCard
            icon={<FaFileInvoiceDollar />}
            title="Request Status"
            value={latestBooking ? latestBooking.status : "No Active Request"}
            subtitle={
              latestBooking?.status === "Pending"
                ? "Awaiting manager approval"
                : "View history in the table below"
            }
            color={
              latestBooking?.status === "Pending"
                ? "#ffc107"
                : latestBooking?.status === "Approved"
                ? "#198754"
                : "#dc3545"
            }
            progress={
              latestBooking
                ? latestBooking.status === "Approved"
                  ? 100
                  : 50
                : 0
            }
          />
          <StatusCard
            icon={<FaTools />}
            title="Monthly Rent"
            value={
              latestBooking
                ? `Rs. ${latestBooking.propertyId?.rentAmount?.toLocaleString()}`
                : "Rs. 0"
            }
            subtitle="As per rental agreement"
            color="#198754"
            progress={latestBooking ? 100 : 0}
          />
        </MDBRow>

        {/* Enhanced Table Card */}
        <MDBCard
          style={{
            borderRadius: "20px",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.1)",
          }}
          className="border-0"
        >
          <MDBCardBody className="p-4">
            <h5
              className="fw-bold mb-4 text-dark"
              style={{ fontSize: "1.5rem" }}
            >
              My Booking Requests
            </h5>
            <MDBTable
              hover
              responsive
              striped
              align="middle"
              style={{ borderRadius: "10px", overflow: "hidden" }}
            >
              <MDBTableHead
                className="bg-primary text-white"
                style={{ fontWeight: "600" }}
              >
                <tr>
                  <th>Property Name</th>
                  <th>Location</th>
                  <th>Rent Amount</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr
                      key={b._id}
                      style={{ transition: "background-color 0.3s ease" }}
                    >
                      <td className="fw-bold">
                        {b.propertyId?.propertyName || "N/A"}
                      </td>
                      <td>{b.propertyId?.location || "N/A"}</td>
                      <td className="text-success fw-semibold">
                        Rs. {b.propertyId?.rentAmount?.toLocaleString() || 0}
                      </td>
                      <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td>
                        <span
                          className={`badge ${
                            b.status === "Pending"
                              ? "bg-warning text-dark"
                              : b.status === "Approved"
                              ? "bg-success"
                              : "bg-danger"
                          }`}
                          style={{ fontSize: "0.85rem", padding: "6px 12px" }}
                        >
                          {b.status}
                        </span>
                      </td>
                      <td>
                        {b.status === "Pending" ? (
                          <MDBBtn
                            color="danger"
                            size="sm"
                            outline
                            style={{
                              ...buttonStyle,
                              borderRadius: "20px",
                              padding: "8px 16px",
                            }}
                            onClick={() => handleCancelBooking(b._id)}
                          >
                            <FaTrashAlt className="me-1" /> Cancel
                          </MDBBtn>
                        ) : (
                          <span className="text-muted small">No Actions</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="6"
                      className="text-center py-5 text-muted"
                      style={{ fontSize: "1.1rem" }}
                    >
                      <FaHome
                        style={{
                          fontSize: "2rem",
                          marginBottom: "10px",
                          opacity: 0.5,
                        }}
                      />
                      <br />
                      No booking history found. Start by selecting a property!
                    </td>
                  </tr>
                )}
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      {/* Enhanced Logout Modal */}
      <MDBModal
        open={logoutModalOpen}
        setOpen={setLogoutModalOpen}
        tabIndex="-1"
      >
        <MDBModalDialog centered>
          <MDBModalContent
            style={{
              borderRadius: "20px",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.2)",
            }}
          >
            <MDBModalHeader
              className="bg-light"
              style={{ borderRadius: "20px 20px 0 0" }}
            >
              <MDBModalTitle className="text-danger fw-bold">
                <FaSignOutAlt className="me-2" /> Confirm Logout
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setLogoutModalOpen(false)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody
              className="text-center py-4"
              style={{ fontSize: "1.1rem" }}
            >
              Are you sure you want to log out? You'll need to log in again to
              access your dashboard.
            </MDBModalBody>
            <MDBModalFooter
              className="justify-content-center"
              style={{ borderRadius: "0 0 20px 20px" }}
            >
              <MDBBtn
                color="secondary"
                onClick={() => setLogoutModalOpen(false)}
                style={{ ...buttonStyle, marginRight: "10px" }}
              >
                <FaTimes /> Cancel
              </MDBBtn>
              <MDBBtn
                color="danger"
                onClick={confirmLogout}
                style={buttonStyle}
              >
                <FaCheck /> Confirm Logout
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

const StatusCard = ({ icon, title, value, subtitle, color, progress }) => (
  <MDBCol md="4" className="mb-4">
    <MDBCard
      className="shadow-lg border-0 h-100"
      style={{
        borderRadius: "20px",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-5px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <MDBCardBody className="text-center py-4">
        <div style={{ fontSize: "3rem", color, marginBottom: "15px" }}>
          {icon}
        </div>
        <h6 className="text-muted mb-2" style={{ fontWeight: "500" }}>
          {title}
        </h6>
        <h5 className="fw-bold mb-2" style={{ color }}>
          {value}
        </h5>
        <p className="small text-muted mb-3">{subtitle}</p>
        <MDBProgress
          value={progress}
          className="mt-2"
          style={{ height: "8px", borderRadius: "4px" }}
          color={
            progress === 100
              ? "success"
              : progress === 50
              ? "warning"
              : "secondary"
          }
        />
      </MDBCardBody>
    </MDBCard>
  </MDBCol>
);

export default TenantDashboard;
