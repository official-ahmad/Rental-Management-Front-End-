import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import Swal from "sweetalert2";
import {
  Building2,
  Users,
  LogOut,
  MapPin,
  Menu,
  Check,
  X,
  Inbox,
  Search,
  Plus,
  Edit3,
  Trash2,
  Eye,
  ChevronRight,
  Home,
  RefreshCw,
  DollarSign,
  Download,
} from "lucide-react";
import { API, apiClient } from "../src/config/api";
import { getDisplayName, formatDate } from "../src/utils/helpers";

/* ─── Status cycle config ─────────────────────────────────────── */
const STATUS_CYCLE = {
  Vacant: "Occupied",
  Occupied: "Maintenance",
  Maintenance: "Vacant",
};
const STATUS_STYLE = {
  Vacant: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Occupied: "bg-amber-50   text-amber-700   border border-amber-200",
  Maintenance: "bg-slate-100  text-slate-600   border border-slate-200",
};

/* ─── Empty property form ─────────────────────────────────────── */
const EMPTY_FORM = {
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
};

/* ══════════════════════════════════════════════════════════════ */
const ManagerDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const managerName = localStorage.getItem("userName") || "Manager";
  const managerEmail = localStorage.getItem("userEmail") || "";
  const API_BASE = API.MANAGER.BASE;

  /* ── UI state ─────────────────────────────────────────────── */
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [searchTerm, setSearchTerm] = useState("");

  /* ── Data state ───────────────────────────────────────────── */
  const [properties, setProperties] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTenants, setActiveTenants] = useState([]);
  const [payments, setPayments] = useState([]);

  /* ── Property modal ───────────────────────────────────────── */
  const [propModal, setPropModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);

  /* ── Tenant detail modal ──────────────────────────────────── */
  const [tenantModal, setTenantModal] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState(null);

  /* ── Status toggle loading set ────────────────────────────── */
  const [statusBusy, setStatusBusy] = useState(new Set());

  /* ── Fetch all data ───────────────────────────────────────── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [propRes, bookRes, payRes] = await Promise.all([
        apiClient.get(`${API_BASE}/properties`),
        apiClient.get(API.BOOKINGS.ALL_REQUESTS),
        apiClient.get("/api/payments").catch(() => ({ data: [] })),
      ]);
      setProperties(propRes.data || []);
      setPayments(payRes.data || []);
      const all = bookRes.data || [];
      setRequests(all.filter((r) => r.status === "Pending"));
      setActiveTenants(all.filter((r) => r.status === "Approved"));
    } catch {
      toast.error("Failed to load data. Check your connection.");
    } finally {
      setLoading(false);
    }
  }, [API_BASE]);

  useEffect(() => {
    if (!role || role.toLowerCase() !== "manager") {
      toast.error("Access denied. Manager only.");
      navigate("/page", { replace: true });
    } else {
      fetchData();
    }
  }, [role, navigate, fetchData]);

  /* ── Tab change (closes mobile sidebar) ────────────────────── */
  const handleTabChange = useCallback((id) => {
    setActiveTab(id);
    setSearchTerm("");
    setMobileOpen(false);
  }, []);

  const openPropertyDetails = useCallback(
    (propertyId) => {
      navigate(`/property/${propertyId}`);
    },
    [navigate],
  );

  /* ── Property modal helpers ──────────────────────────────────*/
  const openPropModal = useCallback((prop = null) => {
    if (prop) {
      setIsEdit(true);
      setEditId(prop._id);
      setFormData({
        propertyName: prop.propertyName || "",
        location: prop.location || "",
        rentAmount: prop.rentAmount || "",
        bedrooms: prop.bedrooms || "",
        bathrooms: prop.bathrooms || "",
        area: prop.area || "",
        image: prop.image || "",
        description: prop.description || "",
        category: prop.category || "Apartment",
        status: prop.status || "Vacant",
      });
    } else {
      setIsEdit(false);
      setEditId(null);
      setFormData(EMPTY_FORM);
    }
    setPropModal(true);
  }, []);

  const handleFormSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const payload = {
        ...formData,
        rentAmount: Number(formData.rentAmount),
        bedrooms: Number(formData.bedrooms),
        bathrooms: Number(formData.bathrooms),
        area: Number(formData.area),
        category: formData.category || "Apartment",
      };
      try {
        if (isEdit) {
          await apiClient.put(`${API_BASE}/update/${editId}`, payload);
          toast.success("Property updated!");
        } else {
          await apiClient.post(`${API_BASE}/add`, payload);
          toast.success("Property added!");
        }
        setPropModal(false);
        fetchData();
      } catch (err) {
        toast.error(err.response?.data?.error || "Operation failed.");
      }
    },
    [formData, isEdit, editId, API_BASE, fetchData],
  );

  /* ── Property delete ─────────────────────────────────────── */
  const handleDelete = useCallback(
    (id) => {
      Swal.fire({
        title: "Delete property?",
        text: "This action cannot be undone.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#ef4444",
        cancelButtonColor: "#64748b",
        confirmButtonText: "Yes, delete",
      }).then(async (res) => {
        if (res.isConfirmed) {
          try {
            await apiClient.delete(`${API_BASE}/delete/${id}`);
            toast.success("Property deleted.");
            fetchData();
          } catch {
            toast.error("Delete failed.");
          }
        }
      });
    },
    [API_BASE, fetchData],
  );

  /* ── Inline status toggle ────────────────────────────────── */
  const handleStatusToggle = useCallback(
    async (prop) => {
      const next = STATUS_CYCLE[prop.status] || "Vacant";
      setStatusBusy((s) => new Set(s).add(prop._id));
      try {
        await apiClient.put(`${API_BASE}/update/${prop._id}`, {
          ...prop,
          rentAmount: Number(prop.rentAmount),
          bedrooms: Number(prop.bedrooms),
          bathrooms: Number(prop.bathrooms),
          status: next,
        });
        setProperties((prev) =>
          prev.map((p) => (p._id === prop._id ? { ...p, status: next } : p)),
        );
        toast.success(`Status set to ${next}`);
      } catch {
        toast.error("Status update failed.");
      } finally {
        setStatusBusy((s) => {
          const n = new Set(s);
          n.delete(prop._id);
          return n;
        });
      }
    },
    [API_BASE],
  );

  /* ── Booking action ──────────────────────────────────────── */
  const handleBookingAction = useCallback(
    async (bookingId, status) => {
      try {
        await apiClient.put(API.BOOKINGS.UPDATE(bookingId), { status });
        toast.success(`Booking ${status.toLowerCase()}.`);
        fetchData();
      } catch {
        toast.error("Update failed.");
      }
    },
    [fetchData],
  );

  /* ── Logout ──────────────────────────────────────────────── */
  const handleLogout = useCallback(() => {
    Swal.fire({
      title: "Sign out?",
      text: "You will be redirected to the login page.",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Sign out",
    }).then((res) => {
      if (res.isConfirmed) {
        localStorage.clear();
        navigate("/login", { replace: true });
      }
    });
  }, [navigate]);

  /* ── Filtered list for active tab ───────────────────────── */
  const filteredList = useMemo(() => {
    const src =
      activeTab === "requests"
        ? requests
        : activeTab === "tenants"
          ? activeTenants
          : activeTab === "payments"
            ? payments
            : properties;

    const q = searchTerm.toLowerCase().trim();
    if (!q) return src;

    return src.filter((item) => {
      const name = (
        item.propertyName ||
        getDisplayName(item.tenantId) ||
        ""
      ).toLowerCase();
      const loc = (
        item.location ||
        item.propertyId?.propertyName ||
        ""
      ).toLowerCase();
      const email = (item.email || item.tenantId?.email || "").toLowerCase();
      return name.includes(q) || loc.includes(q) || email.includes(q);
    });
  }, [activeTab, searchTerm, properties, requests, activeTenants, payments]);

  /* ── Nav items ───────────────────────────────────────────── */
  const navItems = useMemo(
    () => [
      {
        id: "properties",
        label: "Inventory",
        icon: Building2,
        count: properties.length,
      },
      {
        id: "requests",
        label: "Requests",
        icon: Inbox,
        count: requests.length,
        badge: requests.length > 0,
      },
      {
        id: "tenants",
        label: "Tenants",
        icon: Users,
        count: activeTenants.length,
      },
      {
        id: "payments",
        label: "Payments",
        icon: DollarSign,
        count: payments.length,
      },
    ],
    [properties.length, requests.length, activeTenants.length, payments.length],
  );

  /* ── Loading screen ──────────────────────────────────────── */
  if (loading)
    return (
      <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
          <p className="text-slate-400 text-sm font-medium">
            Loading dashboard…
          </p>
        </div>
      </div>
    );

  /* ── Render ──────────────────────────────────────────────── */
  return (
    <div className="flex min-h-screen bg-[#f0f4f8]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');
        body { font-family: 'Plus Jakarta Sans', sans-serif; }
        :root {
          --sh:  0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --sh2: 0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
          --sh3: 0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
        }
        @keyframes up { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
        .a1 { animation: up 0.38s ease both; }
        .a2 { animation: up 0.38s 0.06s ease both; }
        .a3 { animation: up 0.38s 0.12s ease both; }
        .a4 { animation: up 0.38s 0.18s ease both; }
        .a5 { animation: up 0.38s 0.24s ease both; }
        .card-hover { transition: box-shadow 0.2s, transform 0.2s; }
        .card-hover:hover { box-shadow: var(--sh2); transform: translateY(-2px); }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: 12,
            fontSize: 13,
          },
        }}
      />

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ─── SIDEBAR ──────────────────────────────────────────── */}
      <aside
        className={`
          ${sidebarOpen ? "w-64" : "w-20"}
          fixed lg:sticky top-0 h-screen bg-[#0f172a] text-white
          flex flex-col flex-shrink-0 z-50 transition-all duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo row */}
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm tracking-tight">
                ESTATE PRO
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

        {/* Avatar block */}
        {sidebarOpen && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="bg-white/5 rounded-xl p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm flex-shrink-0">
                {managerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{managerName}</p>
                <p className="text-xs text-slate-400">Property Manager</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ id, label, icon: Icon, badge, count }) => (
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
              {sidebarOpen && (
                <>
                  <span className="flex-1 text-left">{label}</span>
                  {badge && count > 0 && (
                    <span className="bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {count}
                    </span>
                  )}
                </>
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
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─────────────────────────────────────── */}
      <main className="flex-1 min-w-0 overflow-x-hidden">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-lg border-b border-slate-200/60 px-6 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {activeTab === "properties"
                  ? "Property Inventory"
                  : activeTab === "requests"
                    ? "Booking Requests"
                    : activeTab === "payments"
                      ? "Payment History"
                      : "Active Tenants"}
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

          <div className="flex items-center gap-3">
            {/* Search — hidden on xs, shown sm+ */}
            <div className="hidden sm:flex items-center relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={`Search ${activeTab}…`}
                className="pl-10 pr-4 py-2 w-56 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 shadow-sm"
              />
            </div>

            <button
              onClick={fetchData}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 shadow-sm transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            {activeTab === "properties" && (
              <button
                onClick={() => openPropModal()}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Property</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile search */}
        <div className="sm:hidden px-4 pt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search ${activeTab}…`}
              className="pl-10 pr-4 py-2.5 w-full bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 shadow-sm"
            />
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* ── Stats Row ───────────────────────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 a2">
            {[
              {
                label: "Properties",
                value: properties.length,
                icon: Building2,
                color: "bg-blue-50 text-blue-600",
              },
              {
                label: "Pending Requests",
                value: requests.length,
                icon: Inbox,
                color: "bg-amber-50 text-amber-600",
              },
              {
                label: "Active Tenants",
                value: activeTenants.length,
                icon: Users,
                color: "bg-emerald-50 text-emerald-600",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="bg-white rounded-2xl border border-slate-200/60 p-5 shadow-sm hover:shadow-md transition-shadow card-hover"
              >
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center ${color} mb-3`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">
                  {value}
                </p>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mt-0.5">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* ── Data Table ──────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-slate-200/60 shadow-sm overflow-hidden a3">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-100">
                    {activeTab === "properties" && (
                      <>
                        <Th>Property</Th>
                        <Th className="hidden md:table-cell">Location</Th>
                        <Th className="hidden lg:table-cell">Created By</Th>
                        <Th>Rent / mo</Th>
                        <Th>Status</Th>
                        <Th right>Actions</Th>
                      </>
                    )}
                    {activeTab === "requests" && (
                      <>
                        <Th>Tenant</Th>
                        <Th className="hidden md:table-cell">Property</Th>
                        <Th className="hidden sm:table-cell">Date</Th>
                        <Th center>Decision</Th>
                      </>
                    )}
                    {activeTab === "tenants" && (
                      <>
                        <Th>Tenant</Th>
                        <Th className="hidden md:table-cell">Property</Th>
                        <Th className="hidden sm:table-cell">Rent</Th>
                        <Th right>Details</Th>
                      </>
                    )}
                    {activeTab === "payments" && (
                      <>
                        <Th>Tenant</Th>
                        <Th className="hidden md:table-cell">Property</Th>
                        <Th>Amount</Th>
                        <Th className="hidden sm:table-cell">Date</Th>
                        <Th center>Status</Th>
                        <Th right>Receipt</Th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredList.length > 0 ? (
                    filteredList.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-slate-50/50 transition-colors"
                      >
                        {/* ── Properties rows ── */}
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
                                  className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-slate-100"
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
                                    {item.bedrooms}bd · {item.bathrooms}ba ·{" "}
                                    {item.area} sqft
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <div className="flex items-center gap-1.5 text-sm text-slate-500">
                                <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                                <span className="truncate max-w-[160px]">
                                  {item.location}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden lg:table-cell">
                              <p className="text-sm font-medium text-slate-700">
                                {item.createdBy?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {formatDate(item.createdAt)}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                              ₹{Number(item.rentAmount).toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4">
                              {/* Clickable status badge — cycles through statuses */}
                              <button
                                onClick={() => handleStatusToggle(item)}
                                disabled={statusBusy.has(item._id)}
                                title="Click to change status"
                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all hover:opacity-80 disabled:opacity-40 cursor-pointer ${
                                  STATUS_STYLE[item.status] ||
                                  STATUS_STYLE.Vacant
                                }`}
                              >
                                {statusBusy.has(item._id)
                                  ? "…"
                                  : item.status || "Vacant"}
                                {!statusBusy.has(item._id) && (
                                  <ChevronRight className="w-3 h-3 opacity-60" />
                                )}
                              </button>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  onClick={() => openPropertyDetails(item._id)}
                                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => openPropModal(item)}
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

                        {/* ── Requests rows ── */}
                        {activeTab === "requests" && (
                          <>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-800">
                                {getDisplayName(item.tenantId) || "—"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.tenantId?.email}
                              </p>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <p className="text-sm font-medium text-slate-700">
                                {item.propertyId?.propertyName || "—"}
                              </p>
                              <p className="text-xs text-slate-400">
                                ₹
                                {Number(
                                  item.propertyId?.rentAmount || 0,
                                ).toLocaleString("en-IN")}
                                /mo
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                              {formatDate(item.bookingDate)}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() =>
                                    handleBookingAction(item._id, "Approved")
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors"
                                >
                                  <Check className="w-3 h-3" /> Approve
                                </button>
                                <button
                                  onClick={() =>
                                    handleBookingAction(item._id, "Rejected")
                                  }
                                  className="flex items-center gap-1 px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition-colors"
                                >
                                  <X className="w-3 h-3" /> Reject
                                </button>
                              </div>
                            </td>
                          </>
                        )}

                        {/* ── Tenant rows ── */}
                        {activeTab === "tenants" && (
                          <>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                                  {(getDisplayName(item.tenantId) || "T")
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {getDisplayName(item.tenantId) || "—"}
                                  </p>
                                  <p className="text-xs text-slate-400">
                                    {item.tenantId?.email}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <p className="text-sm font-medium text-slate-700">
                                {item.propertyId?.propertyName || "—"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.propertyId?.location}
                              </p>
                            </td>
                            <td className="px-6 py-4 hidden sm:table-cell">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                                ₹
                                {Number(
                                  item.propertyId?.rentAmount || 0,
                                ).toLocaleString("en-IN")}
                                /mo
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={() => {
                                  setSelectedTenant(item);
                                  setTenantModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-200 transition-colors ml-auto"
                              >
                                <Eye className="w-3.5 h-3.5" /> View
                              </button>
                            </td>
                          </>
                        )}

                        {/* ── Payment rows ── */}
                        {activeTab === "payments" && (
                          <>
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-slate-800">
                                {getDisplayName(item.tenantId) || "—"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.tenantId?.email}
                              </p>
                            </td>
                            <td className="px-6 py-4 hidden md:table-cell">
                              <p className="text-sm font-medium text-slate-700">
                                {item.propertyId?.propertyName || "—"}
                              </p>
                              <p className="text-xs text-slate-400">
                                {item.propertyId?.location}
                              </p>
                            </td>
                            <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                              ₹{Number(item.amount || 0).toLocaleString("en-IN")}
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell">
                              {formatDate(item.createdAt)}
                            </td>
                            <td className="px-6 py-4">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700">
                                {item.status === "completed" ? "Paid" : "Pending"}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <button
                                onClick={async () => {
                                  try {
                                    const response = await apiClient.get(
                                      `/payments/${item._id}/download-receipt`,
                                      { responseType: "blob" }
                                    );
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement("a");
                                    link.href = url;
                                    link.setAttribute("download", `receipt-${item.transactionId}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.parentNode.removeChild(link);
                                    window.URL.revokeObjectURL(url);
                                  } catch (error) {
                                    toast.error("Failed to download receipt");
                                  }
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-200 transition-colors ml-auto"
                                title="Download Receipt"
                              >
                                <Download className="w-3.5 h-3.5" /> Receipt
                              </button>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={activeTab === "properties" ? 6 : activeTab === "payments" ? 6 : 5}
                        className="py-16 text-center"
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="w-8 h-8 text-slate-200" />
                          <p className="text-slate-400 text-sm">
                            No {activeTab} found
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* ─── PROPERTY MODAL ───────────────────────────────────── */}
      {propModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {isEdit ? "Edit Property" : "New Property"}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the details below
                </p>
              </div>
              <button
                onClick={() => setPropModal(false)}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MField
                  label="Property Name"
                  value={formData.propertyName}
                  onChange={(v) =>
                    setFormData((f) => ({ ...f, propertyName: v }))
                  }
                />
                <MField
                  label="Full Address"
                  value={formData.location}
                  onChange={(v) => setFormData((f) => ({ ...f, location: v }))}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <MField
                  label="Rent (₹)"
                  type="number"
                  value={formData.rentAmount}
                  onChange={(v) =>
                    setFormData((f) => ({ ...f, rentAmount: v }))
                  }
                />
                <MField
                  label="Bedrooms"
                  type="number"
                  value={formData.bedrooms}
                  onChange={(v) => setFormData((f) => ({ ...f, bedrooms: v }))}
                />
                <MField
                  label="Bathrooms"
                  type="number"
                  value={formData.bathrooms}
                  onChange={(v) => setFormData((f) => ({ ...f, bathrooms: v }))}
                />
                <MField
                  label="Area (sqft)"
                  type="number"
                  value={formData.area}
                  onChange={(v) => setFormData((f) => ({ ...f, area: v }))}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <MField
                  label="Image URL"
                  value={formData.image}
                  onChange={(v) => setFormData((f) => ({ ...f, image: v }))}
                  required={false}
                />
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
                    {["Apartment", "House", "Studio", "Villa"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    {["Vacant", "Occupied", "Maintenance"].map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
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
                  onClick={() => setPropModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 active:scale-[0.97] transition-all shadow-lg shadow-emerald-600/20"
                >
                  {isEdit ? "Save Changes" : "Add Property"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── TENANT DETAIL MODAL ──────────────────────────────── */}
      {tenantModal && selectedTenant && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-[#0f172a] px-6 py-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-xl flex-shrink-0">
                  {(getDisplayName(selectedTenant.tenantId) || "T")
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">
                    {getDisplayName(selectedTenant.tenantId) || "—"}
                  </p>
                  <p className="text-slate-400 text-xs truncate max-w-[160px]">
                    {selectedTenant.tenantId?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setTenantModal(false)}
                className="text-slate-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Details */}
            <div className="p-5 space-y-0 divide-y divide-slate-100">
              {[
                {
                  label: "Property",
                  value: selectedTenant.propertyId?.propertyName || "—",
                },
                {
                  label: "Location",
                  value: selectedTenant.propertyId?.location || "—",
                },
                {
                  label: "Monthly Rent",
                  value: `₹${Number(selectedTenant.propertyId?.rentAmount || 0).toLocaleString("en-IN")}`,
                },
                {
                  label: "Booking Status",
                  value: selectedTenant.status || "—",
                },
                {
                  label: "Payment Status",
                  value: selectedTenant.paymentStatus || "Pending",
                },
                {
                  label: "Booked On",
                  value: formatDate(selectedTenant.bookingDate) || "—",
                },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="flex items-center justify-between py-3"
                >
                  <span className="text-sm text-slate-500">{label}</span>
                  <span className="text-sm font-semibold text-slate-800 text-right max-w-[55%] truncate">
                    {value}
                  </span>
                </div>
              ))}
            </div>

            <div className="px-5 pb-5">
              <button
                onClick={() => setTenantModal(false)}
                className="w-full py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Reusable helpers ─────────────────────────────────────────── */

const Th = ({ children, right, center, className = "" }) => (
  <th
    className={`px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider
      ${right ? "text-right" : center ? "text-center" : "text-left"} ${className}`}
  >
    {children}
  </th>
);

const MField = ({ label, value, onChange, type = "text", required = true }) => (
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

export default ManagerDashboard;
