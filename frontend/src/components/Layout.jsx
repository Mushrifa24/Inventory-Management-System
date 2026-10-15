import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  ['/', 'Dashboard'],
  ['/products', 'Products'],
  ['/inventory', 'Inventory'],
  ['/suppliers', 'Suppliers'],
  ['/purchases', 'Purchases'],
  ['/sales', 'Sales'],
  ['/reports', 'Reports'],
];

export function Layout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <nav className="sidebar">
        <h1>Inventory</h1>
        {links.map(([to, label]) => (
          <NavLink key={to} to={to} end={to === '/'}>
            {label}
          </NavLink>
        ))}
        <div className="sidebar-footer">
          <span>{user?.name} ({user?.role})</span>
          <button onClick={logout}>Logout</button>
        </div>
      </nav>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
