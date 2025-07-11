import { useState } from "react";
import { Menu } from "lucide-react";

const AdminNavbar = ({ toggleSidebar }) => {
  return (
    <div className="flex items-center justify-between bg-white shadow px-4 py-3 lg:px-6">
      {/* Hamburger menu only on small screens */}
      <button
        onClick={toggleSidebar}
        className="text-[#6425FE] text-2xl lg:hidden"
      >
        <Menu />
      </button>

      <div className="text-xl font-bold text-[#6425FE]">
        TESLA Admin
      </div>
    </div>
  );
};


export default AdminNavbar;