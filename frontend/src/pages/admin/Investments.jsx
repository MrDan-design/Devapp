import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvestments = async () => {
    try {
      const res = await adminApi.get("/investments");
      setInvestments(res.data);
    } catch (err) {
      console.error("Error fetching investments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  if (loading) return <div className="p-4">Loading investments...</div>;
  if (investments.length === 0) return <div className="p-4 text-gray-600">No investments found.</div>;

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">User Investments</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded shadow">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-medium text-gray-700">
              <th className="py-2 px-4 border-b">User ID</th>
              <th className="py-2 px-4 border-b">Category</th>
              <th className="py-2 px-4 border-b">Amount</th>
              <th className="py-2 px-4 border-b">Shares</th>
              <th className="py-2 px-4 border-b">Duration</th>
              <th className="py-2 px-4 border-b">ROI %</th>
              <th className="py-2 px-4 border-b">Start Date</th>
            </tr>
          </thead>
          <tbody>
            {investments.map((inv) => (
              <tr key={inv.id} className="text-sm text-gray-800">
                <td className="py-2 px-4 border-b">{inv.user_id}</td>
                <td className="py-2 px-4 border-b">{inv.category}</td>
                <td className="py-2 px-4 border-b">${inv.amount}</td>
                <td className="py-2 px-4 border-b">{inv.shares}</td>
                <td className="py-2 px-4 border-b">{inv.duration}</td>
                <td className="py-2 px-4 border-b">{inv.roi_percent}%</td>
                <td className="py-2 px-4 border-b">{new Date(inv.start_date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Investments;