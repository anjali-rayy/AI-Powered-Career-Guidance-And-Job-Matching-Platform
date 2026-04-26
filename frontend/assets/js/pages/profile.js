/* ── LOAD USER DATA (instant from cache) ── */
const userName  = localStorage.getItem('userName')  || '';
const userEmail = localStorage.getItem('userEmail') || '';
const userRole  = localStorage.getItem('userRole')  || '';
const parts     = userName.trim().split(' ');
const initials  = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (userName.slice(0, 2).toUpperCase() || 'U');

document.getElementById('sidebar-av').textContent   = initials;
document.getElementById('sidebar-name').textContent = userName || 'User';
document.getElementById('sidebar-role').textContent = userRole || 'PathwayAI Member';
document.getElementById('topbar-av').textContent    = initials;
document.getElementById('profile-av').textContent   = initials;
document.getElementById('hero-name').textContent    = userName || 'Your Name';
document.getElementById('hero-role').textContent    = userRole || 'PathwayAI Member';
if (userEmail) document.getElementById('hero-email').textContent = userEmail;

/* ── SKILLS ── */
let profileSkills = [];

// Restore form fields instantly from cache (don't wait for API)
(function restoreProfileFromCache() {
  const p = JSON.parse(localStorage.getItem('profileData') || '{}');
  if (!p.fname && !p.email) return; // nothing saved yet, skip
  const n = userName.split(' ');
  document.getElementById('p-fname').value    = p.fname    || n[0] || '';
  document.getElementById('p-lname').value    = p.lname    || n.slice(1).join(' ') || '';
  document.getElementById('p-email').value    = p.email    || userEmail || '';
  document.getElementById('p-phone').value    = p.phone    || '';
  document.getElementById('p-location').value = p.location || '';
  document.getElementById('p-bio').value      = p.bio      || '';
  document.getElementById('p-college').value  = p.college  || '';
  setSelect('p-edu-level',  p.eduLevel   || '');
  setSelect('p-edu-field',  p.eduField   || '');
  setSelect('p-grad-year',  p.gradYear   || '');
  setSelect('p-experience', p.experience || '');
  setSelect('p-interest',   p.interest   || '');
  profileSkills = p.skills || [];
  if (p.location) document.getElementById('hero-location').textContent = '📍 ' + p.location;
  if (p.eduLevel) document.getElementById('hero-edu').textContent      = '🎓 ' + p.eduLevel;
  renderSkills();
  updateCompletion();
  loadSocialLinks();
})();

/* ── LOAD SAVED PROFILE ── */
function loadProfile() {
  const p = JSON.parse(localStorage.getItem('profileData') || '{}');
  const nameParts = (localStorage.getItem('userName') || '').split(' ');
  document.getElementById('p-fname').value    = p.fname    || nameParts[0] || '';
  document.getElementById('p-lname').value    = p.lname    || nameParts.slice(1).join(' ') || '';
  document.getElementById('p-email').value    = p.email    || localStorage.getItem('userEmail') || '';
  document.getElementById('p-phone').value    = p.phone    || '';
  document.getElementById('p-location').value = p.location || '';
  document.getElementById('p-bio').value      = p.bio      || '';
  document.getElementById('p-college').value  = p.college  || '';
  setSelect('p-edu-level',  p.eduLevel   || '');
  setSelect('p-edu-field',  p.eduField   || '');
  setSelect('p-grad-year',  p.gradYear   || '');
  setSelect('p-experience', p.experience || '');
  setSelect('p-interest',   p.interest   || '');
  profileSkills = p.skills || [];
  renderSkills();
  if (p.location) document.getElementById('hero-location').textContent = '📍 ' + p.location;
  if (p.eduLevel) document.getElementById('hero-edu').textContent      = '🎓 ' + p.eduLevel;
  updateCompletion();
}

function setSelect(id, val) {
  const el = document.getElementById(id);
  for (let o of el.options) { if (o.value === val || o.text === val) { o.selected = true; break; } }
}

