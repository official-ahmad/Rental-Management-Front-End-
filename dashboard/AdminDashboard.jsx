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
  Ban,
  ShieldCheck,
  Activity,
} from "lucide-react";
import { API, apiClient } from "../src/config/api";
import { getDisplayName, formatDate } from "../src/utils/helpers";

/* ══════════════════════════════════════════════════════════════ */
const AdminDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const adminName = localStorage.getItem("userName") || "Super Admin";
  const API_BASE = API.MANAGER.BASE;

  /* ── UI state ─────────────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");

  /* ── Data state ───────────────────────────────────────────── */
  const [managers, setManagers] = useState([]);
  const [tenants, setTenants] = useState([]);
  const [properties, setProperties] = useState([]);
  const [bookings, setBookings] = useState([]);

  /* ── Block/suspend state (tracks locally until page refresh) */
  const [blockedIds, setBlockedIds] = useState(new Set());

  /* ── Property form ───────────────────────────────────────── */
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  /* ── Fetch all data ───────────────────────────────────────── */
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
      /* Restore block state from user records if API surfaces isBlocked */
      const serverBlocked = allUsers
        .filter((u) => u.isBlocked)
        .map((u) => u._id);
      if (serverBlocked.length) setBlockedIds(new Set(serverBlocked));
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

  /* ── Tab change (closes mobile sidebar) ────────────────────── */
  const handleTabChange = useCallback((id) => {
    setActiveTab(id);
    setSearchQuery("");
    setMobileOpen(false);
  }, []);

  const openPropertyDetails = useCallback(
    (propertyId) => {
      navigate(`/property/${propertyId}`);
    },
    [navigate],
  );

  /* ── Property modal ──────────────────────────────────────── */
  const handleOpenModal = useCallback(
    (prop = null) => {
      if (prop) {
        setEditMode(true);
        setSelectedId(prop._id);
        setFormData({
          ...prop,
          managerId:
            prop.owner ||
            prop.managerId?._id ||
            prop.managerId ||
            managers[0]?._id ||
            "",
        });
      } else {
        setEditMode(false);
        setFormData({ ...initialFormState, managerId: managers[0]?._id || "" });
      }
      setModalOpen(true);
    },
    [managers],
  ); // eslint-disable-line

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      name: formData.propertyName,
      rentAmount: Number(formData.rentAmount),
      bedrooms: Number(formData.bedrooms),
      bathrooms: Number(formData.bathrooms),
      area: Number(formData.area),
      managerId: formData.managerId?._id || formData.managerId || null,
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

  /* ── Delete user ─────────────────────────────────────────── */
  const handleDeleteUser = useCallback(
    (id, name) => {
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
    },
    [API_BASE, fetchAllData],
  );

  /* ── Block / unblock user ────────────────────────────────── */
  const handleBlockUser = useCallback(
    async (id, name) => {
      const isBlocked = blockedIds.has(id);
      try {
        await apiClient.patch(`${API_BASE}/users/${id}/block`, {
          blocked: !isBlocked,
        });
        setBlockedIds((prev) => {
          const next = new Set(prev);
          isBlocked ? next.delete(id) : next.add(id);
          return next;
        });
        toast.success(`${name} ${isBlocked ? "unblocked" : "suspended"}`);
      } catch {
        /* Graceful fallback — update UI state even if endpoint absent */
        setBlockedIds((prev) => {
          const next = new Set(prev);
          isBlocked ? next.delete(id) : next.add(id);
          return next;
        });
        toast.success(
          `${name} ${isBlocked ? "unblocked" : "suspended"} (local)`,
        );
      }
    },
    [API_BASE, blockedIds],
  );

  /* ── Logout ──────────────────────────────────────────────── */
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

  /* ── Computed stats ──────────────────────────────────────── */
  const stats = useMemo(() => {
    const occupied = properties.filter((p) => p.status === "Occupied");
    const totalRevenue = occupied.reduce((s, p) => s + (p.rentAmount || 0), 0);
    const occupancyRate =
      properties.length > 0
        ? Math.round((occupied.length / properties.length) * 100)
        : 0;
    const pendingBookings = bookings.filter(
      (b) => b.status === "Pending",
    ).length;
    return { totalRevenue, occupancyRate, pendingBookings };
  }, [properties, bookings]);

  /* ── Activity log (derived from bookings) ────────────────── */
  const activityLogs = useMemo(
    () =>
      [...bookings]
        .sort(
          (a, b) =>
            new Date(b.createdAt || b.bookingDate) -
            new Date(a.createdAt || a.bookingDate),
        )
        .slice(0, 50)
        .map((b) => ({
          id: b._id,
          tenant: getDisplayName(b.tenantId) || b.tenantId || "Unknown",
          property: b.propertyId?.propertyName || "—",
          action: b.status,
          payment: b.paymentStatus || "—",
          date: b.bookingDate || b.createdAt,
        })),
    [bookings],
  );

  /* ── Filtered table data ─────────────────────────────────── */
  const displayData = useMemo(() => {
    let data = [];
    if (activeTab === "managers") data = managers;
    else if (activeTab === "tenants") data = tenants;
    else if (activeTab === "properties") data = properties;
    else if (activeTab === "bookings") data = bookings;
    else return [];

    const q = searchQuery.toLowerCase().trim();
    if (!q) return data;
    return data.filter(
      (item) =>
        (getDisplayName(item) || item.propertyName || "")
          .toLowerCase()
          .includes(q) ||
        (item.location || "").toLowerCase().includes(q) ||
        (item.email || "").toLowerCase().includes(q),
    );
  }, [activeTab, managers, tenants, properties, bookings, searchQuery]);

  /* ── Nav items ───────────────────────────────────────────── */
  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "properties", label: "Properties", icon: Building2 },
    { id: "managers", label: "Managers", icon: UserCog },
    { id: "tenants", label: "Tenants", icon: Users },
    { id: "bookings", label: "Bookings", icon: ClipboardList },
    { id: "activity", label: "Activity Log", icon: Activity },
  ];

  /* ── Loading ─────────────────────────────────────────────── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin" />
          <p className="text-slate-500 text-sm font-medium">
            Loading dashboard…
          </p>
        </div>
      </div>
    );

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <Toaster position="top-right" />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ─────────────────────────────────────────── */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          fixed lg:sticky top-0 h-screen bg-[#0f172a] text-white
          flex flex-col flex-shrink-0 z-50 transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                Rentify.software
              </span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((o) => !o)}
            className="text-slate-400 hover:text-white transition-colors p-1 ml-auto"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Profile */}
        {sidebarOpen && (
          <div className="px-5 pb-5 pt-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
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
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => handleTabChange(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === id
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left">{label}</span>}
              {sidebarOpen &&
                id === "bookings" &&
                stats.pendingBookings > 0 && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {stats.pendingBookings}
                  </span>
                )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-[18px] h-[18px]" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-lg border-b border-slate-200/60 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {activeTab === "overview"
                  ? "Dashboard"
                  : activeTab === "activity"
                    ? "Activity Log"
                    : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {new Date().toLocaleDateString("en-IN", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <button
            onClick={fetchAllData}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>

        <div className="p-6 lg:p-8">
          {/* ─── OVERVIEW TAB ─────────────────────────────────── */}
          {activeTab === "overview" && (
            <div className="space-y-8 animate-[fadeIn_0.3s_ease]">
              {/* Stats */}
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
                  value={`₹${stats.totalRevenue.toLocaleString("en-IN")}`}
                  color="amber"
                />
              </div>

              {/* Second row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Occupancy */}
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
                    ].map(({ label, count, color }) => (
                      <div
                        key={label}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-2.5 h-2.5 rounded-full ${color}`}
                          />
                          <span className="text-sm text-slate-600">
                            {label}
                          </span>
                        </div>
                        <span className="text-sm font-bold text-slate-900">
                          {count}
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
                        handleTabChange("properties");
                        setTimeout(() => handleOpenModal(), 100);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" /> Add New Property
                    </button>
                    <button
                      onClick={() => handleTabChange("managers")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      <UserCog className="w-4 h-4" /> View Managers
                    </button>
                    <button
                      onClick={() => handleTabChange("activity")}
                      className="w-full flex items-center gap-3 px-4 py-3 bg-slate-50 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-100 transition-colors"
                    >
                      <Activity className="w-4 h-4" /> Activity Log
                    </button>
                  </div>
                </div>
              </div>

              {/* Recent properties */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Recent Properties
                  </p>
                  <button
                    onClick={() => handleTabChange("properties")}
                    className="text-xs text-emerald-600 font-medium hover:underline"
                  >
                    View all
                  </button>
                </div>
                <div className="divide-y divide-slate-100">
                  {properties.slice(0, 5).map((prop) => (
                    <div
                      key={prop._id}
                      className="px-6 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors cursor-pointer"
                      onClick={() => openPropertyDetails(prop._id)}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={
                            prop.image ||
                            "https://placehold.co/40x40/f1f5f9/94a3b8?text=P"
                          }
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
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
                        <span className="text-sm font-semibold text-slate-700 hidden sm:block">
                          ₹
                          {Number(prop.rentAmount || 0).toLocaleString("en-IN")}
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

          {/* ─── ACTIVITY LOG TAB ─────────────────────────────── */}
          {activeTab === "activity" && (
            <div className="animate-[fadeIn_0.3s_ease] space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    System Activity{" "}
                    <span className="text-slate-400 font-normal">
                      — last {activityLogs.length} events
                    </span>
                  </p>
                </div>
                {activityLogs.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {activityLogs.map((log, i) => (
                      <div
                        key={log.id || i}
                        className="px-6 py-4 flex items-start gap-4 hover:bg-slate-50/50 transition-colors"
                      >
                        {/* Timeline dot */}
                        <div className="relative flex flex-col items-center pt-1">
                          <div
                            className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                              log.action === "Approved"
                                ? "bg-emerald-500"
                                : log.action === "Rejected"
                                  ? "bg-red-500"
                                  : "bg-amber-500"
                            }`}
                          />
                          {i < activityLogs.length - 1 && (
                            <div
                              className="w-px bg-slate-100 flex-1 mt-1"
                              style={{ minHeight: 16 }}
                            />
                          )}
                        </div>
                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                            <span className="text-sm font-semibold text-slate-800">
                              {log.tenant}
                            </span>
                            <span className="text-sm text-slate-400">
                              submitted a booking for
                            </span>
                            <span className="text-sm font-semibold text-slate-800">
                              {log.property}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                            <StatusBadge status={log.action} />
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold ${
                                log.payment === "Paid"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {log.payment}
                            </span>
                            <span className="text-xs text-slate-400">
                              {formatDate(log.date)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center">
                    <Activity className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No activity yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── DATA TABLE TABS ──────────────────────────────── */}
          {!["overview", "activity"].includes(activeTab) && (
            <div className="animate-[fadeIn_0.3s_ease]">
              {/* Toolbar */}
              <div className="flex items-center justify-between mb-6 gap-3 flex-wrap">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2.5 w-64 sm:w-72 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm"
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

              {/* Table */}
              <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[560px]">
                    <thead>
                      <tr className="bg-slate-50/80 border-b border-slate-100">
                        {activeTab === "properties" && (
                          <>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Property
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                              Location
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                              Created By
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">
                              Created On
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
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                              Email
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Role
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
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
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                              Tenant
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                              Payment
                            </th>
                            <th className="text-left px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
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
                          {/* Properties */}
                          {activeTab === "properties" && (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={
                                      item.image ||
                                      "https://placehold.co/40x40/f1f5f9/94a3b8?text=P"
                                    }
                                    alt=""
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                  />
                                  <div>
                                    <p
                                      className="text-sm font-semibold text-slate-800 cursor-pointer hover:text-emerald-700"
                                      onClick={() =>
                                        openPropertyDetails(item._id)
                                      }
                                    >
                                      {item.propertyName}
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      {item.category}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 hidden md:table-cell">
                                <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                  <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                  <span className="truncate max-w-[140px]">
                                    {item.location}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell">
                                <p className="text-sm font-medium text-slate-700">
                                  {item.createdBy?.name || "Unknown"}
                                </p>
                                <p className="text-xs text-slate-400">
                                  {item.createdBy?.role || "—"}
                                </p>
                              </td>
                              <td className="px-6 py-4 hidden lg:table-cell text-sm text-slate-500">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                                ₹
                                {Number(item.rentAmount || 0).toLocaleString(
                                  "en-IN",
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() =>
                                      openPropertyDetails(item._id)
                                    }
                                    className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                    title="View details"
                                  >
                                    <ChevronDown className="w-4 h-4 -rotate-90" />
                                  </button>
                                  <button
                                    onClick={() => handleOpenModal(item)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                                    title="Edit"
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(item._id)}
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Managers / Tenants */}
                          {(activeTab === "managers" ||
                            activeTab === "tenants") && (
                            <>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm flex-shrink-0">
                                    {(getDisplayName(item) || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <span className="text-sm font-semibold text-slate-800">
                                      {getDisplayName(item) || "—"}
                                    </span>
                                    {blockedIds.has(item._id) && (
                                      <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-600">
                                        Suspended
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
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
                              <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                                {formatDate(item.createdAt)}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-1">
                                  {/* Block / Unblock */}
                                  <button
                                    onClick={() =>
                                      handleBlockUser(
                                        item._id,
                                        getDisplayName(item),
                                      )
                                    }
                                    title={
                                      blockedIds.has(item._id)
                                        ? "Unblock user"
                                        : "Suspend user"
                                    }
                                    className={`p-2 rounded-lg transition-all ${
                                      blockedIds.has(item._id)
                                        ? "text-emerald-600 bg-emerald-50 hover:bg-emerald-100"
                                        : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                                    }`}
                                  >
                                    {blockedIds.has(item._id) ? (
                                      <ShieldCheck className="w-4 h-4" />
                                    ) : (
                                      <Ban className="w-4 h-4" />
                                    )}
                                  </button>
                                  {/* Delete */}
                                  <button
                                    onClick={() =>
                                      handleDeleteUser(
                                        item._id,
                                        getDisplayName(item),
                                      )
                                    }
                                    className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                                    title="Remove user"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </>
                          )}

                          {/* Bookings */}
                          {activeTab === "bookings" && (
                            <>
                              <td className="px-6 py-4 text-sm font-medium text-slate-800">
                                {item.propertyId?.propertyName ||
                                  item.propertyId ||
                                  "—"}
                              </td>
                              <td className="px-6 py-4 text-sm text-slate-500 hidden md:table-cell">
                                {getDisplayName(item.tenantId) ||
                                  item.tenantId ||
                                  "—"}
                              </td>
                              <td className="px-6 py-4">
                                <StatusBadge status={item.status} />
                              </td>
                              <td className="px-6 py-4 hidden sm:table-cell">
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
                              <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                                {formatDate(item.bookingDate || item.createdAt)}
                              </td>
                            </>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

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

      {/* ─── PROPERTY MODAL ──────────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease]">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[fadeSlideUp_0.3s_ease]">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center flex-shrink-0">
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ModalInput
                  label="Property Name"
                  value={formData.propertyName}
                  onChange={(v) =>
                    setFormData((f) => ({ ...f, propertyName: v }))
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
                        setFormData((f) => ({
                          ...f,
                          managerId: e.target.value,
                        }))
                      }
                      required
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                    >
                      <option value="">Choose Manager…</option>
                      {managers.map((m) => (
                        <option key={m._id} value={m._id}>
                          {getDisplayName(m) || m.email}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <ModalInput
                  label="Rent (₹)"
                  type="number"
                  value={formData.rentAmount}
                  onChange={(v) =>
                    setFormData((f) => ({ ...f, rentAmount: v }))
                  }
                />
                <ModalInput
                  label="Bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(v) => setFormData((f) => ({ ...f, bedrooms: v }))}
                />
                <ModalInput
                  label="Bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(v) => setFormData((f) => ({ ...f, bathrooms: v }))}
                />
                <ModalInput
                  label="Area (sqft)"
                  type="number"
                  value={formData.area}
                  onChange={(v) => setFormData((f) => ({ ...f, area: v }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, category: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {["Apartment", "House", "Villa", "Studio"].map((o) => (
                      <option key={o}>{o}</option>
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
                      setFormData((f) => ({ ...f, status: e.target.value }))
                    }
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                  >
                    {["Vacant", "Occupied", "Under Maintenance"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>

              <ModalInput
                label="Full Address"
                value={formData.location}
                onChange={(v) => setFormData((f) => ({ ...f, location: v }))}
              />
              <ModalInput
                label="Image URL"
                value={formData.image}
                onChange={(v) => setFormData((f) => ({ ...f, image: v }))}
                required={false}
              />
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, description: e.target.value }))
                  }
                  required
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 resize-none"
                />
              </div>

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
        @keyframes fadeIn      { from { opacity: 0 } to { opacity: 1 } }
        @keyframes fadeSlideUp { from { transform: translateY(16px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
      `}</style>
    </div>
  );
};

/* ─── Reusable components ──────────────────────────────────────── */

const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    blue: "bg-blue-50    text-blue-600",
    violet: "bg-violet-50  text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50   text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}
      >
        <Icon className="w-5 h-5" />
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
    Occupied: "bg-amber-50   text-amber-700",
    "Under Maintenance": "bg-slate-100  text-slate-600",
    Pending: "bg-amber-50   text-amber-700",
    Approved: "bg-emerald-50 text-emerald-700",
    Rejected: "bg-red-50     text-red-700",
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
      className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 transition-colors"
    />
  </div>
);

export default AdminDashboard;
