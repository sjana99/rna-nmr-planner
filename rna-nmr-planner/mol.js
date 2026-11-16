/* Molecule maps: builds 2D nucleotide / base-pair scenes and draws magnetization-transfer paths on them. */
(function (root) {
  'use strict';
  const RAD = Math.PI / 180;
  const u = a => [Math.cos(a * RAD), Math.sin(a * RAD)];
  const ad = (p, v, k) => { k = k == null ? 1 : k; return [p[0] + v[0] * k, p[1] + v[1] * k]; };
  const HB = 0.78, R5 = 0.851, AP5 = 0.688;
  const nice = n => n === 'H5p' ? 'H5′/5″' : n.replace(/p$/, '′');

  function residue(S, key, type, o) {
    const c = o.c, a = o.a, s = o.s;
    const put = (n, p, lab) => { S.atoms[key + '.' + n] = { x: p[0], y: p[1], el: n[0], lab: lab || nice(n), res: key }; return p; };
    const bd = (x, y) => S.bonds.push([key + '.' + x, key + '.' + y]);
    const ring = names => names.map((n, i) => put(n, ad(c, u(a + s * 60 * i))));
    const closeRing = names => names.forEach((n, i) => bd(n, names[(i + 1) % names.length]));
    let gN, th;
    if (type === 'G' || type === 'A') {
      const names = ['N1', 'C6', 'C5', 'C4', 'N3', 'C2'];
      const p = ring(names); closeRing(names);
      const nA = a + 150 * s;
      const M = [(p[2][0] + p[3][0]) / 2, (p[2][1] + p[3][1]) / 2];
      const Pc = ad(M, u(nA), AP5);
      const C8 = put('C8', ad(Pc, u(nA), R5));
      put('N9', ad(Pc, u(nA + 72 * s), R5));
      put('N7', ad(Pc, u(nA - 72 * s), R5));
      bd('C5', 'N7'); bd('N7', 'C8'); bd('C8', 'N9'); bd('N9', 'C4');
      put('H8', ad(C8, u(nA), HB)); bd('C8', 'H8');
      if (type === 'G') {
        put('O6', ad(p[1], u(a + 60 * s))); bd('C6', 'O6');
        put('H1', ad(p[0], u(a), HB)); bd('N1', 'H1');
        const N2 = put('N2', ad(p[5], u(a + 300 * s))); bd('C2', 'N2');
        put('H21', ad(N2, u(a), HB)); bd('N2', 'H21');
        put('H22', ad(N2, u(a + 240 * s), HB)); bd('N2', 'H22');
      } else {
        const N6 = put('N6', ad(p[1], u(a + 60 * s))); bd('C6', 'N6');
        put('H61', ad(N6, u(a), HB)); bd('N6', 'H61');
        put('H62', ad(N6, u(a + 120 * s), HB)); bd('N6', 'H62');
        put('H2', ad(p[5], u(a + 300 * s), HB)); bd('C2', 'H2');
      }
      gN = 'N9'; th = nA + 72 * s;
      S.tags.push({ x: c[0] - 0.02, y: c[1], t: type, cls: 'big' });
    } else {
      const names = ['N3', 'C4', 'C5', 'C6', 'N1', 'C2'];
      const p = ring(names); closeRing(names);
      put('H5', ad(p[2], u(a + 120 * s), HB)); bd('C5', 'H5');
      put('H6', ad(p[3], u(a + 180 * s), HB)); bd('C6', 'H6');
      put('O2', ad(p[5], u(a + 300 * s))); bd('C2', 'O2');
      if (type === 'C') {
        const N4 = put('N4', ad(p[1], u(a + 60 * s))); bd('C4', 'N4');
        put('H41', ad(N4, u(a), HB)); bd('N4', 'H41');
        put('H42', ad(N4, u(a + 120 * s), HB)); bd('N4', 'H42');
      } else {
        put('O4', ad(p[1], u(a + 60 * s))); bd('C4', 'O4');
        put('H3', ad(p[0], u(a), HB)); bd('N3', 'H3');
      }
      gN = 'N1'; th = a + 240 * s;
      S.tags.push({ x: c[0], y: c[1], t: type, cls: 'big' });
    }
    const N = S.atoms[key + '.' + gN]; const Np = [N.x, N.y];
    if (o.sugar === false) {
      put('Rb', ad(Np, u(th), 1.15), 'ribose'); bd(gN, 'Rb');
      return;
    }
    const C1 = put('C1p', ad(Np, u(th), 1.05)); bd(gN, 'C1p');
    const Rc = ad(C1, u(th), R5), ph = th + 180;
    const O4 = put('O4p', ad(Rc, u(ph + 72 * s), R5));
    const r4 = ph + 144 * s, r3 = ph + 216 * s, r2 = ph + 288 * s;
    const C4 = put('C4p', ad(Rc, u(r4), R5));
    const C3 = put('C3p', ad(Rc, u(r3), R5));
    const C2 = put('C2p', ad(Rc, u(r2), R5));
    bd('C1p', 'O4p'); bd('O4p', 'C4p'); bd('C4p', 'C3p'); bd('C3p', 'C2p'); bd('C2p', 'C1p');
    put('H1p', ad(C1, u(ph + 63 * s), HB)); bd('C1p', 'H1p');
    put('O2p', ad(C2, u(r2 + 25 * s), 0.95), 'O2′H'); bd('C2p', 'O2p');
    put('H2p', ad(C2, u(r2 - 50 * s), HB)); bd('C2p', 'H2p');
    put('O3p', ad(C3, u(r3 - 25 * s))); bd('C3p', 'O3p');
    put('H3p', ad(C3, u(r3 + 30 * s), HB)); bd('C3p', 'H3p');
    const C5 = put('C5p', ad(C4, u(r4 - 36 * s))); bd('C4p', 'C5p');
    put('H4p', ad(C4, u(r4 + 45 * s), HB)); bd('C4p', 'H4p');
    put('H5p', ad(C5, u(r4 + 14 * s), 0.86)); bd('C5p', 'H5p');
    const O5 = put('O5p', ad(C5, [0.06 * s, 1])); bd('C5p', 'O5p');
    if (o.p5) { put('P', ad(O5, [0.65 * s, 0.8])); bd('O5p', 'P'); }
  }

  const LEFT = t => (t === 'G' || t === 'A') ? { c: [0, 0], a: 0, s: 1 } : { c: [-1.235, 0.877], a: -18, s: 1 };
  const shift = (o, dy) => ({ c: [o.c[0], o.c[1] + dy], a: o.a, s: o.s });
  const cache = {};

  function scene(spec) {
    if (cache[spec]) return cache[spec];
    const S = { spec: spec, atoms: {}, bonds: [], hb: [], tags: [], names: {} };
    const parts = spec.split('+'); const head = parts.shift().split(':'); const kind = head[0], arg = head[1] || '';
    const pair = (L, R, dy, sugar) => {
      residue(S, L, L, Object.assign(shift(LEFT(L), dy), { sugar: sugar }));
      residue(S, R, R, { c: [4.1, dy], a: 180, s: -1, sugar: sugar });
      if (L === 'G') S.hb.push(['G.O6', 'C.H41'], ['G.H1', 'C.N3'], ['G.H21', 'C.O2']);
      else S.hb.push(['A.H61', 'U.O4'], ['A.N1', 'U.H3']);
      S.names[L] = L; S.names[R] = R;
    };
    let ex = [2.05, 3.0];
    if (kind === 'pair') pair(arg[0], arg[1], 0, true);
    else if (kind === 'bp2') { pair('G', 'C', 0, false); pair('A', 'U', -4.7, false); ex = [7.4, -2.35]; }
    else if (kind === 'one') { residue(S, arg, arg, Object.assign(LEFT(arg), { p5: true })); S.names[arg] = arg; ex = [2.9, -1.6]; }
    else if (kind === 'seq') {
      residue(S, 'i', arg[0], LEFT(arg[0]));
      residue(S, 'j', arg[1], Object.assign(shift(LEFT(arg[1]), -6.2), { p5: true }));
      const o3 = S.atoms['i.O3p'], o5 = S.atoms['j.O5p'], P = S.atoms['j.P'];
      P.x = (o3.x + o5.x) / 2 - 0.35; P.y = (o3.y + o5.y) / 2;
      S.bonds.push(['i.O3p', 'j.P']);
      S.names.i = arg[0] + '(i)'; S.names.j = arg[1] + '(i+1)';
      const a5 = S.atoms['i.O5p'], a3 = S.atoms['j.O3p'];
      S.tags.push({ x: a5.x, y: a5.y + 0.75, t: '5′', cls: 'end' }, { x: a3.x - 0.1, y: a3.y - 0.75, t: '3′', cls: 'end' });
      S.tags.push({ x: -5.9, y: 1.9, t: 'residue i', cls: 'res' }, { x: -5.9, y: -4.3, t: 'residue i+1', cls: 'res' });
      ex = [2.6, -3.1];
    }
    parts.forEach((p, k) => {
      const pos = [ex[0], ex[1] - k * 1.1];
      if (p === 'W') { S.atoms['W.H'] = { x: pos[0], y: pos[1], el: 'H', lab: 'H₂O', res: 'W', box: 1 }; S.names.W = 'water'; }
      if (p === 'L') { S.atoms['L.H'] = { x: pos[0], y: pos[1], el: 'H', lab: 'partner ¹H', res: 'L', box: 1 }; S.names.L = 'partner'; }
    });
    S.fmt = function (k) {
      const at = S.atoms[k]; if (!at) return k;
      if (at.box) return at.res === 'W' ? 'H₂O' : 'partner ¹H (¹²C/¹⁴N-bound)';
      const r = S.names[at.res] || at.res;
      return at.lab + ' ' + r;
    };
    cache[spec] = S; return S;
  }

  function prep(st) {
    let n = 0;
    const arr = v => [].concat(v);
    return st.map(r => {
      n++;
      if (r[0] === '*') return { num: n, type: 'start', at: arr(r[1]), text: r[2] };
      if (r[0] === '@') return { num: n, type: 'evo', at: arr(r[1]), ax: r[2], text: r[3] };
      if (r[0] === '!') return { num: n, type: 'det', at: arr(r[1]), ax: r[2], text: r[3] };
      if (r[0] === '~') return { num: n, type: 'self', at: arr(r[1]), kind: r[2], text: r[3] };
      const f = arr(r[0]), t = arr(r[1]); const pairs = [];
      if (f.length === t.length) f.forEach((x, i) => pairs.push([x, t[i]]));
      else if (f.length === 1) t.forEach(x => pairs.push([f[0], x]));
      else f.forEach(x => pairs.push([x, t[0]]));
      return { num: n, type: 'tr', pairs: pairs, at: f.concat(t), from: f, to: t, kind: r[2], lab: r[3], text: r[4] };
    });
  }

  const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const f1 = v => (Math.round(v * 10) / 10);

  function render(S, steps, cur, label) {
    const U = 42, pad = 50;
    let minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
    const grow = (x, y) => { if (x < minx) minx = x; if (x > maxx) maxx = x; if (y < miny) miny = y; if (y > maxy) maxy = y; };
    for (const k in S.atoms) grow(S.atoms[k].x, S.atoms[k].y);
    S.tags.forEach(t => { if (t.cls !== 'big') grow(t.x, t.y); });
    for (const k in S.atoms) if (S.atoms[k].box) { grow(S.atoms[k].x + 1.3, S.atoms[k].y); grow(S.atoms[k].x - 1.3, S.atoms[k].y); }
    const X = x => f1((x - minx) * U + pad), Y = y => f1((maxy - y) * U + pad);
    const W = Math.round((maxx - minx) * U + 2 * pad), H = Math.round((maxy - miny) * U + 2 * pad);
    const P = k => { const a = S.atoms[k]; return [X(a.x), Y(a.y)]; };
    const act = {}, tagAt = {};
    steps.forEach(s => s.at.forEach(k => { if (S.atoms[k]) act[k] = Math.min(act[k] || 99, s.num); }));
    const curStep = cur > 0 ? steps[cur - 1] : null;
    const o = [];
    o.push('<svg class="mol" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="' + esc(label || 'Magnetization transfer map') + '">');
    S.hb.forEach(h => { const a = P(h[0]), b = P(h[1]); o.push('<line class="m-hb" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '"/>'); });
    S.bonds.forEach(b => { const a = P(b[0]), c = P(b[1]); o.push('<line class="m-bd" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + c[0] + '" y2="' + c[1] + '"/>'); });
    S.tags.forEach(t => o.push('<text class="m-tag m-' + t.cls + '" x="' + X(t.x) + '" y="' + Y(t.y) + '">' + esc(t.t) + '</text>'));
    for (const k in S.atoms) {
      const a = S.atoms[k], p = P(k), on = act[k] != null;
      const reached = !curStep || act[k] <= cur;
      const isCur = curStep && curStep.at.indexOf(k) >= 0;
      if (a.box) {
        const w = a.lab.length * 6.4 + 18;
        o.push('<rect class="m-box' + (on ? ' on' : '') + '" x="' + f1(p[0] - w / 2) + '" y="' + (p[1] - 12) + '" width="' + f1(w) + '" height="24" rx="12"/>');
        o.push('<text class="m-at m-boxt" x="' + p[0] + '" y="' + (p[1] + 3.6) + '">' + esc(a.lab) + '</text>');
        continue;
      }
      if (on) {
        if (isCur) o.push('<circle class="m-cur" cx="' + p[0] + '" cy="' + p[1] + '" r="16"/>');
        o.push('<circle class="m-nd n' + a.el + (reached ? '' : ' wait') + '" cx="' + p[0] + '" cy="' + p[1] + '" r="11.5"/>');
        o.push('<text class="m-at m-on' + (reached ? '' : ' wait') + '" x="' + p[0] + '" y="' + (p[1] + 3.4) + '">' + esc(a.lab) + '</text>');
      } else {
        const w = Math.max(15, a.lab.length * 5.6 + 4);
        o.push('<rect class="m-mask" x="' + f1(p[0] - w / 2) + '" y="' + (p[1] - 7) + '" width="' + f1(w) + '" height="14" rx="5"/>');
        o.push('<text class="m-at e' + a.el + '" x="' + p[0] + '" y="' + (p[1] + 3.4) + '">' + esc(a.lab) + '</text>');
      }
    }
    const seen = {};
    let gx = 0, gy = 0, gn = 0;
    for (const k in act) { const q = P(k); gx += q[0]; gy += q[1]; gn++; }
    gx /= gn || 1; gy /= gn || 1;
    const badge = (x, y, n, cls) => '<g class="m-bg ' + cls + '"><circle cx="' + f1(x) + '" cy="' + f1(y) + '" r="8"/><text x="' + f1(x) + '" y="' + f1(y + 3.2) + '">' + n + '</text></g>';
    steps.forEach(s => {
      const st = !curStep ? '' : (s.num === cur ? ' cur' : (s.num < cur ? ' past' : ' wait'));
      if (s.type === 'tr') {
        s.pairs.forEach(pr => {
          if (!S.atoms[pr[0]] || !S.atoms[pr[1]]) return;
          const a = P(pr[0]), b = P(pr[1]);
          const key = [pr[0], pr[1]].sort().join('|'); const n = seen[key] = (seen[key] || 0) + 1;
          let dx = b[0] - a[0], dy = b[1] - a[1]; const len = Math.sqrt(dx * dx + dy * dy) || 1;
          const nx = -dy / len, ny = dx / len;
          const dir = pr[0] < pr[1] ? 1 : -1;
          const bend = dir * (n % 2 ? 1 : -1) * Math.min(32, 15 + len * 0.16) * (n > 2 ? 1.8 : 1);
          const cx = (a[0] + b[0]) / 2 + nx * bend, cy = (a[1] + b[1]) / 2 + ny * bend;
          const trim = (p, q, r) => { const ex = q[0] - p[0], ey = q[1] - p[1], l = Math.sqrt(ex * ex + ey * ey) || 1; return [p[0] + ex / l * r, p[1] + ey / l * r]; };
          const ra = S.atoms[pr[0]].box ? 16 : 13, rb = S.atoms[pr[1]].box ? 18 : 15;
          const a2 = trim(a, [cx, cy], Math.min(ra, len * 0.3)), b2 = trim(b, [cx, cy], Math.min(rb, len * 0.3));
          const tx = b2[0] - cx, ty = b2[1] - cy, tl = Math.sqrt(tx * tx + ty * ty) || 1, ux = tx / tl, uy = ty / tl;
          const h1 = [b2[0] - ux * 8 - uy * 4, b2[1] - uy * 8 + ux * 4], h2 = [b2[0] - ux * 8 + uy * 4, b2[1] - uy * 8 - ux * 4];
          o.push('<g class="m-ar k' + s.kind + st + '"><path d="M' + f1(a2[0]) + ' ' + f1(a2[1]) + ' Q' + f1(cx) + ' ' + f1(cy) + ' ' + f1(b2[0] - ux * 5) + ' ' + f1(b2[1] - uy * 5) + '"/>' +
            '<polygon points="' + f1(b2[0]) + ',' + f1(b2[1]) + ' ' + f1(h1[0]) + ',' + f1(h1[1]) + ' ' + f1(h2[0]) + ',' + f1(h2[1]) + '"/></g>');
          const out = len < 70 ? 1.15 : 0.5;
          o.push(badge((1 - out) / 2 * (a2[0] + b2[0]) + out * cx, (1 - out) / 2 * (a2[1] + b2[1]) + out * cy, s.num, st));
        });
      } else {
        s.at.forEach((k, i) => {
          if (!S.atoms[k]) return; const p = P(k);
          const slot = tagAt[k] = (tagAt[k] || 0) + 1;
          const txt = s.type === 'evo' ? s.ax : s.type === 'det' ? 'acq' + (s.ax ? ' ' + s.ax : '') : s.type === 'start' ? 'start' : (s.kind || '');
          /* one pill per event, pushed outward from the centre of the path so it clears the arrows */
          let vx = p[0] - gx, vy = p[1] - gy; const vl = Math.sqrt(vx * vx + vy * vy);
          if (vl < 8) { vx = 0.5; vy = -0.866; } else { vx /= vl; vy /= vl; }
          /* fan successive markers of one atom around it instead of stacking them */
          const ang = Math.atan2(vy, vx) + 0.85 * Math.ceil((slot - 1) / 2) * (slot % 2 ? -1 : 1);
          const tcx = p[0] + Math.cos(ang) * 21, tcy = p[1] + Math.sin(ang) * 21;
          o.push('<g class="m-ev t' + s.type + st + '"><title>' + esc(s.num + ': ' + txt) + '</title><circle cx="' + f1(tcx) + '" cy="' + f1(tcy) + '" r="8"/>' +
            '<text text-anchor="middle" x="' + f1(tcx) + '" y="' + f1(tcy + 3.2) + '">' + s.num + '</text></g>');
        });
      }
    });
    o.push('</svg>');
    return o.join('');
  }

  const api = { scene: scene, prep: prep, render: render };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.MOL = api;
})(typeof window !== 'undefined' ? window : this);
