/**
 * script.js — Terminal Luxe Portfolio
 * Features: sticky nav, hamburger menu, scroll animations,
 *           skill bar animation, contact form, active nav links
 */

'use strict';

/* ================================================================
   1. UTILITIES
   ================================================================ */

/**
 * Throttle a function to a max execution frequency.
 * Used on scroll/resize listeners to keep things performant.
 */
function throttle(fn, wait = 100) {
  let timer = null;
  return function (...args) {
    if (timer) return;
    timer = setTimeout(() => { fn.apply(this, args); timer = null; }, wait);
  };
}

/**
 * Debounce a function — only fires after calls have paused.
 */
function debounce(fn, wait = 150) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}


/* ================================================================
   2. STICKY NAVBAR — add .scrolled class on scroll
   ================================================================ */
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', throttle(onScroll, 80), { passive: true });
  onScroll(); // run on load in case page is already scrolled
})();


/* ================================================================
   3. HAMBURGER MENU
   ================================================================ */
(function initHamburger() {
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (!hamburger || !navLinks) return;

  let isOpen = false;

  function toggle() {
    isOpen = !isOpen;
    hamburger.classList.toggle('open', isOpen);
    navLinks.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
    // Prevent body scroll when menu is open
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', toggle);

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', close);
  });

  // Close on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });

  // Close when clicking outside the menu area
  document.addEventListener('click', e => {
    if (isOpen && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
      close();
    }
  });
})();


/* ================================================================
   4. SMOOTH SCROLL + ACTIVE NAV LINK HIGHLIGHTING
   ================================================================ */
(function initActiveNav() {
  const sections  = document.querySelectorAll('main section[id]');
  const navLinks  = document.querySelectorAll('.nav-link');

  if (!sections.length || !navLinks.length) return;

  // Map section IDs to corresponding nav links
  const linkMap = {};
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('#')) {
      linkMap[href.slice(1)] = link;
    }
  });

  let currentSection = '';

  function onScroll() {
    const scrollMid = window.scrollY + window.innerHeight * 0.45;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const bottom = top + section.offsetHeight;
      if (scrollMid >= top && scrollMid < bottom) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => link.classList.remove('active'));
    if (linkMap[currentSection]) {
      linkMap[currentSection].classList.add('active');
    }
  }

  window.addEventListener('scroll', throttle(onScroll, 100), { passive: true });
  onScroll();
})();


/* ================================================================
   5. INTERSECTION OBSERVER — reveal animations
   ================================================================ */
(function initRevealAnimations() {
  // Skip if user prefers reduced motion
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const revealEls = document.querySelectorAll(
    '.reveal-up, .reveal-left, .reveal-right'
  );

  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          // Unobserve after animating in — no need to watch forever
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,          // trigger when 12% visible
      rootMargin: '0px 0px -40px 0px'  // slight bottom offset
    }
  );

  revealEls.forEach(el => observer.observe(el));
})();


/* ================================================================
   6. SKILL BAR ANIMATION
   ================================================================ */
(function initSkillBars() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    // Just set widths immediately for reduced motion
    document.querySelectorAll('.skill-bar-fill').forEach(bar => {
      bar.style.width = (bar.dataset.width || 0) + '%';
    });
    return;
  }

  const bars = document.querySelectorAll('.skill-bar-fill');
  if (!bars.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar   = entry.target;
          const width = parseInt(bar.dataset.width, 10) || 0;
          // Small timeout to let the reveal animation run first
          setTimeout(() => { bar.style.width = width + '%'; }, 200);
          observer.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  bars.forEach(bar => observer.observe(bar));
})();


/* ================================================================
   7. CONTACT FORM — simple client-side handling
   ================================================================
   NOTE: This form currently simulates a submission.
   To make it actually send email, integrate with:
     - Formspree: https://formspree.io
     - Netlify Forms: add data-netlify="true" to <form>
     - EmailJS: https://emailjs.com
   ================================================================ */
