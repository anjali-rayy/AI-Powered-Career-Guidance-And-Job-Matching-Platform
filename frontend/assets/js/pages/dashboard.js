/* ── RESTORE UI INSTANTLY FROM CACHE (prevents flash on refresh) ── */
(function restoreFromCache() {
  const ini   = localStorage.getItem('displayIni')   || '';
  const first = localStorage.getItem('displayFirst') || '';
  const full  = localStorage.getItem('displayFull')  || '';
  const role  = localStorage.getItem('userRole')     || 'PathwayAI Member';
  if (ini) {
    document.getElementById('sidebar-av').textContent   = ini;
    document.getElementById('topbar-av').textContent    = ini;
  }
  if (full) document.getElementById('sidebar-name').textContent = full;
  if (role) document.getElementById('sidebar-role').textContent = role;
  if (first) {
    const hour  = new Date().getHours();
    const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
    document.getElementById('dash-greeting').innerHTML = greet + ', <em>' + first + '</em> 👋';
  }
})();

/* ── LOAD FRESH DATA FROM MONGODB ── */
requireAuth().then(function() {

  /* ── PERSONALIZED DASHBOARD ── */
  const userName  = localStorage.getItem('userName')  || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  const parts     = userName.trim().split(' ');
  const initials  = parts.length >= 2 ? (parts[0][0] + parts[1][0]).toUpperCase() : (userName.slice(0,2).toUpperCase() || 'U');
  const firstName = parts[0] || 'User';
  const userRole  = localStorage.getItem('userRole') || 'PathwayAI Member';

  const profileData   = JSON.parse(localStorage.getItem('profileData') || '{}');
  const displayFirst  = profileData.fname || (userName ? userName.split(' ')[0] : (userEmail ? userEmail.split('@')[0] : 'there'));
  const displayFull   = profileData.fname
    ? (profileData.fname + (profileData.lname ? ' ' + profileData.lname : ''))
    : (userName || (userEmail ? userEmail.split('@')[0] : 'User'));
  const displayParts  = displayFull.trim().split(' ');
  const displayIni    = displayParts.length >= 2
    ? (displayParts[0][0] + displayParts[1][0]).toUpperCase()
    : displayFull.slice(0, 2).toUpperCase() || 'U';

  document.getElementById('sidebar-av').textContent   = displayIni;
  document.getElementById('sidebar-name').textContent = displayFull || 'User';
  document.getElementById('sidebar-role').textContent = userRole;
  document.getElementById('topbar-av').textContent    = displayIni;

  // Save display state so it survives refresh
  localStorage.setItem('displayIni',   displayIni);
  localStorage.setItem('displayFirst', displayFirst);
  localStorage.setItem('displayFull',  displayFull);

  const hour  = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').innerHTML  = greet + ', <em>' + displayFirst + '</em> 👋';

  /* ── SAVE & RESTORE STAT CARDS ── */
  (function syncStats() {
    const saved = JSON.parse(localStorage.getItem('dashStats') || '{}');
    const defaults = { readiness: 91, matches: 4, jobs: 12, skills: 2 };
    const stats = Object.assign(defaults, saved);
    const el = (id) => document.getElementById(id);
    if (el('stat-readiness')) el('stat-readiness').textContent = stats.readiness;
    if (el('stat-matches'))   el('stat-matches').textContent   = stats.matches;
    if (el('stat-jobs'))      el('stat-jobs').textContent      = stats.jobs;
    if (el('stat-skills'))    el('stat-skills').textContent    = stats.skills;
    // Save back so next refresh has latest values
    localStorage.setItem('dashStats', JSON.stringify(stats));
  })();

  /* ── PROFILE COMPLETION ── */
  (function updateCompletion() {
    const p = JSON.parse(localStorage.getItem('profileData') || '{}');
    const checks = [
      !!(p.fname || userName),
      !!(p.email || userEmail),
      !!p.location,
      !!p.eduLevel,
      !!(p.skills && p.skills.length >= 3),
      !!p.bio
    ];
    const done = checks.filter(Boolean).length;
    const pct  = Math.round((done / checks.length) * 100);
    const pctEl = document.getElementById('dash-completion-pct');
    const barEl = document.getElementById('dash-completion-bar');
    if (pctEl) pctEl.textContent = pct + '%';
    if (barEl) barEl.style.width = pct + '%';
  })();

  /* ── AVATAR DROPDOWN ── */
  function toggleAvatarMenu() {
    const menu = document.getElementById('avatar-menu');
    menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
    document.getElementById('menu-name').textContent  = localStorage.getItem('userName')  || 'User';
    document.getElementById('menu-email').textContent = localStorage.getItem('userEmail') || '—';
  }
  document.addEventListener('click', function(e) {
    const menu = document.getElementById('avatar-menu');
    const av   = document.getElementById('topbar-av');
    if (menu && !menu.contains(e.target) && !av.contains(e.target)) {
      menu.style.display = 'none';
    }
  });

  // Expose toggleAvatarMenu globally so onclick in HTML works
  window.toggleAvatarMenu = toggleAvatarMenu;

}); // end requireAuth

window.signOut = function signOut() {
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

function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
window.showToast = showToast;