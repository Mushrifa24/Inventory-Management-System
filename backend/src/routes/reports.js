import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

// Example report, implemented as a pattern to follow. The rest of Phase 10
// (low-stock, purchase/sales history, supplier purchases, product-wise sales,
// date-wise sales/purchases) still needs routes added here.
router.get('/inventory', async (req, res) => {
  const result = await pool.query(
    `SELECT p.name, p.sku, i.quantity, i.low_stock_threshold, p.price,
            (i.quantity * p.price) AS stock_value
     FROM inventory i JOIN products p ON p.id = i.product_id
     ORDER BY p.name`
  );
  res.json(result.rows);
});

export default router;
