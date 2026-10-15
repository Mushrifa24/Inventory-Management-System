import { useEffect, useState } from 'react';
import { api } from '../api';

export function Inventory() {
  const [items, setItems] = useState([]);
  const [adjusting, setAdjusting] = useState(null);
  const [qty, setQty] = useState('');
  const [reason, setReason] = useState('');

  function load() {
    api.get('/inventory').then(setItems);
  }
  useEffect(load, []);

  async function submitAdjustment(e) {
    e.preventDefault();
    await api.post(`/inventory/${adjusting}/adjust`, { change_qty: Number(qty), reason });
    setAdjusting(null);
    setQty('');
    setReason('');
    load();
  }

  return (
    <div>
      <h2>Inventory</h2>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Quantity</th><th>Low-stock at</th><th></th></tr></thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.product_id} className={i.quantity <= i.low_stock_threshold ? 'low-stock' : ''}>
              <td>{i.name}</td>
              <td>{i.sku}</td>
              <td>{i.quantity}</td>
              <td>{i.low_stock_threshold}</td>
              <td><button onClick={() => setAdjusting(i.product_id)}>Adjust</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {adjusting && (
        <form onSubmit={submitAdjustment} className="inline-form">
          <input placeholder="+/- quantity" value={qty} onChange={(e) => setQty(e.target.value)} required />
          <input placeholder="Reason" value={reason} onChange={(e) => setReason(e.target.value)} required />
          <button type="submit">Save adjustment</button>
          <button type="button" onClick={() => setAdjusting(null)}>Cancel</button>
        </form>
      )}
    </div>
  );
}
