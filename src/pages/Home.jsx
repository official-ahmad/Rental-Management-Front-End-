import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { apiClient } from "../config/api";
import styled from "styled-components";
import Swal from "sweetalert2";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBIcon,
} from "mdb-react-ui-kit";
import { API } from "../config/api";

// --- STYLED COMPONENTS ---
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  padding: 120px 0 100px;
  color: white;
  overflow: hidden;
  text-align: center;
  margin-bottom: 60px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-size: 400% 400%;
  animation: gradientShift 8s ease infinite;
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }
  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.4);
    z-index: 1;
  }
  .content-box {
    position: relative;
    z-index: 2;
    max-width: 800px;
    margin: 0 auto;
  }
  h1 {
    font-size: 3.5rem;
    font-weight: 700;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
    margin-bottom: 20px;
  }
  p {
    font-size: 1.2rem;
    opacity: 0.9;
    margin-bottom: 40px;
  }
`;

const TopNav = styled.div`
  position: absolute;
  top: 30px;
  right: 50px;
  z-index: 10;
  display: flex;
  gap: 20px;
  .nav-btn {
    padding: 10px 28px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 15px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid #fff;
    text-transform: uppercase;
    letter-spacing: 1px;
    backdrop-filter: blur(10px);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
  .login-btn {
    background: transparent;
    color: #fff;
  }
  .login-btn:hover {
    background: #fff;
    color: #667eea;
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.3);
  }
  .signup-btn {
    background: #fff;
    color: #667eea;
  }
  .signup-btn:hover {
    background: #667eea;
    color: #fff;
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.5);
  }
  .user-btn {
    background: rgba(0, 0, 0, 0.7);
    color: #fff;
    border: 2px solid #fff;
  }
  .user-btn:hover {
    background: #fff;
    color: #667eea;
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
  .searchBox {
    display: flex;
    width: 100%;
    max-width: 600px;
    align-items: center;
    justify-content: space-between;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 50px;
    position: relative;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    transition: box-shadow 0.3s ease;
  }
  .searchBox:hover {
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
  }
  .searchButton {
    color: #667eea;
    position: absolute;
    right: 8px;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  .searchButton:hover {
    transform: scale(1.1);
  }
  .searchInput {
    width: 100%;
    border: none;
    background: none;
    outline: none;
    color: #333;
    font-size: 18px;
    padding: 18px 70px 18px 30px;
    font-weight: 500;
  }
  .searchInput::placeholder {
    color: #999;
  }
`;

const CardWrapper = styled.div`
  .property-card {
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    border-radius: 20px !important;
    border: none !important;
    background: #fff;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  .property-card:hover {
    transform: translateY(-15px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2) !important;
  }
  .img-container {
    overflow: hidden;
    border-radius: 20px 20px 0 0;
    position: relative;
  }
  .img-container img {
    transition: transform 0.5s ease;
    width: 100%;
    height: 250px;
    object-fit: cover;
  }
  .property-card:hover .img-container img {
    transform: scale(1.1);
  }
  .price-tag {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    padding: 8px 16px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 1rem;
    position: absolute;
    bottom: 15px;
    left: 15px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
  .card-body {
    padding: 25px;
  }
  .property-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 10px;
  }
  .location {
    color: #666;
    font-size: 0.95rem;
    margin-bottom: 12px;
  }

  /* --- DESCRIPTION TEXT STYLING --- */
  .description-text {
    font-size: 0.9rem;
    color: #777;
    margin-bottom: 20px;
    display: -webkit-box;
    -webkit-line-clamp: 2; /* Truncate after 2 lines */
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.7rem; /* Keeps all cards same height */
    line-height: 1.4;
  }

  .features {
    display: flex;
    justify-content: space-between;
    background: #f8f9fa;
    padding: 15px;
    border-radius: 15px;
    margin-bottom: 20px;
  }
  .features span {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #555;
  }
  .features .icon {
    margin-right: 5px;
    color: #667eea;
  }

  .is-rented {
    opacity: 0.7;
    filter: grayscale(0.5);
    pointer-events: none;
  }
  .rented-badge {
    position: absolute;
    top: 15px;
    right: 15px;
    background: #ff4d4d;
    color: white;
    padding: 5px 12px;
    border-radius: 50px;
    font-weight: bold;
    z-index: 3;
    font-size: 0.8rem;
    text-transform: uppercase;
  }
`;

const ButtonWrapper = styled.div`
  .animated-button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 15px 30px;
    border: 2px solid #667eea;
    font-size: 16px;
    background-color: #fff;
    border-radius: 50px;
    font-weight: 600;
    color: #667eea;
    box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4);
    cursor: pointer;
    overflow: hidden;
    transition: all 0.4s ease;
    width: 100%;
    justify-content: center;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .animated-button:hover:not(:disabled) {
    color: #fff;
    box-shadow: 0 0 0 10px rgba(102, 126, 234, 0.4);
  }
  .animated-button .text {
    position: relative;
    z-index: 10;
    transition: all 0.4s ease;
  }
  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    background-color: #667eea;
    border-radius: 50%;
    transition: all 0.4s ease;
    z-index: 1;
  }
  .animated-button:hover:not(:disabled) .circle {
    width: 300px;
    height: 300px;
  }
  .animated-button svg {
    position: absolute;
    width: 20px;
    fill: #667eea;
    z-index: 9;
    transition: all 0.4s ease;
  }
  .animated-button .arr-1 {
    right: 20px;
  }
  .animated-button .arr-2 {
    left: -25%;
  }
  .animated-button:hover:not(:disabled) .arr-1 {
    right: -25%;
  }
  .animated-button:hover:not(:disabled) .arr-2 {
    left: 20px;
  }

  .animated-button:disabled {
    background-color: #e0e0e0;
    border-color: #ccc;
    color: #888;
    cursor: not-allowed;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

  // Memoized fetch function
  const fetchProperties = useCallback(async () => {
    try {
      const response = await axios.get(API.HOME.ALL);
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleRentNow = async (prop) => {
    if (prop.status === "Occupied") return;

    if (!userId) {
      Swal.fire({
        title: "Login Required",
        text: "Please login first to rent a property!",
        icon: "warning",
        confirmButtonColor: "#667eea",
        borderRadius: "15px",
      });
      navigate("/signup");
      return;
    }

    Swal.fire({
      title: "Confirm Request?",
      text: `Send a rental request for ${prop.propertyName}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#667eea",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, Send Request",
      borderRadius: "20px",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await apiClient.post(API.BOOKINGS.CREATE, {
            propertyId: prop._id,
            tenantId: userId,
          });

          if (response.status === 201) {
            Swal.fire({
              title: "Request Sent!",
              text: "Request submitted successfully. Redirecting...",
              icon: "success",
              timer: 2000,
              showConfirmButton: false,
              borderRadius: "20px",
            });

            setTimeout(() => {
              navigate("/tenant-dashboard");
            }, 2000);
          }
        } catch (error) {
          Swal.fire({
            title: "Error!",
            text: error.response?.data?.message || "Something went wrong.",
            icon: "error",
            confirmButtonColor: "#667eea",
          });
        }
      }
    });
  };

  // Memoize filtered properties for performance
  const filteredProperties = useMemo(() => {
    return properties.filter(
      (prop) =>
        prop.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prop.location?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [properties, searchTerm]);

  return (
    <div style={{ backgroundColor: "#f4f7fa", minHeight: "100vh" }}>
      <HeroSection>
        <TopNav>
          {userId ? (
            <button
              className="nav-btn user-btn"
              onClick={() =>
                navigate(`/${userRole?.toLowerCase() || "tenant"}-dashboard`)
              }
            >
              <MDBIcon fas icon="user-circle" className="me-2" />
              My Dashboard
            </button>
          ) : (
            <>
              <button
                className="nav-btn login-btn"
                onClick={() => navigate("/login")}
              >
                Login
              </button>
              <button
                className="nav-btn signup-btn"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
            </>
          )}
        </TopNav>

        <MDBContainer className="content-box">
          <h1 className="fw-bold display-4 mb-3">
            Find Your <span style={{ color: "#fff" }}>Dream Space</span>
          </h1>
          <p className="opacity-75 mb-4">
            Discover curated premium rental properties in your city with ease.
          </p>
          <SearchWrapper>
            <div className="searchBox shadow-lg">
              <input
                className="searchInput"
                type="text"
                placeholder="Search by location or property name..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="searchButton">
                <MDBIcon fas icon="search" />
              </button>
            </div>
          </SearchWrapper>
        </MDBContainer>
      </HeroSection>

      <MDBContainer>
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <h4 className="mt-3">Loading Properties...</h4>
          </div>
        ) : (
          <MDBRow>
            {filteredProperties.map((prop) => (
              <MDBCol lg="4" md="6" key={prop._id} className="mb-5">
                <CardWrapper>
                  <MDBCard
                    className={`property-card shadow-sm ${
                      prop.status === "Occupied" ? "is-rented" : ""
                    }`}
                  >
                    <div className="img-container position-relative">
                      {prop.status === "Occupied" && (
                        <div className="rented-badge">
                          <MDBIcon fas icon="lock" className="me-1" /> Rented
                        </div>
                      )}
                      <MDBCardImage
                        src={prop.image}
                        position="top"
                        alt={prop.propertyName}
                      />
                      <div className="price-tag">
                        Rs. {prop.rentAmount?.toLocaleString()}
                      </div>
                    </div>
                    <MDBCardBody className="card-body d-flex flex-column">
                      <h5 className="property-title">{prop.propertyName}</h5>
                      <p className="location">
                        <MDBIcon
                          fas
                          icon="map-marker-alt"
                          className="me-2"
                          style={{ color: "#667eea" }}
                        />
                        {prop.location}
                      </p>

                      {/* --- DESCRIPTION FIELD ADDED HERE --- */}
                      <p className="description-text">
                        {prop.description ||
                          "No description provided for this property. Contact manager for more details."}
                      </p>

                      <div className="features">
                        <span>
                          <MDBIcon fas icon="bed" className="icon" />{" "}
                          {prop.bedrooms} Bed
                        </span>
                        <span>
                          <MDBIcon fas icon="bath" className="icon" />{" "}
                          {prop.bathrooms} Bath
                        </span>
                        <span>
                          <MDBIcon fas icon="ruler-combined" className="icon" />{" "}
                          {prop.area} sqft
                        </span>
                      </div>
                      <div className="mt-auto">
                        <ButtonWrapper>
                          <button
                            className="animated-button"
                            onClick={() => handleRentNow(prop)}
                            disabled={prop.status === "Occupied"}
                          >
                            <span className="text">
                              {prop.status === "Occupied"
                                ? "Not Available"
                                : "Rent Now"}
                            </span>
                            {prop.status !== "Occupied" && (
                              <>
                                <span className="circle" />
                                <svg
                                  viewBox="0 0 24 24"
                                  className="arr-1"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                                </svg>
                                <svg
                                  viewBox="0 0 24 24"
                                  className="arr-2"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                                </svg>
                              </>
                            )}
                          </button>
                        </ButtonWrapper>
                      </div>
                    </MDBCardBody>
                  </MDBCard>
                </CardWrapper>
              </MDBCol>
            ))}
          </MDBRow>
        )}
      </MDBContainer>
    </div>
  );
};

export default Home;
