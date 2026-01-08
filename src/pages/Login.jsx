import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
// Icons Import karein
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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  // Added role state for the dropdown
  const [role, setRole] = useState("Tenant");
  const navigate = useNavigate();

  // const handleLogin = async (e) => {
  //   e.preventDefault();
  //   try {
  //     const res = await axios.post("http://localhost:8000/api/auth/login", {
  //       email,
  //       password,
  //     });
  //     localStorage.setItem("token", res.data.token);
  //     localStorage.setItem("userRole", res.data.user.role);
  //     localStorage.setItem("userId", res.data.user.id);
  //     localStorage.setItem("userName", res.data.user.name);
  //     toast.success("Access Granted!");

  //     setTimeout(() => {
  //       if (res.data.user.role === "Admin") navigate("/admin-dashboard");
  //       else if (res.data.user.role === "Manager")
  //         navigate("/manager-dashboard");
  //       else navigate("/tenant-dashboard");
  //     }, 1000);
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Access Denied!");
  //   }
  // };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });
      // Check if selected role matches the user's actual role
      if (role !== res.data.user.role) {
        toast.error(
          `Access Denied! Please login as: "${res.data.user.role}".`
        );
        return; 
      }
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.name);
      toast.success("Access Granted!");

      setTimeout(() => {
        if (res.data.user.role === "Admin") navigate("/admin-dashboard");
        else if (res.data.user.role === "Manager")
          navigate("/manager-dashboard");
        else navigate("/tenant-dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Access Denied!");
    }
  };
  return (
    <div
      style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                borderRadius: "0 20px 20px 0",
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
                  <h2 className="fw-bold text-dark mb-2">Welcome Back</h2>
                  <p className="text-muted">Sign in to your account</p>
                </div>
                <form onSubmit={handleLogin}>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #ddd",
                      padding: "12px 15px",
                    }}
                  />

                  {/* Password Input with Icons */}
                  <div style={{ position: "relative", marginBottom: "1.5rem" }}>
                    <MDBInput
                      wrapperClass="mb-0"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      style={{
                        borderRadius: "10px",
                        border: "1px solid #ddd",
                        padding: "12px 45px 12px 15px",
                      }}
                    />
                    {/* Icon Toggle Button */}
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => (e.target.style.color = "#333")}
                      onMouseLeave={(e) => (e.target.style.color = "#666")}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </span>
                  </div>

                  {/* Added Role Dropdown (same as Signup) */}
                  <select
                    className="form-select mb-4"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
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

                  <Button />
                </form>
                <div className="text-center">
                  <p className="text-muted mb-0">
                    New here?{" "}
                    <span
                      style={{
                        color: "#667eea",
                        cursor: "pointer",
                        fontWeight: "bold",
                        textDecoration: "underline",
                      }}
                      onClick={() => navigate("/signup")}
                    >
                      Create Account
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

