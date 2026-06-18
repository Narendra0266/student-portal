const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, './.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/students', require('./routes/students'));
app.use('/api/teachers', require('./routes/teachers'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/attendance', require('./routes/attendance'));
app.use('/api/results', require('./routes/results'));
app.use('/api/fees', require('./routes/fees'));
app.use('/api/notices', require('./routes/notices'));
app.use('/api/assignments', require('./routes/assignments'));
app.use('/api/parents', require('./routes/parents'));

// Serve index.html as fallback for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(` Modern Student Portal Server is now active!`);
  console.log(` Running on port: ${PORT}`);
  console.log(` Local URL: http://localhost:${PORT}`);
  console.log(`===================================================`);
});
