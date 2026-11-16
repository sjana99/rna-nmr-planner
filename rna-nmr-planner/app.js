/* RNA NMR Planner: UI logic. Depends on mol.js (MOL) and the data-*.js files (RNA.X). */
(function () {
  'use strict';
  const X = window.RNA.X, MOL = window.MOL;
  const $ = id => document.getElementById(id);
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  const NUC = {
    H: { n: '¹H', r: 1 }, C: { n: '¹³C', r: 0.25144953 }, N: { n: '¹⁵N', r: 0.10132912 },
    P: { n: '³¹P', r: 0.40480864 }, D: { n: '²H', r: 0.15350609 }
  };
  const REG = {
    imU: ['U H3', 13, 14.6], imG: ['G H1', 11.8, 13.5], imGU: ['G·U imino', 9.8, 12],
    am: ['amino NH₂', 6.2, 8.8], aro: ['H8, H6, H2', 6.9, 8.7], h1p: ['H1′, H5', 5, 6.3], rib: ['H2′–H5″', 3.8, 5],
    gN1: ['G N1', 142, 149], uN3: ['U N3', 155, 164], cN3: ['C N3', 193, 200], aN1: ['A N1', 219, 227], aN3: ['A N3', 211, 216],
    n7: ['purine N7', 228, 238], n9: ['purine N9', 166, 173], pN1: ['pyrimidine N1', 143, 154],
    cN4: ['C N4', 93, 100], aN6: ['A N6', 77, 85], gN2: ['G N2', 71, 77],
    c1p: ['C1′', 88, 95], c4p: ['C4′', 80, 85], c2p3p: ['C2′, C3′', 69, 78], c5p: ['C5′', 62, 69], c5: ['pyrimidine C5', 96, 106],
    c68: ['C6, C8', 136, 145], c2a: ['A C2', 152, 156], cq: ['C2, C4, C6 (no H)', 149, 170], c5pu: ['purine C5', 115, 122],
    pp: ['backbone ³¹P', -2.5, 0.5]
  };
  const GOALS = [['all', 'Everything'], ['check', 'Sample check'], ['imino', 'Base pairs & imino'], ['hbond', 'Hydrogen bonds'],
    ['base', 'Base assignment'], ['sugar', 'Ribose assignment'], ['walk', 'Sequential walk'], ['link', 'Base–ribose link'],
    ['backbone', 'Backbone & ³¹P'], ['noe', 'NOE distances'], ['dyn', 'Dynamics'], ['rdc', 'RDCs'], ['inter', 'Complexes & filters']];
  const GROUPS = [['U', 'Unlabeled RNA'], ['N', '¹⁵N-labeled RNA'], ['CN', '¹³C,¹⁵N-labeled RNA']];
  const PROBES = {
    txi: ['Room-temperature TXI (¹H, ¹³C, ¹⁵N)', 'HCN', 0], bbo: ['Room-temperature broadband (BBO/BBFO)', 'X', 0],
    tci: ['TCI CryoProbe (¹H, ¹³C, ¹⁵N)', 'HCN', 1], qci: ['QCI-P CryoProbe (¹H, ¹³C, ¹⁵N, ³¹P)', 'HCNP', 1], txo: ['TXO CryoProbe (¹³C/¹⁵N inner coil)', 'HCN', 1]
  };
  const KIND = { J: 'through bonds (J coupling)', HB: 'across the hydrogen bond (J coupling)', NOE: 'through space (NOE)', ROE: 'through space (ROE)', TOC: 'TOCSY mixing', CP: 'cross-polarisation', EX: 'chemical exchange' };

  const S = { lab: 'nat', solv: 'H2O', nt: 30, conc: 0.5, temp: 298, field: 600, probe: 'tci', goal: 'all', hide: false, id: 'jr', path: 0, step: 0, ov: {} };
  try { const saved = JSON.parse(localStorage.getItem('rnaNmrPlanner') || 'null'); if (saved) Object.assign(S, saved, { step: 0 }); } catch (e) { /* storage unavailable */ }
  if (!X.some(x => x.id === S.id)) S.id = X[0].id;
  const save = () => { try { localStorage.setItem('rnaNmrPlanner', JSON.stringify(S)); } catch (e) { /* ignore */ } };

  const has15N = () => /N/.test(S.lab), has13C = () => /C/.test(S.lab), isSel = () => /^sel/.test(S.lab);

  /* ---------- feasibility ---------- */
  function evaluate(x) {
    const n = [], add = (l, t) => n.push([l, t]);
    if (x.solv === 'H2O' && S.solv === 'D2O') add('bad', 'Needs H₂O. In D₂O the imino and amino protons this experiment relies on are replaced by deuterium.');
    if (x.solv === 'D2O' && S.solv === 'H2O') add('bad', 'Bruker lists this experiment for D₂O only: the ribose protons it uses lie under the water signal in H₂O.');
    const needN = x.need === 'N' || x.need === 'CN', needC = x.need === 'C' || x.need === 'CN';
    if (needN && !has15N()) add(x.nat ? 'warn' : 'bad', x.nat ? 'Runs at natural abundance (0.37 % ¹⁵N), but expect overnight acquisitions and use as much RNA as you can.' : 'Needs ¹⁵N labeling.');
    if (needC && !has13C()) add(x.nat ? 'warn' : 'bad', x.nat ? 'Runs at natural abundance (1.1 % ¹³C), but expect hours to days and use as much RNA as you can.' : 'Needs ¹³C labeling.');
    if (x.natOnly && has13C()) add('warn', 'Bruker lists this parameter set for unlabeled RNA. With ¹³C labeling, carbon–carbon couplings and the labeled-sample experiments make it a poor choice.');
    if (x.avoidC && has13C()) add('warn', 'Works best on ¹⁵N-only samples: attached ¹³C speeds up the relaxation of H2 and H8.');
    if (isSel() && x.need !== 'none') add('info', 'With nucleotide-selective labeling only the labeled residues appear.');
    if (x.wantSel && !isSel()) add('info', 'Designed for selectively labeled RNA. On a uniformly labeled or unlabeled sample one of the sub-spectra is empty.');
    if (x.wantMix) add('info', 'Needs a sample that mixes labeled and unlabeled parts: a labeled RNA with an unlabeled ligand or partner, or selective labeling.');
    if (x.need === 'none' && (has15N() || has13C()) && (x.opt || []).some(o => /LABEL/.test(o[0]))) add('info', 'Your RNA is labeled: switch on the decoupling option (' + (has13C() ? '-DLABEL_CN' : '-DLABEL_N') + ') or every N–H' + (has13C() ? ' and C–H' : '') + ' proton shows a ¹J doublet.');
    const pr = PROBES[S.probe], het = x.ch.replace(/[HD]/g, '').split('');
    if (pr[1] === 'X') { if (het.length > 1) add('bad', 'Needs ' + het.map(c => NUC[c].n).join(' and ') + ' at the same time. A broadband probe offers one X channel.'); }
    else het.forEach(c => { if (pr[1].indexOf(c) < 0) add('bad', 'Needs a ' + NUC[c].n + ' channel, which this probe does not have.'); });
    if (x.cdet) {
      if (!pr[2]) add('bad', x.cdet + ' detection is not practical on a room-temperature probe.');
      else if (S.probe !== 'txo') add('info', 'Detected on ' + x.cdet + '. It runs on this cryoprobe, but a TXO cryoprobe would be more sensitive.');
    } else if (S.probe === 'txo' && x.ch !== 'P' && x.ch !== 'D') add('info', 'A TXO probe has ¹H on the outer coil: proton-detected experiments are less sensitive than on a TCI or QCI.');
    if (x.maxNt && S.nt > x.maxNt) add('warn', 'Your RNA has ' + S.nt + ' nt. This experiment is practical up to about ' + x.maxNt + ' nt; expect weak or missing peaks.');
    if (x.ch.indexOf('P') >= 0 && S.field >= 800) add('warn', '³¹P lines broaden with the square of the field (chemical shift anisotropy). At ' + S.field + ' MHz expect broader ³¹P lines than at 500–600 MHz.');
    if (x.tro && S.field < 700) add('info', 'TROSY gains grow with field. At ' + S.field + ' MHz and for a small RNA the benefit is modest.');
    if (x.id === 'sfhmqc_n' && S.nt > 50) add('info', 'Above about 50 nt the BEST-TROSY version gives narrower lines.');
    if ((needN && !has15N() || needC && !has13C()) && x.nat && S.conc < 0.5) add('warn', 'At ' + S.conc + ' mM a natural-abundance heteronuclear experiment will be very long.');
    if (x.need === 'none' && x.D === '2D' && S.nt > 40 && x.ch === 'H') add('info', 'At ' + S.nt + ' nt, proton overlap in a 2D homonuclear spectrum becomes severe. Isotope-edited 3D experiments resolve it.');
    if (x.solv === 'H2O' && S.temp > 303 && /imino/i.test(x.n + x.what)) add('info', 'At ' + S.temp + ' K imino protons exchange faster with water. Fewer and broader imino signals are likely; try a lower temperature.');
    if (x.sl) add('info', 'Bruker quotes the spin-lock offset for 600 MHz. Scaled to your field: about ' + Math.round(x.sl * S.field / 600 / 10) * 10 + ' Hz.');
    if (x.D === '4D' || x.nus) add('info', 'Plan this with non-uniform sampling (set the sampling density in the setup table).');
    const lvl = n.some(a => a[0] === 'bad') ? 'bad' : n.some(a => a[0] === 'warn') ? 'warn' : 'ok';
    return { lvl: lvl, notes: n };
  }
  const LVL = { ok: 'Runs on this sample', warn: 'Possible, with caveats', bad: 'Not with this setup' };

  /* ---------- sample summary ---------- */
  function sampleSummary() {
    const mw = S.nt * (has13C() ? 0.335 : 0.322);
    const eta = T => 2.414e-5 * Math.pow(10, 247.8 / (T - 140));
    const tc = 0.6 * mw * (eta(S.temp) / eta(298)) * (298 / S.temp);
    const f = k => (S.field * NUC[k].r).toFixed(1);
    $('sum').innerHTML =
      '<span><b>' + mw.toFixed(1) + ' kDa</b> approx. mass</span>' +
      '<span><b>≈ ' + tc.toFixed(1) + ' ns</b> tumbling time (rule of thumb)</span>' +
      '<span><b>' + f('C') + '</b> MHz ¹³C</span><span><b>' + f('N') + '</b> MHz ¹⁵N</span><span><b>' + f('P') + '</b> MHz ³¹P</span>';
  }

  /* ---------- list ---------- */
  function renderGoals() {
    $('goals').innerHTML = GOALS.map(g => '<button type="button" class="chip' + (S.goal === g[0] ? ' on' : '') + '" data-goal="' + g[0] + '" aria-pressed="' + (S.goal === g[0]) + '">' + g[1] + '</button>').join('');
  }
  function renderList() {
    let shown = 0;
    const html = GROUPS.map(g => {
      const rows = X.filter(x => (x.g === g[0] || x.g2 === g[0]) && (S.goal === 'all' || x.goals.indexOf(S.goal) >= 0)).map(x => {
        const ev = evaluate(x);
        if (S.hide && ev.lvl === 'bad') return '';
        shown++;
        return '<button type="button" class="row' + (x.id === S.id ? ' on' : '') + '" data-id="' + x.id + '"><span class="dot ' + ev.lvl + '" title="' + LVL[ev.lvl] + '"></span>' +
          '<span class="rn">' + esc(x.n) + '<small>' + esc(x.s) + '</small></span><span class="tag">' + x.D + '</span></button>';
      }).join('');
      return rows ? '<h3>' + g[1] + '</h3>' + rows : '';
    }).join('');
    $('list').innerHTML = html || '<p class="empty">No experiment matches this goal with the current filters.</p>';
    $('count').textContent = shown + ' experiment' + (shown === 1 ? '' : 's');
  }

  /* ---------- setup maths ---------- */
  function getDims(x) { return (S.solv === 'D2O' && x.dimsD2O) ? x.dimsD2O : x.dims; }
  function vals(x) {
    const o = S.ov[x.id] || {}, dims = getDims(x).map((d, i) => {
      const k = 'd' + i, sw = o[k + 'sw'] != null ? o[k + 'sw'] : d.sw, off = o[k + 'o'] != null ? o[k + 'o'] : d.o;
      const swh = sw * S.field * NUC[d.n].r;
      let td, aq;
      if (d.dir) { aq = o[k + 'aq'] != null ? o[k + 'aq'] : d.aq; td = Math.max(2, 2 * Math.round(swh * aq)); }
      else { td = o[k + 'td'] != null ? o[k + 'td'] : d.td; aq = td / (2 * swh); }
      return { d: d, i: i, sw: sw, o: off, swh: swh, td: td, aq: aq, lo: off - sw / 2, hi: off + sw / 2 };
    });
    const ns0 = typeof x.ns === 'object' ? ((x.need === 'N' && has15N()) || (x.need === 'C' && has13C()) ? x.ns.lab : x.ns.nat) : x.ns;
    const v = { dims: dims, ns: o.ns != null ? o.ns : ns0, d1: o.d1 != null ? o.d1 : x.d1, mix: x.mix ? (o.mix != null ? o.mix : x.mix.v) : 0,
      ps: x.pseudo ? (o.ps != null ? o.ps : x.pseudo.n) : 1, nus: o.nus != null ? o.nus : (x.D === '4D' ? 5 : 100) };
    const dir = dims.filter(d => d.d.dir)[0];
    v.scan = v.d1 + (dir ? dir.aq : 0) + v.mix + (x.extra || 0);
    v.fids = dims.filter(d => !d.d.dir).reduce((p, d) => p * Math.max(1, d.td), 1) * v.ps * v.nus / 100;
    v.time = (v.fids * v.ns + 16) * v.scan;
    return v;
  }
  const fmtTime = t => t < 90 ? Math.round(t) + ' s' : t < 5400 ? Math.round(t / 60) + ' min' : t < 172800 ? (t / 3600).toFixed(1) + ' h' : (t / 86400).toFixed(1) + ' days';
  const num = (v, d) => (+v).toFixed(d == null ? 1 : d).replace(/\.0+$/, '');

  function windowBar(dv) {
    const d = dv.d, rg = (d.rg || []).map(k => REG[k]).filter(Boolean).sort((a, b) => b[1] - a[1]);
    let lo = dv.lo, hi = dv.hi;
    rg.forEach(r => { lo = Math.min(lo, r[1]); hi = Math.max(hi, r[2]); });
    const pad = (hi - lo) * 0.06; lo -= pad; hi += pad;
    const W = 560, x = p => (hi - p) / (hi - lo) * (W - 20) + 10;
    const o = ['<svg class="win" viewBox="0 0 ' + W + ' 74" role="img" aria-label="' + NUC[d.n].n + ' window from ' + num(dv.hi) + ' to ' + num(dv.lo) + ' ppm">'];
    o.push('<rect class="w-win" x="' + x(dv.hi).toFixed(1) + '" y="22" width="' + (x(dv.lo) - x(dv.hi)).toFixed(1) + '" height="22" rx="3"/>');
    rg.forEach((r, i) => {
      const out = r[2] > dv.hi + 1e-6 || r[1] < dv.lo - 1e-6, x0 = x(r[2]), w = Math.max(3, x(r[1]) - x(r[2]));
      o.push('<rect class="w-reg n' + d.n + (out ? ' out' : '') + '" x="' + x0.toFixed(1) + '" y="28" width="' + w.toFixed(1) + '" height="10" rx="2"/>');
      o.push('<text class="w-lab' + (out ? ' out' : '') + '" x="' + (x0 + w / 2).toFixed(1) + '" y="' + (i % 2 ? 60 : 16) + '">' + esc(r[0]) + (out ? ' ⚠' : '') + '</text>');
    });
    o.push('<line class="w-ax" x1="10" y1="45" x2="' + (W - 10) + '" y2="45"/>');
    o.push('<text class="w-tick" x="' + x(dv.hi).toFixed(1) + '" y="72" text-anchor="middle">' + num(dv.hi) + '</text><text class="w-tick" x="' + x(dv.lo).toFixed(1) + '" y="72" text-anchor="middle">' + num(dv.lo) + ' ppm</text>');
    if (d.n === 'H' && dv.hi > 4.7 && dv.lo < 4.7) o.push('<line class="w-wat" x1="' + x(4.7).toFixed(1) + '" y1="20" x2="' + x(4.7).toFixed(1) + '" y2="46"/>');
    o.push('</svg>');
    const outs = rg.filter(r => r[2] > dv.hi + 1e-6 || r[1] < dv.lo - 1e-6).map(r => r[0]);
    return o.join('') + (outs.length ? '<p class="fold">Outside the window, will fold or be lost: ' + esc(outs.join(', ')) + '.</p>' : '');
  }

  function renderSetup(x) {
    const v = vals(x), id = x.id, labeled = has15N() || has13C();
    const inp = (k, val, step, unit) => '<label class="num"><input id="in-' + id + '-' + k + '" data-k="' + k + '" type="number" step="' + step + '" value="' + val + '"><span>' + unit + '</span></label>';
    let h = '<div class="dims">';
    v.dims.forEach(dv => {
      const d = dv.d, k = 'd' + dv.i, pName = d.op || (d.n === 'H' ? 'O1P' : d.n === 'C' ? 'O2P' : 'O3P');
      h += '<div class="dim"><div class="dimhead"><span class="nuc n' + d.n + '">' + NUC[d.n].n + '</span><b>' + d.ax + '</b><span class="muted">' + (d.dir ? 'detected' : 'indirect') + '</span></div>' +
        '<div class="dimgrid">' +
        '<div><span class="k">Centre' + (d.oq ? ' (assumed)' : '') + ' · ' + pName + '</span>' + inp(k + 'o', dv.o, 0.1, 'ppm') + '</div>' +
        '<div><span class="k">Width · SW</span>' + inp(k + 'sw', dv.sw, 0.5, 'ppm') + '</div>' +
        '<div><span class="k">Width at ' + S.field + ' MHz</span><span class="v">' + Math.round(dv.swh).toLocaleString('en-US') + ' Hz</span></div>' +
        (d.dir ? '<div><span class="k">Acquisition time</span>' + inp(k + 'aq', Math.round(dv.aq * 1000), 5, 'ms') + '</div><div><span class="k">TD</span><span class="v">' + dv.td + ' points</span></div>'
          : '<div><span class="k">Increments · TD</span>' + inp(k + 'td', dv.td, 1, 'pts') + '</div><div><span class="k">Longest t</span><span class="v">' + num(dv.aq * 1000) + ' ms</span></div>') +
        '<div><span class="k">Resolution</span><span class="v">' + (dv.td > 1 ? num(1 / dv.aq) + ' Hz' : 'not sampled') + '</span></div>' +
        '</div>' + (d.n === 'D' ? '' : windowBar(dv)) + (d.note ? '<p class="muted small">' + esc(d.note) + '</p>' : '');
      if (d.dir && labeled && dv.aq > 0.25 && d.n === 'H') h += '<p class="fold">With heteronuclear decoupling Bruker limits the acquisition time to 250 ms.</p>';
      if (d.ct && dv.aq > d.ct) h += '<p class="fold">Longest t₁ (' + num(dv.aq * 1000) + ' ms) exceeds the constant-time period (' + d.ct * 1000 + ' ms). Reduce TD to ' + Math.floor(2 * dv.swh * d.ct) + ' or use the longer period.</p>';
      h += '</div>';
    });
    h += '</div><div class="scan">' +
      '<div><span class="k">Scans · NS</span>' + inp('ns', v.ns, x.nsm || 1, '× ' + (x.nsm || 1)) + '</div>' +
      '<div><span class="k">Recycle delay · D1</span>' + inp('d1', v.d1, 0.1, 's') + '</div>' +
      (x.mix ? '<div><span class="k">' + esc(x.mix.lab) + ' · ' + x.mix.p + '</span>' + inp('mix', Math.round(v.mix * 1000), 1, 'ms') + '</div>' : '') +
      (x.pseudo ? '<div><span class="k">' + esc(x.pseudo.lab) + ' · ' + esc(x.pseudo.p) + '</span>' + inp('ps', v.ps, 1, '') + '</div>' : '') +
      (v.dims.length > 2 ? '<div><span class="k">Sampling density (NUS)</span>' + inp('nus', v.nus, 5, '%') + '</div>' : '') +
      '<div class="total"><span class="k">Estimated time</span><span class="big">' + fmtTime(v.time) + '</span><span class="muted small">' + Math.round(v.fids).toLocaleString('en-US') + ' FIDs × ' + v.ns + ' scans × ' + num(v.scan, 2) + ' s</span></div></div>';
    if (x.mix && x.mix.hint) h += '<p class="muted small">' + x.mix.p + ': ' + esc(x.mix.hint) + '</p>';
    if (x.time) h += '<p class="muted small">Bruker’s reference: ' + esc(x.time) + '</p>';
    if (x.axNote) h += '<p class="note">' + esc(x.axNote) + '</p>';
    $('setup').innerHTML = h;
  }

  /* ---------- pathway ---------- */
  function renderPath(x) {
    if (S.path >= x.paths.length) S.path = 0;
    const p = x.paths[S.path], sc = MOL.scene(p.sc), steps = MOL.prep(p.st);
    if (S.step > steps.length) S.step = 0;
    const tabs = x.paths.length > 1 ? '<div class="tabs" role="tablist">' + x.paths.map((q, i) => '<button type="button" role="tab" aria-selected="' + (i === S.path) + '" class="tab' + (i === S.path ? ' on' : '') + '" data-path="' + i + '">' + esc(q.t) + '</button>').join('') + '</div>' : '';
    const names = a => a.map(k => sc.fmt(k)).join(', ');
    const chain = steps.filter(s => s.type !== 'self').map(s => s.type === 'tr' ? '<span class="arr k' + s.kind + '">' + esc(s.lab || '') + ' →</span> <b>' + esc(names(s.to)) + '</b>'
      : s.type === 'start' ? '<b>' + esc(names(s.at)) + '</b>' : s.type === 'evo' ? '<i>[' + esc(s.ax) + ']</i>' : '<i>[detect]</i>').join(' ');
    const lis = steps.map(s => {
      const title = s.type === 'tr' ? esc(names(s.from)) + ' → ' + esc(names(s.to))
        : s.type === 'start' ? 'Start on ' + esc(names(s.at)) : s.type === 'evo' ? 'Frequency labelling' + (s.ax ? ' (' + esc(s.ax) + ')' : '') + ' on ' + esc(names(s.at))
          : s.type === 'det' ? 'Detection on ' + esc(names(s.at)) : esc(names(s.at)) + ': ' + esc(s.kind);
      const chip = s.type === 'tr' ? '<span class="mech k' + s.kind + '">' + KIND[s.kind] + (s.lab ? ' · ' + esc(s.lab) : '') + '</span>' : '';
      return '<li class="' + (S.step === s.num ? 'on' : '') + '"><button type="button" data-step="' + s.num + '"><span class="sn">' + s.num + '</span><span class="st"><b>' + title + '</b>' + chip + '<span>' + esc(s.text || '') + '</span></span></button></li>';
    }).join('');
    $('path').innerHTML = tabs +
      '<p class="chain">' + chain + '</p>' +
      '<figure class="molfig"><div class="molwrap">' + MOL.render(sc, steps, S.step, x.n + ': ' + p.t) + '</div>' +
      '<figcaption><span class="lg"><i class="l-j"></i>through bonds</span><span class="lg"><i class="l-noe"></i>through space</span><span class="lg"><i class="l-toc"></i>spin-lock mixing</span><span class="lg"><i class="l-ex"></i>exchange</span><span class="lg"><i class="l-hb"></i>hydrogen bond</span><span class="lg"><b class="mk mk-s"></b>start, filter or delay</span><span class="lg"><b class="mk mk-e"></b>frequency labelling</span><span class="lg"><b class="mk mk-d"></b>detection</span></figcaption></figure>' +
      '<div class="stepper"><button type="button" data-nav="-1">← Previous</button><button type="button" data-nav="1" class="pri">' + (S.step ? 'Next step →' : 'Step through →') + '</button><button type="button" data-nav="0"' + (S.step ? '' : ' disabled') + '>Show whole path</button><span class="muted small">' + (S.step ? 'Step ' + S.step + ' of ' + steps.length : steps.length + ' steps') + '</span></div>' +
      '<ol class="steps">' + lis + '</ol>' +
      '<div class="ends"><span class="k">Where it ends up</span><p>' + esc(p.end) + '</p></div>';
    if (window.SEQ) window.SEQ.attach(x, sc, steps, S.step);
  }

  /* ---------- detail ---------- */
  function renderDetail() {
    const x = X.filter(a => a.id === S.id)[0], ev = evaluate(x);
    $('d-head').innerHTML = '<div class="dh-top"><span class="tag">' + x.D + '</span><span class="status ' + ev.lvl + '">' + LVL[ev.lvl] + '</span></div>' +
      '<h2>' + esc(x.n) + '</h2><p class="lede">' + esc(x.what) + '</p>' +
      '<dl class="ids"><div><dt>Parameter set</dt><dd><code>' + esc(x.set) + '</code></dd></div><div><dt>Pulse program</dt><dd><code>' + esc(x.pp) + '</code></dd></div>' +
      '<div><dt>Solvent</dt><dd>' + (x.solv === 'both' ? 'H₂O or D₂O' : x.solv === 'H2O' ? 'H₂O' : 'D₂O') + '</dd></div>' +
      '<div><dt>Labeling</dt><dd>' + ({ none: 'any', N: x.nat ? '¹⁵N (or natural abundance)' : '¹⁵N', C: x.nat ? 'natural abundance ¹³C' + (x.natOnly ? '' : ' or ¹³C') : '¹³C', CN: '¹³C and ¹⁵N' })[x.need] + '</dd></div></dl>';
    $('checks').innerHTML = ev.notes.length ? ev.notes.map(n => '<li class="' + n[0] + '"><span class="dot ' + (n[0] === 'info' ? 'info' : n[0]) + '"></span>' + esc(n[1]) + '</li>').join('') : '<li class="ok"><span class="dot ok"></span>Nothing in your sample or hardware settings stands in the way.</li>';
    renderPath(x); renderSetup(x);
    const tbl = (rows, cls) => rows && rows.length ? '<table class="' + cls + '"><tbody>' + rows.map(r => '<tr><th><code>' + esc(r[0]) + '</code></th>' + (r.length > 2 ? '<td class="val">' + esc(r[1]) + '</td><td>' + esc(r[2]) + '</td>' : '<td colspan="2">' + esc(r[1]) + '</td>') + '</tr>').join('') + '</tbody></table>' : '';
    $('params').innerHTML = (x.par ? '<h4>Constants and delays</h4><div class="scroll">' + tbl(x.par, 'par') + '</div>' : '') +
      (x.opt && x.opt.length ? '<h4>Options (ZGOPTNS)</h4><div class="scroll">' + tbl(x.opt, 'par') + '</div>' : '') +
      (x.tune ? '<h4>Optimise first</h4><ul class="plain">' + x.tune.map(t => '<li>' + esc(t) + '</li>').join('') + '</ul>' : '') +
      (!x.par && !(x.opt && x.opt.length) && !x.tune ? '<p class="muted">Bruker lists no further constants for this experiment beyond the values above.</p>' : '');
    $('limits').innerHTML = x.lim.map(t => '<li>' + esc(t) + '</li>').join('');
    $('src').innerHTML = (x.ref ? 'Method: ' + esc(x.ref) + '. ' : '') + 'Parameter values from Bruker’s <a href="https://www.bruker.com/en/products-and-solutions/mr/nmr-structural-biology-solutions/nmr-of-nucleic-acids/experiments.html" target="_blank" rel="noopener">RNA experiment list</a>. Shift ranges and couplings are typical values.';
  }

  function all() { sampleSummary(); renderGoals(); renderList(); renderDetail(); save(); }

  /* ---------- events ---------- */
  function syncControls() {
    ['lab', 'solv', 'probe', 'field'].forEach(k => { $(k).value = S[k]; });
    ['nt', 'conc', 'temp'].forEach(k => { $(k).value = S[k]; });
    $('hide').checked = !!S.hide;
  }
  document.addEventListener('change', e => {
    const t = e.target;
    if (t.id === 'hide') { S.hide = t.checked; renderList(); save(); return; }
    if (['lab', 'solv', 'probe'].indexOf(t.id) >= 0) { S[t.id] = t.value; all(); return; }
    if (['field', 'nt', 'conc', 'temp'].indexOf(t.id) >= 0) { const v = parseFloat(t.value); if (v > 0) S[t.id] = v; all(); return; }
    const k = t.getAttribute && t.getAttribute('data-k');
    if (k) {
      let v = parseFloat(t.value); if (isNaN(v)) return;
      if (/aq$|^mix$/.test(k)) v = v / 1000;
      if (/sw$|td$|^ns$|^ps$|^nus$/.test(k) && v <= 0) return;
      (S.ov[S.id] = S.ov[S.id] || {})[k] = v;
      renderSetup(X.filter(a => a.id === S.id)[0]); save();
    }
  });
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('button'); if (!b) return;
    const d = b.dataset;
    if (d.goal) { S.goal = d.goal; renderGoals(); renderList(); save(); }
    else if (d.id) { S.id = d.id; S.path = 0; S.step = 0; renderList(); renderDetail(); save(); if (window.matchMedia('(max-width: 900px)').matches) $('detail').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    else if (d.path) { S.path = +d.path; S.step = 0; renderPath(X.filter(a => a.id === S.id)[0]); }
    else if (d.step) { S.step = S.step === +d.step ? 0 : +d.step; renderPath(X.filter(a => a.id === S.id)[0]); }
    else if (d.nav != null) {
      const x = X.filter(a => a.id === S.id)[0], n = x.paths[S.path].st.length;
      S.step = d.nav === '0' ? 0 : Math.max(0, Math.min(n, S.step + (+d.nav)));
      renderPath(x);
    } else if (b.id === 'reset') { delete S.ov[S.id]; renderSetup(X.filter(a => a.id === S.id)[0]); save(); }
  });

  syncControls(); all();
})();
