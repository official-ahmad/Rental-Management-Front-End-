import React, { useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash, FaLock, FaTimes } from "react-icons/fa";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBRow,
  MDBCol,
} from "mdb-react-ui-kit";
import styled from "styled-components";
import { API, API_BASE_URL } from "../config/api";

const Login = () => {
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(location.state?.selectedRole || "Tenant");
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminAccessKey, setAdminAccessKey] = useState("");
  const [isAdminVerified, setIsAdminVerified] = useState(
    location.state?.selectedRole === "Admin" ||
      location.state?.selectedRole === "Manager",
  );
  const navigate = useNavigate();

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
    if (selectedRole === "Admin" && !isAdminVerified) {
      setShowAdminModal(true);
    }
  };

  const verifyAdminAccess = async () => {
    try {
      const res = await axios.post(
        `${API_BASE_URL}/api/auth/verify-admin-access`,
        {
          accessKey: adminAccessKey,
        },
      );
      if (res.data.success) {
        toast.success("Access Granted!");
        setIsAdminVerified(true);
        setShowAdminModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Access Key!");
      setRole("Tenant");
      setShowAdminModal(false);
      setAdminAccessKey("");
    }
  };

  const closeAdminModal = () => {
    setShowAdminModal(false);
    setRole("Tenant");
    setAdminAccessKey("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Admin uses static credentials - separate API
      if (role === "Admin") {
        const res = await axios.post(`${API_BASE_URL}/api/auth/admin-login`, {
          email,
          password,
        });

        if (res.data.success) {
          localStorage.setItem("token", res.data.token);
          localStorage.setItem("userRole", "Admin");
          localStorage.setItem("userId", res.data.adminId);
          localStorage.setItem("userName", res.data.adminName);

          toast.success(`Welcome ${res.data.adminName}!`);

          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 1000);
        }
        return;
      }

      // Normal login for Tenant and Manager
      const res = await axios.post(API.AUTH.LOGIN, {
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

      {/* Admin Access Modal */}
      {showAdminModal && (
        <AdminModal>
          <ModalContent>
            <CloseButton onClick={closeAdminModal}>
              <FaTimes />
            </CloseButton>
            <div className="modal-icon">
              <FaLock size={40} />
            </div>
            <h3>Admin Access Required</h3>
            <p>Enter the secret access key to continue as Admin</p>
            <input
              type="password"
              placeholder="Enter Access Key"
              value={adminAccessKey}
              onChange={(e) => setAdminAccessKey(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && verifyAdminAccess()}
            />
            <button onClick={verifyAdminAccess}>Verify Access</button>
          </ModalContent>
        </AdminModal>
      )}

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
                    onChange={handleRoleChange}
                    style={{ borderRadius: "10px", padding: "12px 15px" }}
                    disabled={location.state?.selectedRole === "Admin"}
                  >
                    <option value="Tenant">Tenant</option>
                    <option value="Manager">Manager</option>
                    {(isAdminVerified ||
                      location.state?.selectedRole === "Admin") && (
                      <option value="Admin">Admin</option>
                    )}
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

// Admin Access Modal Styles
const AdminModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(5px);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

const ModalContent = styled.div`
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  padding: 40px;
  border-radius: 20px;
  text-align: center;
  max-width: 400px;
  width: 90%;
  position: relative;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  animation: slideUp 0.3s ease;

  @keyframes slideUp {
    from {
      transform: translateY(30px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }

  .modal-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 auto 20px;
    color: white;
  }

  h3 {
    color: #fff;
    font-size: 1.5rem;
    margin-bottom: 10px;
    font-weight: 600;
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 25px;
  }

  input {
    width: 100%;
    padding: 15px 20px;
    border: 2px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1rem;
    margin-bottom: 20px;
    transition: all 0.3s ease;

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    &:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 20px rgba(102, 126, 234, 0.3);
    }
  }

  button {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
    }
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #fff;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: rotate(90deg);
  }
`;

export default Login;
