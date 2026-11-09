import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { API_BASE_URL, API } from "../config/api";
import Loader from "../components/Loader";

const HeroSection = styled.div`
  position: relative;
  width: 100%;
  padding: 28px 0 88px;
  color: white;
  overflow: hidden;
  text-align: center;
  margin-bottom: 52px;
  background: #182230;
  border-bottom: 1px solid #2d3b4b;
  .content-box {
    position: relative;
    z-index: 2;
    max-width: 960px;
    margin: 0 auto;
  }
  h1 {
    max-width: 720px;
    margin: 0 auto 16px;
    color: #f8fafc;
    font-size: clamp(2.4rem, 5vw, 4rem);
    font-weight: 600;
    letter-spacing: -0.04em;
    line-height: 1.05;
  }
  h1 span {
    color: #f4c430;
  }
  p {
    max-width: 560px;
    margin: 0 auto;
    color: #b7c2cf;
    font-size: 1.05rem;
    line-height: 1.6;
  }
  @media (max-width: 768px) {
    padding: 20px 0 64px;
    margin-bottom: 40px;
  }
`;

const TopNav = styled.div`
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 64px;
  .brand {
    color: #fff;
    font-size: 1.5rem;
    font-weight: 800;
    letter-spacing: -0.02em;
  }
  .brand span {
    color: #facc15;
  }
  .menu-toggle {
    display: none;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.12);
    color: #fff;
    font-size: 1.1rem;
    cursor: pointer;
  }
  .nav-links {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  .nav-btn {
    padding: 10px 18px;
    border-radius: 8px;
    font-weight: 500;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease;
    border: 1px solid #607080;
    background: transparent;
    color: #fff;
  }
  .login-btn {
    background: transparent;
    color: #fff;
  }
  .login-btn:hover {
    background: #fff;
    border-color: #fff;
    color: #182230;
  }
  .signup-btn {
    border-color: #f4c430;
    background: #f4c430;
    color: #182230;
  }
  .signup-btn:hover {
    background: #ffd866;
    border-color: #ffd866;
    color: #182230;
  }
  .user-btn {
    background: #243343;
    color: #fff;
    border: 1px solid #607080;
  }
  .user-btn:hover {
    background: #304357;
    border-color: #8798a8;
    color: #fff;
  }
  @media (max-width: 1024px) {
    .brand {
      font-size: 1.4rem;
    }
    .nav-btn {
      padding: 9px 16px;
      font-size: 13px;
    }
  }
  @media (max-width: 768px) {
    margin-bottom: 40px;
    align-items: center;
    .brand {
      font-size: 1.25rem;
    }
    .menu-toggle {
      display: inline-flex;
    }
    .nav-links {
      display: none;
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      width: min(240px, 80vw);
      padding: 12px;
      border-radius: 8px;
      border: 1px solid #3b4b5c;
      background: #202e3d;
      flex-direction: column;
      gap: 10px;
      flex-wrap: nowrap;
      justify-content: flex-start;
      z-index: 12;
    }
    .nav-links.open {
      display: flex;
    }
    .nav-btn {
      width: 100%;
      padding: 9px 14px;
      font-size: 13px;
    }
  }
`;

const SearchWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 36px;
  .searchBox {
    display: flex;
    width: 100%;
    max-width: 640px;
    align-items: center;
    justify-content: space-between;
    background: #f8fafc;
    border: 1px solid #d5dee7;
    border-radius: 10px;
    position: relative;
    transition: border-color 0.2s ease;
  }
  .searchBox:hover {
    border-color: #aebdca;
  }
  .suggestions {
    position: absolute;
    top: calc(100% + 8px);
    left: 0;
    right: 0;
    z-index: 20;
    overflow: hidden;
    border: 1px solid #d5dee7;
    border-radius: 10px;
    background: #fff;
    text-align: left;
  }
  .suggestion {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 12px 16px;
    border: 0;
    border-bottom: 1px solid #edf1f5;
    background: #fff;
    color: #273444;
    cursor: pointer;
    font-size: 14px;
    text-align: left;
  }
  .suggestion:last-child {
    border-bottom: 0;
  }
  .suggestion:hover,
  .suggestion.active {
    background: #f3f6f8;
  }
  .suggestion small {
    margin-left: auto;
    color: #718096;
    font-size: 12px;
  }
  .searchButton {
    color: #182230;
    position: absolute;
    right: 6px;
    width: 44px;
    height: 44px;
    border-radius: 7px;
    background: #f4c430;
    border: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.2s ease, transform 0.2s ease;
  }
  .searchButton:hover {
    background: #ffd866;
    transform: translateY(-1px);
  }
  .searchInput {
    width: 100%;
    border: none;
    background: none;
    outline: none;
    color: #182230;
    font-size: 16px;
    padding: 16px 62px 16px 18px;
    font-weight: 400;
  }
  .searchInput::placeholder {
    color: #718096;
  }
