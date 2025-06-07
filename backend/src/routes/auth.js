import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

const router = express.Router();
dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// mailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS, 
  },
});





// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      isVerified: false, 
    });

    const emailToken = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: '1d' });

    const verificationUrl = `http://localhost:5173/verify-email?token=${emailToken}`;

    await transporter.sendMail({
      from: `"VoxSpace" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify your email',
      html: `<p>Hello ${name},</p><p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: 'Signup successful. Please verify your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});


//verification
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(400).json({ message: 'Invalid token' });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' }); 
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' }); 
  }
});



//login

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login request received:', req.body);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password');
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if user is verified
    if (!user.isVerified) {
      console.log('User not verified');
      return res.status(403).json({ success: false, message: 'Please verify your email before logging in' });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log('Password mismatch');
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Generate JWT
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    console.log('Login successful');
    
    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        isVerified: user.isVerified,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});
//google
router.post('/google-signup', async (req, res) => {
  const { credential } = req.body;

  try {
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: CLIENT_ID,
    });

    const payload = ticket.getPayload();

    let user = await User.findOne({
      $or: [
        { email: payload.email },
        { googleId: payload.sub },
      ],
    });

    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
        isVerified: true, 
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.isVerified = true;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: { name: user.name, email: user.email },
    });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(400).json({
      message: 'google auth failed',
      error: err.message,
    });
  }
});


export default router;
