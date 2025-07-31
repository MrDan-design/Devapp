import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "../pages/users/Home";
// import Login from "../pages/users/Login";
// import SignUp from "../pages/users/SignUp";
import Dashboard from "../pages/users/Dashboard";
import Portfolio from "../pages/users/Portfolio";
import Invest from "../pages/users/Invest";
import FundWallet from "../pages/users/FundWallet";
import Transactions from "../pages/users/Transactions";
import Settings from "../pages/users/Settings";
// import SignupDetails from "../pages/users/SignupDetails";
import UserLayout from "../layout/UserLayout";
import EditProfile from "../layout/EditProfile";
import About from "../pages/users/About";
import UpgradePage from "../pages/users/UpgradePage";
import CheckoutPage from "../pages/users/CheckoutPage";
import PagePreview from "../pages/users/PagePreview";
import ChatWidget from '../components/ChatWidget';
import ErrorBoundary from '../components/ErrorBoundary';

import AdminLayout from "../layout/AdminLayout";
import AdminDashboard from "../pages/admin/AdminDashboard";
import Users from "../pages/admin/Users";
import GiftCards from "../pages/admin/Giftcards";
import Deposits from "../pages/admin/Deposits";
import Investments from "../pages/admin/Investments";
import AdminTransactions from "../pages/admin/AdminTransactions";
import Withdrawals from "../pages/admin/Withdrawals";
import PendingSubscriptions from '../pages/admin/PendingSubscriptions';



const AppRouter =() => {
    const user = JSON.parse(localStorage.getItem('user'));
    const isAdmin = user?.role === 'admin';

    return (
        <BrowserRouter 
            future={{
                v7_startTransition: true,
                v7_relativeSplatPath: true
            }}
        >
        <Routes>
            <Route path="/" element={<Home />} />
            {/* <Route path="/login" element={<Login />} /> */}
            <Route path="/about" element={<About />} />
            <Route path="/upgrade-plan" element={<UpgradePage />} />
            <Route path="/preview" element={<PagePreview />} />
            <Route path="/checkout" element={<CheckoutPage />} />

            <Route element={<UserLayout />}>
                <Route path="/dashboard" element={<ErrorBoundary><Dashboard /></ErrorBoundary>} />
                <Route path="/portfolio" element={<ErrorBoundary><Portfolio /></ErrorBoundary>} />
                <Route path="/invest" element={<ErrorBoundary><Invest /></ErrorBoundary>} />
                <Route path="/fundwallet" element={<ErrorBoundary><FundWallet /></ErrorBoundary>} />
                <Route path="/transactions" element={<ErrorBoundary><Transactions /></ErrorBoundary>} />
                <Route path="/settings" element={<ErrorBoundary><Settings /></ErrorBoundary>} />
                <Route path="/profile/edit" element={<ErrorBoundary><EditProfile /></ErrorBoundary>} />
            </Route>

            {/* Admin Routes */}
            

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="giftcards" element={<GiftCards />} />
                <Route path="deposits" element={<Deposits />} />
                <Route path="investments" element={<Investments />} />
                <Route path="transactions" element={<AdminTransactions />} />
                <Route path="withdrawals" element={<Withdrawals />} />
                <Route path="subscriptions" element={<PendingSubscriptions />} />
            </Route>
        </Routes>
        {user && !isAdmin && <ChatWidget user={user} />}
        </BrowserRouter>
    );
};

export default AppRouter;