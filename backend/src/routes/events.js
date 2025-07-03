import express from 'express';
import Event from '../models/Events.js';

const router = express.Router();

// GET all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Server Error' });
  }
});

// POST new event
router.post('/', async (req, res) => {
  const { title, date, time, description } = req.body;

  if (!title || !date) {
    return res.status(400).json({ error: 'Title and date are required' });
  }

  try {
    const newEvent = new Event({ title, date, time, description });
    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add event' });
  }
});

export default router;
