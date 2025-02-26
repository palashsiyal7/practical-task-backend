const express = require('express');
const router = express.Router();
const { 
  getUsers, 
  getUserById, 
  updateUserRole, 
  deleteUser,
  getStatistics
} = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// All routes are protected and require admin role
router.use(protect);
router.use(checkRole(['admin']));

// GET all users
router.get('/', getUsers);

// GET system statistics
router.get('/statistics', getStatistics);

// GET user by ID
router.get('/:id', getUserById);

// UPDATE user role
router.put('/:id/role', updateUserRole);

// DELETE user
router.delete('/:id', deleteUser);

module.exports = router; 