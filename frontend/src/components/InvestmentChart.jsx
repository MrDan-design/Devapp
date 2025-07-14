import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import axios from 'axios';

function InvestmentChart() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchGrowthData = async () => {
      try {
        const res = await axios.get('/api/investments/portfolio-growth'); // Adjust to your backend route
        setData(res.data);
      } catch (err) {
        console.error('Error fetching chart data:', err);
      }
    };

    fetchGrowthData();
  }, []);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#6425FE" strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default InvestmentChart;