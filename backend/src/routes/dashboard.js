import { Router } from 'express';
import { pool } from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req, res) => {
  const [products, stock, lowStock, suppliers, purchases, sales, recentPurchases, recentSales, recentActivity] =
    await Promise.all([
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COALESCE(SUM(quantity), 0) AS total FROM inventory'),
      pool.query('SELECT COUNT(*) FROM inventory WHERE quantity <= low_stock_threshold'),
      pool.query('SELECT COUNT(*) FROM suppliers'),
      pool.query('SELECT COUNT(*) FROM purchases'),
      pool.query('SELECT COUNT(*) FROM sales'),
      pool.query(
        `SELECT pu.id, pu.total_amount, pu.created_at, s.name AS supplier_name
         FROM purchases pu JOIN suppliers s ON s.id = pu.supplier_id
         ORDER BY pu.created_at DESC LIMIT 5`
      ),
      pool.query('SELECT id, total_amount, created_at FROM sales ORDER BY created_at DESC LIMIT 5'),
      pool.query(
        `SELECT sh.id, sh.change_qty, sh.reason, sh.created_at, p.name AS product_name
         FROM stock_history sh JOIN products p ON p.id = sh.product_id
         ORDER BY sh.created_at DESC LIMIT 10`
      ),
    ]);

  res.json({
    totalProducts: Number(products.rows[0].count),
    totalStock: Number(stock.rows[0].total),
    lowStockCount: Number(lowStock.rows[0].count),
    totalSuppliers: Number(suppliers.rows[0].count),
    totalPurchases: Number(purchases.rows[0].count),
    totalSales: Number(sales.rows[0].count),
    recentPurchases: recentPurchases.rows,
    recentSales: recentSales.rows,
    recentActivity: recentActivity.rows,
  });
});

export default router;
