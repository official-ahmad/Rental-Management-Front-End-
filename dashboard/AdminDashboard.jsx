import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import Swal from "sweetalert2";
import {
  FaUsers,
  FaBuilding,
  FaSignOutAlt,
  FaChartLine,
  FaBars,
  FaEdit,
  FaUserTie,
  FaUserFriends,
  FaSync,
  FaTrash,
  FaPlus,
  FaMapMarkerAlt,
  FaUserCircle,
  FaMoneyBillWave,
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
  MDBBadge,
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const adminName = localStorage.getItem("userName") || "Super Admin";
  const API_BASE =
    "https://rental-management-back-end.onrender.com//api/manager";

  // UI States
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  // CRUD States
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  // Data States
  const [managers, setManagers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);

  const initialFormState = {
    propertyName: "",
    location: "",
    rentAmount: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    image: "",
    description: "",
    category: "Apartment",
    status: "Vacant",
    managerId: "",
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };

      const [propRes, userRes] = await Promise.all([
        axios.get(`${API_BASE}/properties`, config),
        axios.get(`${API_BASE}/users`, config),
      ]);

      setProperties(propRes.data || []);
      const allUsers = userRes.data || [];
      const managerList = allUsers.filter(
        (u) => u.role?.toLowerCase() === "manager",
      );
      const tenantList = allUsers.filter(
        (u) => u.role?.toLowerCase() === "tenant",
      );

      setManagers(managerList);
      setTenants(tenantList);

      if (managerList.length > 0 && !formData.managerId) {
        setFormData((prev) => ({ ...prev, managerId: managerList[0]._id }));
      }
    } catch (err) {
      toast.error("Database sync failed! Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE, formData.managerId]);

  useEffect(() => {
    if (!role || role.toLowerCase() !== "admin") {
      toast.error("Access denied. Admin only!");
      navigate("/page", { replace: true });
    } else {
      fetchAllData();
    }
  }, [role, navigate, fetchAllData]);

  const handleOpenModal = (prop = null) => {
    if (prop) {
      setEditMode(true);
      setSelectedId(prop._id);
      setFormData({
        ...prop,
        managerId: prop.owner || prop.managerId || managers[0]?._id || "",
      });
    } else {
      setEditMode(false);
      setFormData({
        ...initialFormState,
        managerId: managers[0]?._id || "",
      });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const payload = {
      ...formData,
      name: formData.propertyName,
      rentAmount: Number(formData.rentAmount),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
    };

    try {
      if (editMode) {
        await axios.put(`${API_BASE}/update/${selectedId}`, payload, config);
        toast.success("Property Updated Successfully!");
      } else {
        await axios.post(`${API_BASE}/add`, payload, config);
        toast.success("New Property Added!");
      }
      setModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving property");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const token = localStorage.getItem("token");
          await axios.delete(`${API_BASE}/delete/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          toast.success("Property Deleted!");
          fetchAllData();
        } catch (err) {
          toast.error("Delete operation failed");
        }
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout Confirmation",
      text: "Do you really want to logout from the admin panel?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, confirm logout",
      cancelButtonText: "Cancel logout",
      background: "#ffffff",
      borderRadius: "15px",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        toast.success("Successfully logged out!");
        navigate("/page");
      }
    });
  };

  const getDisplayData = () => {
    let data = [];
    if (activeTab === "managers") {
      data = managers;
    } else if (activeTab === "tenants") {
      data = tenants;
    } else if (activeTab === "properties") {
      data = properties;
    } else if (activeTab === "revenue") {
      data = properties.filter((p) => p.status === "Occupied");
    } else {
      data = [...managers, ...tenants];
    }

    const query = searchQuery.toLowerCase();
    return data.filter(
      (item) =>
        (item.name || item.propertyName || "").toLowerCase().includes(query) ||
        (item.location || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query),
    );
  };

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-grow text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      <Toaster position="top-right" reverseOrder={false} />

      {/* SIDEBAR */}
      <div
        style={{
          width: sidebarOpen ? "280px" : "85px",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          color: "white",
          padding: "25px 15px",
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          position: "sticky",
          top: 0,
          height: "100vh",
          zIndex: 1000,
        }}
      >
        <div className="d-flex justify-content-between align-items-center mb-5 px-2">
          {sidebarOpen && (
            <h4 className="fw-bold m-0 text-primary">ADMIN PRO</h4>
          )}
          <FaBars
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ cursor: "pointer" }}
          />
        </div>

        {sidebarOpen && (
          <div className="text-center mb-5">
            <FaUserCircle size={50} className="text-primary mb-2 shadow-sm" />
            <h6 className="m-0 fw-bold">{adminName}</h6>
            <small className="text-muted">Super Administrator</small>
          </div>
        )}

        <div className="d-flex flex-column gap-2">
          <SidebarItem
            active={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
            icon={<FaChartLine />}
            label={sidebarOpen ? "Dashboard Overview" : ""}
          />
          <SidebarItem
            active={activeTab === "managers"}
            onClick={() => setActiveTab("managers")}
            icon={<FaUserTie />}
            label={sidebarOpen ? "Property Managers" : ""}
          />
          <SidebarItem
            active={activeTab === "tenants"}
            onClick={() => setActiveTab("tenants")}
            icon={<FaUserFriends />}
            label={sidebarOpen ? "Active Tenants" : ""}
          />
          {/* Naya Added Tab */}
          <SidebarItem
            active={activeTab === "revenue"}
            onClick={() => setActiveTab("revenue")}
            icon={<FaMoneyBillWave />}
            label={sidebarOpen ? "Collected Revenue" : ""}
          />
          <SidebarItem
            active={activeTab === "properties"}
            onClick={() => setActiveTab("properties")}
            icon={<FaBuilding />}
            label={sidebarOpen ? "Real Estate Assets" : ""}
          />

          <hr style={{ opacity: 0.1, margin: "20px 0" }} />
          <div
            onClick={handleLogout}
            className="text-danger p-3 d-flex align-items-center gap-3 fw-bold logout-btn"
            style={{ cursor: "pointer" }}
          >
            <FaSignOutAlt /> {sidebarOpen && "Logout System"}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "40px", overflowX: "hidden" }}>
        <MDBContainer fluid>
          <div className="d-flex justify-content-between align-items-start mb-5">
            <div>
              <h2 className="fw-bold text-dark m-0">Global Registry</h2>
              <p className="text-muted">
                Real-time monitoring and management system
              </p>
            </div>
            <MDBBtn
              color="white"
              onClick={fetchAllData}
              className="shadow-sm border rounded-pill px-4 py-2 bg-white"
            >
              <FaSync className={`me-2 ${loading ? "fa-spin" : ""}`} /> Sync
              Database
            </MDBBtn>
          </div>

          {/* Stats Cards Row */}
          <MDBRow className="mb-4 g-4">
            <StatsCard
              title="Total Managers"
              value={managers.length}
              icon={<FaUserTie />}
              color="#3b82f6"
            />
            <StatsCard
              title="Active Tenants"
              value={tenants.length}
              icon={<FaUsers />}
              color="#10b981"
            />
            <StatsCard
              title="Total Listings"
              value={properties.length}
              icon={<FaBuilding />}
              color="#f59e0b"
            />
          </MDBRow>

          {/* Records Table Card */}
          <MDBCard
            className="border-0 shadow-sm overflow-hidden"
            style={{ borderRadius: "20px" }}
          >
            <MDBCardBody className="p-0">
              <div className="p-4 d-flex justify-content-between align-items-center border-bottom bg-white">
                <h5 className="fw-bold m-0 text-dark">Records Directory</h5>
                <div className="d-flex gap-3">
                  <div
                    className="input-group input-group-sm rounded-pill border px-2 bg-light"
                    style={{ width: "300px" }}
                  >
                    <input
                      type="text"
                      placeholder="Search records..."
                      className="form-control border-0 bg-transparent shadow-none"
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  {activeTab === "properties" && (
                    <MDBBtn
                      color="primary"
                      size="sm"
                      onClick={() => handleOpenModal()}
                      className="rounded-pill px-4 shadow-0"
                    >
                      <FaPlus className="me-2" /> Add Property
                    </MDBBtn>
                  )}
                </div>
              </div>

              <MDBTable
                hover
                responsive
                borderless
                align="middle"
                className="mb-0"
              >
                <MDBTableHead className="bg-light">
                  {activeTab === "revenue" ? (
                    <tr>
                      <th className="ps-4">Occupied Property</th>
                      <th>Location</th>
                      <th>Collected Rent</th>
                      <th className="text-end pe-4">Payment Status</th>
                    </tr>
                  ) : activeTab === "properties" ? (
                    <tr>
                      <th className="ps-4">Property Detail</th>
                      <th>Location</th>
                      <th>Management</th>
                      <th>Listing Status</th>
                      <th className="text-end pe-4">Control</th>
                    </tr>
                  ) : (
                    <tr>
                      <th className="ps-4">Contact Email</th>
                      <th>Access Level</th>
                      <th className="text-end pe-4">Account Status</th>
                    </tr>
                  )}
                </MDBTableHead>

                <MDBTableBody>
                  {getDisplayData().map((item) => (
                    <tr
                      key={item._id}
                      className="align-middle border-bottom"
                      style={{ height: "80px" }}
                    >
                      {activeTab === "revenue" ? (
                        <>
                          <td className="ps-4">
                            <div className="fw-bold text-dark">
                              {item.propertyName}
                            </div>
                            <div className="text-primary small">
                              {item.category}
                            </div>
                          </td>
                          <td>
                            <div className="text-muted small">
                              {item.location}
                            </div>
                          </td>
                          <td>
                            <div className="fw-bold text-success">
                              ₹{item.rentAmount}
                            </div>
                          </td>
                          <td className="text-end pe-4">
                            <MDBBadge
                              color="success"
                              pill
                              light
                              className="px-3"
                            >
                              Received
                            </MDBBadge>
                          </td>
                        </>
                      ) : activeTab === "properties" ? (
                        <>
                          <td className="ps-4">
                            <div className="d-flex align-items-center">
                              <img
                                src={
                                  item.image ||
                                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80"
                                }
                                style={{
                                  width: "50px",
                                  height: "50px",
                                  borderRadius: "12px",
                                }}
                                className="me-3 object-fit-cover shadow-sm"
                                alt=""
                              />
                              <div>
                                <div className="fw-bold text-dark">
                                  {item.propertyName}
                                </div>
                                <div className="text-primary small">
                                  {item.category}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="d-flex align-items-center text-muted small">
                              <FaMapMarkerAlt className="text-danger me-2" />{" "}
                              {item.location}
                            </div>
                          </td>
                          <td>
                            <MDBBadge pill color="info" light className="px-2">
                              {managers.find(
                                (m) => m._id === (item.owner || item.managerId),
                              )?.name || "System Admin"}
                            </MDBBadge>
                          </td>
                          <td>
                            <MDBBadge
                              color={
                                item.status === "Vacant" ? "success" : "warning"
                              }
                              pill
                              light
                              className="px-3"
                            >
                              {item.status}
                            </MDBBadge>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="ps-4 text-muted">{item.email}</td>
                          <td>
                            <MDBBadge
                              color={
                                item.role === "manager" ? "primary" : "info"
                              }
                              light
                              className="text-uppercase"
                            >
                              {item.role}
                            </MDBBadge>
                          </td>
                        </>
                      )}

                      {/* Control/Action buttons logic */}
                      <td className="text-end pe-4">
                        {activeTab === "revenue" ? (
                          <MDBBadge color="info" className="rounded-pill px-3">
                            Verified
                          </MDBBadge>
                        ) : activeTab === "properties" ? (
                          <div className="d-flex justify-content-end gap-2">
                            <MDBBtn
                              color="link"
                              size="sm"
                              onClick={() => handleOpenModal(item)}
                              className="text-info p-0"
                            >
                              <FaEdit size={18} />
                            </MDBBtn>
                            <MDBBtn
                              color="link"
                              size="sm"
                              onClick={() => handleDelete(item._id)}
                              className="text-danger p-0"
                            >
                              <FaTrash size={16} />
                            </MDBBtn>
                          </div>
                        ) : (
                          <MDBBadge
                            color="success"
                            className="rounded-pill px-3"
                          >
                            Active
                          </MDBBadge>
                        )}
                      </td>
                    </tr>
                  ))}
                </MDBTableBody>
              </MDBTable>
            </MDBCardBody>
          </MDBCard>
        </MDBContainer>
      </div>

      {/* PROPERTY FORM MODAL */}
      <MDBModal open={modalOpen} setOpen={setModalOpen} tabIndex="-1">
        <MDBModalDialog size="lg" centered>
          <MDBModalContent style={{ borderRadius: "24px", border: "none" }}>
            <MDBModalHeader
              className="text-white border-0 p-4"
              style={{
                background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
              }}
            >
              <MDBModalTitle className="fw-bold d-flex align-items-center">
                <div
                  className="bg-primary rounded-circle p-2 me-3 d-flex align-items-center justify-content-center"
                  style={{ width: "45px", height: "45px" }}
                >
                  {editMode ? <FaEdit size={20} /> : <FaPlus size={20} />}
                </div>
                {editMode ? "Modify Property Listing" : "Create New Listing"}
              </MDBModalTitle>
              <MDBBtn
                className="btn-close btn-close-white"
                color="none"
                onClick={() => setModalOpen(false)}
              ></MDBBtn>
            </MDBModalHeader>

            <MDBModalBody
              className="p-4"
              style={{ backgroundColor: "#ffffff" }}
            >
              <form onSubmit={handleSubmit} id="propertyForm">
                <SectionHeader title="Core Information" />
                <MDBRow className="g-3 mb-4">
                  <FormInput
                    md="6"
                    label="Property Title"
                    value={formData.propertyName}
                    onChange={(v) =>
                      setFormData({ ...formData, propertyName: v })
                    }
                  />

                  {/* --- : MANAGER DROPDOWN --- */}
                  <MDBCol md="6">
                    <label className="form-label fw-bold small text-muted">
                      Assign Manager
                    </label>
                    <select
                      className="form-select border-0 shadow-sm p-2 bg-light"
                      style={{ borderRadius: "8px" }}
                      value={formData.managerId}
                      onChange={(e) =>
                        setFormData({ ...formData, managerId: e.target.value })
                      }
                      required
                    >
                      <option value="">Choose Manager...</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {m.name || m.email}
                        </option>
                      ))}
                    </select>
                  </MDBCol>
                </MDBRow>

                <SectionHeader title="Specifications & Pricing" />
                <MDBRow className="g-3 mb-4">
                  <FormInput
                    md="3"
                    label="Rent (₹)"
                    type="number"
                    value={formData.rentAmount}
                    onChange={(v) =>
                      setFormData({ ...formData, rentAmount: v })
                    }
                  />
                  <FormInput
                    md="3"
                    label="Bedrooms"
                    type="number"
                    value={formData.bedrooms}
                    onChange={(v) => setFormData({ ...formData, bedrooms: v })}
                  />
                  <FormInput
                    md="3"
                    label="Bath"
                    type="number"
                    value={formData.bathrooms}
                    onChange={(v) => setFormData({ ...formData, bathrooms: v })}
                  />
                  <FormInput
                    md="3"
                    label="Area (sqft)"
                    type="number"
                    value={formData.area}
                    onChange={(v) => setFormData({ ...formData, area: v })}
                  />
                </MDBRow>

                <MDBRow className="g-3 mb-4">
                  <MDBCol md="6">
                    <label className="form-label fw-bold small text-muted">
                      Category
                    </label>
                    <select
                      className="form-select border-0 shadow-sm p-2 bg-light"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                    >
                      {["Apartment", "House", "Villa", "Studio"].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </MDBCol>
                  <MDBCol md="6">
                    <label className="form-label fw-bold small text-muted">
                      Initial Status
                    </label>
                    <select
                      className="form-select border-0 shadow-sm p-2 bg-light"
                      value={formData.status}
                      onChange={(e) =>
                        setFormData({ ...formData, status: e.target.value })
                      }
                    >
                      {["Vacant", "Occupied", "Under Maintenance"].map(
                        (opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ),
                      )}
                    </select>
                  </MDBCol>
                </MDBRow>

                <SectionHeader title="Location & Media" />
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">
                    Full Address
                  </label>
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm p-2 bg-light"
                    value={formData.location}
                    onChange={(e) =>
                      setFormData({ ...formData, location: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label fw-bold small text-muted">
                    Image Link
                  </label>
                  <input
                    type="text"
                    className="form-control border-0 shadow-sm p-2 bg-light"
                    value={formData.image}
                    onChange={(e) =>
                      setFormData({ ...formData, image: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="form-label fw-bold small text-muted">
                    Description
                  </label>
                  <textarea
                    className="form-control border-0 shadow-sm p-2 bg-light"
                    rows="3"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    required
                  ></textarea>
                </div>
              </form>
            </MDBModalBody>

            <MDBModalFooter className="border-0 p-4 bg-light">
              <MDBBtn
                color="none"
                className="text-muted fw-bold"
                onClick={() => setModalOpen(false)}
              >
                Discard
              </MDBBtn>
              <MDBBtn
                type="submit"
                form="propertyForm"
                color="primary"
                className="rounded-pill px-5 shadow-0"
              >
                {editMode ? "Push Updates" : "Confirm Listing"}
              </MDBBtn>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    style={{
      cursor: "pointer",
      padding: "14px 18px",
      borderRadius: "14px",
      backgroundColor: active ? "rgba(59, 130, 246, 0.12)" : "transparent",
      color: active ? "#60a5fa" : "#94a3b8",
      display: "flex",
      alignItems: "center",
      gap: "15px",
      transition: "0.25s all ease",
    }}
  >
    <span style={{ fontSize: "1.1rem" }}>{icon}</span>
    <span
      className="fw-medium small text-uppercase"
      style={{ letterSpacing: "0.5px" }}
    >
      {label}
    </span>
  </div>
);

const StatsCard = ({ title, value, icon, color }) => (
  <MDBCol md="4">
    <MDBCard
      className="border-0 shadow-sm h-100"
      style={{ borderRadius: "20px" }}
    >
      <MDBCardBody className="d-flex justify-content-between align-items-center p-4">
        <div>
          <p className="text-muted small mb-1 fw-bold text-uppercase">
            {title}
          </p>
          <h2 className="fw-bold mb-0" style={{ color }}>
            {value}
          </h2>
        </div>
        <div
          className="p-3 rounded-circle"
          style={{ backgroundColor: `${color}15`, color }}
        >
          {React.cloneElement(icon, { size: 24 })}
        </div>
      </MDBCardBody>
    </MDBCard>
  </MDBCol>
);

const SectionHeader = ({ title }) => (
  <p
    className="text-primary small fw-bold text-uppercase mb-3 mt-2 border-bottom pb-2"
    style={{ letterSpacing: "1px" }}
  >
    {title}
  </p>
);

const FormInput = ({
  md,
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
}) => (
  <MDBCol md={md}>
    <label className="form-label fw-bold small text-muted">{label}</label>
    <input
      type={type}
      className="form-control border-0 shadow-sm p-2 bg-light"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
    />
  </MDBCol>
);

export default AdminDashboard;
