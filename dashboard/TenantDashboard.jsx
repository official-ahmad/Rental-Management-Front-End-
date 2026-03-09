import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
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
  FaWallet,
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
  MDBBadge,
} from "mdb-react-ui-kit";
import Swal from "sweetalert2";
import { API, apiClient } from "../src/config/api";

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

  // const [walletBalance, setWalletBalance] = useState(50000000000);
  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    return savedBalance ? parseInt(savedBalance) : 500000; // Default 5 Lakh rakh lein ya jo aap chahen
  });

  const fetchTenantData = useCallback(async () => {
    if (!userId || userId === "") {
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get(API.BOOKINGS.MY_BOOKING(userId));
      setBookings(res.data);
    } catch (err) {
      console.error("Fetch Error:", err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const handlePayment = (bookingId, amount, propertyName) => {
    if (walletBalance < amount) {
      return Swal.fire({
        title: "Insufficient Balance!",
        text: "Please Recharge!.",
        icon: "error",
        borderRadius: "20px",
      });
    }

    Swal.fire({
      title: "Confirm Payment",
      text: `Do you want to pay ₹${amount.toLocaleString()} for ${propertyName} now?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Pay Now!",
      borderRadius: "20px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiClient.put(API.BOOKINGS.PAY(bookingId));

          if (res.status === 200) {
            const newBalance = walletBalance - amount;

            setWalletBalance(newBalance);

            localStorage.setItem("walletBalance", newBalance);

            setBookings((prev) =>
              prev.map((b) =>
                b._id === bookingId ? { ...b, paymentStatus: "Paid" } : b,
              ),
            );

            Swal.fire({
              title: "Success!",
              text: "Rent paid successfully and saved in database!",
              icon: "success",
              borderRadius: "20px",
            });

            fetchTenantData();
          }
        } catch (error) {
          console.error("Payment Sync Error:", error);
          toast.error("Payment failed to save on server.");
        }
      }
    });
  };
  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: "Confirm Cancellation",
      text: "Are you sure you want to cancel this request? This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, cancel it!",
      cancelButtonText: "No, keep it",
      borderRadius: "15px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await apiClient.delete(API.BOOKINGS.CANCEL(bookingId));
          if (res.status === 200) {
            toast.success("Request cancelled successfully!");
            fetchTenantData();
          }
        } catch (error) {
          toast.error(
            error.response?.data?.message || "Failed to cancel request.",
          );
        }
      }
    });
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
      };
      const res = await apiClient.post(API.BOOKINGS.REQUEST, payload);
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
    navigate("/");
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

      {/* Navbar  */}
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
        <MDBRow className="mb-4">
          <MDBCol md="12">
            <MDBCard
              className="border-0 shadow-lg text-white"
              style={{
                background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
                borderRadius: "20px",
              }}
            >
              <MDBCardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <h6
                    className="text-uppercase mb-1 fw-bold"
                    style={{ opacity: 0.8 }}
                  >
                    Available Balance
                  </h6>
                  <h2 className="fw-bold m-0" style={{ fontSize: "2.5rem" }}>
                    ₹{walletBalance.toLocaleString()}
                  </h2>
                  <small>* Credits can be used for instant rent payments</small>
                </div>
                <div className="bg-white p-4 rounded-circle text-success shadow-lg">
                  <FaWallet size={40} />
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

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
              <MDBTableHead className="bg-primary text-white">
                <tr>
                  <th>Property Name</th>
                  <th>Rent Amount</th>
                  <th>Request Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </MDBTableHead>
              <MDBTableBody>
                {bookings.length > 0 ? (
                  bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="fw-bold">
                        {b.propertyId?.propertyName || "N/A"}
                      </td>
                      <td className="text-success fw-semibold">
                        Rs. {b.propertyId?.rentAmount?.toLocaleString() || 0}
                      </td>
                      <td>{new Date(b.bookingDate).toLocaleDateString()}</td>
                      <td>
                        <MDBBadge
                          color={
                            b.status === "Pending"
                              ? "warning"
                              : b.status === "Approved"
                                ? "success"
                                : "danger"
                          }
                          pill
                        >
                          {b.status}
                        </MDBBadge>
                      </td>
                      <td>
                        {/* --- NEW: Pay Now Logic --- */}
                        {b.status === "Approved" &&
                        b.paymentStatus !== "Paid" ? (
                          <MDBBtn
                            color="success"
                            size="sm"
                            className="rounded-pill px-3 shadow-0"
                            onClick={() =>
                              handlePayment(
                                b._id,
                                b.propertyId?.rentAmount,
                                b.propertyId?.propertyName,
                              )
                            }
                          >
                            <FaWallet className="me-2" /> Pay Now
                          </MDBBtn>
                        ) : b.paymentStatus === "Paid" ||
                          b.status === "Paid" ? (
                          <MDBBadge color="info" pill>
                            Paid Successfully
                          </MDBBadge>
                        ) : b.status === "Pending" ? (
                          <MDBBtn
                            color="danger"
                            size="sm"
                            outline
                            style={{ borderRadius: "20px" }}
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
                    <td colSpan="5" className="text-center py-5 text-muted">
                      No booking history found.
                    </td>
                  </tr>
                )}
              </MDBTableBody>
            </MDBTable>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      <MDBModal
        open={logoutModalOpen}
        setOpen={setLogoutModalOpen}
        tabIndex="-1"
      >
        <MDBModalDialog centered>
          <MDBModalContent style={{ borderRadius: "20px" }}>
            <MDBModalHeader className="bg-light">
              <MDBModalTitle className="text-danger fw-bold">
                <FaSignOutAlt className="me-2" /> Confirm Logout
              </MDBModalTitle>
            </MDBModalHeader>
            <MDBModalBody className="text-center py-4">
              Are you sure you want to log out?
            </MDBModalBody>
            <MDBModalFooter className="justify-content-center">
              <MDBBtn
                color="secondary"
                onClick={() => setLogoutModalOpen(false)}
                style={buttonStyle}
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
      style={{ borderRadius: "20px", transition: "transform 0.3s ease" }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.transform = "translateY(-5px)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      <MDBCardBody className="text-center py-4">
        <div style={{ fontSize: "3rem", color, marginBottom: "15px" }}>
          {icon}
        </div>
        <h6 className="text-muted mb-2">{title}</h6>
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