/* ── SAVE PROFILE (FIXED: now saves to MongoDB via API) ── */
async function saveProfile() {
  const fname    = document.getElementById('p-fname').value.trim();
  const lname    = document.getElementById('p-lname').value.trim();
  const email    = document.getElementById('p-email').value.trim();
  const location = document.getElementById('p-location').value.trim();
  const eduLevel = document.getElementById('p-edu-level').value;
  const eduField = document.getElementById('p-edu-field').value;

  const profileData = {
    fname, lname,
    phone:      document.getElementById('p-phone').value.trim(),
    location,
    bio:        document.getElementById('p-bio').value.trim(),
    college:    document.getElementById('p-college').value.trim(),
    eduLevel, eduField,
    gradYear:   document.getElementById('p-grad-year').value,
    experience: document.getElementById('p-experience').value,
    interest:   document.getElementById('p-interest').value,
    skills:     profileSkills
  };

  try {
    // ✅ FIXED: Save to MongoDB via API (persists after logout)
    await apiUpdateProfile(profileData);
    showToast('✓ Profile saved successfully!');
  } catch (err) {
    showToast('❌ Failed to save: ' + err.message);
    return;
  }

  // Update UI after successful save
  const fullName = lname ? fname + ' ' + lname : fname;
  if (fullName) {
    localStorage.setItem('userName', fullName);
    const p2  = fullName.trim().split(' ');
    const ini = p2.length >= 2 ? (p2[0][0] + p2[1][0]).toUpperCase() : fullName.slice(0, 2).toUpperCase();
    ['sidebar-av','topbar-av','profile-av'].forEach(id => document.getElementById(id).textContent = ini);
    document.getElementById('sidebar-name').textContent = fullName;
    document.getElementById('hero-name').textContent    = fullName;
  }
  if (email) {
    localStorage.setItem('userEmail', email);
    document.getElementById('hero-email').textContent = email;
  }
  if (eduLevel) {
    const role = eduLevel + (eduField ? ' · ' + eduField.split('/')[0].trim() : '');
    localStorage.setItem('userRole', role);
    document.getElementById('sidebar-role').textContent = role;
    document.getElementById('hero-role').textContent    = role;
    document.getElementById('hero-edu').textContent     = '🎓 ' + eduLevel;
  }
  if (location) document.getElementById('hero-location').textContent = '📍 ' + location;
  updateCompletion();
}


function handleSkillKey(e) {
  if (e.key !== 'Enter' && e.key !== ',') return;
  e.preventDefault();
  const val = e.target.value.trim().replace(/,$/, '');
  if (!val || profileSkills.includes(val)) { e.target.value = ''; return; }
  profileSkills.push(val);
  renderSkills();
  e.target.value = '';
  updateCompletion();
}

function removeSkill(s) {
  profileSkills = profileSkills.filter(x => x !== s);
  renderSkills();
  updateCompletion();
}

function renderSkills() {
  const wrap = document.getElementById('skills-wrap');
  const inp  = document.getElementById('skill-inp');
  wrap.innerHTML = '';
  profileSkills.forEach(s => {
    const chip = document.createElement('div');
    chip.className = 'p-chip';
    chip.innerHTML = `<span>${s}</span><button type="button" onclick="removeSkill('${s}')">×</button>`;
    wrap.appendChild(chip);
  });
  wrap.appendChild(inp);
  document.getElementById('skills-count').textContent = profileSkills.length;
}

/* ── COMPLETION ── */
function updateCompletion() {
  const fname = document.getElementById('p-fname').value.trim();
  const email = document.getElementById('p-email').value.trim();
  const loc   = document.getElementById('p-location').value.trim();
  const edu   = document.getElementById('p-edu-level').value;
  const bio   = document.getElementById('p-bio').value.trim();
  const checks = [
    { id: 'chk-name',     lbl: 'lbl-name',     done: !!fname,                   text: 'Full name added ✓' },
    { id: 'chk-email',    lbl: 'lbl-email',    done: !!email,                   text: 'Email added ✓' },
    { id: 'chk-location', lbl: 'lbl-location', done: !!loc,                     text: 'Location added ✓' },
    { id: 'chk-edu',      lbl: 'lbl-edu',      done: !!edu,                     text: 'Education added ✓' },
    { id: 'chk-skills',   lbl: 'lbl-skills',   done: profileSkills.length >= 3, text: 'Skills added ✓' },
    { id: 'chk-bio',      lbl: 'lbl-bio',      done: !!bio,                     text: 'Bio written ✓' },
  ];
  let count = 0;
  checks.forEach(c => {
    const chk = document.getElementById(c.id);
    const lbl = document.getElementById(c.lbl);
    if (c.done) { chk.className = 'pi-check done'; chk.textContent = '✓'; lbl.className = 'pi-label'; lbl.textContent = c.text; count++; }
    else        { chk.className = 'pi-check todo'; chk.textContent = '○'; lbl.className = 'pi-label todo'; }
  });
  const pct = Math.round((count / checks.length) * 100);
  document.getElementById('completion-pct').textContent = pct + '%';
  document.getElementById('completion-bar').style.width = pct + '%';
}

