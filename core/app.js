/* Tab-System. Jede Übung meldet sich mit Lernseite.registerTab({...}) an (siehe tabs/_vorlage.js). */
(function () {
  'use strict';
  const L = (window.Lernseite = window.Lernseite || {});
  const tabs = [];

  /* Kleiner DOM-Helfer: h('div', {class: 'x', onClick: fn, html: '<b>..</b>'}, kind1, kind2) */
  function h(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => {
        const v = attrs[k];
        if (v == null || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2).toLowerCase(), v);
        else if (v === true) el.setAttribute(k, '');
        else el.setAttribute(k, v);
      });
    }
    for (let i = 2; i < arguments.length; i++) {
      [].concat(arguments[i]).forEach(kid => {
        if (kid == null || kid === false) return;
        el.append(kid.nodeType ? kid : document.createTextNode(kid));
      });
    }
    return el;
  }
  L.h = h;

  /* Speicher pro Übung. Liegt nur im Browser der Schülerin bzw. des Schülers. */
  function makeStore(tabId) {
    const prefix = 'parabelwerkstatt:' + tabId + ':';
    return {
      get(key, fallback) {
        try {
          const raw = localStorage.getItem(prefix + key);
          return raw === null ? fallback : JSON.parse(raw);
        } catch (e) { return fallback; }
      },
      set(key, value) {
        try { localStorage.setItem(prefix + key, JSON.stringify(value)); } catch (e) { /* ohne Speicher weiterarbeiten */ }
      },
    };
  }

  L.registerTab = function (def) {
    if (!def || !/^[a-z0-9-]+$/.test(def.id || '')) throw new Error('Tab braucht eine id aus a-z, 0-9 und Bindestrichen.');
    if (typeof def.title !== 'string' || typeof def.mount !== 'function') throw new Error('Tab "' + def.id + '" braucht title und mount().');
    if (tabs.some(t => t.id === def.id)) throw new Error('Tab-id "' + def.id + '" gibt es schon.');
    tabs.push(def);
  };

  L.start = function () {
    const nav = document.getElementById('tabs');
    const stage = document.getElementById('stage');
    const entries = new Map();
    let current = null;

    const sorted = tabs
      .map((def, i) => ({ def, i }))
      .sort((a, b) => ((a.def.order == null ? 100 : a.def.order) - (b.def.order == null ? 100 : b.def.order)) || a.i - b.i)
      .map(x => x.def);

    if (!sorted.length) {
      stage.append(h('p', null, 'Noch keine Übungen eingebunden.'));
      return;
    }

    sorted.forEach(def => {
      if (def.css) document.head.append(h('style', null, def.css));
      const btn = h('button', {
        class: 'tab', type: 'button', role: 'tab', id: 'tab-' + def.id,
        'aria-controls': 'panel-' + def.id, 'aria-selected': 'false', tabindex: '-1',
        onClick: () => go(def.id),
      }, def.title);
      const panel = h('section', {
        class: 'panel', role: 'tabpanel', id: 'panel-' + def.id,
        'aria-labelledby': 'tab-' + def.id, hidden: true,
      });
      nav.append(btn);
      stage.append(panel);
      entries.set(def.id, { def, btn, panel, mounted: false });
    });

    function activate(id) {
      const next = entries.get(id);
      if (!next) return;
      entries.forEach(en => {
        const on = en === next;
        en.btn.setAttribute('aria-selected', String(on));
        en.btn.tabIndex = on ? 0 : -1;
        en.panel.hidden = !on;
      });
      current = id;
      if (!next.mounted) {
        next.mounted = true; /* Übungen werden erst beim ersten Öffnen aufgebaut */
        try {
          next.def.mount(next.panel, { store: makeStore(id), h, math: L.math, util: L.util });
        } catch (err) {
          console.error(err);
          next.panel.append(h('p', { class: 'err' }, 'Diese Übung konnte nicht geladen werden.'));
        }
      } else if (typeof next.def.onShow === 'function') {
        try { next.def.onShow(next.panel); } catch (err) { console.error(err); }
      }
    }

    function go(id) {
      activate(id);
      try { if (location.hash.slice(1) !== id) location.hash = id; } catch (e) { /* Adresszeile nicht nötig */ }
    }

    nav.addEventListener('keydown', ev => {
      const ids = sorted.map(d => d.id);
      const i = ids.indexOf(current);
      let to = null;
      if (ev.key === 'ArrowRight') to = ids[(i + 1) % ids.length];
      else if (ev.key === 'ArrowLeft') to = ids[(i - 1 + ids.length) % ids.length];
      else if (ev.key === 'Home') to = ids[0];
      else if (ev.key === 'End') to = ids[ids.length - 1];
      if (to) { ev.preventDefault(); go(to); entries.get(to).btn.focus(); }
    });

    window.addEventListener('hashchange', () => {
      const id = location.hash.slice(1);
      if (entries.has(id) && id !== current) activate(id);
    });

    const fromHash = location.hash.slice(1);
    activate(entries.has(fromHash) ? fromHash : sorted[0].id);
  };
})();
