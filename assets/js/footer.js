const isSubPage = window.location.pathname.includes('/pages/');
const base = isSubPage ? '..' : '.';

document.addEventListener('DOMContentLoaded', function() {
  const footerEl = document.querySelector('footer.footer');
  if (!footerEl) return;
  
  footerEl.innerHTML = `
    <div class="footer-top">
      <div class="footer-brand">
        <a href="${base}/index.html" class="footer-logo">
          <div class="footer-logo-mark">
            <img src="${base}/assets/images/logo.png" alt="PathwayAI Logo">
          </div>
          PathwayAI
        </a>
        <p class="footer-tagline">Your comprehensive platform for AI-powered career guidance and college recommendations — built for every student, everywhere.</p>
        <div class="footer-socials">
          <a href="#" class="footer-social" aria-label="Twitter"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.7 5.4 4.4 8.8 4.5-.4-1.8.3-3.7 1.7-4.8 2.2-1.7 5.2-1.4 7 .7.7-.2 1.4-.5 2-.9z"/></svg></a>
          <a href="#" class="footer-social" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg></a>
          <a href="#" class="footer-social" aria-label="GitHub"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"/></svg></a>
          <a href="#" class="footer-social" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
        </div>
      </div>
      <div class="footer-newsletter">
        <div class="newsletter-label">Stay updated</div>
        <p class="newsletter-sub">Get career tips, new features, and platform updates — straight to your inbox.</p>
        <div class="newsletter-form" id="newsletter-form">
          <input type="email" id="newsletter-email" class="newsletter-input" placeholder="Enter your email" autocomplete="email"/>
          <button class="newsletter-btn" onclick="handleSubscribe()">Subscribe <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg></button>
        </div>
        <p class="newsletter-fine">No spam, ever. Unsubscribe any time.</p>
      </div>
    </div>
    <div class="footer-rule"></div>
    <div class="footer-links-grid">
      <div class="footer-col">
        <div class="footer-col-title">Features</div>
        <ul class="footer-col-list">
          <li><a href="${base}/pages/quiz.html">Career Quiz</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Resume Analysis</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Skill Gap Detection</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Job Matching Score</a></li>
          <li><a href="${base}/pages/career-tree.html">3D Career Tree</a></li>
          <li><a href="${base}/pages/roadmap.html">AI Roadmap</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Company</div>
        <ul class="footer-col-list">
          <li><a href="${base}/pages/about.html">About</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Careers</a></li>
          <li><a href="${base}/pages/blog.html">Blog</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Contact</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Support</div>
        <ul class="footer-col-list">
          <li><a href="${base}/pages/helpFaq.html">Help Center</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Study Materials</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Career Guides</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">API Docs</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Community</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Legal</div>
        <ul class="footer-col-list">
          <li><a href="${base}/pages/privacy-policy.html">Privacy Policy</a></li>
          <li><a href="${base}/pages/terms-of-service.html">Terms of Service</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Cookie Policy</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">GDPR</a></li>
          <li><a href="#" onclick="showToast('Coming soon!')">Accessibility</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-rule"></div>
    <div class="footer-bottom">
      <div class="footer-copy">© 2025 PathwayAI. All rights reserved. Built with <span class="footer-heart">♥</span> for students everywhere.</div>
      <div class="footer-bottom-right">
        <span class="footer-made">Made in India 🇮🇳</span>
        <a href="#top" class="footer-back-top" aria-label="Back to top">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"/></svg>
        </a>
      </div>
    </div>
  `;
});

function handleSubscribe() {
  const input = document.getElementById('newsletter-email');
  if (!input) return;
  const val = input.value.trim();
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(val)) { showToast('Please enter a valid email address.'); return; }
  const form = document.getElementById('newsletter-form');
  form.innerHTML = `
    <div class="newsletter-success">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
      You're subscribed!
    </div>`;
}