import { useEffect, useState } from "react";
import axios from "axios";
import { FaArrowDown, FaArrowUp, FaExchangeAlt, FaGift } from "react-icons/fa";

const getTxIcon = (type) => {
  switch (type.toLowerCase()) {
    case "deposit":
    case "fund":
      return <FaArrowDown className="text-success me-2" />;
    case "withdraw":
    case "takeout":
      return <FaArrowUp className="text-danger me-2" />;
    case "swap":
      return <FaExchangeAlt className="text-warning me-2" />;
    case "giftcard":
      return <FaGift className="text-primary me-2" />;
    default:
      return <FaExchangeAlt className="text-muted me-2" />;
  }
};

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/transactions/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data;
        // Handle the API response structure { page, limit, results }
        const txData = data.results || data || [];
        setTransactions(Array.isArray(txData) ? txData : []);
      } catch (err) {
        console.error("Transaction fetch failed", err);
        setTransactions([]); // fallback to empty array on error
      } finally {
        setLoading(false);
      }
    };

    fetchTx();
  }, []);

  return (
    <div className="p-4">
      <h4 className="fw-bold mb-4">All Transactions</h4>

      <div className="bg-white rounded-4 p-3">
        {loading ? (
          <p>Loading...</p>
        ) : transactions.length === 0 ? (
          <p className="text-muted">No transactions found.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-borderless align-middle">
              <thead>
                <tr className="text-muted">
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx, idx) => (
                  <tr key={idx}>
                    <td>{new Date(tx.created_at).toLocaleDateString()}</td>
                    <td className="d-flex align-items-center">
                      {getTxIcon(tx.label)}
                      <span className="text-capitalize">{tx.label}</span>
                    </td>
                    <td className="fw-semibold text-success">${tx.amount}</td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          tx.status === "completed"
                            ? "bg-success-subtle text-success"
                            : tx.status === "pending"
                            ? "bg-warning-subtle text-warning"
                            : "bg-secondary-subtle text-muted"
                        }`}
                      >
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;