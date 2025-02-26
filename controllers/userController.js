const User = require('../models/User');
const TextSubmission = require('../models/TextSubmission');

/**
 * Get all users
 * @route GET /api/users
 * @access Private/Admin
 */
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 * @access Private/Admin
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Update user role
 * @route PUT /api/users/:id/role
 * @access Private/Admin
 */
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!role || !['admin', 'developer', 'user'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from changing their own role (optional security measure)
    if (user._id.toString() === req.user.id && user.role === 'admin' && role !== 'admin') {
      return res.status(400).json({ message: 'Admin cannot change their own role' });
    }
    
    user.role = role;
    await user.save();
    
    res.json({ 
      _id: user._id,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Delete user
 * @route DELETE /api/users/:id
 * @access Private/Admin
 */
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Admin cannot delete their own account' });
    }
    
    await user.deleteOne();
    
    res.json({ message: 'User removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get system statistics
 * @route GET /api/users/statistics
 * @access Private/Admin
 */
exports.getStatistics = async (req, res) => {
  try {
    // Get counts in parallel
    const [totalUsers, textSubmissions] = await Promise.all([
      User.countDocuments({}),
      TextSubmission.countDocuments({})
    ]);

    // For active sessions, we can estimate based on users who have been active
    // This is a placeholder - in a real app you might track this differently
    const activeSessions = await User.countDocuments({ 
      // Users who logged in within the last hour would be considered active
      // This assumes you have a lastActive field - adjust as needed
      updatedAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) }
    });

    res.json({
      totalUsers,
      textSubmissions,
      activeSessions
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 