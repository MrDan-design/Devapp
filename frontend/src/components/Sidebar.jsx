// src/components/Sidebar.jsx
import { NavLink } from 'react-router-dom';

const links = [
  { name: 'AdminDashboard', path: '/admin' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Gift Cards', path: '/admin/giftcards' },
  { name: 'Deposits', path: '/admin/deposits' },
  { name: 'Investments', path: '/admin/investments' },
  { name: 'Transactions', path: '/admin/transactions' },
  { name: "Withdrawals", path: "/admin/withdrawals" },
];

const Sidebar = () => (
  <div className="flex flex-col h-full">
    <h2 className="text-2xl font-bold text-[#6425FE] mb-10">Tesla Admin</h2>
    <nav className="space-y-2">
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `block px-4 py-3 text-base font-medium rounded-lg transition ${
              isActive ? "bg-[#f0ebff] text-[#6425FE]" : "text-[#666666] hover:bg-gray-100"
            }`
          }
        >
          {link.name}
        </NavLink>
      ))}
    </nav>
  </div>
);

export default Sidebar;