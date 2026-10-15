import { useEffect, useState } from 'react';
import { api } from '../api';

const emptyForm = { name: '', contact_email: '', phone: '', address: '' };

export function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState(emptyForm);

  function load() {
    api.get('/suppliers').then(setSuppliers);
  }
  useEffect(load, []);

  async function handleSubmit(e) {
    e.preventDefault();
    await api.post('/suppliers', form);
    setForm(emptyForm);
    load();
  }

  async function handleDelete(id) {
    await api.del(`/suppliers/${id}`);
    load();
  }

  // TODO: this button has no form/API call behind it yet — editing a
  // supplier's details isn't wired up.
  function handleEdit(supplier) {
    console.log('TODO: edit supplier', supplier.id);
  }

  return (
    <div>
      <h2>Suppliers</h2>
      <form onSubmit={handleSubmit} className="inline-form">
        <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input placeholder="Contact email" value={form.contact_email} onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
        <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        <button type="submit">Submit</button>
      </form>

      {/* TODO (Phase 5): no supplier detail view yet (details + purchase history). */}
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr></thead>
        <tbody>
          {suppliers.map((s) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>{s.contact_email || '—'}</td>
              <td>{s.phone || '—'}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Edit</button>
                <button onClick={() => handleDelete(s.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
