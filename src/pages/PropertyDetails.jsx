import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { API, apiClient } from "../config/api";
import { formatDate, getDisplayName } from "../utils/helpers";
import Swal from "sweetalert2";

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  boxShadow: "0 6px 20px rgba(15, 23, 42, 0.05)",
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.06em",
};

const valueStyle = {
  fontSize: 15,
  color: "#0f172a",
  fontWeight: 600,
};

const PropertyDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renting, setRenting] = useState(false);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get(API.HOME.BY_ID(id));
        setProperty(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load property details",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const createdByName = useMemo(() => {
    if (!property) return "Unknown";
    return (
      property.createdBy?.name ||
      getDisplayName(property.managerId) ||
      "Unknown"
    );
  }, [property]);

  const handleRentNow = async () => {
    if (!property || property.status === "Occupied") {
      return;
    }

    if (!userId) {
      const result = await Swal.fire({
        title: "Login Required",
        text: "Please login to continue with rental booking.",
        icon: "info",
        confirmButtonColor: "#0f172a",
        confirmButtonText: "Go to Login",
        showCancelButton: true,
        cancelButtonText: "Stay Here",
      });

      if (result.isConfirmed) {
        navigate("/login", { state: { from: `/property/${id}` } });
      }
      return;
    }

    const confirm = await Swal.fire({
      title: "Send Rental Request?",
      text: `Do you want to rent ${property.propertyName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Request Rental",
      confirmButtonColor: "#0f172a",
      cancelButtonColor: "#94a3b8",
    });

    if (!confirm.isConfirmed) {
      return;
    }

    try {
      setRenting(true);
      const response = await apiClient.post(API.BOOKINGS.CREATE, {
        propertyId: property._id,
        tenantId: userId,
      });

      if (response.status === 201) {
        await Swal.fire({
          title: "Request Sent",
          text: "Your booking request was submitted successfully.",
          icon: "success",
          confirmButtonColor: "#0f172a",
        });
        navigate("/tenant-dashboard");
      }
    } catch (err) {
      Swal.fire({
        title: "Unable to Continue",
        text: err.response?.data?.message || "Something went wrong.",
        icon: "error",
        confirmButtonColor: "#0f172a",
      });
    } finally {
      setRenting(false);
    }
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fafc",
        }}
      >
        <p style={{ color: "#475569", fontWeight: 600 }}>
          Loading property details...
        </p>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fafc",
          padding: 20,
        }}
      >
        <div
          style={{
            ...cardStyle,
            padding: 24,
            maxWidth: 520,
            width: "100%",
            textAlign: "center",
          }}
        >
          <h2 style={{ marginBottom: 8, color: "#0f172a" }}>
            Property Not Found
          </h2>
          <p style={{ color: "#64748b", marginBottom: 18 }}>
            {error || "No details available."}
          </p>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#0f172a",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "10px 16px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "22px 16px 40px",
      }}
    >
      <div
        style={{ maxWidth: 1050, margin: "0 auto", display: "grid", gap: 16 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              color: "#334155",
              borderRadius: 10,
              padding: "8px 13px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back
          </button>
          <span style={{ color: "#64748b", fontWeight: 600, fontSize: 13 }}>
            Created on {formatDate(property.createdAt)}
          </span>
        </div>

        <div
          style={{
            ...cardStyle,
            background:
              "linear-gradient(105deg, rgba(15,23,42,0.98) 0%, rgba(30,41,59,0.98) 100%)",
            color: "#fff",
            padding: "16px 18px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 17 }}>
              Ready to move into this property?
            </p>
            <p style={{ margin: "5px 0 0", color: "#cbd5e1", fontSize: 14 }}>
              {property.status === "Occupied"
                ? "This listing is currently rented."
                : "Complete your request in a few clicks."}
            </p>
          </div>
          <button
            onClick={handleRentNow}
            disabled={property.status === "Occupied" || renting}
            style={{
              background:
                property.status === "Occupied" ? "#94a3b8" : "#facc15",
              color: "#0f172a",
              border: "none",
              borderRadius: 999,
              padding: "10px 16px",
              fontWeight: 700,
              cursor:
                property.status === "Occupied" || renting
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {property.status === "Occupied"
              ? "Not Available"
              : renting
                ? "Processing..."
                : userId
                  ? "Rent Now"
                  : "Login to Rent Now"}
          </button>
        </div>

        <div style={{ ...cardStyle, overflow: "hidden" }}>
          <img
            src={
              property.image ||
              "https://placehold.co/1200x500/e2e8f0/64748b?text=Property"
            }
            alt={property.propertyName}
            style={{ width: "100%", height: 360, objectFit: "cover" }}
          />
          <div style={{ padding: 18 }}>
            <h1
              style={{
                margin: 0,
                color: "#0f172a",
                fontSize: 30,
                lineHeight: 1.2,
              }}
            >
              {property.propertyName}
            </h1>
            <p style={{ margin: "8px 0 0", color: "#64748b", fontSize: 16 }}>
              {property.location}
            </p>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          {[
            {
              label: "Rent / Month",
              value: `Rs. ${Number(property.rentAmount || 0).toLocaleString("en-IN")}`,
            },
            { label: "Bedrooms", value: property.bedrooms ?? "-" },
            { label: "Bathrooms", value: property.bathrooms ?? "-" },
            {
              label: "Area",
              value: property.area ? `${property.area} sqft` : "-",
            },
            { label: "Category", value: property.category || "Apartment" },
            { label: "Status", value: property.status || "Vacant" },
          ].map((item) => (
            <div key={item.label} style={{ ...cardStyle, padding: 14 }}>
              <p style={labelStyle}>{item.label}</p>
              <p style={{ ...valueStyle, marginTop: 6 }}>{item.value}</p>
            </div>
          ))}
        </div>

        <div style={{ ...cardStyle, padding: 16 }}>
          <p style={labelStyle}>Description</p>
          <p
            style={{
              marginTop: 8,
              color: "#334155",
              lineHeight: 1.7,
              fontSize: 15,
            }}
          >
            {property.description ||
              "No description available for this property."}
          </p>
        </div>

        <div style={{ ...cardStyle, padding: 16 }}>
          <p style={labelStyle}>Property Audit</p>
          <div
            style={{
              marginTop: 10,
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            <div>
              <p style={labelStyle}>Created By</p>
              <p style={{ ...valueStyle, marginTop: 6 }}>{createdByName}</p>
            </div>
            <div>
              <p style={labelStyle}>Creator Role</p>
              <p style={{ ...valueStyle, marginTop: 6 }}>
                {property.createdBy?.role || "Unknown"}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Assigned Manager</p>
              <p style={{ ...valueStyle, marginTop: 6 }}>
                {getDisplayName(property.managerId) || "Unassigned"}
              </p>
            </div>
            <div>
              <p style={labelStyle}>Tenant</p>
              <p style={{ ...valueStyle, marginTop: 6 }}>
                {getDisplayName(property.tenant) || "No tenant"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;
