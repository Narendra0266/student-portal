const db = require('../config/db');

// Helper to get teacher_id from user_id
const getTeacherDetails = async (userId) => {
  const [teachers] = await db.query('SELECT * FROM teachers WHERE user_id = ?', [userId]);
  return teachers.length > 0 ? teachers[0] : null;
};

// 1. Get assigned classes and subjects
const getClasses = async (req, res) => {
  try {
    const teacher = await getTeacherDetails(req.user.id);
    if (!teacher) {
      return res.status(404).json({ error: 'Teacher record not found.' });
    }

    // assigned_classes is comma-separated like "11th-A,12th-A"
    const classes = teacher.assigned_classes.split(',').map(cls => {
      const parts = cls.trim().split('-');
      return {
        className: parts[0],
        section: parts[1] || 'A',
        subject: teacher.subject
      };
    });

    return res.json({
      teacherId: teacher.id,
      subject: teacher.subject,
      classes
    });
  } catch (error) {
    console.error('Error fetching teacher classes:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 2. Get student list for a class (expects class-section format, e.g. "11th-A")
const getStudentsByClass = async (req, res) => {
  const classParam = req.params.class; // e.g., "11th-A"
  const parts = classParam.split('-');
  const className = parts[0];
  const section = parts[1] || 'A';

  try {
    const [students] = await db.query(
      `SELECT s.id as student_id, s.roll_no, s.class, s.section, u.name, u.email 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.class = ? AND s.section = ?
       ORDER BY CAST(s.roll_no AS UNSIGNED), s.roll_no`,
      [className, section]
    );

    return res.json(students);
  } catch (error) {
    console.error('Error fetching students by class:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 3. Bulk mark attendance
const markAttendance = async (req, res) => {
  const { date, subject, attendanceList } = req.body;

  if (!date || !subject || !attendanceList || !Array.isArray(attendanceList)) {
    return res.status(400).json({ error: 'Invalid attendance parameters.' });
  }

  try {
    const markedBy = req.user.id;

    for (const record of attendanceList) {
      const { student_id, status } = record; // status: 'present', 'absent', 'late'

      // Check if attendance already exists for this student, date, and subject
      const [existing] = await db.query(
        'SELECT id FROM attendance WHERE student_id = ? AND date = ? AND subject = ?',
        [student_id, date, subject]
      );

      if (existing.length > 0) {
        // Update existing record
        await db.query(
          'UPDATE attendance SET status = ?, marked_by = ? WHERE id = ?',
          [status, markedBy, existing[0].id]
        );
      } else {
        // Insert new record
        await db.query(
          'INSERT INTO attendance (student_id, date, status, subject, marked_by) VALUES (?, ?, ?, ?, ?)',
          [student_id, date, status, subject, markedBy]
        );
      }
    }

    return res.json({ message: 'Attendance marked successfully.' });
  } catch (error) {
    console.error('Error marking attendance:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 4. Upload marks for a student
const uploadResults = async (req, res) => {
  const { student_id, exam_name, subject, marks_obtained, total_marks, grade } = req.body;

  if (!student_id || !exam_name || !subject || marks_obtained === undefined || !total_marks || !grade) {
    return res.status(400).json({ error: 'All result fields are required.' });
  }

  try {
    // Check if result already exists for this student, exam, and subject
    const [existing] = await db.query(
      'SELECT id FROM results WHERE student_id = ? AND exam_name = ? AND subject = ?',
      [student_id, exam_name, subject]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE results 
         SET marks_obtained = ?, total_marks = ?, grade = ? 
         WHERE id = ?`,
        [marks_obtained, total_marks, grade, existing[0].id]
      );
    } else {
      await db.query(
        `INSERT INTO results (student_id, exam_name, subject, marks_obtained, total_marks, grade) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [student_id, exam_name, subject, marks_obtained, total_marks, grade]
      );
    }

    return res.json({ message: 'Result uploaded successfully.' });
  } catch (error) {
    console.error('Error uploading results:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 5. Post new assignment
const createAssignment = async (req, res) => {
  const { title, description, class: targetClass, subject, due_date } = req.body;

  if (!title || !description || !targetClass || !subject || !due_date) {
    return res.status(400).json({ error: 'All assignment fields are required.' });
  }

  try {
    const postedBy = req.user.id;

    // Create the assignment
    const [result] = await db.query(
      `INSERT INTO assignments (title, description, class, subject, due_date, posted_by) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, description, targetClass, subject, due_date, postedBy]
    );

    const assignmentId = result.insertId;

    // Auto-create student_assignments records for all students in that class
    const [students] = await db.query(
      'SELECT id FROM students WHERE class = ?',
      [targetClass]
    );

    for (const student of students) {
      await db.query(
        `INSERT INTO student_assignments (assignment_id, student_id, status) 
         VALUES (?, ?, 'pending')`,
        [assignmentId, student.id]
      );
    }

    return res.status(211).json({
      message: 'Assignment posted successfully and linked to students.',
      assignmentId
    });
  } catch (error) {
    console.error('Error posting assignment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getClasses,
  getStudentsByClass,
  markAttendance,
  uploadResults,
  createAssignment
};
