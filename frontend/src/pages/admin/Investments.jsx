import { useEffect, useState } from "react";
import adminApi from "../../utils/adminApi";

const Investments = () => {
  const [investments, setInvestments] = useState([]);

  useEffect(() => {
    fetchInvestments();
  }, []);

  const fetchInvestments = async () => {
    try {
      const res = await adminApi.get("/investments");
      setInvestments(res.data);
    } catch (err) {
      console.error("Error fetching investments:", err);
    }
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">All Investments</h2>
      {investments.length === 0 ? (
        <div className="alert alert-info">No investment records</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-striped">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>User ID</th>
                <th>Category</th>
                <th>Amount ($)</th>
                <th>Shares</th>
                <th>ROI (%)</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {investments.map((inv) => (
                <tr key={inv.id}>
                  <td>{inv.id}</td>
                  <td>{inv.user_id}</td>
                  <td>{inv.category}</td>
                  <td>{inv.amount_invested}</td>
                  <td>{inv.shares_allocated}</td>
                  <td>{inv.roi_percent}%</td>
                  <td>{inv.duration}</td>
                  <td>
                    <span
                      className={`badge ${
                        inv.status === "active"
                          ? "bg-success"
                          : inv.status === "completed"
                          ? "bg-secondary"
                          : "bg-warning"
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Investments;