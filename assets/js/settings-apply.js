(function applyAllSettings() {

  /* ── HELPER ── */
  function S(key, def) {
    try {
      const v = localStorage.getItem('settings_' + key);
      return v === null ? def : JSON.parse(v);
    } catch (e) { return def; }
  }

  /* ── 1. THEME ── */
  const theme = S('theme', 'dark');
  if (theme === 'midnight') {
    document.documentElement.style.setProperty('--bg', '#060B18');
    document.documentElement.style.setProperty('--bg2', '#080E1F');
    document.documentElement.style.setProperty('--card', '#0D1526');
    document.documentElement.style.setProperty('--card2', '#111B30');
    document.body.classList.add('theme-midnight');
  } else {
    // Dark Gold (default) — reset to original vars in case user switched back
    document.documentElement.style.setProperty('--bg', '#0A0A0A');
    document.documentElement.style.setProperty('--bg2', '#0D0D0D');
    document.documentElement.style.setProperty('--card', '#111111');
    document.documentElement.style.setProperty('--card2', '#161616');
    document.body.classList.remove('theme-midnight');
  }

  /* ── 2. COMPACT SIDEBAR ── */
  if (S('compact', false)) {
    document.body.classList.add('compact-sidebar');
  }

  /* ── 3. REDUCE ANIMATIONS ── */
  if (S('no-animations', false)) {
    document.body.classList.add('no-animations');

    // Inject a style tag to disable all transitions & animations
    if (!document.getElementById('no-anim-style')) {
      const style = document.createElement('style');
      style.id = 'no-anim-style';
      style.textContent = `
        *, *::before, *::after {
          transition: none !important;
          animation: none !important;
        }
      `;
      document.head.appendChild(style);
    }
  }

  /* ── 4. OPEN TO WORK badge on sidebar (Privacy setting) ── */
  // If user enabled "Open to Work", show a small badge on their avatar
  const openToWork = S('privacy-open-to-work', true);
  window.__openToWork = openToWork; // pages can read this

  /* ── 5. CAREER SCORE VISIBILITY ── */
  // Dashboard reads this to show/hide the readiness ring
  window.__showCareerScore = S('career-score', true);

  /* ── 6. USER BADGE: Free / Pro ── */
  // Update sidebar badge text if user upgraded
  const plan = S('plan', 'free');
  window.__userPlan = plan;

})();


/* ============================================================
   APPLY COMPACT SIDEBAR CSS (injected so it works on all pages
   without needing dashboard.css to have it pre-defined)
   ============================================================ */
(function injectCompactSidebarStyles() {
  if (document.getElementById('compact-sidebar-style')) return;
  const style = document.createElement('style');
  style.id = 'compact-sidebar-style';
  style.textContent = `
    /* ── MIDNIGHT THEME ── */
    body.theme-midnight {
      --bg:    #060B18;
      --bg2:   #080E1F;
      --card:  #0D1526;
      --card2: #111B30;
    }
    body.theme-midnight .sidebar         { background: #080E1F !important; }
    body.theme-midnight .dash-topbar     { background: rgba(6,11,24,0.93) !important; }
    body.theme-midnight .nav-item:hover  { background: rgba(255,255,255,0.04) !important; }
    body.theme-midnight .d-card          { background: #0D1526 !important; border-color: rgba(255,255,255,0.06) !important; }
    body.theme-midnight .sidebar-user    { border-bottom-color: rgba(255,255,255,0.05) !important; }

    /* ── COMPACT SIDEBAR ── */
    body.compact-sidebar .sidebar {
      width: 64px !important;
      overflow: hidden;
    }
    body.compact-sidebar .sidebar-logo > span,
    body.compact-sidebar .user-name,
    body.compact-sidebar .user-role,
    body.compact-sidebar .user-badge,
    body.compact-sidebar .nav-section-label,
    body.compact-sidebar .nav-badge {
      display: none !important;
    }
    body.compact-sidebar .sidebar-logo {
      justify-content: center !important;
      padding: 0 !important;
    }
    body.compact-sidebar .nav-item {
  justify-content: center !important;
  padding: 10px !important;
  overflow: hidden !important;
  white-space: nowrap !important;
  font-size: 0 !important;
}
body.compact-sidebar .nav-item svg {
  width: 18px !important;
  height: 18px !important;
  margin: 0 !important;
  flex-shrink: 0 !important;
  font-size: 14px !important;
}
body.compact-sidebar .nav-item .nav-badge {
  display: none !important;
}
    body.compact-sidebar .sidebar-user {
      justify-content: center !important;
      padding: 12px 8px !important;
    }
    body.compact-sidebar .sidebar-user > div:not(.user-av) {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
})();


/* ============================================================
   LISTEN FOR SETTINGS CHANGES (cross-tab sync)
   If user changes settings in one tab, other tabs update too.
   ============================================================ */
window.addEventListener('storage', function (e) {
  if (!e.key || !e.key.startsWith('settings_')) return;

  const key = e.key.replace('settings_', '');
  const val = e.newValue ? JSON.parse(e.newValue) : null;

  switch (key) {
    case 'theme':
      if (val === 'midnight') {
        document.body.classList.add('theme-midnight');
        document.documentElement.style.setProperty('--bg', '#060B18');
        document.documentElement.style.setProperty('--bg2', '#080E1F');
        document.documentElement.style.setProperty('--card', '#0D1526');
        document.documentElement.style.setProperty('--card2', '#111B30');
      } else {
        document.body.classList.remove('theme-midnight');
        document.documentElement.style.setProperty('--bg', '#0A0A0A');
        document.documentElement.style.setProperty('--bg2', '#0D0D0D');
        document.documentElement.style.setProperty('--card', '#111111');
        document.documentElement.style.setProperty('--card2', '#161616');
      }
      break;

    case 'compact':
      document.body.classList.toggle('compact-sidebar', val === true);
      break;

    case 'no-animations':
      if (val) {
        document.body.classList.add('no-animations');
        if (!document.getElementById('no-anim-style')) {
          const s = document.createElement('style');
          s.id = 'no-anim-style';
          s.textContent = `*, *::before, *::after { transition: none !important; animation: none !important; }`;
          document.head.appendChild(s);
        }
      } else {
        document.body.classList.remove('no-animations');
        const s = document.getElementById('no-anim-style');
        if (s) s.remove();
      }
      break;
  }
});