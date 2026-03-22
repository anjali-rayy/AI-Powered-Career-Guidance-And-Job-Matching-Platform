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

  const hour  = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').innerHTML  = greet + ', <em>' + displayFirst + '</em> 👋';

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
  window.location.href = '../index.html';
}