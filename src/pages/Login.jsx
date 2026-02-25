import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Tenant");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });

      if (role !== res.data.user.role) {
        toast.error(
          `Access Denied! Use correct role: "${res.data.user.role}".`,
        );
        return;
      }

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);
      localStorage.setItem("userId", res.data.user._id);
      localStorage.setItem("userName", res.data.user.name);

      toast.success(`Welcome ${res.data.user.name}!`);

      setTimeout(() => {
        const targetDashboard = `/${res.data.user.role.toLowerCase()}-dashboard`;
        navigate(targetDashboard);
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed!");
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
                  />
                  <div style={{ position: "relative" }}>
                    <MDBInput
                      wrapperClass="mb-0"
                      label="Password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <span
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "15px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                        color: "#666",
                      }}
                    >
                      {showPassword ? (
                        <FaEyeSlash size={20} />
                      ) : (
                        <FaEye size={20} />
                      )}
                    </span>
                  </div>

                  {/* --- FORGOT PASSWORD LINK ADDED --- */}
                  <div className="text-end mb-4 mt-2">
                    <span
                      onClick={() => navigate("/forgot-password")}
                      style={{
                        color: "#667eea",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        fontWeight: "500",
                      }}
                    >
                      Forgot Password?
                    </span>
                  </div>

                  <select
                    className="form-select mb-4"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    style={{ borderRadius: "10px", padding: "12px 15px" }}
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

const Button = () => (
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

const StyledWrapper = styled.div`
  .type--C {
    --line_color: #00135c;
    --back_color: #defffa;
  }
  .button {
    position: relative;
    z-index: 0;
    width: 100%;
    height: 56px;
    font-size: 14px;
    font-weight: bold;
    color: var(--line_color);
    letter-spacing: 2px;
    transition: all 0.3s ease;
    border: none;
    background: transparent;
    cursor: pointer;
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
    background: var(--back_color);
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
  .button:hover .button__drow1 {
    animation: drow1 ease-in 0.06s forwards;
  }
  .button:hover .button__drow2 {
    animation: drow4 linear 0.06s 0.2s forwards;
  }
  @keyframes drow1 {
    0% {
      height: 0;
    }
    100% {
      height: 100px;
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
  .container {
    width: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    margin-bottom: 1.5rem;
  }
`;

export default Login;
