/* ═══════════════════════════════════════════════════
   quiz-results.js  —  PathwayAI Career Results Page
   ═══════════════════════════════════════════════════ */

// ── CAREER DATA MAP ──
const CAREER_DATA = {
  "Frontend Engineer": {
    icon: "💻", score: 91,
    tags: ["React", "CSS", "JavaScript"],
    salary: "$68k – $120k", growth: "22% Growth", demand: "Very High",
    skills: [
      { name: "JavaScript / TypeScript", pct: 85, level: "high" },
      { name: "React / Vue", pct: 72, level: "high" },
      { name: "UI/UX Design", pct: 55, level: "medium" },
      { name: "System Design", pct: 38, level: "low" },
      { name: "Testing & CI/CD", pct: 45, level: "medium" }
    ],
    nodes: ["React", "Node.js", "CSS", "TypeScript", "UI Design", "REST APIs", "Git"]
  },
  "Product Designer": {
    icon: "🎨", score: 78,
    tags: ["Figma", "UX", "Prototyping"],
    salary: "$60k – $110k", growth: "18% Growth", demand: "High",
    skills: [
      { name: "Figma / Sketch", pct: 80, level: "high" },
      { name: "User Research", pct: 65, level: "high" },
      { name: "Prototyping", pct: 70, level: "high" },
      { name: "Front-end basics", pct: 35, level: "low" },
      { name: "Data Analysis", pct: 40, level: "low" }
    ],
    nodes: ["Figma", "UX Research", "Prototyping", "Typography", "Motion", "Wireframing", "Branding"]
  },
  "Data Analyst": {
    icon: "📊", score: 63,
    tags: ["Python", "SQL", "Tableau"],
    salary: "$55k – $95k", growth: "25% Growth", demand: "High",
    skills: [
      { name: "Python / R", pct: 75, level: "high" },
      { name: "SQL", pct: 82, level: "high" },
      { name: "Data Visualisation", pct: 60, level: "medium" },
      { name: "Statistics", pct: 55, level: "medium" },
      { name: "Machine Learning", pct: 30, level: "low" }
    ],
    nodes: ["Python", "SQL", "Pandas", "Tableau", "Statistics", "Excel", "Power BI"]
  },
  "Backend Developer": {
    icon: "⚙️", score: 54,
    tags: ["Node.js", "Databases", "APIs"],
    salary: "$72k – $130k", growth: "20% Growth", demand: "Very High",
    skills: [
      { name: "Node.js / Python", pct: 80, level: "high" },
      { name: "Databases (SQL/NoSQL)", pct: 70, level: "high" },
      { name: "API Design", pct: 65, level: "medium" },
      { name: "DevOps / Cloud", pct: 40, level: "low" },
      { name: "Security", pct: 35, level: "low" }
    ],
    nodes: ["Node.js", "PostgreSQL", "MongoDB", "Docker", "REST", "AWS", "Redis"]
  }
};

// Read career scores from localStorage (set by quiz-assessment.js) or use defaults
function getCareerScores() {
  try {
    const stored = localStorage.getItem("quizCareerScores");
    if (stored) return JSON.parse(stored);
  } catch (e) {}
  // Fallback to hardcoded defaults
  return [
    { name: "Frontend Engineer",  score: 91 },
    { name: "Product Designer",   score: 78 },
    { name: "Data Analyst",       score: 63 },
    { name: "Backend Developer",  score: 54 }
  ];
}

const careers = getCareerScores().map(c => ({
  ...c,
  ...(CAREER_DATA[c.name] || { icon: "🔭", tags: [], salary: "Varies", growth: "Growing", demand: "Moderate", skills: [], nodes: [] })
}));

const topCareer = careers[0];

