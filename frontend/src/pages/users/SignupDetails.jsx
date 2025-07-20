// src/pages/SignupDetails.jsx
import React, { use } from 'react';
import { Link } from 'react-router-dom';
import './Signup.css'; // optional for custom styles
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import SideImage from '../../assets/Illustration.png'; 
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';

const SignupDetails = () => {
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: emailFromUrl,
    phoneNumber: "",
    country: "",
    currency: "",
    nextOfKin: "",
    nextOfKinNumber: "",
    password: "",
    confirmPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData, [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/signup`, formData);
      setMessage("Account created successfully!");
      setLoading(false);

      // Redirect to login page
      navigate("/login");
    } catch (err) {
      setMessage(err.response?.data?.message || "Signup failed.");
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <div className="signup-page">
      <div className="container">
        <div className="row justify-content-center">
          {/* White Form Box */}
          <div className="col-lg-10 bg-white rounded p-4 d-flex flex-column flex-lg-row align-items-start signup-card">
            
            {/* Left side: Form Fields */}
            <div className="flex-grow-1 pe-lg-5">
              <h3 className="mb-2">Create Account</h3>
              <p className="small text-muted">
                Already have an account? <a href="/login">Login</a>
              </p>

              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label>Full Name</label>
                    <input type="text" className="form-control" name="fullname" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Email</label>
                    <input type="email" className="form-control" name="email" value={formData.email} readOnly />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Phone Number</label>
                    <input type="text" className="form-control" name="phone" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Country</label>
                    <input type="text" className="form-control" name="country" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Currency</label>
                    <input type="text" className="form-control" name="currency" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Next of Kin</label>
                    <input type="text" className="form-control" name="nextOfKin" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Next of Kin Number</label>
                    <input type="text" className="form-control" name="nextOfKinNumber" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Password</label>
                    <input type="password" className="form-control" name="password" onChange={handleChange} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label>Confirm Password</label>
                    <input type="password" className="form-control" name="confirmPassword" onChange={handleChange} required />
                  </div>
                </div>

                <button type="submit" className="btn btn-danger w-100 mt-2" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            </div>

            {/* Right side: PNG image inside the white form */}
            <div className="d-none d-lg-block ps-4">
              <img src={SideImage} alt="Decor" className="img-fluid rounded animate-png" style={{ maxWidth: '250px', height: 'auto', }} />
            </div>
          </div>
        </div>
      </div>
    </div>
    </PageWrapper>
  );
};

export default SignupDetails;
