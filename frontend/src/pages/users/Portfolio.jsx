import React from 'react';
import StockList from '../../components/StockList';
import InvestmentChart from '../../components/InvestmentChart';

function Portfolio() {
  return (
    <div className="container-fluid p-4">
      <h2 className="mb-4">Your Portfolio</h2>
      
      {/* Static Stocks Section */}
      <StockList />

      {/* Chart Section */}
      <div className="mt-5">
        <h4>Investment Growth</h4>
        <InvestmentChart />
      </div>
    </div>
  );
}

export default Portfolio;