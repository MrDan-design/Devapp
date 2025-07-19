// Sidebar.jsx
import { NavLink } from 'react-router-dom';
import "./Sidebar.css";

const links = [
  { name: 'AdminDashboard', path: '/admin' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Gift Cards', path: '/admin/giftcards' },
  { name: 'Deposits', path: '/admin/deposits' },
  { name: 'Investments', path: '/admin/investments' },
  { name: 'Transactions', path: '/admin/transactions' },
  { name: "Withdrawals", path: "/admin/withdrawals" },
  { name: "Subscriptions", path: "/admin/subscriptions" },
];

const Sidebar = () => {
  return (
    <div
      className="sidebar fixed-top-start d-flex flex-column bg-white shadow-sm p-3"
      style={{ width: "200px", height: "100vh", position: "fixed", top: 0, left: 0, zIndex: 2 }}
    >
      <div className="fs-4 fw-bold text-center text-primary mb-4">
        TESLA Admin
      </div>
      <nav className="nav flex-column">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `nav-link my-1 rounded px-3 py-2 ${
                isActive ? "text-white bg-danger" : "text-white"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
