// ─────────────────────────────────────────────
// FIREBASE CONFIG — replace with your actual config
// ─────────────────────────────────────────────
const firebaseConfig = {
  apiKey: "AIzaSyDvEe3NRff3ggy2Iq898W49cKDTzRFPP9E",
  authDomain: "pathwayai-f5a92.firebaseapp.com",
  projectId: "pathwayai-f5a92",
  storageBucket: "pathwayai-f5a92.firebasestorage.app",
  messagingSenderId: "645042947767",
  appId: "1:645042947767:web:061cdd8c6996c2540a2f32",
  measurementId: "G-PDLJVXK3L5"
};

if (!firebase.apps?.length) firebase.initializeApp(firebaseConfig);

// ─────────────────────────────────────────────
// TOAST
// ─────────────────────────────────────────────
function showToast(msg, duration = 3000) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), duration);
}

// ─────────────────────────────────────────────
// TOGGLE PASSWORD VISIBILITY
// ─────────────────────────────────────────────
function togglePwd(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg viewBox="0 0 24 24"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

// ─────────────────────────────────────────────
// FIELD ERRORS
// ─────────────────────────────────────────────
function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearErrs() {
  document.querySelectorAll('.field-err').forEach(e => {
    e.textContent = ''; e.style.display = 'none';
  });
}

// ─────────────────────────────────────────────
// PASSWORD STRENGTH CHECKER
// ─────────────────────────────────────────────
function checkStrength(val) {
  const segs = ['s1','s2','s3','s4'];
  const lbl  = document.getElementById('slbl');
  let score  = 0;
  if (val.length >= 8)              score++;
  if (/[A-Z]/.test(val))           score++;
  if (/[0-9]/.test(val))           score++;
  if (/[^A-Za-z0-9]/.test(val))    score++;

  const colors = ['','#e74c3c','#e67e22','#f1c40f','#2ecc71'];
  const labels = ['','Weak','Fair','Good','Strong'];

  segs.forEach((id, i) => {
    const el = document.getElementById(id);
    if (el) el.style.background = i < score ? colors[score] : '';
  });
  if (lbl) {
    lbl.textContent = val.length ? labels[score] : '';
    lbl.style.color = colors[score];
  }
}

// ─────────────────────────────────────────────
// REGISTER — MULTI STEP
// ─────────────────────────────────────────────
let regSkills = [];

function goStep(n) {
  // Validate before moving forward
  if (n === 2) {
    clearErrs();
    const fname = document.getElementById('fname')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const pass  = document.getElementById('reg-pass')?.value;
    const pass2 = document.getElementById('reg-pass2')?.value;
    let ok = true;

    if (!fname) { setErr('fname-err', 'First name is required'); ok = false; }
    if (!email) { setErr('regemail-err', 'Email is required'); ok = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('regemail-err', 'Enter a valid email'); ok = false; }
    if (!pass || pass.length < 8) { setErr('regpass-err', 'Password must be at least 8 characters'); ok = false; }
    if (pass !== pass2) { setErr('regpass2-err', 'Passwords do not match'); ok = false; }
    if (!ok) return;
  }

  // Show correct step
  [1, 2, 3].forEach(i => {
    const el = document.getElementById(`step-${i}`);
    if (el) el.style.display = i === n ? 'block' : 'none';
  });

  // Update step dots
  [1, 2, 3].forEach(i => {
    const dot = document.getElementById(`dot-${i}`);
    if (dot) {
      dot.classList.toggle('active', i <= n);
      dot.classList.toggle('done', i < n);
    }
  });
}

function regAddSkill(e) {
  if (e.key !== 'Enter') return;
  e.preventDefault();
  const input = document.getElementById('skill-input');
  const val   = input.value.trim();
  if (!val || regSkills.includes(val)) { input.value = ''; return; }

  regSkills.push(val);
  const area = document.getElementById('skills-area');
  const tag  = document.createElement('span');
  tag.className   = 'skill-tag';
  tag.innerHTML   = `${val} <button onclick="removeSkill('${val}', this)">×</button>`;
  area.insertBefore(tag, input);
  input.value = '';
}

function removeSkill(val, btn) {
  regSkills = regSkills.filter(s => s !== val);
  btn.parentElement.remove();
}

async function handleRegister() {
  clearErrs();
  const apiErr = document.getElementById('reg-api-error');
  if (apiErr) apiErr.style.display = 'none';

  const fname    = document.getElementById('fname')?.value.trim();
  const lname    = document.getElementById('lname')?.value.trim();
  const email    = document.getElementById('reg-email')?.value.trim();
  const password = document.getElementById('reg-pass')?.value;
  const eduLevel = document.getElementById('edu-level')?.value;
  const eduField = document.getElementById('edu-field')?.value;
  const gradYear = document.getElementById('grad-year')?.value;
  const experience = document.getElementById('experience')?.value;
  const location = document.getElementById('location')?.value.trim();
  const interest = document.getElementById('interests')?.value;
  const bio      = document.getElementById('bio')?.value.trim();

  // Set loading state
  const btn = document.getElementById('reg-submit-btn');
  const txt = document.getElementById('reg-btn-txt');
  const ldr = document.getElementById('reg-loader');
  if (btn) btn.disabled = true;
  if (txt) txt.style.display = 'none';
  if (ldr) ldr.style.display = 'flex';

  try {
    await apiRegister({
      fname, lname, email, password,
      eduLevel, eduField, gradYear,
      experience, location,
      interest, bio,
      skills: regSkills
    });
    showToast('✓ Account created successfully!');
    setTimeout(() => window.location.href = '../app/dashboard.html', 900);
  } catch (err) {
    if (apiErr) {
      apiErr.textContent = err.message;
      apiErr.style.display = 'block';
    }
    if (btn) btn.disabled = false;
    if (txt) txt.style.display = 'inline';
    if (ldr) ldr.style.display = 'none';
  }
}

// ─────────────────────────────────────────────
// LOGIN
// ─────────────────────────────────────────────
function setLoading(on) {
  const btnText = document.getElementById('btn-text');
  const btnArr  = document.getElementById('btn-arr');
  const btnLoad = document.getElementById('btn-load');
  const btn     = document.getElementById('submit-btn');
  if (btnText) btnText.style.display = on ? 'none'   : 'inline';
  if (btnArr)  btnArr.style.display  = on ? 'none'   : 'inline';
  if (btnLoad) btnLoad.style.display = on ? 'flex'   : 'none';
  if (btn)     btn.disabled          = on;
}

async function handleLogin(e) {
  e.preventDefault();
  clearErrs();
  const apiErr = document.getElementById('api-error');
  if (apiErr) apiErr.style.display = 'none';

  const email = document.getElementById('email')?.value.trim();
  const pass  = document.getElementById('password')?.value;
  let ok = true;

  if (!email) { setErr('email-err', 'Email is required'); ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email-err', 'Enter a valid email'); ok = false; }
  if (!pass) { setErr('pass-err', 'Password is required'); ok = false; }
  if (!ok) return;

  setLoading(true);
  try {
    await apiLogin(email, pass);
    showToast('✓ Signed in successfully!');
    setTimeout(() => window.location.href = '../app/dashboard.html', 900);
  } catch (err) {
    if (apiErr) {
      apiErr.textContent = err.message;
      apiErr.style.display = 'block';
    }
    setLoading(false);
  }
}

// ─────────────────────────────────────────────
// GOOGLE SIGN IN
// ─────────────────────────────────────────────
async function signInWithGoogle() {
  try {
    const provider = new firebase.auth.GoogleAuthProvider();
    const result   = await firebase.auth().signInWithPopup(provider);
    const fbUser   = result.user;

    // Send to our backend to create/link account
    const res = await fetch('http://localhost:3000/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email:    fbUser.email,
        fname:    fbUser.displayName?.split(' ')[0] || '',
        lname:    fbUser.displayName?.split(' ').slice(1).join(' ') || '',
        googleId: fbUser.uid
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Google sign-in failed');

    setToken(data.token);
    syncUserToStorage(data.user);
    showToast('✓ Signed in with Google!');
    setTimeout(() => window.location.href = '../app/dashboard.html', 900);

  } catch (err) {
    showToast('Google sign-in failed: ' + err.message);
  }
}