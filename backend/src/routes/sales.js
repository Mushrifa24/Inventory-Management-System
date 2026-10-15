import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const result = await pool.query('SELECT * FROM sales ORDER BY created_at DESC');
  res.json(result.rows);
});

// TODO (Phase 7): no endpoint yet to view a single sale + its line items.

// TODO (Phase 7): this does NOT check that enough stock is available before
// selling, so inventory can go negative. Compare with purchases.js for the
// transaction pattern to follow.
router.post('/', async (req, res) => {
  const { items } = req.body;
  if (!Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: 'a non-empty items array is required' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const total = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);
    const sale = await client.query(
      'INSERT INTO sales (total_amount, created_by) VALUES ($1, $2) RETURNING *',
      [total, req.user.id]
    );
    
    const saleId = sale.rows[0].id;
    for (const item of items) {
        const stockCheck = await client.query(
        'SELECT quantity FROM inventory WHERE product_id = $1',
        [item.product_id]
      );
      const productInfo = await client.query(
        'SELECT name FROM products WHERE id = $1',
        [item.product_id]
      );
      
      const productName = productInfo.rows[0]?.name || `ID ${item.product_id}`;
      if (stockCheck.rows.length === 0 || stockCheck.rows[0].quantity < item.quantity) {
        await client.query('ROLLBACK');
        return res.status(400).json({ error: `Not enough stock for ${productName}` });
      }
      await client.query(
        'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
        [saleId, item.product_id, item.quantity, item.unit_price]
      );
      await client.query(
        'UPDATE inventory SET quantity = quantity - $1 WHERE product_id = $2',
        [item.quantity, item.product_id]
      );
      await client.query(
        'INSERT INTO stock_history (product_id, change_qty, reason, created_by) VALUES ($1, $2, $3, $4)',
        [item.product_id, -item.quantity, `Sale #${saleId}`, req.user.id]
      );
    }

    await client.query('COMMIT');
    res.status(201).json(sale.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

export default router;