(function initContactForm() {
  const form        = document.getElementById('contact-form');
  const successMsg  = document.getElementById('form-success');
  if (!form) return;

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function setFieldError(input, message) {
    input.style.borderColor = 'var(--error)';
    input.setAttribute('aria-invalid', 'true');
    // Simple inline error — we keep it clean
    let errEl = input.nextElementSibling;
    if (!errEl || !errEl.classList.contains('field-error')) {
      errEl = document.createElement('span');
      errEl.className = 'field-error mono';
      errEl.style.cssText = 'font-size:0.7rem;color:var(--error);margin-top:0.25rem;display:block';
      input.insertAdjacentElement('afterend', errEl);
    }
    errEl.textContent = message;
  }

  function clearFieldError(input) {
    input.style.borderColor = '';
    input.removeAttribute('aria-invalid');
    const errEl = input.nextElementSibling;
    if (errEl && errEl.classList.contains('field-error')) {
      errEl.remove();
    }
  }

  form.querySelectorAll('.form-input').forEach(input => {
    input.addEventListener('input', () => clearFieldError(input));
  });

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    const nameInput    = form.elements['name'];
    const emailInput   = form.elements['email'];
    const messageInput = form.elements['message'];
    const submitBtn    = form.querySelector('[type="submit"]');

    // — Basic validation —
    let isValid = true;

    if (!nameInput.value.trim()) {
      setFieldError(nameInput, 'Please enter your name.');
      isValid = false;
    }
    if (!emailInput.value.trim() || !validateEmail(emailInput.value)) {
      setFieldError(emailInput, 'Please enter a valid email address.');
      isValid = false;
    }
    if (!messageInput.value.trim() || messageInput.value.trim().length < 10) {
      setFieldError(messageInput, 'Please enter a message (at least 10 characters).');
      isValid = false;
    }

    if (!isValid) return;

    // — Simulate async submission —
    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    try {
      /*
       * === REPLACE THIS BLOCK WITH YOUR FORM SUBMISSION LOGIC ===
       *
       * Example with Formspree:
       *   const response = await fetch('https://formspree.io/f/YOUR_FORM_ID', {
       *     method: 'POST',
       *     headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
       *     body: JSON.stringify({
       *       name: nameInput.value,
       *       email: emailInput.value,
       *       message: messageInput.value
       *     })
       *   });
       *   if (!response.ok) throw new Error('Submission failed');
       *
       * ============================================================
       */
      await new Promise(resolve => setTimeout(resolve, 1200)); // simulated delay

      // — Success state —
      form.reset();
      if (successMsg) {
        successMsg.classList.add('visible');
        setTimeout(() => successMsg.classList.remove('visible'), 6000);
      }

    } catch (err) {
      console.error('Form submission error:', err);
      // Show a generic error
      const errP = document.createElement('p');
      errP.style.cssText = 'color:var(--error);font-size:0.8rem;font-family:var(--font-mono);text-align:center';
      errP.textContent = '✗ Something went wrong — please email me directly.';
      form.appendChild(errP);
      setTimeout(() => errP.remove(), 5000);
    } finally {
      submitBtn.classList.remove('is-loading');
      submitBtn.disabled = false;
    }
  });
})();


/* ================================================================
   8. FOOTER YEAR — auto-updates the copyright year
   ================================================================ */
(function initFooterYear() {
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();


/* ================================================================
   9. PROJECT CARDS — keyboard accessibility enhancement
   ================================================================ */
(function initProjectCards() {
  // Make the whole card tabbable and trigger the GitHub link on Enter
  document.querySelectorAll('.project-card').forEach(card => {
    const primaryLink = card.querySelector('.icon-link');
    if (!primaryLink) return;

    card.setAttribute('tabindex', '-1'); // links inside are already focusable
  });
})();


/* ================================================================
   10. CURSOR GLOW EFFECT (subtle amber follow on desktop)
   ================================================================ */
(function initCursorGlow() {
  // Only on pointer devices, skip touch / reduced motion
  if (window.matchMedia('(pointer: coarse)').matches) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(212,175,55,0.04) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.12s ease-out, top 0.12s ease-out;
    will-change: left, top;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', throttle(e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  }, 16));
})();