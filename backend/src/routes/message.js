import express from "express";
import Message from "../models/Message.js";
import authMiddleware from "../middleware/authentication.js";
import User from "../models/User.js";
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// GET /api/messages/:userId — fetch messages between two users
router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const myId = req.user.id; 

    const room = [myId, userId].sort().join("_");
    const messages = await Message.find({ room }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Failed to get messages", error: err.message });
  }
});

router.get("/contacts/:myId", async (req, res) => {
  try {
    const myId = req.params.myId;

    const messages = await Message.find({ "sender.id": myId });

    const contactIds = new Set();
    messages.forEach(msg => {
      const otherId = msg.room.split("").find(id => id !== myId);
      if (otherId) contactIds.add(otherId);
    });

    const users = await User.find({ _id: { $in: [...contactIds] } }, { password: 0 });

    res.json(users);
  } catch (err) {
    console.error("Error getting contacts:", err);
    res.status(500).json({ message: "Failed to fetch contacts." });
  }
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/messages';
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/messages/upload — handle file upload
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }
  res.json({ fileUrl: `${req.protocol}://${req.get('host')}/uploads/messages/${req.file.filename}` });

});

export default router;
