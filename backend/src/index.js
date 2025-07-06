import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 
import profileRoutes from './routes/profile.js';
import spaceRoutes from './routes/spaceroute.js';
import eventRoutes from './routes/events.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use your routes with a base path
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/spaces', spaceRoutes);
app.use('/api/events', eventRoutes);
app.use('/uploads', express.static('uploads'));


// Default test route
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB!');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err);
  });

  app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  next();
});
