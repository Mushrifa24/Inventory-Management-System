import { readFileSync } from 'fs';
import { pool } from './db.js';

const sql = readFileSync(new URL('../migrations/001_init.sql', import.meta.url), 'utf8');

pool.query(sql)
  .then(() => {
    console.log('Migration applied.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err.message);
    process.exit(1);
  });
