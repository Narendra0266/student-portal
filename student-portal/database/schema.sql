CREATE DATABASE IF NOT EXISTS school_portal;
USE school_portal;

-- Disable checks to ease clean rebuild
SET FOREIGN_KEY_CHECKS = 0;

DROP TABLE IF EXISTS `parents`;
DROP TABLE IF EXISTS `hostel`;
DROP TABLE IF EXISTS `transport`;
DROP TABLE IF EXISTS `library`;
DROP TABLE IF EXISTS `timetable`;
DROP TABLE IF EXISTS `student_assignments`;
DROP TABLE IF EXISTS `assignments`;
DROP TABLE IF EXISTS `notices`;
DROP TABLE IF EXISTS `fees`;
DROP TABLE IF EXISTS `results`;
DROP TABLE IF EXISTS `attendance`;
DROP TABLE IF EXISTS `teachers`;
DROP TABLE IF EXISTS `students`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `institutions`;

SET FOREIGN_KEY_CHECKS = 1;

-- 1. institutions
CREATE TABLE `institutions` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE
);

-- 2. users
CREATE TABLE `users` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('student', 'teacher', 'admin', 'parent') NOT NULL,
  institution_id INT NULL,
  FOREIGN KEY (institution_id) REFERENCES `institutions`(id) ON DELETE SET NULL
);

-- 3. students
CREATE TABLE `students` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  roll_no VARCHAR(50) NOT NULL,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  dob DATE NOT NULL,
  father_name VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  phone VARCHAR(20) NOT NULL,
  photo_url VARCHAR(255) NULL,
  FOREIGN KEY (user_id) REFERENCES `users`(id) ON DELETE CASCADE
);

-- 4. teachers
CREATE TABLE `teachers` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  subject VARCHAR(100) NOT NULL,
  assigned_classes VARCHAR(255) NOT NULL, -- E.g. "11th-A,12th-A,10th-B"
  FOREIGN KEY (user_id) REFERENCES `users`(id) ON DELETE CASCADE
);

-- 5. attendance
CREATE TABLE `attendance` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  date DATE NOT NULL,
  status ENUM('present', 'absent', 'late') NOT NULL,
  subject VARCHAR(100) NOT NULL,
  marked_by INT NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE,
  FOREIGN KEY (marked_by) REFERENCES `users`(id) ON DELETE SET NULL
);

-- 6. results
CREATE TABLE `results` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  exam_name VARCHAR(100) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  marks_obtained DECIMAL(5,2) NOT NULL,
  total_marks DECIMAL(5,2) NOT NULL,
  grade VARCHAR(10) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);

-- 7. fees
CREATE TABLE `fees` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_date DATE NOT NULL,
  paid_date DATE NULL,
  status ENUM('paid', 'unpaid', 'partial') NOT NULL,
  receipt_no VARCHAR(100) NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);

-- 8. notices
CREATE TABLE `notices` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(50) NOT NULL, -- "Academics", "Events", "Fees", "General"
  posted_by INT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (posted_by) REFERENCES `users`(id) ON DELETE SET NULL
);

-- 9. assignments
CREATE TABLE `assignments` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  class VARCHAR(50) NOT NULL,
  subject VARCHAR(100) NOT NULL,
  due_date DATE NOT NULL,
  posted_by INT NULL,
  FOREIGN KEY (posted_by) REFERENCES `users`(id) ON DELETE SET NULL
);

-- 10. student_assignments
CREATE TABLE `student_assignments` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  status ENUM('pending', 'submitted') NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMP NULL,
  FOREIGN KEY (assignment_id) REFERENCES `assignments`(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);

-- 11. timetable
CREATE TABLE `timetable` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class VARCHAR(50) NOT NULL,
  section VARCHAR(10) NOT NULL,
  day VARCHAR(20) NOT NULL, -- "Monday", "Tuesday", etc.
  subject VARCHAR(100) NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  teacher_id INT NULL,
  FOREIGN KEY (teacher_id) REFERENCES `teachers`(id) ON DELETE SET NULL
);

-- 12. library
CREATE TABLE `library` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  book_name VARCHAR(255) NOT NULL,
  issue_date DATE NOT NULL,
  return_date DATE NULL,
  status ENUM('issued', 'returned', 'overdue') NOT NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);

