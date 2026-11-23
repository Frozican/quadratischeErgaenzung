/* VORLAGE für eine neue Übung (wird nicht geladen, solange sie nicht in index.html steht).

   So ergänzt du einen neuen Reiter:
   1. Diese Datei kopieren, z. B. nach tabs/scheitelpunktform-ablesen.js
   2. id und title unten ändern (id: nur a-z, 0-9 und Bindestriche)
   3. In index.html eine Zeile ergänzen, unter den vorhandenen Übungen:
        <script src="tabs/scheitelpunktform-ablesen.js"></script>
      Die Reihenfolge der Zeilen bestimmt die Reihenfolge der Reiter.
      (Oder mit order: 10, 20, 30 ... festlegen.)

   Was mount() bekommt:
     root          das leere Panel dieses Reiters (DOM-Element)
     ctx.store     store.get(key, fallback) / store.set(key, wert) speichert pro Übung im Browser
     ctx.h         DOM-Helfer: h('div', {class: 'x', onClick: fn, html: '<b>fett</b>'}, kinder...)
     ctx.math      Brüche, Eingabe-Parser, Term-Ausgabe (siehe core/math.js)
     ctx.util      rand(a, b) und pick(liste)

   Tipps:
     - Eigene CSS-Klassen mit eigenem Präfix versehen (hier .vl-), dann gibt es keine Konflikte.
     - Farben nur über die Variablen aus index.html (var(--accent), var(--ok), var(--bad) ...),
       dann funktionieren Hell- und Dunkelmodus automatisch.
     - Wiederverwendbar: Klassen .btn, .btn.primary, .linkbtn aus css/app.css.
*/
(function () {
  'use strict';
  const L = window.Lernseite;

  L.registerTab({
    id: 'vorlage',
    title: 'Vorlage',
    order: 99,
    css: `
      .vl-box { padding: 1rem; background: var(--surface-2); border-radius: 12px; }
    `,
    mount(root, { store, h, math, util }) {
      const M = math;
      let richtig = store.get('richtig', 0);

      const out = h('p', null, 'Richtig bisher: ' + richtig);
      const btn = h('button', { class: 'btn primary', type: 'button', onClick: () => {
        richtig++; store.set('richtig', richtig); out.textContent = 'Richtig bisher: ' + richtig;
      } }, 'Zähler erhöhen');

      root.append(h('div', { class: 'vl-box' }, out, btn));
    },
  });
})();
