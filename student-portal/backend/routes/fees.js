const express = require('express');
const router = express.Router();
const feesController = require('../controllers/fees');
const { verifyToken, isAdmin } = require('../middleware/auth');

router.get('/', verifyToken, feesController.getFees);
router.post('/', verifyToken, isAdmin, feesController.createFee);

module.exports = router;
