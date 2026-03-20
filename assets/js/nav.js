/* =========================================================
   PATHWAYAI — SHARED JS  (nav.js)
   ========================================================= */

// Active nav link
(function () {
  const page = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === page) a.classList.add('active');
  });
})();

// Toast
function showToast(msg, ms = 3200) {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove('show'), ms);
}

// Scroll reveal
(function () {
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();

// Password toggle
function togglePwd(id, btn) {
  const inp = document.getElementById(id);
  const hidden = inp.type === 'password';
  inp.type = hidden ? 'text' : 'password';
  btn.innerHTML = hidden
    ? `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M17.94 17.94A10 10 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9 9 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

// Skill chips
const skillsArr = [];
function addSkill(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const v = e.target.value.trim().replace(/,$/, '');
  if (!v || skillsArr.includes(v)) { e.target.value = ''; return; }
  skillsArr.push(v);
  renderChips();
  e.target.value = '';
}
function removeSkill(s) { skillsArr.splice(skillsArr.indexOf(s), 1); renderChips(); }
function renderChips() {
  const area = document.getElementById('skills-area');
  const inp  = document.getElementById('skill-input');
  if (!area || !inp) return;
  area.innerHTML = '';
  skillsArr.forEach(s => {
    const c = document.createElement('div'); c.className = 'skill-chip';
    c.innerHTML = `<span>${s}</span><button type="button" onclick="removeSkill('${s}')">×</button>`;
    area.appendChild(c);
  });
  area.appendChild(inp);
}