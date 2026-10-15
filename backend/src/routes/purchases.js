import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT pu.*, s.name AS supplier_name
     FROM purchases pu JOIN suppliers s ON s.id = pu.supplier_id
     ORDER BY pu.created_at DESC`
  );
  res.json(result.rows);
});

router.get('/:id', async (req, res) => {
  const purchase = await pool.query(
    `SELECT pu.*, s.name AS supplier_name
     FROM purchases pu JOIN suppliers s ON s.id = pu.supplier_id
     WHERE pu.id = $1`,
    [req.params.id]
  );
  if (!purchase.rows.length) return res.status(404).json({ error: 'Purchase not found' });

  const items = await pool.query(
    `SELECT pi.*, p.name AS product_name, p.sku
     FROM purchase_items pi JOIN products p ON p.id = pi.product_id
     WHERE pi.purchase_id = $1`,
    [req.params.id]
  );
  res.json({ ...purchase.rows[0], items: items.rows });
});

// Reference implementation for a multi-step workflow: create a purchase with
// several line items, total is computed server-side, and inventory + stock
// history are updated in one transaction.
router.post('/', async (req, res) => {
  const { supplier_id, items } = req.body;
  if (!supplier_id || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'supplier_id and a non-empty items array are required' });
  }
  for (const item of items) {
    if (!item.product_id || !item.quantity || item.quantity <= 0 || item.unit_price == null) {
      return res.status(400).json({ error: 'Each item needs product_id, quantity > 0 and unit_price' });
    }
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const purchase = await client.query(
      'INSERT INTO purchases (supplier_id, total_amount, created_by) VALUES ($1, $2, $3) RETURNING *',
      [supplier_id, total, req.user.id]
    );
    const purchaseId = purchase.rows[0].id;

    for (const item of items) {
      await client.query(
        'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [purchaseId, item.product_id, item.quantity, item.unit_price]
      );
      await client.query(
        'UPDATE inventory SET quantity = quantity + $1 WHERE product_id = $2',
        [item.quantity, item.product_id]
      );
      await client.query(
        'INSERT INTO stock_history (product_id, change_qty, reason, created_by) VALUES ($1, $2, $3, $4)',
        [item.product_id, item.quantity, `Purchase #${purchaseId}`, req.user.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(purchase.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
