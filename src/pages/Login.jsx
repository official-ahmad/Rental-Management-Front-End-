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

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // Password visibility state
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:8000/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userRole", res.data.user.role);
      toast.success("Login Successful!");

      setTimeout(() => {
        if (res.data.user.role === "Admin") navigate("/admin-dashboard");
        else if (res.data.user.role === "Manager")
          navigate("/manager-dashboard");
        else navigate("/tenant-dashboard");
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login Failed");
    }
  };

  return (
    <MDBContainer fluid className="vh-100">
      <Toaster />
      <MDBRow className="d-flex justify-content-center align-items-center h-100">
        <MDBCol col="6">
          <MDBCard className="p-5 shadow-5">
            <MDBCardBody>
              <h2 className="fw-bold mb-5 text-center">Login</h2>
              <form onSubmit={handleLogin}>
                <MDBInput
                  wrapperClass="mb-4"
                  label="Email address"
                  type="email"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Password Input with Icons */}
                <div style={{ position: "relative" }}>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {/* Icon Toggle Button */}
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: "15px",
                      top: "10px",
                      cursor: "pointer",
                      zIndex: 10,
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

                <MDBBtn className="w-100 mb-4" size="md" type="submit">
                  Sign In
                </MDBBtn>
              </form>
              <p className="text-center">
                New here?{" "}
                <span
                  style={{ color: "#1266f1", cursor: "pointer" }}
                  onClick={() => navigate("/signup")}
                >
                  Create Account
                </span>
              </p>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>
        <MDBCol col="6" className="d-none d-md-block">
          <img
            src="https://www.gofivestarpm.com/images/blog/rental%20property%20inspections.jpg"
            className="w-100 vh-100"
            style={{ objectFit: "cover" }}
            alt="login"
          />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Login;
