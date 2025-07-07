import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

import authRoutes from './routes/auth.js'; 
import profileRoutes from './routes/profile.js';
import spaceRoutes from './routes/spaceroute.js';
import eventRoutes from './routes/events.js';
import Message from './models/Message.js'; // ✅ Import chat message model

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api', authRoutes);
app.use('/api', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/spaces', spaceRoutes);

// Default route
app.get('/', (req, res) => {
  res.send('Hello from backend!');
});

// 🔌 Socket.IO logic
io.on('connection', (socket) => {
  console.log(`🔌 User connected: ${socket.id}`);

  // Join room
  socket.on('joinRoom', async (roomId) => {
    socket.join(roomId);
    console.log(`👥 User ${socket.id} joined room ${roomId}`);

    // Load last 50 messages from DB
    try {
      const messages = await Message.find({ room: roomId })
        .sort({ timestamp: 1 }) // oldest to newest
        .limit(50);
      socket.emit('loadMessages', messages);
    } catch (err) {
      console.error('❌ Error loading messages:', err);
    }
  });

  // Leave room
  socket.on('leaveRoom', (roomId) => {
    socket.leave(roomId);
    console.log(`👋 User ${socket.id} left room ${roomId}`);
  });

  // Receive + broadcast + save message
  socket.on('sendMessage', async (msg) => {
    console.log("📨 Message:", msg);
    try {
      const newMessage = new Message({
        room: msg.room,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp || new Date()
      });
      await newMessage.save();
      io.to(msg.room).emit('receiveMessage', newMessage); // emit saved message with _id
    } catch (err) {
      console.error('❌ Failed to save message:', err);
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// MongoDB + Start Server
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB!');
    httpServer.listen(PORT, () => {
      console.log(`🚀 Server with Socket.IO running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err);
  });
