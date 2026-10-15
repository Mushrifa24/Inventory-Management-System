import { Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { Suppliers } from './pages/Suppliers';
import { Purchases } from './pages/Purchases';
import { Sales } from './pages/Sales';
import { Reports } from './pages/Reports';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<Products />} />
        <Route path="inventory" element={<Inventory />} />
        <Route path="suppliers" element={<Suppliers />} />
        <Route path="purchases" element={<Purchases />} />
        <Route path="sales" element={<Sales />} />
        <Route path="reports" element={<Reports />} />
      </Route>
    </Routes>
  );
}
