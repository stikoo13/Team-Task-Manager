const express = require('express');
const router = express.Router();
const { register, login, updateProfile, updatePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const User = require('../models/User');

router.post('/register', register);
router.post('/login', login);
router.put('/profile',  protect, updateProfile);
router.put('/password', protect, updatePassword);

// GET all users — admin only
router.get('/users', protect, async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'name', 'email', 'role'],
      order: [['name', 'ASC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;