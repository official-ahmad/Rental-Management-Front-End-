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

const buttonStyle = {
  borderRadius: "25px",
  padding: "10px 20px",
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

  const [walletBalance, setWalletBalance] = useState(() => {
    const savedBalance = localStorage.getItem("walletBalance");
    return savedBalance ? parseInt(savedBalance) : 500000;
  });

  const fetchTenantData = useCallback(async () => {
    if (!userId || userId === "") {
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(
        `https://rental-management-back-end-production.up.railway.app/api/bookings/my-booking/${userId}`
      );
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
          const res = await axios.put(
            `https://rental-management-back-end-production.up.railway.app/api/bookings/pay/${bookingId}`
          );

          if (res.status === 200) {
            const newBalance = walletBalance - amount;
            setWalletBalance(newBalance);
            localStorage.setItem("walletBalance", newBalance);

            setBookings((prev) =>
              prev.map((b) =>
                b._id === bookingId ? { ...b, paymentStatus: "Paid" } : b
              )
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
          toast.error("Payment failed. Please check CORS/Server.");
        }
      }
    });
  };

  const handleCancelBooking = async (bookingId) => {
    Swal.fire({
      title: "Confirm Cancellation",
      text: "Are you sure you want to cancel this request?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, cancel it!",
      borderRadius: "15px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await axios.delete(
            `https://rental-management-back-end-production.up.railway.app/api/bookings/cancel/${bookingId}`
          );
          if (res.status === 200) {
            toast.success("Request cancelled successfully!");
            fetchTenantData();
          }
        } catch (error) {
          toast.error("Failed to cancel request.");
        }
      }
    });
  };

  useEffect(() => {
    if (!role || role !== "Tenant") {
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
        "https://rental-management-back-end-production.up.railway.app/api/bookings/request",
        payload
      );
      if (res.status === 201 || res.status === 200) {
        toast.success("Request sent successfully!");
        localStorage.removeItem("selectedProperty");
        setSelectedProp(null);
        fetchTenantData();
      }
    } catch (error) {
      toast.error("Booking request failed.");
    }
  };

  const latestBooking = bookings.length > 0 ? bookings[0] : null;
  const confirmLogout = () => {
    localStorage.clear();
    navigate("/page");
  };

  if (loading) return <div className="text-center py-5">Loading...</div>;

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <Toaster position="top-right" />

      {/* FIXED NAVBAR FOR MOBILE */}
      <MDBNavbar
        expand="lg"
        dark
        style={{ background: "linear-gradient(135deg, #1e3c72, #2a5298)" }}
        className="p-3"
      >
        <MDBContainer fluid>
          <MDBNavbarBrand className="fw-bold fs-4">
            TENANT PORTAL
          </MDBNavbarBrand>

          {/* Mobile Toggler Button */}
          <MDBNavbarToggler
            className="text-white border-0 shadow-0"
            onClick={() => setNavbarOpen(!navbarOpen)}
          >
            <FaBars />
          </MDBNavbarToggler>

          <MDBCollapse navbar isOpen={navbarOpen}>
            <MDBNavbarNav className="ms-auto d-flex align-items-center flex-column flex-lg-row pt-3 pt-lg-0">
              <MDBNavbarItem className="mb-3 mb-lg-0">
                <MDBBtn
                  color="light"
                  outline
                  size="sm"
                  className="me-lg-3 d-flex align-items-center gap-2"
                  onClick={() => navigate("/")}
                  style={{ ...buttonStyle, color: "#fff", borderColor: "#fff" }}
                >
                  <FaArrowLeft /> Back to Home
                </MDBBtn>
              </MDBNavbarItem>
              <MDBNavbarItem className="me-lg-3 text-white mb-3 mb-lg-0">
                <FaUserCircle className="me-2" /> {userName}
              </MDBNavbarItem>
              <MDBNavbarItem>
                <MDBBtn
                  color="danger"
                  size="sm"
                  onClick={() => setLogoutModalOpen(true)}
                  style={buttonStyle}
                >
                  Logout
                </MDBBtn>
              </MDBNavbarItem>
            </MDBNavbarNav>
          </MDBCollapse>
        </MDBContainer>
      </MDBNavbar>

      <MDBContainer className="py-4">
        {/* Wallet Section (Responsive Padding) */}
        <MDBRow className="mb-4">
          <MDBCol>
            <MDBCard
              className="border-0 shadow-lg text-white"
              style={{
                background: "linear-gradient(135deg, #059669, #10b981)",
                borderRadius: "20px",
              }}
            >
              <MDBCardBody className="p-4 d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-uppercase mb-1 opacity-75 small fw-bold">
                    Available Balance
                  </h6>
                  <h2 className="fw-bold m-0" style={{ fontSize: "2rem" }}>
                    ₹{walletBalance.toLocaleString()}
                  </h2>
                </div>
                <div className="bg-white p-3 rounded-circle text-success shadow d-none d-sm-block">
                  <FaWallet size={30} />
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>

        {/* Status Cards - (Fixed for Mobile Grid) */}
        <MDBRow className="g-3 mb-4">
          <StatusCard
            icon={<FaHome />}
            title="Property"
            value={
              latestBooking ? latestBooking.propertyId?.propertyName : "None"
            }
            color="#007bff"
            progress={latestBooking ? 100 : 0}
          />
          <StatusCard
            icon={<FaFileInvoiceDollar />}
            title="Status"
            value={latestBooking ? latestBooking.status : "No Request"}
            color="#ffc107"
            progress={latestBooking?.status === "Approved" ? 100 : 50}
          />
          {/* <StatusCard
            icon={<FaTools />}
            title="Monthly Rent"
            value={
              latestBooking
                ? `Rs. ${latestBooking.propertyId?.rentAmount}`
                : "Rs. 0"
            }
            color="#198754"
            progress={latestBooking ? 100 : 0}
          /> */}
          // TenantDashboard.jsx mein jahan StatusCard hain (Line 350 ke paas)
          <StatusCard
            icon={<FaTools />}
            title="Monthly Rent"
            value={
              latestBooking?.propertyId?.rentAmount
                ? `Rs. ${latestBooking.propertyId.rentAmount.toLocaleString()}`
                : "Rs. 0"
            }
            subtitle="As per rental agreement"
            color="#198754"
            progress={latestBooking ? 100 : 0}
          />
        </MDBRow>

        {/* Table - Fully Responsive */}
        <MDBCard
          className="border-0 shadow-sm"
          style={{ borderRadius: "20px" }}
        >
          <MDBCardBody className="p-3">
            <h5 className="fw-bold mb-3">My Bookings</h5>
            <div className="table-responsive">
              <MDBTable hover align="middle" className="mb-0" small>
                <MDBTableHead className="bg-light">
                  <tr>
                    <th>Property</th>
                    <th>Rent</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {bookings.map((b) => (
                    <tr key={b._id}>
                      <td className="small fw-bold">
                        {b.propertyId?.propertyName || "N/A"}
                      </td>
                      <td className="small">
                        Rs. {b.propertyId?.rentAmount?.toLocaleString()}
                      </td>
                      <td>
                        <MDBBadge
                          color={
                            b.status === "Approved" ? "success" : "warning"
                          }
                          pill
                        >
                          {b.status}
                        </MDBBadge>
                      </td>
                      <td>
                        {b.status === "Approved" &&
                        b.paymentStatus !== "Paid" ? (
                          <MDBBtn
                            color="success"
                            size="sm"
                            className="rounded-pill"
                            onClick={() =>
                              handlePayment(
                                b._id,
                                b.propertyId?.rentAmount,
                                b.propertyId?.propertyName
                              )
                            }
                          >
                            Pay
                          </MDBBtn>
                        ) : b.paymentStatus === "Paid" ||
                          b.status === "Paid" ? (
                          <MDBBadge color="info" pill>
                            Paid
                          </MDBBadge>
                        ) : (
                          <MDBBtn
                            color="danger"
                            outline
                            size="sm"
                            onClick={() => handleCancelBooking(b._id)}
                          >
                            <FaTrashAlt />
                          </MDBBtn>
                        )}
                      </td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </div>
          </MDBCardBody>
        </MDBCard>
      </MDBContainer>

      {/* Logout Modal remains same... */}
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
                <FaCheck /> Logout
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

const StatusCard = ({ icon, title, value, color, progress }) => (
  <MDBCol xs="12" md="4">
    <MDBCard
      className="shadow-sm border-0 h-100"
      style={{ borderRadius: "15px" }}
    >
      <MDBCardBody className="text-center py-3">
        <div style={{ fontSize: "2rem", color, marginBottom: "10px" }}>
          {icon}
        </div>
        <h6 className="text-muted small mb-1">{title}</h6>
        <h6 className="fw-bold mb-2">{value}</h6>
        <MDBProgress
          value={progress}
          style={{ height: "5px" }}
          color={progress === 100 ? "success" : "warning"}
        />
      </MDBCardBody>
    </MDBCard>
  </MDBCol>
);

export default TenantDashboard;
