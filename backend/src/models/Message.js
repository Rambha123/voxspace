import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  room: { type: String, required: true },
  sender: {
    _id: String,
    name: String,
  },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', messageSchema);