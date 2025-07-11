// src/pages/Users.jsx
import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const Users = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await adminApi.get("/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md">
      <h2 className="text-xl font-bold mb-4 text-[#6425FE]">All Users</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f0f0f0] text-[#6425FE]">
              <th className="p-3">ID</th>
              <th className="p-3">Full Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Balance (USD)</th>
              <th className="p-3">Admin</th>
              <th className="p-3">Date Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.id}</td>
                <td className="p-3">{user.fullname}</td>
                <td className="p-3">{user.email}</td>
                <td className="p-3">${(Number(user.balance) || 0).toFixed(2)}</td>
                <td className="p-3">{user.is_admin ? "Yes" : "No"}</td>
                <td className="p-3">{new Date(user.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;