-- 13. transport
CREATE TABLE `transport` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  route_name VARCHAR(100) NOT NULL,
  stop_name VARCHAR(100) NOT NULL,
  timing TIME NOT NULL,
  student_id INT NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE SET NULL
);

-- 14. hostel
CREATE TABLE `hostel` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT UNIQUE NOT NULL,
  room_no VARCHAR(50) NOT NULL,
  warden_name VARCHAR(100) NOT NULL,
  mess_timing VARCHAR(100) NOT NULL,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);

-- 15. parents
CREATE TABLE `parents` (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNIQUE NOT NULL,
  student_id INT NOT NULL,
  relation VARCHAR(50) NOT NULL DEFAULT 'Father',
  phone VARCHAR(20) NULL,
  occupation VARCHAR(100) NULL,
  FOREIGN KEY (user_id) REFERENCES `users`(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES `students`(id) ON DELETE CASCADE
);


-- ==========================================
-- SEED DATA
-- ==========================================

-- Institutions
INSERT INTO `institutions` (id, name) VALUES 
(1, 'New Modern Senior Secondary School'),
(2, 'Modern English School'),
(3, 'Modern Girls College');

-- Users
-- Password for all is matching their role:
-- Admin: devilal.dadarwal@modern.edu / dadarwaldl@0266 -> $2a$10$SeqsXE7SIDm5Lh2cerAFOe0.kFjiDOuWB/PlXTsTzD7Lbul1ZxKLO
-- Teacher: teacher@modern.edu / teacher123 -> $2a$10$UWAuZ.kyJK2aBEoqHINdMeOBCQbjk7gCXvNJqEE5x6HKs7ag5RfJe
-- Student: student@modern.edu / student123 -> $2a$10$zaKzCj7mh.eja4OpjJiFdOfU260IhxCDfAIq3BX4aCdRCKwLVu4Hm
-- Parent: parent@modern.edu / parent123 -> $2a$10$zaKzCj7mh.eja4OpjJiFdOfU260IhxCDfAIq3BX4aCdRCKwLVu4Hm
INSERT INTO `users` (id, name, email, password, role, institution_id) VALUES
(1, 'Devilal Dadarwal', 'devilal.dadarwal@modern.edu', '$2a$10$SeqsXE7SIDm5Lh2cerAFOe0.kFjiDOuWB/PlXTsTzD7Lbul1ZxKLO', 'admin', 1),
(2, 'Suresh Kumar', 'teacher@modern.edu', '$2a$10$UWAuZ.kyJK2aBEoqHINdMeOBCQbjk7gCXvNJqEE5x6HKs7ag5RfJe', 'teacher', 1),
(3, 'Aarav Sharma', 'student@modern.edu', '$2a$10$zaKzCj7mh.eja4OpjJiFdOfU260IhxCDfAIq3BX4aCdRCKwLVu4Hm', 'student', 1),
(4, 'Priya Verma', 'priya.teacher@modern.edu', '$2a$10$UWAuZ.kyJK2aBEoqHINdMeOBCQbjk7gCXvNJqEE5x6HKs7ag5RfJe', 'teacher', 2),
(5, 'Rahul Choudhary', 'rahul.student@modern.edu', '$2a$10$zaKzCj7mh.eja4OpjJiFdOfU260IhxCDfAIq3BX4aCdRCKwLVu4Hm', 'student', 2),
(6, 'Rajesh Sharma', 'parent@modern.edu', '$2a$10$zaKzCj7mh.eja4OpjJiFdOfU260IhxCDfAIq3BX4aCdRCKwLVu4Hm', 'parent', 1);

-- Teachers
INSERT INTO `teachers` (id, user_id, subject, assigned_classes) VALUES
(1, 2, 'Physics', '11th-A,12th-A'),
(2, 4, 'Mathematics', '11th-B,10th-A');

-- Students
INSERT INTO `students` (id, user_id, roll_no, class, section, dob, father_name, address, phone, photo_url) VALUES
(1, 3, '24', '11th', 'A', '2009-08-14', 'Rajesh Sharma', '120, Ganesh Colony, Kuchaman City, Rajasthan', '+91 9876543210', 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?q=80&w=250&auto=format&fit=crop'),
(2, 5, '12', '11th', 'B', '2009-05-20', 'Mohan Choudhary', '45, Main Market, Kuchaman City, Rajasthan', '+91 9988776655', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop');

-- Parents
INSERT INTO `parents` (id, user_id, student_id, relation, phone, occupation) VALUES
(1, 6, 1, 'Father', '+91 98765 00123', 'Civil Engineer');

-- Attendance
INSERT INTO `attendance` (student_id, date, status, subject, marked_by) VALUES
(1, '2026-06-01', 'present', 'Physics', 2),
(1, '2026-06-02', 'present', 'Physics', 2),
(1, '2026-06-03', 'absent', 'Physics', 2),
(1, '2026-06-04', 'present', 'Physics', 2),
(1, '2026-06-05', 'present', 'Physics', 2),
(1, '2026-06-08', 'present', 'Physics', 2),
(1, '2026-06-09', 'present', 'Physics', 2),
(1, '2026-06-10', 'late', 'Physics', 2),
(1, '2026-06-11', 'present', 'Physics', 2),
(1, '2026-06-12', 'present', 'Physics', 2),
(1, '2026-06-15', 'present', 'Physics', 2),
(1, '2026-06-16', 'present', 'Physics', 2),
(1, '2026-06-17', 'present', 'Physics', 2),
-- Math attendance
(1, '2026-06-01', 'present', 'Mathematics', 4),
(1, '2026-06-03', 'present', 'Mathematics', 4),
(1, '2026-06-05', 'present', 'Mathematics', 4),
(1, '2026-06-08', 'present', 'Mathematics', 4),
(1, '2026-06-10', 'absent', 'Mathematics', 4),
(1, '2026-06-12', 'present', 'Mathematics', 4),
(1, '2026-06-15', 'late', 'Mathematics', 4),
(1, '2026-06-17', 'present', 'Mathematics', 4),
-- Student 2
(2, '2026-06-15', 'present', 'Mathematics', 4),
(2, '2026-06-17', 'present', 'Mathematics', 4);

-- Results
INSERT INTO `results` (student_id, exam_name, subject, marks_obtained, total_marks, grade) VALUES
(1, 'Quarterly Exam', 'Physics', 85.00, 100.00, 'A'),
(1, 'Quarterly Exam', 'Mathematics', 92.00, 100.00, 'A+'),
(1, 'Quarterly Exam', 'Chemistry', 78.00, 100.00, 'B'),
(1, 'Quarterly Exam', 'English', 88.00, 100.00, 'A'),
(1, 'Quarterly Exam', 'Computer Science', 95.00, 100.00, 'A+'),
(1, 'Half Yearly Exam', 'Physics', 89.00, 100.00, 'A'),
(1, 'Half Yearly Exam', 'Mathematics', 94.00, 100.00, 'A+'),
(1, 'Half Yearly Exam', 'Chemistry', 82.00, 100.00, 'A'),
(1, 'Half Yearly Exam', 'English', 85.00, 100.00, 'A'),
(1, 'Half Yearly Exam', 'Computer Science', 98.00, 100.00, 'A+'),
-- Student 2
(2, 'Half Yearly Exam', 'Mathematics', 74.00, 100.00, 'B-');

-- Fees
INSERT INTO `fees` (student_id, amount, due_date, paid_date, status, receipt_no) VALUES
(1, 15000.00, '2026-04-10', '2026-04-08', 'paid', 'REC-20260408-01'),
(1, 15000.00, '2026-08-10', NULL, 'unpaid', NULL),
(1, 3500.00, '2026-06-30', '2026-06-10', 'paid', 'REC-20260610-14'), -- exam fee
(2, 12000.00, '2026-04-10', '2026-04-12', 'paid', 'REC-20260412-05'),
(2, 12000.00, '2026-08-10', NULL, 'unpaid', NULL);

-- Notices
INSERT INTO `notices` (title, content, category, posted_by, created_at) VALUES
('Half Yearly Exam Schedule', 'The Half Yearly Examinations for all classes will commence on November 10th, 2026. The detailed timetable has been posted on the dashboard.', 'Academics', 1, '2026-06-10 10:00:00'),
('Annual Sports Day Meet', 'Modern Group of Education is organizing the Annual Sports Meet from December 15th to 17th. Students interested in athletics can register with their respective physical education teachers.', 'Events', 1, '2026-06-12 11:30:00'),
('Fee Payment Reminder', 'All students are reminded to clear their Term 2 tuition fees before August 10th, 2026 to avoid late fees.', 'Fees', 1, '2026-06-15 09:00:00'),
('Summer Break Announcement', 'The school will remain closed for summer vacations from July 1st to July 31st, 2026. Classes will resume as normal on August 1st.', 'General', 1, '2026-06-17 08:00:00');

-- Assignments
INSERT INTO `assignments` (id, title, description, class, subject, due_date, posted_by) VALUES
(1, 'Electrostatic Forces and Fields', 'Solve problems 1 to 10 from Chapter 3 of your Physics textbook. Show detailed calculations for full points.', '11th', 'Physics', '2026-06-25', 2),
(2, 'Derivatives and Continuity', 'Complete the calculus worksheet on limits and derivative proofs uploaded in class portal.', '11th', 'Mathematics', '2026-06-22', 4),
(3, 'Chemical Bonding Lab Report', 'Write a formal laboratory report detailing the properties of ionic vs covalent bonds based on yesterday\'s experiment.', '11th', 'Chemistry', '2026-06-29', 2);

-- Student Assignments
INSERT INTO `student_assignments` (assignment_id, student_id, status, submitted_at) VALUES
(1, 1, 'submitted', '2026-06-16 14:20:00'),
(2, 1, 'pending', NULL),
(3, 1, 'pending', NULL),
(2, 2, 'submitted', '2026-06-17 15:45:00');

-- Timetable
INSERT INTO `timetable` (class, section, day, subject, start_time, end_time, teacher_id) VALUES
-- Monday
('11th', 'A', 'Monday', 'Physics', '09:00:00', '10:00:00', 1),
('11th', 'A', 'Monday', 'Mathematics', '10:00:00', '11:00:00', 2),
('11th', 'A', 'Monday', 'Chemistry', '11:15:00', '12:15:00', NULL),
('11th', 'A', 'Monday', 'English', '13:00:00', '14:00:00', NULL),
-- Tuesday
('11th', 'A', 'Tuesday', 'Computer Science', '09:00:00', '10:00:00', NULL),
('11th', 'A', 'Tuesday', 'Physics', '10:00:00', '11:00:00', 1),
('11th', 'A', 'Tuesday', 'Mathematics', '11:15:00', '12:15:00', 2),
-- Wednesday
('11th', 'A', 'Wednesday', 'Physics', '09:00:00', '10:00:00', 1),
('11th', 'A', 'Wednesday', 'Chemistry', '10:00:00', '11:00:00', NULL),
('11th', 'A', 'Wednesday', 'English', '11:15:00', '12:15:00', NULL),
-- Thursday
('11th', 'A', 'Thursday', 'Mathematics', '09:00:00', '10:00:00', 2),
('11th', 'A', 'Thursday', 'Computer Science', '10:00:00', '11:00:00', NULL),
('11th', 'A', 'Thursday', 'Physics Lab', '11:15:00', '13:00:00', 1),
-- Friday
('11th', 'A', 'Friday', 'Chemistry Lab', '09:00:00', '10:45:00', NULL),
('11th', 'A', 'Friday', 'Mathematics', '11:00:00', '12:00:00', 2),
('11th', 'A', 'Friday', 'English', '13:00:00', '14:00:00', NULL);

-- Library
INSERT INTO `library` (student_id, book_name, issue_date, return_date, status) VALUES
(1, 'Concepts of Physics - Vol 1 (H.C. Verma)', '2026-06-01', '2026-06-15', 'returned'),
(1, 'Higher Algebra (Hall & Knight)', '2026-06-10', NULL, 'issued'),
(1, 'Modern Inorganic Chemistry', '2026-05-15', '2026-05-30', 'overdue');

-- Transport
INSERT INTO `transport` (route_name, stop_name, timing, student_id) VALUES
('Route A - Kuchaman City Center', 'Old Bus Stand Cross', '07:45:00', 1),
('Route B - Didwana Bypass', 'Bypass Circle', '08:00:00', 2);

-- Hostel
INSERT INTO `hostel` (student_id, room_no, warden_name, mess_timing) VALUES
(1, 'Block C - Room 304', 'Mr. Ramesh Choudhary', 'Breakfast: 7-8 AM, Lunch: 1-2 PM, Dinner: 8-9 PM');
