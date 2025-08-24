import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { FiCreditCard, FiRepeat, FiUpload } from "react-icons/fi";
import {
  FaChartBar,
  FaPiggyBank,
  FaDollarSign,
  FaArrowDown,
  FaArrowUp,
  FaExchangeAlt,
  FaGift,
} from "react-icons/fa";
import PageWrapper from "../../components/PageWrapper";

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

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [topStocks, setTopStocks] = useState([]);
  const navigate = useNavigate();


  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        console.log("Dashboard.jsx token:", token);
        const authHeader = { Authorization: `Bearer ${token}` };
        console.log("Dashboard.jsx Authorization header:", authHeader);

        const dashboardRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/users/dashboard`,
          {
            headers: authHeader,
          }
        );
        setDashboardData(dashboardRes.data);

        const stocksRes = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/stocks/top`
        );
        setTopStocks(stocksRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
  }, []);

  if (!dashboardData) return <p className="p-5">Loading dashboard...</p>;

  return (
    <PageWrapper>
      <div className="dashboard-container">
        {/* Dashboard Cards - Mobile Responsive */}
        <div className="dashboard-cards">
          {/* Shares Balance */}
          <div className="card">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaChartBar className="text-danger" />
              <h6 className="text-muted mb-0">Shares Balance</h6>
            </div>
            <div className="bg-light rounded px-3 py-2 d-inline-block">
              <h4 className="text-danger fw-bold mb-0">
                {dashboardData.totalShares || 0}
              </h4>
            </div>
          </div>

          {/* Total Invested */}
          <div className="card">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaPiggyBank className="text-success" />
              <h6 className="text-muted mb-0">Total Invested</h6>
            </div>
            <div className="bg-light rounded px-3 py-2 d-inline-block">
              <h4 className="text-success fw-bold mb-0">
                ${dashboardData.totalInvested || 0}
              </h4>
            </div>
          </div>

          {/* User Wallet Balance */}
          <div className="card">
            <div className="d-flex align-items-center gap-2 mb-2">
              <FaDollarSign className="text-dark" />
              <h6 className="text-muted mb-0">User Balance</h6>
            </div>
            <div className="bg-light rounded px-3 py-2 d-inline-block">
              <h4 className="text-dark fw-bold mb-0">
                ${dashboardData.balance || 0}
              </h4>
            </div>
          </div>
        </div>

        {/* Top Stocks */}
        <div className="top-stocks-container">
          <div className="bg-dark p-3 p-md-4 rounded-4 mb-4">
            <h5 className="fw-bold mb-3 text-light">Trending</h5>
            <div className="d-flex flex-wrap gap-2 gap-md-3">
              {topStocks.map((stock, i) => (
                <a
                  key={i}
                  href={stock.link}
                  target="_blank"
                  rel="noreferrer"
                  className="text-decoration-none"
                >
                  <div className="d-flex align-items-center gap-2 p-2 px-3 bg-light text-dark rounded shadow-sm" 
                       style={{ opacity: 0.95, minWidth: '120px' }}>
                    {stock.logo && (
                      <img
                        src={stock.logo}
                        alt={`${stock.symbol} logo`}
                        style={{ width: 24, height: 24, borderRadius: "50%" }}
                      />
                    )}
                    <div>
                      <div className="fw-semibold small">{stock.symbol}</div>
                      <div className="small text-muted">${stock.price?.toFixed(2) || '0.00'}</div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            onClick={() => navigate("/fundwallet?tab=fund")}
            className="btn btn-primary"
          >
            <FiCreditCard size={18} /> 
            <span>Fund Wallet</span>
          </button>

          <button
            onClick={() => navigate("/fundwallet?tab=swap")}
            className="btn btn-outline-dark"
          >
            <FiRepeat size={18} /> 
            <span>Swap</span>
          </button>

          <button
            onClick={() => navigate("/fundwallet?tab=takeout")}
            className="btn btn-outline-danger"
          >
            <FiUpload size={18} /> 
            <span>Take Out</span>
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="recent-transactions">
          <h5 className="fw-semibold mb-3">Recent Transactions</h5>
          {dashboardData.transactions?.length > 0 ? (
            <>
              <div className="table-responsive">
                <table className="table table-borderless align-middle mb-0">
                  <tbody>
                    {dashboardData.transactions.map((tx, idx) => (
                      <tr key={idx}>
                        <td className="border-0">
                          <div className="d-flex align-items-center">
                            {getTxIcon(tx.type)}
                            <span className="fw-medium text-capitalize">
                              {tx.type}
                            </span>
                          </div>
                        </td>
                        <td className="text-end border-0">
                          <span className="fw-bold text-success">
                            ${tx.amount}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-end mt-3">
                <Link to="/transactions" className="btn btn-link text-primary p-0">
                  See all transactions →
                </Link>
              </div>
            </>
          ) : (
            <p className="text-muted">No recent transactions.</p>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

export default UserDashboard;