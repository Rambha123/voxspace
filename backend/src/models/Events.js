import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  time: String,
  description: String,
  space: { type: mongoose.Schema.Types.ObjectId, ref: 'Space', required: true },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }], 
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

export default mongoose.model('Event', eventSchema);

