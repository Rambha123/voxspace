import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String }, // optional but recommended
  description: { type: String } // optional
});

export default mongoose.model('Event', eventSchema);

