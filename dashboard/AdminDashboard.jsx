import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserCog,
  LogOut,
  RefreshCw,
  Plus,
  Search,
  Edit3,
  Trash2,
  X,
  MapPin,
  Home,
  DollarSign,
  ClipboardList,
  ChevronDown,
  Menu,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { API, apiClient } from "../src/config/api";
import { getDisplayName, formatDate } from "../src/utils/helpers";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const adminName = localStorage.getItem("userName") || "Super Admin";
  const API_BASE = API.MANAGER.BASE;

  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const [managers, setManagers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

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
      const [propRes, userRes, bookingRes] = await Promise.all([
        apiClient.get(`${API_BASE}/properties`),
        apiClient.get(`${API_BASE}/users`),
        apiClient.get(API.BOOKINGS.ALL_REQUESTS).catch(() => ({ data: [] })),
      ]);

      setProperties(propRes.data || []);
      setBookings(bookingRes.data || []);
      const allUsers = userRes.data || [];
      setManagers(allUsers.filter((u) => u.role?.toLowerCase() === "manager"));
      setTenants(allUsers.filter((u) => u.role?.toLowerCase() === "tenant"));
    } catch {
      toast.error("Failed to sync data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

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
      setFormData({ ...initialFormState, managerId: managers[0]?._id || "" });
    }
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        await apiClient.put(`${API_BASE}/update/${selectedId}`, payload);
        toast.success("Property updated!");
      } else {
        await apiClient.post(`${API_BASE}/add`, payload);
        toast.success("Property added!");
      }
      setModalOpen(false);
      fetchAllData();
    } catch (err) {
      toast.error(err.response?.data?.error || "Error saving property");
    }
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Delete Property?",
      text: "This action cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`${API_BASE}/delete/${id}`);
          toast.success("Property deleted!");
          fetchAllData();
        } catch {
          toast.error("Delete failed");
        }
      }
    });
  };

  const handleDeleteUser = (id, name) => {
    Swal.fire({
      title: `Remove ${name}?`,
      text: "This will permanently delete this user account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, remove",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await apiClient.delete(`${API_BASE}/users/${id}`);
          toast.success("User removed!");
          fetchAllData();
        } catch {
          toast.error("Failed to remove user");
        }
      }
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You'll need to sign in again.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        toast.success("Logged out!");
        navigate("/page");
      }
    });
  };

  // Computed stats
  const stats = useMemo(() => {
    const totalRevenue = properties
      .filter((p) => p.status === "Occupied")
      .reduce((sum, p) => sum + (p.rentAmount || 0), 0);
    const occupancyRate =
      properties.length > 0
        ? Math.round(
            (properties.filter((p) => p.status === "Occupied").length /
              properties.length) *
              100,
          )
        : 0;
    const pendingBookings = bookings.filter(
      (b) => b.status === "Pending",
    ).length;
    return { totalRevenue, occupancyRate, pendingBookings };
  }, [properties, bookings]);

  // Filtered data for table
  const displayData = useMemo(() => {
    let data = [];
    if (activeTab === "managers") data = managers;
    else if (activeTab === "tenants") data = tenants;
    else if (activeTab === "properties") data = properties;
    else if (activeTab === "bookings") data = bookings;
    else return [];

    const query = searchQuery.toLowerCase();
    if (!query) return data;
    return data.filter(
      (item) =>
        (getDisplayName(item) || item.propertyName || "")
          .toLowerCase()
          .includes(query) ||
        (item.location || "").toLowerCase().includes(query) ||
        (item.email || "").toLowerCase().includes(query),
    );
  }, [activeTab, managers, tenants, properties, bookings, searchQuery]);

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "managers", label: "Managers", icon: UserCog },
    { id: "tenants", label: "Tenants", icon: Users },
    { id: "bookings", label: "Bookings", icon: ClipboardList },
  ];

  if (loading)
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Toaster position="top-right" />

      {/* ─── SIDEBAR ─── */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-20"} bg-[#0f172a] text-white flex flex-col sticky top-0 h-screen transition-all duration-300 ease-in-out flex-shrink-0`}
      >
        {/* Header */}
        <div className="p-5 flex items-center justify-between">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                RentManager
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-slate-400 hover:text-white transition-colors p-1"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        {sidebarOpen && (
          <div className="px-5 pb-6">
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold truncate">{adminName}</p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {sidebarOpen && <span>{label}</span>}
              {sidebarOpen &&
                id === "bookings" &&
                stats.pendingBookings > 0 && (
                  <span className="ml-auto bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {stats.pendingBookings}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 overflow-x-hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-8 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {activeTab === "overview"
                ? "Dashboard"
                : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchAllData}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-8">
          {/* ─── OVERVIEW TAB ─── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  icon={Building2}
                  label="Total Properties"
                  value={properties.length}
                  color="blue"
                />
                <StatCard
                  icon={UserCog}
                  label="Managers"
                  value={managers.length}
                  color="violet"
                />
                <StatCard
                  icon={Users}
                  label="Tenants"
                  value={tenants.length}
                  color="emerald"
                />
                <StatCard
                  icon={DollarSign}
                  label="Monthly Revenue"
                  value={`Rs ${stats.totalRevenue.toLocaleString()}`}
                  color="amber"
                />
              </div>

              {/* Second row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Occupancy Card */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500 mb-4">
                    Occupancy Rate
                  </p>
                  <div className="flex items-end gap-3 mb-4">
                    <span className="text-4xl font-extrabold text-slate-900">
                      {stats.occupancyRate}%
                    </span>
                    <span className="text-sm text-emerald-600 font-medium pb-1">
                      {properties.filter((p) => p.status === "Occupied").length}
                      /{properties.length} units
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5">
                    <div
                      className="bg-emerald-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${stats.occupancyRate}%` }}
                    />
                  </div>
                </div>

                {/* Booking Summary */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500 mb-4">
                    Booking Summary
                  </p>
                  <div className="space-y-3">
                    {[
                      {
                        label: "Pending",
                        count: bookings.filter((b) => b.status === "Pending")
                          .length,
                        color: "bg-amber-500",
                      },
                      {
                        label: "Approved",
                        count: bookings.filter((b) => b.status === "Approved")
                          .length,
                        color: "bg-emerald-500",
                      },
                      {
                        label: "Rejected",
                        count: bookings.filter((b) => b.status === "Rejected")
                          .length,
                        color: "bg-red-500",
                      },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${item.color}`}
                          />
                          <span className="text-sm text-slate-600">
                            {item.label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {item.count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm">
                  <p className="text-sm font-semibold text-slate-500 mb-4">
                    Quick Actions
                  </p>
                  <div className="space-y-2.5">
                    <button
                      onClick={() => {
                        setActiveTab("properties");
                        setTimeout(() => handleOpenModal(), 100);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add New Property
                    </button>
                    <button
                      onClick={() => setActiveTab("managers")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <UserCog className="w-4 h-4" /> View Managers
                    </button>
                    <button
                      onClick={() => setActiveTab("bookings")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-amber-50 text-amber-700 rounded-xl text-sm font-medium hover:bg-amber-100 transition-colors"
                    >
                      <ClipboardList className="w-4 h-4" /> View Bookings
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100">
                  <p className="text-sm font-semibold text-slate-700">
                    Recent Properties
                  </p>
                </div>
                <div className="divide-y divide-slate-100">
                  {properties.slice(0, 5).map((prop) => (
                    <div
                      key={prop._id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            prop.image ||
                            "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60"
                          }
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {prop.propertyName}
                          </p>
                          <p className="text-xs text-slate-400">
                            {prop.location}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">
                          Rs {prop.rentAmount?.toLocaleString()}
                        </span>
                        <StatusBadge status={prop.status} />
                      </div>
                    </div>
                  ))}
                  {properties.length === 0 && (
                    <p className="px-6 py-8 text-center text-sm text-slate-400">
                      No properties yet
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ─── DATA TABLE TABS ─── */}
          {activeTab !== "overview" && (
            <div className="animate-[fadeIn_0.3s_ease]">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-72 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm"
                  />
                </div>
                {activeTab === "properties" && (
                  <button
                    onClick={() => handleOpenModal()}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20"
                  >
                    <Plus className="w-4 h-4" /> Add Property
                  </button>
                )}
              </div>

              {/* Table Card */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      {activeTab === "properties" && (
                        <>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Location
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Rent
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </>
                      )}
                      {(activeTab === "managers" ||
                        activeTab === "tenants") && (
                        <>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Joined
                          </th>
                          <th className="text-right px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </>
                      )}
                      {activeTab === "bookings" && (
                        <>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Property
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Tenant
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Payment
                          </th>
                          <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Date
                          </th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayData.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {activeTab === "properties" && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    item.image ||
                                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=100&q=60"
                                  }
                                  alt=""
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.propertyName}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {item.category}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                                {item.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                              Rs {item.rentAmount?.toLocaleString()}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => handleOpenModal(item)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(item._id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                        {(activeTab === "managers" ||
                          activeTab === "tenants") && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm">
                                  {(getDisplayName(item) || "U")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <span className="text-sm font-semibold text-slate-800">
                                  {getDisplayName(item) || "—"}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {item.email}
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  item.role === "Manager"
                                    ? "bg-violet-50 text-violet-700"
                                    : "bg-sky-50 text-sky-700"
                                }`}
                              >
                                {item.role}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() =>
                                  handleDeleteUser(
                                    item._id,
                                    getDisplayName(item),
                                  )
                                }
                                className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </>
                        )}
                        {activeTab === "bookings" && (
                          <>
                            <td className="px-6 py-4 text-sm font-medium text-slate-800">
                              {item.propertyId?.propertyName ||
                                item.propertyId ||
                                "—"}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">
                              {getDisplayName(item.tenantId) ||
                                item.tenantId ||
                                "—"}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={item.status} />
                            </td>
                            <td className="px-6 py-4">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
                                  item.paymentStatus === "Paid"
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-amber-50 text-amber-700"
                                }`}
                              >
                                {item.paymentStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400">
                              {formatDate(item.bookingDate || item.createdAt)}
                            </td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {displayData.length === 0 && (
                  <div className="py-16 text-center">
                    <p className="text-slate-400 text-sm">No records found</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── PROPERTY MODAL ─── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl max-w-2xl w-[95%] max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeSlideUp_0.3s_ease]">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  {editMode ? (
                    <Edit3 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Plus className="w-5 h-5 text-emerald-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {editMode ? "Edit Property" : "Add Property"}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in the property details below
                  </p>
                </div>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Property Name & Manager */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalInput
                  label="Property Name"
                  value={formData.propertyName}
                  onChange={(v) =>
                    setFormData({ ...formData, propertyName: v })
                  }
                />
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Assign Manager
                  </label>
                  <div className="relative">
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    <select
                      value={formData.managerId}
                      onChange={(e) =>
                        setFormData({ ...formData, managerId: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="">Choose Manager...</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {getDisplayName(m) || m.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Specs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ModalInput
                  label="Rent (Rs)"
                  type="number"
                  value={formData.rentAmount}
                  onChange={(v) => setFormData({ ...formData, rentAmount: v })}
                />
                <ModalInput
                  label="Bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(v) => setFormData({ ...formData, bedrooms: v })}
                />
                <ModalInput
                  label="Bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(v) => setFormData({ ...formData, bathrooms: v })}
                />
                <ModalInput
                  label="Area (sqft)"
                  type="number"
                  value={formData.area}
                  onChange={(v) => setFormData({ ...formData, area: v })}
                />
              </div>

              {/* Category & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {["Apartment", "House", "Villa", "Studio"].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {["Vacant", "Occupied", "Under Maintenance"].map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location, Image, Description */}
              <ModalInput
                label="Full Address"
                value={formData.location}
                onChange={(v) => setFormData({ ...formData, location: v })}
              />
              <ModalInput
                label="Image URL"
                value={formData.image}
                onChange={(v) => setFormData({ ...formData, image: v })}
                required={false}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20"
                >
                  {editMode ? "Save Changes" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};

/* ─── Reusable Components ─── */

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <p className="text-2xl font-extrabold text-slate-900 mb-0.5">{value}</p>
      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
        {label}
      </p>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const map = {
    Vacant: "bg-emerald-50 text-emerald-700",
    Occupied: "bg-amber-50 text-amber-700",
    "Under Maintenance": "bg-slate-100 text-slate-600",
    Pending: "bg-amber-50 text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50 text-red-700",
    Paid: "bg-emerald-50 text-emerald-700",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${map[status] || "bg-slate-100 text-slate-500"}`}
    >
      {status}
    </span>
  );
};

const ModalInput = ({
  label,
  value,
  onChange,
  type = "text",
  required = true,
}) => (
  <div>
    <label className="block text-sm font-semibold text-slate-700 mb-1.5">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required={required}
      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
    />
  </div>
);

export default AdminDashboard;
