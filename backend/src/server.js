import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import 'express-async-errors';

import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import supplierRoutes from './routes/suppliers.js';
import inventoryRoutes from './routes/inventory.js';
import purchaseRoutes from './routes/purchases.js';
import saleRoutes from './routes/sales.js';
import dashboardRoutes from './routes/dashboard.js';
import reportRoutes from './routes/reports.js';

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
