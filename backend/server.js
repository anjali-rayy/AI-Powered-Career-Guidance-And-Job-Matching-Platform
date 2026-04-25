const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_SERVICE = 'http://localhost:5000';
const JWT_SECRET = process.env.JWT_SECRET || 'pathwayai-secret-key';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/pathwayai';

// ─────────────────────────────────────────────
// MONGODB CONNECTION
// ─────────────────────────────────────────────
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// ─────────────────────────────────────────────
// USER SCHEMA
// ─────────────────────────────────────────────
const userSchema = new mongoose.Schema({
  fname:      { type: String, required: true },
  lname:      { type: String, default: '' },
  email:      { type: String, required: true, unique: true },
  password:   { type: String, default: null }, // null for Google users
  phone:      { type: String, default: '' },
  location:   { type: String, default: '' },
  bio:        { type: String, default: '' },
  college:    { type: String, default: '' },
  eduLevel:   { type: String, default: '' },
  eduField:   { type: String, default: '' },
  gradYear:   { type: String, default: '' },
  experience: { type: String, default: '' },
  interest:   { type: String, default: '' },
  skills:     { type: [String], default: [] },
  googleId:   { type: String, default: null },
  createdAt:  { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function generateToken(user) {
  return jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
}

function safeUser(user) {
  const u = user.toObject();
  delete u.password;
  return u;
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// ─────────────────────────────────────────────
// AUTH ROUTES
// ─────────────────────────────────────────────

// REGISTER — only fname, lname, email, password
app.post('/api/register', async (req, res) => {
  try {
    const { fname, lname, email, password } = req.body;

    if (!fname || !email || !password)
      return res.status(400).json({ error: 'Name, email and password are required' });

    if (await User.findOne({ email }))
      return res.status(400).json({ error: 'Email already registered' });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ fname, lname, email, password: hashed });

    res.json({ token: generateToken(user), user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ error: 'Invalid email or password' });

    // Block Google-only users from password login
    if (!user.password)
      return res.status(401).json({ error: 'This account uses Google Sign-In' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: 'Invalid email or password' });

    res.json({ token: generateToken(user), user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GOOGLE AUTH — creates account if doesn't exist
app.post('/api/auth/google', async (req, res) => {
  try {
    const { email, fname, lname, googleId } = req.body;

    if (!email || !googleId)
      return res.status(400).json({ error: 'Missing Google account info' });

    let user = await User.findOne({ email });

    if (!user) {
      // First time Google login → create account
      user = await User.create({ fname, lname, email, googleId, password: null });
    } else if (!user.googleId) {
      // Existing email account → link Google to it
      user.googleId = googleId;
      await user.save();
    }

    res.json({ token: generateToken(user), user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// VERIFY TOKEN
app.get('/api/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(401).json({ valid: false });
    res.json({ valid: true, user: safeUser(user) });
  } catch {
    res.status(401).json({ valid: false });
  }
});

// ─────────────────────────────────────────────
// PROFILE ROUTES
// ─────────────────────────────────────────────

// UPDATE PROFILE
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const allowed = ['fname','lname','phone','location','bio','college','eduLevel','eduField','gradYear','experience','interest','skills'];
    const updates = {};
    allowed.forEach(key => { if (req.body[key] !== undefined) updates[key] = req.body[key]; });

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    res.json({ user: safeUser(user) });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGE PASSWORD
app.put('/api/change-password', authMiddleware, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user.id);

    if (!user.password)
      return res.status(400).json({ error: 'This account uses Google Sign-In' });

    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ACCOUNT
app.delete('/api/account', authMiddleware, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);
    res.json({ message: 'Account deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
// RESUME ROUTES (your existing ones)
// ─────────────────────────────────────────────
app.post('/api/resume/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });

    const role = req.body.role || '';
    const form = new FormData();
    form.append('file', req.file.buffer, {
      filename: req.file.originalname,
      contentType: req.file.mimetype
    });
    form.append('role', role);

    const pyRes = await fetch(`${PYTHON_SERVICE}/extract`, {
      method: 'POST',
      body: form,
      headers: form.getHeaders()
    });

    const pyData = await pyRes.json();
    if (!pyRes.ok) return res.status(500).json({ error: pyData });
    res.json(pyData);

  } catch (err) {
    res.status(500).json({ error: { message: 'Python service unavailable: ' + err.message } });
  }
});

app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { messages, model, max_tokens, temperature, skillContext } = req.body;

    const skillsNote = skillContext
      ? `\n\nSKILL DATABASE ANALYSIS:\n` +
        `Required: ${skillContext.required_skills?.join(', ')}\n` +
        `Matched: ${skillContext.matched_skills?.join(', ') || 'none'}\n` +
        `Missing: ${skillContext.missing_skills?.join(', ') || 'none'}\n` +
        `Score: ${skillContext.match_pct}%\n`
      : '';

    const enhancedMessages = messages.map(m =>
      m.role === 'user' ? { ...m, content: m.content + skillsNote } : m
    );

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: model || 'llama-3.3-70b-versatile',
        max_tokens: max_tokens || 2000,
        temperature: temperature || 0.3,
        messages: enhancedMessages
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);
    res.json(data);

  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
});

app.get('/api/roles', async (req, res) => {
  try {
    const pyRes = await fetch(`${PYTHON_SERVICE}/roles`);
    const data = await pyRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Python service unavailable' });
  }
});

app.post('/api/roadmap/generate', async (req, res) => {
  try {
    const { goal, level, months, skills } = req.body;

    const prompt = `You are a career roadmap generator. Generate a detailed, structured learning roadmap.

User wants to become: ${goal}
Experience level: ${level}
Timeline: ${months} months
Current skills: ${skills && skills.length > 0 ? skills.join(', ') : 'none'}

Respond ONLY with a valid JSON object in this exact format (no markdown, no extra text):
{
  "readinessScore": <number 0-100>,
  "scoreLabel": "<short encouraging label>",
  "skillGaps": [{ "name": "<skill>", "level": "high"|"med"|"low" }],
  "phases": [{
    "title": "<phase title>",
    "weeks": <number>,
    "desc": "<2-3 sentences>",
    "topics": ["topic1","topic2","topic3","topic4"],
    "resources": ["Resource 1","Resource 2","Resource 3"],
    "milestone": "<what user can build/do>"
  }]
}

Rules:
- Total weeks = ${months * 4}
- Create ${months <= 3 ? 3 : months <= 6 ? 4 : 5} phases
- 4-6 skillGaps, 4-6 topics per phase`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        temperature: 0.4,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json(data);

    const raw = data.choices[0].message.content.trim();
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();
    res.json(JSON.parse(cleaned));

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─────────────────────────────────────────────
app.listen(process.env.PORT || 3000, () => {
  console.log('✅ PathwayAI backend running on http://localhost:3000');
});