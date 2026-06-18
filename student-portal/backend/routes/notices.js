const express = require('express');
const router = express.Router();
const noticesController = require('../controllers/notices');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, noticesController.getNotices);
router.post('/', verifyToken, isAdmin, noticesController.createNotice);
router.delete('/:id', verifyToken, isAdmin, noticesController.deleteNotice);

module.exports = router;
