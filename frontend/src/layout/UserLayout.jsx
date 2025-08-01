import React from "react";
// UserLayout.jsx

import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./UserLayout.css";
import { FaTachometerAlt, FaWallet, FaChartLine, FaMoneyCheckAlt, FaExchangeAlt, FaUserCircle } from "react-icons/fa";
import SearchBar from "../layout/SearchBar";
import ChatWidget from '../components/ChatWidget';
import lgNow from '../assets/rf-lg.png';

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
  { name: "Portfolio", path: "/portfolio", icon: <FaChartLine /> },
  { name: "Transactions", path: "/transactions", icon: <FaMoneyCheckAlt /> },
  { name: "Fund Wallet", path: "/fundwallet", icon: <FaWallet /> },
  { name: "Investment", path: "/invest", icon: <FaExchangeAlt /> },
];

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [user, setUser] = useState(null);
  const location = useLocation();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
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
    <div className="user-layout d-flex flex-column min-vh-100 bg-light">
      {/* Top Navbar */}
<div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-white position-fixed top-navbar w-100">
  <div className="d-flex align-items-center gap-3">
    <img
      src={lgNow}
      alt="Logo"
      className="logo"
      style={{ width: "40px", height: "40px" }}
    />
    <span className="fw-bold text-dark fs-5">Tesla Wallet</span>
  </div>

  <SearchBar />

  <div className="d-flex align-items-center gap-3">
    <div className="d-flex align-items-center gap-2">
      {profileImage ? (
        <img
          src={profileImage}
          alt="Profile"
          className="rounded-circle border border-2 border-danger"
          style={{ width: "40px", height: "40px", objectFit: "cover" }}
        />
      ) : (
        <div
          className="rounded-circle bg-danger text-white d-flex align-items-center justify-content-center fw-bold border border-2 border-danger"
          style={{ width: "40px", height: "40px" }}
        >
          {initial}
        </div>
      )}
      <span className="text-dark fw-medium d-none d-md-inline">
        {userName || "User"}
      </span>
    </div>

    <button
      className="btn d-lg-none"
      onClick={toggleSidebar}
      style={{ 
        border: "none", 
        background: "transparent",
        fontSize: "1.5rem",
        color: "#333",
        minWidth: "44px",
        minHeight: "44px"
      }}
      aria-label="Toggle sidebar"
    >
      ☰
    </button>
  </div>
</div>

      {/* Main Content Area */}
      <div className="d-flex flex-grow-1" style={{ marginTop: "70px" }}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div 
            className="d-lg-none position-fixed w-100 h-100"
            style={{
              top: 0,
              left: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 999
            }}
            onClick={toggleSidebar}
          />
        )}
        
        {/* Sidebar */}
        <nav
          className={`user-sidebar bg-white border-end ${
            sidebarOpen ? "open" : ""
          }`}
          style={{
            width: sidebarOpen ? "250px" : "70px",
            transition: "width 0.3s ease",
            position: "fixed",
            height: "calc(100vh - 70px)",
            top: "70px",
            zIndex: 1200,
          }}
        >
          <div className="p-3">
            <ul className="nav flex-column">
              {navLinks.map((link) => (
                <li key={link.path} className="nav-item mb-2">
                  <Link
                    to={link.path}
                    onClick={() => {
                      // Close sidebar on mobile after clicking a link
                      if (window.innerWidth < 992) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`nav-link d-flex align-items-center gap-3 rounded p-3 text-decoration-none ${
                      location.pathname === link.path
                        ? "bg-danger text-white"
                        : "text-dark hover-bg-light"
                    }`}
                  >
                    <span className="fs-5">{link.icon}</span>
                    {sidebarOpen && <span>{link.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main
          className="flex-grow-1 p-4"
          style={{
            marginLeft: sidebarOpen ? "250px" : "70px",
            transition: "margin-left 0.3s ease",
          }}
        >
          <Outlet />
        </main>
      </div>

      {/* Chat Widget */}
      <ChatWidget user={user} />
    </div>
  );
};

export default UserLayout;
