import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import User from '../models/User.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;


// Signup Route
router.post('/signup', async (req, res) => {
  const { name, email, password } = req.body;

  try {
    console.log('Signup request received', req.body);  // Log the request data
      
    // Check for existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    // Hash the password and save user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword});

    await newUser.save();

    // Generate verification token
    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    

    


    res.status(200).json({ success: true, message: 'Signup successful!' });
  } catch (error) {
    console.error('Signup Error:', error);  // Log the error to identify where the failure is
    res.status(500).json({ success: false, message: 'Error occurred during signup.' });
  }
});
//login
router.post('/login', async (req, res) => {
  const { email, password} = req.body;
  try {
    console.log('Login request received:', req.body);

    // Validate input
    if (!email || !password) {
      console.log('Missing email or password'); // Log missing field error
      return res.status(400).json({ success: false, message: 'Email and Password are required' });
    }

    // Find user in the database
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log('Password mismatch');
      return res.status(400).json({ success: false, message: 'Invalid email or password' });
    }

  

    // Generate JWT
    const token = jwt.sign({ email: user.email, id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    console.log('Generated JWT:', token); // ✅ This logs the token
    console.log('Login successful');
    res.status(200).json({ success: true, message: 'Login successful', token });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// Google Signup/Signin (no email verification)
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
        { googleId: payload.sub }
      ]
    });

    if (!user) {
      user = new User({
        name: payload.name,
        email: payload.email,
        googleId: payload.sub,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = payload.sub;
      await user.save();
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(200).json({
      message: 'Google authentication successful',
      token,
      user: { name: user.name, email: user.email }
    });

  } catch (err) {
    console.error('Google auth error:', err);
    res.status(400).json({
      message: 'Google authentication failed',
      error: err.message
    });
  }
});

export default router;
