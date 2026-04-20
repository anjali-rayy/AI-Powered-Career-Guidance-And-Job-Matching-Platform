// backend/server.js
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const FormData = require('form-data');
const multer = require('multer');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const upload = multer({ storage: multer.memoryStorage() });

const PYTHON_SERVICE = 'http://localhost:5000';

// ─────────────────────────────────────────────
// Route 1: PDF Upload → Python extracts text
// Frontend sends the file here first
// ─────────────────────────────────────────────
app.post('/api/resume/extract', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: { message: 'No file uploaded' } });

    const role = req.body.role || '';

    // Forward file to Python service
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

// ─────────────────────────────────────────────
// Route 2: AI Analysis → Groq with skill context
// ─────────────────────────────────────────────
app.post('/api/resume/analyze', async (req, res) => {
  try {
    const { messages, model, max_tokens, temperature, skillContext } = req.body;

    // Inject Python skill analysis into the prompt if provided
    const skillsNote = skillContext
      ? `\n\nSKILL DATABASE ANALYSIS (pre-computed):\n` +
        `Required skills for this role: ${skillContext.required_skills?.join(', ')}\n` +
        `Skills found in resume: ${skillContext.matched_skills?.join(', ') || 'none detected'}\n` +
        `Skills missing: ${skillContext.missing_skills?.join(', ') || 'none'}\n` +
        `Database match score: ${skillContext.match_pct}%\n` +
        `Use this as additional reference for your analysis.\n`
      : '';

    const enhancedMessages = messages.map(m => {
      if (m.role === 'user') return { ...m, content: m.content + skillsNote };
      return m;
    });

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

// ─────────────────────────────────────────────
// Route 3: Get all available roles from Python
// ─────────────────────────────────────────────
app.get('/api/roles', async (req, res) => {
  try {
    const pyRes = await fetch(`${PYTHON_SERVICE}/roles`);
    const data = await pyRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Python service unavailable' });
  }
});

// ─────────────────────────────────────────────
// Route 4: AI Roadmap Generator → Groq
// ─────────────────────────────────────────────
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
  "readinessScore": <number 0-100 based on current skills vs goal>,
  "scoreLabel": "<short encouraging label>",
  "skillGaps": [
    { "name": "<skill name>", "level": "high" | "med" | "low" }
  ],
  "phases": [
    {
      "title": "<phase title>",
      "weeks": <number of weeks>,
      "desc": "<2-3 sentence description>",
      "topics": ["topic1", "topic2", "topic3", "topic4"],
      "resources": ["Resource 1", "Resource 2", "Resource 3"],
      "milestone": "<what the user can do/build by end of this phase>"
    }
  ]
}

Rules:
- Total weeks across all phases must equal ${months * 4}
- Create ${months <= 3 ? 3 : months <= 6 ? 4 : 5} phases
- skillGaps should list 4-6 key skills the user needs to learn
- topics should have 4-6 items per phase
- resources should be real platforms (e.g. "freeCodeCamp", "Udemy", "MDN Docs")`;

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

    // Strip markdown code fences if present
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/```\s*$/i, '').trim();

    const roadmap = JSON.parse(cleaned);
    res.json(roadmap);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => {
  console.log('✅ PathwayAI backend running on http://localhost:3000');
});