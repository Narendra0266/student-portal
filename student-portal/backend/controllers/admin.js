const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. Admin Dashboard Statistics
const getDashboardStats = async (req, res) => {
  try {
    const [[studentsCount]] = await db.query('SELECT COUNT(*) as count FROM students');
    const [[teachersCount]] = await db.query('SELECT COUNT(*) as count FROM teachers');
    const [[feesPaidSum]] = await db.query("SELECT COALESCE(SUM(amount), 0) as total FROM fees WHERE status = 'paid'");
    const [[attendanceAvg]] = await db.query(`
      SELECT COALESCE(
        (SUM(CASE WHEN status = 'present' THEN 1 WHEN status = 'late' THEN 0.5 ELSE 0 END) / COUNT(*)) * 100, 
        0
      ) as average 
      FROM attendance
    `);

    return res.json({
      totalStudents: studentsCount.count,
      totalTeachers: teachersCount.count,
      totalFeesCollected: parseFloat(feesPaidSum.total),
      averageAttendance: Math.round(parseFloat(attendanceAvg.average))
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 2. Institutions
const getInstitutions = async (req, res) => {
  try {
    const [institutions] = await db.query('SELECT * FROM institutions');
    return res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ==========================================
// STUDENT CRUD
// ==========================================
const getStudents = async (req, res) => {
  try {
    const [students] = await db.query(`
      SELECT s.id as student_id, s.user_id, s.roll_no, s.class, s.section, s.dob, 
             s.father_name, s.address, s.phone, s.photo_url,
             u.name, u.email, u.institution_id, i.name as institution_name
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN institutions i ON u.institution_id = i.id
      ORDER BY u.name
    `);
    return res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createStudent = async (req, res) => {
  const { name, email, password, institution_id, roll_no, class: cls, section, dob, father_name, address, phone, photo_url } = req.body;

  if (!name || !email || !password || !roll_no || !cls || !section || !dob || !father_name || !address || !phone) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  // Create connection to run transaction
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Create user entry
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO users (name, email, password, role, institution_id) VALUES (?, ?, ?, 'student', ?)`,
      [name, email, hashedPassword, institution_id || null]
    );

    const userId = userResult.insertId;

    // 2. Create student entry
    const [studentResult] = await conn.query(
      `INSERT INTO students (user_id, roll_no, class, section, dob, father_name, address, phone, photo_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, roll_no, cls, section, dob, father_name, address, phone, photo_url || null]
    );

    await conn.commit();
    return res.status(211).json({
      message: 'Student created successfully.',
      student_id: studentResult.insertId,
      user_id: userId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

const updateStudent = async (req, res) => {
  const studentId = req.params.id;
  const { name, email, password, institution_id, roll_no, class: cls, section, dob, father_name, address, phone, photo_url } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // Find student to get user_id
    const [students] = await conn.query('SELECT user_id FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Student not found.' });
    }
    const userId = students[0].user_id;

    // 1. Update user
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await conn.query(
        'UPDATE users SET name = ?, email = ?, password = ?, institution_id = ? WHERE id = ?',
        [name, email, hashedPassword, institution_id || null, userId]
      );
    } else {
      await conn.query(
        'UPDATE users SET name = ?, email = ?, institution_id = ? WHERE id = ?',
        [name, email, institution_id || null, userId]
      );
    }

    // 2. Update student
    await conn.query(
      `UPDATE students 
       SET roll_no = ?, class = ?, section = ?, dob = ?, father_name = ?, address = ?, phone = ?, photo_url = ? 
       WHERE id = ?`,
      [roll_no, cls, section, dob, father_name, address, phone, photo_url || null, studentId]
    );

    await conn.commit();
    return res.json({ message: 'Student updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating student:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

const deleteStudent = async (req, res) => {
  const studentId = req.params.id;

  try {
    const [students] = await db.query('SELECT user_id FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student not found.' });
    }
    const userId = students[0].user_id;

    // Delete user (cascades to students and related child tables)
    await db.query('DELETE FROM users WHERE id = ?', [userId]);

    return res.json({ message: 'Student deleted successfully.' });
  } catch (error) {
    console.error('Error deleting student:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ==========================================
// TEACHER CRUD
// ==========================================
const getTeachers = async (req, res) => {
  try {
    const [teachers] = await db.query(`
      SELECT t.id as teacher_id, t.user_id, t.subject, t.assigned_classes, 
             u.name, u.email, u.institution_id, i.name as institution_name
      FROM teachers t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN institutions i ON u.institution_id = i.id
      ORDER BY u.name
    `);
    return res.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createTeacher = async (req, res) => {
  const { name, email, password, institution_id, subject, assigned_classes } = req.body;

  if (!name || !email || !password || !subject || !assigned_classes) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    // 1. Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await conn.query(
      `INSERT INTO users (name, email, password, role, institution_id) VALUES (?, ?, ?, 'teacher', ?)`,
      [name, email, hashedPassword, institution_id || null]
    );

    const userId = userResult.insertId;

    // 2. Create teacher
    const [teacherResult] = await conn.query(
      `INSERT INTO teachers (user_id, subject, assigned_classes) VALUES (?, ?, ?)`,
      [userId, subject, assigned_classes]
    );

    await conn.commit();
    return res.status(211).json({
      message: 'Teacher created successfully.',
      teacher_id: teacherResult.insertId,
      user_id: userId
    });
  } catch (error) {
    await conn.rollback();
    console.error('Error creating teacher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

const updateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  const { name, email, password, institution_id, subject, assigned_classes } = req.body;

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [teachers] = await conn.query('SELECT user_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      conn.release();
      return res.status(404).json({ error: 'Teacher not found.' });
    }
    const userId = teachers[0].user_id;

    // 1. Update user
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await conn.query(
        'UPDATE users SET name = ?, email = ?, password = ?, institution_id = ? WHERE id = ?',
        [name, email, hashedPassword, institution_id || null, userId]
      );
    } else {
      await conn.query(
        'UPDATE users SET name = ?, email = ?, institution_id = ? WHERE id = ?',
        [name, email, institution_id || null, userId]
      );
    }

    // 2. Update teacher
    await conn.query(
      'UPDATE teachers SET subject = ?, assigned_classes = ? WHERE id = ?',
      [subject, assigned_classes, teacherId]
    );

    await conn.commit();
    return res.json({ message: 'Teacher updated successfully.' });
  } catch (error) {
    await conn.rollback();
    console.error('Error updating teacher:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ error: 'Email already exists.' });
    }
    return res.status(500).json({ error: 'Internal server error.' });
  } finally {
    conn.release();
  }
};

const deleteTeacher = async (req, res) => {
  const teacherId = req.params.id;

  try {
    const [teachers] = await db.query('SELECT user_id FROM teachers WHERE id = ?', [teacherId]);
    if (teachers.length === 0) {
      return res.status(404).json({ error: 'Teacher not found.' });
    }
    const userId = teachers[0].user_id;

    await db.query('DELETE FROM users WHERE id = ?', [userId]);
    return res.json({ message: 'Teacher deleted successfully.' });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ==========================================
// NOTICES CRUD
// ==========================================
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

const createNotice = async (req, res) => {
  const { title, content, category } = req.body;

  if (!title || !content || !category) {
    return res.status(400).json({ error: 'Title, content, and category are required.' });
  }

  try {
    const postedBy = req.user.id;
    const [result] = await db.query(
      'INSERT INTO notices (title, content, category, posted_by) VALUES (?, ?, ?, ?)',
      [title, content, category, postedBy]
    );
    return res.status(211).json({ message: 'Notice created successfully.', notice_id: result.insertId });
  } catch (error) {
    console.error('Error creating notice:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateNotice = async (req, res) => {
  const noticeId = req.params.id;
  const { title, content, category } = req.body;

  try {
    await db.query(
      'UPDATE notices SET title = ?, content = ?, category = ? WHERE id = ?',
      [title, content, category, noticeId]
    );
    return res.json({ message: 'Notice updated successfully.' });
  } catch (error) {
    console.error('Error updating notice:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteNotice = async (req, res) => {
  const noticeId = req.params.id;

  try {
    await db.query('DELETE FROM notices WHERE id = ?', [noticeId]);
    return res.json({ message: 'Notice deleted successfully.' });
  } catch (error) {
    console.error('Error deleting notice:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ==========================================
// TIMETABLE CRUD
// ==========================================
const getTimetable = async (req, res) => {
  try {
    const [slots] = await db.query(`
      SELECT t.*, u.name as teacher_name 
      FROM timetable t 
      LEFT JOIN teachers tc ON t.teacher_id = tc.id 
      LEFT JOIN users u ON tc.user_id = u.id 
      ORDER BY t.class, t.section, FIELD(t.day, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'), t.start_time
    `);
    return res.json(slots);
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createTimetableSlot = async (req, res) => {
  const { class: cls, section, day, subject, start_time, end_time, teacher_id } = req.body;

  if (!cls || !section || !day || !subject || !start_time || !end_time) {
    return res.status(400).json({ error: 'Required fields are missing.' });
  }

  try {
    const [result] = await db.query(
      `INSERT INTO timetable (class, section, day, subject, start_time, end_time, teacher_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [cls, section, day, subject, start_time, end_time, teacher_id || null]
    );
    return res.status(211).json({ message: 'Timetable slot created.', slot_id: result.insertId });
  } catch (error) {
    console.error('Error creating timetable slot:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateTimetableSlot = async (req, res) => {
  const slotId = req.params.id;
  const { class: cls, section, day, subject, start_time, end_time, teacher_id } = req.body;

  try {
    await db.query(
      `UPDATE timetable 
       SET class = ?, section = ?, day = ?, subject = ?, start_time = ?, end_time = ?, teacher_id = ? 
       WHERE id = ?`,
      [cls, section, day, subject, start_time, end_time, teacher_id || null, slotId]
    );
    return res.json({ message: 'Timetable slot updated successfully.' });
  } catch (error) {
    console.error('Error updating timetable slot:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteTimetableSlot = async (req, res) => {
  const slotId = req.params.id;

  try {
    await db.query('DELETE FROM timetable WHERE id = ?', [slotId]);
    return res.json({ message: 'Timetable slot deleted successfully.' });
  } catch (error) {
    console.error('Error deleting timetable slot:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// ==========================================
// FEES CRUD (Admin management of student fees)
// ==========================================
const getFees = async (req, res) => {
  try {
    const [fees] = await db.query(`
      SELECT f.*, s.roll_no, s.class, s.section, u.name as student_name 
      FROM fees f 
      JOIN students s ON f.student_id = s.id 
      JOIN users u ON s.user_id = u.id 
      ORDER BY f.due_date DESC
    `);
    return res.json(fees);
  } catch (error) {
    console.error('Error fetching fees:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const createFeeRecord = async (req, res) => {
  const { student_id, amount, due_date, status } = req.body;

  if (!student_id || !amount || !due_date || !status) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    const [result] = await db.query(
      'INSERT INTO fees (student_id, amount, due_date, status) VALUES (?, ?, ?, ?)',
      [student_id, amount, due_date, status]
    );
    return res.status(211).json({ message: 'Fee record created successfully.', fee_id: result.insertId });
  } catch (error) {
    console.error('Error creating fee record:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const updateFeeRecord = async (req, res) => {
  const feeId = req.params.id;
  const { student_id, amount, due_date, paid_date, status, receipt_no } = req.body;

  try {
    await db.query(
      `UPDATE fees 
       SET student_id = ?, amount = ?, due_date = ?, paid_date = ?, status = ?, receipt_no = ? 
       WHERE id = ?`,
      [student_id, amount, due_date, paid_date || null, status, receipt_no || null, feeId]
    );
    return res.json({ message: 'Fee record updated successfully.' });
  } catch (error) {
    console.error('Error updating fee record:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

const deleteFeeRecord = async (req, res) => {
  const feeId = req.params.id;

  try {
    await db.query('DELETE FROM fees WHERE id = ?', [feeId]);
    return res.json({ message: 'Fee record deleted successfully.' });
  } catch (error) {
    console.error('Error deleting fee record:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getDashboardStats,
  getInstitutions,
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getNotices,
  createNotice,
  updateNotice,
  deleteNotice,
  getTimetable,
  createTimetableSlot,
  updateTimetableSlot,
  deleteTimetableSlot,
  getFees,
  createFeeRecord,
  updateFeeRecord,
  deleteFeeRecord
};
