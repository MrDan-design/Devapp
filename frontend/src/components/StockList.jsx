import React, { useEffect, useState } from "react";
import axios from "axios";

// Optional: Assign unique colors to each stock
const CARD_COLORS = {
  TSLA: "#77def0ff",   // Light blue
  NVDA: "#f33a3aff",   // Light green
  AMD: "#ffffffff",    // Light orange
  META: "#77def0ff",   // Light purple
  AAPL: "#f33a3aff",   // Light gray
};

function StockList() {
  const [stocks, setStocks] = useState([]);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/stocks/top`);
        // Only include the 5 for portfolio
        const portfolioStocks = ["TSLA", "NVDA", "AMD", "META", "AAPL"];
        const filtered = res.data.filter(stock => portfolioStocks.includes(stock.symbol));
        setStocks(filtered);
      } catch (err) {
        console.error("Failed to fetch stocks:", err);
      }
    };

    fetchStocks();
  }, []);

  return (
    <div className="d-flex gap-3 flex-wrap">
      {stocks.map((stock, idx) => (
        <div
          key={idx}
          className="p-3 rounded shadow-sm text-center"
          style={{
            minWidth: 160,
            flex: '1 1 160px',
            backgroundColor: CARD_COLORS[stock.symbol] || "#ffffff",
            border: "1px solid #ddd"
          }}
        >
          {/* Logo */}
          {stock.logo && (
            <img
              src={stock.logo}
              alt={`${stock.symbol} logo`}
              className="mb-2"
              style={{ width: 40, height: 40, objectFit: "contain" }}
            />
          )}

          {/* Symbol & Price */}
          <h6 className="mb-1">{stock.symbol}</h6>
          <p className="mb-0 fw-bold">${stock.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

export default StockList;