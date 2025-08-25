import React from "react";
// UserLayout.jsx

import { useState, useEffect } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import "./UserLayout.css";
import { FaTachometerAlt, FaWallet, FaChartLine, FaMoneyCheckAlt, FaExchangeAlt, FaUserCircle, FaHome, FaCog, FaSignOutAlt } from "react-icons/fa";
import SearchBar from "../layout/SearchBar";
import ChatWidget from '../components/ChatWidget';
import lgNow from '../assets/rf-lg.png';

const navLinks = [
  { name: "Home", path: "/", icon: <FaHome /> },
  { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
  { name: "Portfolio", path: "/portfolio", icon: <FaChartLine /> },
  { name: "Transactions", path: "/transactions", icon: <FaMoneyCheckAlt /> },
  { name: "Fund Wallet", path: "/fundwallet", icon: <FaWallet /> },
  { name: "Investment", path: "/invest", icon: <FaExchangeAlt /> },
  { name: "Settings", path: "/settings", icon: <FaCog /> },
];

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // Function to decode JWT token
  const decodeToken = (token) => {
    try {
      const payload = token.split('.')[1];
      const decoded = atob(payload);
      return JSON.parse(decoded);
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      // Decode token to get user ID
      const decodedToken = decodeToken(token);
      if (decodedToken?.id) {
        setUser({ id: decodedToken.id });
      }

      fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.fullname) {
            setUserName(data.fullname);
            setProfileImage(data.profile_image);
            // Update user object with complete data
            setUser(prev => ({ 
              ...prev, 
              id: prev?.id || decodedToken?.id,
              fullname: data.fullname,
              profileImage: data.profile_image 
            }));
          }
        })
        .catch((err) => console.error("Fetch profile error:", err));
    }
  }, []);
  
  const initial = userName?.charAt(0).toUpperCase();

  return (
    <div className="user-layout">
      {/* Top Navbar */}
      <nav className="top-navbar">
        <div className="d-flex align-items-center gap-3">
          <button
            className="btn d-lg-none"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <img
            src={lgNow}
            alt="Tesla Wallet Logo"
            className="logo"
          />
          <span className="fw-bold d-none d-md-inline">Tesla Wallet</span>
        </div>

        <div className="d-none d-md-block">
          <SearchBar />
        </div>

        <div className="d-flex align-items-center gap-2">
          {profileImage ? (
            <img
              src={profileImage}
              alt="Profile"
              className="rounded-circle"
            />
          ) : (
            <div className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold">
              {initial}
            </div>
          )}
          <span className="fw-medium d-none d-lg-inline">
            {userName || "User"}
          </span>
          <button
            className="btn btn-outline-danger btn-sm ms-2"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </nav>

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="mobile-overlay" onClick={toggleSidebar} />}
      
      {/* Sidebar */}
      <nav className={`user-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="p-3">
          <ul className="nav flex-column">
            {navLinks.map((link) => (
              <li key={link.path} className="nav-item">
                <Link
                  to={link.path}
                  onClick={() => {
                    if (window.innerWidth < 992) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`nav-link ${
                    location.pathname === link.path ? "bg-danger text-white" : ""
                  }`}
                >
                  <span className="fs-5">{link.icon}</span>
                  <span className="d-none d-lg-inline">{link.name}</span>
                  {sidebarOpen && <span className="d-lg-none">{link.name}</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Chat Widget */}
      <ChatWidget user={user} />
    </div>
  );
};

export default UserLayout;
