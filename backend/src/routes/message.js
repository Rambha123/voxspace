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

// GET /api/messages/contacts — get all chat contacts with latest message
router.get("/contacts", authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;

    // Find all messages where the current user is involved
    const messages = await Message.find({
      room: new RegExp(myId),
    }).sort({ timestamp: -1 });

    const contactMap = new Map();

    for (const msg of messages) {
      const [id1, id2] = msg.room.split("_");
      const otherId = id1 === myId ? id2 : id2 === myId ? id1 : null;

      if (!otherId || contactMap.has(otherId)) continue;

      const user = await User.findById(otherId).select("_id name email");
      if (user) {
        contactMap.set(otherId, {
          _id: user._id,
          name: user.name,
          email: user.email,
          lastMessage: msg.content,
          timestamp: msg.timestamp,
        });
      }
    }

    // Convert to array and sort by latest timestamp
    const contacts = Array.from(contactMap.values()).sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );

    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ message: "Failed to fetch contacts." });
  }
});

export default router