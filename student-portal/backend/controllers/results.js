const db = require('../config/db');

// Helper to get student_id from user_id
const getStudentId = async (userId) => {
  const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return students.length > 0 ? students[0].id : null;
};

const getResults = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req.user.id);
      if (!studentId) {
        return res.status(404).json({ error: 'Student record not found.' });
      }
      const [results] = await db.query('SELECT * FROM results WHERE student_id = ?', [studentId]);
      return res.json(results);
    } else {
      const [results] = await db.query(`
        SELECT r.*, s.roll_no, s.class, s.section, u.name as student_name 
        FROM results r
        JOIN students s ON r.student_id = s.id
        JOIN users u ON s.user_id = u.id
        ORDER BY r.exam_name, s.class, CAST(s.roll_no AS UNSIGNED)
      `);
      return res.json(results);
    }
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const uploadResults = async (req, res) => {
  const { student_id, exam_name, subject, marks_obtained, total_marks, grade } = req.body;

  if (!student_id || !exam_name || !subject || marks_obtained === undefined || !total_marks || !grade) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const [existing] = await db.query(
      'SELECT id FROM results WHERE student_id = ? AND exam_name = ? AND subject = ?',
      [student_id, exam_name, subject]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE results SET marks_obtained = ?, total_marks = ?, grade = ? WHERE id = ?',
        [marks_obtained, total_marks, grade, existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO results (student_id, exam_name, subject, marks_obtained, total_marks, grade) VALUES (?, ?, ?, ?, ?, ?)',
        [student_id, exam_name, subject, marks_obtained, total_marks, grade]
      );
    }
    return res.json({ message: 'Result uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading results:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getResults,
  uploadResults
};
