const TextSubmission = require('../models/TextSubmission');

exports.submitText = async (req, res) => {
  const { text } = req.body;

  try {
    const submission = await TextSubmission.create({
      userId: req.user.id,
      text,
    });

    // Emit a real-time alert using Socket.io
    req.io.emit('newSubmission', {
      username: req.user.email,
      submissionTime: submission.createdAt,
      submittedText: text,
    });

    res.status(201).json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getSubmissions = async (req, res) => {
  try {
    const submissions = await TextSubmission.find()
      .sort({ createdAt: -1 })
      .populate('userId', 'email');
      
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to load submissions' });
  }
};