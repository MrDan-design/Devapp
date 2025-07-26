import React from "react";
// UserLayout.jsx

import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import "./UserLayout.css";
import { FaTachometerAlt, FaWallet, FaChartLine, FaMoneyCheckAlt, FaExchangeAlt, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import SearchBar from "../layout/SearchBar";
import ChatWidget from '../components/ChatWidget';
import lgNow from '../assets/rf-lg.png';

const navLinks = [
  { name: "Dashboard", path: "/dashboard", icon: <FaTachometerAlt /> },
  { name: "Portfolio", path: "/portfolio", icon: <FaChartLine /> },
  { name: "Invest in Shares", path: "/invest", icon: <FaMoneyCheckAlt /> },
  { name: "Wallet Transfer Pay", path: "/fundwallet?tab=fund", icon: <FaWallet /> },
  { name: "Transactions", path: "/transactions", icon: <FaExchangeAlt /> },
];

const user = JSON.parse(localStorage.getItem('user'));

const getBadgeIconAndColor = (plan) => {
  switch (plan) {
    case 'Megapack Momentum':
      return { icon: '⭐', color: 'text-primary' }; // blue star
    case 'Xploration Zenith':
      return { icon: '⭐', color: 'text-info' };    // teal star
    case 'Hyperloop Horizon':
      return { icon: '⭐', color: 'text-success' }; // green star
    case 'Falcon Flight':
      return { icon: '⭐', color: 'text-warning' }; // yellow star
    case 'Boring Blueprint':
      return { icon: '⭐', color: 'text-secondary' }; // gray star
    default:
      return null;
  }
};

const UserLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState("");
  const [profileImage, setProfileImage] = useState("");
  const [userPlan, setUserPlan] = useState("");
  const location = useLocation();

  const navigate = useNavigate();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

    useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetch(`${import.meta.env.VITE_API_BASE_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.fullname) {
            setUserName(data.fullname);
            setProfileImage(data.profile_image);
            setUserPlan(data.plan); // Set user’s plan here
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
      style={{ height: "30px", marginLeft: "30px" }}
    />
    <div className="d-flex align-items-center" style={{ marginLeft: "80px" }}>
      <h5 className="mb-0 fw-bold">Hello {userName}, Welcome back!</h5>
      {userPlan && getBadgeIconAndColor(userPlan) && (
        <span className={`ms-2 ${getBadgeIconAndColor(userPlan).color}`} title={userPlan}>
        {getBadgeIconAndColor(userPlan).icon}
        </span>
      )}
    </div>
  </div>

  <div className="d-flex align-items-center gap-3" style={{ maxWidth: 400 }}>
    <SearchBar />

    <div
      className="d-flex align-items-center"
      style={{ cursor: "pointer" }}
      onClick={() => navigate("/profile/edit")}
    >
      {profileImage ? (
        <img
          src={profileImage}
          alt="Avatar"
          className="rounded-circle"
          width={32}
          height={32}
          style={{ objectFit: "cover" }}
        />
      ) : userName ? (
        <div
          className="rounded-circle bg-secondary text-white d-flex justify-content-center align-items-center"
          style={{ width: "32px", height: "32px", fontSize: "16px" }}
        >
          {initial}
        </div>
      ) : (
        <FaUserCircle size={32} color="#999" />
      )}
    </div>

    <button
      className="btn d-md-none"
      onClick={toggleSidebar}
      aria-label="Toggle Sidebar"
    >
      <i className="bi bi-list" style={{ fontSize: "1.5rem" }}></i>
    </button>
  </div>
</div>


      {/* Layout Body */}
<div className="d-flex" style={{ paddingTop: "60px" }}>
  {/* Sidebar */}
  <div
    className={`user-sidebar shadow-sm d-none d-md-block ${sidebarOpen ? "open" : ""}`}
  >
    <ul className="nav flex-column">
      {navLinks.map((link) => (
        <li className="nav-item" key={link.path}>
          <Link
            to={link.path}
            className={`nav-link d-flex align-items-center gap-2 px-2 ${
              location.pathname === link.path ? "active-link" : "inactive-link"
            }`}
            onClick={() => setSidebarOpen(false)}
          >
            {React.cloneElement(link.icon, {
              color: location.pathname === link.path ? "red" : "black",
            })}
            {link.name}
          </Link>
        </li>
      ))}
    </ul>

    <div className="mt-5 bg-light p-2 rounded">
      <small className="text-muted">
        💡 Tip: Invest steadily and monitor your growth weekly.
      </small>
    </div>
  </div>

  {/* Main Content */}
  <div className="flex-grow-1 p-4" style={{ marginLeft: "250px" }}>
    <Outlet />
    {user && <ChatWidget user={user} />}
  </div>
</div>
    </div>
  );
};

export default UserLayout;
