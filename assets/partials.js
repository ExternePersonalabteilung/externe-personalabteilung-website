/* Shared nav/footer fragments loaded client-side to keep markup DRY.
   Progressive: if JS fails, pages still have inline fallback nav. */
(function(){
  var NAV = `
<div class="nav-inner">
  <a class="nav-logo" href="index.html">
    <img src="assets/logo.png" alt="Externe Personalabteilung" width="48" height="48">
    <div>
      <div class="nav-logo-text">Externe Personalabteilung</div>
      <div class="nav-logo-sub">Anita Bösche · Recruiting & Jobcoaching</div>
    </div>
  </a>
  <div class="nav-links">
    <a href="jobcoaching.html">Jobcoaching</a>
    <a href="recruiting.html">Recruiting</a>
    <a href="jobvermittlung.html">Jobvermittlung</a><a href="avgs.html">AVGS</a>
    <a href="ueber-mich.html">Über mich</a>
    <a href="job.html">Karriere</a>
    <a href="kontakt.html">Kontakt</a>
    <a href="https://koalendar.com/e/jobcoaching-kennenlerngesprach-15-minuten-kostenfrei" target="_blank" rel="noopener" class="nav-cta">Termin buchen</a>
  </div>
  <button class="hamburger" aria-label="Menü öffnen"><span></span><span></span><span></span></button>`;
  var MOBILE = `
<a href="jobcoaching.html">Jobcoaching</a>
<a href="recruiting.html">Recruiting</a>
<a href="jobvermittlung.html">Jobvermittlung</a><a href="avgs.html">AVGS</a>
<a href="ueber-mich.html">Über mich</a>
<a href="job.html">Karriere / Freelancer</a>
<a href="kontakt.html">Kontakt</a>
<a href="https://koalendar.com/e/jobcoaching-kennenlerngesprach-15-minuten-kostenfrei" target="_blank" rel="noopener" class="nav-cta">Kostenlosen Termin buchen ↗</a>`;
  var FOOTER = `
<div class="footer-grid">
  <div>
    <div class="footer-brand">Externe Personalabteilung</div>
    <p class="footer-tag">Jobcoaching, Berufsberatung und Recruiting — empathisch, KI-gestützt, deutschlandweit. AZAV-zertifiziert.</p>
  </div>
  <div class="footer-col">
    <h4>Leistungen</h4>
    <a href="jobcoaching.html">Jobcoaching</a>
    <a href="recruiting.html">Recruiting</a>
    <a href="jobvermittlung.html">Jobvermittlung</a><a href="avgs.html">AVGS</a>
    <a href="job.html">Karriere / Freelancer</a>
  </div>
  <div class="footer-col">
    <h4>Unternehmen</h4>
    <a href="ueber-mich.html">Über mich</a>
    <a href="kontakt.html">Kontakt</a>
    <a href="impressum.html">Impressum</a>
    <a href="datenschutz.html">Datenschutz</a>
  </div>
  <div class="footer-col">
    <h4>Kontakt</h4>
    <a href="tel:+4916091880672">+49 160 91880672</a>
    <a href="mailto:kontakt@externe-personalabteilung.de">kontakt@externe-personalabteilung.de</a>
    <address>Falkenstraße 21a<br>82377 Penzberg</address>
  </div>
</div>
<div class="footer-bottom">
  <div>© 2026 Anita Bösche · Externe Personalabteilung · USt-ID: DE351379251</div>
  <div>Gebaut für Performance, SEO und Datenschutz.</div>
</div>`;
  var FLOATS = `
<div class="sticky-cta">
  <div class="sticky-cta-text">Kostenlos 15 Min.<br>Kennenlerngespräch</div>
  <a href="https://koalendar.com/e/jobcoaching-kennenlerngesprach-15-minuten-kostenfrei" target="_blank" rel="noopener" class="btn btn-light">Termin buchen ↗</a>
</div>
<a href="https://api.whatsapp.com/send/?phone=%2B4916091880672" target="_blank" rel="noopener" class="wa-float" aria-label="WhatsApp Kontakt">
  <svg viewBox="0 0 24 24"><path d="M20.5 3.5A10 10 0 003.3 17L2 22l5.2-1.3A10 10 0 1020.5 3.5zm-8.4 15.3a8.3 8.3 0 01-4.2-1.2l-.3-.2-3 .8.8-3-.2-.3a8.3 8.3 0 1113.2-6.6 8.3 8.3 0 01-6.3 10.5zm4.7-6.2c-.2-.1-1.5-.7-1.8-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.8 6.8 0 01-3.3-2.9c-.2-.4.3-.3.7-1.2 0-.2 0-.3-.1-.5l-.8-1.8c-.2-.4-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3a2.8 2.8 0 00-.9 2.1c0 1.2 1 2.4 1.1 2.6.1.2 2 3 4.8 4.2 1.8.7 2.5.8 3.4.7.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.4-.1z"/></svg>
</a>`;
  var nav = document.querySelector('[data-nav]');
  if (nav) nav.innerHTML = NAV;
  var mob = document.querySelector('[data-mobile-menu]');
  if (mob) mob.innerHTML = MOBILE;
  var ft = document.querySelector('[data-footer]');
  if (ft) ft.innerHTML = FOOTER;
  var fl = document.querySelector('[data-floats]');
  if (fl) fl.innerHTML = FLOATS;
})();
