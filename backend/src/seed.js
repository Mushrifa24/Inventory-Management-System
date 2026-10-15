import bcrypt from 'bcryptjs';
import { pool } from './db.js';

// Demo data so interns have something to work against: several products with
// varied stock levels (incl. low and out-of-stock), a few suppliers to edit,
// and one purchase + one sale so history and the dashboard aren't empty.
// Re-running wipes the demo rows first, so it's safe to run repeatedly.
async function seed() {
  const passwordHash = await bcrypt.hash('password123', 10);

  await pool.query(
    `INSERT INTO users (name, email, password_hash, role) VALUES
     ('Admin User', 'admin@example.com', $1, 'admin'),
     ('Staff User', 'staff@example.com', $1, 'staff')
     ON CONFLICT (email) DO NOTHING`,
    [passwordHash]
  );
  const admin = await pool.query("SELECT id FROM users WHERE email = 'admin@example.com'");
  const adminId = admin.rows[0].id;

  // Clear previous demo data (keeps users + categories).
  await pool.query(
    'TRUNCATE sale_items, sales, purchase_items, purchases, stock_history, inventory, products, suppliers RESTART IDENTITY CASCADE'
  );

  const suppliers = await pool.query(
    `INSERT INTO suppliers (name, contact_email, phone, address) VALUES
     ('Acme Supplies',      'sales@acme.test',   '555-0100', '12 Market St'),
     ('Globex Wholesale',   'orders@globex.test','555-0150', '48 Industrial Rd'),
     ('Initech Distributors','hello@initech.test','555-0199', '7 Tower Plaza')
     RETURNING id`
  );

  // category_id: 1=General, 2=Electronics, 3=Stationery (from migration).
  // [name, sku, category_id, price, quantity, low_stock_threshold]
  const items = [
    ['Notebook A5',        'SKU-001', 3, 4.50,  120, 20],
    ['Ballpoint Pen',      'SKU-002', 3, 1.20,  8,   10],  // low stock
    ['Stapler',            'SKU-003', 3, 6.75,  10,  10],  // exactly at threshold
    ['USB-C Cable 1m',     'SKU-004', 2, 9.99,  45,  15],
    ['Wireless Mouse',     'SKU-005', 2, 18.00, 0,   5],   // out of stock
    ['Desk Lamp',          'SKU-006', 2, 24.50, 30,  8],
    ['Printer Paper A4',   'SKU-007', 1, 5.25,  60,  25],
    ['Sticky Notes',       'SKU-008', 1, 2.10,  200, 30],
  ];

  const productIds = [];
  for (const [name, sku, categoryId, price, qty, threshold] of items) {
    const p = await pool.query(
      'INSERT INTO products (name, sku, category_id, price) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, sku, categoryId, price]
    );
    productIds.push(p.rows[0].id);
    await pool.query(
      'INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES ($1, $2, $3)',
      [p.rows[0].id, qty, threshold]
    );
  }

  // One sample purchase (restock of the first two products from Acme).
  const purchase = await pool.query(
    'INSERT INTO purchases (supplier_id, total_amount, created_by) VALUES ($1, $2, $3) RETURNING id',
    [suppliers.rows[0].id, 50 * 3.0 + 20 * 0.8, adminId]
  );
  for (const [idx, qty, unit] of [[0, 50, 3.0], [1, 20, 0.8]]) {
    await pool.query(
      'INSERT INTO purchase_items (purchase_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
      [purchase.rows[0].id, productIds[idx], qty, unit]
    );
    await pool.query('UPDATE inventory SET quantity = quantity + $1 WHERE product_id = $2', [qty, productIds[idx]]);
    await pool.query(
      'INSERT INTO stock_history (product_id, change_qty, reason, created_by) VALUES ($1, $2, $3, $4)',
      [productIds[idx], qty, `Purchase #${purchase.rows[0].id}`, adminId]
    );
  }

  // One sample sale (sells a few notebooks).
  const sale = await pool.query(
    'INSERT INTO sales (total_amount, created_by) VALUES ($1, $2) RETURNING id',
    [5 * 4.5, adminId]
  );
  await pool.query(
    'INSERT INTO sale_items (sale_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)',
    [sale.rows[0].id, productIds[0], 5, 4.5]
  );
  await pool.query('UPDATE inventory SET quantity = quantity - 5 WHERE product_id = $1', [productIds[0]]);
  await pool.query(
    'INSERT INTO stock_history (product_id, change_qty, reason, created_by) VALUES ($1, $2, $3, $4)',
    [productIds[0], -5, `Sale #${sale.rows[0].id}`, adminId]
  );

  console.log(`Seed complete: ${items.length} products, ${suppliers.rows.length} suppliers, 1 purchase, 1 sale.`);
  console.log('Login with admin@example.com / password123 or staff@example.com / password123');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
