import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);

  const fetchWithdrawals = async () => {
    try {
      const res = await adminApi.get("/withdrawals/pending");
      setWithdrawals(res.data);
    } catch (err) {
      console.error("Error fetching withdrawals:", err);
    }
  };

  const approveWithdrawal = async (id) => {
    try {
      const res = await adminApi.post(`/withdrawals/approve/${id}`);
      alert(res.data.message);
      fetchWithdrawals(); // refresh list
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed.");
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  return (
    <div className="container-fluid px-4">
      <h2 className="mb-4 fw-bold text-primary">Pending Withdrawals</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>#</th>
              <th>User</th>
              <th>USD</th>
              <th>Crypto</th>
              <th>Crypto Amount</th>
              <th>Wallet Address</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((wd, index) => (
              <tr key={wd.id}>
                <td>{index + 1}</td>
                <td>{wd.email}</td>
                <td>${parseFloat(wd.usd_amount).toFixed(2)}</td>
                <td>{wd.crypto_symbol.toUpperCase()}</td>
                <td>{parseFloat(wd.crypto_amount).toFixed(8)}</td>
                <td>{wd.wallet_address}</td>
                <td>
                  <button
                    className="btn btn-sm btn-success"
                    onClick={() => approveWithdrawal(wd.id)}
                  >
                    Approve
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Withdrawals;
// This code defines a React component for managing admin withdrawals.