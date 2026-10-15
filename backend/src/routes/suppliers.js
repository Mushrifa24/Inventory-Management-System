import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM suppliers ORDER BY id DESC');
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const result = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Supplier not found' });

  const purchases = await pool.query(
    'SELECT * FROM purchases WHERE supplier_id = $1 ORDER BY created_at DESC',
    [req.params.id]
  );
  res.json({ ...result.rows[0], purchases: purchases.rows });
});

router.post('/', async (req, res) => {
  const { name, contact_email, phone, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const result = await pool.query(
    `INSERT INTO suppliers (name, contact_email, phone, address)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [name, contact_email || null, phone || null, address || null]
  );
  res.status(201).json(result.rows[0]);
});

router.put('/:id', async (req, res) => {
  const { name, contact_email, phone, address } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });

  const result = await pool.query(
    `UPDATE suppliers SET name = $1, contact_email = $2, phone = $3, address = $4
     WHERE id = $5 RETURNING *`,
    [name, contact_email || null, phone || null, address || null, req.params.id]
  );
  if (!result.rows.length) return res.status(404).json({ error: 'Supplier not found' });
  res.json(result.rows[0]);
});

router.delete('/:id', async (req, res) => {
  const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [req.params.id]);
  if (!result.rows.length) return res.status(404).json({ error: 'Supplier not found' });
  res.status(204).end();
});

export default router;
