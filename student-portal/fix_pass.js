const bcrypt = require('bcryptjs');
const db = require('./backend/config/db');
(async () => {
  const hash = await bcrypt.hash('password123', 10);
  await db.query('UPDATE users SET password=? WHERE email="parent@modern.edu"', [hash]);
  console.log("Fixed!");
  process.exit(0);
})();
