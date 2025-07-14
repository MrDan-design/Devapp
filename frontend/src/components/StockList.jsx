import React from 'react';

const stocks = [
  { symbol: 'AAPL', price: 185.35 },
  { symbol: 'TSLA', price: 242.19 },
  { symbol: 'NFLX', price: 453.88 },
  { symbol: 'AMD', price: 165.75 },
  { symbol: 'GOOG', price: 132.01 }
];

function StockList() {
  return (
    <div className="d-flex gap-3 overflow-auto">
      {stocks.map((stock, idx) => (
        <div key={idx} className="border p-3 rounded bg-white shadow-sm text-center min-w-150">
          <h5>{stock.symbol}</h5>
          <p>${stock.price.toFixed(2)}</p>
        </div>
      ))}
    </div>
  );
}

export default StockList;