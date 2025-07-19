import { useState } from "react";
import { Menu } from "lucide-react";

// src/components/AdminNavbar.jsx
const AdminNavbar = () => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light bg-white border-bottom shadow-sm"
      style={{ marginLeft: "250px", height: "70px", zIndex: 1030, position: "fixed", top: 0, right: 0, left: 250 }}
    >
      <div className="container-fluid d-flex justify-content-between align-items-center px-4">
        <span className="navbar-brand text-primary fw-bold">TESLA Admin</span>
        <span className="me-2 text-secondary small">Admin</span>
      </div>
    </nav>
  );
};

export default AdminNavbar;