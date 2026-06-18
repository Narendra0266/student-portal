const db = require('../config/db');

// Helper to get student_id from user_id
const getStudentId = async (userId) => {
  const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return students.length > 0 ? students[0].id : null;
};

// Get assignments
const getAssignments = async (req, res) => {
  try {
    if (req.user.role === 'student') {
      const studentId = await getStudentId(req.user.id);
      const [students] = await db.query('SELECT class FROM students WHERE user_id = ?', [req.user.id]);
      if (!studentId || students.length === 0) {
        return res.status(404).json({ error: 'Student record not found.' });
      }

      const studentClass = students[0].class;
      const [assignments] = await db.query(
        `SELECT a.*, COALESCE(sa.status, 'pending') as status, sa.submitted_at 
         FROM assignments a 
         LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ? 
         WHERE a.class = ?`,
        [studentId, studentClass]
      );
      return res.json(assignments);
    } else {
      // Teachers and Admins get all or by query param 'class'
      const { class: filterClass } = req.query;
      let query = 'SELECT * FROM assignments';
      let params = [];
      if (filterClass) {
        query += ' WHERE class = ?';
        params.push(filterClass);
      }
      const [assignments] = await db.query(query, params);
      return res.json(assignments);
    }
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Create assignment
const createAssignment = async (req, res) => {
  const { title, description, class: targetClass, subject, due_date } = req.body;

  if (!title || !description || !targetClass || !subject || !due_date) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO assignments (title, description, class, subject, due_date, posted_by) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, targetClass, subject, due_date, req.user.id]
    );

    const assignmentId = result.insertId;

    // Link to all students in that class
    const [students] = await db.query('SELECT id FROM students WHERE class = ?', [targetClass]);
    for (const student of students) {
      await db.query(
        'INSERT INTO student_assignments (assignment_id, student_id, status) VALUES (?, ?, \'pending\')',
        [assignmentId, student.id]
      );
    }

    return res.status(211).json({ message: 'Assignment created.', assignmentId });
  } catch (error) {
    console.error('Error creating assignment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// Submit assignment
const submitAssignment = async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student record not found.' });
    }

    const [existing] = await db.query(
      'SELECT id FROM student_assignments WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    if (existing.length > 0) {
      await db.query(
        'UPDATE student_assignments SET status = \'submitted\', submitted_at = NOW() WHERE id = ?',
        [existing[0].id]
      );
    } else {
      await db.query(
        'INSERT INTO student_assignments (assignment_id, student_id, status, submitted_at) VALUES (?, ?, \'submitted\', NOW())',
        [assignmentId, studentId]
      );
    }

    return res.json({ message: 'Assignment submitted.' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getAssignments,
  createAssignment,
  submitAssignment
};
