/* ============================================
   Shivaay Logistics — Interactive Behavior
   Vanilla JS, no frameworks, no dependencies
   ============================================ */

(function () {
  'use strict';

  /* ==========================================
     Feature Detection & Preferences
     ========================================== */

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ==========================================
     1. Mobile Menu Toggle
     ========================================== */

  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('open');
    });

    // Close menu when a nav link is clicked
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('open');
      });
    });

    // Remove open class on resize above 768px
    window.addEventListener('resize', function () {
      if (window.innerWidth > 767) {
        navLinks.classList.remove('open');
      }
    });
  }

  /* ==========================================
     2. Active Nav Link Highlighting
     ========================================== */

  const allNavLinks = document.querySelectorAll('.nav-links a');

  if (allNavLinks.length) {
    const currentPath = window.location.pathname;
    const currentFile = currentPath.substring(currentPath.lastIndexOf('/') + 1) || 'index.html';

    allNavLinks.forEach(function (link) {
      const href = link.getAttribute('href') || '';
      const linkFile = href.substring(href.lastIndexOf('/') + 1);

      if (
        linkFile === currentFile ||
        (!linkFile && currentFile === 'index.html') ||
        (href === '/' && currentFile === 'index.html') ||
        (href === './' && currentFile === 'index.html')
      ) {
        link.classList.add('active');
      }
    });
  }

  /* ==========================================
     3. Scroll Reveal Animation
     ========================================== */

  if (!prefersReducedMotion) {
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length) {
      const revealObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              revealObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      revealElements.forEach(function (el) {
        revealObserver.observe(el);
      });
    }
  } else {
    // If reduced motion is preferred, show all reveals immediately
    document.querySelectorAll('.reveal').forEach(function (el) {
      el.classList.add('visible');
    });
  }

  /* ==========================================
     4. Testimonials Carousel
     ========================================== */

  const track = document.querySelector('.testimonials-track');
  const dotsContainer = document.querySelector('.testimonials-dots');

  if (track && dotsContainer) {
    const cards = track.querySelectorAll('.testimonial-card');

    // Generate dot indicators
    if (cards.length) {
      cards.forEach(function (_, index) {
        const dot = document.createElement('button');
        dot.classList.add('testimonials-dot');
        dot.setAttribute('aria-label', 'Go to testimonial ' + (index + 1));
        dot.addEventListener('click', function () {
          const cardWidth = cards[0].offsetWidth;
          const gap = parseFloat(getComputedStyle(track).gap) || 24;
          track.scrollTo({
            left: index * (cardWidth + gap),
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
          });
        });
        dotsContainer.appendChild(dot);
      });
    }

    const dots = dotsContainer.querySelectorAll('.testimonials-dot');

    // Update active dot based on scroll position
    function updateActiveDot() {
      if (!cards.length) return;

      const cardWidth = cards[0].offsetWidth;
      const gap = parseFloat(getComputedStyle(track).gap) || 24;
      const scrollPos = track.scrollLeft;
      const trackWidth = track.clientWidth;

      // Determine which card is most visible
      let activeIndex = 0;

      for (let i = 0; i < cards.length; i++) {
        const cardStart = i * (cardWidth + gap);
        const cardEnd = cardStart + cardWidth;
        // Prefer the card closest to the left edge
        if (scrollPos >= cardStart - cardWidth / 2) {
          activeIndex = i;
        }
        // If we're at the end, pick the last card
        if (scrollPos + trackWidth >= track.scrollWidth - 10) {
          activeIndex = cards.length - 1;
        }
      }

      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === activeIndex);
      });
    }

    track.addEventListener('scroll', updateActiveDot, { passive: true });

    // Auto-scroll every 4 seconds
    if (!prefersReducedMotion && cards.length > 1) {
      let autoScrollInterval;

      function startAutoScroll() {
        autoScrollInterval = setInterval(function () {
          const cardWidth = cards[0].offsetWidth;
          const gap = parseFloat(getComputedStyle(track).gap) || 24;

          // Determine next card index
          let activeIndex = 0;
          const scrollPos = track.scrollLeft;

          for (let i = 0; i < cards.length; i++) {
            if (scrollPos >= i * (cardWidth + gap) - cardWidth / 2) {
              activeIndex = i;
            }
          }

          const nextIndex = (activeIndex + 1) % cards.length;
          track.scrollTo({
            left: nextIndex * (cardWidth + gap),
            behavior: 'smooth',
          });
        }, 4000);
      }

      function stopAutoScroll() {
        clearInterval(autoScrollInterval);
      }

      startAutoScroll();

      // Pause on hover
      track.addEventListener('mouseenter', stopAutoScroll);
      track.addEventListener('mouseleave', startAutoScroll);

      // Pause on focus within (accessibility)
      track.addEventListener('focusin', stopAutoScroll);
      track.addEventListener('focusout', startAutoScroll);
    }

    // Set initial active dot
    updateActiveDot();
  }

  /* ==========================================
     5. Contact Form Handler
     ========================================== */

  const contactForm = document.getElementById('contact-form');

  if (contactForm) {
    // Clear error state on input
    contactForm.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(function (input) {
      input.addEventListener('input', function () {
        if (this.classList.contains('error')) {
          this.classList.remove('error');
          var errId = this.id + '-error';
          var errEl = document.getElementById(errId);
          if (errEl) errEl.classList.remove('visible');
        }
      });
    });

    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const nameEl = contactForm.querySelector('[name="name"]');
      const phoneEl = contactForm.querySelector('[name="phone"]');
      const messageEl = contactForm.querySelector('[name="message"]');
      const nameErrEl = document.getElementById('name-error');
      const phoneErrEl = document.getElementById('phone-error');
      const successEl = contactForm.querySelector('.form-success');
      let hasError = false;

      // Clear previous errors
      [nameEl, phoneEl].forEach(function (el) {
        if (el) el.classList.remove('error');
      });
      if (nameErrEl) nameErrEl.classList.remove('visible');
      if (phoneErrEl) phoneErrEl.classList.remove('visible');

      // Validate name
      if (nameEl && !nameEl.value.trim()) {
        nameEl.classList.add('error');
        if (nameErrEl) nameErrEl.classList.add('visible');
        hasError = true;
      }

      // Validate phone
      if (phoneEl && !phoneEl.value.trim()) {
        phoneEl.classList.add('error');
        if (phoneErrEl) phoneErrEl.classList.add('visible');
        hasError = true;
      }

      if (hasError) return;

      // Build form data for mailto link
      const nameVal = nameEl ? nameEl.value.trim() : '';
      const phoneVal = phoneEl ? phoneEl.value.trim() : '';
      const service = contactForm.querySelector('[name="service"]');
      const serviceVal = service ? service.value : '';
      const messageVal = messageEl ? messageEl.value.trim() : '';

      // Hide any visible errors
      contactForm.querySelectorAll('.form-error').forEach(function (el) {
        el.classList.remove('visible');
      });

      // Build mailto link
      let rawBody = 'Name: ' + nameVal + '\nPhone: ' + phoneVal;
      if (serviceVal) rawBody += '\nService: ' + serviceVal;
      if (messageVal) rawBody += '\nMessage: ' + messageVal;

      const subject = 'Inquiry from ' + name;
      const mailto =
        'mailto:shivaaylogistics2022@gmail.com?subject=' +
        encodeURIComponent(subject) +
        '&body=' +
        encodeURIComponent(rawBody);

      // Wrap form inner content in #form-fields
      const existingFields = contactForm.querySelector('#form-fields');
      if (!existingFields) {
        const fieldsWrapper = document.createElement('div');
        fieldsWrapper.id = 'form-fields';

        Array.from(contactForm.children).forEach(function (child) {
          if (!child.matches('.form-success, .form-error')) {
            fieldsWrapper.appendChild(child);
          }
        });
        contactForm.insertBefore(fieldsWrapper, successEl || null);
      }

      // Hide fields
      const fieldsEl = contactForm.querySelector('#form-fields');
      if (fieldsEl) {
        fieldsEl.style.display = 'none';
      }

      // Show success
      if (successEl) {
        successEl.classList.add('visible');
      }

      // Trigger mailto after 1s delay
      setTimeout(function () {
        const anchor = document.createElement('a');
        anchor.href = mailto;
        anchor.target = '_self';
        anchor.style.display = 'none';
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
      }, 1000);
    });
  }

  /* ==========================================
     6. Gallery Lightbox
     ========================================== */

  let lightboxEl = document.querySelector('.lightbox');
  let lightboxImg, lightboxCloseBtn;

  // Create lightbox if it doesn't exist
  if (!lightboxEl) {
    lightboxEl = document.createElement('div');
    lightboxEl.classList.add('lightbox');
    lightboxEl.setAttribute('role', 'dialog');
    lightboxEl.setAttribute('aria-modal', 'true');
    lightboxEl.setAttribute('aria-label', 'Image lightbox');

    lightboxImg = document.createElement('img');
    lightboxImg.alt = '';
    lightboxEl.appendChild(lightboxImg);

    lightboxCloseBtn = document.createElement('button');
    lightboxCloseBtn.classList.add('lightbox-close');
    lightboxCloseBtn.setAttribute('aria-label', 'Close lightbox');
    lightboxCloseBtn.innerHTML = '&times;';
    lightboxEl.appendChild(lightboxCloseBtn);

    document.body.appendChild(lightboxEl);
  } else {
    lightboxImg = lightboxEl.querySelector('img');
    lightboxCloseBtn = lightboxEl.querySelector('.lightbox-close');
  }

  let lastFocusedEl = null;

  function openLightbox(src) {
    if (!lightboxImg) return;

    lightboxImg.src = src;
    lightboxEl.classList.add('open');
    lastFocusedEl = document.activeElement;

    // Trap focus inside lightbox
    if (lightboxCloseBtn) {
      lightboxCloseBtn.focus();
    }
  }

  function closeLightbox() {
    lightboxEl.classList.remove('open');

    // Restore focus
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
    lastFocusedEl = null;
  }

  // Listen for clicks on gallery items
  document.addEventListener('click', function (e) {
    const galleryItem = e.target.closest('.gallery-item');
    if (galleryItem) {
      e.preventDefault();
      const img = galleryItem.querySelector('img');
      if (img && img.src) {
        openLightbox(img.src);
      }
      return;
    }

    // Close on lightbox background click
    if (e.target === lightboxEl) {
      closeLightbox();
      return;
    }

    // Close on close button click
    if (e.target.closest('.lightbox-close')) {
      closeLightbox();
      return;
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightboxEl.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ==========================================
     7. Count Animation (Hero Stats)
     ========================================== */

  if (!prefersReducedMotion) {
    const statNums = document.querySelectorAll('.hero-stat-num');

    if (statNums.length) {
      const countObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCount(entry.target);
              countObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );

      statNums.forEach(function (el) {
        countObserver.observe(el);
      });
    }
  }

  function animateCount(el) {
    // Use data-target attribute first, fallback to textContent
    const target = parseInt(el.dataset.target || el.textContent || '0', 10);
    if (isNaN(target)) return;

    const suffix = el.textContent.replace(/[\d,]/g, '') || '';
    const duration = 1500; // 1.5 seconds
    const startTime = performance.now();

    function step(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(eased * target);

      el.textContent = current.toLocaleString() + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  /* ==========================================
     8. Smooth Scroll for Anchor Links
     ========================================== */

  document.addEventListener('click', function (e) {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;

    const targetId = anchor.getAttribute('href');
    if (!targetId || targetId === '#') return;

    const targetEl = document.querySelector(targetId);
    if (!targetEl) return;

    e.preventDefault();

    targetEl.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'start',
    });

    // Update URL hash without jumping
    if (history.pushState) {
      history.pushState(null, null, targetId);
    }
  });
})();
