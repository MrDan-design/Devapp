import { useEffect, useState } from 'react';
import adminApi from '../../utils/adminApi';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);

  const fetchDeposits = async () => {
    try {
      const res = await adminApi.get("/pending-deposits");
      setDeposits(res.data);
    } catch (err) {
      console.error("Error fetching deposits:", err);
    }
  };

  const handleAction = async (id, action) => {
    try {
      await adminApi.post(`/deposits/${action}/${id}`);
      fetchDeposits(); // Refresh list
    } catch (err) {
      console.error(`Error ${action}ing deposit:`, err);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, []);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Pending Deposits</h2>

      {deposits.length === 0 ? (
        <div className="alert alert-info">No pending deposits</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Wallet Address</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {deposits.map((deposit) => (
                <tr key={deposit.id}>
                  <td>{deposit.fullname || deposit.user_id}</td>
                  <td>${deposit.amount.toFixed(2)}</td>
                  <td>{deposit.method}</td>
                  <td>{new Date(deposit.created_at).toLocaleString()}</td>
                  <td className="text-break">{deposit.wallet_address}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => handleAction(deposit.id, "approve")}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleAction(deposit.id, "reject")}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Deposits;