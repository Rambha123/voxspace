// models/User.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Only required if not signing up with Google
    }
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows it to be null for local users
  },
  isVerified: {
    type: Boolean,
    default: false // Use with Nodemailer to track email verification
  },
  avatar: {
    type: String,
    default: '' // Optional profile image
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  }
}, {
  timestamps: true
});

export default mongoose.model('User', userSchema);
