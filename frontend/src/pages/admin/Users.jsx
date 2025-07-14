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
    <div className="container-fluid px-4">
      <h2 className="mb-4 fw-bold text-primary">All Users</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Balance (USD)</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, i) => (
              <tr key={user.id}>
                <td>{i + 1}</td>
                <td>{user.fullname}</td>
                <td>{user.email}</td>
                <td>${parseFloat(user.balance).toFixed(2)}</td>
                <td>
                  <span className={`badge ${user.is_admin ? "bg-primary" : "bg-secondary"}`}>
                    {user.is_admin ? "Admin" : "User"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};


export default Users;