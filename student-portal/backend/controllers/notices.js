const db = require('../config/db');

// Get all notices
const getNotices = async (req, res) => {
  try {
    const [notices] = await db.query(`
      SELECT n.*, u.name as posted_by_name 
      FROM notices n 
      LEFT JOIN users u ON n.posted_by = u.id 
      ORDER BY n.created_at DESC
    `);
    return res.json(notices);
  } catch (error) {
    console.error('Error fetching notices:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Create a notice
const createNotice = async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO notices (title, content, category, posted_by) VALUES (?, ?, ?, ?)',
      [title, content, category, req.user.id]
    );
    return res.status(211).json({ message: 'Notice posted successfully.', notice_id: result.insertId });
  } catch (error) {
    console.error('Error creating notice:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Delete a notice
const deleteNotice = async (req, res) => {
  const noticeId = req.params.id;

  try {
    const [result] = await db.query('DELETE FROM notices WHERE id = ?', [noticeId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Notice not found.' });
    }
    return res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getNotices,
  createNotice,
  deleteNotice
};
