const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendance');
const { verifyToken, isTeacher } = require('../middleware/auth');

router.get('/', verifyToken, attendanceController.getAttendance);
router.post('/', verifyToken, isTeacher, attendanceController.markAttendance);

module.exports = router;
