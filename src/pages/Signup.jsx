import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate, useLocation } from "react-router-dom";
// Icons import karein (React Icons install hona chahiye: npm install react-icons)
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

const Signup = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // 1. Password visibility ki state
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: location.state?.selectedRole || "Tenant", // Default role agar khali ho
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8000/api/auth/register",
        formData
      );
      console.log(response.data);
      toast.success("Signup successful!");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <MDBContainer fluid className="vh-100" style={{ overflowY: "hidden" }}>
      <Toaster />
      <MDBRow className="d-flex justify-content-center align-items-center h-100">
        <MDBCol col="6">
          <MDBCard
            className="my-5 cascading-right"
            style={{
              background: "hsla(0, 0%, 100%, 0.55)",
              backdropFilter: "blur(30px)",
            }}
          >
            <MDBCardBody className="p-5 shadow-5 text-center">
              <h2 className="fw-bold mb-5">Sign up now</h2>

              <form onSubmit={handleSubmit}>
                <MDBRow>
                  <MDBCol col="6">
                    <MDBInput
                      wrapperClass="mb-4"
                      label="First name"
                      name="firstName"
                      type="text"
                      onChange={handleChange}
                      required
                    />
                  </MDBCol>

                  <MDBCol col="6">
                    <MDBInput
                      wrapperClass="mb-4"
                      label="Last name"
                      name="lastName"
                      type="text"
                      onChange={handleChange}
                      required
                    />
                  </MDBCol>
                </MDBRow>

                <MDBInput
                  wrapperClass="mb-4"
                  label="Email"
                  name="email"
                  type="email"
                  onChange={handleChange}
                  required
                />

                {/* 2. Password Input with Toggle Icon */}
                <div style={{ position: "relative" }}>
                  <MDBInput
                    wrapperClass="mb-4"
                    label="Password"
                    name="password"
                    // Conditional type: password ya text
                    type={showPassword ? "text" : "password"}
                    onChange={handleChange}
                    required
                  />
                  {/* Eye Icon Button */}
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

                <select
                  className="form-select mb-4"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="Tenant">Tenant</option>
                  <option value="Manager">Manager</option>
                  <option value="Admin">Admin</option>
                </select>

                <MDBBtn className="w-100 mb-4" size="md" type="submit">
                  sign up
                </MDBBtn>
              </form>

              <div className="text-center">
                <p>
                  Already have an account?
                  <span
                    style={{
                      color: "#1266f1",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                    onClick={() => navigate("/login")}
                  >
                    {" "}
                    Login
                  </span>
                </p>
              </div>
            </MDBCardBody>
          </MDBCard>
        </MDBCol>

        <MDBCol col="6">
          <img
            src="https://www.gofivestarpm.com/images/blog/rental%20property%20inspections.jpg"
            className="w-100 rounded-4 shadow-4"
            alt="Signup Illustration"
          />
        </MDBCol>
      </MDBRow>
    </MDBContainer>
  );
};

export default Signup;
