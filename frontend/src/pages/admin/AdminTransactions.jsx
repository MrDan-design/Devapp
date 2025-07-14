import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await adminApi.get("/all-transactions");
        setTransactions(res.data);
      } catch (err) {
        console.error("Error fetching transactions:", err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="container-fluid px-4">
      <h2 className="mb-4 fw-bold text-primary">All Transactions</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-striped">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, index) => (
              <tr key={tx.id}>
                <td>{index + 1}</td>
                <td>{tx.user_fullname || tx.email}</td>
                <td>{tx.type}</td>
                <td>${parseFloat(tx.amount).toFixed(2)}</td>
                <td>
                  <span
                    className={`badge ${
                      tx.status === "completed"
                        ? "bg-success"
                        : tx.status === "pending"
                        ? "bg-warning text-dark"
                        : "bg-danger"
                    }`}
                  >
                    {tx.status}
                  </span>
                </td>
                <td>{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;