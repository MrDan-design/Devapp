import { useState } from "react";
import { Menu } from "lucide-react";

// src/components/AdminNavbar.jsx
const AdminNavbar = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom px-4 md-4 py-3 shadow-sm">
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <span className="navbar-brand text-primary fw-bold">TESLA Admin</span>
        <div className="d-flex align-items-center">
          <span className="me-2 me-md-3 text-secondary small small-md">Admin</span>
          <img
            src="https://via.placeholder.com/40"
            alt="Admin"
            className="rounded-circle"
            width="36"
            height="36"
          />
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;