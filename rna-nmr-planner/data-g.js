/* Experiments for 13C/15N-labeled RNA, part 3: ribose spin systems, backbone via 31P, 13C dynamics, 13C RDCs. */
(function () {
  const R = window.RNA, X = R.X, h = R.h;
  const N15 = (ppm) => ['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to ' + ppm + ' ppm.'];
  const REGIONS = 'Three carbon regions are measured in separate runs: C2/C6/C8 (O2P 143 ppm, CNST2 205 Hz, decoupling offset CNST28 105 ppm), C5 (102 ppm, 180 Hz, 150 ppm) and C1′ (90 ppm, 170 Hz, 72 ppm).';
  const CC = 'In uniformly ¹³C-labeled RNA, carbon–carbon couplings and carbon–carbon dipolar relaxation complicate the analysis: C1′, C5 and pyrimidine C6 have carbon neighbours. Purine C8 and adenine C2 are the cleanest probes.';

  const tocsy = (id, n, s, set, pp, f1, what, src, evoTxt, l1txt, end) => X.push({
    id: id, g: 'CN', D: '3D', n: n, s: s, set: set, pp: pp, goals: ['sugar'], solv: 'both', need: 'C', ch: 'HCN',
    what: what,
    dims: [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['h1p'] },
      { ax: 'F2', n: 'C', sw: 10, o: 90, op: 'O2P', td: 32, rg: ['c1p'] }, f1],
    ns: 8, nsm: 4, d1: 1,
    par: [['L1', '1 or 3', l1txt], ['CNST4', '4 or 6', 'Multiplicity selection: 4 for CH only, 6 for CH and CH₂ (includes C5′).'], ['O3P', '160 ppm', 'N9/N1 region, for ¹⁵N decoupling.']]
      .concat(id === 'hcch_h' ? [['CNST28', '78 ppm', 'Carbon offset for the ribose carbons.']] : []),
    opt: [['-DCALC_SP', 'Calculates the C1′-selective pulse (P24/SP9) automatically. Recommended.']],
    lim: ['Two runs are needed: L1 = 1 (4.7 ms mixing) shows only the 2′ position, L1 = 3 (14.1 ms) shows all positions. Comparing them is what separates the 2′ and 3′ signals.',
      'Everything is detected on H1′ (5–6 ppm), next to water. In H₂O the water suppression has to be good; D₂O is easier.',
      'Transfer to the far end of the ribose (C5′/H5′) is weak and needs the longer mixing time.'],
    paths: [{ t: 'Ribose → C1′ → H1′', sc: 'one:G', st: src.concat(evoTxt ? [['@', evoTxt[0], 'F1', evoTxt[1]]] : [], [
      [['G.C2p', 'G.C3p', 'G.C4p'], 'G.C1p', 'TOC', '¹J(CC) ≈ 40–45 Hz', 'FLOPSY carbon TOCSY: magnetization flows along the chain of ribose carbons. After 4.7 ms only C2′ has reached C1′; after 14.1 ms C3′, C4′ and C5′ have too.'],
      ['@', 'G.C1p', 'F2', 't₂: C1′ shift, selected with a C1′-selective pulse.'],
      ['G.C1p', 'G.H1p', 'J', '¹J(C1′,H1′) ≈ 170 Hz', 'Reverse INEPT to H1′.'],
      ['!', 'G.H1p', 'F3', 'Detected on H1′.']]), end: end }],
    ref: 'Kay et al., J. Magn. Reson. B 101, 333 (1993)'
  });
  tocsy('hcch_c', '3D selective (H)CCH-TOCSY', 'ribose carbons on the C1′–H1′ peak', 'NA_SHCCHFLGPSP3D', 'na_shcchflgpsp3d',
    { ax: 'F1', n: 'C', sw: 35, o: 77, oq: 1, td: 64, rg: ['c1p', 'c4p', 'c2p3p', 'c5p'] },
    'Assigns all ribose carbons of a nucleotide by sending their magnetization to the well-resolved C1′–H1′ pair. Each C1′–H1′ peak becomes a strip that lists C2′, C3′, C4′ and C5′ of the same sugar.',
    [['*', ['G.H2p', 'G.H3p', 'G.H4p'], 'Start on the ribose protons.'],
      [['G.H2p', 'G.H3p', 'G.H4p'], ['G.C2p', 'G.C3p', 'G.C4p'], 'J', '¹J(CH) ≈ 145–160 Hz', 'INEPT to the attached carbons.']],
    [['G.C2p', 'G.C3p', 'G.C4p'], 't₁: shifts of the ribose carbons.'],
    'FLOPSY loop count: 1 for transfer from C2′ only, 3 for transfer from all ribose carbons.',
    'Starts on a ribose proton, ends on H1′. Peak at (F1 = C2′…C5′, F2 = C1′, F3 = H1′).');
  tocsy('hcch_h', '3D selective H(C)CH-TOCSY', 'ribose protons on the C1′–H1′ peak', 'NA_SHCCHFLGPSP3D2', 'na_shcchflgpsp3d2',
    { ax: 'F1', n: 'H', sw: 4, o: 4.7, td: 64, rg: ['rib', 'h1p'] },
    'The proton version of the selective HCCH-TOCSY: each C1′–H1′ peak becomes a strip that lists H2′, H3′, H4′ and H5′/H5″ of the same sugar. Together with the carbon version it completes the ribose assignment, which the ¹H TOCSY cannot do in A-form RNA.',
    [['*', ['G.H2p', 'G.H3p', 'G.H4p'], 'Start on the ribose protons.'],
      ['@', ['G.H2p', 'G.H3p', 'G.H4p'], 'F1', 't₁: shifts of the ribose protons.'],
      [['G.H2p', 'G.H3p', 'G.H4p'], ['G.C2p', 'G.C3p', 'G.C4p'], 'J', '¹J(CH) ≈ 145–160 Hz', 'INEPT to the attached carbons.']],
    null,
    'FLOPSY loop count: 1 for transfer from H2′ only, 3 for transfer from all ribose protons.',
    'Starts on a ribose proton, ends on H1′. Peak at (F1 = H2′…H5″, F2 = C1′, F3 = H1′).');
  X[X.length - 2].axNote = 'Bruker gives the width of the all-ribose ¹³C dimension (35 ppm) but not its centre; 77 ppm is assumed here.';

  const hcpEnd = 'Both residues give peaks at the same ³¹P frequency, which links nucleotide i to nucleotide i+1 through the backbone.';
  X.push({
    id: 'hcp', g: 'CN', D: '3D', n: '3D HCP', s: 'sequential link through ³¹P',
    set: 'NA_HCPETGPSI3D', pp: 'na_hcpetgpsi3d', goals: ['backbone', 'walk'], solv: 'D2O', need: 'C', ch: 'HCP', maxNt: 30,
    what: 'Sequential assignment through the backbone, by bonds only. Ribose C–H pairs on both sides of a phosphate (C3′/C4′ of residue i, C4′/C5′ of residue i+1) are correlated with that ³¹P through carbon–phosphorus couplings. It does not assume any helical geometry.',
    dims: [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['rib'] },
      { ax: 'F2', n: 'C', sw: 25, o: 72, op: 'O2P', td: 48, rg: ['c4p', 'c2p3p', 'c5p'] },
      { ax: 'F1', n: 'P', sw: 4, o: -1, op: 'O3P', td: 32, rg: ['pp'] }],
    ns: 8, nsm: 4, d1: 1,
    par: [['CNST11', '4 or 6', 'Multiplicity selection: 4 for CH only, 6 for CH and CH₂ (C5′).']],
    lim: ['Bruker’s tutorial puts the practical limit at about 30 nt: H3′/H4′/H5′ and their carbons overlap, and ³¹P dispersion is small.',
      'The couplings are small (about 8–10 Hz to C4′, 3–5 Hz to C3′ and C5′), so transfers are long. C4′ gives the strongest peaks.',
      R.txt.P_FIELD,
      'Needs a probe with simultaneous ¹H, ¹³C and ³¹P channels.'],
    paths: [{ t: 'C4′(i) and C4′(i+1) share one ³¹P', sc: 'seq:GC', st: [
      ['*', ['i.H4p', 'j.H4p'], 'Start on the ribose protons. Follow H4′ of both residues.'],
      [['i.H4p', 'j.H4p'], ['i.C4p', 'j.C4p'], 'J', '¹J(CH) ≈ 150 Hz', 'INEPT to the attached carbons.'],
      [['i.C4p', 'j.C4p'], 'j.P', 'J', '³J(C4′,P) ≈ 8–10 Hz', 'A long INEPT through the carbon–phosphorus coupling. C4′ of residue i and C4′ of residue i+1 both couple to the phosphate between them.'],
      ['@', 'j.P', 'F1', 't₁: ³¹P shift.'],
      ['j.P', ['i.C4p', 'j.C4p'], 'J', '³J(C4′,P)', 'Back to the carbon each pathway came from.'],
      ['@', ['i.C4p', 'j.C4p'], 'F2', 't₂: C4′ shift.'],
      [['i.C4p', 'j.C4p'], ['i.H4p', 'j.H4p'], 'J', '¹J(CH)', 'Back to the proton.'],
      ['!', ['i.H4p', 'j.H4p'], 'F3', 'Detected on H4′ (likewise H3′ of i and H5′/H5″ of i+1).']],
      end: 'Out and back: each pathway ends on the ribose proton it started on. ' + hcpEnd }],
    ref: 'Marino et al., J. Am. Chem. Soc. 116, 6472 (1994)'
  });

  X.push({
    id: 'hcp_tocsy', g: 'CN', D: '3D', n: '3D HCP-TOCSY', s: '³¹P linked to C1′–H1′',
    set: 'NA_HCPDIGPJR3D.2', pp: 'na_hcpdigpjr3d.2', goals: ['backbone', 'walk'], solv: 'D2O', need: 'C', ch: 'HCNP', maxNt: 30,
    what: 'The HCP experiment followed by a carbon TOCSY that carries the magnetization round the ribose to C1′. The ³¹P shift is then read on the well-resolved C1′–H1′ peaks of the two neighbouring nucleotides instead of the crowded H3′/H4′/H5′ region. When resolution allows it can be run as a 2D ³¹P/¹H plane.',
    dims: [{ ax: 'F3', n: 'H', sw: 5, o: 5.8, op: 'CNST16', dir: 1, aq: 0.12, rg: ['h1p'] },
      { ax: 'F2', n: 'C', sw: 5, o: 90, op: 'O2P', td: 32, rg: ['c1p'] },
      { ax: 'F1', n: 'P', sw: 5, o: -1, op: 'O3P', td: 32, rg: ['pp'] }],
    ns: 16, nsm: 8, d1: 1, mix: { p: 'D15', v: 0.014, lab: 'C–C TOCSY mixing', hint: '14 ms.' },
    par: [['CNST16', '5.8 ppm', 'Offset of maximum signal: centre of the H1′ region.'], ['O4P', '160 ppm', 'On the N1/N9 signals (¹⁵N decoupling in F2 and F3).']],
    axNote: 'Bruker lists the proton carrier O1P at 4.7 ppm with a 5 ppm direct width and CNST16 = 5.8 ppm as the offset of maximum signal; the window is drawn around 5.8 ppm here.',
    lim: ['Bruker’s parameter set is written for a QCI ¹H{¹³C,¹⁵N,³¹P} probe.',
      'One more transfer step than HCP, so lower sensitivity; practical for RNAs up to about 30 nt.',
      'Water suppression uses a 1-1 echo, whose excitation maximum is set by CNST16.',
      R.txt.P_FIELD],
    paths: [{ t: '³¹P → C4′ → C1′ → H1′', sc: 'seq:GC', st: [
      ['*', ['i.H4p', 'j.H4p'], 'Start on ribose protons near the phosphate.'],
      [['i.H4p', 'j.H4p'], ['i.C4p', 'j.C4p'], 'J', '¹J(CH) ≈ 150 Hz', 'INEPT to carbon.'],
      [['i.C4p', 'j.C4p'], 'j.P', 'J', 'ⁿJ(C,P) 3–10 Hz', 'To the phosphate between the two residues.'],
      ['@', 'j.P', 'F1', 't₁: ³¹P shift.'],
      ['j.P', ['i.C4p', 'j.C4p'], 'J', 'ⁿJ(C,P)', 'Back to carbon.'],
      [['i.C4p', 'j.C4p'], ['i.C1p', 'j.C1p'], 'TOC', '¹J(CC) ≈ 40–45 Hz', 'DIPSI-3 carbon TOCSY (D15) relays the magnetization round each ribose to C1′.'],
      ['@', ['i.C1p', 'j.C1p'], 'F2', 't₂: C1′ shift.'],
      [['i.C1p', 'j.C1p'], ['i.H1p', 'j.H1p'], 'J', '¹J(C1′,H1′) ≈ 170 Hz', 'Reverse INEPT to H1′.'],
      ['!', ['i.H1p', 'j.H1p'], 'F3', 'Detected on H1′.']],
      end: 'Starts near the phosphate and ends on H1′ of both neighbouring residues. ' + hcpEnd }],
    ref: 'Marino et al., J. Biomol. NMR 5, 87 (1995)'
  });

  const cRelDims = (sw) => [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['aro'] },
    { ax: 'F2', n: 'C', sw: sw, o: 143, op: 'O2P', td: 96, rg: ['c68', 'c2a'] }];
  const PS = 'Bruker’s page lists the widths as SWF1 (¹³C) and SWF2 (¹H). In the pseudo-3D data set the list dimension is F1 (TD1).';
  const cRel = (tag, txt, end) => [{ t: 'Aromatic C8', sc: 'one:G', st: [
    ['*', 'G.H8', 'Start on the aromatic proton.'],
    ['G.H8', 'G.C8', 'J', '¹J(C8,H8) ≈ 205–215 Hz', 'INEPT to C8.'],
    ['~', 'G.C8', tag, txt],
    ['@', 'G.C8', 'F2', 't₁: C8 shift (TROSY-type detection).'],
    ['G.C8', 'G.H8', 'J', '¹J(C8,H8)', 'Back to H8.'],
    ['!', 'G.H8', 'F3', 'Detected on H8. Peak intensity carries the measurement.']], end: end }];

  X.push({
    id: 'c_t1', g: 'CN', D: 'pseudo-3D', n: '¹³C T₁ relaxation', s: 'ps–ns motion at C–H sites',
    set: 'NA_TRT1ETGPSITC3D', pp: 'na_trt1etgpsitc3d', goals: ['dyn'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Longitudinal ¹³C relaxation of aromatic carbons and C1′. Unlike the imino ¹⁵N experiments it reports on every nucleotide, including loops and bulges, on the picosecond-to-nanosecond time scale.',
    dims: cRelDims(30), ns: 8, nsm: 8, d1: 1, extra: 0.6, pseudo: { p: 'VDLIST', n: 8, lab: 'relaxation delays' }, axNote: PS,
    par: [['VDLIST', '8 or more delays, a few ms to 1–2 s', 'Match to the expected T₁.'], ['TD1', '= number of VDLIST entries', 'Pseudo-dimension.'],
      ['CNST2', '205 / 180 / 170 Hz', '¹J(CH) for C2/C6/C8, C5 and C1′.'], ['CNST28', '105 / 150 / 72 ppm', 'Offset of the selective carbon decoupling for the three regions.']],
    opt: [N15(160)],
    lim: [REGIONS, CC, 'Decays can be non-exponential when cross-relaxation or strongly anisotropic motion contributes.'],
    paths: cRel('relax T₁', 'C8 magnetization waits along z for a variable delay from VDLIST and decays with R₁.', 'Out and back with a variable delay on ¹³C. Intensity versus delay gives T₁.'),
    ref: 'Hansen & Al-Hashimi, J. Am. Chem. Soc. 129, 16072 (2007)'
  });

  X.push({
    id: 'c_t1rho', g: 'CN', D: 'pseudo-3D', n: '¹³C T₁ρ relaxation', s: 'R₂ under a spin lock',
    set: 'NA_TRTRETGPSITC3D', pp: 'na_trtretgpsitc3d', goals: ['dyn'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Transverse ¹³C relaxation measured under a spin lock. A direct T₂ measurement is spoiled by carbon–carbon couplings in labeled RNA, so R₂ is obtained from R₁ρ instead. Together with T₁ and the heteronuclear NOE it characterises fast motion; elevated values point to µs–ms exchange.',
    dims: cRelDims(25), ns: 8, nsm: 4, d1: 2, extra: 0.08, pseudo: { p: 'VDLIST', n: 8, lab: 'spin-lock times' }, axNote: PS,
    par: [['CNST27', '2000 Hz', 'Spin-lock field strength.'], ['CNST30', '+2500 / −2000 / +2000 Hz', 'Spin-lock offset for C2/C6/C8, C5 and C1′.'],
      ['SPNAM19 / SPNAM20', 'Gaussramp down / up', 'Adiabatic ramps; use the “+” or “−” shapes according to the sign of CNST30.'],
      ['VDLIST', '8 or more times, about 10 to 100–200 ms', 'Spin-lock durations.'], ['CNST2', '205 / 180 / 170 Hz', '¹J(CH) for the three regions.'], ['CNST28', '105 / 150 / 72 ppm', 'Decoupling offsets.']],
    opt: [N15(160)],
    lim: [REGIONS, 'R₁ρ = R₁cos²θ + R₂sin²θ: every peak needs a correction for its offset from the spin lock, using its own R₁.',
      'The spin lock heats the sample; Bruker advises D1 of 1.5–2.5 s.', CC],
    paths: cRel('spin lock', 'Adiabatic ramps align C8 magnetization with the effective field of the spin lock. It decays with R₁ρ for a variable time from VDLIST.', 'Out and back with a spin-lock period on ¹³C. Intensity versus time gives T₁ρ.'),
    ref: 'Hansen & Al-Hashimi, J. Am. Chem. Soc. 129, 16072 (2007)'
  });

  X.push({
    id: 'c_rd', g: 'CN', D: 'pseudo-2D', n: '¹³C T₁ρ relaxation dispersion', s: 'invisible excited states',
    set: 'NA_SELT1RGPF22D', pp: 'na_selt1rgpf22d', goals: ['dyn'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Quantifies exchange on the microsecond-to-millisecond time scale for one carbon at a time. R₁ρ is measured for many spin-lock strengths and offsets; if the site exchanges with another conformation, the rate varies with them. Fitting the profile gives the exchange rate, the population of the minor state and its chemical shift, even when that state is too sparse to see.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['aro', 'h1p'] }],
    ns: 16, nsm: 8, d1: 2, extra: 0.05, pseudo: { p: 'VDLIST', n: 8, lab: 'spin-lock times' },
    par: [['O2P', 'on the peak', '¹³C shift of the signal of interest.'], ['CNST30', 'on the peak', '¹H shift (ppm) of the signal of interest.'],
      ['CNST21', '100 Hz', 'B₁ field of the selective Hartmann–Hahn transfer.'], ['CNST22', '100–2000 Hz', 'B₁ field of the ¹³C spin lock.'],
      ['CNST28', 'variable', '¹³C offset of the spin lock (Hz).'], ['CNST20', '8000 Hz', 'B₁ field of ¹H CW decoupling during the spin lock.'],
      ['CNST10', 'Hz', '¹³C shift difference for the CSFILTER option.']],
    opt: [['CSFILTER', 'Suppresses signals with a similar ¹H but different ¹³C shift. Set CNST10 to the shift difference in Hz.'],
      ['LABEL_N', '¹⁵N decoupling during acquisition (O3P 160 ppm).']],
    lim: ['One peak per series: O2P and CNST30 have to be set for each resonance, and each needs a grid of spin-lock powers and offsets. A full study takes days per site.',
      'The peak must be resolved enough for selective excitation in both ¹H and ¹³C.',
      'Spin-lock heating limits the highest power and duty cycle; keep D1 at 1.5–2.5 s.',
      'Rates much faster than the strongest spin lock or much slower than the weakest fall outside the window.'],
    paths: [{ t: 'One selected C–H pair', sc: 'one:G', st: [
      ['*', 'G.H8', 'Start on the proton of the chosen C–H pair.'],
      ['G.H8', 'G.C8', 'CP', 'selective Hartmann–Hahn, 100 Hz', 'A weak, matched radio-frequency field on ¹H and ¹³C transfers magnetization only for the pair whose two shifts are on resonance.'],
      ['~', 'G.C8', 'spin lock', 'C8 is locked along an effective field of chosen strength and offset. If the carbon jumps between two shifts, part of the magnetization dephases; the stronger the lock, the less is lost.'],
      ['G.C8', 'G.H8', 'CP', 'selective Hartmann–Hahn', 'Back to the proton.'],
      ['!', 'G.H8', 'F2', 'Detected as a 1D proton spectrum, one per spin-lock time.']],
      end: 'Out and back on a single C–H pair. The measurement is the decay rate R₁ρ as a function of spin-lock power and offset.' }],
    ref: 'Hansen et al., J. Am. Chem. Soc. 131, 3818 (2009)'
  });

  const hetnoe = (id, n, set, pp, o2, sw, key, rg, par, opt, lim, atomH, atomC, sc) => X.push({
    id: id, g: 'CN', D: 'pseudo-3D', n: n, s: 'fast motion at C–H sites', set: set, pp: pp, goals: ['dyn'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Two interleaved ¹H,¹³C spectra, with and without saturation of the protons during the recycle delay. Their intensity ratio is the ¹³C{¹H} heteronuclear NOE. For carbon the rigid-limit value is low (close to 1.1–1.2) and it rises with fast internal motion, the opposite direction to the ¹⁵N NOE.',
    dims: [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: rg }, { ax: 'F2', n: 'C', sw: sw, o: o2, op: 'O2P', td: 96, rg: [key] }],
    ns: 64, nsm: 4, d1: 5, pseudo: { p: 'TD1', n: 2, lab: 'saturated / reference' }, axNote: PS,
    par: par.concat([['D1', '5 s or longer', 'A long recycle delay is essential for accurate values.'], ['TD1', '2', 'Saturated and reference spectrum.']]),
    opt: opt,
    lim: lim.concat(['Starts from ¹³C polarisation, a quarter of the proton’s, with D1 ≥ 5 s and NS = 64: a long experiment.', CC]),
    paths: [{ t: 'Steady-state NOE', sc: sc, st: [
      ['*', atomC, 'The experiment starts from equilibrium ¹³C magnetization.'],
      ['~', atomC, 'NOE onto ¹³C', 'In one of the two experiments the protons are saturated during D1. Cross-relaxation then raises the carbon magnetization by an amount set by fast motion of the C–H bond.'],
      ['@', atomC, 'F2', 't₁: carbon shift.'],
      [atomC, atomH, 'J', '¹J(CH)', 'Reverse INEPT to the attached proton.'],
      ['!', atomH, 'F3', 'Detected on the proton.']],
      end: 'Starts on carbon, ends on its proton. NOE = I(saturated) / I(reference).' }]
  });
  hetnoe('c_noe_aro', '¹³C{¹H} heteronuclear NOE, aromatic', 'NA_HSQCNOEGPSPWG3D', 'na_hsqcnoegpspwg3d', 145, 30, 'c68', ['aro'],
    [['CNST2', '200 Hz', '¹J(CH) of aromatic carbons.']], [N15(195)],
    ['Uses WATERGATE water suppression, which is why it is meant for the aromatic protons.'], 'G.H8', 'G.C8', 'one:G');
  hetnoe('c_noe_c1p', '¹³C{¹H} heteronuclear NOE, C1′', 'NA_HSQCNOEETGPSP3D', 'na_hsqcnoeetgpsp3d', 90, 10, 'c1p', ['h1p'],
    [['CNST24', '12 ppm', 'Bandwidth of the selective ¹³C excitation.']], [['-DCC_DEC', 'Optional selective C2′ decoupling in the carbon dimension.']],
    ['Gradient selection makes the ribose protons next to water observable in H₂O, at some cost in sensitivity.'], 'G.H1p', 'G.C1p', 'one:G');

  const ipap = (id, n, set, o2, sw, j, c20, n15, rgC, rgH, H, C, sc, split) => X.push({
    id: id, g: 'CN', D: '2D', n: n, s: '¹H–¹³C RDCs', set: set, pp: 'na_hsqcgpiasp', goals: ['rdc'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Measures the one-bond C–H splitting without ¹³C decoupling in the proton dimension. The difference between an aligned and an isotropic sample is the ¹H–¹³C residual dipolar coupling. C–H vectors exist in every nucleotide and point in many directions, so these RDCs also define loops, bulges and junctions, where imino N–H RDCs are missing.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.25, rg: rgH }, { ax: 'F1', n: 'C', sw: sw, o: o2, op: 'O2P', td: 256, rg: rgC }],
    ns: 64, nsm: 4, d1: 1, pseudo: { p: 'IP / AP', n: 2, lab: 'interleaved spectra' },
    par: [['CNST2', j + ' Hz', '¹J(CH).'], ['CNST20', c20 + ' ppm', 'Bandwidth of the ¹³C refocusing pulse.'],
      ['Processing', split, 'Separates in-phase and antiphase data. Process with 16k–30k points in F2 and 4k in F1.']],
    opt: [['LABEL_CN', '¹⁵N decoupling: set O3P to ' + n15 + ' ppm.']],
    lim: ['Two matched samples (isotropic and aligned) are required; check the alignment first with the 1D ²H spectrum.',
      'Only C1′, C5 and the aromatic carbons are resolved well enough; the other ribose carbons overlap too much for RDCs.',
      'For a site in fast exchange between conformations the RDC is a population-weighted average.',
      'Precision depends on line width in the coupled proton dimension, so it degrades with RNA size.'],
    paths: [{ t: 'Coupled C–H doublet', sc: sc, st: [
      ['*', H, 'Start on the proton.'],
      [H, C, 'J', '¹J(CH) ≈ ' + j + ' Hz', 'INEPT to the attached carbon.'],
      ['@', C, 'F1', 't₁: carbon shift.'],
      [C, H, 'J', '¹J(CH)', 'Back to the proton, prepared in phase (IP) or antiphase (AP) in alternate experiments.'],
      ['!', H, 'F2', 'Detected without ¹³C decoupling: a doublet split by ¹J(CH) + ¹D(CH). IP + AP gives one line, IP − AP the other.']],
      end: 'Out and back: ends on the proton as a doublet. The distance between its two lines is what you measure.' }]
  });
  ipap('ipap_aro', '2D ¹H,¹³C IPAP-HSQC, aromatic C2 / C6 / C8', 'NA_HSQCGPIASP_C2C6C8', 145, 30, 200, 20, 195, ['c68', 'c2a'], ['aro'], 'G.H8', 'G.C8', 'one:G', 'split ipap');
  ipap('ipap_c5', '2D ¹H,¹³C IPAP-HSQC, pyrimidine C5', 'NA_HSQCGPIASP_C5', 99, 15, 180, 12, 160, ['c5'], ['h1p'], 'C.H5', 'C.C5', 'one:C', 'split ipap 2');
  ipap('ipap_c1p', '2D ¹H,¹³C IPAP-HSQC, ribose C1′', 'NA_HSQCGPIASP_C1PRIME', 90, 12, 170, 12, 160, ['c1p'], ['h1p'], 'G.H1p', 'G.C1p', 'one:G', 'split ipap 2');
})();
