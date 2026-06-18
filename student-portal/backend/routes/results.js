const express = require('express');
const router = express.Router();
const resultsController = require('../controllers/results');
const { verifyToken, isTeacher } = require('../middleware/auth');

router.get('/', verifyToken, resultsController.getResults);
router.post('/', verifyToken, isTeacher, resultsController.uploadResults);

module.exports = router;
