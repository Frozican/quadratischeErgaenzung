/* Übung 1: Quadratische Ergänzung (Normalform -> Scheitelpunktform)
   Stufe 1: a = 1, b gerade      Stufe 2: a = 1, b ungerade (Brüche)
   Stufe 3: a ≠ 1 (ausklammern)  Mix: zufällig aus allen drei */
(function () {
  'use strict';
  const L = window.Lernseite;
  const M = L.math;
  const h = L.h;
  const { Q, add, sub, mul, div, neg, eq, ONE, MINUS, X, numHTML, absHTML, polyHTML, aPrefix, vertexHTML } = M;
  const { rand, pick } = L.util;

  const GOAL = 5; /* so viele Aufgaben in Folge für „Stufe geschafft“ */
  const LEVELS = {
    '1': { name: 'Stufe 1', desc: 'a = 1, b gerade' },
    '2': { name: 'Stufe 2', desc: 'a = 1, b ungerade' },
    '3': { name: 'Stufe 3', desc: 'mit Faktor a' },
    mix: { name: 'Mix', desc: 'bunt gemischt' },
  };
  const LEVEL_IDS = ['1', '2', '3', 'mix'];

  /* ---------- kleine Bausteine für HTML ---------- */
  const V = c => '<i class="v">' + c + '</i>';
  const expr = html => '<span class="expr">' + html + '</span>';
  const sq = s => '(' + s + ')<sup>2</sup>';
  const T = (c, p, hl) => ({ c, p, hl });
  const pn = q => (q.n < 0 ? '(' + numHTML(q) + ')' : numHTML(q));
  const plain = q => (q.n < 0 ? MINUS : '') + Math.abs(q.n) + (q.d === 1 ? '' : '/' + q.d);
  const vertexS = t => 'S(' + numHTML(neg(t.d)) + ' | ' + numHTML(t.e) + ')';
  const fx = 'f(' + X + ')';
  const nonzero = (lo, hi) => { let v; do { v = rand(lo, hi); } while (v === 0); return v; };

  /* ---------- Aufgaben ---------- */
  function buildTask(level) {
    let a = ONE, b, c;
    if (level === '1') {
      const d = nonzero(-7, 7), e = nonzero(-9, 9);
      b = Q(2 * d); c = Q(d * d + e);
      if (c.n === 0) return buildTask(level);
    } else if (level === '2') {
      b = Q(pick([1, 3, 5, 7, 9, 11]) * pick([1, -1]));
      c = Q(nonzero(-6, 8));
    } else {
      a = Q(pick([2, 3, 4, 5, -1, -2, -3]));
      const d = nonzero(-5, 5), e = nonzero(-8, 8);
      b = mul(mul(Q(2), a), Q(d));
      c = add(mul(a, Q(d * d)), Q(e));
    }
    const d = div(b, mul(Q(2), a));                 /* d = b / (2a) */
    const e = sub(c, mul(a, mul(d, d)));            /* e = c - a d² */
    return { level, a, b, c, d, e, key: [a.n, a.d, b.n, b.d, c.n, c.d].join('/') };
  }
  function makeTask(level, last) {
    let t, tries = 0;
    do {
      t = buildTask(level === 'mix' ? pick(['1', '2', '3']) : level);
      tries++;
    } while (last && t.key === last.key && tries < 20);
    return t;
  }
  const givenHTML = t => expr(fx + ' = ' + polyHTML([T(t.a, 2), T(t.b, 1), T(t.c, 0)]));

  /* ---------- Prüfen mit gezielten Rückmeldungen ---------- */
  function evaluate(t, v) {
    const lvl3 = t.level === '3';
    const ok = { a: lvl3 ? eq(v.a, t.a) : true, d: eq(v.d, t.d), e: eq(v.e, t.e) };
    const msgs = [];
    const p = div(t.b, t.a);
    const ad2 = mul(t.a, mul(t.d, t.d));

    if (!ok.a) {
      msgs.push(eq(v.a, ONE)
        ? 'Bei dieser Aufgabe steht vor der Klammer der Faktor von ' + X + '². Den klammerst du zuerst aus.'
        : V('a') + ' stimmt noch nicht. ' + V('a') + ' ist der Faktor vor ' + X + '².');
    }
    if (!ok.d) {
      if (eq(v.d, neg(t.d))) {
        msgs.push(V('d') + ' hat das falsche Vorzeichen. Die Form ist (' + X + ' + ' + V('d') + ')²: Steht in der Klammer ' + X + ' ' + MINUS + ' 3, dann ist ' + V('d') + ' = ' + MINUS + '3.');
      } else if (!eq(p, t.d) && eq(v.d, p)) {
        msgs.push('Du musst ' + V('b') + ' noch halbieren. ' + V('d') + ' ist die Hälfte der Zahl vor dem ' + X + (lvl3 ? ' (nach dem Ausklammern von ' + V('a') + ').' : '.'));
      } else if (lvl3 && eq(v.d, div(t.b, Q(2)))) {
        msgs.push('Klammere zuerst ' + V('a') + ' aus. Erst danach halbierst du die Zahl vor dem ' + X + '.');
      } else {
        msgs.push(V('d') + ' stimmt noch nicht. ' + V('d') + ' ist die Hälfte der Zahl vor dem ' + X + (lvl3 ? ', nachdem du ' + V('a') + ' ausgeklammert hast.' : '.'));
      }
    }
    if (!ok.e) {
      if (!ok.d) {
        msgs.push(V('e') + ' hängt von ' + V('d') + ' ab. Korrigiere zuerst ' + V('d') + '.');
      } else {
        const rule = V('e') + ' = ' + V('c') + ' ' + MINUS + ' ' + (lvl3 ? V('a') + '·' : '') + V('d') + '²';
        if (eq(v.e, t.c)) msgs.push('Du musst die Ergänzung noch abziehen: ' + rule + '.');
        else if (eq(v.e, add(t.c, ad2))) msgs.push('Die Ergänzung wird abgezogen, nicht addiert: ' + rule + '.');
        else if (lvl3 && eq(v.e, sub(div(t.c, t.a), mul(t.d, t.d)))) msgs.push('Der Rest in der Klammer muss noch mit ' + V('a') + ' multipliziert werden.');
        else if (eq(v.e, neg(t.e))) msgs.push('Prüfe das Vorzeichen von ' + V('e') + '.');
        else msgs.push(V('e') + ' stimmt noch nicht. Rechne: ' + rule + '.');
      }
    }
    return { ok, msgs, all: ok.a && ok.d && ok.e };
  }

  /* Stufe 3, Schritt 1: a ausklammern -> a(x² + p·x + q) */
  function evalAus(t, v) {
    const p = div(t.b, t.a), q = div(t.c, t.a);
    const ok = { a: eq(v.a, t.a), p: eq(v.p, p), q: eq(v.q, q) };
    const msgs = [];
    if (!ok.a) msgs.push(V('a') + ' ist der Faktor vor ' + X + '². Den klammerst du aus.');
    if (!ok.p) msgs.push(eq(v.p, t.b)
      ? 'Beim Ausklammern teilst du auch ' + V('b') + ' durch ' + V('a') + '.'
      : V('p') + ' stimmt noch nicht. Rechne ' + V('p') + ' = ' + V('b') + ' : ' + V('a') + '.');
    if (!ok.q) msgs.push(eq(v.q, t.c)
      ? 'Auch die Zahl ohne ' + X + ' wird durch ' + V('a') + ' geteilt.'
      : V('q') + ' stimmt noch nicht. Rechne ' + V('q') + ' = ' + V('c') + ' : ' + V('a') + '.');
    return { ok, msgs, all: ok.a && ok.p && ok.q };
  }

  /* Zwischenschritt: x² + bx + [d²] − [d²] + c  (beide Felder = Quadrat der Hälfte von b) */
  function evalErg(t, v) {
    const d2 = mul(t.d, t.d), p = div(t.b, t.a);
    const ok = { u: eq(v.u, d2), w: eq(v.w, d2) };
    const msgs = [];
    if (!(ok.u && ok.w)) {
      const guess = ok.u ? v.w : v.u;
      if (eq(guess, t.d)) msgs.push('Du hast die Zahl vor dem ' + X + ' nur halbiert. Die Ergänzung ist das Quadrat dieser Hälfte.');
      else if (eq(guess, p)) msgs.push('Halbiere zuerst die Zahl vor dem ' + X + ' und quadriere dann.');
      else if (eq(guess, neg(d2))) msgs.push('In beiden Feldern steht dieselbe positive Zahl: Ein Quadrat ist nie negativ, das Minus steht schon davor.');
      else msgs.push('Die Ergänzung ist das Quadrat der Hälfte der Zahl vor dem ' + X + '.');
      if (!eq(v.u, v.w)) msgs.push('In beiden Feldern steht dieselbe Zahl: Was du addierst, ziehst du wieder ab.');
    }
    return { ok, msgs, all: ok.u && ok.w };
  }

  /* Eingabefelder pro Schritt -> richtiger Wert (für „Lösung zeigen“) */
  function valueOf(t, name) {
    if (name === 'u' || name === 'w') return mul(t.d, t.d);
    if (name === 'p') return div(t.b, t.a);
    if (name === 'q') return div(t.c, t.a);
    return t[name];
  }

  /* Die Schritte, in denen eine Aufgabe eingegeben wird. */
  const span = html => h('span', { html });
  const SIGN_NOTE = ' Trage die Zahlen mit Vorzeichen ein. Brüche gehen als 3/2, Dezimalzahlen als 1,5.';
  function phaseDefs(t) {
    const lvl3 = t.level === '3';
    const pre = aPrefix(t.a);                       /* bei a = 1 leer */
    const p = div(t.b, t.a), q = div(t.c, t.a);
    const defs = [];
    if (lvl3) {
      defs.push({
        head: V('a') + ' ausklammern',
        names: ['a', 'p', 'q'],
        build: f => [span(fx + ' ='), f.a, span('· (' + X + '<sup>2</sup> +'), f.p, span(X + ' +'), f.q, span(')')],
        note: 'Klammere den Faktor vor ' + X + '² aus. In der Klammer steht dann ' + X + '² + ' + V('p') + X + ' + ' + V('q') + '.' + SIGN_NOTE,
        check: evalAus,
        done: () => '<p><strong>Richtig.</strong> Jetzt ergänzt du in der Klammer.</p>',
      });
    }
    defs.push({
      head: 'Quadratische Ergänzung',
      names: ['u', 'w'],
      labels: { u: V('d') + '²', w: V('d') + '²' },
      build: f => [
        span(fx + ' = ' + pre + (lvl3 ? '(' : '') + polyHTML([T(ONE, 2), T(p, 1)]) + ' +'), f.u,
        span(MINUS), f.w,
        span(polyHTML([T(q, 0)], true) + (lvl3 ? ')' : '')),
      ],
      note: 'Addiere und subtrahiere dieselbe Zahl, die quadratische Ergänzung. Sie ist das Quadrat der Hälfte der Zahl vor dem ' + X + '.' + SIGN_NOTE,
      check: evalErg,
      done: () => '<p><strong>Richtig.</strong> Die ersten drei Summanden bilden jetzt eine binomische Formel. Schreibe die Funktion in Scheitelpunktform.</p>',
    });
    defs.push({
      head: 'Scheitelpunktform',
      names: ['d', 'e'],
      signed: true,   /* Vorzeichen wählen die SuS selbst: (x + 5)² oder (x − 5)² */
      build: f => [span(fx + ' = ' + pre + '(' + X), f.d, span(')<sup>2</sup>'), f.e],
      note: 'Zielform: ' + (lvl3 ? V('a') + ' ' : '') + '(' + X + ' ± ' + V('d') + ')<sup>2</sup> ± ' + V('e') +
        '. Wähle mit dem Knopf + oder − und trage die Zahl ohne Vorzeichen ein. Brüche gehen als 3/2, Dezimalzahlen als 1,5.',
      check: (task, v) => evaluate(task, { a: task.a, d: v.d, e: v.e }),
    });
    return defs;
  }

  /* ---------- Hinweise (3 Stufen) ---------- */
  function hintsFor(t) {
    const d2 = mul(t.d, t.d);
    const inner = polyHTML([T(ONE, 1), T(t.d, 0)]);
    if (t.level !== '3') {
      return [
        'Die Zahl vor dem ' + X + ' ist ' + V('b') + ' = ' + numHTML(t.b) + '. Die Zahl ' + V('d') + ' in der Klammer ist die Hälfte von ' + V('b') + '.',
        V('d') + ' = ' + numHTML(t.b) + ' : 2 = ' + numHTML(t.d) + '. Die quadratische Ergänzung ist ' + V('d') + '² = ' + numHTML(d2) + '. Addiere und subtrahiere sie: ' +
          expr(polyHTML([T(ONE, 2), T(t.b, 1), T(d2, 0, true), T(neg(d2), 0, true), T(t.c, 0)])),
        'Die ersten drei Summanden bilden ' + expr(sq(inner)) + '. Fasse den Rest zusammen: ' +
          expr(polyHTML([T(neg(d2), 0), T(t.c, 0)])) + ' = ' + V('e') + '.',
      ];
    }
    const p = div(t.b, t.a), q = div(t.c, t.a), r = sub(q, d2);
    const pre = aPrefix(t.a);
    return [
      'Klammere den Faktor vor ' + X + '² aus: ' + expr(pre + '(' + polyHTML([T(ONE, 2), T(p, 1), T(q, 0)]) + ')') + '. Der Faktor ' + numHTML(t.a) + ' ist dein ' + V('a') + '.',
      'Ergänze in der Klammer: ' + V('d') + ' = ' + numHTML(p) + ' : 2 = ' + numHTML(t.d) + ' und ' + V('d') + '² = ' + numHTML(d2) + '. Das ergibt ' +
        expr(pre + '(' + polyHTML([T(ONE, 2), T(p, 1), T(d2, 0, true), T(neg(d2), 0, true), T(q, 0)]) + ')'),
      'In der Klammer steht dann ' + expr(sq(inner) + polyHTML([T(r, 0)], true)) + '. Multipliziere den Rest ' + numHTML(r) + ' noch mit ' + V('a') + ': ' +
        V('e') + ' = ' + numHTML(t.a) + ' · ' + pn(r) + '.',
    ];
  }

  /* ---------- Rechenweg ---------- */
  function solutionSteps(t) {
    const d2 = mul(t.d, t.d);
    const inner = polyHTML([T(ONE, 1), T(t.d, 0)]);
    const orig = polyHTML([T(t.a, 2), T(t.b, 1), T(t.c, 0)]);
    const last = { why: 'Lies den Scheitelpunkt ab: ' + V('S') + '(' + MINUS + V('d') + ' | ' + V('e') + ') = ' + expr(vertexS(t)) + '.', lines: [] };
    if (t.level !== '3') {
      return [
        { why: 'Bestimme die quadratische Ergänzung: Die Hälfte von ' + V('b') + ' = ' + numHTML(t.b) + ' ist ' + V('d') + ' = ' + numHTML(t.d) + '. Quadriert ist das ' + V('d') + '² = ' + numHTML(d2) + '.',
          lines: [{ lhs: fx, rhs: orig }] },
        { why: 'Addiere und subtrahiere die Ergänzung. Der Funktionswert ändert sich dadurch nicht.',
          lines: [{ rhs: polyHTML([T(ONE, 2), T(t.b, 1), T(d2, 0, true), T(neg(d2), 0, true), T(t.c, 0)]) }] },
        { why: 'Die ersten drei Summanden sind eine binomische Formel.',
          lines: [{ rhs: sq(inner) + polyHTML([T(neg(d2), 0), T(t.c, 0)], true) }] },
        { why: 'Fasse die Zahlen zusammen.', lines: [{ rhs: vertexHTML(t.a, t.d, t.e) }] },
        last,
      ];
    }
    const p = div(t.b, t.a), q = div(t.c, t.a), r = sub(q, d2);
    const pre = aPrefix(t.a);
    return [
      { why: 'Klammere den Faktor vor ' + X + '² aus: ' + V('a') + ' = ' + numHTML(t.a) + '.',
        lines: [{ lhs: fx, rhs: orig }, { rhs: pre + '(' + polyHTML([T(ONE, 2), T(p, 1), T(q, 0)]) + ')' }] },
      { why: 'In der Klammer: Die Hälfte von ' + numHTML(p) + ' ist ' + V('d') + ' = ' + numHTML(t.d) + ', die Ergänzung ist ' + V('d') + '² = ' + numHTML(d2) + '. Addiere und subtrahiere sie.',
        lines: [{ rhs: pre + '(' + polyHTML([T(ONE, 2), T(p, 1), T(d2, 0, true), T(neg(d2), 0, true), T(q, 0)]) + ')' }] },
      { why: 'Wende die binomische Formel an und fasse den Rest in der Klammer zusammen.',
        lines: [{ rhs: pre + '(' + sq(inner) + polyHTML([T(neg(d2), 0), T(q, 0)], true) + ')' },
                { rhs: pre + '(' + sq(inner) + polyHTML([T(r, 0)], true) + ')' }] },
      { why: 'Multipliziere den Faktor ' + numHTML(t.a) + ' mit dem Rest ' + numHTML(r) + ': ' + V('e') + ' = ' + numHTML(t.a) + ' · ' + pn(r) + ' = ' + numHTML(t.e) + '.',
        lines: [{ rhs: vertexHTML(t.a, t.d, t.e) }] },
      last,
    ];
  }

  /* ---------- kleine Parabel-Skizze ---------- */
  function plotSVG(t) {
    const a = M.toNumber(t.a), d = M.toNumber(t.d), e = M.toNumber(t.e);
    const vx = -d, W = 260, H = 176, px = 14, py = 28;
    const span = Math.min(4.5, Math.sqrt(18 / Math.abs(a)));
    const x0 = vx - span, x1 = vx + span;
    const f = x => a * (x + d) * (x + d) + e;
    const pts = [];
    for (let i = 0; i <= 60; i++) { const x = x0 + (x1 - x0) * i / 60; pts.push([x, f(x)]); }
    let ymin = Math.min.apply(null, pts.map(q => q[1])), ymax = Math.max.apply(null, pts.map(q => q[1]));
    const pad = (ymax - ymin) * 0.06; ymin -= pad; ymax += pad;
    const sx = x => px + (x - x0) / (x1 - x0) * (W - 2 * px);
    const sy = y => H - py - (y - ymin) / (ymax - ymin) * (H - 2 * py);
    let axes = '';
    if (ymin <= 0 && ymax >= 0) {
      axes += '<line class="plot-axis" x1="' + px + '" x2="' + (W - px) + '" y1="' + sy(0).toFixed(1) + '" y2="' + sy(0).toFixed(1) + '"/>' +
              '<text class="plot-lbl" x="' + (W - px - 8) + '" y="' + (sy(0) - 5).toFixed(1) + '">x</text>';
    }
    if (x0 <= 0 && x1 >= 0) {
      axes += '<line class="plot-axis" x1="' + sx(0).toFixed(1) + '" x2="' + sx(0).toFixed(1) + '" y1="' + (py - 10) + '" y2="' + (H - py + 10) + '"/>' +
              '<text class="plot-lbl" x="' + (sx(0) + 5).toFixed(1) + '" y="' + (py - 12) + '">y</text>';
    }
    const poly = pts.map(q => sx(q[0]).toFixed(1) + ',' + sy(q[1]).toFixed(1)).join(' ');
    const cx = sx(vx), cy = sy(e);
    const ly = a > 0 ? cy + 22 : cy - 12;
    return '<svg class="plot" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Skizze der Parabel mit Scheitelpunkt S">' +
      axes +
      '<polyline class="plot-curve" points="' + poly + '"/>' +
      '<circle class="plot-vertex" cx="' + cx.toFixed(1) + '" cy="' + cy.toFixed(1) + '" r="4.5"/>' +
      '<text class="plot-lbl" text-anchor="middle" x="' + cx.toFixed(1) + '" y="' + ly.toFixed(1) + '">S</text>' +
      '</svg>';
  }

  /* ---------- Gestaltung dieser Übung ---------- */
  const CSS = `
.qe { display: flex; flex-direction: column; gap: 1.25rem; }
.qe-intro { margin: 0; color: var(--muted); max-width: 62ch; }
.qe-levels { display: grid; grid-template-columns: repeat(auto-fit, minmax(135px, 1fr)); gap: 8px; }
.qe-lv {
  appearance: none; display: flex; flex-direction: column; align-items: flex-start; gap: .2rem;
  padding: .6rem .8rem; border: 2px solid var(--line); border-radius: 10px;
  background: var(--surface); color: var(--ink); font: 500 .95rem var(--font-body);
  text-align: left; cursor: pointer;
}
.qe-lv:hover { border-color: var(--accent); }
.qe-lv[aria-pressed="true"] { border-color: var(--accent); background: var(--surface-2); }
.qe-lv-name { font-weight: 600; }
.qe-done { color: var(--ok); }
.qe-lv small { color: var(--muted); font-size: .8rem; }
.qe-dots { display: inline-flex; gap: 4px; margin-top: .15rem; }
.qe-dots span { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--line); }
.qe-dots span.on { background: var(--accent); border-color: var(--accent); }

.qe-task { background: var(--surface-2); border-radius: 12px; padding: 1rem 1.2rem; min-width: 0; }
.qe-label { margin: 0 0 .3rem; font: 600 .72rem var(--font-body); letter-spacing: .1em; text-transform: uppercase; color: var(--muted); }
.qe-given { font-size: 1.7rem; overflow-x: auto; padding-bottom: .15rem; }

.qe-form { display: flex; flex-direction: column; gap: .75rem; min-width: 0; }
.qe-answer { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .5rem .45rem; font: 400 1.6rem/1 var(--font-math); padding-top: .2rem; }
.qe-answer > span { padding-top: .35rem; white-space: nowrap; }
.qe-phases { display: flex; flex-direction: column; gap: 1.1rem; }
.qe-stephead { margin: 0; font: 600 .75rem var(--font-body); letter-spacing: .08em; text-transform: uppercase; color: var(--muted); }
.qe-sf { display: inline-flex; align-items: stretch; gap: 4px; }
.qe-sign {
  appearance: none; min-width: 2.5rem; padding: 0 .3rem;
  font: 600 1.5rem var(--font-math); color: var(--muted);
  background: var(--surface); border: 2px solid var(--line); border-radius: 8px; cursor: pointer;
}
.qe-sign:hover:not(:disabled) { border-color: var(--accent); }
.qe-sign.ok { border-color: var(--ok); background: var(--ok-bg); color: var(--ink); }
.qe-sign.bad { border-color: var(--bad); background: var(--bad-bg); color: var(--ink); }
.qe-sign:not(.ok):not(.bad):not(:disabled) { color: var(--accent); }
.qe-sign:disabled { cursor: default; color: var(--ink); }
.qe-fld { display: inline-flex; flex-direction: column; align-items: center; gap: 3px; }
.qe-fld small { font: italic 400 .95rem var(--font-math); color: var(--muted); }
.qe-in {
  width: 4.8rem; padding: .3rem .25rem; text-align: center;
  font: 400 1.5rem var(--font-math); color: var(--ink);
  background: var(--bg); border: 2px solid var(--line); border-radius: 8px;
}
.qe-in:focus { outline: none; border-color: var(--accent); box-shadow: 0 0 0 3px var(--info-bg); }
.qe-in.ok { border-color: var(--ok); background: var(--ok-bg); }
.qe-in.bad { border-color: var(--bad); background: var(--bad-bg); }
.qe-in[readonly] { cursor: default; }
.qe-note { margin: 0; font-size: .88rem; color: var(--muted); max-width: 62ch; }
.qe-actions { display: flex; flex-wrap: wrap; gap: 8px; }

.qe-hints, .qe-fb { border-radius: 10px; padding: .8rem 1rem; border-left: 5px solid var(--line); background: var(--surface-2); }
.qe-hints p, .qe-fb p { margin: 0; }
.qe-hints p + p, .qe-fb p + p { margin-top: .5rem; }
.qe-hn { font: 600 .75rem var(--font-body); letter-spacing: .08em; text-transform: uppercase; color: var(--accent); margin-right: .4rem; }
.qe-fb.ok { border-left-color: var(--ok); background: var(--ok-bg); }
.qe-fb.bad { border-left-color: var(--bad); background: var(--bad-bg); }
.qe-fb.info { border-left-color: var(--accent); background: var(--info-bg); }
.qe-fb .expr { font-size: 1.15em; }

.qe-plot { margin: 0; display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.qe-plot svg { width: 100%; max-width: 280px; height: auto; flex: none; }
.qe-plot figcaption { color: var(--muted); font-size: .9rem; max-width: 30ch; }
.plot-axis { stroke: var(--line); stroke-width: 1.2; }
.plot-curve { fill: none; stroke: var(--accent); stroke-width: 2.6; stroke-linejoin: round; stroke-linecap: round; }
.plot-vertex { fill: var(--ink); }
.plot-lbl { fill: var(--ink); font: italic 14px var(--font-math); }

.qe-sol h3 { margin: 0 0 .75rem; font: 600 1.05rem var(--font-display); }
.qe-steps { list-style: none; counter-reset: s; margin: 0; padding: 0; display: grid; gap: 1rem; }
.qe-steps > li { counter-increment: s; display: grid; grid-template-columns: 1.7rem minmax(0, 1fr); gap: .25rem .7rem; }
.qe-steps > li::before {
  content: counter(s); grid-column: 1; grid-row: 1;
  width: 1.7rem; height: 1.7rem; border-radius: 50%;
  display: grid; place-items: center;
  background: var(--accent); color: var(--accent-ink); font: 600 .85rem var(--font-body);
}
.qe-steps > li > * { grid-column: 2; }
.qe-why { margin: 0; }
.qe-eq { display: grid; grid-template-columns: 3.4rem auto; gap: 0 .35rem; font: 400 1.3rem/1.6 var(--font-math); overflow-x: auto; }
.qe-eq .rhs { white-space: nowrap; }

.qe-stats { display: flex; flex-wrap: wrap; align-items: center; gap: .4rem 1.25rem; color: var(--muted); font-size: .9rem; border-top: 1px dashed var(--line); padding-top: .9rem; }
.qe-stats .linkbtn { margin-left: auto; }

@media (max-width: 480px) {
  .qe-answer { font-size: 1.35rem; }
  .qe-in { width: 4.2rem; font-size: 1.3rem; }
  .qe-given { font-size: 1.4rem; }
}
`;

  /* ---------- Oberfläche ---------- */
  L.registerTab({
    id: 'quadratische-ergaenzung',
    title: 'Quadratische Ergänzung',
    order: 10,
    css: CSS,
    logic: { makeTask, evaluate, evalAus, evalErg, valueOf, phaseDefs, hintsFor, solutionSteps, plotSVG, givenHTML },

    mount(root, ctx) {
      const store = ctx.store;
      let level = store.get('level', '1');
      if (!LEVELS[level]) level = '1';
      let stats = store.get('stats', {});
      let task = null, status = 'open', attempts = 0, hintStage = 0, hintList = [], fields = [], defs = [], phase = 0;
      let resetArmed = false, resetTimer = null;

      const statOf = id => Object.assign({ richtig: 0, gesamt: 0, serie: 0, geschafft: false }, stats[id]);

      const levelsBox = h('div', { class: 'qe-levels', role: 'group', 'aria-label': 'Schwierigkeitsstufe' });
      const givenBox = h('div', { class: 'qe-given' });
      const phasesBox = h('div', { class: 'qe-phases' });
      const note = h('p', { class: 'qe-note' });
      const btnMain = h('button', { class: 'btn primary', type: 'submit' }, 'Prüfen');
      const btnHint = h('button', { class: 'btn', type: 'button', onClick: onHint }, 'Hinweis');
      const btnSol = h('button', { class: 'btn', type: 'button', onClick: onSolution }, 'Lösung zeigen');
      const form = h('form', { class: 'qe-form', novalidate: true, onSubmit: onSubmit },
        phasesBox, note, h('div', { class: 'qe-actions' }, btnMain, btnHint, btnSol));
      const hintsBox = h('div', { class: 'qe-hints', hidden: true });
      const fb = h('div', { class: 'qe-fb', hidden: true, 'aria-live': 'polite' });
      const afterBox = h('div', { hidden: true });
      const stepsBox = h('div', { class: 'qe-sol', hidden: true });
      const statsBox = h('div', { class: 'qe-stats' });

      root.classList.add('qe');
      root.append(
        h('p', { class: 'qe-intro' }, 'Forme die Funktionsterme mit der quadratischen Ergänzung in Scheitelpunktform um. ' +
          GOAL + ' Aufgaben in Folge richtig, dann ist die Stufe geschafft.'),
        levelsBox,
        h('div', { class: 'qe-task' }, h('p', { class: 'qe-label' }, 'Aufgabe'), givenBox),
        form, hintsBox, fb, afterBox, stepsBox, statsBox
      );

      /* --- Stufen und Fortschritt --- */
      function renderLevels() {
        levelsBox.replaceChildren.apply(levelsBox, LEVEL_IDS.map(id => {
          const s = statOf(id), lv = LEVELS[id];
          const dots = id === 'mix' ? null : h('span', { class: 'qe-dots', 'aria-hidden': 'true' },
            Array.from({ length: GOAL }, (_, i) => h('span', { class: i < Math.min(s.serie, GOAL) ? 'on' : '' })));
          const label = lv.name + ', ' + lv.desc + (id === 'mix' ? '' :
            ', Serie ' + s.serie + ' von ' + GOAL + (s.geschafft ? ', geschafft' : ''));
          return h('button', { class: 'qe-lv', type: 'button', 'aria-pressed': String(id === level), 'aria-label': label, onClick: () => selectLevel(id) },
            h('span', { class: 'qe-lv-name' }, lv.name, s.geschafft ? h('span', { class: 'qe-done' }, ' ✓') : null),
            h('small', null, lv.desc), dots);
        }));
      }
      function renderStats() {
        const scope = level === 'mix' ? ['1', '2', '3'] : [level];
        let r = 0, g = 0;
        scope.forEach(id => { const s = statOf(id); r += s.richtig; g += s.gesamt; });
        const resetBtn = h('button', { class: 'linkbtn', type: 'button', onClick: onReset },
          resetArmed ? 'Wirklich alles löschen? Nochmal klicken' : 'Fortschritt löschen');
        statsBox.replaceChildren(
          h('span', null, 'Gelöst: ' + r + ' von ' + g),
          level === 'mix' ? null : h('span', null, 'Serie: ' + statOf(level).serie + ' von ' + GOAL),
          resetBtn);
      }
      function onReset() {
        if (!resetArmed) {
          resetArmed = true; renderStats();
          resetTimer = setTimeout(() => { resetArmed = false; renderStats(); }, 4000);
          return;
        }
        clearTimeout(resetTimer);
        resetArmed = false; stats = {}; store.set('stats', stats);
        renderLevels(); renderStats();
      }
      function record(correct) {
        const s = statOf(task.level), was = s.geschafft;
        s.gesamt++;
        if (correct) { s.richtig++; s.serie++; if (s.serie >= GOAL) s.geschafft = true; } else s.serie = 0;
        stats[task.level] = s; store.set('stats', stats);
        renderLevels(); renderStats();
        return correct && s.geschafft && !was;
      }
      function selectLevel(id) {
        if (id === level) return;
        level = id; store.set('level', level);
        renderLevels(); renderStats(); newTask(false);
      }

      /* --- Aufgabe aufbauen --- */
      /* signed = true: Vorzeichen-Knopf (? → + → −) vor dem Zahlenfeld; im Feld steht nur die Zahl */
      function makeField(name, label, signed) {
        const input = h('input', {
          class: 'qe-in', type: 'text', inputmode: 'text', autocomplete: 'off', autocapitalize: 'off',
          spellcheck: 'false', 'aria-label': 'Eingabe ' + name,
        });
        const f = { name, input, signed: !!signed, sign: null, signBtn: null, el: null };
        input.addEventListener('input', () => clearState(f));
        const small = h('small', { html: label || V(name) });
        if (signed) {
          f.signBtn = h('button', { class: 'qe-sign', type: 'button', onClick: () => {
            setSign(f, f.sign === '+' ? '-' : '+'); clearState(f);
          } });
          setSign(f, null);
          f.el = h('div', { class: 'qe-fld' }, h('div', { class: 'qe-sf' }, f.signBtn, input), small);
        } else {
          f.el = h('label', { class: 'qe-fld' }, input, small);
        }
        return f;
      }
      function setSign(f, s) {
        f.sign = s;
        f.signBtn.textContent = s === '+' ? '+' : s === '-' ? MINUS : '?';
        f.signBtn.setAttribute('aria-label', 'Vorzeichen von ' + f.name + ': ' + (s === '+' ? 'plus' : s === '-' ? 'minus' : 'noch nicht gewählt'));
      }
      function clearState(f) {
        f.input.classList.remove('ok', 'bad');
        f.input.removeAttribute('aria-invalid');
        if (f.signBtn) f.signBtn.classList.remove('ok', 'bad');
      }
      function lockField(f) {
        f.input.readOnly = true;
        if (f.signBtn) f.signBtn.disabled = true;
      }
      /* liest ein Feld als Bruch; bei Problemen { error: 'num' | 'neg' | 'sign' } */
      function readField(f) {
        const v = M.parse(f.input.value);
        if (!v) return { error: 'num' };
        if (!f.signed) return { value: v };
        if (v.n < 0) return { error: 'neg' };
        if (!f.sign) return { error: 'sign' };
        return { value: f.sign === '-' ? neg(v) : v };
      }
      function fillField(f, q) {
        if (f.signed) { setSign(f, q.n < 0 ? '-' : '+'); f.input.value = plain(M.abs(q)); }
        else f.input.value = plain(q);
      }

      function newTask(focus) {
        task = makeTask(level, task);
        status = 'open'; attempts = 0; hintStage = 0; hintList = hintsFor(task); phase = 0;
        givenBox.innerHTML = givenHTML(task);
        defs = phaseDefs(task);
        fields = [];
        phasesBox.replaceChildren.apply(phasesBox, defs.map((def, i) => {
          def.fields = def.names.map(n => makeField(n, def.labels && def.labels[n], def.signed));
          fields = fields.concat(def.fields);
          const f = {}; def.fields.forEach(x => { f[x.name] = x.el; });
          def.row = h('div', { class: 'qe-phase', hidden: i > 0 },
            h('p', { class: 'qe-stephead', html: 'Schritt ' + (i + 1) + ' von ' + defs.length + ' · ' + def.head }),
            h('div', { class: 'qe-answer' }, def.build(f)));
          return def.row;
        }));
        note.innerHTML = defs[0].note;
        hintsBox.hidden = true; hintsBox.innerHTML = '';
        fb.hidden = true; fb.innerHTML = '';
        afterBox.hidden = true; afterBox.innerHTML = '';
        stepsBox.hidden = true; stepsBox.innerHTML = '';
        setButtons();
        if (focus) defs[0].fields[0].input.focus();
      }

      function setButtons() {
        const open = status === 'open';
        btnMain.textContent = open ? 'Prüfen' : 'Nächste Aufgabe';
        btnHint.disabled = !open || hintStage >= hintList.length;
        btnHint.textContent = hintStage === 0 || hintStage >= hintList.length ? 'Hinweis' : 'Nächster Hinweis';
        btnSol.textContent = open ? 'Lösung zeigen' : (stepsBox.hidden ? 'Rechenweg zeigen' : 'Rechenweg verbergen');
      }
      function setState(f, ok) {
        f.input.classList.toggle('ok', ok);
        f.input.classList.toggle('bad', !ok);
        if (f.signBtn) { f.signBtn.classList.toggle('ok', ok); f.signBtn.classList.toggle('bad', !ok); }
        if (ok) f.input.removeAttribute('aria-invalid'); else f.input.setAttribute('aria-invalid', 'true');
      }
      function lock() { fields.forEach(lockField); }
      function say(kind, html) { fb.className = 'qe-fb ' + kind; fb.innerHTML = html; fb.hidden = !html; }

      function showAfter() {
        afterBox.innerHTML = '<figure class="qe-plot">' + plotSVG(task) +
          '<figcaption>Die Parabel mit ihrem Scheitelpunkt S. So sieht die Funktion aus, die du umgeformt hast.</figcaption></figure>';
        afterBox.hidden = false;
      }
      function showSteps(on) {
        if (on && !stepsBox.innerHTML) {
          stepsBox.innerHTML = '<h3>Rechenweg</h3><ol class="qe-steps">' + solutionSteps(task).map(s =>
            '<li><p class="qe-why">' + s.why + '</p>' + s.lines.map(l =>
              '<div class="qe-eq"><span class="lhs">' + (l.lhs ? expr(l.lhs) : '') + '</span><span class="rhs">= ' + l.rhs + '</span></div>').join('') + '</li>').join('') + '</ol>';
        }
        stepsBox.hidden = !on;
      }

      /* --- Aktionen --- */
      function onSubmit(ev) {
        ev.preventDefault();
        if (status !== 'open') { newTask(true); return; }
        const def = defs[phase];
        const vals = {}, problems = [], missing = [];
        def.fields.forEach(f => {
          const r = readField(f);
          if (r.error) { missing.push(f); if (problems.indexOf(r.error) < 0) problems.push(r.error); }
          else vals[f.name] = r.value;
        });
        if (missing.length) {
          const texts = {
            num: 'Trage in jedes Feld eine Zahl ein, zum Beispiel 3, 1,5 oder 3/2.',
            neg: 'Trage die Zahl ohne Vorzeichen ein. Das Vorzeichen wählst du mit dem Knopf davor.',
            sign: 'Wähle mit dem Knopf vor der Zahl, ob + oder − gilt.',
          };
          missing.forEach(f => setState(f, false));
          say('bad', problems.map(k => '<p>' + texts[k] + '</p>').join(''));
          const first = missing[0];
          const signMissing = first.signBtn && first.sign === null && first.input.value.trim() !== '';
          (signMissing ? first.signBtn : first.input).focus();
          return;
        }
        attempts++;
        const res = def.check(task, vals);
        def.fields.forEach(f => setState(f, res.ok[f.name]));
        if (res.all) {
          if (phase < defs.length - 1) advance(def); else solved();
          return;
        }
        say('bad', res.msgs.map(m => '<p>' + m + '</p>').join('') +
          (attempts >= 2 && hintStage === 0 ? '<p>Tipp: Der Knopf „Hinweis“ hilft dir Schritt für Schritt.</p>' : ''));
      }
      function advance(def) {
        def.fields.forEach(lockField);
        phase++;
        defs[phase].row.hidden = false;
        note.innerHTML = defs[phase].note;
        say('ok', def.done(task));
        defs[phase].fields[0].input.focus();
      }
      function solved() {
        status = 'solved';
        const newlyDone = record(true);
        lock(); setButtons();
        say('ok', '<p><strong>Richtig!</strong> ' + expr(fx + ' = ' + vertexHTML(task.a, task.d, task.e)) + '</p>' +
          '<p>Der Scheitelpunkt ist ' + expr(vertexS(task)) + '.</p>' +
          (newlyDone ? '<p><strong>' + LEVELS[task.level].name + ' geschafft:</strong> ' + GOAL + ' Aufgaben in Folge gelöst.</p>' : ''));
        showAfter();
      }
      function onHint() {
        if (status !== 'open' || hintStage >= hintList.length) return;
        hintStage++;
        hintsBox.innerHTML = hintList.slice(0, hintStage).map((x, i) =>
          '<p><span class="qe-hn">Hinweis ' + (i + 1) + '</span>' + x + '</p>').join('');
        hintsBox.hidden = false;
        setButtons();
      }
      function onSolution() {
        if (status === 'open') {
          status = 'revealed';
          record(false);
          defs.forEach(d => { d.row.hidden = false; });
          fields.forEach(f => { fillField(f, valueOf(task, f.name)); setState(f, true); });
          lock();
          say('info', '<p>Das ist die Lösung. Diese Aufgabe zählt nicht als gelöst, deine Serie beginnt neu. Sieh dir den Rechenweg an und probiere dann die nächste Aufgabe.</p>');
          showAfter();
          showSteps(true);
        } else {
          showSteps(stepsBox.hidden);
        }
        setButtons();
      }

      renderLevels();
      renderStats();
      newTask(false);
    },
  });
})();
