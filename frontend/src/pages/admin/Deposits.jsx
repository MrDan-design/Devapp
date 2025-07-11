import { useEffect, useState } from 'react';
import adminApi from '../../utils/adminApi';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);

  const fetchDeposits = async () => {
      try {

        const res = await adminApi.get("/deposits/pending");
        setDeposits(res.data);
      } catch (err) {
        console.error("Error fetching deposits:", err);
      }
    };
  useEffect(() => {
    fetchDeposits();
  }, []);

  // Handle accept/reject actions
 const handleApprove = async (id) => {
    try {
      await adminApi.post(`/deposits/${id}/approve`);
      fetchDeposits(); // refresh after action
    } catch (err) {
      alert("Error approving deposit");
      console.error(err);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminApi.post(`/deposits/${id}/reject`);
      fetchDeposits();
    } catch (err) {
      alert("Error rejecting deposit");
      console.error(err);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">User Deposits</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-200 text-left">
            <th className="p-2">ID</th>
            <th className="p-2">Email</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Method</th>
            <th className="p-2">Status</th>
            <th className="p-2">Date</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {deposits.map((d) => (
            <tr key={d.id} className="border-t">
              <td className="p-2">{d.id}</td>
              <td className="p-2">{d.email}</td>
              <td className="p-2">${d.amount.toFixed(2)}</td>
              <td className="p-2">{d.method}</td>
              <td className="p-2">{d.status}</td>
              <td className="p-2">{new Date(d.created_at).toLocaleDateString()}</td>
              <td className="p-2 space-x-2">
                <button
                    className="bg-green-600 text-white px-3 py-1 rounded"
                    onClick={() => handleApprove(deposit.id, 'accept')}
                      >
                    Accept
                </button>
                <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => handleReject(deposit.id, 'reject')}
                >
                    Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Deposits;