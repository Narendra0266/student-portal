const express = require('express');
const router = express.Router();
const teachersController = require('../controllers/teachers');
const { verifyToken, isTeacher } = require('../middleware/auth');

// Protect all teacher routes
router.use(verifyToken);
router.use(isTeacher);

router.get('/classes', teachersController.getClasses);
router.get('/students/:class', teachersController.getStudentsByClass);
router.post('/attendance', teachersController.markAttendance);
router.post('/results', teachersController.uploadResults);
router.post('/assignments', teachersController.createAssignment);

module.exports = router;
