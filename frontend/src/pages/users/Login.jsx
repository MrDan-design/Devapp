import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import PageWrapper from "../../components/PageWrapper";
import "./Login.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const ADMIN_EMAIL = "teslawallet.tco@gmail.com";

  const togglePassword = () => setShowPassword(!showPassword);

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/users/login`, {
      email,
      password,
    });

    const token = res.data.token;
    const user = res.data.user;
    const isAdmin = user?.is_admin || 0;

    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", token);

    if (email === ADMIN_EMAIL || isAdmin) {
      navigate("/admin");
    }  else {
      navigate("/dashboard");
    }
  } catch (err) {
    console.error("Login failed", err);
    alert("Login failed. Check credentials.");
  }
};


  return (
    <PageWrapper>
      <div className="login-bg">
        <div className="container-fluid">
          <div className="row justify-content-center">
            <div className="login-container">
              <div className="login-form">
                <h3 className="text-center">Welcome Back</h3>
                <p className="text-center text-muted mb-4">Sign in to your account</p>
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Password</label>
                    <div className="input-group">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="form-control"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <span
                        className="input-group-text"
                        onClick={togglePassword}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex justify-content-between mb-4">
                    <a href="/forgot-password" className="small text-muted">
                      Forgot Password?
                    </a>
                  </div>

                  <button type="submit" className="btn btn-danger w-100">
                    Sign In
                  </button>
                </form>

                <p className="text-center mt-3 small text-muted">
                  Don't have an account? <a href="/" className="text-decoration-none">Get Started</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Login;