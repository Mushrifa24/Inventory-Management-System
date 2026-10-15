import { useEffect, useState } from 'react';
import { api } from '../api';

export function Reports() {
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    api.get('/reports/inventory').then(setInventory);
  }, []);

  return (
    <div>
      <h2>Reports</h2>
      <h3>Current Inventory</h3>
      <table>
        <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Stock value</th></tr></thead>
        <tbody>
          {inventory.map((row) => (
            <tr key={row.sku}>
              <td>{row.name}</td>
              <td>{row.sku}</td>
              <td>{row.quantity}</td>
              <td>${Number(row.stock_value).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* TODO (Phase 10): low-stock, purchase/sales history, supplier
          purchases, product-wise and date-wise reports still need building. */}
    </div>
  );
}
