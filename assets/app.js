/* Externe Personalabteilung — shared site JS (progressive enhancement) */
(function(){
  'use strict';
  // Mobile nav
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.getElementById('mobileMenu');
  if (hamburger && mobileMenu){
    hamburger.addEventListener('click', function(){
      mobileMenu.classList.toggle('open');
    });
    mobileMenu.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click', function(){ mobileMenu.classList.remove('open'); });
    });
    // Aufklappbare Untermenues
    mobileMenu.querySelectorAll('.mob-toggle').forEach(function(btn){
      btn.addEventListener('click', function(ev){
        ev.preventDefault();
        var group = btn.closest('.mob-group');
        if (!group) return;
        var open = group.classList.toggle('open');
        btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    // Gruppe der aktuellen Seite offen zeigen
    var here = location.pathname.replace(/\/$/, '/index.html');
    mobileMenu.querySelectorAll('.mob-sublist a').forEach(function(a){
      var target;
      try { target = new URL(a.href).pathname.replace(/\/$/, '/index.html'); } catch(e){ target = null; }
      if (target && target === here){
        var g = a.closest('.mob-group');
        if (g){ g.classList.add('open'); var b = g.querySelector('.mob-toggle'); if (b) b.setAttribute('aria-expanded','true'); }
      }
    });
  }

  // Sprachumschalter (Dropdown)
  (function(){var sw=document.querySelector('.lang-switch');if(!sw)return;var b=sw.querySelector('.lang-cur');if(!b)return;b.addEventListener('click',function(e){e.stopPropagation();var o=sw.classList.toggle('open');b.setAttribute('aria-expanded',o?'true':'false');});document.addEventListener('click',function(){sw.classList.remove('open');b.setAttribute('aria-expanded','false');});})();

  // Fade-up on scroll
  if ('IntersectionObserver' in window){
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting){ e.target.classList.add('visible'); obs.unobserve(e.target); }
      });
    }, {threshold:0.08, rootMargin:'0px 0px -40px 0px'});
    document.querySelectorAll('.fade-up').forEach(function(el){ obs.observe(el); });
  } else {
    document.querySelectorAll('.fade-up').forEach(function(el){ el.classList.add('visible'); });
  }

  // FAQ accordion
  document.querySelectorAll('[data-faq]').forEach(function(q){
    q.addEventListener('click', function(){
      var item = q.closest('.faq-item');
      if (!item) return;
      var isOpen = item.classList.contains('open');
      // close siblings in same list
      var parent = item.parentElement;
      if (parent) parent.querySelectorAll('.faq-item.open').forEach(function(i){ if (i !== item) i.classList.remove('open'); });
      item.classList.toggle('open', !isOpen);
    });
  });

  // Cookie-/Datenschutz-Banner: eigenständiges Consent-Modul laden (consent.js).
  // Wird relativ zum eigenen Script-Pfad aufgelöst, damit es aus / und aus
  // Sprach-Unterordnern (/en/, /es/ ...) funktioniert.
  (function(){
    var me = document.currentScript ||
      [].slice.call(document.getElementsByTagName('script')).filter(function(s){ return /app\.js(\?|$)/.test(s.src); }).pop();
    var base = me && me.src ? me.src.replace(/app\.js.*$/, '') : 'assets/';
    var s = document.createElement('script');
    s.src = base + 'consent.js';
    s.defer = true;
    document.head.appendChild(s);
  })();

  // Einladungs-Layer: auf jeder Seite, nach kurzer Zeit oder bei Exit-Absicht, einmal pro Sitzung
  (function(){
    if (window.self !== window.top) return; // nicht in eingebetteten Inhalten
    var COPY = {
      de:{h:'Warten Sie kurz.', p:'15 Minuten ehrliches Gespr\u00e4ch kosten Sie nichts \u2013 und k\u00f6nnen Ihre beruflichen Pl\u00e4ne entscheidend voranbringen.', cta:'Kostenloses Kennenlerngespr\u00e4ch buchen \u2197', no:'Nein, danke', close:'Schlie\u00dfen'},
      en:{h:'Wait a moment.', p:'15 minutes of honest conversation cost you nothing \u2013 and can decisively advance your career plans.', cta:'Book a free introductory call \u2197', no:'No, thanks', close:'Close'},
      es:{h:'Espere un momento.', p:'15 minutos de conversaci\u00f3n honesta no le cuestan nada y pueden hacer avanzar decisivamente sus planes profesionales.', cta:'Reservar una llamada gratuita \u2197', no:'No, gracias', close:'Cerrar'},
      ru:{h:'\u041e\u0434\u043d\u0443 \u043c\u0438\u043d\u0443\u0442\u0443.', p:'15 \u043c\u0438\u043d\u0443\u0442 \u043e\u0442\u043a\u0440\u043e\u0432\u0435\u043d\u043d\u043e\u0433\u043e \u0440\u0430\u0437\u0433\u043e\u0432\u043e\u0440\u0430 \u043d\u0438\u0447\u0435\u0433\u043e \u043d\u0435 \u0441\u0442\u043e\u044f\u0442 \u2013 \u0438 \u043c\u043e\u0433\u0443\u0442 \u0440\u0435\u0448\u0430\u044e\u0449\u0435 \u043f\u0440\u043e\u0434\u0432\u0438\u043d\u0443\u0442\u044c \u0432\u0430\u0448\u0438 \u043f\u0440\u043e\u0444\u0435\u0441\u0441\u0438\u043e\u043d\u0430\u043b\u044c\u043d\u044b\u0435 \u043f\u043b\u0430\u043d\u044b.', cta:'\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u044c\u0441\u044f \u043d\u0430 \u0431\u0435\u0441\u043f\u043b\u0430\u0442\u043d\u0443\u044e \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0438\u044e \u2197', no:'\u041d\u0435\u0442, \u0441\u043f\u0430\u0441\u0438\u0431\u043e', close:'\u0417\u0430\u043a\u0440\u044b\u0442\u044c'},
      uk:{h:'\u0417\u0430\u0447\u0435\u043a\u0430\u0439\u0442\u0435 \u0445\u0432\u0438\u043b\u0438\u043d\u043a\u0443.', p:'15 \u0445\u0432\u0438\u043b\u0438\u043d \u0432\u0456\u0434\u043a\u0440\u0438\u0442\u043e\u0457 \u0440\u043e\u0437\u043c\u043e\u0432\u0438 \u043d\u0456\u0447\u043e\u0433\u043e \u0432\u0430\u043c \u043d\u0435 \u043a\u043e\u0448\u0442\u0443\u044e\u0442\u044c \u2013 \u0456 \u043c\u043e\u0436\u0443\u0442\u044c \u0432\u0438\u0440\u0456\u0448\u0430\u043b\u044c\u043d\u043e \u043f\u0440\u043e\u0441\u0443\u043d\u0443\u0442\u0438 \u0432\u0430\u0448\u0456 \u043f\u0440\u043e\u0444\u0435\u0441\u0456\u0439\u043d\u0456 \u043f\u043b\u0430\u043d\u0438.', cta:'\u0417\u0430\u043f\u0438\u0441\u0430\u0442\u0438\u0441\u044f \u043d\u0430 \u0431\u0435\u0437\u043a\u043e\u0448\u0442\u043e\u0432\u043d\u0443 \u043a\u043e\u043d\u0441\u0443\u043b\u044c\u0442\u0430\u0446\u0456\u044e \u2197', no:'\u041d\u0456, \u0434\u044f\u043a\u0443\u044e', close:'\u0417\u0430\u043a\u0440\u0438\u0442\u0438'},
      ar:{h:'\u0644\u062d\u0637\u0629 \u0648\u0627\u062d\u062f\u0629.', p:'\u062e\u0645\u0633 \u0639\u0634\u0631\u0629 \u062f\u0642\u064a\u0642\u0629 \u0645\u0646 \u062d\u0648\u0627\u0631 \u0635\u0627\u062f\u0642 \u0644\u0627 \u062a\u0643\u0644\u0641\u0643 \u0634\u064a\u0626\u0627\u064b \u2013 \u0648\u0642\u062f \u062a\u062f\u0641\u0639 \u062e\u0637\u0637\u0643 \u0627\u0644\u0645\u0647\u0646\u064a\u0629 \u0625\u0644\u0649 \u0627\u0644\u0623\u0645\u0627\u0645 \u0628\u0634\u0643\u0644 \u062d\u0627\u0633\u0645.', cta:'\u0627\u062d\u062c\u0632 \u0645\u0643\u0627\u0644\u0645\u0629 \u062a\u0639\u0631\u064a\u0641\u064a\u0629 \u0645\u062c\u0627\u0646\u064a\u0629 \u2197', no:'\u0644\u0627\u060c \u0634\u0643\u0631\u0627\u064b', close:'\u0625\u063a\u0644\u0627\u0642'}
    };
    var lang = (document.documentElement.getAttribute('lang') || 'de').slice(0,2).toLowerCase();
    var c = COPY[lang] || COPY.de;
    var BOOK = 'https://koalendar.com/e/jobcoaching-kennenlerngesprach-15-minuten-kostenfrei';
    var key = 'epa_exit_shown_v1';
    if (sessionStorage.getItem(key)) return;

    var modal = document.getElementById('exitModal');
    if (!modal){
      modal = document.createElement('div');
      modal.className = 'modal-backdrop';
      modal.id = 'exitModal';
      modal.setAttribute('role','dialog');
      modal.setAttribute('aria-modal','true');
      var box = document.createElement('div');
      box.className = 'modal';
      var btnX = document.createElement('button');
      btnX.className = 'modal-close'; btnX.setAttribute('data-close',''); btnX.setAttribute('aria-label', c.close); btnX.textContent = '\u00d7';
      var h = document.createElement('h3'); h.textContent = c.h;
      var p = document.createElement('p'); p.textContent = c.p;
      var a = document.createElement('a');
      a.href = BOOK; a.target = '_blank'; a.rel = 'noopener';
      a.className = 'btn btn-primary btn-block'; a.textContent = c.cta;
      var no = document.createElement('button');
      no.className = 'btn btn-ghost'; no.setAttribute('data-close',''); no.style.marginTop = '0.6rem'; no.textContent = c.no;
      box.appendChild(btnX); box.appendChild(h); box.appendChild(p); box.appendChild(a); box.appendChild(no);
      modal.appendChild(box);
      document.body.appendChild(modal);
    }

    var shown = false;
    function show(){
      if (shown || sessionStorage.getItem(key)) return;
      shown = true;
      sessionStorage.setItem(key, '1');
      modal.classList.add('show');
      document.removeEventListener('mouseout', onOut);
    }
    function hide(){ modal.classList.remove('show'); }
    function onOut(e){ if (e.clientY < 12) show(); }

    modal.querySelectorAll('[data-close]').forEach(function(b){ b.addEventListener('click', hide); });
    modal.addEventListener('click', function(e){ if (e.target === modal) hide(); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape') hide(); });

    // Zeitgesteuert auf allen Geraeten, zusaetzlich Exit-Absicht am Desktop
    setTimeout(show, 25000);
    if (window.matchMedia('(min-width:860px)').matches){
      setTimeout(function(){ document.addEventListener('mouseout', onOut); }, 4000);
    }
  })();

  // Smooth scroll for in-page #
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    var href = a.getAttribute('href');
    if (href.length < 2) return;
    a.addEventListener('click', function(e){
      var t = document.querySelector(href);
      if (t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth'}); }
    });
  });

  // Active nav link highlighting
  var path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(function(a){
    var href = (a.getAttribute('href')||'').toLowerCase();
    if (href === path || (path === '' && href === 'index.html')) a.classList.add('active');
  });

  // Simple lead-magnet form handler
  document.querySelectorAll('[data-lead-form]').forEach(function(f){
    f.addEventListener('submit', function(e){
      e.preventDefault();
      var email = f.querySelector('input[type=email]');
      if (!email || !email.value) return;
      var msg = f.querySelector('[data-lead-msg]');
      if (msg){ msg.textContent = 'Vielen Dank! Die Checkliste ist auf dem Weg zu ' + email.value + '.'; msg.style.color = '#2a9e50'; }
      f.reset();
      try { localStorage.setItem('epa_lead_'+Date.now(), email.value); } catch(_){}
    });
  });


  // Testimonial carousel
  (function(){
    var car = document.getElementById('testimonialCarousel');
    if (!car) return;
    var track = document.getElementById('tcTrack');
    var prev = document.getElementById('tcPrev');
    var next = document.getElementById('tcNext');
    var dotsWrap = document.getElementById('tcDots');
    var slides = track.querySelectorAll('.tc-slide');
    if (!slides.length) return;

    function perPage(){
      var w = window.innerWidth;
      if (w <= 680) return 1;
      if (w <= 1024) return 2;
      return 3;
    }
    function pages(){ return Math.max(1, slides.length - perPage() + 1); }
    function currentPage(){
      var slideW = slides[0].getBoundingClientRect().width + 24; // gap 1.5rem
      return Math.round(track.scrollLeft / slideW);
    }
    function goTo(i){
      i = Math.max(0, Math.min(pages()-1, i));
      var slideW = slides[0].getBoundingClientRect().width + 24;
      track.scrollTo({left: i * slideW, behavior: 'smooth'});
    }
    function buildDots(){
      dotsWrap.innerHTML = '';
      for (var i=0; i<pages(); i++){
        var b = document.createElement('button');
        b.className = 'tc-dot' + (i===0 ? ' active' : '');
        b.setAttribute('aria-label','Bewertung '+(i+1));
        b.dataset.idx = i;
        b.addEventListener('click', function(e){ goTo(parseInt(e.currentTarget.dataset.idx,10)); });
        dotsWrap.appendChild(b);
      }
    }
    function updateUI(){
      var cur = currentPage();
      var total = pages();
      prev.disabled = cur <= 0;
      next.disabled = cur >= total - 1;
      dotsWrap.querySelectorAll('.tc-dot').forEach(function(d,i){
        d.classList.toggle('active', i === cur);
      });
    }

    prev.addEventListener('click', function(){ goTo(currentPage() - 1); });
    next.addEventListener('click', function(){ goTo(currentPage() + 1); });
    track.addEventListener('scroll', function(){
      clearTimeout(track._t);
      track._t = setTimeout(updateUI, 60);
    });
    window.addEventListener('resize', function(){
      clearTimeout(window._tcr);
      window._tcr = setTimeout(function(){ buildDots(); updateUI(); }, 100);
    });

    // Auto-play, pause on hover/focus/touch
    var paused = false, timer = null;
    function start(){
      stop();
      timer = setInterval(function(){
        if (paused) return;
        var cur = currentPage();
        if (cur >= pages() - 1) goTo(0); else goTo(cur + 1);
      }, 15000);
    }
    function stop(){ if (timer) { clearInterval(timer); timer = null; } }
    car.addEventListener('mouseenter', function(){ paused = true; });
    car.addEventListener('mouseleave', function(){ paused = false; });
    car.addEventListener('focusin', function(){ paused = true; });
    car.addEventListener('focusout', function(){ paused = false; });
    car.addEventListener('touchstart', function(){ paused = true; }, {passive:true});

    // Respect reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) start();

    buildDots();
    updateUI();
  })();

  /* Arbeitsagentur-Kundennummer: Klick blendet die Nummer ein/aus */
  (function(){
    var btns = document.querySelectorAll('.cta-aa');
    if (!btns.length) return;
    btns.forEach(function(b){
      b.addEventListener('click', function(e){
        e.preventDefault();
        var open = b.classList.toggle('is-open');
        b.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    });
    document.addEventListener('click', function(e){
      btns.forEach(function(b){ if (!b.contains(e.target)) b.classList.remove('is-open'); });
    });
    document.addEventListener('keydown', function(e){
      if (e.key === 'Escape') btns.forEach(function(b){ b.classList.remove('is-open'); });
    });
  })();

})();
