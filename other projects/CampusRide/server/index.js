import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './db.js';

dotenv.config();

const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // Limit each IP to 100 requests per `window`
});
app.use(limiter);

// Zod schemas
const registerSchema = z.object({
  email: z.string().email().endsWith('.edu', 'Must be a college .edu email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  first_name: z.string().min(2),
  last_name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

// Init DB (for testing)
app.post('/api/initdb', async (req, res) => {
  try {
    await pool.query(`CREATE DATABASE IF NOT EXISTS campusride`);
    await pool.query(`USE campusride`);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    res.json({ message: 'Database initialized' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name } = registerSchema.parse(req.body);
    
    // Check if user exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) return res.status(400).json({ error: 'Email already registered' });
    
    const password_hash = await bcrypt.hash(password, 10);
    const id = crypto.randomUUID();
    
    await pool.query(
      'INSERT INTO users (id, email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?, ?)',
      [id, email, password_hash, first_name, last_name]
    );
    
    const token = jwt.sign({ id, email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.status(201).json({ token, user: { id, email, first_name, last_name } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) return res.status(400).json({ error: 'Invalid credentials' });
    const user = users[0];
    
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(400).json({ error: 'Invalid credentials' });
    
    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET || 'secret123', { expiresIn: '1d' });
    res.json({ token, user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name } });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: error.errors[0].message });
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to protect routes
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (token == null) return res.sendStatus(401);
  
  jwt.verify(token, process.env.JWT_SECRET || 'secret123', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

app.get('/api/users/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, first_name, last_name FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) return res.sendStatus(404);
    res.json(users[0]);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
