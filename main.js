/* ============================================================
   DEXAR SYSTEMS — main.js v20260520
   IIFE — sin ES modules, sin imports
   ============================================================ */
(function () {
  'use strict';

  /* ——— Safety net: si GSAP falla, todo visible en 6s ——— */
  var _safety = setTimeout(function () {
    document.querySelectorAll('[data-reveal]').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.transition = 'none';
    });
    document.querySelectorAll('.ds-inner').forEach(function (el) {
      el.style.opacity = '1';
      el.style.transform = 'none';
    });
  }, 6000);

  function safe(fn, label) {
    try { fn(); } catch (e) { console.warn('[DS] ' + label + ':', e); }
  }

  function ready(fn) {
    if (document.readyState !== 'loading') { fn(); }
    else { document.addEventListener('DOMContentLoaded', fn); }
  }

  /* ——— Splash ——— */
  function initSplash() {
    var splash = document.getElementById('splash');
    if (!splash) return;

    var splashTimeout = setTimeout(hide, 4000);

    function hide() {
      clearTimeout(splashTimeout);
      splash.classList.add('hidden');
      document.body.classList.remove('loading');
      setTimeout(function () { splash.style.display = 'none'; }, 700);
      setTimeout(function () { safe(animateHeroIn, 'hero-anim'); }, 100);
    }

    window.addEventListener('load', function () { setTimeout(hide, 150); });
  }

  /* ——— Split hero title mientras el splash cubre la página ——— */
  function initHeroSplit() {
    var title = document.querySelector('.hero-title');
    if (!title || typeof gsap === 'undefined') return;

    var parts = title.innerHTML.split(/<br\s*\/?>/i);
    title.innerHTML = parts.map(function (p) {
      return '<span class="ds-line"><span class="ds-inner">' + p + '</span></span>';
    }).join('');

    gsap.set('.ds-inner', { y: 44, opacity: 0 });
    gsap.set('.hero-sub, .hero-actions, .hero-trust', { y: 20, opacity: 0 });
  }

  /* ——— Animación de entrada del hero (tras el splash) ——— */
  function animateHeroIn() {
    var hasSplit = document.querySelector('.ds-inner');

    if (typeof gsap === 'undefined') {
      ['.ds-inner', '.hero-sub', '.hero-actions', '.hero-trust'].forEach(function (s) {
        document.querySelectorAll(s).forEach(function (el) {
          el.style.opacity = '1'; el.style.transform = 'none';
        });
      });
      safe(initScrollReveal, 'scroll-reveal');
      return;
    }

    clearTimeout(_safety);

    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });

    if (hasSplit) {
      tl.to('.ds-inner',     { y: 0, opacity: 1, duration: 1,   stagger: 0.13 }, 0);
    }
    tl.to('.hero-sub',       { y: 0, opacity: 1, duration: 0.8 }, 0.55);
    tl.to('.hero-actions',   { y: 0, opacity: 1, duration: 0.7 }, 0.7);
    tl.to('.hero-trust',     { y: 0, opacity: 1, duration: 0.6 }, 0.85);

    tl.add(function () { safe(initScrollReveal, 'scroll-reveal'); }, 0.3);
  }

  /* ——— Scroll reveal para todas las secciones ——— */
  function initScrollReveal() {
    var els = document.querySelectorAll('[data-reveal]');
    if (!els.length) return;

    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      ScrollTrigger.batch('[data-reveal]', {
        onEnter: function (batch) {
          gsap.to(batch, {
            opacity: 1, y: 0,
            duration: 0.8, stagger: 0.1, ease: 'expo.out',
          });
        },
        start: 'top 88%',
        once: true,
      });
    } else {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'none';
          obs.unobserve(entry.target);
        });
      }, { threshold: 0.05 });
      els.forEach(function (el) { obs.observe(el); });
    }

    /* Safety por sección: revelar lo que quede atascado tras 6s */
    setTimeout(function () {
      els.forEach(function (el) {
        if (parseFloat(getComputedStyle(el).opacity) < 0.5) {
          el.style.opacity = '1'; el.style.transform = 'none';
        }
      });
    }, 6000);
  }

  /* ——— Nav móvil ——— */
  function initMobileMenu() {
    var toggle = document.querySelector('.nav-toggle');
    var menu   = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('open');
      toggle.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });

    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        menu.classList.remove('open');
        toggle.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ——— Smooth scroll para anclas ——— */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = this.getAttribute('href');
        if (id === '#') return;
        var target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.scrollY - 80,
          behavior: 'smooth',
        });
      });
    });
  }

  /* ——— Hover 3D suave en tarjetas de servicio ——— */
  function initCardTilt() {
    document.querySelectorAll('.srv-card, .sector-card').forEach(function (card) {
      card.addEventListener('mousemove', function (e) {
        var r  = card.getBoundingClientRect();
        var dx = (e.clientX - r.left  - r.width  / 2) / (r.width  / 2);
        var dy = (e.clientY - r.top   - r.height / 2) / (r.height / 2);
        card.style.transform  = 'translateY(-6px) rotateX(' + (-dy * 2) + 'deg) rotateY(' + (dx * 2) + 'deg)';
        card.style.transition = 'transform 0.1s linear, box-shadow 0.3s, border-color 0.3s';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform  = '';
        card.style.transition = 'transform 0.5s var(--ease-expo), box-shadow 0.3s, border-color 0.3s';
      });
    });
  }

  /* ——— Formulario de reserva (listo para n8n) ——— */
  function initBookingForm() {
    var form    = document.getElementById('booking-form');
    var success = document.getElementById('form-success');
    if (!form || !success) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();

      /* Validación básica */
      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (field) {
        field.style.borderColor = '';
        if (!field.value.trim()) {
          field.style.borderColor = '#EF4444';
          valid = false;
        }
      });
      if (!valid) return;

      /* Recoger datos del formulario */
      var data = {};
      new FormData(form).forEach(function (val, key) { data[key] = val; });

      /*
       * CONEXIÓN n8n:
       * Cuando tengas tu webhook listo, descomenta el bloque fetch de abajo
       * y reemplaza la URL con la de tu webhook de n8n.
       * El atributo data-webhook del formulario también puede contener la URL.
       *
       * var webhookUrl = form.getAttribute('data-webhook') || 'TU_WEBHOOK_N8N';
       * fetch(webhookUrl, {
       *   method: 'POST',
       *   headers: { 'Content-Type': 'application/json' },
       *   body: JSON.stringify(data),
       * })
       * .then(function() { showSuccess(); })
       * .catch(function() { showSuccess(); }); // mostrar éxito igualmente
       * return;
       */

      /* Por ahora muestra el mensaje de éxito directamente */
      showSuccess();

      function showSuccess() {
        form.style.display = 'none';
        success.classList.add('show');
        success.style.display = 'block';
      }
    });

    /* Limpiar estilos de error al escribir */
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        this.style.borderColor = '';
      });
    });
  }

  /* ——— Boot ——— */
  ready(function () {
    safe(initHeroSplit,    'hero-split');   /* primero — mientras el splash cubre */
    safe(initSplash,       'splash');
    safe(initMobileMenu,   'mobile-menu');
    safe(initSmoothScroll, 'smooth-scroll');

    window.addEventListener('load', function () {
      safe(initCardTilt,    'card-tilt');
      safe(initBookingForm, 'booking-form');
    });
  });

})();
