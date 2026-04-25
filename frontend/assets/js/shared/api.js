const API_URL = 'http://localhost:3000/api';

// ── TOKEN HELPERS ──
function getToken()         { return localStorage.getItem('authToken'); }
function setToken(token)    { localStorage.setItem('authToken', token); }
function removeToken()      { localStorage.removeItem('authToken'); }

// ── BASE FETCH ──
async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}

// ── AUTH GUARD: call on every protected page ──
async function requireAuth() {
  const token = getToken();
  if (!token) { window.location.replace('../auth/login.html'); return null; }

  try {
    const data = await apiFetch('/verify');
    if (!data.valid) { signOut(); return null; }
    // Sync user data to localStorage for UI
    syncUserToStorage(data.user);
    return data.user;
  } catch {
    signOut();
    return null;
  }
}

// ── SYNC USER TO LOCALSTORAGE (for UI rendering) ──
function syncUserToStorage(user) {
  const fullName = user.lname ? `${user.fname} ${user.lname}` : user.fname;
  localStorage.setItem('userName',  fullName || '');
  localStorage.setItem('userEmail', user.email || '');
  if (user.eduLevel) {
    const role = user.eduLevel + (user.eduField ? ' · ' + user.eduField.split('/')[0].trim() : '');
    localStorage.setItem('userRole', role);
  }
  localStorage.setItem('profileData', JSON.stringify({
    fname:      user.fname      || '',
    lname:      user.lname      || '',
    email:      user.email      || '',
    phone:      user.phone      || '',
    location:   user.location   || '',
    bio:        user.bio        || '',
    college:    user.college    || '',
    eduLevel:   user.eduLevel   || '',
    eduField:   user.eduField   || '',
    gradYear:   user.gradYear   || '',
    experience: user.experience || '',
    interest:   user.interest   || '',
    skills:     user.skills     || []
  }));
}

// ── REGISTER ──
async function apiRegister(data) {
  const result = await apiFetch('/register', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  setToken(result.token);
  syncUserToStorage(result.user);
  return result;
}

// ── LOGIN ──
async function apiLogin(email, password) {
  const result = await apiFetch('/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  setToken(result.token);
  syncUserToStorage(result.user);
  return result;
}

// ── UPDATE PROFILE ──
async function apiUpdateProfile(profileData) {
  const result = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData)
  });
  syncUserToStorage(result.user);
  return result;
}

// ── CHANGE PASSWORD ──
async function apiChangePassword(currentPassword, newPassword) {
  return await apiFetch('/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

// ── DELETE ACCOUNT ──
async function apiDeleteAccount() {
  await apiFetch('/account', {
    method: 'DELETE',
    body: JSON.stringify({ confirmText: 'DELETE' })
  });
  localStorage.clear();
  removeToken();
  window.location.href = '../public/index.html';
}

// ── SIGN OUT ──
function signOut() {
  // Keep settings preferences, clear auth
  const settingsKeys = [];
  Object.keys(localStorage).forEach(k => {
    if (k.startsWith('settings_')) settingsKeys.push({ k, v: localStorage.getItem(k) });
  });
  localStorage.clear();
  removeToken();
  settingsKeys.forEach(({ k, v }) => localStorage.setItem(k, v));
  window.location.href = '../public/index.html';
}