const express = require('express');
const router = express.Router();
const assignmentsController = require('../controllers/assignments');
const { verifyToken, isTeacher } = require('../middleware/auth');

router.get('/', verifyToken, assignmentsController.getAssignments);
router.post('/', verifyToken, isTeacher, assignmentsController.createAssignment);
router.put('/:id/submit', verifyToken, assignmentsController.submitAssignment);

module.exports = router;
