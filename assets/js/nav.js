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

// Features dropdown — hover shows menu, click navigates to features page
(function () {
  document.querySelectorAll('.nav-dropdown').forEach(function (dropdown) {
    const trigger = dropdown.querySelector('.nav-drop-trigger');
    const menu = dropdown.querySelector('.nav-drop-menu');
    if (!trigger || !menu) return;

    let hideTimer = null;

    // Show dropdown on hover
    dropdown.addEventListener('mouseenter', function () {
      clearTimeout(hideTimer);
      menu.classList.add('open');
    });

    // Hide dropdown when mouse leaves (small delay so user can reach menu items)
    dropdown.addEventListener('mouseleave', function () {
      hideTimer = setTimeout(function () {
        menu.classList.remove('open');
      }, 120);
    });

    // Click trigger = navigate to features page
    trigger.addEventListener('click', function (e) {
      e.preventDefault();
      const href = trigger.getAttribute('href');
      if (href && href !== '#') window.location.href = href;
    });

    // Close dropdown when any menu item is clicked
    menu.querySelectorAll('a').forEach(function (item) {
      item.addEventListener('click', function () {
        menu.classList.remove('open');
      });
    });
  });

  // Close dropdown if user clicks anywhere outside
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.nav-dropdown')) {
      document.querySelectorAll('.nav-drop-menu').forEach(function (m) {
        m.classList.remove('open');
      });
    }
  });
})(); 


// Auth-aware nav buttons
(function () {
  const isLoggedIn = !!localStorage.getItem('authToken');
  const containers = document.querySelectorAll('.nav-actions');

  containers.forEach(function (container) {
    if (isLoggedIn) {
      container.innerHTML = `
        <a href="login.html"><button class="btn-gold">Sign in</button></a>
        <button class="btn-gold" onclick="signOut()">Sign out</button>
      `;
    } else {
      // Keep only Sign in button — remove any hardcoded Dashboard link
      const hasDashboard = container.querySelector('a[href="dashboard.html"]');
      if (hasDashboard) {
        container.innerHTML = `<a href="login.html"><button class="btn-gold">Sign in</button></a>`;
      }
    }
  });
})();

function signOut() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  window.location.href = '../pages/login.html';
}