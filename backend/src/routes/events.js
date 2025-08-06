import express from 'express';
import Event from '../models/Events.js';
import Space from '../models/Space.js';
import User from '../models/User.js';
import authMiddleware from '../middleware/authentication.js';
import nodemailer from 'nodemailer';

const router = express.Router();


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});


router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;

    const events = await Event.find()
      .populate({
        path: 'space',
        select: 'name members',
      });

    const filteredEvents = events.filter(event =>
      event.space && event.space.members.includes(userId)
    );

    res.json(filteredEvents);
  } catch (err) {
    console.error('Error fetching filtered events:', err);
    res.status(500).json({ message: 'Error fetching events' });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate('space');
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const isOwner = event.space?.createdBy?.toString() === req.user.id;
    if (!isOwner) return res.status(403).json({ error: 'Not authorized to delete this event' });

    await Event.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (err) {
    console.error('Error deleting event:', err);
    res.status(500).json({ error: 'Server error' });
  }
});



router.post('/', async (req, res) => {
  const { title, date, time, description, space } = req.body;

  if (!title || !date || !space) {
    return res.status(400).json({ error: 'Title, date, and space are required' });
  }

  try {
    // Save the new event
    const newEvent = new Event({
      title,
      date,
      time,
      description,
      space
    });

    await newEvent.save();

    
    const spaceData = await Space.findById(space).populate('members');
    if (!spaceData) {
      return res.status(404).json({ error: 'Space not found' });
    }

    // Get all member emails
    const recipientEmails = spaceData.members
      .map(member => member.email)
      .filter(Boolean); // only valid emails

    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipientEmails,
      subject: `New Event in ${spaceData.name}`,
      text: `A new event has been scheduled in the space "${spaceData.name}":

Title: ${title}
Date: ${date}
Time: ${time || 'Not specified'}
Description: ${description || 'No description'}

Please check the event page for more details.`
    };

    await transporter.sendMail(mailOptions);

    res.status(201).json(newEvent);
  } catch (err) {
    console.error('Error creating event or sending emails:', err);
    res.status(500).json({ error: 'Failed to add event or notify members' });
  }
});

export default router;
