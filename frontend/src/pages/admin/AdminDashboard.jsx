const AdminDashboard = () => {
    return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-50 p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-semibold">Total Users</h3>
        <p className="text-3xl text-[#6425FE]">1,234</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-semibold">Pending Deposits</h3>
        <p className="text-3xl text-[#6425FE]">$8,740</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-semibold">Gift Cards Awaiting Approval</h3>
        <p className="text-3xl text-[#6425FE]">15</p>
      </div>
      <div className="bg-gray-50 p-6 rounded-lg shadow text-center">
        <h3 className="text-lg font-semibold">Withdrawals Pending</h3>
        <p className="text-3xl text-[#6425FE]">6</p>
      </div>
    </div>
  );
};

export default AdminDashboard;