const Button = () => {
  return (
    <StyledWrapper>
      <div className="container">
        <button type="submit" className="button type--C">
          <div className="button__line" />
          <div className="button__line" />
          <span className="button__text">Sign In</span>
          <div className="button__drow1" />
          <div className="button__drow2" />
        </button>
      </div>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  .type--A {
    --line_color: #555555;
    --back_color: #ffecf6;
  }
  .type--B {
    --line_color: #1b1919;
    --back_color: #e9ecff;
  }
  .type--C {
    --line_color: #00135c;
    --back_color: #defffa;
  }
  .button {
    position: relative;
    z-index: 0;
    width: 100%; /* Changed from 240px to 100% for full width */
    height: 56px;
    text-decoration: none;
    font-size: 14px;
    font-weight: bold;
    color: var(--line_color);
    letter-spacing: 2px;
    transition: all 0.3s ease;
    border: none;
    background: transparent;
    cursor: pointer;
    justify-content: center; /* Ensures content is centered inside */
  }
  .button__text {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
  }
  .button::before,
  .button::after,
  .button__text::before,
  .button__text::after {
    content: "";
    position: absolute;
    height: 3px;
    border-radius: 2px;
    background: var(--line_color);
    transition: all 0.5s ease;
  }
  .button::before {
    top: 0;
    left: 54px;
    width: calc(100% - 56px * 2 - 16px);
  }
  .button::after {
    top: 0;
    right: 54px;
    width: 8px;
  }
  .button__text::before {
    bottom: 0;
    right: 54px;
    width: calc(100% - 56px * 2 - 16px);
  }
  .button__text::after {
    bottom: 0;
    left: 54px;
    width: 8px;
  }
  .button__line {
    position: absolute;
    top: 0;
    width: 56px;
    height: 100%;
    overflow: hidden;
  }
  .button__line::before {
    content: "";
    position: absolute;
    top: 0;
    width: 150%;
    height: 100%;
    box-sizing: border-box;
    border-radius: 300px;
    border: solid 3px var(--line_color);
  }
  .button__line:nth-child(1),
  .button__line:nth-child(1)::before {
    left: 0;
  }
  .button__line:nth-child(2),
  .button__line:nth-child(2)::before {
    right: 0;
  }
  .button:hover {
    letter-spacing: 6px;
  }
  .button:hover::before,
  .button:hover .button__text::before {
    width: 8px;
  }
  .button:hover::after,
  .button:hover .button__text::after {
    width: calc(100% - 56px * 2 - 16px);
  }
  .button__drow1,
  .button__drow2 {
    position: absolute;
    z-index: -1;
    border-radius: 16px;
    transform-origin: 16px 16px;
  }
  .button__drow1 {
    top: -16px;
    left: 40px;
    width: 32px;
    height: 0;
    transform: rotate(30deg);
  }
  .button__drow2 {
    top: 44px;
    left: 77px;
    width: 32px;
    height: 0;
    transform: rotate(-127deg);
  }
  .button__drow1::before,
  .button__drow1::after,
  .button__drow2::before,
  .button__drow2::after {
    content: "";
    position: absolute;
  }
  .button__drow1::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-60deg);
  }
  .button__drow1::after {
    top: -10px;
    left: 45px;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(69deg);
  }
  .button__drow2::before {
    bottom: 0;
    left: 0;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-146deg);
  }
  .button__drow2::after {
    bottom: 26px;
    left: -40px;
    width: 0;
    height: 32px;
    border-radius: 16px;
    transform-origin: 16px 16px;
    transform: rotate(-262deg);
  }
  .button__drow1,
  .button__drow1::before,
  .button__drow1::after,
  .button__drow2,
  .button__drow2::before,
  .button__drow2::after {
    background: var(--back_color);
  }
  .button:hover .button__drow1 {
    animation: drow1 ease-in 0.06s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow1::before {
    animation: drow2 linear 0.08s 0.06s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow1::after {
    animation: drow3 linear 0.03s 0.14s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2 {
    animation: drow4 linear 0.06s 0.2s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2::before {
    animation: drow3 linear 0.03s 0.26s;
    animation-fill-mode: forwards;
  }
  .button:hover .button__drow2::after {
    animation: drow5 linear 0.06s 0.32s;
    animation-fill-mode: forwards;
  }
  @keyframes drow1 {
    0% {
      height: 0;
    }
    100% {
      height: 100px;
    }
  }
  @keyframes drow2 {
    0% {
      width: 0;
      opacity: 0;
    }
    10% {
      opacity: 0;
    }
    11% {
      opacity: 1;
    }
    100% {
      width: 120px;
    }
  }
  @keyframes drow3 {
    0% {
      width: 0;
    }
    100% {
      width: 80px;
    }
  }
  @keyframes drow4 {
    0% {
      height: 0;
    }
    100% {
      height: 120px;
    }
  }
  @keyframes drow5 {
    0% {
      width: 0;
    }
    100% {
      width: 124px;
    }
  }

  .container {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }
  .button:not(:last-child) {
    margin-bottom: 64px;
  }
`;

export default Login;
