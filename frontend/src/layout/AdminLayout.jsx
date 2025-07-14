// AdminLayout.jsx (Bootstrap version)
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";

const AdminLayout = () => {
  return (
    <div className="container-fluid">
      <div className="row min-vh-100">
        {/* Sidebar */}
        <nav className="col-md-3 col-lg-2 d-md-block bg-white sidebar shadow-sm px-0">
          <Sidebar />
        </nav>

        {/* Main Content */}
        <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 bg-light">
          <header className="py-3 mb-4 border-bottom bg-white">
            <AdminNavbar />
          </header>

          <div className="pt-3">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;