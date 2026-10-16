import { useEffect, useState } from "react";
import { api } from "../api";

const emptyForm = {
  name: "",
  sku: "",
  category_id: "",
  price: "",
  image_url: "",
};

export function Products() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  function load() {
    setError("");
    api
      .get(`/products?search=${encodeURIComponent(search)}`)
      .then(setProducts)
      .catch((err) => setError(err.message));
  }

  useEffect(load, [search]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        category_id: form.category_id || null,
      };
      if (editingId) {
        await api.put(`/products/${editingId}`, payload);
      } else {
        await api.post("/products", payload);
      }
      setForm(emptyForm);
      setEditingId(null);
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      setError(errorMsg);
    }
  }

  function startEdit(p) {
    setEditingId(p.id);
    setForm({
      name: p.name,
      sku: p.sku,
      category_id: p.category_id || "",
      price: p.price,
      image_url: p.image_url || "",
    });
  }

  async function handleDelete(id) {
    await api.del(`/products/${id}`);
    load();
  }

  return (
    <div>
      <h2>Products</h2>
      {error && <p className="error">{error}</p>}
      <input
        placeholder="Search products..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <form onSubmit={handleSubmit} className="inline-form">
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="SKU"
          value={form.sku}
          onChange={(e) => setForm({ ...form, sku: e.target.value })}
          required
        />
        <input
          placeholder="Price"
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          placeholder="Image URL"
          value={form.image_url}
          onChange={(e) => setForm({ ...form, image_url: e.target.value })}
        />
        <button type="submit">{editingId ? "Update" : "Save"}</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.category_name || "—"}</td>
              <td>${Number(p.price).toFixed(2)}</td>
              <td>{p.quantity ?? 0}</td>
              <td>
                <button onClick={() => startEdit(p)}>Edit</button>
                <button onClick={() => handleDelete(p.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
