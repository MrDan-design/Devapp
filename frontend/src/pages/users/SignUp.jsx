import { useState } from "react";
import "./Signup.css"; 
import { useNavigate } from "react-router-dom";
import PageWrapper from "../../components/PageWrapper";

const Signup = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const handleContinue = (e) => {
    e.preventDefault();
    if (email.trim()) {
      navigate(`/signup-details?email=${encodeURIComponent(email)}`);
    }
  };

  return (
    <PageWrapper>
      <div className="signup-wrapper">
      <div className="overlay"></div>

      <div className="signup-form-container">
        <h2 className="text-center fw-bold mb-3">Create Account</h2>
        <p className="text-center text-muted small">
          Already have an account? <a href="/login">Login</a>
        </p>

        <div className="d-grid gap-3 mb-4" style={{ maxWidth: '400px' }}>
  {/* Facebook Signup Button */}
  <a
    href="https://tslaxai-api.onrender.com/api/auth/facebook"
    className="btn btn-light d-flex align-items-center justify-content-center rounded-pill border"
  >
    <img
      src="fb-logo.png"
      alt="Facebook"
      width="24"
      className="me-2"
    />
    Continue with Facebook
  </a>

  {/* Google Signup Button */}
  <a
    href="https://tslaxai-api.onrender.com/api/auth/google"
    className="btn btn-light d-flex align-items-center justify-content-center rounded-pill border"
  >
    <img
      src="google-logo.png"
      alt="Google"
      width="24"
      className="me-2"
    />
    Continue with Google
  </a>
</div>

        <div className="text-center text-muted my-3">OR</div>

      
            <input
              type="email"
              className="form-control mb-3"
              placeholder="Enter your email to sign up"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button className="btn btn-danger w-100" onClick={handleContinue}>
              Create Account
            </button>
      </div>
    </div>
    </PageWrapper>
  );
};

export default Signup;