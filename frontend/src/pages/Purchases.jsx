import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyLine = { product_id: '', quantity: '', unit_price: '' };

export function Purchases() {
  const [purchases, setPurchases] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [supplierId, setSupplierId] = useState('');
  const [lines, setLines] = useState([{ ...emptyLine }]);

  function load() {
    api.get('/purchases').then(setPurchases);
  }
  useEffect(load, []);
  useEffect(() => {
    api.get('/suppliers').then(setSuppliers);
    api.get('/products').then(setProducts);
  }, []);

  function updateLine(i, field, value) {
    setLines(lines.map((l, idx) => (idx === i ? { ...l, [field]: value } : l)));
  }

  const total = lines.reduce((sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0), 0);

  async function handleSubmit(e) {
    e.preventDefault();
    const items = lines
      .filter((l) => l.product_id && l.quantity)
      .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity), unit_price: Number(l.unit_price) }));
    await api.post('/purchases', { supplier_id: Number(supplierId), items });
    setSupplierId('');
    setLines([{ ...emptyLine }]);
    load();
  }

  return (
    <div>
      <h2>Purchases</h2>
      <form onSubmit={handleSubmit}>
        <select value={supplierId} onChange={(e) => setSupplierId(e.target.value)} required>
          <option value="">Select supplier</option>
          {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>

        {lines.map((line, i) => (
          <div key={i} className="inline-form">
            <select value={line.product_id} onChange={(e) => updateLine(i, 'product_id', e.target.value)} required>
              <option value="">Select product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <input placeholder="Quantity" value={line.quantity} onChange={(e) => updateLine(i, 'quantity', e.target.value)} required />
            <input placeholder="Unit price" value={line.unit_price} onChange={(e) => updateLine(i, 'unit_price', e.target.value)} required />
          </div>
        ))}
        <button type="button" onClick={() => setLines([...lines, { ...emptyLine }])}>+ Add product</button>
        <p>Total: ${total.toFixed(2)}</p>
        <button type="submit">Create purchase</button>
      </form>

      <h3>History</h3>
      <table>
        <thead><tr><th>ID</th><th>Supplier</th><th>Total</th><th>Date</th></tr></thead>
        <tbody>
          {purchases.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.supplier_name}</td>
              <td>${Number(p.total_amount).toFixed(2)}</td>
              <td>{new Date(p.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
