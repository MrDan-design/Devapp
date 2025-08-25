import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react"; //  Added!
import Sidebar from "../components/Sidebar";
import AdminNavbar from "../components/AdminNavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import "../layout/AdminLayout.css";
import AdminChatPanel from "../components/AdminChatPanel"; // 
import ChatBox from "../components/ChatBox"; //  Make sure this is imported too!

const AdminLayout = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="d-flex justify-content-center align-items-center" style={{height: '100vh'}}>
      <div className="spinner-border" role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
    </div>;
  }

  // Check if user is admin
  if (!user || !user.is_admin) {
    return <Navigate to="/dashboard" replace />;
  }

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