// ── HELPERS ──
function showToast(msg) {
  const t = document.getElementById("toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2800);
}

// ════════════════════════════════
// HERO RING ANIMATION
// ════════════════════════════════
function animateRing(targetPct) {
  const circle = document.getElementById("ring-progress");
  const pctEl  = document.getElementById("match-pct");
  if (!circle || !pctEl) return;
  const circumference = 502;
  const offset = circumference - (targetPct / 100) * circumference;
  let current = 0;
  const step = () => {
    current = Math.min(current + 1.5, targetPct);
    pctEl.textContent = Math.round(current) + "%";
    circle.style.strokeDashoffset = circumference - (current / 100) * circumference;
    if (current < targetPct) requestAnimationFrame(step);
  };
  setTimeout(() => requestAnimationFrame(step), 400);
}

// ── SET HERO ──
function initHero() {
  const pill = document.getElementById("top-career-pill");
  document.getElementById("pill-icon").textContent  = topCareer.icon;
  document.getElementById("pill-name").textContent  = topCareer.name;
  const sub = document.getElementById("hero-sub");
  if (sub) sub.textContent = `Based on your answers, our AI matched you to ${careers.length} career paths — here's where you shine.`;
  animateRing(topCareer.score);
}

// ════════════════════════════════
// CAREER CARDS
// ════════════════════════════════
function buildCareerCards() {
  const grid = document.getElementById("careers-grid");
  if (!grid) return;
  grid.innerHTML = "";
  careers.forEach((c, i) => {
    const isPrimary = i === 0 ? "primary" : "";
    const rankLabel = i === 0 ? "Best Match" : `#${i + 1} Match`;
    const tagsHtml = (c.tags || []).map(t => `<span class="card-tag">${t}</span>`).join("");
    const card = document.createElement("div");
    card.className = `career-card ${isPrimary}`;
    card.style.animationDelay = `${0.3 + i * 0.1}s`;
    card.innerHTML = `
      <div class="card-rank">${rankLabel}</div>
      <div class="card-icon">${c.icon}</div>
      <div class="card-title">${c.name}</div>
      <div class="card-bar-wrap">
        <div class="card-bar-bg"><div class="card-bar-fill" data-pct="${c.score}"></div></div>
        <span class="card-pct">${c.score}%</span>
      </div>
      <div class="card-tags">${tagsHtml}</div>`;
    grid.appendChild(card);
  });

  // Animate bars after a short delay
  setTimeout(() => {
    document.querySelectorAll(".card-bar-fill").forEach(el => {
      el.style.width = el.dataset.pct + "%";
    });
  }, 500);
}

// ════════════════════════════════
// STATS ROW
// ════════════════════════════════
function buildStats() {
  document.getElementById("stat-salary-val").textContent = topCareer.salary  || "Varies";
  document.getElementById("stat-growth-val").textContent = topCareer.growth  || "Growing";
  document.getElementById("stat-demand-val").textContent = topCareer.demand  || "High";
  document.getElementById("stat-score-val").textContent  = topCareer.score   + "%";
}

// ════════════════════════════════
// SKILL BARS
// ════════════════════════════════
function buildSkillBars() {
  const container = document.getElementById("skill-bars");
  if (!container) return;
  container.innerHTML = "";
  (topCareer.skills || []).forEach(s => {
    const row = document.createElement("div");
    row.className = "skill-row";
    row.innerHTML = `
      <div class="skill-row-top">
        <span class="skill-name">${s.name}</span>
        <span class="skill-pct">${s.pct}%</span>
      </div>
      <div class="skill-track">
        <div class="skill-fill ${s.level}" data-pct="${s.pct}"></div>
      </div>`;
    container.appendChild(row);
  });
  setTimeout(() => {
    document.querySelectorAll(".skill-fill").forEach(el => {
      el.style.width = el.dataset.pct + "%";
    });
  }, 600);
}

// ════════════════════════════════
// CTA BUTTONS
// ════════════════════════════════
function buildCTA() {
  const wrap = document.getElementById("cta-btns");
  if (!wrap) return;
  const isLoggedIn = !!localStorage.getItem("userEmail");
  if (isLoggedIn) {
    wrap.innerHTML = `
      <a href="dashboard.html">
        <button class="btn-gold" style="padding:13px 28px;font-size:14px">View Dashboard →</button>
      </a>
      <a href="quiz.html">
        <button class="btn-outline" style="padding:12px 24px;font-size:14px">Retake Quiz</button>
      </a>`;
  } else {
    wrap.innerHTML = `
      <a href="login.html">
        <button class="btn-gold" style="padding:13px 28px;font-size:14px">Sign in to Save Results →</button>
      </a>
      <a href="quiz.html">
        <button class="btn-outline" style="padding:12px 24px;font-size:14px">Retake Quiz</button>
      </a>`;
  }
}

// ════════════════════════════════
// PARTICLE BACKGROUND
// ════════════════════════════════
function initParticles() {
  const canvas = document.getElementById("particles-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let W, H, pts = [];

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function spawn() {
    pts = Array.from({ length: 60 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.4 + 0.3,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      a: Math.random() * 0.5 + 0.15
    }));
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    pts.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(212,175,55,${p.a})`;
      ctx.fill();
    });
    // Draw faint connection lines
    pts.forEach((a, i) => {
      pts.slice(i + 1).forEach(b => {
        const dx = a.x - b.x, dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(212,175,55,${0.04 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });
    requestAnimationFrame(draw);
  }
  resize();
  spawn();
  draw();
  window.addEventListener("resize", () => { resize(); spawn(); });
}

// ════════════════════════════════
// 3D ECOSYSTEM CANVAS
// ════════════════════════════════
function initEcosystem() {
  const canvas = document.getElementById("ecosystem-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Match canvas resolution to CSS size
  function resize() {
    const rect = canvas.getBoundingClientRect();
    canvas.width  = rect.width  * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    ctx.scale(devicePixelRatio, devicePixelRatio);
    CW = rect.width;
    CH = rect.height;
  }

  let CW, CH;
  resize();
  window.addEventListener("resize", () => { resize(); buildNodes(); });

  // Nodes
  let nodes = [];
  let rotX = 0.2, rotY = 0;
  let isDragging = false, lastMX = 0, lastMY = 0;
  let zoom = 1;
  let animFrame;

  function buildNodes() {
    nodes = [];
    const skillNames = topCareer.nodes || [];
    const otherCareers = careers.slice(1).map(c => c.name);

    // Center node (the user / top career)
    nodes.push({ label: topCareer.name, icon: topCareer.icon, type: "center", x3: 0, y3: 0, z3: 0, r: 22 });

    // Career nodes — orbit on a tilted ring
    const cCount = Math.min(otherCareers.length, 3);
    for (let i = 0; i < cCount; i++) {
      const angle = (i / cCount) * Math.PI * 2;
      const R = 160;
      nodes.push({
        label: careers[i + 1].name,
        icon: careers[i + 1].icon,
        type: "career",
        x3: R * Math.cos(angle),
        y3: R * Math.sin(angle) * 0.45,
        z3: R * Math.sin(angle) * 0.88,
        r: 15
      });
    }

    // Skill nodes — further outer ring
    const sCount = Math.min(skillNames.length, 7);
    for (let i = 0; i < sCount; i++) {
      const angle = (i / sCount) * Math.PI * 2 + 0.4;
      const R = 260;
      nodes.push({
        label: skillNames[i],
        type: "skill",
        x3: R * Math.cos(angle),
        y3: R * Math.sin(angle) * 0.35,
        z3: R * Math.sin(angle) * 0.94,
        r: 10
      });
    }
  }

  // Project 3D → 2D
  function project(x3, y3, z3) {
    // Rotate Y
    const cosY = Math.cos(rotY), sinY = Math.sin(rotY);
    const x1 = x3 * cosY - z3 * sinY;
    const z1 = x3 * sinY + z3 * cosY;
    // Rotate X
    const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
    const y1 = y3 * cosX - z1 * sinX;
    const z2 = y3 * sinX + z1 * cosX;
    // Perspective
    const fov = 600 * zoom;
    const scale = fov / (fov + z2);
    return {
      x: CW / 2 + x1 * scale,
      y: CH / 2 + y1 * scale,
      s: scale,
      z: z2
    };
  }

  // Draw loop
  function draw() {
    ctx.clearRect(0, 0, CW, CH);

    // Sort by z depth
    const projected = nodes.map(n => ({
      ...n,
      proj: project(n.x3, n.y3, n.z3)
    })).sort((a, b) => a.proj.z - b.proj.z);

    // Draw edges first
    projected.forEach(n => {
      if (n.type === "center") return;
      const center = projected.find(p => p.type === "center");
      if (!center) return;
      ctx.beginPath();
      ctx.moveTo(center.proj.x, center.proj.y);
      ctx.lineTo(n.proj.x, n.proj.y);
      const alpha = n.type === "career" ? 0.18 : 0.1;
      const color = n.type === "career" ? `rgba(212,175,55,${alpha})` : `rgba(100,180,255,${alpha})`;
      ctx.strokeStyle = color;
      ctx.lineWidth = n.type === "career" ? 1 : 0.5;
      ctx.setLineDash(n.type === "skill" ? [3, 5] : []);
      ctx.stroke();
      ctx.setLineDash([]);
    });

    // Draw nodes
    projected.forEach(n => {
      const { x, y, s } = n.proj;
      const r = n.r * s;

      if (n.type === "center") {
        // Glowing center
        const grd = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
        grd.addColorStop(0, "rgba(212,175,55,0.25)");
        grd.addColorStop(1, "rgba(212,175,55,0)");
        ctx.beginPath(); ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = grd; ctx.fill();
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212,175,55,0.15)";
        ctx.strokeStyle = "rgba(212,175,55,0.8)";
        ctx.lineWidth = 1.5; ctx.fill(); ctx.stroke();
        // Icon
        ctx.font = `${Math.max(10, 14 * s)}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = "#fff";
        ctx.fillText(n.icon || "🎯", x, y);
        // Label below
        ctx.font = `500 ${Math.max(9, 11 * s)}px 'Playfair Display', serif`;
        ctx.fillStyle = `rgba(212,175,55,${Math.min(1, 0.85 * s + 0.1)})`;
        ctx.fillText(n.label, x, y + r + 14 * s);

      } else if (n.type === "career") {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(212,175,55,0.12)";
        ctx.strokeStyle = `rgba(212,175,55,${0.5 * s + 0.2})`;
        ctx.lineWidth = 1; ctx.fill(); ctx.stroke();
        ctx.font = `${Math.max(8, 11 * s)}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillText(n.icon, x, y);
        ctx.font = `${Math.max(8, 10 * s)}px sans-serif`;
        ctx.fillStyle = `rgba(200,200,200,${Math.min(1, 0.7 * s + 0.1)})`;
        ctx.fillText(n.label.split(" ")[0], x, y + r + 10 * s);

      } else {
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100,180,255,${0.12 * s + 0.04})`;
        ctx.strokeStyle = `rgba(100,180,255,${0.45 * s + 0.1})`;
        ctx.lineWidth = 0.8; ctx.fill(); ctx.stroke();
        ctx.font = `${Math.max(7, 9 * s)}px sans-serif`;
        ctx.textAlign = "center"; ctx.textBaseline = "middle";
        ctx.fillStyle = `rgba(180,220,255,${Math.min(1, 0.8 * s + 0.05)})`;
        ctx.fillText(n.label, x, y + r + 9 * s);
      }
    });

    // Auto-rotate slowly
    if (!isDragging) rotY += 0.003;
    animFrame = requestAnimationFrame(draw);
  }

  // ── DRAG TO ROTATE ──
  canvas.addEventListener("mousedown", e => {
    isDragging = true;
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener("mousemove", e => {
    if (!isDragging) return;
    rotY += (e.clientX - lastMX) * 0.007;
    rotX += (e.clientY - lastMY) * 0.007;
    rotX = Math.max(-1, Math.min(1, rotX));
    lastMX = e.clientX; lastMY = e.clientY;
  });
  window.addEventListener("mouseup", () => { isDragging = false; });

  // Touch
  canvas.addEventListener("touchstart", e => {
    isDragging = true;
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener("touchmove", e => {
    if (!isDragging) return;
    rotY += (e.touches[0].clientX - lastMX) * 0.007;
    rotX += (e.touches[0].clientY - lastMY) * 0.007;
    rotX = Math.max(-1, Math.min(1, rotX));
    lastMX = e.touches[0].clientX;
    lastMY = e.touches[0].clientY;
  }, { passive: true });
  canvas.addEventListener("touchend", () => { isDragging = false; });

  // Scroll to zoom
  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    zoom = Math.max(0.5, Math.min(2, zoom - e.deltaY * 0.001));
  }, { passive: false });

  buildNodes();
  draw();
}

// ════════════════════════════════
// INIT ALL
// ════════════════════════════════
document.addEventListener("DOMContentLoaded", () => {
  initParticles();
  initHero();
  buildCareerCards();
  buildStats();
  buildSkillBars();
  buildCTA();
  // Ecosystem loads after a short delay to let layout settle
  setTimeout(initEcosystem, 300);
});