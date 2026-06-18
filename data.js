const StudentPortalData = {
  studentProfile: {
    id: "STU2026001",
    name: "Aarav Sharma",
    grade: "11th Grade - Science (Section A)",
    rollNo: "24",
    email: "aarav.sharma@school.edu",
    phone: "+91 98765 43210",
    dob: "August 14, 2009",
    bloodGroup: "O+",
    address: "102, Green Glen Layout, Bellandur, Bengaluru, Karnataka, 560103",
    avatar: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aarav",
    guardian: {
      name: "Rajesh Sharma",
      relation: "Father",
      phone: "+91 98765 00123",
      email: "rajesh.sharma@gmail.com"
    },
    emergencyContact: {
      name: "Sunita Sharma",
      relation: "Mother",
      phone: "+91 98765 00124"
    }
  },
  
  attendance: {
    overall: 91.5,
    bySubject: [
      { subject: "Mathematics", present: 38, total: 40, percent: 95 },
      { subject: "Physics", present: 34, total: 38, percent: 89 },
      { subject: "Chemistry", present: 35, total: 38, percent: 92 },
      { subject: "Computer Science", present: 32, total: 34, percent: 94 },
      { subject: "English", present: 28, total: 32, percent: 88 }
    ]
  },
  
  timetable: {
    Monday: [
      { time: "09:00 AM - 10:00 AM", subject: "Mathematics", teacher: "Mrs. K. Murthy", room: "Room 302" },
      { time: "10:00 AM - 11:00 AM", subject: "Physics", teacher: "Dr. R. Prasad", room: "Lab 1" },
      { time: "11:15 AM - 12:15 PM", subject: "English", teacher: "Ms. Sarah Jones", room: "Room 105" },
      { time: "01:00 PM - 02:00 PM", subject: "Computer Science", teacher: "Mr. Amit Shah", room: "Comp Lab" },
      { time: "02:00 PM - 03:00 PM", subject: "Chemistry", teacher: "Dr. Veena Rao", room: "Room 302" }
    ],
    Tuesday: [
      { time: "09:00 AM - 10:00 AM", subject: "Physics", teacher: "Dr. R. Prasad", room: "Room 302" },
      { time: "10:00 AM - 11:00 AM", subject: "Chemistry", teacher: "Dr. Veena Rao", room: "Lab 2" },
      { time: "11:15 AM - 12:15 PM", subject: "Mathematics", teacher: "Mrs. K. Murthy", room: "Room 302" },
      { time: "01:00 PM - 02:00 PM", subject: "English", teacher: "Ms. Sarah Jones", room: "Room 105" },
      { time: "02:00 PM - 03:00 PM", subject: "Computer Science", teacher: "Mr. Amit Shah", room: "Comp Lab" }
    ],
    Wednesday: [
      { time: "09:00 AM - 10:00 AM", subject: "Computer Science", teacher: "Mr. Amit Shah", room: "Comp Lab" },
      { time: "10:00 AM - 11:00 AM", subject: "Mathematics", teacher: "Mrs. K. Murthy", room: "Room 302" },
      { time: "11:15 AM - 12:15 PM", subject: "Physics", teacher: "Dr. R. Prasad", room: "Room 302" },
      { time: "01:00 PM - 02:00 PM", subject: "Chemistry", teacher: "Dr. Veena Rao", room: "Room 302" },
      { time: "02:00 PM - 03:00 PM", subject: "English", teacher: "Ms. Sarah Jones", room: "Room 105" }
    ],
    Thursday: [
      { time: "09:00 AM - 10:00 AM", subject: "Chemistry", teacher: "Dr. Veena Rao", room: "Room 302" },
      { time: "10:00 AM - 11:00 AM", subject: "Computer Science", teacher: "Mr. Amit Shah", room: "Comp Lab" },
      { time: "11:15 AM - 12:15 PM", subject: "English", teacher: "Ms. Sarah Jones", room: "Room 105" },
      { time: "01:00 PM - 02:00 PM", subject: "Mathematics", teacher: "Mrs. K. Murthy", room: "Room 302" },
      { time: "02:00 PM - 03:00 PM", subject: "Physics", teacher: "Dr. R. Prasad", room: "Lab 1" }
    ],
    Friday: [
      { time: "09:00 AM - 10:00 AM", subject: "English", teacher: "Ms. Sarah Jones", room: "Room 105" },
      { time: "10:00 AM - 11:00 AM", subject: "Mathematics", teacher: "Mrs. K. Murthy", room: "Room 302" },
      { time: "11:15 AM - 12:15 PM", subject: "Chemistry", teacher: "Dr. Veena Rao", room: "Room 302" },
      { time: "01:00 PM - 02:00 PM", subject: "Physics", teacher: "Dr. R. Prasad", room: "Room 302" },
      { time: "02:00 PM - 03:00 PM", subject: "Computer Science", teacher: "Mr. Amit Shah", room: "Comp Lab" }
    ],
    Saturday: [],
    Sunday: []
  },
  
  grades: {
    gpa: "3.82",
    terms: [
      {
        id: "term1",
        name: "Term 1 (Half Yearly)",
        gpa: "3.76",
        subjects: [
          { name: "Mathematics", marks: 88, total: 100, grade: "A", remarks: "Excellent analytical skills. Active class participant." },
          { name: "Physics", marks: 84, total: 100, grade: "A", remarks: "Good understanding of concepts. Practical reports are neat." },
          { name: "Chemistry", marks: 82, total: 100, grade: "B+", remarks: "Needs some improvement in organic chemistry, overall solid." },
          { name: "Computer Science", marks: 94, total: 100, grade: "A+", remarks: "Exceptional coding assignments. Outstanding performer." },
          { name: "English", marks: 79, total: 100, grade: "B", remarks: "Creative writer, needs focus on structured essays." }
        ]
      },
      {
        id: "term2",
        name: "Term 2 (Finals)",
        gpa: "3.88",
        subjects: [
          { name: "Mathematics", marks: 92, total: 100, grade: "A+", remarks: "Outstanding improvement, top of the class." },
          { name: "Physics", marks: 87, total: 100, grade: "A", remarks: "Consistently strong performance in theory and labs." },
          { name: "Chemistry", marks: 89, total: 100, grade: "A", remarks: "Great work in chemical kinetics and thermodynamics." },
          { name: "Computer Science", marks: 96, total: 100, grade: "A+", remarks: "Completed advanced project before deadline. Brilliant." },
          { name: "English", marks: 82, total: 100, grade: "A", remarks: "Improved grammar and presentation skills. Well done." }
        ]
      }
    ]
  },
  
  assignments: [
    { id: "asm1", title: "Calculus Worksheet - Limits & Continuity", subject: "Mathematics", dueDate: "2026-06-22", status: "Pending", description: "Complete questions 1 to 15 on pages 144-145 of the textbook. Show all steps clearly.", points: 100 },
    { id: "asm2", title: "Electromagnetic Induction Lab Report", subject: "Physics", dueDate: "2026-06-25", status: "Pending", description: "Submit the write-up for Experiment 6: Lenz's Law verification. Include graph of induced EMF vs. time.", points: 50 },
    { id: "asm3", title: "Chemical Bonding MCQ Quiz", subject: "Chemistry", dueDate: "2026-06-15", status: "Overdue", description: "Submit the answers to the 20 questions distributed in class last Friday.", points: 20 },
    { id: "asm4", title: "Binary Search Tree Implementation", subject: "Computer Science", dueDate: "2026-06-12", status: "Submitted", description: "Implement a BST in Java/C++ with insert, delete, and inorder traversal methods. Submit the source file.", points: 100, submittedAt: "2026-06-11 04:30 PM", feedback: "Well-structured code. Good use of comments." },
    { id: "asm5", title: "Essay: The Industrial Revolution", subject: "English", dueDate: "2026-06-08", status: "Submitted", description: "Write a 1000-word analysis on the socio-economic impacts of the Industrial Revolution in Europe.", points: 50, submittedAt: "2026-06-07 02:15 PM", feedback: "Strong arguments, well structured." }
  ],
  
  billing: {
    outstanding: 15200,
    currency: "₹",
    invoices: [
      { id: "INV-2026-004", title: "Term 3 Tuition Fees", dueDate: "2026-07-05", amount: 15000, status: "Unpaid" },
      { id: "INV-2026-003", title: "Computer Lab Access Fee", dueDate: "2026-06-25", amount: 200, status: "Unpaid" },
      { id: "INV-2026-002", title: "Term 2 Tuition Fees", paidDate: "2025-11-10", amount: 15000, status: "Paid", paymentMethod: "Net Banking" },
      { id: "INV-2026-001", title: "Library Annual Membership", paidDate: "2025-06-05", amount: 1000, status: "Paid", paymentMethod: "UPI" }
    ]
  },
  
  announcements: [
    { id: "ann1", title: "Final Term Examination Schedule", date: "2026-06-15", category: "Academics", summary: "The Final examinations for Grade 11 will commence on July 10th. Detailed date sheet is attached...", content: "Dear Students,\n\nThe detailed schedule for the Final Term Examinations starting from July 10, 2026, has been finalized. Exams will be conducted in the main auditorium from 9:00 AM to 12:00 PM daily.\n\nPlease ensure you carry your physical ID Card. Hall tickets will be issued next week.\n\nGood luck with your preparations!" },
    { id: "ann2", title: "Inter-School Sports Meet 2026", date: "2026-06-12", category: "Sports", summary: "Registrations are open for the upcoming annual sports meet. Trials start this weekend...", content: "Attention Sports Enthusiasts!\n\nThe annual Inter-School Sports Meet is scheduled from June 28th to June 30th. Events include Track & Field, Football, Basketball, Table Tennis, and Swimming.\n\nRegistration forms can be collected from the PE department. Selection trials will begin this Saturday, June 20th at 8:00 AM in the school stadium." },
    { id: "ann3", title: "Science Exhibition: Spark 2026", date: "2026-06-10", category: "Events", summary: "All project synopsis submissions are due by June 22nd. Let your creativity shine!", content: "Our school's annual science exhibition 'Spark 2026' will be held on July 3rd.\n\nStudents can participate individually or in teams of up to 3 members. High-quality project synopsis (minimum 250 words) must be submitted to the Physics Lab coordinator by June 22nd.\n\nOutstanding models will receive cash prizes and merit certificates." }
  ]
};
