async function handleLogin(e) {
  e.preventDefault();
  clearErrs();
  document.getElementById('api-error').style.display = 'none';
  const email = document.getElementById('email').value.trim();
  const pass  = document.getElementById('password').value;
  let ok = true;
  if (!email) { setErr('email-err','Email is required'); ok=false; }
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('email-err','Enter a valid email'); ok=false; }
  if (!pass) { setErr('pass-err','Password is required'); ok=false; }
  if (!ok) return;
  setLoading(true);
  try {
    await apiLogin(email, pass);
    showToast('✓ Signed in successfully!');
    setTimeout(() => window.location.href = 'dashboard.html', 900);
  } catch(err) {
    const el = document.getElementById('api-error');
    el.textContent = err.message;
    el.style.display = 'block';
    setLoading(false);
  }
}

function setErr(id, msg) {
  const el = document.getElementById(id);
  if (el) { el.textContent = msg; el.style.display = 'block'; }
}

function clearErrs() {
  document.querySelectorAll('.field-err').forEach(e => {
    e.textContent = ''; e.style.display = 'none';
  });
}

function setLoading(on) {
  document.getElementById('btn-text').style.display = on ? 'none' : 'inline';
  document.getElementById('btn-arr').style.display  = on ? 'none' : 'inline';
  document.getElementById('btn-load').style.display = on ? 'flex'  : 'none';
  document.getElementById('submit-btn').disabled    = on;
}