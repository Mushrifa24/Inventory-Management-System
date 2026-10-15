import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query(
    `SELECT p.id AS product_id, p.name, p.sku, i.quantity, i.low_stock_threshold
     FROM inventory i JOIN products p ON p.id = i.product_id
     ORDER BY p.name`
  );
  res.json(result.rows);
});

// A product at exactly its threshold counts as low stock (<=).
router.get('/low-stock', async (req, res) => {
  const result = await pool.query(
    `SELECT p.id AS product_id, p.name, p.sku, i.quantity, i.low_stock_threshold
     FROM inventory i JOIN products p ON p.id = i.product_id
     WHERE i.quantity <= i.low_stock_threshold
     ORDER BY i.quantity ASC`
  );
  res.json(result.rows);
});

router.get('/:productId/history', async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM stock_history WHERE product_id = $1 ORDER BY created_at DESC',
    [req.params.productId]
  );
  res.json(result.rows);
});

// Manual adjustment (+ or -), e.g. stock count correction / damage / return.
router.post('/:productId/adjust', async (req, res) => {
  const { change_qty, reason } = req.body;
  const delta = Number(change_qty);
  if (!delta || !reason) {
    return res.status(400).json({ error: 'change_qty (non-zero) and reason are required' });
  }

  const inv = await pool.query('SELECT quantity FROM inventory WHERE product_id = $1', [req.params.productId]);
  if (!inv.rows.length) return res.status(404).json({ error: 'Product not found' });
  if (inv.rows[0].quantity + delta < 0) {
    return res.status(400).json({ error: 'Adjustment would make stock negative' });
  }

  await pool.query('UPDATE inventory SET quantity = quantity + $1 WHERE product_id = $2', [delta, req.params.productId]);
  await pool.query(
    'INSERT INTO stock_history (product_id, change_qty, reason, created_by) VALUES ($1, $2, $3, $4)',
    [req.params.productId, delta, reason, req.user.id]
  );
  res.status(201).json({ ok: true });
});

export default router;
