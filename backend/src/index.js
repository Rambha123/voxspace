import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; 


dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// ✅ Use your routes with a base path
app.use('/api', authRoutes);

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