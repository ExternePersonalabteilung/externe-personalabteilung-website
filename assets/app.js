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
  }

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

  // Exit intent modal (desktop only, once per session)
  var exitModal = document.getElementById('exitModal');
  var exitKey = 'epa_exit_shown_v1';
  if (exitModal && !sessionStorage.getItem(exitKey) && window.matchMedia('(min-width:860px)').matches){
    var handler = function(e){
      if (e.clientY < 12 && !sessionStorage.getItem(exitKey)){
        sessionStorage.setItem(exitKey, '1');
        exitModal.classList.add('show');
        document.removeEventListener('mouseout', handler);
      }
    };
    setTimeout(function(){ document.addEventListener('mouseout', handler); }, 4000);
    exitModal.querySelectorAll('[data-close]').forEach(function(b){
      b.addEventListener('click', function(){ exitModal.classList.remove('show'); });
    });
    exitModal.addEventListener('click', function(e){ if (e.target === exitModal){ exitModal.classList.remove('show'); }});
  }

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
