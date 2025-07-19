import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import axios from 'axios';

const InvestmentChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/invest/chart-data', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setData(res.data);
      } catch (err) {
        console.error('Chart fetch error:', err);
      }
    };

    fetchChartData();
  }, []);

  return (
    <div className="bg-white p-4 rounded-4 shadow-sm">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <XAxis 
            dataKey="date"
            stroke="#888" // ash
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis 
            stroke="#888" // ash
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ddd' }}
            labelStyle={{ fontWeight: 'bold' }}
            cursor={{ stroke: '#eee', strokeWidth: 2 }}
          />
          <Line 
            type="monotone"
            dataKey="total"
            stroke="#D62828" // 🔴 Brand red
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default InvestmentChart;