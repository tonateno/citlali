/* Citlali International School · comportamiento del sitio (parallax, revelado, formulario emergente, imágenes pendientes) */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var cfg = window.CITLALI_CONFIG || {};
  root.classList.add('js');
  if (cfg.hideMarkers) root.classList.add('hide-markers');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tienda apagada: config.js -> boutique: false ---------- */
  if (cfg.boutique === false && /uniformes\.html$/.test(location.pathname)) { location.replace('index.html'); }

  /* ---------- Eventos con caducidad: <section data-event="halloween" data-until="2026-10-30"> ----------
     Se muestran solo hasta el día indicado (inclusive). En config.js se puede cambiar la fecha (eventUntil) o apagarlos antes (eventsOff). */
  (function () {
    var n = new Date(), pad = function (x) { return (x < 10 ? '0' : '') + x; };
    var today = n.getFullYear() + '-' + pad(n.getMonth() + 1) + '-' + pad(n.getDate());
    var off = cfg.eventsOff || [], until = cfg.eventUntil || {};
    [].forEach.call(d.querySelectorAll('[data-event]'), function (el) {
      var name = el.getAttribute('data-event'), end = until[name] || el.getAttribute('data-until') || '';
      var live = off.indexOf(name) < 0 && (!end || today <= end);
      if (el.hasAttribute('data-off')) live = live && (cfg.eventsOn || []).indexOf(name) >= 0; /* eventos apagados por defecto: solo con eventsOn */
      var dt = ((cfg.eventDates || {})[name] || {})[d.documentElement.lang || 'fr'];
      [].forEach.call(el.querySelectorAll('[data-event-dates]'), function (x) { if (dt) x.textContent = dt; else x.style.display = 'none'; });
      if (live) el.classList.add('on');
    });
    /* si el enlace de la URL apuntaba a un evento caducado, no hace nada especial */
  })();

  /* ---------- Imágenes de reemplazo: si existe img/slots/<codigo>.(webp|png|jpg) se usa automáticamente ---------- */
  [].forEach.call(d.querySelectorAll('[data-slot]'), function (box) {
    var exts = ['webp', 'png', 'jpg', 'jpeg'], i = 0, base = (box.getAttribute('data-base') || '../img/slots/') + box.getAttribute('data-slot');
    (function next() {
      if (i >= exts.length) return;
      var im = new Image();
      im.onload = function () {
        var el = d.createElement('img');
        el.className = 'slot-img'; el.src = im.src; el.alt = box.getAttribute('data-alt') || '';
        box.insertBefore(el, box.firstChild); box.classList.add('has-img');
      };
      im.onerror = function () { i++; next(); };
      im.src = base + '.' + exts[i];
    })();
  });

  /* ---------- Aparición suave ---------- */
  var rv = [].slice.call(d.querySelectorAll('.rv'));
  if (reduce || !('IntersectionObserver' in window)) {
    rv.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    rv.forEach(function (el, i) { el.style.transitionDelay = ((i % 3) * 80) + 'ms'; io.observe(el); });
  }

  /* ---------- Parallax: data-px="0.08" (positivo = más rápido que el scroll, negativo = más lento) ---------- */
  var px = [].slice.call(d.querySelectorAll('[data-px],[data-pxi]'));
  if (!reduce && px.length) {
    var ticking = false;
    var update = function () {
      ticking = false;
      var vh = window.innerHeight, small = window.innerWidth < 720;
      px.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -150 || r.top > vh + 150) return;
        var s = parseFloat(el.getAttribute('data-px') || el.getAttribute('data-pxi')) || 0;
        var max = parseFloat(el.getAttribute('data-px-max')) || (el.hasAttribute('data-pxi') ? 26 : 40);
        if (small) { s *= 0.55; max *= 0.7; }
        var off = (r.top + r.height / 2) - vh / 2;
        var v = Math.max(-max, Math.min(max, off * s));
        el.style.setProperty('--py', v.toFixed(1) + 'px');
      });
    };
    var req = function () { if (!ticking) { ticking = true; window.requestAnimationFrame(update); } };
    window.addEventListener('scroll', req, { passive: true });
    window.addEventListener('resize', req);
    update();
  }


  /* ---------- Menú flotante: aparece cuando la barra de navegación sale de la pantalla ---------- */
  var fm = d.querySelector('.fm'), hdr = d.querySelector('header');
  if (fm && hdr) {
    var fmd = fm.querySelector('details');
    var setOut = function (out) { root.classList.toggle('hdr-out', out); if (!out && fmd) fmd.open = false; };
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { setOut(!es[0].isIntersecting); }, { threshold: 0 }).observe(hdr);
    } else {
      window.addEventListener('scroll', function () { setOut(hdr.getBoundingClientRect().bottom < 0); }, { passive: true });
    }
    d.addEventListener('click', function (e) { if (fmd && fmd.open && !fm.contains(e.target)) fmd.open = false; });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fmd && fmd.open) { fmd.open = false; fmd.querySelector('summary').focus(); } });
    [].forEach.call(fm.querySelectorAll('.fm-p a[data-open-visit]'), function (a) { a.addEventListener('click', function () { fmd.open = false; }); });
  }

  /* ---------- Formularios (visita emergente y contacto) ---------- */
  function say(form, text, kind) {
    var box = form.querySelector('[data-status]');
    if (!box) return;
    box.textContent = text; box.hidden = !text; box.setAttribute('data-kind', kind || 'ok');
  }
  function collect(form) {
    var rows = [];
    [].forEach.call(form.querySelectorAll('input,select,textarea'), function (el) {
      if (!el.name || el.name === 'website' || el.type === 'checkbox' || el.type === 'submit') return;
      var v = (el.value || '').trim(); if (!v) return;
      var l = el.closest('label'), t = l && l.querySelector('.lbl');
      rows.push(((t ? t.textContent.replace(/\s*\*\s*$/, '') : el.name)) + ' : ' + v);
    });
    return rows.join('\n');
  }
  [].forEach.call(d.querySelectorAll('form[data-form]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.elements.website && form.elements.website.value) return;   // antispam (honeypot)
      var btn = form.querySelector('[type=submit]');
      if (cfg.formEndpoint) {
        if (btn) btn.disabled = true;
        fetch(cfg.formEndpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
          .then(function (r) { if (!r.ok) throw new Error('x'); say(form, form.getAttribute('data-msg-ok'), 'ok'); form.reset(); })
          .catch(function () { say(form, form.getAttribute('data-msg-err'), 'err'); })
          .then(function () { if (btn) btn.disabled = false; });
      } else {
        var to = cfg.mailTo || 'citlaliinternationalschool@gmail.com';
        say(form, form.getAttribute('data-msg-mail'), 'ok');
        window.location.href = 'mailto:' + to + '?subject=' + encodeURIComponent(form.getAttribute('data-subject') || 'Citlali') + '&body=' + encodeURIComponent(collect(form));
      }
    });
  });

  /* ---------- Ventana emergente «Demander une visite» ---------- */
  var dlg = d.getElementById('visit-dialog');
  if (dlg && typeof dlg.showModal === 'function') {
    var opener = null;
    var open = function (e) {
      e.preventDefault(); opener = e.currentTarget;
      var f = dlg.querySelector('form'); say(f, '', 'ok');
      if (!dlg.open) dlg.showModal();
      var first = dlg.querySelector('input,select,textarea'); if (first) first.focus();
    };
    [].forEach.call(d.querySelectorAll('[data-open-visit]'), function (a) { a.addEventListener('click', open); });
    [].forEach.call(dlg.querySelectorAll('[data-close]'), function (b) { b.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // clic en el fondo
    dlg.addEventListener('close', function () { if (opener && opener.focus) opener.focus(); });
    if (window.location.hash === '#visite') { var b = d.querySelector('[data-open-visit]'); if (b) b.click(); }
  }
})();

/* recordar el idioma elegido (para la redirección de la raíz) */
(function () {
  [].forEach.call(document.querySelectorAll('.lang a[hreflang]'), function (a) {
    a.addEventListener('click', function () { try { localStorage.setItem('citlali-lang', a.getAttribute('hreflang')); } catch (e) {} });
  });
})();