['p-fname','p-email','p-location','p-bio'].forEach(id =>
  document.getElementById(id).addEventListener('input', updateCompletion)
);
document.getElementById('p-edu-level').addEventListener('change', updateCompletion);

/* ── AVATAR MENU ── */
function toggleAvatarMenu() {
  const menu = document.getElementById('avatar-menu');
  menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
  document.getElementById('menu-name').textContent  = localStorage.getItem('userName')  || 'User';
  document.getElementById('menu-email').textContent = localStorage.getItem('userEmail') || '—';
}
document.addEventListener('click', function(e) {
  const menu = document.getElementById('avatar-menu');
  if (menu && !menu.contains(e.target) && !document.getElementById('topbar-av').contains(e.target)) {
    menu.style.display = 'none';
  }
});

/* ── SIGN OUT ── */
function signOut() {
  const keysToKeep = [];
  const allKeys = Object.keys(localStorage);
  allKeys.forEach(key => {
    if (key === 'profileData' || key.startsWith('settings_')) {
      keysToKeep.push({ key, value: localStorage.getItem(key) });
    }
  });
  localStorage.clear();
  keysToKeep.forEach(item => localStorage.setItem(item.key, item.value));
  window.location.href = '../public/index.html';
}

/* ── DELETE ACCOUNT ── */
function confirmDeleteAccount() {
  const val = document.getElementById('delete-confirm-input').value.trim();
  if (val !== 'DELETE') {
    document.getElementById('delete-confirm-input').style.borderColor = 'rgba(207,102,121,0.6)';
    showToast('Type DELETE in all caps to confirm.');
    return;
  }
  document.getElementById('modal-delete').classList.remove('open');
  // Call API to delete account from MongoDB too
  apiDeleteAccount()
    .then(() => {
      showToast('Account deleted. Signing out...');
      setTimeout(() => { localStorage.clear(); window.location.href = '../public/index.html'; }, 2000);
    })
    .catch(() => {
      showToast('Account deleted locally. Signing out...');
      setTimeout(() => { localStorage.clear(); window.location.href = '../public/index.html'; }, 2000);
    });
}

function closeDeleteModal() {
  document.getElementById('modal-delete').classList.remove('open');
  const inp = document.getElementById('delete-confirm-input');
  inp.value = '';
  inp.style.borderColor = '';
}

document.getElementById('modal-delete').addEventListener('click', function(e) {
  if (e.target === this) closeDeleteModal();
});

/* ── INIT ── */
requireAuth().then(function(user) {
  if (user) {
    loadProfile();
    renderSkills();
    updateCompletion();
    loadSocialLinks();
  }
});

/* ── SOCIAL LINKS ── */
function getSocialKey(name) { return 'settings_connected-' + name + '-handle'; }

