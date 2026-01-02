// import React, { useState } from "react";
// import axios from "axios";
// import { Toaster, toast } from "react-hot-toast";
// import "./Signup.css";

// import { useNavigate } from "react-router-dom";

// const Signup = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     role: "Tenant",
//   });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await axios.post(
//         "http://localhost:8000/api/auth/register",
//         formData
//       );
//       console.log(response.data);
//       // Ab ye chalay ga
//       toast.success("Signup successful!");
//     } catch (error) {
//       // Error message dikhane ke liye toast use karein alert ki jagah
//       toast.error("Signup failed", error.response.data.message);
//     }
//   };

//   return (
//     <div className="signup-container">
//       {/* 2. Toaster component ko yahan rakhna lazmi hai */}
//       <Toaster position="top-center" reverseOrder={false} />

//       <h2>Create Account</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="text"
//           placeholder="First Name"
//           onChange={(e) =>
//             setFormData({ ...formData, firstName: e.target.value })
//           }
//           required
//         />
//         <input
//           type="text"
//           placeholder="Last Name"
//           onChange={(e) =>
//             setFormData({ ...formData, lastName: e.target.value })
//           }
//           required
//         />
//         <input
//           type="email"
//           placeholder="Email"
//           onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           onChange={(e) =>
//             setFormData({ ...formData, password: e.target.value })
//           }
//           required
//         />

//         <select
//           onChange={(e) => setFormData({ ...formData, role: e.target.value })}
//         >
//           <option value="Tenant">Tenant</option>
//           <option value="Manager">Manager</option>
//           <option value="Admin">Admin</option>
//         </select>

//         <button className=".btn" type="submit">
//           Sign Up
//         </button>
//         <p>
//           Already Have an account?{" "}
//           <span
//             style={{ cursor: "pointer" }}
//             onClick={() => navigate("/login")}
//           >
//             Login
//           </span>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Signup;

import React, { useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    role: "Tenant", // Default role
  });

  // Input change handle karne ka function
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

      // Signup ke baad login par bhej sakte hain
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <MDBContainer fluid className="vh-100" style={{ overflowY: "hidden" }}>
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

                <MDBInput
                  wrapperClass="mb-4"
                  label="Password"
                  name="password"
                  type="password"
                  onChange={handleChange}
                  required
                />

                {/* Role Selection (Logic Integrated) */}

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
