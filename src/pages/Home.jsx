import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardBody,
  MDBCardImage,
  MDBIcon,
} from "mdb-react-ui-kit";

// 1. Hero Background Pattern
const HeroSection = styled.div`
  position: relative;
  width: 100%;
  padding: 80px 0;
  color: white;
  overflow: hidden;
  text-align: center;
  margin-bottom: 50px;
  background: #121212;
  background: linear-gradient(
    135deg,
    #121212 25%,
    #1a1a1a 25%,
    #1a1a1a 50%,
    #121212 50%,
    #121212 75%,
    #1a1a1a 75%,
    #1a1a1a
  );
  background-size: 40px 40px;
  animation: move 4s linear infinite;

  @keyframes move {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 40px 40px;
    }
  }

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    z-index: 1;
  }

  .content-box {
    position: relative;
    z-index: 2;
  }
`;

// --- NAYA SECTION: LOGIN/SIGNUP BUTTONS STYLING ---
const TopNav = styled.div`
  position: absolute;
  top: 25px;
  right: 40px;
  z-index: 10;
  display: flex;
  gap: 15px;

  .nav-btn {
    padding: 8px 24px;
    border-radius: 50px;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    border: 2px solid greenyellow;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .login-btn {
    background: transparent;
    color: greenyellow;
  }

  .login-btn:hover {
    background: greenyellow;
    color: #121212;
    box-shadow: 0 0 15px rgba(173, 255, 47, 0.4);
  }

  .signup-btn {
    background: greenyellow;
    color: #121212;
  }

  .signup-btn:hover {
    background: transparent;
    color: greenyellow;
    box-shadow: 0 0 15px rgba(173, 255, 47, 0.2);
  }

  @media (max-width: 576px) {
    top: 15px;
    right: 15px;
    gap: 8px;
    .nav-btn {
      padding: 6px 15px;
      font-size: 12px;
    }
  }
`;

// 2. Search Box Styling
const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 30px;
  .searchBox {
    display: flex;
    width: 100%;
    max-width: 500px;
    align-items: center;
    justify-content: space-between;
    background: #2f3640;
    border-radius: 50px;
    position: relative;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
  }
  .searchButton {
    color: white;
    position: absolute;
    right: 5px;
    width: 45px;
    height: 45px;
    border-radius: 50%;
    background: linear-gradient(90deg, #2af598 0%, #009efd 100%);
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
  }
  .searchInput {
    width: 100%;
    border: none;
    background: none;
    outline: none;
    color: white;
    font-size: 16px;
    padding: 15px 60px 15px 25px;
  }
`;

// 3. CARD WRAPPER
const CardWrapper = styled.div`
  .property-card {
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border-radius: 15px !important;
    border: none !important;
    background: #fff;
  }
  .property-card:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15) !important;
  }
  .img-container {
    overflow: hidden;
    border-radius: 15px 15px 0 0;
  }
  .img-container img {
    transition: transform 0.5s ease;
  }
  .property-card:hover .img-container img {
    transform: scale(1.08);
  }
  .price-tag {
    background: #1a1a1a;
    color: greenyellow;
    padding: 6px 14px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 0.9rem;
  }
`;

// 4. Rent Now Button Styling
const ButtonWrapper = styled.div`
  .animated-button {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 24px;
    border: 4px solid transparent;
    font-size: 14px;
    background-color: #1a1a1a;
    border-radius: 100px;
    font-weight: 600;
    color: greenyellow;
    box-shadow: 0 0 0 2px greenyellow;
    cursor: pointer;
    overflow: hidden;
    transition: all 0.6s cubic-bezier(0.23, 1, 0.32, 1);
    width: 100%;
    justify-content: center;
  }
  .animated-button:hover {
    color: #212121;
  }
  .animated-button .text {
    position: relative;
    z-index: 1;
    transform: translateX(-12px);
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .animated-button:hover .text {
    transform: translateX(12px);
  }
  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 20px;
    height: 20px;
    background-color: greenyellow;
    border-radius: 50%;
    opacity: 0;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .animated-button:hover .circle {
    width: 350px;
    height: 350px;
    opacity: 1;
  }
  .animated-button svg {
    position: absolute;
    width: 20px;
    fill: greenyellow;
    z-index: 9;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
  }
  .animated-button .arr-1 {
    right: 16px;
  }
  .animated-button .arr-2 {
    left: -25%;
  }
  .animated-button:hover .arr-1 {
    right: -25%;
  }
  .animated-button:hover .arr-2 {
    left: 16px;
  }
`;

const Home = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/home/all");
        setProperties(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter(
    (prop) =>
      prop.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.location?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
      <HeroSection>
        {/* --- LOGIN / SIGNUP BUTTONS --- */}
        <TopNav>
          <button
            className="nav-btn login-btn"
            onClick={() => navigate("/page")}
          >
            Login
          </button>
          <button
            className="nav-btn signup-btn"
            onClick={() => navigate("/page")}
          >
            Sign Up
          </button>
        </TopNav>

        <MDBContainer className="content-box">
          <h1 className="fw-bold display-4 mb-3">
            Find Your <span style={{ color: "greenyellow" }}>Space</span>
          </h1>
          <p className="opacity-75 mb-4">
            Discover curated premium rental properties in your city.
          </p>
          <SearchWrapper>
            <div className="searchBox shadow-lg">
              <input
                className="searchInput"
                type="text"
                placeholder="Search location or property..."
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
            <h3>Loading...</h3>
          </div>
        ) : (
          <MDBRow>
            {filteredProperties.map((prop) => (
              <MDBCol lg="4" md="6" key={prop._id} className="mb-5">
                <CardWrapper>
                  <MDBCard className="property-card shadow-sm">
                    <div className="img-container position-relative">
                      <MDBCardImage
                        src={prop.image}
                        position="top"
                        style={{ height: "230px", objectFit: "cover" }}
                      />
                      <div className="position-absolute bottom-0 start-0 m-3">
                        <span className="price-tag">
                          Rs. {prop.rentAmount?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <MDBCardBody className="d-flex flex-column p-4">
                      <h5 className="fw-bold text-dark mb-1">
                        {prop.propertyName}
                      </h5>
                      <p className="text-muted small mb-3">
                        <MDBIcon
                          fas
                          icon="map-marker-alt"
                          className="me-2"
                          style={{ color: "greenyellow" }}
                        />
                        {prop.location}
                      </p>
                      <div className="d-flex justify-content-between text-muted small mb-4 bg-light p-2 rounded-3">
                        <span>
                          <MDBIcon
                            fas
                            icon="bed"
                            className="me-1 text-primary"
                          />{" "}
                          {prop.bedrooms} Bed
                        </span>
                        <span>
                          <MDBIcon
                            fas
                            icon="bath"
                            className="me-1 text-primary"
                          />{" "}
                          {prop.bathrooms} Bath
                        </span>
                        <span>
                          <MDBIcon
                            fas
                            icon="ruler-combined"
                            className="me-1 text-primary"
                          />{" "}
                          {prop.area}
                        </span>
                      </div>
                      <div className="mt-auto">
                        <ButtonWrapper>
                          <button
                            className="animated-button"
                            onClick={() => navigate("/page")}
                          >
                            <span className="text">Rent Now</span>
                            <span className="circle" />
                            <svg
                              viewBox="0 0 24 24"
                              className="arr-1"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z" />
                            </svg>
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
