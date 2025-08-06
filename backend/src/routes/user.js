import express from "express";
import authMiddleware from "../middleware/authentication.js";
import User from "../models/User.js";

const router = express.Router();

// Add each other as contacts
router.post("/add-contact/:id", authMiddleware, async (req, res) => {
  try {
    const myId = req.user.id;
    const otherUserId = req.params.id;

    if (myId === otherUserId) {
      return res.status(400).json({ message: "Cannot add yourself as a contact." });
    }

    const [me, otherUser] = await Promise.all([
      User.findById(myId),
      User.findById(otherUserId),
    ]);

    if (!otherUser) {
      return res.status(404).json({ message: "User not found." });
    }

    // Add each other to contacts if not already added
    if (!me.contacts.includes(otherUserId)) {
      me.contacts.push(otherUserId);
    }
    if (!otherUser.contacts.includes(myId)) {
      otherUser.contacts.push(myId);
    }

    await me.save();
    await otherUser.save();

    res.status(200).json({ message: "Contact added successfully." });
  } catch (err) {
    console.error("Error adding contact:", err);
    res.status(500).json({ message: "Failed to add contact." });
  }
});

export default router;
