const db = require('../config/db');

// Helper to get child's student_id and relation from parent's user_id
const getChildInfo = async (userId) => {
  const [parents] = await db.query('SELECT student_id, relation FROM parents WHERE user_id = ?', [userId]);
  return parents.length > 0 ? parents[0] : null;
};

// 1. Get child profile
const getChildProfile = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const { student_id, relation } = parentInfo;

    const [profiles] = await db.query(
      `SELECT s.*, u.name, u.email, i.name as institution_name 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN institutions i ON u.institution_id = i.id 
       WHERE s.id = ?`,
      [student_id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Child profile not found.' });
    }

    const profile = profiles[0];
    const fullProfile = {
      ...profile,
      guardian: {
        name: req.user.name,
        relation: relation,
        phone: profile.phone,
        email: req.user.email
      },
      emergencyContact: {
        name: req.user.name,
        relation: relation,
        phone: profile.phone
      },
      bloodGroup: 'O+'
    };

    return res.json(fullProfile);
  } catch (error) {
    console.error('Error fetching child profile:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 2. Child attendance with percentage
const getChildAttendance = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const studentId = parentInfo.student_id;

    // Fetch all attendance for student
    const [records] = await db.query(
      `SELECT * FROM attendance WHERE student_id = ?`,
      [studentId]
    );

    if (records.length === 0) {
      return res.json({ overall: 0, presentCount: 0, totalCount: 0, bySubject: [] });
    }

    const totalCount = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const absentCount = records.filter(r => r.status === 'absent').length;

    const attendedWeight = presentCount + (lateCount * 0.5);
    const overallPercentage = Math.round((attendedWeight / totalCount) * 100);

    const subjectMap = {};
    records.forEach(r => {
      if (!subjectMap[r.subject]) {
        subjectMap[r.subject] = { subject: r.subject, total: 0, present: 0, late: 0, absent: 0 };
      }
      subjectMap[r.subject].total++;
      if (r.status === 'present') subjectMap[r.subject].present++;
      else if (r.status === 'late') subjectMap[r.subject].late++;
      else if (r.status === 'absent') subjectMap[r.subject].absent++;
    });

    const bySubject = Object.values(subjectMap).map(sub => {
      const subAttended = sub.present + (sub.late * 0.5);
      return {
        ...sub,
        percent: Math.round((subAttended / sub.total) * 100)
      };
    });

    return res.json({
      overall: overallPercentage,
      presentCount,
      lateCount,
      absentCount,
      totalCount,
      bySubject
    });
  } catch (error) {
    console.error('Error fetching child attendance:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 3. All exam results with grades
const getChildResults = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const studentId = parentInfo.student_id;

    const [results] = await db.query(
      `SELECT * FROM results WHERE student_id = ?`,
      [studentId]
    );

    const examMap = {};
    results.forEach(r => {
      if (!examMap[r.exam_name]) {
        examMap[r.exam_name] = { examName: r.exam_name, subjects: [], totalMarks: 0, obtainedMarks: 0 };
      }
      examMap[r.exam_name].subjects.push({
        name: r.subject,
        marks: parseFloat(r.marks_obtained),
        total: parseFloat(r.total_marks),
        grade: r.grade,
        remarks: parseFloat(r.marks_obtained) >= 90 ? 'Outstanding' : parseFloat(r.marks_obtained) >= 75 ? 'Good' : 'Satisfactory'
      });
      examMap[r.exam_name].totalMarks += parseFloat(r.total_marks);
      examMap[r.exam_name].obtainedMarks += parseFloat(r.marks_obtained);
    });

    const terms = Object.values(examMap).map((exam, index) => {
      const avgPercentage = (exam.obtainedMarks / exam.totalMarks) * 100;
      let gpa = 4.0;
      if (avgPercentage >= 90) gpa = 4.0;
      else if (avgPercentage >= 80) gpa = 3.6;
      else if (avgPercentage >= 70) gpa = 3.2;
      else if (avgPercentage >= 60) gpa = 2.8;
      else gpa = 2.4;

      return {
        id: `term-${index + 1}`,
        name: exam.examName,
        gpa: gpa.toFixed(2),
        subjects: exam.subjects
      };
    });

    const totalGpaSum = terms.reduce((acc, term) => acc + parseFloat(term.gpa), 0);
    const overallGpa = terms.length > 0 ? (totalGpaSum / terms.length).toFixed(2) : '0.00';

    return res.json({
      gpa: overallGpa,
      terms
    });
  } catch (error) {
    console.error('Error fetching child results:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 4. Fee history and due status
const getChildFees = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const studentId = parentInfo.student_id;

    const [invoices] = await db.query(
      `SELECT * FROM fees WHERE student_id = ?`,
      [studentId]
    );

    const outstanding = invoices
      .filter(f => f.status === 'unpaid')
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    const paidTotal = invoices
      .filter(f => f.status === 'paid')
      .reduce((acc, curr) => acc + parseFloat(curr.amount), 0);

    return res.json({
      currency: '₹',
      outstanding,
      paidTotal,
      invoices
    });
  } catch (error) {
    console.error('Error fetching child fees:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 5. Weekly schedule
const getChildTimetable = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const studentId = parentInfo.student_id;

    const [students] = await db.query('SELECT class, section FROM students WHERE id = ?', [studentId]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Child records not found.' });
    }

    const { class: studentClass, section: studentSection } = students[0];

    const [slots] = await db.query(
      `SELECT t.*, u.name as teacher_name 
       FROM timetable t 
       LEFT JOIN teachers tc ON t.teacher_id = tc.id 
       LEFT JOIN users u ON tc.user_id = u.id 
       WHERE t.class = ? AND t.section = ?
       ORDER BY t.start_time`,
      [studentClass, studentSection]
    );

    const timetable = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: []
    };

    slots.forEach(slot => {
      if (timetable[slot.day]) {
        const start = slot.start_time.substring(0, 5);
        const end = slot.end_time.substring(0, 5);
        
        timetable[slot.day].push({
          time: `${start} - ${end}`,
          subject: slot.subject,
          teacher: slot.teacher_name || 'N/A',
          room: 'Room ' + (slot.section === 'A' ? '101' : '102')
        });
      }
    });

    return res.json(timetable);
  } catch (error) {
    console.error('Error fetching child timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 6. Pay fees online
const payFees = async (req, res) => {
  try {
    const parentInfo = await getChildInfo(req.user.id);
    if (!parentInfo) {
      return res.status(404).json({ error: 'Parent record not found.' });
    }
    const studentId = parentInfo.student_id;

    // Simulate payment process
    await db.query(`UPDATE fees SET status = 'paid' WHERE student_id = ? AND status = 'unpaid'`, [studentId]);
    return res.json({ message: 'Fees paid successfully.' });
  } catch (error) {
    console.error('Error paying fees:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 7. Get messages
const getMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const [messages] = await db.query(
      `SELECT m.*, u.name as sender_name, u.role as sender_role 
       FROM messages m 
       JOIN users u ON m.sender_id = u.id 
       WHERE m.receiver_id = ? OR m.sender_id = ? 
       ORDER BY m.timestamp ASC`,
      [userId, userId]
    );
    return res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 8. Send message
const sendMessage = async (req, res) => {
  try {
    const { receiver_id, content } = req.body;
    const sender_id = req.user.id;

    if (!receiver_id || !content) {
      return res.status(400).json({ error: 'Receiver ID and content are required.' });
    }

    await db.query(
      `INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)`,
      [sender_id, receiver_id, content]
    );
    return res.json({ message: 'Message sent successfully.' });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getChildProfile,
  getChildAttendance,
  getChildResults,
  getChildFees,
  getChildTimetable,
  payFees,
  getMessages,
  sendMessage
};
