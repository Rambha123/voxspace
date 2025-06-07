import express from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import prof from '../middleware/prof.js';

const router = express.Router();

// GET /api/users/me
router.get('/me', prof, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/me
router.put('/me', prof, async (req, res) => {
  const { name, avatar, password } = req.body;

  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    await user.save();
    const updatedUser = await User.findById(user.id).select('-password');
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update profile' });
  }
});

export default router;
