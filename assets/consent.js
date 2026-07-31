/* ============================================================================
   Externe Personalabteilung — Consent Manager (DSGVO / GDPR)
   © 2026 Anita Bösche

   Zweck: DSGVO-freundliche Einwilligungsverwaltung für Cookies und externe
   Dienste. Externe Dienste (Google Analytics, YouTube, Google Maps,
   Facebook Pixel, sonstiges Tracking) werden ERST NACH aktiver Einwilligung
   geladen. Standardmäßig ist nur die Kategorie "Notwendig" aktiv.

   HINWEIS: Dies ist eine technische Umsetzung, KEINE Rechtsberatung.
   Bitte Kategorien, Texte und die Datenschutzerklärung mit einer
   fachkundigen Stelle abstimmen.

   ---------------------------------------------------------------------------
   SO BINDEN SIE SPÄTER DIENSTE EIN (erst nach Zustimmung aktiv):

   1) Skripte blockieren, bis zugestimmt wurde — type="text/plain" + data-cc:
      <script type="text/plain" data-cc="statistics"
              data-src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"></script>
      <script type="text/plain" data-cc="statistics">
        window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date()); gtag('config','G-XXXX',{anonymize_ip:true});
      </script>

   2) Eingebettete Inhalte (YouTube, Google Maps) blockieren — iframe/data-cc-src:
      <iframe data-cc="marketing"
              data-cc-src="https://www.youtube-nocookie.com/embed/ID"
              width="560" height="315" title="Video"></iframe>
      Solange keine Zustimmung vorliegt, erscheint automatisch ein Platzhalter
      mit Button "Inhalt laden".

   3) Eigener Code per Callback:
      EPAConsent.onChange(function(prefs){
        if (prefs.marketing) { initFacebookPixel(); }
      });
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'epa_consent_v3';
  var LEGACY_KEYS = ['epa_cookie_ack_v1'];

  /* --- Kategorien -------------------------------------------------------- */
  var CATEGORIES = ['necessary', 'statistics', 'marketing'];

  /* --- Sprache erkennen -------------------------------------------------- */
  var LANG = (document.documentElement.getAttribute('lang') || 'de').slice(0, 2).toLowerCase();
  var I18N = {
    de: {
      dir: 'ltr',
      bTitle: 'Datenschutz & Cookies',
      bBody: 'Wir verwenden Cookies. Notwendige Cookies sind für den Betrieb der Website erforderlich. Optionale Cookies für Statistik und Marketing setzen wir nur mit Ihrer Einwilligung. Externe Dienste werden erst nach Ihrer Zustimmung geladen.',
      more: 'Mehr in der Datenschutzerklärung',
      acceptAll: 'Alle akzeptieren',
      onlyNecessary: 'Nur notwendige Cookies',
      settings: 'Einstellungen',
      saveSelection: 'Auswahl speichern',
      mTitle: 'Datenschutz-Einstellungen',
      mIntro: 'Entscheiden Sie selbst, welche Cookies Sie zulassen. Ihre Auswahl können Sie jederzeit über den Link „Cookie-Einstellungen“ im Seitenfuß ändern oder widerrufen.',
      close: 'Schließen',
      alwaysOn: 'Immer aktiv',
      reopen: 'Cookie-Einstellungen',
      cats: {
        necessary: { name: 'Notwendig', desc: 'Für den technischen Betrieb der Website und die Speicherung Ihrer Cookie-Entscheidung erforderlich. Diese Cookies können nicht deaktiviert werden.' },
        statistics: { name: 'Statistik', desc: 'Anonymisierte Reichweitenmessung, damit wir die Website verbessern können (z. B. Google Analytics). Wird nur mit Ihrer Einwilligung geladen.' },
        marketing: { name: 'Marketing', desc: 'Eingebettete Inhalte und Reichweiten-/Werbedienste (z. B. YouTube, Google Maps, Facebook Pixel). Wird nur mit Ihrer Einwilligung geladen.' }
      },
      embedTitle: 'Externer Inhalt blockiert',
      embedBody: 'Dieser Inhalt wird von einem externen Anbieter geladen. Erst mit Ihrer Zustimmung werden dabei ggf. Daten an Dritte übertragen.',
      embedLoad: 'Inhalt laden'
    },
    en: {
      dir: 'ltr',
      bTitle: 'Privacy & Cookies',
      bBody: 'We use cookies. Necessary cookies are required to run the website. We only set optional statistics and marketing cookies with your consent. External services are loaded only after you agree.',
      more: 'More in our privacy policy',
      acceptAll: 'Accept all',
      onlyNecessary: 'Necessary only',
      settings: 'Settings',
      saveSelection: 'Save selection',
      mTitle: 'Privacy settings',
      mIntro: 'Choose which cookies you allow. You can change or withdraw your choice at any time via the “Cookie settings” link in the footer.',
      close: 'Close',
      alwaysOn: 'Always on',
      reopen: 'Cookie settings',
      cats: {
        necessary: { name: 'Necessary', desc: 'Required for the technical operation of the site and to store your cookie choice. These cannot be disabled.' },
        statistics: { name: 'Statistics', desc: 'Anonymised analytics so we can improve the site (e.g. Google Analytics). Loaded only with your consent.' },
        marketing: { name: 'Marketing', desc: 'Embedded content and advertising services (e.g. YouTube, Google Maps, Facebook Pixel). Loaded only with your consent.' }
      },
      embedTitle: 'External content blocked',
      embedBody: 'This content is loaded from an external provider. Data may be transferred to third parties once you agree.',
      embedLoad: 'Load content'
    },
    es: {
      dir: 'ltr',
      bTitle: 'Privacidad y cookies',
      bBody: 'Utilizamos cookies. Las cookies necesarias son imprescindibles para el funcionamiento del sitio. Las cookies opcionales de estadística y marketing solo se activan con su consentimiento. Los servicios externos se cargan únicamente tras su aceptación.',
      more: 'Más en la política de privacidad',
      acceptAll: 'Aceptar todo',
      onlyNecessary: 'Solo necesarias',
      settings: 'Configuración',
      saveSelection: 'Guardar selección',
      mTitle: 'Configuración de privacidad',
      mIntro: 'Elija qué cookies permite. Puede cambiar o retirar su elección en cualquier momento mediante el enlace «Configuración de cookies» en el pie de página.',
      close: 'Cerrar',
      alwaysOn: 'Siempre activas',
      reopen: 'Configuración de cookies',
      cats: {
        necessary: { name: 'Necesarias', desc: 'Necesarias para el funcionamiento técnico del sitio y para guardar su decisión sobre las cookies. No se pueden desactivar.' },
        statistics: { name: 'Estadística', desc: 'Analítica anonimizada para mejorar el sitio (p. ej. Google Analytics). Se carga solo con su consentimiento.' },
        marketing: { name: 'Marketing', desc: 'Contenido incrustado y servicios publicitarios (p. ej. YouTube, Google Maps, Facebook Pixel). Se carga solo con su consentimiento.' }
      },
      embedTitle: 'Contenido externo bloqueado',
      embedBody: 'Este contenido se carga desde un proveedor externo. Al aceptar, es posible que se transfieran datos a terceros.',
      embedLoad: 'Cargar contenido'
    },
    uk: {
      dir: 'ltr',
      bTitle: 'Конфіденційність і файли cookie',
      bBody: 'Ми використовуємо файли cookie. Необхідні файли cookie потрібні для роботи сайту. Додаткові файли cookie для статистики та маркетингу встановлюються лише за вашою згодою. Зовнішні сервіси завантажуються тільки після вашого дозволу.',
      more: 'Докладніше в політиці конфіденційності',
      acceptAll: 'Прийняти все',
      onlyNecessary: 'Лише необхідні',
      settings: 'Налаштування',
      saveSelection: 'Зберегти вибір',
      mTitle: 'Налаштування конфіденційності',
      mIntro: 'Оберіть, які файли cookie дозволити. Ви можете змінити або відкликати свій вибір будь-коли через посилання «Налаштування cookie» у нижньому колонтитулі.',
      close: 'Закрити',
      alwaysOn: 'Завжди активні',
      reopen: 'Налаштування cookie',
      cats: {
        necessary: { name: 'Необхідні', desc: 'Потрібні для технічної роботи сайту та збереження вашого рішення щодо cookie. Їх не можна вимкнути.' },
        statistics: { name: 'Статистика', desc: 'Анонімна аналітика, щоб покращувати сайт (напр. Google Analytics). Завантажується лише за вашою згодою.' },
        marketing: { name: 'Маркетинг', desc: 'Вбудований контент і рекламні сервіси (напр. YouTube, Google Maps, Facebook Pixel). Завантажується лише за вашою згодою.' }
      },
      embedTitle: 'Зовнішній контент заблоковано',
      embedBody: 'Цей контент завантажується із зовнішнього джерела. Після згоди дані можуть передаватися третім сторонам.',
      embedLoad: 'Завантажити контент'
    },
    ru: {
      dir: 'ltr',
      bTitle: 'Конфиденциальность и файлы cookie',
      bBody: 'Мы используем файлы cookie. Необходимые cookie требуются для работы сайта. Дополнительные cookie для статистики и маркетинга устанавливаются только с вашего согласия. Внешние сервисы загружаются лишь после вашего согласия.',
      more: 'Подробнее в политике конфиденциальности',
      acceptAll: 'Принять все',
      onlyNecessary: 'Только необходимые',
      settings: 'Настройки',
      saveSelection: 'Сохранить выбор',
      mTitle: 'Настройки конфиденциальности',
      mIntro: 'Выберите, какие cookie разрешить. Вы можете изменить или отозвать выбор в любое время через ссылку «Настройки cookie» в нижнем колонтитуле.',
      close: 'Закрыть',
      alwaysOn: 'Всегда активны',
      reopen: 'Настройки cookie',
      cats: {
        necessary: { name: 'Необходимые', desc: 'Требуются для технической работы сайта и сохранения вашего решения о cookie. Их нельзя отключить.' },
        statistics: { name: 'Статистика', desc: 'Анонимная аналитика, чтобы улучшать сайт (напр. Google Analytics). Загружается только с вашего согласия.' },
        marketing: { name: 'Маркетинг', desc: 'Встроенный контент и рекламные сервисы (напр. YouTube, Google Maps, Facebook Pixel). Загружается только с вашего согласия.' }
      },
      embedTitle: 'Внешний контент заблокирован',
      embedBody: 'Этот контент загружается из внешнего источника. После согласия данные могут передаваться третьим лицам.',
      embedLoad: 'Загрузить контент'
    },
    ar: {
      dir: 'rtl',
      bTitle: 'الخصوصية وملفات تعريف الارتباط',
      bBody: 'نستخدم ملفات تعريف الارتباط. الملفات الضرورية لازمة لتشغيل الموقع. أما الملفات الاختيارية للإحصاءات والتسويق فنستخدمها فقط بموافقتك. لا يتم تحميل الخدمات الخارجية إلا بعد موافقتك.',
      more: 'مزيد من المعلومات في سياسة الخصوصية',
      acceptAll: 'قبول الكل',
      onlyNecessary: 'الضرورية فقط',
      settings: 'الإعدادات',
      saveSelection: 'حفظ الاختيار',
      mTitle: 'إعدادات الخصوصية',
      mIntro: 'اختر ملفات تعريف الارتباط التي تسمح بها. يمكنك تغيير اختيارك أو سحبه في أي وقت عبر رابط «إعدادات ملفات تعريف الارتباط» في تذييل الصفحة.',
      close: 'إغلاق',
      alwaysOn: 'مفعّل دائمًا',
      reopen: 'إعدادات ملفات تعريف الارتباط',
      cats: {
        necessary: { name: 'ضرورية', desc: 'لازمة للتشغيل التقني للموقع ولحفظ قرارك بشأن ملفات تعريف الارتباط. لا يمكن تعطيلها.' },
        statistics: { name: 'إحصاءات', desc: 'تحليلات مجهولة الهوية لتحسين الموقع (مثل Google Analytics). تُحمّل فقط بموافقتك.' },
        marketing: { name: 'تسويق', desc: 'محتوى مضمّن وخدمات إعلانية (مثل YouTube وGoogle Maps وFacebook Pixel). تُحمّل فقط بموافقتك.' }
      },
      embedTitle: 'تم حظر محتوى خارجي',
      embedBody: 'يتم تحميل هذا المحتوى من مزوّد خارجي. قد يتم نقل بيانات إلى أطراف ثالثة بعد موافقتك.',
      embedLoad: 'تحميل المحتوى'
    }
  };
  var T = I18N[LANG] || I18N.de;

  /* --- Datenschutz-Link relativ auflösen --------------------------------- */
  function privacyHref() {
    var link = document.querySelector('a[href$="datenschutz.html"]');
    if (link) return link.getAttribute('href');
    // Fallback: Sprach-Unterordner erkennen
    return /\/(en|es|ru|uk|ar)(\/|$)/.test(location.pathname) ? '../datenschutz.html' : 'datenschutz.html';
  }

  /* --- Speicherung ------------------------------------------------------- */
  function readStore() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      var obj = JSON.parse(raw);
      if (!obj || obj.v !== 3 || !obj.categories) return null;
      return obj;
    } catch (e) { return null; }
  }
  function writeStore(prefs) {
    var obj = {
      v: 3,
      date: new Date().toISOString(),
      categories: {
        necessary: true,
        statistics: !!prefs.statistics,
        marketing: !!prefs.marketing
      }
    };
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(obj)); } catch (e) {}
    LEGACY_KEYS.forEach(function (k) { try { localStorage.removeItem(k); } catch (e) {} });
    return obj;
  }
  function currentPrefs() {
    var s = readStore();
    return s ? s.categories : { necessary: true, statistics: false, marketing: false };
  }

  /* --- Callback-Register ------------------------------------------------- */
  var changeCbs = [];

  /* --- Blockierte Skripte aktivieren ------------------------------------- */
  function activateScripts(prefs) {
    var blocked = document.querySelectorAll('script[type="text/plain"][data-cc]');
    blocked.forEach(function (node) {
      var cat = node.getAttribute('data-cc');
      if (!prefs[cat]) return;
      if (node.dataset.ccActivated) return;
      node.dataset.ccActivated = '1';
      var s = document.createElement('script');
      // Attribute übernehmen (außer den Steuer-Attributen)
      for (var i = 0; i < node.attributes.length; i++) {
        var a = node.attributes[i];
        if (a.name === 'type' || a.name === 'data-cc' || a.name === 'data-src') continue;
        s.setAttribute(a.name, a.value);
      }
      var srcAttr = node.getAttribute('data-src');
      if (srcAttr) s.src = srcAttr; else s.text = node.text || node.textContent || '';
      node.parentNode.insertBefore(s, node.nextSibling);
    });
  }

  /* --- Blockierte Embeds (iframes) --------------------------------------- */
  function refreshEmbeds(prefs) {
    var embeds = document.querySelectorAll('[data-cc-src]');
    embeds.forEach(function (el) {
      var cat = el.getAttribute('data-cc') || 'marketing';
      var allowed = !!prefs[cat];
      if (allowed) {
        // Platzhalter entfernen, echtes iframe laden
        var ph = el.previousElementSibling;
        if (ph && ph.classList && ph.classList.contains('epa-cc-embed')) ph.remove();
        el.style.display = '';
        if (el.tagName === 'IFRAME' && !el.getAttribute('src')) {
          el.setAttribute('src', el.getAttribute('data-cc-src'));
        }
      } else {
        el.style.display = 'none';
        var prev = el.previousElementSibling;
        if (!(prev && prev.classList && prev.classList.contains('epa-cc-embed'))) {
          var box = document.createElement('div');
          box.className = 'epa-cc-embed';
          box.innerHTML =
            '<div class="epa-cc-embed-inner">' +
              '<div class="epa-cc-embed-title">' + esc(T.embedTitle) + '</div>' +
              '<p class="epa-cc-embed-body">' + esc(T.embedBody) + '</p>' +
              '<button type="button" class="epa-cc-btn epa-cc-btn-primary">' + esc(T.embedLoad) + '</button>' +
            '</div>';
          box.querySelector('button').addEventListener('click', function () {
            var p = currentPrefs(); p[cat] = true; apply(writeStore(p).categories);
          });
          el.parentNode.insertBefore(box, el);
        }
      }
    });
  }

  function apply(prefs) {
    activateScripts(prefs);
    refreshEmbeds(prefs);
    // gtag Consent Mode (falls vorhanden) aktualisieren
    if (typeof window.gtag === 'function') {
      window.gtag('consent', 'update', {
        analytics_storage: prefs.statistics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
        ad_user_data: prefs.marketing ? 'granted' : 'denied',
        ad_personalization: prefs.marketing ? 'granted' : 'denied'
      });
    }
    changeCbs.forEach(function (cb) { try { cb(prefs); } catch (e) {} });
    document.dispatchEvent(new CustomEvent('epa:consent', { detail: prefs }));
  }

  /* --- Helpers ----------------------------------------------------------- */
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]; }); }
  function el(html) { var d = document.createElement('div'); d.innerHTML = html.trim(); return d.firstElementChild; }

  /* --- UI: Banner + Modal ------------------------------------------------ */
  var root, banner, modal, lastFocus;

  function buildUI() {
    if (root) return;
    root = document.createElement('div');
    root.className = 'epa-cc';
    root.setAttribute('dir', T.dir);

    var pv = privacyHref();

    banner = el(
      '<div class="epa-cc-banner" role="dialog" aria-modal="false" aria-label="' + esc(T.bTitle) + '">' +
        '<div class="epa-cc-banner-body">' +
          '<h2 class="epa-cc-title">' + esc(T.bTitle) + '</h2>' +
          '<p class="epa-cc-text">' + esc(T.bBody) + ' <a href="' + esc(pv) + '">' + esc(T.more) + '</a>.</p>' +
        '</div>' +
        '<div class="epa-cc-actions">' +
          '<button type="button" class="epa-cc-btn epa-cc-btn-ghost" data-act="settings">' + esc(T.settings) + '</button>' +
          '<button type="button" class="epa-cc-btn epa-cc-btn-secondary" data-act="necessary">' + esc(T.onlyNecessary) + '</button>' +
          '<button type="button" class="epa-cc-btn epa-cc-btn-primary" data-act="all">' + esc(T.acceptAll) + '</button>' +
        '</div>' +
      '</div>'
    );

    var rows = CATEGORIES.map(function (c) {
      var meta = T.cats[c];
      var locked = c === 'necessary';
      return '' +
        '<div class="epa-cc-cat">' +
          '<div class="epa-cc-cat-head">' +
            '<span class="epa-cc-cat-name">' + esc(meta.name) + '</span>' +
            (locked
              ? '<span class="epa-cc-always">' + esc(T.alwaysOn) + '</span>'
              : '<label class="epa-cc-switch"><input type="checkbox" data-cat="' + c + '"><span class="epa-cc-slider"></span></label>') +
          '</div>' +
          '<p class="epa-cc-cat-desc">' + esc(meta.desc) + '</p>' +
        '</div>';
    }).join('');

    modal = el(
      '<div class="epa-cc-modal-wrap" role="dialog" aria-modal="true" aria-labelledby="epa-cc-mtitle" hidden>' +
        '<div class="epa-cc-backdrop" data-act="close-modal"></div>' +
        '<div class="epa-cc-modal">' +
          '<div class="epa-cc-modal-head">' +
            '<h2 id="epa-cc-mtitle" class="epa-cc-title">' + esc(T.mTitle) + '</h2>' +
            '<button type="button" class="epa-cc-x" data-act="close-modal" aria-label="' + esc(T.close) + '">&times;</button>' +
          '</div>' +
          '<p class="epa-cc-text epa-cc-modal-intro">' + esc(T.mIntro) + ' <a href="' + esc(pv) + '">' + esc(T.more) + '</a>.</p>' +
          '<div class="epa-cc-cats">' + rows + '</div>' +
          '<div class="epa-cc-actions epa-cc-modal-actions">' +
            '<button type="button" class="epa-cc-btn epa-cc-btn-ghost" data-act="necessary">' + esc(T.onlyNecessary) + '</button>' +
            '<button type="button" class="epa-cc-btn epa-cc-btn-secondary" data-act="save">' + esc(T.saveSelection) + '</button>' +
            '<button type="button" class="epa-cc-btn epa-cc-btn-primary" data-act="all">' + esc(T.acceptAll) + '</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );

    root.appendChild(banner);
    root.appendChild(modal);
    document.body.appendChild(root);

    root.addEventListener('click', onAction);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !modal.hidden) closeModal();
    });
  }

  function onAction(e) {
    var btn = e.target.closest('[data-act]');
    if (!btn) return;
    var act = btn.getAttribute('data-act');
    if (act === 'settings') { openModal(); }
    else if (act === 'close-modal') { closeModal(); }
    else if (act === 'all') { saveAndClose({ statistics: true, marketing: true }); }
    else if (act === 'necessary') { saveAndClose({ statistics: false, marketing: false }); }
    else if (act === 'save') {
      var prefs = {};
      modal.querySelectorAll('input[data-cat]').forEach(function (i) { prefs[i.getAttribute('data-cat')] = i.checked; });
      saveAndClose(prefs);
    }
  }

  function syncToggles() {
    var prefs = currentPrefs();
    modal.querySelectorAll('input[data-cat]').forEach(function (i) {
      i.checked = !!prefs[i.getAttribute('data-cat')];
    });
  }

  function showBanner() { buildUI(); banner.classList.add('show'); }
  function hideBanner() { if (banner) banner.classList.remove('show'); }

  function openModal() {
    buildUI();
    syncToggles();
    lastFocus = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('epa-cc-lock');
    var f = modal.querySelector('.epa-cc-x'); if (f) f.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('epa-cc-lock');
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    // Falls noch keine Entscheidung vorliegt: Banner bleibt sichtbar
    if (!readStore()) showBanner();
  }
  function saveAndClose(prefs) {
    var saved = writeStore(prefs);
    apply(saved.categories);
    if (modal) { modal.hidden = true; document.body.classList.remove('epa-cc-lock'); }
    hideBanner();
  }

  /* --- Reopen-Link im Footer automatisch einfügen ------------------------ */
  function injectFooterLink() {
    if (document.querySelector('[data-cookie-settings]')) return; // schon vorhanden
    var bottoms = document.querySelectorAll('.footer-bottom');
    if (!bottoms.length) return;
    var host = bottoms[0];
    var wrap = document.createElement('div');
    var a = document.createElement('a');
    a.href = '#';
    a.textContent = T.reopen;
    a.setAttribute('data-cookie-settings', '');
    a.style.color = 'inherit';
    a.style.textDecoration = 'underline';
    wrap.appendChild(a);
    host.appendChild(wrap);
  }

  function bindReopen() {
    document.addEventListener('click', function (e) {
      var t = e.target.closest('[data-cookie-settings], a[href="#cookie-einstellungen"], a[href="#cookie-settings"]');
      if (t) { e.preventDefault(); openModal(); }
    });
  }

  /* --- Öffentliche API --------------------------------------------------- */
  window.EPAConsent = {
    get: function () { return readStore(); },
    accepted: function (cat) { return !!currentPrefs()[cat]; },
    acceptAll: function () { saveAndClose({ statistics: true, marketing: true }); },
    rejectAll: function () { saveAndClose({ statistics: false, marketing: false }); },
    save: function (prefs) { saveAndClose(prefs || {}); },
    open: openModal,
    onChange: function (cb) { if (typeof cb === 'function') { changeCbs.push(cb); var s = readStore(); if (s) { try { cb(s.categories); } catch (e) {} } } }
  };

  /* --- Init -------------------------------------------------------------- */
  function init() {
    // Legacy-Banner der alten Version entfernen (auf allen Seiten)
    var legacy = document.getElementById('cookieBanner');
    if (legacy) legacy.remove();

    buildUI();
    injectFooterLink();
    bindReopen();

    var stored = readStore();
    if (stored) {
      apply(stored.categories);      // bereits entschieden → Dienste ggf. laden
    } else {
      apply(currentPrefs());          // nur "necessary"; Embeds bekommen Platzhalter
      setTimeout(showBanner, 600);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
