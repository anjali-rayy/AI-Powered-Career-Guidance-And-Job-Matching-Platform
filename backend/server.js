const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

// ── node-fetch (npm install node-fetch@2) ──
const fetch = require('node-fetch');

const app = express();
app.use(express.json({ limit: '2mb' }));
app.use(cors({ origin: '*' }));

// ── CONNECT TO MONGODB ──
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// ── USER SCHEMA ──
const userSchema = new mongoose.Schema({
  fname: { type: String, required: true },
  lname: { type: String, default: '' },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, default: '' },
  googleId: { type: String, default: '' },
  phone: { type: String, default: '' },
  location: { type: String, default: '' },
  bio: { type: String, default: '' },
  college: { type: String, default: '' },
  eduLevel: { type: String, default: '' },
  eduField: { type: String, default: '' },
  gradYear: { type: String, default: '' },
  experience: { type: String, default: '' },
  interest: { type: String, default: '' },
  skills: { type: [String], default: [] },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ── JWT MIDDLEWARE ──
const JWT_SECRET = process.env.JWT_SECRET || 'pathwayai_secret_2026';

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ══════════════════════════════════════════
// ── GROQ PROXY — RESUME ANALYSIS ──
// ══════════════════════════════════════════
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const GROQ_API_KEY = process.env.GROQ_API_KEY;

    console.log('GROQ KEY:', GROQ_API_KEY ? 'FOUND ✅' : 'MISSING ❌');
    if (!GROQ_API_KEY) {
      return res.status(500).json({ error: { message: 'GROQ_API_KEY is not set in .env' } });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Groq proxy error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ══════════════════════════════════════════
// ── ANTHROPIC PROXY — ROADMAP ──
// ══════════════════════════════════════════
app.post('/api/roadmap', async (req, res) => {
  try {
    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

    if (!ANTHROPIC_API_KEY) {
      return res.status(500).json({ error: { message: 'ANTHROPIC_API_KEY is not set in .env' } });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (err) {
    console.error('Anthropic proxy error:', err);
    res.status(500).json({ error: { message: err.message } });
  }
});

// ══════════════════════════════════════════
// ── AUTH ROUTES ──
// ══════════════════════════════════════════

// ── REGISTER ──
app.post('/api/register', async (req, res) => {
  try {
    const { fname, lname, email, password, eduLevel, eduField, gradYear, experience, location, skills, interest } = req.body;

    if (!fname || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (password.length < 8)
      return res.status(400).json({ error: 'Password must be at least 8 characters' });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing)
      return res.status(409).json({ error: 'An account with this email already exists' });

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fname, lname: lname || '', email: email.toLowerCase(),
      password: hashedPassword,
      eduLevel: eduLevel || '', eduField: eduField || '',
      gradYear: gradYear || '', experience: experience || '',
      location: location || '', skills: skills || [],
      interest: interest || ''
    });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: 'Account created successfully',
      token,
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        email: user.email,
        fullName: user.lname ? `${user.fname} ${user.lname}` : user.fname,
        eduLevel: user.eduLevel,
        eduField: user.eduField,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// ── LOGIN ──
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user)
      return res.status(401).json({ error: 'No account found with this email. Please register first.' });

    if (!user.isActive)
      return res.status(403).json({ error: 'This account has been deleted.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Incorrect password. Please try again.' });

    const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: 'Signed in successfully',
      token,
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        fullName: user.lname ? `${user.fname} ${user.lname}` : user.fname,
        email: user.email,
        phone: user.phone,
        location: user.location,
        bio: user.bio,
        college: user.college,
        eduLevel: user.eduLevel,
        eduField: user.eduField,
        gradYear: user.gradYear,
        experience: user.experience,
        interest: user.interest,
        skills: user.skills,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// ── GET PROFILE ──
app.get('/api/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── UPDATE PROFILE ──
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { fname, lname, phone, location, bio, college, eduLevel, eduField, gradYear, experience, interest, skills } = req.body;

    const updated = await User.findByIdAndUpdate(
      req.user.userId,
      { $set: { fname, lname, phone, location, bio, college, eduLevel, eduField, gradYear, experience, interest, skills } },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updated) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error during profile update' });
  }
});

// ── CHANGE PASSWORD ──
app.put('/api/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: 'Both current and new password are required' });

    if (newPassword.length < 8)
      return res.status(400).json({ error: 'New password must be at least 8 characters' });

    const user = await User.findById(req.user.userId);
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── DELETE ACCOUNT ──
app.delete('/api/account', authMiddleware, async (req, res) => {
  try {
    const { confirmText } = req.body;

    if (confirmText !== 'DELETE')
      return res.status(400).json({ error: 'Please type DELETE to confirm' });

    await User.findByIdAndDelete(req.user.userId);

    res.json({ message: 'Account permanently deleted' });
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Server error during account deletion' });
  }
});

// ── VERIFY TOKEN ──
app.get('/api/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user || !user.isActive)
      return res.status(401).json({ error: 'Account not found or deleted' });
    res.json({ valid: true, user });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// ══════════════════════════════════════════
// ── START SERVER (always last) ──
// ══════════════════════════════════════════
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 PathwayAI server running on http://localhost:${PORT}`));


const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// ── FIREBASE GOOGLE AUTH ──
app.post('/api/auth/google', async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) return res.status(400).json({ error: 'No token provided' });

    // Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken);
    const { uid: googleId, email, name, picture } = decoded;

    const nameParts = (name || 'User').split(' ');
    const fname = nameParts[0];
    const lname = nameParts.slice(1).join(' ') || '';

    // Find or create user
    let user = await User.findOne({ email: email.toLowerCase() });

    if (user) {
      if (!user.googleId) { user.googleId = googleId; await user.save(); }
    } else {
      user = await User.create({
        fname, lname,
        email: email.toLowerCase(),
        password: '',
        googleId
      });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Signed in with Google successfully',
      token,
      user: {
        id: user._id,
        fname: user.fname,
        lname: user.lname,
        fullName: user.lname ? `${user.fname} ${user.lname}` : user.fname,
        email: user.email,
        picture,
        eduLevel: user.eduLevel,
        eduField: user.eduField,
        skills: user.skills
      }
    });
  } catch (err) {
    console.error('Firebase Google auth error:', err);
    res.status(401).json({ error: 'Google authentication failed' });
  }
});