// src/layouts/AdminLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar block with gap to main content */}
      <aside className="bg-white shadow-md min-h-screen p-6">
        <Sidebar />
      </aside>

      {/* Gap between sidebar and main content */}
      <div className="flex-1 px-6 py-6">
        {/* Navbar area */}
        <header className="bg-white shadow rounded-md p-4 mb-6">
          <AdminNavbar />
        </header>

        {/* Page content */}
        <main className="bg-white shadow rounded-md p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;