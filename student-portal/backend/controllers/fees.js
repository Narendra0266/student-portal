const db = require('../config/db');

// Helper to get student_id from user_id
const getStudentId = async (userId) => {
  const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return students.length > 0 ? students[0].id : null;
};

const getFees = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req.user.id);
      if (!studentId) {
        return res.status(404).json({ error: 'Student record not found.' });
      }
      const [fees] = await db.query('SELECT * FROM fees WHERE student_id = ?', [studentId]);
      return res.json(fees);
    } else {
      // Admins/Teachers get all
      const [fees] = await db.query(`
        SELECT f.*, s.roll_no, s.class, s.section, u.name as student_name 
        FROM fees f
        JOIN students s ON f.student_id = s.id
        JOIN users u ON s.user_id = u.id
        ORDER BY f.due_date DESC
      `);
      return res.json(fees);
    }
  } catch (error) {
    console.error('Error fetching fees:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createFee = async (req, res) => {
  const { student_id, amount, due_date, status } = req.body;

  if (!student_id || !amount || !due_date || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO fees (student_id, amount, due_date, status) VALUES (?, ?, ?, ?)',
      [student_id, amount, due_date, status]
    );
    return res.status(211).json({ message: 'Fee record created.', fee_id: result.insertId });
  } catch (error) {
    console.error('Error creating fee record:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getFees,
  createFee
};
