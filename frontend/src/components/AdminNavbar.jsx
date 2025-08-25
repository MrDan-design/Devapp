import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { FaSignOutAlt } from "react-icons/fa";

// src/components/AdminNavbar.jsx
const AdminNavbar = () => {
  const navigate = useNavigate();

  const handleSignOut = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm"
      style={{ marginLeft: "250px", height: "70px", zIndex: 1030, position: "fixed", top: 0, right: 0, left: 250 }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        <span className="navbar-brand text-primary fw-bold">TESLA Admin</span>
        <div className="d-flex align-items-center gap-3">
          <span className="me-2 text-secondary small">Admin</span>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={handleSignOut}
            title="Sign Out"
          >
            <FaSignOutAlt />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;