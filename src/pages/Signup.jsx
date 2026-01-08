import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import {
  MDBBtn,
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import styled from "styled-components";

// Reusable Button Component (from your top code, now integrated)
const Button = ({ onClick, children }) => {
  return (
    <StyledWrapper>
      <button onClick={onClick}>
        {children}
        <div className="arrow-wrapper">
          <div className="arrow" />
        </div>
      </button>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  button {
    --primary-color: #645bff;
    --secondary-color: #fff;
    --hover-color: #111;
    --arrow-width: 10px;
    --arrow-stroke: 2px;
    box-sizing: border-box;
    border: 0;
    border-radius: 20px;
    color: var(--secondary-color);
    padding: 1em 1.8em;
    background: var(--primary-color);
    display: flex;
    transition: 0.2s background;
    align-items: center;
    gap: 0.6em;
    font-weight: bold;
    cursor: pointer;
    width: 100%; /* Full width */
    justify-content: center; /* Center the content inside */
  }

  button .arrow-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  button .arrow {
    margin-top: 1px;
    width: var(--arrow-width);
    background: var(--primary-color);
    height: var(--arrow-stroke);
    position: relative;
    transition: 0.2s;
  }

  button .arrow::before {
    content: "";
    box-sizing: border-box;
    position: absolute;
    border: solid var(--secondary-color);
    border-width: 0 var(--arrow-stroke) var(--arrow-stroke) 0;
    display: inline-block;
    top: -3px;
    right: 3px;
    transition: 0.2s;
    padding: 3px;
    transform: rotate(-45deg);
  }

  button:hover {
    background-color: var(--hover-color);
  }

  button:hover .arrow {
    background: var(--secondary-color);
  }

  button:hover .arrow:before {
    right: 0;
  }
`;

// Updated Checkbox Component (made reusable with props)
const Checkbox = ({ checked, onChange, label }) => {
  return (
    <StyledCheckboxWrapper>
      <label className="checkbox-container">
        <input
          className="custom-checkbox"
          type="checkbox"
          checked={checked}
          onChange={onChange}
        />
        <span className="checkmark" />
        {label && <span className="checkbox-label">{label}</span>}
      </label>
    </StyledCheckboxWrapper>
  );
};

const StyledCheckboxWrapper = styled.div`
  .checkbox-container {
    display: inline-block;
    position: relative;
    padding-left: 35px;
    margin-bottom: 12px;
    cursor: pointer;
    font-size: 16px;
    user-select: none;
  }

  .custom-checkbox {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 25px;
    width: 25px;
    background-color: #eee;
    border-radius: 4px;
    transition: background-color 0.3s;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  }

  .checkmark:after {
    content: "";
    position: absolute;
    display: none;
    left: 9px;
    top: 5px;
    width: 5px;
    height: 10px;
    border: solid white;
    border-width: 0 3px 3px 0;
    transform: rotate(45deg);
  }

  .custom-checkbox:checked ~ .checkmark {
    background-color: #2196f3;
    box-shadow: 0 3px 7px rgba(33, 150, 243, 0.3);
  }

  .custom-checkbox:checked ~ .checkmark:after {
    display: block;
  }

  @keyframes checkAnim {
    0% {
      height: 0;
    }
    100% {
      height: 10px;
    }
  }

  .custom-checkbox:checked ~ .checkmark:after {
    animation: checkAnim 0.2s forwards;
  }

  .checkbox-label {
    margin-left: 10px;
    color: #333;
  }
`;

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: location.state?.selectedRole || "Tenant",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast.error("Please Fill the Input Fields!");
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        formData
      );
      console.log(response.data);
      toast.success("Signup successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message || "Signup failed. Please try again."
      );
    }
  };

  return (
    <div
      style={{
        background: "#e3f2fd",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <Toaster />
      <MDBContainer fluid className="p-0">
        <MDBRow className="g-0">
          <MDBCol
            md="6"
            className="d-none d-md-flex align-items-center justify-content-center"
          >
            <div
              style={{
                backgroundImage:
                  "url('https://www.gofivestarpm.com/images/blog/rental%20property%20inspections.jpg')",
                backgroundSize: "cover",
                backgroundPosition: "center",
                height: "100vh",
                width: "100%",
                borderRadius: "20px 0 0 20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
              }}
            ></div>
          </MDBCol>
          <MDBCol
            md="6"
            className="d-flex align-items-center justify-content-center"
          >
            <MDBCard
              className="shadow-lg"
              style={{
                borderRadius: "20px",
                maxWidth: "450px",
                width: "100%",
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(10px)",
                border: "none",
              }}
            >
              <MDBCardBody className="p-5">
                <div className="text-center mb-5">
                  <h2 className="fw-bold text-dark mb-2">Sign Up Now</h2>
                  <p className="text-muted">Create your account</p>
                </div>

                <form onSubmit={handleSubmit}>
                  <MDBRow>
                    <MDBCol col="6">
                      <MDBInput
                        wrapperClass="mb-4"
                        label="First name"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        aria-label="First name"
                        style={{
                          borderRadius: "10px",
                          border: "1px solid #ddd",
                          padding: "12px 15px",
                        }}
                      />
                    </MDBCol>
                    <MDBCol col="6">
                      <MDBInput
                        wrapperClass="mb-4"
                        label="Last name"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        aria-label="Last name"
                        style={{
                          borderRadius: "10px",
                          border: "1px solid #ddd",
                          padding: "12px 15px",
                        }}
                      />
                    </MDBCol>
                  </MDBRow>

                  <MDBInput
                    wrapperClass="mb-4"
                    label="Email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    aria-label="Email"
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      padding: "12px 15px",
                    }}
                  />

                  <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <MDBInput
                      wrapperClass="mb-0"
                      label="Password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      aria-label="Password"
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        padding: "12px 45px 12px 15px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#666",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#333")}
                      onMouseLeave={(e) => (e.target.style.color = "#666")}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </button>
                  </div>

                  <select
                    className="form-select mb-4"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    aria-label="Select role"
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      padding: "12px 15px",
                    }}
                  >
                    <option value="Tenant">Tenant</option>
                    <option value="Manager">Manager</option>
                    <option value="Admin">Admin</option>
                  </select>

                  {/* Replaced the old checkbox with the custom Checkbox component */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <Checkbox
                      checked={acceptTerms}
                      onChange={(e) => setAcceptTerms(e.target.checked)}
                      label={
                        <>
                          I accept the{" "}
                          <a
                            href="#"
                            style={{
                              color: "#1976d2",
                              textDecoration: "underline",
                            }}
                            onClick={(e) => e.preventDefault()}
                          >
                            Terms and Conditions
                          </a>
                        </>
                      }
                    />
                  </div>

                  <Button onClick={handleSubmit}>Sign up</Button>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-0">
                    Already have an account?{" "}
                    <span
                      style={{
                        color: "#1976d2",
                        cursor: "pointer",
                        fontWeight: "bold",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate("/login")}
                    >
                      Login
                    </span>
                  </p>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
};

export default Signup;
