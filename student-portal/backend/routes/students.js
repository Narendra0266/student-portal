const express = require('express');
const router = express.Router();
const studentsController = require('../controllers/students');
const { verifyToken } = require('../middleware/auth');

// Protect all student routes
router.use(verifyToken);

router.get('/profile', studentsController.getProfile);
router.get('/attendance', studentsController.getAttendance);
router.get('/results', studentsController.getResults);
router.get('/fees', studentsController.getFees);
router.get('/timetable', studentsController.getTimetable);
router.get('/assignments', studentsController.getAssignments);
router.put('/assignments/:id/submit', studentsController.submitAssignment);
router.get('/library', studentsController.getLibrary);
router.get('/transport', studentsController.getTransport);
router.get('/hostel', studentsController.getHostel);

module.exports = router;