`;

const FilterPanel = styled.div`
  margin-top: -24px;
  margin-bottom: 28px;
  position: relative;
  z-index: 12;
  .filter-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 20px;
  }
  .filter-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    margin-bottom: 16px;
  }
  .filter-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: #0f172a;
  }
  .clear-btn {
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    background: #f8fafc;
    color: #334155;
    padding: 8px 12px;
    font-size: 0.8rem;
    font-weight: 600;
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 10px;
  }
  select,
  input {
    width: 100%;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 12px;
    color: #0f172a;
    background: #fff;
    font-size: 0.9rem;
    outline: none;
  }
  select:focus,
  input:focus {
    border-color: #b88900;
    box-shadow: 0 0 0 3px rgba(244, 196, 48, 0.2);
  }
`;

const CardWrapper = styled.div`
  .property-card {
    transition: border-color 0.2s ease;
    border-radius: 16px !important;
    border: 1px solid #dce3e9 !important;
    background: #fff;
    overflow: hidden;
  }
  .property-card:hover {
    border-color: #b8c5d0 !important;
  }
  .img-container {
    overflow: hidden;
    border-radius: 16px 16px 0 0;
    position: relative;
  }
  .img-container img {
    transition: filter 0.2s ease;
    width: 100%;
    height: 240px;
    object-fit: cover;
  }
  .property-card:hover .img-container img {
    filter: brightness(0.96);
  }
  .price-tag {
    background: #f4c430;
    color: #fff;
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: bold;
    font-size: 1rem;
    position: absolute;
    bottom: 16px;
    left: 16px;
  }
  .card-body {
    padding: 24px;
  }
  .property-title {
    font-size: 1.4rem;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }
  .location {
    color: #666;
    font-size: 0.95rem;
    margin-bottom: 16px;
  }
  .description-text {
    -webkit-box-orient: vertical;
    overflow: hidden;
    height: 2.7rem;
    line-height: 1.4;
  }

  .features {
    display: flex;
    justify-content: space-between;
    background: #f8f9fa;
    padding: 12px;
    border-radius: 8px;
    margin-bottom: 24px;
  }
  .features span {
    display: flex;
    align-items: center;
    font-size: 0.85rem;
    color: #555;
  }
  .features .icon {
    margin-right: 8px;
    color: #b88900;
  }

  .is-rented {
    opacity: 0.7;
    filter: grayscale(0.5);
    pointer-events: none;
  }
  .rented-badge {
    position: absolute;
    top: 16px;
    right: 16px;
    background: #ff4d4d;
    color: white;
    padding: 6px 10px;
    border-radius: 8px;
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
    padding: 12px 16px;
    border: 1px solid #b88900;
    font-size: 14px;
    background-color: #fff;
    border-radius: 8px;
    font-weight: 600;
    color: #8a6700;
    cursor: pointer;
    overflow: hidden;
    transition: background-color 0.2s ease, color 0.2s ease;
    width: 100%;
    justify-content: center;
    text-transform: none;
    letter-spacing: 0;
  }
  .animated-button:hover:not(:disabled) {
    color: #182230;
    background: #f4c430;
  }
  .animated-button .text {
    position: relative;
    z-index: 10;
    transition: color 0.2s ease;
  }
  .animated-button .circle {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 0;
    height: 0;
    display: none;
    border-radius: 50%;
    transition: none;
    z-index: 1;
  }
  .animated-button:hover:not(:disabled) .circle {
    width: 0;
    height: 0;
  }
  .animated-button svg {
    position: absolute;
    width: 18px;
    fill: #8a6700;
    z-index: 9;
    transition: transform 0.25s ease, opacity 0.25s ease;
  }
  .animated-button .arr-1 {
    right: 16px;
  }
  .animated-button .arr-2 {
    left: 16px;
    opacity: 0;
    transform: translateX(-24px);
  }
  .animated-button:hover:not(:disabled) .arr-1 {
    transform: translateX(28px);
  }
  .animated-button:hover:not(:disabled) .arr-2 {
    opacity: 1;
    transform: translateX(0);
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
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestionIndex, setSuggestionIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [maxRent, setMaxRent] = useState("");
  const [minBedrooms, setMinBedrooms] = useState("all");
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  const userId = localStorage.getItem("userId");
  const userRole = localStorage.getItem("userRole");

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

  const handleRentNow = (propertyId) => {
    navigate(`/property/${propertyId}`);
  };

  const uniqueLocations = useMemo(() => {
    return [
      ...new Set(properties.map((item) => item.location).filter(Boolean)),
    ];
  }, [properties]);

  const uniqueCategories = useMemo(() => {
    return [
      ...new Set(properties.map((item) => item.category).filter(Boolean)),
    ];
  }, [properties]);

  const searchSuggestions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return [];

    const suggestions = [];
    const seen = new Set();
    properties.forEach((property) => {
      [
        { value: property.propertyName, type: "Property" },
        { value: property.location, type: "Location" },
      ].forEach(({ value, type }) => {
        const normalized = value?.trim();
        if (
          normalized &&
          normalized.toLowerCase().includes(query) &&
          !seen.has(`${type}:${normalized.toLowerCase()}`)
        ) {
          seen.add(`${type}:${normalized.toLowerCase()}`);
          suggestions.push({ value: normalized, type });
        }
      });
    });
    return suggestions.slice(0, 6);
  }, [properties, searchTerm]);

  const filteredProperties = useMemo(() => {
    return properties.filter(
      (prop) =>
        (prop.propertyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          prop.location?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedLocation === "all" || prop.location === selectedLocation) &&
        (selectedCategory === "all" || prop.category === selectedCategory) &&
        (selectedStatus === "all" || prop.status === selectedStatus) &&
        (!maxRent || Number(prop.rentAmount) <= Number(maxRent)) &&
        (minBedrooms === "all" || Number(prop.bedrooms) >= Number(minBedrooms)),
    );
  }, [
    properties,
    searchTerm,
    selectedLocation,
    selectedCategory,
    selectedStatus,
    maxRent,
    minBedrooms,
  ]);

  const resetFilters = () => {
    setSelectedLocation("all");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setMaxRent("");
    setMinBedrooms("all");
  };

  const selectSuggestion = (suggestion) => {
    setSearchTerm(suggestion.value);
    setSuggestionIndex(-1);
    setShowSuggestions(false);
  };

  const handleSearchKeyDown = (event) => {
    if (!showSuggestions || !searchSuggestions.length) {
      if (event.key === "Escape") setShowSuggestions(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSuggestionIndex((index) => (index + 1) % searchSuggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSuggestionIndex(
        (index) => (index <= 0 ? searchSuggestions.length - 1 : index - 1),
      );
    } else if (event.key === "Enter" && suggestionIndex >= 0) {
      event.preventDefault();
      selectSuggestion(searchSuggestions[suggestionIndex]);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
      setSuggestionIndex(-1);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsNavOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div style={{ backgroundColor: "#f5f7f8", minHeight: "100vh" }}>
      <HeroSection>
        <MDBContainer className="content-box">
          <TopNav>
            <div className="brand">
              Rentify<span>.software</span>
            </div>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Toggle navigation menu"
              aria-expanded={isNavOpen}
              onClick={() => setIsNavOpen((prev) => !prev)}
            >
              <MDBIcon fas icon={isNavOpen ? "times" : "bars"} />
            </button>
            <div className={`nav-links ${isNavOpen ? "open" : ""}`}>
              {userId ? (
                <button
                  className="nav-btn user-btn"
                  onClick={() => {
                    setIsNavOpen(false);
                    navigate(
                      `/${userRole?.toLowerCase() || "tenant"}-dashboard`,
                    );
                  }}
                >
                  <MDBIcon fas icon="user-circle" className="me-2" />
                  My Dashboard
                </button>
              ) : (
                <>
                  <button
                    className="nav-btn login-btn"
                    onClick={() => {
                      setIsNavOpen(false);
                      navigate("/login");
                    }}
                  >
                    Login
                  </button>
                  <button
                    className="nav-btn signup-btn"
                    onClick={() => {
                      setIsNavOpen(false);
                      navigate("/signup");
                    }}
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>
          </TopNav>

          <h1>
            Find Your <span>Dream Space</span>
          </h1>
          <p>
            Discover curated premium rental properties in your city with ease.
          </p>
          <SearchWrapper>
            <div className="searchBox">
              <input
                className="searchInput"
                type="text"
                role="combobox"
                aria-autocomplete="list"
                aria-controls="property-search-suggestions"
                aria-expanded={showSuggestions && searchSuggestions.length > 0}
                placeholder="Search by location or property name"
                value={searchTerm}
                onFocus={() => setShowSuggestions(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSuggestionIndex(-1);
                  setShowSuggestions(true);
                }}
                onKeyDown={handleSearchKeyDown}
              />
              <button className="searchButton">
                <MDBIcon fas icon="search" />
              </button>
              {showSuggestions && searchSuggestions.length > 0 && (
                <div
                  id="property-search-suggestions"
                  className="suggestions"
                  role="listbox"
                >
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      type="button"
                      key={`${suggestion.type}-${suggestion.value}`}
                      className={`suggestion ${
                        index === suggestionIndex ? "active" : ""
                      }`}
                      role="option"
                      aria-selected={index === suggestionIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => selectSuggestion(suggestion)}
                    >
                      <MDBIcon
                        fas
                        icon={
                          suggestion.type === "Location"
                            ? "map-marker-alt"
                            : "home"
                        }
                      />
                      <span>{suggestion.value}</span>
                      <small>{suggestion.type}</small>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </SearchWrapper>
        </MDBContainer>
      </HeroSection>

      <MDBContainer>
        <FilterPanel>
          <div className="filter-card">
            <div className="filter-header">
              <h2 className="filter-title">Find The Right Property Faster</h2>
              <button
                type="button"
                className="clear-btn"
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            </div>
            <div className="grid">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="all">All Locations</option>
                {uniqueLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="all">Any Status</option>
                <option value="Vacant">Vacant</option>
                <option value="Occupied">Occupied</option>
              </select>

              <select
                value={minBedrooms}
                onChange={(e) => setMinBedrooms(e.target.value)}
              >
                <option value="all">Min Bedrooms</option>
                <option value="1">1+</option>
                <option value="2">2+</option>
                <option value="3">3+</option>
                <option value="4">4+</option>
              </select>

              <input
                type="number"
                min="0"
                placeholder="Max Monthly Rent"
                value={maxRent}
                onChange={(e) => setMaxRent(e.target.value)}
              />
            </div>
          </div>
        </FilterPanel>

        {loading ? (
          <Loader label="Loading properties..." />
        ) : filteredProperties.length === 0 ? (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 16,
              padding: 24,
              textAlign: "center",
              color: "#334155",
              fontWeight: 600,
            }}
          >
            No properties match your current filters.
          </div>
        ) : (
          <MDBRow>
            {filteredProperties.map((prop) => (
              <MDBCol lg="4" md="6" key={prop._id} className="mb-4">
                <CardWrapper>
                  <MDBCard
                    className={`property-card ${
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
                        src={
                          prop.image
                            ? prop.image.startsWith("http") ||
                              prop.image.startsWith("data:")
                              ? prop.image
                              : prop.image.startsWith("/")
                                ? `${API_BASE_URL}${prop.image}`
                                : "https://via.placeholder.com/400x250?text=No+Image"
                            : "https://via.placeholder.com/400x250?text=No+Image"
                        }
                        position="top"
                        alt={prop.propertyName}
                        onClick={() => handleRentNow(prop._id)}
                        style={{ cursor: "pointer" }}
                      />
                      <div className="price-tag">
                        Rs. {prop.rentAmount?.toLocaleString()}
                      </div>
                    </div>
                    <MDBCardBody className="card-body d-flex flex-column">
                      <h5
                        className="property-title"
                        onClick={() => handleRentNow(prop._id)}
                        style={{ cursor: "pointer" }}
                      >
                        {prop.propertyName}
                      </h5>
                      <p className="location">
                        <MDBIcon
                          fas
                          icon="map-marker-alt"
                          className="me-2"
                          style={{ color: "#b88900" }}
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
                            onClick={() => handleRentNow(prop._id)}
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
