const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  try {
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT token (expires in 8 hours)
    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id
      },
      process.env.JWT_SECRET || 'modern_group_secret_key_2026',
      { expiresIn: '8h' }
    );

    return res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        institution_id: user.institution_id
      }
    });
  } catch (error) {
    console.error('Error during login:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const logout = (req, res) => {
  return res.json({ message: 'Logout successful. Token cleared from client.' });
};

module.exports = {
  login,
  logout
};
