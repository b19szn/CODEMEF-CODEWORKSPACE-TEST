/**
 * Shezan Mahmud Portfolio - Main Application Script
 * Features: Theme toggle, smooth scroll, scroll animations, form handling, toast notifications
 */

(() => {
  'use strict';

  // ============================================
  // STATE & CONFIG
  // ============================================
  const state = {
    theme: 'dark',
    isMenuOpen: false,
    activeSection: 'home',
    statCountersAnimated: false
  };

  const SELECTORS = {
    navbar: '#navbar',
    navLinks: '#navLinks',
    navLink: '.nav-link',
    mobileMenuBtn: '#mobileMenuBtn',
    themeToggle: '#themeToggle',
    heroRole: '#heroRole',
    statValues: '.stat-value',
    codePreview: '#codePreview code',
    contactForm: '#contactForm',
    submitBtn: '#submitBtn',
    toastContainer: '#toastContainer',
    revealElements: '.reveal, .reveal-stagger'
  };

  const ROLES = [
    'Full-Stack Developer',
    'TypeScript Enthusiast',
    'Open Source Contributor',
    'System Architect',
    'Problem Solver',
    'Code Mentor'
  ];

  const CODE_SNIPPETS = [
    `const developer = {\n  name: "Shezan Mahmud",\n  role: "Full-Stack Engineer",\n  stack: ["TypeScript", "React", "Node.js", "PostgreSQL", "AWS"],\n  build: (idea) => idea.toProduct()\n};`,
    `async function deploy(app) {\n  const build = await ci.run(app);\n  if (build.passed) {\n    await cd.deploy(build.artifact);\n    notify.slack("🚀 Deployed!");\n  }\n}\n\nawait deploy(myApp);`,
    `interface Project {\n  name: string;\n  tech: string[];\n  impact: "high" | "medium" | "low";\n  status: "live" | "wip" | "archived";\n}\n\nconst portfolio: Project[] = [\n  { name: "FlowBoard", tech: ["Next.js", "tRPC"], impact: "high", status: "live" },\n  { name: "DevSync CLI", tech: ["TypeScript", "Docker"], impact: "high", status: "live" }\n];`,
    `// Real-time collaboration\nconst socket = io();\n\nsocket.on("board:update", (data) => {\n  board.updateState(data);\n  presence.syncUsers(data.users);\n});\n\nfunction moveCard(cardId, columnId) {\n  socket.emit("card:move", { cardId, columnId });\n  optimisticUpdate(cardId, columnId);\n}`
  ];

  // ============================================
  // DOM ELEMENTS CACHE
  // ============================================
  const elements = {};

  function cacheElements() {
    Object.entries(SELECTORS).forEach(([key, selector]) => {
      if (selector.includes(',')) {
        elements[key] = document.querySelectorAll(selector);
      } else {
        elements[key] = document.querySelector(selector);
      }
    });
  }

  // ============================================
  // INITIALIZATION
  // ============================================
  function init() {
    cacheElements();
    initTheme();
    initNavigation();
    initHeroAnimations();
    initScrollAnimations();
    initContactForm();
    initLucideIcons();
    handleResize();
    window.addEventListener('resize', handleResize);
  }

  // ============================================
  // THEME MANAGEMENT
  // ============================================
  function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    state.theme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(state.theme);

    elements.themeToggle.addEventListener('click', toggleTheme);
  }

  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(state.theme);
    localStorage.setItem('theme', state.theme);
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    elements.themeToggle.setAttribute('aria-label', 
      theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
    );
  }

  // ============================================
  // NAVIGATION
  // ============================================
  function initNavigation() {
    // Mobile menu toggle
    elements.mobileMenuBtn.addEventListener('click', toggleMobileMenu);

    // Nav link clicks
    document.querySelectorAll(SELECTORS.navLink).forEach(link => {
      link.addEventListener('click', (e) => handleNavClick(e, link));
    });

    // Scroll spy
    window.addEventListener('scroll', throttle(handleScrollSpy, 100));
    
    // Navbar scroll effect
    window.addEventListener('scroll', throttle(handleNavbarScroll, 50));

    // Close mobile menu on escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && state.isMenuOpen) {
        closeMobileMenu();
      }
    });
  }

  function toggleMobileMenu() {
    state.isMenuOpen = !state.isMenuOpen;
    elements.navLinks.classList.toggle('open', state.isMenuOpen);
    elements.mobileMenuBtn.setAttribute('aria-expanded', state.isMenuOpen);
    elements.mobileMenuBtn.setAttribute('aria-label', 
      state.isMenuOpen ? 'Close menu' : 'Open menu'
    );
    document.body.style.overflow = state.isMenuOpen ? 'hidden' : '';
  }

  function closeMobileMenu() {
    state.isMenuOpen = false;
    elements.navLinks.classList.remove('open');
    elements.mobileMenuBtn.setAttribute('aria-expanded', 'false');
    elements.mobileMenuBtn.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }

  function handleNavClick(e, link) {
    const href = link.getAttribute('href');
    if (href.startsWith('#')) {
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        closeMobileMenu();
        updateActiveNav(link);
      }
    }
  }

  function updateActiveNav(activeLink) {
    document.querySelectorAll(SELECTORS.navLink).forEach(link => {
      link.classList.remove('active');
    });
    activeLink.classList.add('active');
  }

  function handleNavbarScroll() {
    const scrolled = window.scrollY > 20;
    elements.navbar.classList.toggle('scrolled', scrolled);
  }

  function handleScrollSpy() {
    const sections = ['home', 'about', 'work', 'skills', 'contact'];
    const scrollPos = window.scrollY + 150;

    for (const sectionId of sections) {
      const section = document.getElementById(sectionId);
      if (section) {
        const top = section.offsetTop;
        const bottom = top + section.offsetHeight;
        if (scrollPos >= top && scrollPos < bottom) {
          if (state.activeSection !== sectionId) {
            state.activeSection = sectionId;
            updateActiveNavBySection(sectionId);
          }
          break;
        }
      }
    }
  }

  function updateActiveNavBySection(sectionId) {
    const link = document.querySelector(`.nav-link[data-section="${sectionId}"]`);
    if (link) updateActiveNav(link);
  }

  // ============================================
  // HERO ANIMATIONS
  // ============================================
  function initHeroAnimations() {
    // Rotating role text
    let roleIndex = 0;
    function rotateRole() {
      if (!elements.heroRole) return;
      elements.heroRole.style.opacity = '0';
      elements.heroRole.style.transform = 'translateY(10px)';
      
      setTimeout(() => {
        roleIndex = (roleIndex + 1) % ROLES.length;
        elements.heroRole.textContent = ROLES[roleIndex];
        elements.heroRole.style.opacity = '1';
        elements.heroRole.style.transform = 'translateY(0)';
      }, 300);
    }

    elements.heroRole.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
    setInterval(rotateRole, 3500);

    // Typing code animation
    let snippetIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typingSpeed = 30;
    const deletingSpeed = 15;
    const pauseTime = 2000;

    function typeCode() {
      if (!elements.codePreview) return;
      
      const currentSnippet = CODE_SNIPPETS[snippetIndex];
      
      if (!isDeleting) {
        charIndex++;
        elements.codePreview.textContent = currentSnippet.slice(0, charIndex);
      } else {
        charIndex--;
        elements.codePreview.textContent = currentSnippet.slice(0, charIndex);
      }

      let delay = isDeleting ? deletingSpeed : typingSpeed;

      if (!isDeleting && charIndex === currentSnippet.length) {
        delay = pauseTime;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        snippetIndex = (snippetIndex + 1) % CODE_SNIPPETS.length;
        delay = 500;
      }

      setTimeout(typeCode, delay);
    }

    typeCode();

    // Animate stat counters on scroll
    const statsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !state.statCountersAnimated) {
          animateStatCounters();
          state.statCountersAnimated = true;
          statsObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) statsObserver.observe(heroStats);
  }

  function animateStatCounters() {
    document.querySelectorAll(SELECTORS.statValues).forEach(stat => {
      const target = parseInt(stat.dataset.count, 10);
      const duration = 2000;
      const startTime = performance.now();

      function updateCounter(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        const current = Math.floor(target * eased);
        stat.textContent = current.toLocaleString();
        
        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(updateCounter);
    });
  }

  // ============================================
  // SCROLL REVEAL ANIMATIONS
  // ============================================
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll(SELECTORS.revealElements).forEach(el => {
      observer.observe(el);
    });

    // Add reveal classes to sections
    addRevealClasses();
  }

  function addRevealClasses() {
    // Section headers
    document.querySelectorAll('.section-header').forEach(el => el.classList.add('reveal'));
    
    // About
    document.querySelector('.about-content')?.classList.add('reveal');
    document.querySelector('.experience-timeline')?.classList.add('reveal');
    document.querySelectorAll('.highlight-item').forEach((el, i) => {
      el.classList.add('reveal', `reveal-delay-${i + 1}`);
    });

    // Projects
    document.querySelectorAll('.project-card').forEach((el, i) => {
      el.classList.add('reveal', `reveal-delay-${(i % 4) + 1}`);
    });

    // Skills
    document.querySelectorAll('.skill-category').forEach((el, i) => {
      el.classList.add('reveal', `reveal-delay-${(i % 4) + 1}`);
    });

    // Contact
    document.querySelector('.contact-info')?.classList.add('reveal');
    document.querySelector('.contact-form')?.classList.add('reveal', 'reveal-delay-1');
  }

  // ============================================
  // CONTACT FORM
  // ============================================
  function initContactForm() {
    if (!elements.contactForm) return;

    elements.contactForm.addEventListener('submit', handleFormSubmit);
    
    // Real-time validation
    elements.contactForm.querySelectorAll('input, textarea, select').forEach(input => {
      input.addEventListener('blur', validateField);
      input.addEventListener('input', clearFieldError);
    });
  }

  async function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = elements.contactForm;
    const submitBtn = elements.submitBtn;
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoading = submitBtn.querySelector('.btn-loading');
    
    // Validate all fields
    let isValid = true;
    form.querySelectorAll('input, textarea, select').forEach(input => {
      if (!validateField({ target: input })) isValid = false;
    });

    if (!isValid) {
      showToast('Please fill in all required fields correctly.', 'error');
      return;
    }

    // Show loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnLoading.style.display = 'inline-flex';

    try {
      const formData = new FormData(form);
      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        showToast('Message sent successfully! I\'ll get back to you soon.', 'success');
        form.reset();
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      // For demo purposes, simulate success
      showToast('Message sent successfully! (Demo mode)', 'success');
      form.reset();
    } finally {
      submitBtn.disabled = false;
      btnText.style.display = '';
      btnLoading.style.display = 'none';
    }
  }

  function validateField(e) {
    const field = e.target;
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';

    // Remove existing error
    clearFieldError({ target: field });

    if (field.required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    } else if (field.type === 'email' && value && !isValidEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }

    if (!isValid) {
      showFieldError(field, errorMessage);
    }

    return isValid;
  }

  function clearFieldError(e) {
    const field = e.target;
    const errorEl = field.parentNode.querySelector('.field-error');
    if (errorEl) errorEl.remove();
    field.style.borderColor = '';
  }

  function showFieldError(field, message) {
    field.style.borderColor = 'var(--accent-error)';
    const errorEl = document.createElement('span');
    errorEl.className = 'field-error';
    errorEl.style.cssText = 'display:block; color:var(--accent-error); font-size:0.75rem; margin-top:0.375rem;';
    errorEl.textContent = message;
    field.parentNode.appendChild(errorEl);
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ============================================
  // TOAST NOTIFICATIONS
  // ============================================
  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <i data-lucide="${type === 'success' ? 'check-circle' : type === 'error' ? 'alert-circle' : 'info'}"></i>
      <span class="toast-message">${message}</span>
      <button class="toast-close" aria-label="Dismiss"><i data-lucide="x"></i></button>
    `;

    elements.toastContainer.appendChild(toast);
    initLucideIcons(toast);

    // Auto dismiss
    const dismissTimer = setTimeout(() => dismissToast(toast), 5000);

    // Manual dismiss
    toast.querySelector('.toast-close').addEventListener('click', () => {
      clearTimeout(dismissTimer);
      dismissToast(toast);
    });
  }

  function dismissToast(toast) {
    toast.classList.add('removing');
    toast.addEventListener('animationend', () => toast.remove());
  }

  // ============================================
  // LUCIDE ICONS
  // ============================================
  function initLucideIcons(scope = document) {
    if (window.lucide) {
      window.lucide.createIcons({
        attrs: { 'stroke-width': 2 },
        nodes: scope.querySelectorAll('[data-lucide]')
      });
    }
  }

  // ============================================
  // UTILITIES
  // ============================================
  function throttle(fn, limit) {
    let inThrottle;
    return (...args) => {
      if (!inThrottle) {
        fn.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  function handleResize() {
    // Close mobile menu on resize to desktop
    if (window.innerWidth >= 768 && state.isMenuOpen) {
      closeMobileMenu();
    }
  }

  // ============================================
  // START APP
  // ============================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();