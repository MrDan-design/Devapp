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
        console.error("Failed to fetch transactions", err);
      }
    };

    fetchTransactions();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">All Transactions</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow rounded">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="py-2 px-4">Type</th>
              <th className="py-2 px-4">Amount ($)</th>
              <th className="py-2 px-4">User ID</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={`${tx.type}-${tx.id}`} className="border-t">
                <td className="py-2 px-4">{tx.type}</td>
                <td className="py-2 px-4">${tx.amount.toFixed(2)}</td>
                <td className="py-2 px-4">{tx.user_id}</td>
                <td className="py-2 px-4">{tx.status}</td>
                <td className="py-2 px-4">{new Date(tx.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminTransactions;