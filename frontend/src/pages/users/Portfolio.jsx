import React from 'react';
import StockList from '../../components/StockList';
import InvestmentChart from '../../components/InvestmentChart';
import PageWrapper from '../../components/PageWrapper';

const Portfolio = () => {
  return (
    <PageWrapper>
      <div>
      <h2 className="mb-4">Your Portfolio</h2>

      {/* Static Stocks Section */}
      <StockList />

      {/* Chart Section */}
      <div className="mt-5">
        <h4>Investment Growth</h4>
        <InvestmentChart />
      </div>
    </div>
    </PageWrapper>
  );
};

export default Portfolio;