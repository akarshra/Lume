import express from 'express';
import cors from 'cors';
import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

let db;

// Initialize Database
async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer TEXT,
      phone TEXT,
      item TEXT,
      status TEXT,
      date TEXT,
      address TEXT,
      paymentMethod TEXT,
      amount TEXT
    );
    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      stock INTEGER,
      unit TEXT,
      inStock BOOLEAN
    );
    CREATE TABLE IF NOT EXISTS promocodes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT UNIQUE,
      discount TEXT,
      usage INTEGER
    );
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      price TEXT,
      description TEXT,
      image TEXT,
      color TEXT,
      igId TEXT
    );
  `);

  // Seed data if empty
  const invCount = await db.get('SELECT COUNT(*) as count FROM inventory');
  if (invCount.count === 0) {
    await db.run('INSERT INTO inventory (name, stock, unit, inStock) VALUES (?, ?, ?, ?)', ['Red Satin Ribbon', 42, 'Rolls', true]);
    await db.run('INSERT INTO inventory (name, stock, unit, inStock) VALUES (?, ?, ?, ?)', ['Gold Silk Ribbon', 4, 'Rolls', true]);
    await db.run('INSERT INTO inventory (name, stock, unit, inStock) VALUES (?, ?, ?, ?)', ['Gift Boxes', 110, 'Units', true]);
  }

  const promoCount = await db.get('SELECT COUNT(*) as count FROM promocodes');
  if (promoCount.count === 0) {
    await db.run('INSERT INTO promocodes (code, discount, usage) VALUES (?, ?, ?)', ['LUME2026', '10%', 45]);
    await db.run('INSERT INTO promocodes (code, discount, usage) VALUES (?, ?, ?)', ['FIRSTBLOOM', '₹200', 12]);
  }

  const prodCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (prodCount.count === 0) {
    const defaultProducts = [
      { name: "Classic Anniversary Rose", category: "Anniversary", price: "₹1,299", description: "Deep red and blush pink ribbons woven into 24 premium blooming roses.", image: "/images/ig/3.webp", color: "var(--primary-dark)", igId: "l_u_m_eest._2026" },
      { name: "Golden Proposal", category: "Proposal", price: "₹2,499", description: "Luxurious soft gold and cream ribbon roses, arranged in our signature premium box.", image: "/images/ig/4.webp", color: "var(--accent-gold)", igId: "l_u_m_eest._2026" },
      { name: "Lavender Dreams", category: "Birthday", price: "₹999", description: "A sweet combination of pastel lavender and white ribbons for a perfect birthday gift.", image: "/images/ig/5.webp", color: "var(--accent)", igId: "l_u_m_eest._2026" },
      { name: "Soft Blush Elegance", category: "Custom", price: "From ₹1,499", description: "Customized pastel ribbons blending perfectly for weddings and special moments.", image: "/images/ig/6.webp", color: "var(--primary)", igId: "l_u_m_eest._2026" }
    ];
    for (const p of defaultProducts) {
      await db.run('INSERT INTO products (name, category, price, description, image, color, igId) VALUES (?, ?, ?, ?, ?, ?, ?)', 
        [p.name, p.category, p.price, p.description, p.image, p.color, p.igId]);
    }
  }

  console.log('Database initialized');
}

initDB().catch(console.error);

// --- API Routes ---

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await db.all('SELECT * FROM orders ORDER BY date DESC');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add new order
app.post('/api/orders', async (req, res) => {
  const { id, customer, phone, item, status, date, address, paymentMethod, amount } = req.body;
  try {
    await db.run(
      'INSERT INTO orders (id, customer, phone, item, status, date, address, paymentMethod, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, customer, phone, item, status, date, address, paymentMethod, amount]
    );
    res.status(201).json({ message: 'Order created', id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    res.json({ message: 'Order updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete order
app.delete('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM orders WHERE id = ?', [id]);
    res.json({ message: 'Order deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Clear all orders
app.delete('/api/orders', async (req, res) => {
  try {
    await db.run('DELETE FROM orders');
    res.json({ message: 'All orders deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// --- API Routes for Inventory ---

app.get('/api/inventory', async (req, res) => {
  try {
    const items = await db.all('SELECT * FROM inventory');
    res.json(items.map(i => ({ ...i, inStock: !!i.inStock })));
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/inventory', async (req, res) => {
  const { name, stock, unit } = req.body;
  try {
    const result = await db.run('INSERT INTO inventory (name, stock, unit, inStock) VALUES (?, ?, ?, ?)', [name, stock, unit, true]);
    res.status(201).json({ id: result.lastID, name, stock, unit, inStock: true });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.patch('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { inStock } = req.body;
  try {
    await db.run('UPDATE inventory SET inStock = ? WHERE id = ?', [inStock, id]);
    res.json({ message: 'Inventory updated' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM inventory WHERE id = ?', [id]);
    res.json({ message: 'Inventory deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- API Routes for Promos ---

app.get('/api/promos', async (req, res) => {
  try {
    const codes = await db.all('SELECT * FROM promocodes');
    res.json(codes);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/promos', async (req, res) => {
  const { code, discount, usage } = req.body;
  try {
    const result = await db.run('INSERT INTO promocodes (code, discount, usage) VALUES (?, ?, ?)', [code, discount, usage]);
    res.status(201).json({ id: result.lastID, code, discount, usage });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/promos/:code', async (req, res) => {
  const { code } = req.params;
  try {
    await db.run('DELETE FROM promocodes WHERE code = ?', [code]);
    res.json({ message: 'Promo deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// --- API Routes for Products ---

app.get('/api/products', async (req, res) => {
  try {
    const products = await db.all('SELECT * FROM products');
    res.json(products);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.post('/api/products', async (req, res) => {
  const { name, category, price, description, image, color, igId } = req.body;
  try {
    const result = await db.run('INSERT INTO products (name, category, price, description, image, color, igId) VALUES (?, ?, ?, ?, ?, ?, ?)', 
      [name, category, price, description, image, color, igId]);
    res.status(201).json({ id: result.lastID, name, category, price, description, image, color, igId });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
