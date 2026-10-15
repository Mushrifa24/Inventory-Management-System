import { useEffect, useState } from 'react';
import { api } from '../api';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/dashboard').then(setStats).catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="error">{error}</p>;
  if (!stats) return <p>Loading...</p>;

  return (
    <div>
      <h2>Dashboard</h2>
      <div className="stat-grid">
        <div className="stat-card"><span>{stats.totalProducts}</span>Total Products</div>
        <div className="stat-card"><span>{stats.totalStock}</span>Total Stock</div>
        <div className="stat-card"><span>{stats.lowStockCount}</span>Low Stock Products</div>
        <div className="stat-card"><span>{stats.totalSuppliers}</span>Total Suppliers</div>
        <div className="stat-card"><span>{stats.totalPurchases}</span>Total Purchases</div>
        <div className="stat-card"><span>{stats.totalSales}</span>Total Sales</div>
      </div>

      <div className="two-col">
        <section>
          <h3>Recent Purchases</h3>
          {stats.recentPurchases.length === 0 ? <p>Nothing to show yet.</p> : (
            <ul>{stats.recentPurchases.map((p) => <li key={p.id}>{p.id}</li>)}</ul>
          )}
        </section>
        <section>
          <h3>Recent Sales</h3>
          {stats.recentSales.length === 0 ? <p>Nothing to show yet.</p> : (
            <ul>{stats.recentSales.map((s) => <li key={s.id}>{s.id}</li>)}</ul>
          )}
        </section>
      </div>
    </div>
  );
}
