/* Pulse-sequence panel: a block schematic drawn from the transfer steps (same step numbers as the molecule map),
   plus timing notes taken from the Bruker Pulse Program Catalogue, vol. II Biomolecular NMR (T. Parella, TopSpin 3.0). */
(function () {
  'use strict';
  const R = window.RNA;
  const esc = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  const NAME = { H: '¹H', C: '¹³C', N: '¹⁵N', P: '³¹P' };

  /* id -> [catalogue program, printed page, 'same' | 'family' | 'closest', [[delay, meaning]...]] */
  const CAT = R.CAT = {
    zgpr: ['zgpr', 918, 'same', []],
    noesy_h2o: ['noesyfpgpphwg', 920, 'closest', []],
    ct_hsqc: ['hsqcctetgpsp.2', 922, 'family', [['d4', '1/(4·J(CH)) = 1.72 ms (cnst2 = 145 Hz)'], ['d23', 'constant-time carbon period = 8.8 ms']]],
    noesy_hsqc_c: ['na_c6noesyhsqcgp3d', 925, 'family', [['d8', 'NOESY mixing time = 100 ms'], ['d4', '1/(4·J(CH)) = 1.25 ms (cnst2 = 200 Hz)']]],
    fhsqc: ['hsqcfpf3gpphwg', 926, 'closest', [['d26', '1/(4·J(NH)) = 2.77 ms (cnst4 = 90 Hz)']]],
    noesy_sfhmqc_n: ['na_noesyhsqcf3gpwg3d', 927, 'closest', [['d8', 'NOE mixing time = 100 ms'], ['d26', '1/(4·J(NH)) = 2.77 ms (cnst4 = 90 Hz)']]],
    hcn: ['na_hcnetgpsisp3d', 929, 'family', [['d4', '1/(4·J(CH)): 1.40 ms for all C–H, 1.56 ms for H1′–C1′, 1.25 ms for H6/H8–C6/C8'], ['d22', '1/(4·J(CN)): 17.5 ms for all, 15 ms for the ribose-only or base-only version']]],
    hcnc: ['na_trhcnchmqspwg3d2', 941, 'closest', [['d4', '1/(4·J(C1′H1′)) = 1.6 ms'], ['d22', '1/(4·J(C1′N)) = 18 ms'], ['d23', '1/(4·J(CN)) = 17 ms'], ['d25', '1/(4·J(C6/8,N)) = 16 ms']]],
    hcch_cosy: ['na_trhcchco3d', 948, 'same', [['d4', '1.25 ms'], ['d25', '1/(2·J(C5C6)) = 7.12 ms'], ['d27', '1/(4·J(C5,C4/C6)) = 1 ms'], ['d22', '1/(4·J(C2C5))']]],
    hccnh: ['na_hccnhdigpwg3d', 950, 'closest', [['d26', '1/(4·J(NH)) = 2.77 ms (cnst4 = 90 Hz)'], ['cnst2', '200 Hz for the aromatic C–H transfer'], ['l1', 'TOCSY loop counter']]],
    h5c5c4: ['na_h5c5c4n3h_3d', 952, 'closest', [['d4', '1/(4·J(C5H5)) = 1.25 ms'], ['d23', '1/(4·J(C5C4)) = 4.1 ms']]],
    py_hnn: ['na_h5c5c4n3h_3d', 952, 'closest', [['d4', '1/(4·J(C5H5)) = 1.25 ms'], ['d23', '1/(4·J(C5C4)) = 4.1 ms'], ['d25', '1/(4·J(C4N)) = 10 ms']]],
    hnn_cosy: ['na_trhnncosygpphspwg', 961, 'family', [['d26', '1/(4·J(NH)) = 2.25 ms'], ['d23', '1/(4·J(NN)) = 15 ms']]],
    lr_hnn_cosy: ['na_hnncosygpphwg', 960, 'closest', [['d23', '1/(4·J(NN)) = 15 ms']]],
    sfhmqc_n: ['sfhmqcf3gpph', 710, 'same', []],
    btrosy: ['b_trosyf3gpph', 712, 'family', []],
    ipap_n: ['sfhmqcf3gpphiasi', 711, 'closest', []],
    hnco: ['b_trhncogp3d', 713, 'family', []],
    n_t1: ['hsqct1etf3gpsi3d', 830, 'closest', []], n_t2: ['hsqct2etf3gpsi3d', 832, 'closest', []], n_t1rho: ['hsqctretf3gpsi3d', 834, 'closest', []],
    n_hetnoe: ['hsqcnoef3gpsi', 829, 'closest', []], zz: ['hsqcexf3gpwgph', 837, 'closest', []],
    c_t1: ['hsqct1etgpsi3d', 827, 'closest', []], c_noe_aro: ['hsqcnoegpsi', 826, 'closest', []], c_noe_c1p: ['hsqcnoegpsi', 826, 'closest', []],
    xhf_noesy: ['noesyf3gpphxf19', 522, 'family', []], noesy_nfilt: ['noesygpphwgxf', 524, 'closest', []],
    noesy_xfed: ['noesygpphwgx1', 523, 'closest', []], noesy_xf3d: ['noesyhsqcgpwgx13d', 526, 'closest', []],
    hcch_c: ['na_hcchfwdigp3d', 985, 'closest', [['d4', '1/(4·J(CH)) = 1.6 ms'], ['d23', '1/(8·J(CC)) = 3.1 ms']]],
    hcch_h: ['na_hcchfwdigp3d', 985, 'closest', [['d4', '1/(4·J(CH)) = 1.6 ms'], ['d23', '1/(8·J(CC)) = 3.1 ms']]],
    hmqc4d: ['hmqcnoesyhmqcnngp4d', 518, 'closest', []],
    hp_tocsy: ['na_hpdi', 976, 'same', [['d21', '1/(6·J(PH)) = 20 ms']]],
    hp_dino: ['na_hpdino', 977, 'same', [['d21', '1/(6·J(PH)) = 20 ms']]],
    hcp: ['na_hcpetgpsi3d', 970, 'same', [['d4', '1/(4·J(CH)) = 1.6 ms (cnst2 = 155 Hz)'], ['d22', '1/(8·J(CP)) = 12.5 ms (cnst5 = 10 Hz)'], ['d24', '0.8 ms (cnst11 = 8)']]],
    hcp_tocsy: ['na_hcpdigpjr3d', 972, 'family', [['d4', '1/(4·J(CH)) = 1.6 ms (cnst2 = 155 Hz)'], ['d22', '1/(8·J(CP)) = 12.5 ms (cnst5 = 10 Hz)'], ['d15', 'C–C TOCSY mixing = 11 ms']]]
  };
  const REL = { same: 'Same pulse program', family: 'Same pulse program family (the RNA parameter set uses a newer variant)', closest: 'Closest sequence in the catalogue (not the same program)' };

  function draw(sc, steps, cur) {
    const el = k => (sc.atoms[k] ? sc.atoms[k].el : 'H');
    const used = {}; steps.forEach(s => s.at.forEach(k => { used[el(k)] = 1; }));
    const chans = ['H', 'C', 'N', 'P'].filter(c => used[c]);
    const Y = {}; chans.forEach((c, i) => { Y[c] = 62 + i * 50; });
    const H = 62 + (chans.length - 1) * 50 + 34, PH = 24;
    const o = []; let x = 64;
    const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
    const p90 = (c, px) => '<rect class="q-p" x="' + (px - 2.5) + '" y="' + (Y[c] - PH) + '" width="5" height="' + PH + '"/>';
    const p180 = (c, px) => '<rect class="q-p" x="' + (px - 5) + '" y="' + (Y[c] - PH) + '" width="10" height="' + PH + '"/>';
    const lab = (c, px, t) => '<text class="q-l" x="' + px + '" y="' + (Y[c] + 13) + '">' + esc(t) + '</text>';
    const box = (c, px, w, t) => '<rect class="q-b" x="' + px + '" y="' + (Y[c] - PH + 4) + '" width="' + w + '" height="' + (PH - 4) + '" rx="2"/><text class="q-bt" x="' + (px + w / 2) + '" y="' + (Y[c] - 6) + '">' + esc(t) + '</text>';
    const blocks = [];
    o.push(chans.map(c => lab(c, 48, 'd1')).slice(0, 1).join(''));
    steps.forEach(s => {
      let g = '', w = 0; const st = !cur ? '' : (s.num === cur ? ' cur' : s.num < cur ? ' past' : ' wait');
      if (s.type === 'start') { const cs = uniq(s.at.map(el)); cs.forEach(c => { g += p90(c, x + 12); }); w = 26; }
      else if (s.type === 'tr') {
        const a = el(s.from[0]), b = el(s.to[0]);
        if (s.kind === 'EX') { w = 0; }
        else if (s.kind === 'NOE') { g += p90(a, x + 8) + lab(a, x + 32, 'τm') + p90(a, x + 56); w = 66; }
        else if (s.kind === 'ROE' || s.kind === 'TOC' || s.kind === 'CP') { uniq([a, b]).forEach(c => { g += box(c, x + 4, 54, s.kind === 'CP' ? 'CP' : s.kind === 'ROE' ? 'spin lock' : 'TOCSY'); }); w = 62; }
        else { const cs = uniq([a, b]); g += lab(cs[0], x + 13, 'Δ') + lab(cs[0], x + 43, 'Δ'); cs.forEach(c => { g += p180(c, x + 28) + p90(c, x + 60); }); w = 70; }
      } else if (s.type === 'evo') {
        const c = el(s.at[0]); g += lab(c, x + 24, 't' + (s.ax ? ' (' + s.ax + ')' : '')) + '<line class="q-t" x1="' + (x + 4) + '" y1="' + (Y[c] - 9) + '" x2="' + (x + 44) + '" y2="' + (Y[c] - 9) + '"/>';
        if (c !== 'H' && Y.H != null) g += p180('H', x + 24);
        w = 48;
      } else if (s.type === 'self') { const c = el(s.at[0]), t = (s.kind || '').slice(0, 16), bw = Math.max(46, t.length * 5.4 + 10); g += box(c, x + 4, bw, t); w = bw + 8; }
      else if (s.type === 'det') {
        const c = el(s.at[0]); let d = 'M' + (x + 6) + ' ' + Y[c];
        for (let i = 0; i <= 40; i++) d += ' L' + (x + 6 + i * 1.3).toFixed(1) + ' ' + (Y[c] - 10 - 10 * Math.cos(i * 0.9) * Math.exp(-i / 13)).toFixed(1);
        g += '<path class="q-f" d="' + d + '"/>';
        chans.filter(k => k !== c && c === 'H').forEach(k => { g += box(k, x + 6, 52, 'decouple'); });
        w = 66;
      }
      if (w) blocks.push('<g class="q-g' + st + '">' + g + '<line class="q-n" x1="' + (x + 3) + '" y1="22" x2="' + (x + w - 3) + '" y2="22"/><circle class="q-c" cx="' + (x + w / 2) + '" cy="14" r="8"/><text class="q-ct" x="' + (x + w / 2) + '" y="17.2">' + s.num + '</text></g>');
      x += w;
    });
    const W = x + 16;
    const base = chans.map(c => '<line class="q-a" x1="40" y1="' + Y[c] + '" x2="' + (W - 8) + '" y2="' + Y[c] + '"/><text class="q-ch n' + c + '" x="6" y="' + (Y[c] - 5) + '">' + NAME[c] + '</text>').join('');
    return '<svg class="seq" viewBox="0 0 ' + W + ' ' + H + '" width="' + W + '" height="' + H + '" role="img" aria-label="Pulse sequence schematic with the same step numbers as the transfer map">' + base + o.join('') + blocks.join('') + '</svg>';
  }

  /* ---- Detailed sequences, redrawn in this app's own notation from the catalogue diagrams. ----
     Each column: channel keys H/C/N/P with '90', '180', 's90:label', 's180:label', 'box:label', 'fid', 'dec:label'
     (append '@phase' to a pulse), dl = delay label on row r, G = gradient label, s = transfer step (number or [from, to]). */
  const se = (X, back) => [{ dl: 'd1', r: 'H' },
    { H: '90', s: 1 }, { dl: 'd4', r: 'H', s: 2 }, { H: '180', C: '180', s: 2 }, { dl: 'd4', r: 'H', s: 2 }, { H: '90@y', C: '90', G: 'G1', s: 2 },
    { dl: 'd22', r: 'C', s: 3, G: 'G2' }, { C: '180', [X]: '180', s: 3 }, { dl: 'd22', r: 'C', s: 3, G: 'G2' }, { C: '90@y', [X]: '90@φ1', s: 3 },
    { dl: 'd0', r: X, s: 4 }, { H: '180', C: '180', s: 4 }, { dl: 'd0', r: X, s: 4 }, { [X]: '180', s: 4 }, { dl: 'ε', r: X, s: 4 },
    { [X]: '90', C: '90@y', G: X === 'N' ? 'G5' : 'G1', s: 5 },
    { dl: 'd10', r: 'C', s: 6 }, { H: '180', [X]: '180', s: 6 }, { dl: 'd22', r: 'C', s: 6, G: 'G3' }, { C: '180', [X]: '180', s: 6 }, { dl: 'd22−d10', r: 'C', s: 6, G: 'G3' },
    { H: '90', C: '90', s: 7 }, { dl: back, r: 'H', s: 7 }, { H: '180', C: '180', s: 7 }, { dl: back, r: 'H', s: 7 }, { H: '90@y', C: '90@ψ', s: 7 },
    { dl: 'd4', r: 'H', s: 7 }, { H: '180', C: '180', s: 7 }, { dl: 'd4', r: 'H', s: 7 }, { H: '90', s: 7 }, { dl: 'δ', r: 'H', s: 7 }, { H: '180', G: 'G4', s: 7 }, { dl: 'δ', r: 'H', s: 7 },
    { H: 'fid', C: 'dec:GARP', [X]: 'dec:GARP', s: 8 }];
  const hp = dino => [{ H: 'box:presat (d1)' }, { P: '90', G: dino ? '' : 'G1', s: 1 }, { dl: 'd0', r: 'P', s: 2 }, { H: '180', C: '180 (opt.)', s: 2 }, { dl: 'd0', r: 'P', s: 2 },
    { H: 'box:DIPSI-2', P: 'box:DIPSI-2 (d21)', s: dino ? 3 : [3, 4] }]
    .concat(dino ? [{ H: '90', s: 4 }, { H: 'box:CW, d8', s: 4 }, { H: '90', G: 'G1', s: 4 }] : [])
    .concat([{ H: 'fid', P: 'dec:GARP', C: 'dec:GARP', s: 5 }]);
  /* sensitivity-enhanced 15N back-transfer and read-out, shared by the relaxation experiments */
  const tailN = (sT, sD) => [{ H: '90', N: '90', s: sT }, { dl: 'd24', r: 'H', s: sT }, { H: '180', N: '180', s: sT }, { dl: 'd24', r: 'H', s: sT }, { H: '90@y', N: '90@ψ', s: sT },
    { dl: 'd26', r: 'H', s: sT }, { H: '180', N: '180', s: sT }, { dl: 'd26', r: 'H', s: sT }, { H: '90', s: sT }, { dl: 'δ', r: 'H', s: sT }, { H: '180', G: 'G3', s: sT }, { dl: 'δ', r: 'H', s: sT },
    { H: 'fid', N: 'dec:GARP', s: sD }];
  const relN = mid => [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd26', r: 'H', s: 2 }, { H: '180', N: '180', s: 2 }, { dl: 'd26', r: 'H', s: 2 }, { H: '90@y', s: 2 }, { H: 's90:p11', G: 'G1', s: 2 },
    { N: '90@φ1', s: 2 }, { dl: 'd25', r: 'N', s: 2 }, { H: '180', N: '180', s: 2 }, { dl: 'd25', r: 'N', s: 2 }].concat(mid, [
    { dl: 'd25', r: 'N', G: 'G2', s: 4 }, { N: '180', s: 4 }, { dl: 'd0', r: 'N', s: 4 }, { H: '180', C: 's180:p8 (opt.)', s: 4 }, { dl: 'd0', r: 'N', s: 4 }, { dl: 'd25', r: 'N', G: 'G2', s: 4 }], tailN(5, 6));
  const DET = {
    hcp_tocsy: ['na_hcpdigpjr3d', 972, [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd4', r: 'H', s: 2 }, { H: '180', C: '180', s: 2 }, { dl: 'd4', r: 'H', s: 2 }, { H: '90@y', C: '90', G: 'G1', s: 2 },
      { dl: 'd22', r: 'C', G: 'G2', s: 3 }, { C: '180', P: '180', s: 3 }, { dl: 'd22', r: 'C', G: 'G2', s: 3 }, { C: '90', P: '90@φ1', G: 'G3', s: 3 },
      { dl: 'd0', r: 'P', s: 4 }, { H: '180', C: '180', s: 4 }, { dl: 'd0', r: 'P', s: 4 }, { P: '180', s: 4 }, { dl: 'ε', r: 'P', s: 4 }, { P: '90', C: '90', G: 'G4', s: 5 },
      { dl: 'd22', r: 'C', s: 5 }, { C: '180', P: '180', s: 5 }, { dl: 'd22', r: 'C', s: 5 },
      { C: 'box:DIPSI-3 (d15)', s: 6 }, { C: 's180:p10', s: 6 },
      { dl: 'd10', r: 'C', s: 7 }, { H: '180', C: 's180:p10', P: '180', s: 7 }, { dl: 'd10', r: 'C', s: 7 },
      { dl: 'd4', r: 'C', s: 8 }, { H: '90@−x', C: '90', G: 'G5', s: 8 }, { dl: 'd19', r: 'H', G: 'G6', s: 8 }, { H: 'box:1-1 echo', C: '180', s: 8 }, { dl: 'd4', r: 'H', G: 'G6', s: 8 },
      { H: 'fid', C: 'dec:GARP', P: 'dec:GARP', s: 9 }]],
    hcch_cosy: ['na_trhcchco3d', 948, [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd4', r: 'H', s: 2 }, { H: '180', C: 's180:p8', s: 2 }, { dl: 'd4', r: 'H', s: 2 }, { H: '90@y', G: 'G3', s: 2 }, { C: '90', G: 'G4', s: 2 },
      { dl: 'd25', r: 'C', s: 3 }, { H: '180', C: 's180:p15', s: 3 }, { dl: 'd25', r: 'C', G: 'G4', s: 3 }, { C: 's90:p15@y', s: 3 }, { C: '90', s: 3 }, { dl: 'd27', r: 'C', G: 'G5', s: 3 }, { C: '180', s: 3 }, { dl: 'd27', r: 'C', G: 'G5', s: 3 }, { C: '90', s: 3 },
      { dl: 'd0', r: 'C', s: 4 }, { N: '180', s: 4 }, { dl: 'd0', r: 'C', s: 4 }, { C: '180', s: 4 },
      { C: '90@y', s: 5 }, { dl: 'd27', r: 'C', G: 'G6', s: 5 }, { C: '180', s: 5 }, { dl: 'd27', r: 'C', G: 'G6', s: 5 }, { C: '90', s: 5 },
      { dl: 'd10', r: 'C', s: 6 }, { N: '180', s: 6 }, { dl: 'd22−d4', r: 'C', G: 'G1', s: 6 }, { C: '180', s: 6 }, { dl: 'd22−d4−d10', r: 'C', G: 'G1', s: 6 },
      { H: '90@ψ', s: 7 }, { dl: 'd4', r: 'H', s: 7 }, { H: '180@y', C: '180', s: 7 }, { dl: 'd4', r: 'H', s: 7 }, { H: '90@−x', C: '90@y', s: 7 }, { dl: 'd4', r: 'H', s: 7 }, { H: '180', C: 's180:p8', s: 7 }, { dl: 'd4', r: 'H', G: 'G2', s: 7 },
      { H: 'fid', C: 'dec:GARP', s: 8 }]],
    ct_hsqc: ['hsqcctetgpsp.2', 922, [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd4', r: 'H', s: 2 }, { H: '180', C: 's180:p8', s: 2 }, { dl: 'd4', r: 'H', s: 2 }, { H: 'box:p28', s: 2 }, { H: '90@y', C: '90@φ1', s: 2 },
      { dl: 'd0', r: 'C', s: [3, 4] }, { H: '180', N: '180 (opt.)', s: [3, 4] }, { dl: 'd23', r: 'C', s: [3, 4] }, { C: '180', s: [3, 4] }, { dl: 'd23−d0', r: 'C', G: 'G1', s: [3, 4] },
      { H: '90', C: '90', s: 5 }, { dl: 'd4', r: 'H', s: 5 }, { H: '180', C: 's180:p8', s: 5 }, { dl: 'd4', r: 'H', G: 'G2', s: 5 }, { H: 'fid', C: 'dec:GARP', s: 6 }]],
    hnco: ['b_trhncogp3d', 713, [{ dl: 'd1', r: 'H' }, { H: 's90:p41', G: 'G1', s: 1 }, { dl: 'd26', r: 'H', s: 2 }, { H: 's180:p42@y', N: '180', s: 2 }, { dl: 'd26', r: 'H', s: 2 }, { H: 's90:p41@−y', G: 'G1', s: 2 }, { N: '90', G: 'G4', s: 2 },
      { dl: 'd23', r: 'N', s: 3 }, { N: '180', C: 's180:p14', s: 3 }, { dl: 'd23', r: 'N', s: 3 }, { N: '90@y', G: 'G5', s: 3 }, { C: 's90:p13', s: 3 },
      { dl: 'd0', r: 'C', s: 4 }, { N: '180', C: 's180:p14 off-res.', s: 4 }, { dl: 'd0', r: 'C', s: 4 }, { C: 's180:p14', s: 4 },
      { C: 's90:p13', G: 'G6', s: 5 }, { N: '90@φ1', s: 5 }, { dl: 'd10', r: 'N', s: 5 }, { C: 's180:p14 off-res.', s: 5 }, { dl: 'd23', r: 'N', s: 5 }, { N: '180', C: 's180:p14', s: 5 }, { dl: 'd23−d10', r: 'N', s: 5 },
      { H: 's90:p43@ψ', G: 'G2', s: 6 }, { dl: 'd26', r: 'H', s: 6 }, { H: 's180:p42', N: '180', s: 6 }, { dl: 'd26', r: 'H', s: 6 }, { H: 's90:p43', N: '90', G: 'G2', s: 6 },
      { dl: 'd26', r: 'H', G: 'G3', s: 6 }, { H: 's180:p42', N: '180', s: 6 }, { dl: 'd26', r: 'H', G: 'G3', s: 6 }, { N: '90@ψ', s: 6 }, { H: 'fid', s: 7 }]],
    n_t1: ['hsqct1etf3gpsi3d', 830, relN([{ N: '90', s: 3 }, { H: 'box:DIPSI-2', s: 3 }, { dl: 'd7', r: 'N', G: 'G4', s: 3 }, { N: '90@y', s: 3 }])],
    n_t2: ['hsqct2etf3gpsi3d', 832, relN([{ dl: 'd21', r: 'N', s: 3 }, { H: '180', N: 'box:CPMG loop (d20)', s: 3 }, { dl: 'd21', r: 'N', s: 3 }])],
    n_hetnoe: ['hsqcnoef3gpsi', 829, [{ H: 'box:120° pulse train, on / off (d1)', s: 2 }, { H: 's90:p11', s: 2 }, { N: '90', G: 'G1', s: 1 },
      { dl: 'd25', r: 'N', G: 'G2', s: 3 }, { N: '180@y', s: 3 }, { dl: 'd0', r: 'N', s: 3 }, { H: '180', C: 's180:p8 (opt.)', s: 3 }, { dl: 'd0', r: 'N', s: 3 }, { dl: 'd25', r: 'N', G: 'G2', s: 3 }].concat(tailN(4, 5))],
    fhsqc: ['hsqcfpf3gpphwg', 926, [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd26', r: 'H', s: 2 }, { H: '180', N: '180', s: 2 }, { dl: 'd26', r: 'H', s: 2 }, { H: '90@y', s: 2 }, { H: 's90:p11', G: 'G1', s: 2 }, { N: '90@φ1', s: 2 },
      { dl: 'd0', r: 'N', s: 3 }, { H: '180', C: 's180:p8', s: 3 }, { dl: 'd0', r: 'N', s: 3 }, { N: '180', s: 3 }, { dl: 'ε', r: 'N', s: 3 },
      { N: '90', G: 'G2', s: 4 }, { H: 's90:p11@−x', s: 4 }, { H: '90', s: 4 }, { dl: 'd26', r: 'H', G: 'G3', s: 4 }, { H: 'box:WATERGATE', N: '180', s: 4 }, { dl: 'd26', r: 'H', G: 'G3', s: 4 }, { H: 'fid', N: 'dec:GARP', s: 5 }]],
    hcp: ['na_hcpetgpsi3d', 970, se('P', 'd24')],
    hcn: ['na_hcnetgpsi3d', 929, se('N', 'd4')],
    hnn_cosy: ['na_hnncosygpphwg', 961, [{ dl: 'd1', r: 'H' }, { H: '90', s: 1 }, { dl: 'd26', r: 'H', s: 2 }, { H: '180', N: '180', s: 2 }, { dl: 'd26', r: 'H', s: 2 }, { H: '90@y', G: 'G1', s: 2 }, { N: '90', s: 2 },
      { dl: 'd23', r: 'N', s: 3 }, { N: '180', s: 3 }, { dl: 'd23', r: 'N', s: 3 }, { N: '90@φ1', s: 3 },
      { dl: 'd0', r: 'N', s: 4 }, { H: '180', s: 4 }, { dl: 'd0', r: 'N', s: 4 },
      { N: '90', s: 5 }, { dl: 'd23', r: 'N', s: 5 }, { N: '180', s: 5 }, { dl: 'd23', r: 'N', s: 5 },
      { N: '90', G: 'G2', s: 6 }, { H: '90', s: 6 }, { dl: 'd26', r: 'H', s: 6, G: 'G3' }, { H: 'box:WATERGATE', N: '180', s: 6 }, { dl: 'd26', r: 'H', s: 6, G: 'G3' },
      { H: 'fid', N: 'dec:GARP', s: 7 }]],
    sfhmqc_n: ['sfhmqcf3gpph', 710, [{ dl: 'd1', r: 'H' }, { H: 's90:p39', G: 'G2', s: 1 }, { dl: 'd21', r: 'H', G: 'G1', s: 2 }, { N: '90@φ1', s: 2 },
      { dl: 'd0', r: 'N', s: 3 }, { H: 's180:p40', C: 's180:p8 (opt.)', s: 3 }, { dl: 'd0', r: 'N', s: 3 }, { N: '90', s: 4 }, { dl: 'd21', r: 'H', G: 'G1', s: 4 }, { H: 'fid', N: 'dec:GARP', s: 5 }]],
    btrosy: ['b_trosyf3gpph', 712, [{ dl: 'd1', r: 'H' }, { H: 's90:p41', G: 'G1', s: 1 }, { dl: 'd26', r: 'H', s: 2 }, { H: 's180:p42@y', N: '180', C: 's180:p8 (opt.)', s: 2 }, { dl: 'd26', r: 'H', s: 2 },
      { H: 's90:p41@−y', G: 'G1', s: 2 }, { N: '90@φ1', G: 'G4', s: 2 }, { dl: 'd0', r: 'N', s: 3 },
      { H: 's90:p43@ψ', G: 'G2', s: 4 }, { dl: 'd24', r: 'H', s: 4 }, { H: 's180:p42', N: '180', s: 4 }, { dl: 'd24', r: 'H', s: 4 }, { H: 's90:p43', N: '90@Θ', G: 'G2', s: 4 },
      { dl: 'd26', r: 'H', G: 'G3', s: 4 }, { H: 's180:p42', N: '180', s: 4 }, { dl: 'd26', r: 'H', G: 'G3', s: 4 }, { N: '90', s: 4 }, { H: 'fid', s: 5 }]],
    noesy_hsqc_c: ['na_c6noesyhsqcgp3d', 925, [{ H: 'box:CW (d1)' }, { H: '90', s: 1 }, { dl: 'd0', r: 'H', s: 2 }, { C: 's180:p8', N: '180 (opt.)', s: 2 }, { dl: 'd0', r: 'H', s: 2 },
      { H: '90', s: 3 }, { dl: 'd8', r: 'H', G: 'G3', s: 3 }, { H: '90', s: 3 },
      { dl: 'd4', r: 'H', s: 4 }, { H: '180', C: 's180:p8', s: 4 }, { dl: 'd4', r: 'H', s: 4 }, { H: '90@y', s: 4 }, { C: '90@φ1', G: 'G4', s: 4 },
      { dl: 'd10', r: 'C', s: 5 }, { H: '180', C: 's180:p14 on C5', N: '180 (opt.)', s: 5 }, { dl: 'd10', r: 'C', s: 5 }, { C: 's180:p14', s: 5 },
      { H: '90', C: '90', s: 6 }, { dl: 'd4', r: 'H', G: 'G5', s: 6 }, { H: 'box:3-9-19', C: 's180:p8', s: 6 }, { dl: 'd4', r: 'H', G: 'G5', s: 6 }, { H: 'fid', C: 'dec:GARP', s: 7 }]],
    hp_tocsy: ['na_hpdi', 976, hp(false)],
    hp_dino: ['na_hpdino', 977, hp(true)]
  };

  function drawDet(cols, cur) {
    const rows = ['H', 'C', 'N', 'P'].filter(c => cols.some(k => k[c] != null || k.r === c)).concat(cols.some(k => k.G) ? ['G'] : []);
    const Y = {}; rows.forEach((c, i) => { Y[c] = 74 + i * 56; });
    const Hh = 74 + (rows.length - 1) * 56 + 30, PH = 26; let x = 44; const o = [], spans = [];
    const inStep = s => s != null && (Array.isArray(s) ? cur >= s[0] && cur <= s[1] : s === cur);
    const isPast = s => s != null && (Array.isArray(s) ? s[1] : s) < cur;
    cols.forEach(k => {
      let w = 18, g = '';
      const cells = rows.filter(c => c !== 'G' && k[c] != null).map(c => [c, k[c]]);
      cells.forEach(cv => { const m = cv[1].split('@')[0], kind = m.split(':')[0], lbl = m.split(':')[1] || ''; if (kind === 'box' || kind === 'dec') w = Math.max(w, lbl.length * 5.8 + 20); if (kind === 'fid') w = Math.max(w, 62); if (lbl && kind.charAt(0) === 's') w = Math.max(w, lbl.length * 5 + 6, 24); if (/\(/.test(m) && kind.charAt(0) !== 's' && kind !== 'box') w = Math.max(w, 42); });
      if (k.dl) w = Math.max(30, k.dl.length * 6.2 + 12);
      const cx = x + w / 2;
      cells.forEach(cv => {
        const c = cv[0], parts = cv[1].split('@'), m = parts[0], ph = parts[1], kind = m.split(':')[0], lbl = m.split(':')[1] || '', y = Y[c];
        if (kind === '90' || kind.indexOf('90 ') === 0) g += '<rect class="q-p" x="' + (cx - 1.5) + '" y="' + (y - PH) + '" width="3" height="' + PH + '"/>';
        else if (kind === '180' || kind.indexOf('180 ') === 0) g += '<rect class="q-p" x="' + (cx - 4) + '" y="' + (y - PH) + '" width="8" height="' + PH + '"/>';
        else if (kind === 's90' || kind === 's180') { const rw = kind === 's90' ? 5 : 9; g += '<path class="q-s" d="M' + (cx - rw) + ' ' + y + ' Q' + (cx - rw) + ' ' + (y - PH * 1.25) + ' ' + cx + ' ' + (y - PH) + ' Q' + (cx + rw) + ' ' + (y - PH * 1.25) + ' ' + (cx + rw) + ' ' + y + ' Z"/><text class="q-l" x="' + cx + '" y="' + (y + 12) + '">' + esc(lbl) + '</text>'; }
        else if (kind === 'box' || kind === 'dec') g += '<rect class="q-b" x="' + (x + 3) + '" y="' + (y - (kind === 'dec' ? 14 : PH - 4)) + '" width="' + (w - 6) + '" height="' + (kind === 'dec' ? 14 : PH - 4) + '" rx="2"/><text class="q-bt" x="' + cx + '" y="' + (y - (kind === 'dec' ? 4 : 8)) + '">' + esc(lbl) + '</text>';
        else if (kind === 'fid') { let d = 'M' + (x + 4) + ' ' + y; for (let i = 0; i <= 40; i++) d += ' L' + (x + 4 + i * 1.35).toFixed(1) + ' ' + (y - 11 - 11 * Math.cos(i * 0.9) * Math.exp(-i / 13)).toFixed(1); g += '<path class="q-f" d="' + d + '"/>'; }
        if (/\(opt\.\)/.test(m) && kind.charAt(0) !== 's') g += '<text class="q-l" x="' + cx + '" y="' + (y + 12) + '">(opt.)</text>';
        if (ph) g += '<text class="q-ph" x="' + cx + '" y="' + (y - PH - 4) + '">' + esc(ph) + '</text>';
      });
      if (k.dl) g += '<text class="q-l" x="' + cx + '" y="' + (Y[k.r] - 8) + '">' + esc(k.dl) + '</text>';
      if (k.G) g += '<path class="q-gr" d="M' + (cx - 5) + ' ' + Y.G + ' Q' + cx + ' ' + (Y.G - 30) + ' ' + (cx + 5) + ' ' + Y.G + ' Z"/><text class="q-gl" x="' + cx + '" y="' + (Y.G + 12) + '">' + esc(k.G) + '</text>';
      const st = !cur || k.s == null ? '' : inStep(k.s) ? ' cur' : isPast(k.s) ? ' past' : ' wait';
      o.push('<g class="q-g' + st + '">' + g + '</g>');
      const key = k.s == null ? null : String(k.s), last = spans[spans.length - 1];
      if (key != null) { if (last && last.key === key && last.x1 === x) last.x1 = x + w; else spans.push({ key: key, s: k.s, x0: x, x1: x + w }); }
      x += w;
    });
    const W = x + 12;
    const base = rows.map(c => '<line class="q-a" x1="38" y1="' + Y[c] + '" x2="' + (W - 6) + '" y2="' + Y[c] + '"/><text class="q-ch n' + c + '" x="4" y="' + (Y[c] - 5) + '">' + (c === 'G' ? 'Gz' : NAME[c]) + '</text>').join('');
    const marks = spans.map(p => { const st = !cur ? '' : inStep(p.s) ? ' cur' : isPast(p.s) ? ' past' : ' wait', mx = (p.x0 + p.x1) / 2, t = Array.isArray(p.s) ? p.s[0] + '–' + p.s[1] : p.s, r = Array.isArray(p.s) ? 12 : 8;
      return '<g class="q-g' + st + '"><line class="q-n" x1="' + (p.x0 + 2) + '" y1="24" x2="' + (p.x1 - 2) + '" y2="24"/><rect class="q-c" x="' + (mx - r) + '" y="6" width="' + 2 * r + '" height="16" rx="8"/><text class="q-ct" x="' + mx + '" y="17.2">' + t + '</text></g>'; }).join('');
    return '<svg class="seq" viewBox="0 0 ' + W + ' ' + Hh + '" width="' + W + '" height="' + Hh + '" role="img" aria-label="Detailed pulse sequence with phases, delays and gradients">' + base + o.join('') + marks + '</svg>';
  }

  let mode = 'detail';
  function catHtml(x) {
    const c = CAT[x.id];
    if (!c) return '<p class="muted small">The catalogue volume used here (vol. II, biomolecular experiments) has no diagram for this sequence. Basic 1D and 2D experiments are in volume I.</p>';
    return '<div class="catbox"><span class="k">Bruker pulse program catalogue, vol. II, p. ' + c[1] + '</span><p><code>' + esc(c[0]) + '</code> <span class="muted small">' + REL[c[2]] + '. Used here: <code>' + esc(x.pp) + '</code></span></p>' +
      (c[3].length ? '<table class="par"><tbody>' + c[3].map(r => '<tr><th><code>' + esc(r[0]) + '</code></th><td>' + esc(r[1]) + '</td></tr>').join('') + '</tbody></table>' : '<p class="muted small">The catalogue page shows the full diagram with phases and gradients; it lists no delay values beyond those in the setup table below.</p>') + '</div>';
  }

  window.SEQ = {
    attach: function (x, sc, steps, cur) {
      const fig = document.querySelector('#path .molfig'); if (!fig) return;
      let grid = document.querySelector('#path .pathgrid');
      if (!grid) { grid = document.createElement('div'); grid.className = 'pathgrid'; fig.parentNode.insertBefore(grid, fig); grid.appendChild(fig); }
      const old = grid.querySelector('.seqfig'); if (old) old.remove();
      last = [x, sc, steps, cur];
      const d = DET[x.id], det = d && mode === 'detail';
      const sw = d ? '<div class="tabs seqtabs"><button type="button" class="tab' + (det ? ' on' : '') + '" data-seqmode="detail">Detailed sequence</button><button type="button" class="tab' + (det ? '' : ' on') + '" data-seqmode="simple">Simplified</button></div>' : '';
      const cap = det ? 'Redrawn from the catalogue diagram of <code>' + esc(d[0]) + '</code> (vol. II, p. ' + d[1] + ')' + (CAT[x.id] && CAT[x.id][2] !== 'same' ? ', which is not the exact program of this parameter set (see the box below)' : '') + '.Narrow bar 90°, wide bar 180°, rounded shapes are selective pulses, letters above a pulse are its phase (x if none), Gz row shows gradients. Pulse widths and delays are not to scale; check the catalogue page or the pulse program for the phase cycle.'
        : 'Schematic pulse sequence built from the transfer steps. Narrow bar 90°, wide bar 180°, Δ transfer delay, t evolution period. Phases, gradients, water suppression and shaped pulses are left out.';
      grid.insertAdjacentHTML('beforeend', '<figure class="seqfig">' + sw + '<div class="molwrap">' + (det ? drawDet(d[2], cur) : draw(sc, steps, cur)) + '</div><figcaption>' + cap + '</figcaption>' + catHtml(x) + '</figure>');
    }
  };
  let last = null;
  document.addEventListener('click', e => {
    const b = e.target.closest && e.target.closest('[data-seqmode]'); if (!b || !last) return;
    mode = b.getAttribute('data-seqmode'); window.SEQ.attach(last[0], last[1], last[2], last[3]);
  });
})();
