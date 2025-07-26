import { Outlet } from "react-router-dom";
import { useState } from "react"; //  Added!
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../layout/AdminLayout.css";
import AdminChatPanel from "../components/AdminChatPanel"; // 
import ChatBox from "../components/ChatBox"; //  Make sure this is imported too!

const AdminLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="admin-layout d-flex">
      <Sidebar />
      <div className="flex-grow-1 d-flex flex-column position-relative">
        <AdminNavbar />
        <main className="admin-main-content flex-grow-1 p-4 bg-light">
          <Outlet />
        </main>
        <AdminChatPanel onSelectChat={setSelectedChat} />
        {selectedChat ? (
          <ChatBox chat={selectedChat} isAdmin={true} />
        ) : (
          <div className="p-4">Select a chat to start messaging</div>
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
