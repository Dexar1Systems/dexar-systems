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

  /* ——— Barra de progreso de scroll ——— */
  function initScrollProgress() {
    var bar  = document.createElement('div');
    var fill = document.createElement('div');
    bar.id   = 'scroll-progress';
    fill.id  = 'scroll-fill';
    bar.appendChild(fill);
    document.body.insertBefore(bar, document.body.firstChild);

    function update() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      fill.style.width = Math.min(pct, 100).toFixed(1) + '%';
    }
    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ——— Nav con clase .scrolled al bajar ——— */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    function check() { nav.classList.toggle('scrolled', window.scrollY > 30); }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ——— Orbs de aurora en el hero (via JS para no tocar el HTML) ——— */
  function initHeroOrbs() {
    var hero = document.getElementById('hero');
    if (!hero) return;
    [1, 2, 3].forEach(function (i) {
      var orb = document.createElement('div');
      orb.className = 'hero-orb hero-orb-' + i;
      hero.insertBefore(orb, hero.firstChild);
    });
  }

  /* ——— Cursor glow suave (solo desktop) ——— */
  function initCursorGlow() {
    if (window.matchMedia('(hover: none)').matches) return;
    var glow = document.createElement('div');
    glow.className = 'cursor-glow';
    document.body.appendChild(glow);

    var mx = window.innerWidth / 2, my = window.innerHeight / 2;
    var cx = mx, cy = my;

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
    });

    (function loop() {
      cx += (mx - cx) * 0.07;
      cy += (my - cy) * 0.07;
      glow.style.left = cx.toFixed(1) + 'px';
      glow.style.top  = cy.toFixed(1) + 'px';
      requestAnimationFrame(loop);
    })();
  }

  /* ——— Canvas circuit network en hero ——— */
  function initHeroCanvas() {
    var canvas = document.getElementById('hero-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var hero  = document.getElementById('hero');
    var nodes = [];
    var NODE_COUNT = 52;
    var CONNECT_DIST = 160;
    var raf;

    function resize() {
      canvas.width  = hero.offsetWidth;
      canvas.height = hero.offsetHeight;
    }

    function randBetween(a, b) { return a + Math.random() * (b - a); }

    function createNodes() {
      nodes = [];
      for (var i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: randBetween(-0.28, 0.28),
          vy: randBetween(-0.22, 0.22),
          r:  Math.random() < 0.18 ? 3 : 1.5,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      /* Update positions */
      nodes.forEach(function(n) {
        n.x += n.vx; n.y += n.vy;
        n.pulse += 0.025;
        if (n.x < -20)              n.x = canvas.width  + 20;
        if (n.x > canvas.width + 20) n.x = -20;
        if (n.y < -20)              n.y = canvas.height + 20;
        if (n.y > canvas.height + 20) n.y = -20;
      });

      /* Draw connections */
      for (var i = 0; i < nodes.length; i++) {
        for (var j = i + 1; j < nodes.length; j++) {
          var dx = nodes[i].x - nodes[j].x;
          var dy = nodes[i].y - nodes[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECT_DIST) {
            var alpha = (1 - dist / CONNECT_DIST) * 0.28;
            /* Gradient line: blue → cyan */
            var grad = ctx.createLinearGradient(nodes[i].x, nodes[i].y, nodes[j].x, nodes[j].y);
            grad.addColorStop(0,   'rgba(10,111,255,' + alpha + ')');
            grad.addColorStop(0.5, 'rgba(0,212,255,'  + (alpha * 0.7) + ')');
            grad.addColorStop(1,   'rgba(124,58,237,' + alpha + ')');
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;
            ctx.stroke();
          }
        }
      }

      /* Draw nodes */
      nodes.forEach(function(n) {
        var pulse = 0.6 + 0.4 * Math.sin(n.pulse);
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        if (n.r > 2) {
          /* Larger nodes: glowing blue dot */
          ctx.fillStyle = 'rgba(10,111,255,' + (0.75 * pulse) + ')';
          ctx.fill();
          /* Outer glow ring */
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(0,212,255,' + (0.12 * pulse) + ')';
          ctx.fill();
        } else {
          ctx.fillStyle = 'rgba(100,170,255,' + (0.45 * pulse) + ')';
          ctx.fill();
        }
      });

      raf = requestAnimationFrame(draw);
    }

    resize();
    createNodes();
    draw();

    window.addEventListener('resize', function() {
      cancelAnimationFrame(raf);
      resize();
      createNodes();
      draw();
    });

    /* Add fade-to-bg div */
    var fade = document.createElement('div');
    fade.className = 'hero-fade-bottom';
    hero.appendChild(fade);
  }

  /* ——— Nav dark-aware (hero-top class) ——— */
  function initNavDarkAware() {
    var nav  = document.getElementById('nav');
    var hero = document.getElementById('hero');
    if (!nav || !hero) return;

    function check() {
      var heroBottom = hero.getBoundingClientRect().bottom;
      var atHero = heroBottom > 10;
      nav.classList.toggle('hero-top', atHero);
    }

    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  /* ——— Animated stat counters ——— */
  function initCounters() {
    var els = document.querySelectorAll('[data-count]');
    if (!els.length) return;

    function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

    els.forEach(function(el) {
      var started = false;
      var target  = parseInt(el.getAttribute('data-count'), 10);

      var obs = new IntersectionObserver(function(entries) {
        if (!entries[0].isIntersecting || started) return;
        started = true;
        obs.disconnect();

        var duration  = 1800;
        var startTime = null;

        function tick(now) {
          if (!startTime) startTime = now;
          var progress = Math.min((now - startTime) / duration, 1);
          el.textContent = Math.round(easeOutCubic(progress) * target);
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        }
        requestAnimationFrame(tick);
      }, { threshold: 0.4 });

      obs.observe(el);
    });
  }

  /* ——— Magnetic buttons ——— */
  function initMagneticBtns() {
    if (window.matchMedia('(hover: none)').matches) return;

    document.querySelectorAll('.btn-primary, .btn-nav, .btn-white').forEach(function(btn) {
      btn.addEventListener('mousemove', function(e) {
        var r  = btn.getBoundingClientRect();
        var dx = (e.clientX - r.left  - r.width  / 2) * 0.28;
        var dy = (e.clientY - r.top   - r.height / 2) * 0.28;
        btn.style.transform = 'translate(' + dx + 'px, ' + dy + 'px) scale(1.03)';
        btn.style.transition = 'transform 0.12s linear, box-shadow 0.2s ease';
      });

      btn.addEventListener('mouseleave', function() {
        btn.style.transform  = '';
        btn.style.transition = 'transform 0.5s var(--ease-spring), box-shadow 0.25s ease, background 0.2s';
      });
    });
  }

  /* ——— Demo de chat animado (automatizaciones.html) ——— */
  function initChatDemo() {
    var body = document.getElementById('chat-demo-messages');
    if (!body) return;

    var conversation = [
      { from: 'bot',  text: '¡Hola! 👋 Soy el asistente virtual de Clínica Dental Smile.\n¿En qué puedo ayudarte hoy?' },
      { from: 'user', text: 'Hola buenas, me gustaría pedir una cita 😊' },
      { from: 'bot',  text: 'Claro, con mucho gusto.\n¿Para qué tipo de visita la necesitas?' },
      { from: 'user', text: 'Para una revisión y limpieza dental' },
      { from: 'bot',  text: 'Perfecto 🦷 ¿Cuál es tu nombre completo?' },
      { from: 'user', text: 'Carlos García' },
      { from: 'bot',  text: 'Hola Carlos 😊 Tengo estas opciones disponibles:\n\n📅 Martes 3 de junio\n· 10:00h ✓\n· 12:00h ✓\n· 17:00h ✓\n\n¿Cuál te viene mejor?' },
      { from: 'user', text: 'Las 10 de la mañana, perfecto' },
      { from: 'bot',  text: '✅ ¡Cita confirmada!\n\n📅 Martes 3 de junio · 10:00h\n📍 Clínica Dental Smile\n👤 Carlos García\n\nTe enviaré un recordatorio 24h antes.\n¡Hasta pronto! 😊' },
    ];

    function getTime() {
      var d = new Date();
      return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
    }

    function scrollBottom() {
      body.scrollTop = body.scrollHeight;
    }

    function showTyping() {
      var el = document.createElement('div');
      el.className = 'chat-typing';
      el.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';
      body.appendChild(el);
      scrollBottom();
      return el;
    }

    function addBubble(msg) {
      var el = document.createElement('div');
      el.className = 'chat-msg-bubble ' + msg.from;
      var textHtml = msg.text.replace(/\n/g, '<br>');
      var ticks = msg.from === 'user'
        ? '<span class="chat-msg-ticks">✓✓</span>' : '';
      el.innerHTML = textHtml +
        '<div class="chat-msg-meta">' +
          '<span class="chat-msg-time">' + getTime() + '</span>' +
          ticks +
        '</div>';
      body.appendChild(el);
      scrollBottom();
    }

    function addDateChip() {
      var el = document.createElement('div');
      el.className = 'chat-date-chip';
      el.textContent = 'Hoy';
      body.appendChild(el);
    }

    function playFrom(index) {
      if (index >= conversation.length) {
        /* Fin — espera 3s y reinicia con fade */
        setTimeout(function () {
          body.classList.add('fading');
          setTimeout(function () {
            body.innerHTML = '';
            body.classList.remove('fading');
            body.style.opacity = '1';
            addDateChip();
            playFrom(0);
          }, 550);
        }, 3200);
        return;
      }

      var msg = conversation[index];

      if (msg.from === 'bot') {
        /* Muestra el indicador de escritura */
        var typing = showTyping();
        /* Tiempo proporcional al largo del mensaje */
        var thinkMs = 900 + Math.min(msg.text.length * 16, 1600);
        setTimeout(function () {
          typing.remove();
          addBubble(msg);
          /* Pausa para "leer" antes del siguiente mensaje */
          setTimeout(function () { playFrom(index + 1); }, 850);
        }, thinkMs);
      } else {
        addBubble(msg);
        setTimeout(function () { playFrom(index + 1); }, 950);
      }
    }

    /* Arranque con pequeño retardo inicial */
    setTimeout(function () {
      addDateChip();
      playFrom(0);
    }, 700);
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

  /* ——— Process Showcase (interactive stepper) ——— */
  function initProcessShowcase() {
    var tabs   = document.querySelectorAll('.ps-tab');
    var panels = document.querySelectorAll('.ps-panel');
    if (!tabs.length || !panels.length) return;

    var current  = 0;
    var timer    = null;
    var DURATION = 4800; // ms per step
    var isRunning = false;

    function goTo(index, fromUser) {
      if (index === current && isRunning && !fromUser) return;

      // Exit animation on old panel
      var oldPanel = panels[current];
      if (oldPanel && oldPanel.classList.contains('active')) {
        oldPanel.classList.add('ps-exit');
        oldPanel.classList.remove('active');
        setTimeout(function () { oldPanel.classList.remove('ps-exit'); }, 550);
      }

      // Deactivate all tabs
      tabs.forEach(function (t) {
        t.classList.remove('active');
        var fill = t.querySelector('.ps-progress-fill');
        if (fill) {
          fill.style.transition = 'none';
          fill.style.width = '0%';
        }
      });

      // Deactivate all panels
      panels.forEach(function (p) { p.classList.remove('active'); });

      current = index;

      // Activate new tab
      tabs[current].classList.add('active');

      // Start progress bar with animation
      var fill = tabs[current].querySelector('.ps-progress-fill');
      if (fill) {
        // Force reflow so transition starts fresh
        fill.getBoundingClientRect();
        fill.style.transition = 'width ' + DURATION + 'ms linear';
        fill.style.width = '100%';
      }

      // Activate new panel (slight delay so exit animation plays first)
      setTimeout(function () {
        panels[current].classList.add('active');
      }, fromUser ? 0 : 60);

      // Schedule next step
      clearTimeout(timer);
      isRunning = true;
      timer = setTimeout(function () {
        goTo((current + 1) % tabs.length, false);
      }, DURATION);
    }

    // Click handlers
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { goTo(i, true); });
    });

    // Start when section enters viewport
    var section = document.getElementById('proceso');
    if (!section) { goTo(0, false); return; }

    var started = false;
    var obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting && !started) {
        started = true;
        goTo(0, false);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(section);
  }

  /* ——— Boot ——— */
  ready(function () {
    safe(initScrollProgress,    'scroll-progress');
    safe(initNavScroll,         'nav-scroll');
    safe(initNavDarkAware,      'nav-dark');
    safe(initHeroOrbs,          'hero-orbs');
    safe(initHeroCanvas,        'hero-canvas');
    safe(initCursorGlow,        'cursor-glow');
    safe(initHeroSplit,         'hero-split');
    safe(initSplash,            'splash');
    safe(initMobileMenu,        'mobile-menu');
    safe(initSmoothScroll,      'smooth-scroll');
    safe(initProcessShowcase,   'process-showcase');

    window.addEventListener('load', function () {
      safe(initCardTilt,        'card-tilt');
      safe(initBookingForm,     'booking-form');
      safe(initChatDemo,        'chat-demo');
      safe(initCounters,        'counters');
      safe(initMagneticBtns,    'magnetic-btns');
    });
  });

})();
