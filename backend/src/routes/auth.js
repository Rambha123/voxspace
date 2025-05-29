import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import nodemailer from 'nodemailer';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Traditional Email/Password Signup with Email Verification
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      verified: false, // default to unverified
    });

    // Create email verification token
    const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '1h' });
    const verificationLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;

    // Send verification email
    await transporter.sendMail({
      from: `"VoxspaceTeam" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Verify Your Email - Voxspace',
      html: `
        <h1>Welcome to Voxspace, ${name}!</h1>
        <p>Click the link below to verify your email:</p>
        <a href="${verificationLink}">Verify Email</a>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });

    res.status(201).json({
      message: 'Signup successful. Please check your email to verify your account.',
    });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err.message });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ email: decoded.email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified.' });
    }

    user.verified = true;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token', error: err.message });
  }
});

// Traditional Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!user.verified) {
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: { name: user.name, email: user.email },
    });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err.message });
  }
});

// Google Signup/Signin
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
        verified: true, // Assume Google-authenticated users are verified
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      user.verified = true;
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
      message: 'Google authentication failed',
      error: err.message,
    });
  }
});

export default router;
