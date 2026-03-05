import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaBuilding,
  FaUsers,
  FaSignOutAlt,
  FaMapMarkerAlt,
  FaBars,
  FaCheck,
  FaTimes,
  FaInbox,
  FaSearch,
  FaUserCircle,
  FaPlus,
  FaEdit,
  FaTrash,
  FaChartLine,
} from "react-icons/fa";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBBtn,
  MDBTable,
  MDBTableHead,
  MDBTableBody,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBInput,
} from "mdb-react-ui-kit";
import { API } from "../src/config/api";

const formatDate = (dateValue) => {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ManagerDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const managerName = localStorage.getItem("userName") || "Admin Manager";
  const managerEmail =
    localStorage.getItem("userEmail") || "manager@property.com";

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [searchTerm, setSearchTerm] = useState("");

  const [requests, setRequests] = useState([]);
  const [properties, setProperties] = useState([]);
  const [activeTenants, setActiveTenants] = useState([]);

  const API_BASE = API.MANAGER.BASE;

  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    _id: "",
    propertyName: "",
    location: "",
    rentAmount: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    image: "",
    description: "",
    status: "Vacant",
  });

  const fetchData = useCallback(async () => {
    try {
      const [propRes, bookRes] = await Promise.all([
        axios.get(`${API_BASE}/properties`),
        axios.get(API.BOOKINGS.ALL_REQUESTS),
      ]);
      setProperties(propRes.data || []);
      const allBookings = bookRes.data || [];
      setRequests(allBookings.filter((req) => req.status === "Pending"));
      setActiveTenants(allBookings.filter((req) => req.status === "Approved"));
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (!role || role !== "Manager") {
      toast.error("Access denied.");
      navigate("/page", { replace: true });
    } else {
      fetchData();
    }
  }, [role, navigate, fetchData]);

  const handleOpenModal = useCallback((prop = null) => {
    if (prop) {
      setFormData({ ...prop });
      setIsEdit(true);
    } else {
      setFormData({
        _id: "",
        propertyName: "",
        location: "",
        rentAmount: "",
        bedrooms: "",
        bathrooms: "",
        area: "",
        image: "",
        description: "",
        status: "Vacant",
      });
      setIsEdit(false);
    }
    setModalOpen(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      try {
        const finalData = {
          ...formData,
          rentAmount: Number(formData.rentAmount),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
        };

        if (isEdit) {
          await axios.put(`${API_BASE}/update/${formData._id}`, finalData);
          toast.success("Property Updated!");
        } else {
          const { _id, ...newPropertyData } = finalData;
          await axios.post(`${API_BASE}/add`, newPropertyData);
          toast.success("Property Added Successfully!");
        }
        setModalOpen(false);
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Operation failed");
      }
    },
    [formData, isEdit, API_BASE, fetchData],
  );

  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this property!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await axios.delete(`${API_BASE}/delete/${id}`);
            toast.success("Property deleted successfully");
            fetchData();
          } catch {
            toast.error("Delete failed");
          }
        }
      });
    },
    [API_BASE, fetchData],
  );

  const handleStatusUpdate = useCallback(
    async (bookingId, newStatus) => {
      try {
        await axios.put(API.BOOKINGS.UPDATE(bookingId), { status: newStatus });
        toast.success(`Booking ${newStatus}!`);
        fetchData();
      } catch {
        toast.error("Update failed");
      }
    },
    [fetchData],
  );

  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Logout?",
      text: "Ready to end your session?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#1a237e",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        navigate("/page");
      }
    });
  }, [navigate]);

  // Memoized filtered data for performance
  const filteredList = useMemo(() => {
    const term = searchTerm.toLowerCase();
    if (activeTab === "properties") {
      return properties.filter(
        (p) =>
          p.propertyName?.toLowerCase().includes(term) ||
          p.location?.toLowerCase().includes(term),
      );
    }
    if (activeTab === "requests") {
      return requests.filter(
        (r) =>
          r.tenantId?.name?.toLowerCase().includes(term) ||
          r.propertyId?.propertyName?.toLowerCase().includes(term),
      );
    }
    return activeTenants.filter(
      (t) =>
        t.tenantId?.name?.toLowerCase().includes(term) ||
        t.propertyId?.propertyName?.toLowerCase().includes(term),
    );
  }, [activeTab, searchTerm, properties, requests, activeTenants]);

  // Memoize handlers
  const handleTabChange = useCallback((tabId) => {
    setActiveTab(tabId);
    setSearchTerm("");
  }, []);

  const handleSearchChange = useCallback((e) => {
    setSearchTerm(e.target.value);
  }, []);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        backgroundColor: "#f8f9fc",
      }}
    >
      <Toaster position="top-right" />

      {/* Sidebar */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "85px",
          background: "linear-gradient(180deg, #1a237e 0%, #121858 100%)",
          color: "white",
          padding: "24px 16px",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "sticky",
          top: 0,
          height: "100vh",
          boxShadow: "4px 0 10px rgba(0,0,0,0.1)",
          zIndex: 1000,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
          {sidebarOpen && (
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-white rounded-circle p-1 d-flex align-items-center justify-content-center"
                style={{ width: "32px", height: "32px" }}
              >
                <FaChartLine className="text-primary" size={18} />
              </div>
              <h5 className="fw-bold m-0 text-white">ESTATE PRO</h5>
            </div>
          )}
          <FaBars
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: "pointer", opacity: 0.8 }}
            size={20}
          />
        </div>

        <div className={`text-center mb-5 ${!sidebarOpen && "d-none"}`}>
          <FaUserCircle size={64} className="text-white-50 mb-2" />
          <h6 className="mb-1 fw-bold text-white">{managerName}</h6>
          <p className="text-white-50 small">{managerEmail}</p>
        </div>

        <div className="d-flex flex-column gap-3">
          {[
            { id: "properties", label: "Inventory", icon: <FaBuilding /> },
            { id: "requests", label: "Requests", icon: <FaInbox /> },
            { id: "tenants", label: "Tenants", icon: <FaUsers /> },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => handleTabChange(item.id)}
              className="sidebar-item"
              style={{
                cursor: "pointer",
                padding: "14px 18px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                background:
                  activeTab === item.id
                    ? "rgba(255,255,255,0.15)"
                    : "transparent",
              }}
            >
              <span
                className={`me-3 ${
                  activeTab === item.id ? "text-white" : "text-white-50"
                }`}
              >
                {item.icon}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </div>
          ))}
          <div
            onClick={handleLogout}
            className="mt-auto p-3 text-danger logout-hover"
            style={{ cursor: "pointer" }}
          >
            <FaSignOutAlt className="me-3" /> {sidebarOpen && "Sign Out"}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "40px", overflowY: "auto" }}>
        <MDBContainer fluid className="p-0">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-end mb-5 gap-3">
            <div>
              <h2
                className="fw-black text-dark m-0"
                style={{ fontWeight: 900 }}
              >
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}{" "}
                Management
              </h2>
            </div>

            <div className="d-flex gap-3 align-items-center">
              <div className="position-relative" style={{ width: "320px" }}>
                <FaSearch className="position-absolute top-50 translate-middle-y text-muted ms-3" />
                <input
                  className="form-control border-0 shadow-sm ps-5 py-2"
                  placeholder={`Search ${activeTab}...`}
                  style={{ borderRadius: "10px", height: "45px" }}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>
              {activeTab === "properties" && (
                <MDBBtn
                  className="shadow-sm border-0 px-4"
                  style={{
                    background: "#1a237e",
                    borderRadius: "10px",
                    height: "45px",
                  }}
                  onClick={() => handleOpenModal()}
                >
                  <FaPlus className="me-2" /> Add New
                </MDBBtn>
              )}
            </div>
          </div>

          <MDBCard
            className="border-0 shadow-sm"
            style={{ borderRadius: "20px", overflow: "hidden" }}
          >
            <MDBCardBody className="p-0">
              <MDBTable hover responsive align="middle" className="mb-0">
                <MDBTableHead style={{ backgroundColor: "#f8f9fc" }}>
                  <tr>
                    {activeTab === "properties" ? (
                      <>
                        <th className="ps-4 border-0 text-muted small fw-bold">
                          PROPERTY DETAILS
                        </th>
                        <th className="border-0 text-muted small fw-bold">
                          LOCATION
                        </th>
                        <th className="border-0 text-muted small fw-bold">
                          RENT
                        </th>
                        <th className="border-0 text-muted small fw-bold text-center">
                          STATUS
                        </th>
                        <th className="border-0 text-muted small fw-bold text-end pe-4">
                          ACTIONS
                        </th>
                      </>
                    ) : activeTab === "requests" ? (
                      <>
                        <th className="ps-4 border-0 text-muted small fw-bold">
                          PROSPECTIVE TENANT
                        </th>
                        <th className="border-0 text-muted small fw-bold">
                          PROPERTY
                        </th>
                        <th className="border-0 text-muted small fw-bold">
                          REQUEST DATE
                        </th>
                        <th className="border-0 text-muted small fw-bold text-center">
                          DECISION
                        </th>
                      </>
                    ) : (
                      <>
                        <th className="ps-4 border-0 text-muted small fw-bold">
                          ACTIVE TENANT
                        </th>
                        <th className="border-0 text-muted small fw-bold">
                          ASSIGNED UNIT
                        </th>
                        <th className="border-0 text-muted small fw-bold text-center">
                          LEASE STATUS
                        </th>
                      </>
                    )}
                  </tr>
                </MDBTableHead>
                <MDBTableBody>
                  {filteredList.map((item) => (
                    <tr key={item._id}>
                      {activeTab === "properties" && (
                        <>
                          <td className="ps-4 py-4">
                            <div className="d-flex align-items-center">
                              <img
                                src={item.image || "https://placehold.co/40x40"}
                                className="rounded-3 me-3 shadow-sm"
                                style={{
                                  width: "45px",
                                  height: "45px",
                                  objectFit: "cover",
                                }}
                              />
                              <div>
                                <div className="fw-bold text-dark">
                                  {item.propertyName}
                                </div>
                                <div className="text-muted small">
                                  {item.area} sqft | {item.bedrooms} Bed |{" "}
                                  {item.bathrooms} Bath
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <FaMapMarkerAlt
                              className="text-danger me-2 opacity-50"
                              size={12}
                            />
                            {item.location}
                          </td>
                          <td>
                            <span className="fw-bold text-dark">
                              Rs. {item.rentAmount?.toLocaleString()}
                            </span>
                          </td>
                          <td className="text-center">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                backgroundColor:
                                  item.status === "Occupied"
                                    ? "#e8f5e9"
                                    : "#fffde7",
                                color:
                                  item.status === "Occupied"
                                    ? "#2e7d32"
                                    : "#f9a825",
                                fontWeight: "600",
                              }}
                            >
                              {item.status || "Vacant"}
                            </span>
                          </td>
                          <td className="text-end pe-4">
                            <MDBBtn
                              color="link"
                              className="p-2"
                              onClick={() => handleOpenModal(item)}
                            >
                              <FaEdit className="text-primary" />
                            </MDBBtn>
                            <MDBBtn
                              color="link"
                              className="p-2"
                              onClick={() => handleDelete(item._id)}
                            >
                              <FaTrash className="text-danger" />
                            </MDBBtn>
                          </td>
                        </>
                      )}

                      {activeTab === "requests" && (
                        <>
                          <td className="ps-4 py-4">
                            <div className="fw-bold text-dark">
                              {item.tenantId?.name}
                            </div>
                            <div className="text-muted small">
                              {item.tenantId?.email}
                            </div>
                          </td>
                          <td>
                            <div className="fw-500">
                              {item.propertyId?.propertyName}
                            </div>
                          </td>
                          <td>{formatDate(item.bookingDate)}</td>
                          <td className="text-center">
                            <MDBBtn
                              size="sm"
                              color="success"
                              className="me-2 rounded-3"
                              onClick={() =>
                                handleStatusUpdate(item._id, "Approved")
                              }
                            >
                              <FaCheck />
                            </MDBBtn>
                            <MDBBtn
                              size="sm"
                              color="danger"
                              className="rounded-3"
                              onClick={() =>
                                handleStatusUpdate(item._id, "Rejected")
                              }
                            >
                              <FaTimes />
                            </MDBBtn>
                          </td>
                        </>
                      )}

                      {activeTab === "tenants" && (
                        <>
                          <td className="ps-4 py-4">
                            <div className="fw-bold text-dark">
                              {item.tenantId?.name}
                            </div>
                            <div className="text-muted small">
                              {item.tenantId?.email}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold">
                              {item.propertyId?.propertyName}
                            </div>
                            <div className="text-muted small">
                              {item.propertyId?.location}
                            </div>
                          </td>
                          <td className="text-center">
                            <span
                              className="badge rounded-pill px-3 py-2"
                              style={{
                                backgroundColor: "#e3f2fd",
                                color: "#1976d2",
                              }}
                            >
                              Active Lease
                            </span>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>

      {/* Modal - Added Bedrooms and Bathrooms Fields */}
      <MDBModal open={modalOpen} setOpen={setModalOpen} tabIndex="-1">
        <MDBModalDialog size="lg" centered>
          <MDBModalContent style={{ borderRadius: "24px", border: "none" }}>
            <MDBModalHeader className="border-0 pt-4 px-4">
              <MDBModalTitle className="fw-900" style={{ fontSize: "1.5rem" }}>
                {isEdit ? "Update Property" : "Register New Property"}
              </MDBModalTitle>
              <MDBBtn
                className="btn-close"
                color="none"
                onClick={() => setModalOpen(false)}
              ></MDBBtn>
            </MDBModalHeader>
            <MDBModalBody className="p-4">
              <form onSubmit={handleFormSubmit}>
                <div className="row g-4">
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">Title</label>
                    <MDBInput
                      value={formData.propertyName}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          propertyName: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">Location</label>
                    <MDBInput
                      value={formData.location}
                      onChange={(e) =>
                        setFormData({ ...formData, location: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="small fw-bold text-muted">Rent</label>
                    <MDBInput
                      type="number"
                      value={formData.rentAmount}
                      onChange={(e) =>
                        setFormData({ ...formData, rentAmount: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="small fw-bold text-muted">
                      Area (sqft)
                    </label>
                    <MDBInput
                      type="number"
                      value={formData.area}
                      onChange={(e) =>
                        setFormData({ ...formData, area: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label className="small fw-bold text-muted">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      <option value="Vacant">Vacant</option>
                      <option value="Occupied">Occupied</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">Bedrooms</label>
                    <MDBInput
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bedrooms: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="small fw-bold text-muted">
                      Bathrooms
                    </label>
                    <MDBInput
                      type="number"
                      value={formData.bathrooms}
                      onChange={(e) =>
                        setFormData({ ...formData, bathrooms: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="col-md-12">
                    <label className="small fw-bold text-muted">
                      Image URL
                    </label>
                    <MDBInput
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                  </div>
                  <div className="col-md-12">
                    <label className="small fw-bold text-muted">
                      Description
                    </label>
                    <MDBInput
                      textarea
                      rows={3}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="text-end mt-4">
                  <MDBBtn
                    type="button"
                    color="light"
                    className="me-2"
                    onClick={() => setModalOpen(false)}
                  >
                    Cancel
                  </MDBBtn>
                  <MDBBtn type="submit" style={{ background: "#1a237e" }}>
                    {isEdit ? "Save" : "Add Property"}
                  </MDBBtn>
                </div>
              </form>
            </MDBModalBody>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      <style>{`
        .sidebar-item:hover { background: rgba(255,255,255,0.1) !important; transform: translateX(5px); transition: 0.3s; }
        .logout-hover:hover { background: rgba(255, 153, 153, 0.1) !important; color: #ff4444 !important; }
        .fw-black { font-weight: 900; }
      `}</style>
    </div>
  );
};

export default ManagerDashboard;
