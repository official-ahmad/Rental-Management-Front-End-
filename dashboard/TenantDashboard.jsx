import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  FaHome,
  FaFileInvoiceDollar,
  FaTools,
  FaSignOutAlt,
  FaBars,
  FaArrowLeft,
  FaCheck,
  FaTimes,
  FaTrashAlt,
  FaWallet,
  FaComments,
} from "react-icons/fa";
import {
  MDBModal,
  MDBModalDialog,
  MDBModalContent,
  MDBModalHeader,
  MDBModalTitle,
  MDBModalBody,
  MDBModalFooter,
} from "mdb-react-ui-kit";
import Swal from "sweetalert2";
import { API, apiClient } from "../src/config/api";

/* ─────────────────────────────────────────────────
   STYLES
───────────────────────────────────────────────── */
const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Plus Jakarta Sans', sans-serif;
    background: #f0f4f8;
    color: #1e293b;
  }

  :root {
    --bg:       #f0f4f8;
    --surface:  #ffffff;
    --surface2: #f8fafc;
    --border:   #e2e8f0;
    --border2:  #cbd5e1;
    --text1:    #0f172a;
    --text2:    #475569;
    --text3:    #94a3b8;
    --blue:     #2563eb;
    --blue-lt:  #eff6ff;
    --blue-md:  #bfdbfe;
    --green:    #059669;
    --green-lt: #ecfdf5;
    --amber:    #d97706;
    --amber-lt: #fffbeb;
    --red:      #dc2626;
    --red-lt:   #fef2f2;
    --mono:     'IBM Plex Mono', monospace;
    --r:        14px;
    --sh:       0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
    --sh2:      0 4px 16px rgba(0,0,0,0.07), 0 1px 4px rgba(0,0,0,0.04);
    --sh3:      0 10px 40px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.05);
  }

  ::-webkit-scrollbar { width: 6px; height: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 10px; }

  @keyframes up   { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:none; } }
  @keyframes spin { to { transform: rotate(360deg); } }

  .a1 { animation: up 0.38s ease both; }
  .a2 { animation: up 0.38s 0.06s ease both; }
  .a3 { animation: up 0.38s 0.12s ease both; }
  .a4 { animation: up 0.38s 0.18s ease both; }
  .a5 { animation: up 0.38s 0.24s ease both; }

  /* ── Layout ── */
  .wrap  { min-height: 100vh; background: var(--bg); }
  .inner { max-width: 1160px; margin: 0 auto; padding: 0 24px; }

  /* ── Navbar ── */
  .topbar {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    box-shadow: var(--sh);
    position: sticky;
    top: 0;
    z-index: 200;
  }
  .topbar-row {
    display: flex;
    align-items: center;
    height: 62px;
    gap: 10px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    flex: 1;
    text-decoration: none;
  }
  .brand-icon {
    width: 34px; height: 34px;
    border-radius: 9px;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 15px;
    flex-shrink: 0;
  }
  .brand-text {
    font-size: 15px;
    font-weight: 800;
    color: var(--text1);
    letter-spacing: -0.03em;
  }
  .brand-text em { color: var(--blue); font-style: normal; }

  /* Desktop nav items */
  .nav-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  @media (max-width: 767px) { .nav-right { display: none; } }

  .chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 5px 13px 5px 5px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 50px;
  }
  .avatar {
    width: 26px; height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #2563eb, #4f46e5);
    color: #fff;
    font-size: 11px;
    font-weight: 700;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .chip-name { font-size: 12.5px; font-weight: 600; color: var(--text2); }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 16px;
    border-radius: 50px;
    font-size: 13px;
    font-weight: 600;
    font-family: 'Plus Jakarta Sans', sans-serif;
    cursor: pointer;
    transition: all 0.16s;
    border: none;
    white-space: nowrap;
    line-height: 1;
  }
  .btn-ghost  { background:transparent; color:var(--text2); border:1px solid var(--border); }
  .btn-ghost:hover  { background:var(--surface2); border-color:var(--border2); color:var(--text1); }

  .btn-primary { background:var(--blue); color:#fff; box-shadow:0 2px 8px rgba(37,99,235,.22); }
  .btn-primary:hover { background:#1d4ed8; transform:translateY(-1px); box-shadow:0 4px 14px rgba(37,99,235,.35); }

  .btn-green { background:var(--green); color:#fff; box-shadow:0 2px 8px rgba(5,150,105,.22); }
  .btn-green:hover { background:#047857; transform:translateY(-1px); box-shadow:0 4px 14px rgba(5,150,105,.35); }

  .btn-red-soft  { background:var(--red-lt); color:var(--red); border:1px solid #fca5a5; }
  .btn-red-soft:hover  { background:#fee2e2; }

  .btn-red-solid { background:var(--red); color:#fff; box-shadow:0 2px 8px rgba(220,38,38,.25); }
  .btn-red-solid:hover { background:#b91c1c; }

  .btn-red-outline { background:transparent; color:var(--red); border:1px solid #fca5a5; }
  .btn-red-outline:hover { background:var(--red-lt); }

  /* Hamburger */
  .hbg {
    display: none;
    align-items: center; justify-content: center;
    width: 36px; height: 36px;
    border-radius: 9px;
    border: 1px solid var(--border);
    background: var(--surface2);
    cursor: pointer;
    color: var(--text2);
    font-size: 14px;
    transition: all 0.14s;
  }
  .hbg:hover { background: var(--border); color: var(--text1); }
  @media (max-width: 767px) { .hbg { display: flex; } }

  /* Mobile menu */
  .mob-menu {
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    padding: 14px 24px 16px;
    box-shadow: var(--sh);
  }
  .mob-user-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding-bottom: 12px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 12px;
  }
  .mob-user-name  { font-size: 13.5px; font-weight: 700; color: var(--text1); }
  .mob-user-role  { font-size: 11.5px; color: var(--text3); }
  .mob-links { display: flex; flex-direction: column; gap: 7px; }
  .mob-links .btn { border-radius: 10px; padding: 10px 14px; justify-content: flex-start; }

  /* ── Page body ── */
  .page { padding: 34px 0 60px; }

  .ph    { margin-bottom: 26px; }
  .ph h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.03em; color: var(--text1); margin-bottom: 3px; }
  .ph p  { font-size: 12.5px; color: var(--text3); }

  /* ── Wallet card ── */
  .wallet {
    background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 55%, #2563eb 100%);
    border-radius: 18px;
    padding: 26px 30px;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 30px rgba(37,99,235,.28);
    margin-bottom: 18px;
  }
  .wallet::before {
    content:'';
    position:absolute; top:-60px; right:-60px;
    width:200px; height:200px; border-radius:50%;
    background:rgba(255,255,255,.06);
    pointer-events:none;
  }
  .wallet::after {
    content:'';
    position:absolute; bottom:-80px; right:40px;
    width:170px; height:170px; border-radius:50%;
    background:rgba(255,255,255,.04);
    pointer-events:none;
  }
  .wallet-lbl { font-size:11px; font-weight:600; letter-spacing:.1em; text-transform:uppercase; opacity:.65; margin-bottom:7px; }
  .wallet-amt { font-family:var(--mono); font-size:30px; font-weight:500; letter-spacing:-.02em; margin-bottom:5px; }
  .wallet-hint{ font-size:11.5px; opacity:.5; }
  .wallet-ico {
    width:52px; height:52px; border-radius:15px;
    background:rgba(255,255,255,.14);
    border:1px solid rgba(255,255,255,.2);
    display:flex; align-items:center; justify-content:center;
    font-size:22px;
    position:relative; z-index:1; flex-shrink:0;
  }
  @media(max-width:460px){ .wallet-ico { display:none; } }

  /* ── Stats row ── */
  .stats {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 14px;
    margin-bottom: 18px;
  }
  @media(max-width:900px){ .stats { grid-template-columns:1fr 1fr; } }
  @media(max-width:560px){ .stats { grid-template-columns:1fr; } }

  .scard {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--r);
    padding: 20px 20px 18px;
    box-shadow: var(--sh);
    transition: box-shadow .2s, transform .2s;
  }
  .scard:hover { box-shadow: var(--sh2); transform: translateY(-2px); }

  .scard-icon {
    width:40px; height:40px; border-radius:11px;
    display:flex; align-items:center; justify-content:center;
    font-size:16px; margin-bottom:13px;
  }
  .scard-lbl  { font-size:10.5px; font-weight:600; color:var(--text3); text-transform:uppercase; letter-spacing:.07em; margin-bottom:4px; }
  .scard-val  { font-size:16px; font-weight:700; color:var(--text1); letter-spacing:-.02em; margin-bottom:2px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
  .scard-sub  { font-size:11.5px; color:var(--text3); margin-bottom:13px; }
  .ptrack { height:4px; background:var(--surface2); border-radius:4px; overflow:hidden; border:1px solid var(--border); }
  .pfill  { height:100%; border-radius:4px; transition:width .8s cubic-bezier(.4,0,.2,1); }

  /* ── Confirm banner ── */
  .cbanner {
    background: var(--green-lt);
    border: 1px solid #6ee7b7;
    border-radius: var(--r);
    padding: 16px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 18px;
  }
  .cbanner-left { display:flex; align-items:center; gap:13px; }
  .cbanner-ico  { width:42px; height:42px; border-radius:11px; background:#d1fae5; border:1px solid #6ee7b7; display:flex; align-items:center; justify-content:center; color:var(--green); font-size:17px; flex-shrink:0; }
  .cbanner-ttl  { font-size:13.5px; font-weight:700; color:#065f46; margin-bottom:2px; }
  .cbanner-sub  { font-size:12.5px; color:#047857; }

  /* ── Table card ── */
  .tcard { background:var(--surface); border:1px solid var(--border); border-radius:var(--r); box-shadow:var(--sh); overflow:hidden; }
  .thead-row { padding:20px 22px 16px; border-bottom:1px solid var(--border); display:flex; align-items:center; justify-content:space-between; }
  .t-title { font-size:14.5px; font-weight:700; color:var(--text1); }
  .t-count { font-size:11.5px; color:var(--text3); background:var(--surface2); border:1px solid var(--border); padding:3px 10px; border-radius:50px; font-weight:500; }
  .t-scroll { overflow-x:auto; }

  table.bt {
    width:100%; border-collapse:collapse; min-width:540px;
  }
  .bt thead th {
    background:var(--surface2);
    padding:10px 15px;
    font-size:10.5px; font-weight:700; color:var(--text3);
    text-transform:uppercase; letter-spacing:.07em;
    text-align:left;
    border-bottom:1px solid var(--border);
  }
  .bt tbody tr { border-bottom:1px solid var(--border); transition:background .13s; }
  .bt tbody tr:last-child { border-bottom:none; }
  .bt tbody tr:hover { background:var(--surface2); }
  .bt tbody td { padding:13px 15px; font-size:13px; color:var(--text2); vertical-align:middle; }
  .td-n { font-weight:700; color:var(--text1); }
  .td-r { font-family:var(--mono); font-size:12.5px; font-weight:500; color:var(--green); }
  .td-d { font-size:12px; color:var(--text3); }

  /* Badges */
  .bdg {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:50px;
    font-size:10.5px; font-weight:700; letter-spacing:.04em; text-transform:uppercase;
  }
  .bdg-dot { width:5px; height:5px; border-radius:50%; flex-shrink:0; }
  .bdg-pending  { background:var(--amber-lt); color:var(--amber);  border:1px solid #fcd34d; }
  .bdg-approved { background:var(--green-lt); color:var(--green);  border:1px solid #6ee7b7; }
  .bdg-rejected { background:var(--red-lt);   color:var(--red);    border:1px solid #fca5a5; }
  .bdg-paid     { background:var(--blue-lt);  color:var(--blue);   border:1px solid var(--blue-md); }

  /* Empty state */
  .empty { padding:52px 20px; text-align:center; color:var(--text3); font-size:13px; }
  .empty-ico { font-size:28px; opacity:.3; display:block; margin-bottom:10px; }

  /* Loading */
  .loader { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:12px; background:var(--bg); }
  .spin   { width:36px; height:36px; border-radius:50%; border:3px solid var(--border); border-top-color:var(--blue); animation:spin .7s linear infinite; }
  .spin-lbl { font-size:12.5px; color:var(--text3); }

  /* Modal override */
  .mbox {
    background:var(--surface) !important;
    border-radius:18px !important;
    border:1px solid var(--border) !important;
    box-shadow:var(--sh3) !important;
    overflow:hidden;
  }
  .mhead {
    padding:20px 22px 16px;
    border-bottom:1px solid var(--border);
    display:flex; align-items:center; gap:10px;
  }
  .mhead-ico { width:34px; height:34px; border-radius:9px; background:var(--red-lt); border:1px solid #fca5a5; display:flex; align-items:center; justify-content:center; color:var(--red); font-size:13px; }
  .mhead-ttl { font-size:14.5px; font-weight:700; color:var(--text1); }
  .mbody { padding:22px; font-size:13.5px; color:var(--text2); text-align:center; line-height:1.7; }
  .mfoot { padding:14px 22px; border-top:1px solid var(--border); display:flex; gap:9px; justify-content:flex-end; }
`;

/* ─────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────── */
const TenantDashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem("userRole");
  const userName = localStorage.getItem("userName") || "Tenant";
  const userId = localStorage.getItem("userId");

  const [loading, setLoading] = useState(true);
  const [mobOpen, setMobOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [selectedProp, setSelectedProp] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({
    name: "",
    email: "",
    description: "",
  });
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const [walletBalance, setWalletBalance] = useState(() => {
    const s = localStorage.getItem("walletBalance");
    return s !== null ? parseInt(s) : 500000;
  });

  /* fetch */
  const fetchTenantData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiClient.get(API.BOOKINGS.MY_BOOKING(userId));
      setBookings(res.data);
    } catch (e) {
      console.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  /* init */
  useEffect(() => {
    if (!role || role !== "Tenant") {
      toast.error("Access denied. Please login as Tenant");
      navigate("/login", { replace: true });
      return;
    }
    const s = localStorage.getItem("selectedProperty");
    if (s) setSelectedProp(JSON.parse(s));
    fetchTenantData();
  }, [role, navigate, fetchTenantData]);

  /* payment */
  const handlePayment = (bookingId, amount, propertyName) => {
    if (walletBalance < amount)
      return Swal.fire({
        title: "Insufficient Balance!",
        text: "Please recharge.",
        icon: "error",
      });

    Swal.fire({
      title: "Confirm Payment",
      text: `Pay ₹${amount.toLocaleString("en-IN")} for ${propertyName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#059669",
      cancelButtonColor: "#dc2626",
      confirmButtonText: "Yes, Pay Now!",
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await apiClient.put(API.BOOKINGS.PAY(bookingId));
        if (res.status === 200) {
          const nb = walletBalance - amount;
          setWalletBalance(nb);
          localStorage.setItem("walletBalance", nb);
          setBookings((p) =>
            p.map((b) =>
              b._id === bookingId ? { ...b, paymentStatus: "Paid" } : b,
            ),
          );
          Swal.fire({
            title: "Payment Successful!",
            icon: "success",
            confirmButtonColor: "#059669",
          });
          fetchTenantData();
        }
      } catch {
        toast.error("Payment failed on server.");
      }
    });
  };

  /* cancel */
  const handleCancelBooking = (id) => {
    Swal.fire({
      title: "Cancel Request?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#dc2626",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, cancel",
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await apiClient.delete(API.BOOKINGS.CANCEL(id));
        if (res.status === 200) {
          toast.success("Cancelled!");
          fetchTenantData();
        }
      } catch (e) {
        toast.error(e.response?.data?.message || "Failed.");
      }
    });
  };

  /* confirm booking */
  const handleConfirmBooking = async () => {
    if (!selectedProp || !userId) return;
    try {
      const res = await apiClient.post(API.BOOKINGS.REQUEST, {
        propertyId: selectedProp._id,
        tenantId: userId,
      });
      if (res.status === 201 || res.status === 200) {
        toast.success("Request sent!");
        localStorage.removeItem("selectedProperty");
        setSelectedProp(null);
        fetchTenantData();
      }
    } catch (e) {
      toast.error(e.response?.data?.message || "Booking failed.");
    }
  };

  /* logout */
  const confirmLogout = () => {
    const bal = localStorage.getItem("walletBalance");
    localStorage.clear();
    if (bal) localStorage.setItem("walletBalance", bal);
    navigate("/");
  };

  /* greeting */
  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good Morning";
    if (h < 17) return "Good Afternoon";
    return "Good Evening";
  })();

  /* helpers */
  const latest = bookings[0] ?? null;
  const initials = userName.charAt(0).toUpperCase();
  const fmtDate = (d) =>
    new Date(d).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  const bdgClass = (s) =>
    ({ Approved: "bdg-approved", Pending: "bdg-pending", Paid: "bdg-paid" })[
      s
    ] ?? "bdg-rejected";
  const dotClr = (s) =>
    ({ Approved: "#059669", Pending: "#d97706", Paid: "#2563eb" })[s] ??
    "#dc2626";

  const handleFeedbackSubmit = async () => {
    if (!feedbackForm.name || !feedbackForm.email || !feedbackForm.description) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      setFeedbackLoading(true);
      await apiClient.post(`/api/feedback/submit`, {
        name: feedbackForm.name,
        email: feedbackForm.email,
        description: feedbackForm.description,
      });

      toast.success("✅ Feedback Sent Successfully!");
      setFeedbackForm({ name: "", email: "", description: "" });
      setFeedbackOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send feedback");
    } finally {
      setFeedbackLoading(false);
    }
  };

  /* loading */
  if (loading)
    return (
      <>
        <style>{CSS}</style>
        <div className="loader">
          <div className="spin" />
          <span className="spin-lbl">Loading your dashboard…</span>
        </div>
      </>
    );

  /* ── render ── */
  return (
    <>
      <style>{CSS}</style>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Plus Jakarta Sans',sans-serif",
            fontSize: 13,
            borderRadius: 12,
          },
        }}
      />

      <div className="wrap">
        {/* ── Navbar ── */}
        <nav className="topbar">
          <div className="inner">
            <div className="topbar-row">
              <a className="brand">
                <div className="brand-icon">
                  <FaHome />
                </div>
                <span className="brand-text">
                  Tenant<em>Hub</em>
                </span>
              </a>

              {/* Desktop */}
              <div className="nav-right">
                <div className="chip">
                  <div className="avatar">{initials}</div>
                  <span className="chip-name">{userName}</span>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate("/")}>
                  <FaArrowLeft size={11} /> Back to Dashboard
                </button>
                <button
                  className="btn btn-red-soft"
                  onClick={() => setLogoutOpen(true)}
                >
                  <FaSignOutAlt size={11} /> Logout
                </button>
              </div>

              {/* Hamburger */}
              <button className="hbg" onClick={() => setMobOpen((o) => !o)}>
                {mobOpen ? <FaTimes /> : <FaBars />}
              </button>
            </div>
          </div>
        </nav>

        {/* ── Mobile Menu — includes logout ── */}
        {mobOpen && (
          <div className="mob-menu">
            <div className="mob-user-row">
              <div
                className="avatar"
                style={{ width: 36, height: 36, fontSize: 14 }}
              >
                {initials}
              </div>
              <div>
                <div className="mob-user-name">{userName}</div>
                <div className="mob-user-role">Tenant Account</div>
              </div>
            </div>
            <div className="mob-links">
              <button
                className="btn btn-ghost"
                onClick={() => {
                  navigate("/");
                  setMobOpen(false);
                }}
              >
                <FaArrowLeft size={12} /> Dashboard
              </button>
              <button
                className="btn btn-red-soft"
                onClick={() => {
                  setLogoutOpen(true);
                  setMobOpen(false);
                }}
              >
                <FaSignOutAlt size={12} /> Logout
              </button>
            </div>
          </div>
        )}

        {/* ── Main ── */}
        <div className="inner page">
          {/* Heading */}
          <div className="ph a1">
            <h1>
              {greeting}, {userName.split(" ")[0]}!
            </h1>
            <p>Manage your rental — payments, requests &amp; property info</p>
          </div>

          {/* Wallet */}
          <div className="a2">
            <div className="wallet">
              <div>
                <div className="wallet-lbl">Available Balance</div>
                <div className="wallet-amt">
                  ₹{walletBalance.toLocaleString("en-IN")}
                </div>
                <div className="wallet-hint">
                  Credits available for rent payments
                </div>
              </div>
              <div className="wallet-ico">
                <FaWallet />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats a3">
            <div className="scard">
              <div
                className="scard-icon"
                style={{ background: "#eff6ff", color: "#2563eb" }}
              >
                <FaHome />
              </div>
              <div className="scard-lbl">Active Property</div>
              <div className="scard-val">
                {latest ? latest.propertyId?.propertyName : "None selected"}
              </div>
              <div className="scard-sub">
                {latest ? latest.propertyId?.location : "Browse properties"}
              </div>
              <div className="ptrack">
                <div
                  className="pfill"
                  style={{
                    width: latest ? "100%" : "0%",
                    background: "#2563eb",
                  }}
                />
              </div>
            </div>

            <div className="scard">
              <div
                className="scard-icon"
                style={{ background: "#fffbeb", color: "#d97706" }}
              >
                <FaFileInvoiceDollar />
              </div>
              <div className="scard-lbl">Request Status</div>
              <div className="scard-val">
                {latest ? latest.status : "No Request"}
              </div>
              <div className="scard-sub">
                {latest?.status === "Pending"
                  ? "Awaiting approval"
                  : "Check history below"}
              </div>
              <div className="ptrack">
                <div
                  className="pfill"
                  style={{
                    width:
                      latest?.status === "Approved"
                        ? "100%"
                        : latest
                          ? "50%"
                          : "0%",
                    background:
                      latest?.status === "Approved" ? "#059669" : "#d97706",
                  }}
                />
              </div>
            </div>

            <div className="scard">
              <div
                className="scard-icon"
                style={{ background: "#f0fdf4", color: "#059669" }}
              >
                <FaTools />
              </div>
              <div className="scard-lbl">Monthly Rent</div>
              <div
                className="scard-val"
                style={{ fontFamily: "var(--mono)", fontSize: 17 }}
              >
                {latest
                  ? `₹${latest.propertyId?.rentAmount?.toLocaleString("en-IN")}`
                  : "₹0"}
              </div>
              <div className="scard-sub">As per rental agreement</div>
              <div className="ptrack">
                <div
                  className="pfill"
                  style={{
                    width: latest ? "100%" : "0%",
                    background: "#059669",
                  }}
                />
              </div>
            </div>
          </div>

          {/* Confirm Banner */}
          {selectedProp && (
            <div className="cbanner a3">
              <div className="cbanner-left">
                <div className="cbanner-ico">
                  <FaHome />
                </div>
                <div>
                  <div className="cbanner-ttl">Complete Your Booking</div>
                  <div className="cbanner-sub">
                    <strong>{selectedProp.propertyName}</strong> ·{" "}
                    {selectedProp.location}
                  </div>
                </div>
              </div>
              <button className="btn btn-green" onClick={handleConfirmBooking}>
                <FaCheck size={11} /> Confirm &amp; Send Request
              </button>
            </div>
          )}

          {/* Table */}
          <div className="tcard a4">
            <div className="thead-row">
              <span className="t-title">Booking Requests</span>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <span className="t-count">{bookings.length} records</span>
                <button
                  className="btn btn-green"
                  onClick={() => setFeedbackOpen(true)}
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  <FaComments size={11} /> Send Feedback
                </button>
              </div>
            </div>
            <div className="t-scroll">
              <table className="bt">
                <thead>
                  <tr>
                    {["Property", "Rent / mo", "Date", "Status", "Action"].map(
                      (h) => (
                        <th key={h}>{h}</th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {bookings.length > 0 ? (
                    bookings.map((b) => (
                      <tr key={b._id}>
                        <td className="td-n">
                          {b.propertyId?.propertyName || "N/A"}
                        </td>
                        <td className="td-r">
                          ₹
                          {b.propertyId?.rentAmount?.toLocaleString("en-IN") ||
                            0}
                        </td>
                        <td className="td-d">{fmtDate(b.bookingDate)}</td>
                        <td>
                          <span className={`bdg ${bdgClass(b.status)}`}>
                            <span
                              className="bdg-dot"
                              style={{ background: dotClr(b.status) }}
                            />
                            {b.status}
                          </span>
                        </td>
                        <td>
                          {b.status === "Approved" &&
                          b.paymentStatus !== "Paid" ? (
                            <button
                              className="btn btn-green"
                              style={{ padding: "5px 14px", fontSize: 12 }}
                              onClick={() =>
                                handlePayment(
                                  b._id,
                                  b.propertyId?.rentAmount,
                                  b.propertyId?.propertyName,
                                )
                              }
                            >
                              <FaWallet size={10} /> Pay Now
                            </button>
                          ) : b.paymentStatus === "Paid" ||
                            b.status === "Paid" ? (
                            <span className="bdg bdg-paid">
                              <FaCheck size={9} /> Paid
                            </span>
                          ) : b.status === "Pending" ? (
                            <button
                              className="btn btn-red-outline"
                              style={{ padding: "5px 14px", fontSize: 12 }}
                              onClick={() => handleCancelBooking(b._id)}
                            >
                              <FaTrashAlt size={9} /> Cancel
                            </button>
                          ) : (
                            <span
                              style={{ fontSize: 13, color: "var(--text3)" }}
                            >
                              —
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
                        <div className="empty">
                          <span className="empty-ico">
                            <FaHome />
                          </span>
                          No booking history found.
                          <br />
                          <span style={{ fontSize: 12 }}>
                            Browse properties from the home page to get started.
                          </span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── Feedback Modal ── */}
      <MDBModal open={feedbackOpen} setOpen={setFeedbackOpen} tabIndex="-1">
        <MDBModalDialog centered size="lg">
          <MDBModalContent
            className="mbox"
            style={{ border: "none", borderRadius: 18 }}
          >
            <MDBModalHeader style={{ border: "none", padding: 0 }}>
              <div className="mhead">
                <div className="mhead-ico">
                  <FaComments />
                </div>
                <span className="mhead-ttl">Send Us Your Feedback</span>
              </div>
            </MDBModalHeader>
            <MDBModalBody style={{ padding: "24px" }}>
              <div style={{ display: "grid", gap: 16 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={feedbackForm.name}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                    Your Email
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    value={feedbackForm.email}
                    onChange={(e) =>
                      setFeedbackForm({ ...feedbackForm, email: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: 14,
                      outline: "none",
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: "#475569", display: "block", marginBottom: 6 }}>
                    Your Feedback
                  </label>
                  <textarea
                    placeholder="Share your feedback, suggestions, or comments..."
                    value={feedbackForm.description}
                    onChange={(e) =>
                      setFeedbackForm({
                        ...feedbackForm,
                        description: e.target.value,
                      })
                    }
                    rows="5"
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: "1px solid #cbd5e1",
                      borderRadius: 8,
                      fontSize: 14,
                      fontFamily: "inherit",
                      outline: "none",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </MDBModalBody>
            <MDBModalFooter style={{ border: "none", padding: 0 }}>
              <div className="mfoot">
                <button
                  className="btn btn-ghost"
                  onClick={() => setFeedbackOpen(false)}
                  disabled={feedbackLoading}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-green"
                  onClick={handleFeedbackSubmit}
                  disabled={feedbackLoading}
                >
                  {feedbackLoading ? "Sending..." : "Send Feedback"}
                </button>
              </div>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>

      {/* ── Logout Modal ── */}
      <MDBModal open={logoutOpen} setOpen={setLogoutOpen} tabIndex="-1">
        <MDBModalDialog centered>
          <MDBModalContent
            className="mbox"
            style={{ border: "none", borderRadius: 18 }}
          >
            <MDBModalHeader style={{ border: "none", padding: 0 }}>
              <div className="mhead">
                <div className="mhead-ico">
                  <FaSignOutAlt />
                </div>
                <span className="mhead-ttl">Confirm Logout</span>
              </div>
            </MDBModalHeader>
            <MDBModalBody style={{ padding: 0 }}>
              <div className="mbody">
                Log out of <strong>TenantHub</strong>?<br />
                <span style={{ fontSize: 12, color: "var(--text3)" }}>
                  Your wallet balance will be preserved.
                </span>
              </div>
            </MDBModalBody>
            <MDBModalFooter style={{ border: "none", padding: 0 }}>
              <div className="mfoot">
                <button
                  className="btn btn-ghost"
                  onClick={() => setLogoutOpen(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-red-solid" onClick={confirmLogout}>
                  <FaSignOutAlt size={11} /> Logout
                </button>
              </div>
            </MDBModalFooter>
          </MDBModalContent>
        </MDBModalDialog>
      </MDBModal>
    </>
  );
};

export default TenantDashboard;
