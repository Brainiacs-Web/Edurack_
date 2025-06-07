// backend/routes/auth.js

const express = require('express');
const bcrypt  = require('bcryptjs');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();

// Helper: Generate a random 9-character uppercase-alphanumeric string,
// prefix with "Edu-", and ensure uniqueness in the database.
async function generateUniqueUserID() {
  const ALPHANUM = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  while (true) {
    let randomPart = '';
    for (let i = 0; i < 9; i++) {
      randomPart += ALPHANUM.charAt(Math.floor(Math.random() * ALPHANUM.length));
    }
    const candidate = 'Edu-' + randomPart;

    // Check uniqueness
    const existing = await User.findOne({ userID: candidate });
    if (!existing) return candidate;
  }
}

// Helper: Generate JWT with user ID payload
function generateToken(userId) {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, password, studentClass, exam, state } = req.body;

    // Validate required fields
    if (
      !fullName?.trim() ||
      !email?.trim() ||
      !phone?.trim() ||
      !password ||
      !studentClass ||
      !exam ||
      !state?.trim()
    ) {
      return res.status(400).json({ message: 'All fields (including phone & state) are required.' });
    }

    // Normalize inputs
    const normalizedEmail = email.toLowerCase().trim();
    const normalizedPhone = phone.trim();

    // Check if email or phone exists already
    const existingUser = await User.findOne({
      $or: [{ email: normalizedEmail }, { phone: normalizedPhone }]
    });

    if (existingUser) {
      if (existingUser.email === normalizedEmail) {
        return res.status(400).json({ message: 'Email already registered; please log in instead.' });
      }
      if (existingUser.phone === normalizedPhone) {
        return res.status(400).json({ message: 'Phone number already registered; please log in instead.' });
      }
    }

    // Generate unique userID
    const userID = await generateUniqueUserID();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      userID,
      fullName: fullName.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      password: hashedPassword,
      studentClass,
      exam,
      state: state.trim(),
      googleSignIn: false
    });

    await newUser.save();

    // Issue JWT
    const token = generateToken(newUser._id);

    res.json({
      token,
      user: {
        userID: newUser.userID,
        fullName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        studentClass: newUser.studentClass,
        exam: newUser.exam,
        state: newUser.state
      }
    });
  } catch (err) {
    console.error('Registration error:', err);

    // Handle duplicate-key error 11000 for unique fields
    if (err.code === 11000) {
      if (err.keyValue?.email) {
        return res.status(400).json({ message: 'Email already registered; please log in instead.' });
      }
      if (err.keyValue?.userID) {
        return res.status(500).json({ message: 'Could not generate a unique userID; please try again.' });
      }
    }

    // TEMPORARY: return the real error message for debugging
    return res.status(500).json({ message: err.message || 'Unknown server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) return res.status(400).json({ message: 'Invalid credentials.' });

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        userID: user.userID,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        studentClass: user.studentClass,
        exam: user.exam,
        state: user.state
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
});

const authenticateToken = require('../middleware/auth');

// GET /api/auth/user
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('Fetch user error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticateToken, async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;
  if (req.user.id !== userId) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ message: 'All fields required.' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Check old password
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ message: 'New password too short' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.updatedAt = Date.now();
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    console.error('Change-password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
