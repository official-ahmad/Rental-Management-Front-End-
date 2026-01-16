import React, { useState } from "react";
import {
  MDBContainer,
  MDBCard,
  MDBCardBody,
  MDBInput,
  MDBBtn,
} from "mdb-react-ui-kit";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaUnlockAlt } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      toast.success("Demo: Reset link sent to " + email, {
        duration: 4000,
        style: { borderRadius: "10px", background: "#333", color: "#fff" },
      });

      setTimeout(() => navigate("/page"), 3000);
    }, 2000);
  };

  return (
    <div
      style={{ background: "#f1f5f9", minHeight: "100vh" }}
      className="d-flex align-items-center"
    >
      <MDBContainer>
        <Toaster position="top-center" />
        <div className="d-flex justify-content-center">
          <MDBCard
            style={{
              maxWidth: "450px",
              width: "100%",
              borderRadius: "25px",
              border: "none",
            }}
            className="shadow-lg p-3"
          >
            <MDBCardBody className="text-center">
              <div
                className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-4"
                style={{ width: "80px", height: "80px" }}
              >
                <FaUnlockAlt size={35} />
              </div>

              <h3 className="fw-bold text-dark mb-2">Forgot Password?</h3>
              <p className="text-muted mb-4 px-3">
                No worries! Enter your email below and we will send you
                instructions to reset your password.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="text-start mb-4">
                  <label className="form-label small fw-bold text-muted ps-1">
                    Email Address
                  </label>
                  <MDBInput
                    type="email"
                    placeholder="name@example.com"
                    required
                    className="py-2"
                    style={{ borderRadius: "10px" }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <MDBBtn
                  color="primary"
                  block
                  className="rounded-pill py-3 fw-bold shadow-0"
                  style={{ letterSpacing: "1px" }}
                  disabled={loading}
                >
                  {loading ? "Processing..." : "Send Reset Link"}
                </MDBBtn>
              </form>

              <div className="mt-4">
                <button
                  onClick={() => navigate("/page")}
                  className="btn btn-link text-decoration-none text-primary fw-bold"
                >
                  Back to Login
                </button>
              </div>
            </MDBCardBody>
          </MDBCard>
        </div>
      </MDBContainer>
    </div>
  );
};

export default ForgotPassword;
