const db = require('../config/db');

// Helper to get student_id from user_id
const getStudentId = async (userId) => {
  const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return students.length > 0 ? students[0].id : null;
};

const getAttendance = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req.user.id);
      if (!studentId) {
        return res.status(404).json({ error: 'Student record not found.' });
      }
      const [records] = await db.query('SELECT * FROM attendance WHERE student_id = ?', [studentId]);
      return res.json(records);
    } else {
      // Teachers/Admins get all
      const [records] = await db.query(`
        SELECT a.*, s.roll_no, s.class, s.section, u.name as student_name 
        FROM attendance a
        JOIN students s ON a.student_id = s.id
        JOIN users u ON s.user_id = u.id
        ORDER BY a.date DESC
      `);
      return res.json(records);
    }
  } catch (error) {
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const markAttendance = async (req, res) => {
  const { date, subject, attendanceList } = req.body;

  if (!date || !subject || !attendanceList || !Array.isArray(attendanceList)) {
    return res.status(400).json({ error: 'Missing parameters.' });
  }

  try {
    for (const record of attendanceList) {
      const { student_id, status } = record;

      const [existing] = await db.query(
        'SELECT id FROM attendance WHERE student_id = ? AND date = ? AND subject = ?',
        [student_id, date, subject]
      );

      if (existing.length > 0) {
        await db.query(
          'UPDATE attendance SET status = ?, marked_by = ? WHERE id = ?',
          [status, req.user.id, existing[0].id]
        );
      } else {
        await db.query(
          'INSERT INTO attendance (student_id, date, status, subject, marked_by) VALUES (?, ?, ?, ?, ?)',
          [student_id, date, status, subject, req.user.id]
        );
      }
    }
    return res.json({ message: 'Attendance marked successfully.' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getAttendance,
  markAttendance
};
