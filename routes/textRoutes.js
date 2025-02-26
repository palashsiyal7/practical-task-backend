const express = require('express');
const { submitText, getSubmissions } = require('../controllers/textController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');
const router = express.Router();

router.post('/submit', protect, submitText);
router.get('/submissions', protect, getSubmissions);

module.exports = router;