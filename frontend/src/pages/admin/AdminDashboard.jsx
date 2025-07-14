import {  useEffect, useState } from 'react';   
import adminApi from '../../utils/adminApi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingDeposits: 0,
    pendingCards: 0,
    pendingWithdrawals: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="container py-4">
      <div className="row g-4">
        <div className="col-md-3">
          <div className="bg-white p-4 rounded shadow text-center">
            <h5>Total Users</h5>
            <p className="h4 text-primary">{stats.totalUsers}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded shadow text-center">
            <h5>Pending Deposits</h5>
            <p className="h4 text-primary">{stats.pendingDeposits}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded shadow text-center">
            <h5>Gift Cards Awaiting Approval</h5>
            <p className="h4 text-primary">{stats.pendingCards}</p>
          </div>
        </div>
        <div className="col-md-3">
          <div className="bg-white p-4 rounded shadow text-center">
            <h5>Withdrawals Pending</h5>
            <p className="h4 text-primary">{stats.pendingWithdrawals}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;