function getSocialVal(name) {
  let val = localStorage.getItem(getSocialKey(name)) || '';
  try { const p = JSON.parse(val); if (typeof p === 'string') val = p; } catch(e) {}
  return val.replace(/^["']|["']$/g, '').trim();
}

function getSocialVal(name) {
  let val = localStorage.getItem(getSocialKey(name)) || '';
  // Strip JSON quotes if value was stored with JSON.stringify
  try { const p = JSON.parse(val); if (typeof p === 'string') val = p; } catch(e) {}
  return val.replace(/^["']|["']$/g, '').trim();
}

function loadSocialLinks() {
  // Nuclear cleanup: remove ALL connected keys that have empty or tracking URLs
  ['linkedin', 'github', 'portfolio'].forEach(name => {
    const raw = localStorage.getItem('settings_connected-' + name + '-handle') || '';
    const clean = raw.replace(/^["']|["']$/g, '').trim();
    // Remove if empty, just quotes, or a tracking/redirect URL
    if (!clean || clean === '""' || clean === "''" || clean.includes('lipi=') || clean.includes('redirect')) {
      localStorage.removeItem('settings_connected-' + name + '-handle');
      localStorage.removeItem('settings_connected-' + name);
    } else if (clean !== raw) {
      localStorage.setItem('settings_connected-' + name + '-handle', clean);
    }
  });
  // One-time cleanup: fix any values saved with surrounding quotes
  ['linkedin', 'github', 'portfolio'].forEach(name => {
    const raw = localStorage.getItem(getSocialKey(name)) || '';
    const clean = raw.replace(/^["']|["']$/g, '').trim();
    if (clean !== raw) localStorage.setItem(getSocialKey(name), clean);
  });
  ['linkedin', 'github', 'portfolio'].forEach(name => {
    const saved    = getSocialVal(name);
    const lbl      = document.getElementById('lbl-social-' + name);
    const icon     = document.getElementById('icon-social-' + name);
    const btn      = document.getElementById('btn-social-' + name);
    const actRow   = document.getElementById('actions-' + name);
    const inputRow = document.getElementById('input-' + name);

    // Hide action/input rows first
    if (actRow)   actRow.style.display   = 'none';
    if (inputRow) inputRow.style.display = 'none';

    if (saved) {
      lbl.textContent       = saved;
      lbl.style.color       = '#4CAF70';
      icon.textContent      = '↗';
      icon.style.color      = '#4CAF70';
      btn.style.borderColor = 'rgba(76,175,112,0.2)';
    } else {
      lbl.textContent       = 'Not connected — click to add';
      lbl.style.color       = '';
      icon.textContent      = '+';
      icon.style.color      = '';
      btn.style.borderColor = '';
    }
  });
}

function handleSocialClick(name) {
  const saved    = getSocialVal(name);
  const actRow   = document.getElementById('actions-' + name);
  const inputRow = document.getElementById('input-' + name);

  // Close all other open rows first
  ['linkedin', 'github', 'portfolio'].forEach(n => {
    if (n !== name) {
      const a = document.getElementById('actions-' + n);
      const i = document.getElementById('input-' + n);
      if (a) a.style.display = 'none';
      if (i) i.style.display = 'none';
    }
  });

  if (saved) {
    // Connected — toggle action row (open link + edit + disconnect)
    const isOpen = actRow.style.display === 'flex';
    actRow.style.display = isOpen ? 'none' : 'flex';
  } else {
    // Not connected — show input row
    const isOpen = inputRow.style.display === 'flex';
    inputRow.style.display = isOpen ? 'none' : 'flex';
    if (!isOpen) document.getElementById('val-' + name).focus();
  }
}

function openSocialLink(name) {
  let url = getSocialVal(name);
  if (!url) return;
  if (!url.startsWith('http://') && !url.startsWith('https://')) url = 'https://' + url;
  window.open(url, '_blank', 'noopener,noreferrer');
}

function editSocialLink(name) {
  document.getElementById('actions-' + name).style.display = 'none';
  const inputRow = document.getElementById('input-' + name);
  inputRow.style.display = 'flex';
  const inp = document.getElementById('val-' + name);
  const saved = getSocialVal(name);
  inp.value = saved ? 'https://' + saved : '';
  inp.focus();
}

function disconnectSocialLink(name) {
  localStorage.removeItem(getSocialKey(name));
  localStorage.removeItem('settings_connected-' + name);
  localStorage.removeItem('settings_connected-' + name + '-handle');
  document.getElementById('actions-' + name).style.display = 'none';
  loadSocialLinks();
  showToast(name.charAt(0).toUpperCase() + name.slice(1) + ' disconnected.');
}

function saveSocialLink(name) {
  const val = document.getElementById('val-' + name).value.trim();
  if (!val) { showToast('Please enter a URL.'); return; }
  if (!val.startsWith('http://') && !val.startsWith('https://')) {
    showToast('URL must start with https://'); return;
  }
  const display = val.replace(/^https?:\/\//, '').replace(/\/$/, '').replace(/^["']|["']$/g, '');
  localStorage.setItem(getSocialKey(name), display);
  localStorage.setItem('settings_connected-' + name, 'true');
  document.getElementById('input-' + name).style.display = 'none';
  document.getElementById('val-' + name).value = '';
  loadSocialLinks();
  showToast(name.charAt(0).toUpperCase() + name.slice(1) + ' connected!');
}

function cancelSocialLink(name) {
  document.getElementById('input-' + name).style.display = 'none';
  document.getElementById('val-' + name).value = '';
}

window.signOut = signOut;
window.toggleAvatarMenu = toggleAvatarMenu;
window.saveProfile = saveProfile;
window.handleSkillKey = handleSkillKey;
window.removeSkill = removeSkill;
window.confirmDeleteAccount = confirmDeleteAccount;
window.closeDeleteModal = closeDeleteModal;
window.handleSocialClick    = handleSocialClick;
window.saveSocialLink       = saveSocialLink;
window.cancelSocialLink     = cancelSocialLink;
window.openSocialLink       = openSocialLink;
window.editSocialLink       = editSocialLink;
window.disconnectSocialLink = disconnectSocialLink;