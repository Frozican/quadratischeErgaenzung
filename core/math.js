/* Mathe-Helfer für alle Übungen: exakte Bruchrechnung, Eingabe-Parser, HTML-Ausgabe von Termen. */
(function (global) {
  'use strict';
  const L = (global.Lernseite = global.Lernseite || {});

  /* ---------- Brüche (immer gekürzt, Nenner > 0) ---------- */
  function gcd(a, b) {
    a = Math.abs(a); b = Math.abs(b);
    while (b) { const t = a % b; a = b; b = t; }
    return a || 1;
  }
  function Q(n, d) {
    if (d === undefined) d = 1;
    if (d === 0) throw new Error('Nenner 0');
    if (d < 0) { n = -n; d = -d; }
    const g = gcd(n, d);
    return { n: n / g, d: d / g };
  }
  const ZERO = Q(0), ONE = Q(1);
  const add = (p, q) => Q(p.n * q.d + q.n * p.d, p.d * q.d);
  const sub = (p, q) => Q(p.n * q.d - q.n * p.d, p.d * q.d);
  const mul = (p, q) => Q(p.n * q.n, p.d * q.d);
  const div = (p, q) => Q(p.n * q.d, p.d * q.n);
  const neg = p => Q(-p.n, p.d);
  const abs = p => Q(Math.abs(p.n), p.d);
  const eq = (p, q) => p.n === q.n && p.d === q.d;
  const toNumber = p => p.n / p.d;

  /* ---------- Eingabe lesen: -3, −3, 1,5, 3/2, -3/2 ---------- */
  function dec(str) {
    const parts = str.split('.');
    const frac = parts[1] || '';
    return Q(parseInt(parts[0] + frac, 10), Math.pow(10, frac.length));
  }
  function parse(input) {
    const s = String(input).trim().replace(/[−–—]/g, '-').replace(/,/g, '.');
    const m = s.match(/^([+-]?)\s*(\d+(?:\.\d+)?)(?:\s*\/\s*(\d+(?:\.\d+)?))?$/);
    if (!m) return null;
    let q = dec(m[2]);
    if (m[3] !== undefined) {
      const den = dec(m[3]);
      if (den.n === 0) return null;
      q = div(q, den);
    }
    return m[1] === '-' ? neg(q) : q;
  }

  /* ---------- HTML-Ausgabe ---------- */
  const MINUS = '−';
  const X = '<i class="v">x</i>';

  function fracHTML(n, d) {
    return '<span class="frac"><span class="frac-n">' + n + '</span><span class="frac-d">' + d + '</span></span>';
  }
  function absHTML(q) {
    q = abs(q);
    return q.d === 1 ? String(q.n) : fracHTML(q.n, q.d);
  }
  function numHTML(q) {
    return (q.n < 0 ? MINUS : '') + absHTML(q);
  }

  /* Summe von Termen. coefs: [{c: Bruch, p: 0|1|2, hl?: true}], p = Potenz von x.
     lead = true: auch der erste Term bekommt ein " + " bzw. " − " davor (für Reste hinter einer Klammer). */
  function polyHTML(coefs, lead) {
    const parts = coefs.filter(t => t.c.n !== 0);
    if (!parts.length) return lead ? '' : '0';
    return parts.map((t, i) => {
      const mag = abs(t.c);
      let body;
      if (t.p === 0) body = absHTML(mag);
      else body = (eq(mag, ONE) ? '' : absHTML(mag)) + X + (t.p === 2 ? '<sup>2</sup>' : '');
      if (t.hl) body = '<mark class="erg">' + body + '</mark>';
      const negative = t.c.n < 0;
      if (i === 0 && !lead) return (negative ? MINUS : '') + body;
      return (negative ? ' ' + MINUS + ' ' : ' + ') + body;
    }).join('');
  }

  /* Vorfaktor: 1 weglassen, -1 nur als Minuszeichen */
  function aPrefix(a) {
    if (eq(a, ONE)) return '';
    if (eq(a, neg(ONE))) return MINUS;
    return numHTML(a);
  }

  /* a(x + d)² + e */
  function vertexHTML(a, d, e) {
    const inner = polyHTML([{ c: ONE, p: 1 }, { c: d, p: 0 }]);
    return aPrefix(a) + '(' + inner + ')<sup>2</sup>' + polyHTML([{ c: e, p: 0 }], true);
  }

  L.math = {
    Q, ZERO, ONE, add, sub, mul, div, neg, abs, eq, toNumber,
    parse, MINUS, X, absHTML, numHTML, polyHTML, aPrefix, vertexHTML,
  };

  L.util = {
    rand: (a, b) => a + Math.floor(Math.random() * (b - a + 1)),
    pick: arr => arr[Math.floor(Math.random() * arr.length)],
  };
})(typeof window !== 'undefined' ? window : globalThis);
