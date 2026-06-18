const db = require('../config/db');

// Helper to get student_id from user_id
const getStudentId = async (userId) => {
  const [students] = await db.query('SELECT id FROM students WHERE user_id = ?', [userId]);
  return students.length > 0 ? students[0].id : null;
};

// 1. Get own profile
const getProfile = async (req, res) => {
  try {
    const [profiles] = await db.query(
      `SELECT s.*, u.name, u.email, i.name as institution_name 
       FROM students s 
       JOIN users u ON s.user_id = u.id 
       LEFT JOIN institutions i ON u.institution_id = i.id 
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (profiles.length === 0) {
      return res.status(404).json({ error: 'Student profile not found.' });
    }

    // Add mock emergency/guardian details consistent with frontend mock structure
    const profile = profiles[0];
    const fullProfile = {
      ...profile,
      guardian: {
        name: profile.father_name,
        relation: 'Father',
        phone: profile.phone,
        email: 'guardian@example.com'
      },
      emergencyContact: {
        name: profile.father_name,
        relation: 'Father',
        phone: profile.phone
      },
      bloodGroup: 'O+'
    };

    return res.json(fullProfile);
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 2. Monthly attendance with percentage
const getAttendance = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

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

    // Standard percentage calculation: present counts 1, late counts 0.5 (or 1 depending on school)
    // Let's count present + late as attended, or present = 1, late = 0.5
    const attendedWeight = presentCount + (lateCount * 0.5);
    const overallPercentage = Math.round((attendedWeight / totalCount) * 100);

    // Group by subject
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
    console.error('Error fetching attendance:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 3. All exam results with grades
const getResults = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    const [results] = await db.query(
      `SELECT * FROM results WHERE student_id = ?`,
      [studentId]
    );

    // Group by exam_name
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

    // Calculate GPAs for each term
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

    // Calculate overall GPA
    const totalGpaSum = terms.reduce((acc, term) => acc + parseFloat(term.gpa), 0);
    const overallGpa = terms.length > 0 ? (totalGpaSum / terms.length).toFixed(2) : '0.00';

    return res.json({
      gpa: overallGpa,
      terms
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 4. Fee history and due status
const getFees = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

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
    console.error('Error fetching fees:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 5. Weekly schedule
const getTimetable = async (req, res) => {
  try {
    const [students] = await db.query('SELECT class, section FROM students WHERE user_id = ?', [req.user.id]);
    if (students.length === 0) {
      return res.status(404).json({ error: 'Student records not found.' });
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

    // Group by day
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
        // Format time display: 09:00:00 -> 9:00 AM
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
    console.error('Error fetching timetable:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 6. Pending and submitted assignments
const getAssignments = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    const [students] = await db.query('SELECT class FROM students WHERE user_id = ?', [req.user.id]);
    if (!studentId || students.length === 0) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    const studentClass = students[0].class;

    const [assignments] = await db.query(
      `SELECT a.*, 
              COALESCE(sa.status, 'pending') as status, 
              sa.submitted_at 
       FROM assignments a 
       LEFT JOIN student_assignments sa ON a.id = sa.assignment_id AND sa.student_id = ? 
       WHERE a.class = ?`,
      [studentId, studentClass]
    );

    return res.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 7. Mark assignment submitted
const submitAssignment = async (req, res) => {
  const assignmentId = req.params.id;

  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    // Check if entry already exists in student_assignments
    const [existing] = await db.query(
      'SELECT id FROM student_assignments WHERE assignment_id = ? AND student_id = ?',
      [assignmentId, studentId]
    );

    if (existing.length > 0) {
      await db.query(
        `UPDATE student_assignments 
         SET status = 'submitted', submitted_at = NOW() 
         WHERE assignment_id = ? AND student_id = ?`,
        [assignmentId, studentId]
      );
    } else {
      await db.query(
        `INSERT INTO student_assignments (assignment_id, student_id, status, submitted_at) 
         VALUES (?, ?, 'submitted', NOW())`,
        [assignmentId, studentId]
      );
    }

    return res.json({ message: 'Assignment submitted successfully.' });
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 8. Issued library books
const getLibrary = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    const [books] = await db.query(
      `SELECT * FROM \`library\` WHERE student_id = ?`,
      [studentId]
    );

    return res.json(books);
  } catch (error) {
    console.error('Error fetching library details:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 9. Bus details
const getTransport = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    const [routes] = await db.query(
      `SELECT * FROM transport WHERE student_id = ?`,
      [studentId]
    );

    if (routes.length === 0) {
      return res.json({ message: 'No transport service registered.' });
    }

    return res.json(routes[0]);
  } catch (error) {
    console.error('Error fetching transport details:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

// 10. Hostel info
const getHostel = async (req, res) => {
  try {
    const studentId = await getStudentId(req.user.id);
    if (!studentId) {
      return res.status(404).json({ error: 'Student records not found.' });
    }

    const [rooms] = await db.query(
      `SELECT * FROM hostel WHERE student_id = ?`,
      [studentId]
    );

    if (rooms.length === 0) {
      return res.json({ message: 'No hostel room allocated.' });
    }

    return res.json(rooms[0]);
  } catch (error) {
    console.error('Error fetching hostel details:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }
};

module.exports = {
  getProfile,
  getAttendance,
  getResults,
  getFees,
  getTimetable,
  getAssignments,
  submitAssignment,
  getLibrary,
  getTransport,
  getHostel
};
