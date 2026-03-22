// Auth redirect
if (localStorage.getItem('authToken')) window.location.replace('dashboard.html');

/* ── All functions are global — required for onclick attributes ── */

var regStep   = 1;
var regSkills = [];

function goStep(n) {
  if (n > regStep) {
    if (regStep === 1 && !validateStep1()) return;
    if (regStep === 2 && !validateStep2()) return;
  }
  document.getElementById('step-' + regStep).style.display = 'none';
  document.getElementById('step-' + n).style.display = 'block';
  for (var i = 1; i <= 3; i++) {
    var d = document.getElementById('dot-' + i);
    d.className = 'step-dot' + (i < n ? ' done' : i === n ? ' active' : '');
  }
  regStep = n;
}

function validateStep1() {
  clearRegErrs();
  var ok    = true;
  var fname = document.getElementById('fname').value.trim();
  var email = document.getElementById('reg-email').value.trim();
  var pass  = document.getElementById('reg-pass').value;
  var pass2 = document.getElementById('reg-pass2').value;
  if (!fname)                                          { setRegErr('fname-err',    'First name is required');             ok = false; }
  if (!email)                                          { setRegErr('regemail-err', 'Email is required');                  ok = false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setRegErr('regemail-err', 'Enter a valid email');               ok = false; }
  if (!pass)                                           { setRegErr('regpass-err',  'Password is required');               ok = false; }
  else if (pass.length < 8)                            { setRegErr('regpass-err',  'Password must be at least 8 chars'); ok = false; }
  if (pass !== pass2)                                  { setRegErr('regpass2-err', "Passwords don't match");             ok = false; }
  return ok;
}

function validateStep2() {
  clearRegErrs();
  if (!document.getElementById('edu-level').value) {
    setRegErr('edulevel-err', 'Please select your education level');
    return false;
  }
  return true;
}

async function handleRegister() {
  document.getElementById('reg-api-error').style.display = 'none';
  document.getElementById('reg-btn-txt').style.display   = 'none';
  document.getElementById('reg-loader').style.display    = 'flex';
  document.getElementById('reg-submit-btn').disabled     = true;

  try {
    await apiRegister({
      fname:      document.getElementById('fname').value.trim(),
      lname:      document.getElementById('lname').value.trim(),
      email:      document.getElementById('reg-email').value.trim(),
      password:   document.getElementById('reg-pass').value,
      eduLevel:   document.getElementById('edu-level').value,
      eduField:   document.getElementById('edu-field').value,
      gradYear:   document.getElementById('grad-year').value,
      experience: document.getElementById('experience').value,
      location:   document.getElementById('location').value.trim(),
      interest:   document.getElementById('interests').value,
      skills:     regSkills,
      bio:        document.getElementById('bio').value.trim()
    });
    var name = document.getElementById('fname').value.trim();
    showToast('🎉 Welcome, ' + name + '! Account created!');
    setTimeout(function() { window.location.href = 'dashboard.html'; }, 1200);
  } catch(err) {
    var el = document.getElementById('reg-api-error');
    el.textContent   = err.message;
    el.style.display = 'block';
    document.getElementById('reg-btn-txt').style.display = 'inline';
    document.getElementById('reg-loader').style.display  = 'none';
    document.getElementById('reg-submit-btn').disabled   = false;
  }
}

function regAddSkill(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  var v = e.target.value.trim().replace(/,$/, '');
  if (!v || regSkills.includes(v)) { e.target.value = ''; return; }
  regSkills.push(v);
  renderRegChips();
  e.target.value = '';
}

function regRemoveSkill(s) {
  regSkills.splice(regSkills.indexOf(s), 1);
  renderRegChips();
}

function renderRegChips() {
  var area = document.getElementById('skills-area');
  var inp  = document.getElementById('skill-input');
  area.innerHTML = '';
  regSkills.forEach(function(s) {
    var c = document.createElement('div');
    c.className = 'skill-chip';
    c.innerHTML = '<span>' + s + '</span><button type="button" onclick="regRemoveSkill(\'' + s + '\')">×</button>';
    area.appendChild(c);
  });
  area.appendChild(inp);
}

function checkStrength(v) {
  ['s1','s2','s3','s4'].forEach(function(id) {
    document.getElementById(id).className = 'strength-seg';
  });
  var lbl = document.getElementById('slbl');
  if (!v) { lbl.textContent = ''; return; }
  var s = 0;
  if (v.length >= 8)           s++;
  if (/[A-Z]/.test(v))         s++;
  if (/[0-9]/.test(v))         s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  var cls  = ['weak','weak','fair','strong'];
  var lbls = ['Weak','Weak','Good','Strong'];
  var cols = ['#6B2C2C','#6B2C2C','#8B6914','#2E6B3E'];
  var segs = ['s1','s2','s3','s4'];
  for (var i = 0; i < s; i++) document.getElementById(segs[i]).classList.add(cls[s-1]);
  lbl.textContent = 'Strength: ' + lbls[s-1];
  lbl.style.color = cols[s-1];
}

function setRegErr(id, msg) {
  var el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearRegErrs() {
  document.querySelectorAll('.field-err').forEach(function(e) {
    e.textContent = ''; e.style.display = 'none';
  });
}
