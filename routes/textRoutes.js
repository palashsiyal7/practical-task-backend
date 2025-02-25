const express = require('express');
const { submitText } = require('../controllers/textController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/submit', protect, checkRole(['developer']), submitText);

module.exports = router;