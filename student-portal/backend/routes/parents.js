const express = require('express');
const router = express.Router();
const parentsController = require('../controllers/parents');
const { verifyToken, isParent } = require('../middleware/auth');

// Protect all parent routes
router.use(verifyToken);
router.use(isParent);

router.get('/child-profile', parentsController.getChildProfile);
router.get('/child-attendance', parentsController.getChildAttendance);
router.get('/child-results', parentsController.getChildResults);
router.get('/child-fees', parentsController.getChildFees);
router.get('/child-timetable', parentsController.getChildTimetable);
router.post('/pay-fees', parentsController.payFees);
router.get('/messages', parentsController.getMessages);
router.post('/messages', parentsController.sendMessage);

module.exports = router;
