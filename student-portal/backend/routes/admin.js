const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { verifyToken, isAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all admin routes
router.use(verifyToken);
router.use(isAdmin);

// Dashboard & Stats
router.get('/dashboard', adminController.getDashboardStats);
router.get('/institutions', adminController.getInstitutions);

// Student CRUD
router.get('/students', adminController.getStudents);
router.post('/students', upload.single('photo'), adminController.createStudent);
router.put('/students/:id', upload.single('photo'), adminController.updateStudent);
router.delete('/students/:id', adminController.deleteStudent);

// Teacher CRUD
router.get('/teachers', adminController.getTeachers);
router.post('/teachers', adminController.createTeacher);
router.put('/teachers/:id', adminController.updateTeacher);
router.delete('/teachers/:id', adminController.deleteTeacher);

// Notices CRUD
router.get('/notices', adminController.getNotices);
router.post('/notices', adminController.createNotice);
router.put('/notices/:id', adminController.updateNotice);
router.delete('/notices/:id', adminController.deleteNotice);

// Timetable CRUD
router.get('/timetable', adminController.getTimetable);
router.post('/timetable', adminController.createTimetableSlot);
router.put('/timetable/:id', adminController.updateTimetableSlot);
router.delete('/timetable/:id', adminController.deleteTimetableSlot);

// Fees CRUD
router.get('/fees', adminController.getFees);
router.post('/fees', adminController.createFeeRecord);
router.put('/fees/:id', adminController.updateFeeRecord);
router.delete('/fees/:id', adminController.deleteFeeRecord);

module.exports = router;
