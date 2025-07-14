import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import "./Dashboard.css"; // optional custom styles

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [topStocks, setTopStocks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        const dashboardRes = await axios.get("http://localhost:5000/api/users/balance", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDashboardData(dashboardRes.data);

        const stocksRes = await axios.get("http://localhost:5000/api/stocks/top");
        setTopStocks(stocksRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  if (!dashboardData) return <p className="p-5">Loading dashboard...</p>;

  return (
    <div className="d-flex min-vh-100 bg-light">
      {/* Sidebar */}
      <div className="bg-white shadow-sm p-3 sidebar" style={{ width: "230px" }}>
        <ul className="nav flex-column">
          <li className="nav-item"><Link to="/dashboard" className="nav-link active">Dashboard</Link></li>
          <li className="nav-item"><Link to="/portfolio" className="nav-link">Portfolio</Link></li>
          <li className="nav-item"><Link to="/invest" className="nav-link">Invest in Shares</Link></li>
          <li className="nav-item"><Link to="/fundwallet" className="nav-link">Wallet Transfer Pay</Link></li>
          <li className="nav-item"><Link to="/transactions" className="nav-link">Transactions and Reporting</Link></li>
        </ul>

        {/* Tips box */}
        <div className="mt-5 bg-light p-2 rounded">
          <small className="text-muted">💡 Tip: Invest steadily and monitor your growth weekly.</small>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-grow-1 p-4">
        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center mb-4 topbar">
          <img src="/logo.png" alt="Logo" className="logo" />
          <h4 className="fw-bold">Hello {dashboardData.name}</h4>
          <div className="d-flex align-items-center gap-3">
            <input type="text" placeholder="Search..." className=" search-input" />
            <img src="../../assets/profile.png" alt="User" className="rounded-circle" />
          </div>
        </div>

        {/* Balance + Invested */}
        <div className="row mb-4 dashboard-cards">
          <div className="col-md-6">
            <div className="card shadow-sm p-3">
              <h6>Shares Balance</h6>
              <h4 className="text-primary">${dashboardData.balance}</h4>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card shadow-sm p-3">
              <h6>Total Invested</h6>
              <h4 className="text-success">${dashboardData.invested}</h4>
            </div>
          </div>
        </div>

        {/* Top Stocks */}
        <div className="mb-4">
          <h5 className="fw-semibold mb-2">Top Stocks</h5>
          <div className="d-flex flex-wrap gap-2">
            {topStocks.map((stock, i) => (
              <a key={i} href={stock.link} target="_blank" rel="noreferrer" className="text-decoration-none">
                <div className="p-2 px-3 bg-light text-dark rounded" style={{ opacity: 0.75 }}>
                  {stock.symbol}: ${stock.price.toFixed(2)}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-4 d-flex gap-3">
          <Link to="/wallet" className="btn btn-outline-primary">Fund Wallet</Link>
          <Link to="/swap" className="btn btn-outline-secondary">Swap</Link>
          <Link to="/take-out" className="btn btn-outline-danger">Take Out Shares</Link>
        </div>

        {/* Recent Transactions */}
        <div className="mb-5">
          <h5 className="fw-semibold mb-2">Recent Transactions</h5>
          {dashboardData.transactions?.length > 0 ? (
            <ul className="list-group">
              {dashboardData.transactions.map((tx, idx) => (
                <li key={idx} className="list-group-item d-flex justify-content-between">
                  <span>{tx.type}</span>
                  <span>${tx.amount}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted">No recent transactions.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;