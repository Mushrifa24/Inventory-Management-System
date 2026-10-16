import { Router } from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

// Supports ?search= (name/sku), ?category= (category_id) and
// ?stockStatus=low|out|in filters.
router.get("/", async (req, res) => {
  const { search, category, stockStatus } = req.query;
  const params = [];
  const clauses = [];

  if (search) {
    params.push(`%${search}%`);
    clauses.push(
      `(p.name ILIKE $${params.length} OR p.sku ILIKE $${params.length})`,
    );
  }
  if (category) {
    params.push(category);
    clauses.push(`p.category_id = $${params.length}`);
  }
  if (stockStatus === "low")
    clauses.push("i.quantity <= i.low_stock_threshold");
  else if (stockStatus === "out") clauses.push("i.quantity <= 0");
  else if (stockStatus === "in") clauses.push("i.quantity > 0");

  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, i.quantity, i.low_stock_threshold
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN inventory i ON i.product_id = p.id
     ${where}
     ORDER BY p.id DESC`,
    params,
  );
  res.json(result.rows);
});

router.get("/:id", async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, c.name AS category_name, i.quantity, i.low_stock_threshold
     FROM products p
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN inventory i ON i.product_id = p.id
     WHERE p.id = $1`,
    [req.params.id],
  );
  if (!result.rows.length)
    return res.status(404).json({ error: "Product not found" });
  res.json(result.rows[0]);
});

// NOTE: no validation yet — name/sku/price are trusted as-is, and duplicate
// SKUs currently just fail with a raw DB error instead of a clean 409.
router.post("/", async (req, res) => {
  const { name, sku, category_id, price, image_url } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).json({ error: "Product name is required" });
  }
  if (price !== undefined && price <= 0 ) {
    return res.status(400).json({ error: "Price must be valid number" });
  }
  try {
    const result = await pool.query(
      `INSERT INTO products (name, sku, category_id, price, image_url)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [name, sku, category_id || null, price, image_url || null],
    );
    await pool.query(
      "INSERT INTO inventory (product_id, quantity, low_stock_threshold) VALUES ($1, 0, 10)",
      [result.rows[0].id],
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "This code is already in use" });
    }
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  const { name, sku, category_id, price, image_url } = req.body;
  const result = await pool.query(
    `UPDATE products SET name = $1, sku = $2, category_id = $3, price = $4, image_url = $5
     WHERE id = $6 RETURNING *`,
    [name, sku, category_id || null, price, image_url || null, req.params.id],
  );
  if (!result.rows.length)
    return res.status(404).json({ error: "Product not found" });
  res.json(result.rows[0]);
});

// Intentionally missing: DELETE /:id. The frontend has a Delete button
// already wired to this endpoint — Phase 3 asks for delete to be completed.

router.delete("/:id", async (req, res) => {
  const {id} = req.params;
  const query = "DELETE FROM products WHERE id = $1 RETURNING *";
  const result = await pool.query(query, [id]);

  if (result.rows.length === 0) {
    return res.status(404).json({ error: "Product not found" });
  }

  res.json({ message: "Product deleted successfully", deletedProduct: result.rows[0] });

});

export default router;
