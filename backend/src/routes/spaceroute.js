import express from 'express';
import Space from '../models/Space.js';
import { nanoid } from 'nanoid';  // for generating codes
import authMiddleware from '../middleware/authentication.js';  // your JWT auth

const router = express.Router();

// Create space
router.post('/create', authMiddleware, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ message: "Name is required" });

  const code = nanoid(6).toUpperCase();

  try {
    const space = new Space({
      name,
      code,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await space.save();
    res.status(201).json(space);
  } catch (err) {
    res.status(500).json({ message: "Error creating space" });
  }
});

// Join space
router.post('/join', authMiddleware, async (req, res) => {
  const { code } = req.body;

  try {
    const space = await Space.findOne({ code });

    if (!space) {
      return res.status(404).json({ message: "Space not found" });
    }

    if (space.members.includes(req.user.id)) {
      return res.status(400).json({ message: "Already a member" });
    }

    space.members.push(req.user.id);
    await space.save();

    res.json(space);
  } catch (err) {
    res.status(500).json({ message: "Error joining space" });
  }
});

// Get my spaces
router.get('/my-spaces', authMiddleware, async (req, res) => {
  try {
    const spaces = await Space.find({ members: req.user.id });
    res.json(spaces);
  } catch (err) {
    res.status(500).json({ message: "Error fetching spaces" });
  }
});

export default router;
