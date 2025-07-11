import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/users/Home";
import Login from "../pages/users/Login";
import SignUp from "../pages/users/SignUp";
import Dashboard from "../pages/users/Dashboard";
import Portfolio from "../pages/users/Portfolio";
import Invest from "../pages/users/Invest";
import FundWallet from "../pages/users/FundWallet";
import Transactions from "../pages/users/Transactions";
import Settings from "../pages/users/Settings";

import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import GiftCards from "../pages/admin/Giftcards";
import Deposits from "../pages/admin/Deposits";
import Investments from "../pages/admin/Investments";
import AdminTransactions from "../pages/admin/AdminTransactions";
import Withdrawals from "../pages/admin/Withdrawals";

const AppRouter =() => {
    return (
        <BrowserRouter>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/invest" element={<Invest />} />
            <Route path="/fund-wallet" element={<FundWallet />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/settings" element={<Settings />} />
            

        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="giftcards" element={<GiftCards />} />
          <Route path="deposits" element={<Deposits />} />
          <Route path="investments" element={<Investments />} />
          <Route path="transactions" element={<AdminTransactions />} />
          <Route path="withdrawals" element={<Withdrawals />} />
        </Route>
        </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;