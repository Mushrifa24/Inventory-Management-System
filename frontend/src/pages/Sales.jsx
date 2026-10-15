import { useEffect, useState } from "react";
import { api } from "../api";

const emptyLine = { product_id: "", quantity: "", unit_price: "" };

export function Sales() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [lines, setLines] = useState([{ ...emptyLine }]);

  function load() {
    api.get("/sales").then(setSales);
  }
  useEffect(load, []);
  useEffect(() => {
    api.get("/products").then(setProducts);
  }, []);

  function updateLine(i, field, value) {
    setLines(
      lines.map((l, idx) =>
        idx === i
          ? {
              ...l,
              [field]: value,
              ...(field === "product_id" && {
                unit_price:
                  products.find((p) => String(p.id) === String(value))?.price ||
                  "",
              }),
            }
          : l,
      ),
    );
  }

  const total = lines.reduce(
    (sum, l) => sum + (Number(l.quantity) || 0) * (Number(l.unit_price) || 0),
    0,
  );

  async function handleSubmit(e) {
    e.preventDefault();
    const items = lines
      .filter((l) => l.product_id && l.quantity)
      .map((l) => ({
        product_id: Number(l.product_id),
        quantity: Number(l.quantity),
        unit_price: Number(l.unit_price),
      }));
    // TODO (Phase 7): nothing here (or on the server) stops submitting a
    // quantity greater than what's in stock.
    try {
       await api.post("/sales", { items });
    setLines([{ ...emptyLine }]);
    load();
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
   
  }

  return (
    <div>
      <h2>Sales</h2>
      <form onSubmit={handleSubmit}>
        {lines.map((line, i) => (
          <div key={i} className="inline-form">
            <select
              value={line.product_id}
              onChange={(e) => updateLine(i, "product_id", e.target.value)}
              required
            >
              <option value="">Select product</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.quantity ?? 0})
                </option>
              ))}
            </select>
            <input
              placeholder="Quantity"
              value={line.quantity}
              onChange={(e) => updateLine(i, "quantity", e.target.value)}
              required
            />
            <input
              placeholder="Unit price"
              value={line.unit_price}
              onChange={(e) => updateLine(i, "unit_price", e.target.value)}
              required
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() => setLines([...lines, { ...emptyLine }])}
        >
          + Add product
        </button>
        <p>Total: ${total.toFixed(2)}</p>
        <button type="submit">Create sale</button>
      </form>

      <h3>History</h3>
      {/* TODO (Phase 7): no per-sale detail view yet. */}
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Total</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((s) => (
            <tr key={s.id}>
              <td>{s.id}</td>
              <td>${Number(s.total_amount).toFixed(2)}</td>
              <td>{new Date(s.created_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
