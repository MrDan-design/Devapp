import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const Withdrawals = () => {
    const [withdrawals, setWithdrawals] = useState([]);

    useEffect(() => {
    const fetchWithdrawals = async () => {
      try {
        const res = await adminApi.get("/withdrawals/pending");
        setWithdrawals(res.data);
      } catch (err) {
        console.error("Error fetching withdrawals:", err);
      }
    };

    fetchWithdrawals();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApi.post(`/withdrawals/approve/${id}`);
      setWithdrawals((prev) => prev.filter((w) => w.id !== id));
      alert("Withdrawal approved and email sent");
    } catch (err) {
      console.error("Approval failed:", err);
      alert("Approval failed");
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pending Withdrawals</h2>
      {withdrawals.length === 0 ? (
        <p>No pending withdrawals.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full table-auto border">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2">User ID</th>
                <th className="px-4 py-2">Shares</th>
                <th className="px-4 py-2">Crypto</th>
                <th className="px-4 py-2">Wallet Address</th>
                <th className="px-4 py-2">Requested</th>
                <th className="px-4 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {withdrawals.map((w) => (
                <tr key={w.id} className="border-t text-center">
                  <td className="px-4 py-2">{w.user_id}</td>
                  <td className="px-4 py-2">
                    {w.shares_amount} {w.shares_symbol}
                  </td>
                  <td className="px-4 py-2">
                    {w.crypto_amount} {w.crypto_symbol}
                  </td>
                  <td className="px-4 py-2">{w.wallet_address}</td>
                  <td className="px-4 py-2">
                    {new Date(w.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => handleApprove(w.id)}
                      className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
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

export default Withdrawals;
// This code defines a React component for managing admin withdrawals.