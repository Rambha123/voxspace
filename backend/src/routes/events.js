import express from 'express';
import Event from '../models/Events.js';
import authMiddleware from '../middleware/authentication.js'; 


const router = express.Router();

// GET all events
router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all events and populate space
    const events = await Event.find()
      .populate({
        path: 'space', // ✅ lowercase, as defined in your Event schema
        select: 'name members', // Only get space name and members
      });

    // ✅ Filter only events where user is a member of the space
    const filteredEvents = events.filter(event => 
      event.space && event.space.members.includes(userId)
    );

    res.json(filteredEvents);
  } catch (err) {
    console.error('Error fetching filtered events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

// POST new event
router.post('/', async (req, res) => {
  const { title, date, time, description, space } = req.body;

  if (!title || !date || !space) {
    return res.status(400).json({ error: 'Title, date, and space are required' });
  }

  try {
    const newEvent = new Event({
      title,
      date,
      time,
      description,
      space
    });

    await newEvent.save();
    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ error: 'Failed to add event' });
  }
});

export default router;
