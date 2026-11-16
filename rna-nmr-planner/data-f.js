/* Experiments for 13C/15N-labeled RNA, part 2: triple-resonance base and base-to-sugar experiments. */
(function () {
  const R = window.RNA, X = R.X, h = R.h;
  const IM_H = ['imU', 'imG', 'imGU'];
  const CALC = ['-DCALC_SP', 'Calculates the band-selective ¹H pulses from CNST54 and CNST55. Recommended.'];
  const CDET = 'Low sensitivity. Bruker strongly advises a cryoprobe with a cooled ¹³C preamplifier; a TXO cryoprobe, whose inner coil is optimised for ¹³C, is better still.';
  const AXES = 'Bruker’s page labels the widths of this experiment in an order that does not match direct/indirect detection. The axes here are assigned by nucleus; confirm them in the parameter set.';

  X.push({
    id: 'hnco', g: 'CN', D: '2D/3D', n: 'HNCO, imino to C2 / C4 / C6', s: 'base-pair type from carbonyl carbons',
    set: 'NA_B_TRHNCOGP3D', pp: 'na_b_trhncogp3d', goals: ['imino', 'base', 'hbond'], solv: 'H2O', need: 'CN', ch: 'HCN', tro: 1,
    what: 'Correlates each imino proton with the two carbons next to its nitrogen: C2 and C4 in uridine, C2 and C6 in guanosine. These carbons carry the carbonyl oxygens that accept hydrogen bonds, so their shifts tell Watson–Crick pairs from G·U wobble and other pairings. Usually recorded as a 2D ¹H/¹³C plane.',
    dims: [{ ax: 'F3', n: 'H', sw: 24, o: 4.7, dir: 1, aq: 0.08, rg: IM_H },
      { ax: 'F2', n: 'N', sw: 25, o: 153, op: 'O3P', td: 1, rg: ['gN1', 'uN3'], note: 'TD = 1 gives the usual 2D H/C plane.' },
      { ax: 'F1', n: 'C', sw: 25, o: 157, op: 'O2P', td: 96, rg: ['cq'] }],
    ns: 8, nsm: 4, d1: 0.3,
    par: [['D23', '8 ms', '1/(4·¹J(NC)). Adjust between 5 and 10 ms depending on RNA size: shorter for larger RNAs.'],
      ['CNST54', '12.5 ppm', 'Centre of the imino proton region.'], ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.']],
    opt: [CALC],
    lim: ['Needs an observable imino proton, like every imino-detected experiment.',
      'Without C5 decoupling, U C4 and G C6 appear as doublets in ¹³C (coupling to C5).',
      'Two N–C transfers through small couplings: signal drops with size. Shorten D23 for larger RNAs.'],
    paths: [
      { t: 'Uridine', sc: 'pair:AU+W', st: [
        ['*', 'U.H3', 'Imino-selective excitation (BEST). Water stays along +z.'],
        ['U.H3', 'U.N3', 'J', '¹J(N3,H3) ≈ 90 Hz', 'INEPT to N3.'],
        ['U.N3', ['U.C2', 'U.C4'], 'J', '¹J(N3,C2), ¹J(N3,C4)', 'N3 becomes antiphase to both neighbouring carbons during 2·D23 and is transferred to them.'],
        ['@', ['U.C2', 'U.C4'], 'F1', 't₁: shifts of C2 (about 152–155 ppm) and C4 (about 167–170 ppm).'],
        [['U.C2', 'U.C4'], 'U.N3', 'J', '¹J(N,C)', 'Back to N3 (optionally labelled with its shift in t₂).'],
        ['U.N3', 'U.H3', 'J', 'TROSY read-out', 'Back to the imino proton.'],
        ['!', 'U.H3', 'F3', 'Detected on U H3.']],
        end: 'Out and back: ends on U H3. Two ¹³C peaks per uridine imino, C2 and C4.' },
      { t: 'Guanosine', sc: 'pair:GC+W', st: [
        ['*', 'G.H1', 'Imino-selective excitation.'],
        ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'INEPT to N1.'],
        ['G.N1', ['G.C2', 'G.C6'], 'J', '¹J(N1,C2), ¹J(N1,C6)', 'Transfer to both neighbouring carbons.'],
        ['@', ['G.C2', 'G.C6'], 'F1', 't₁: shifts of C2 (about 156–158 ppm) and C6 (about 160–163 ppm).'],
        [['G.C2', 'G.C6'], 'G.N1', 'J', '¹J(N,C)', 'Back to N1.'],
        ['G.N1', 'G.H1', 'J', 'TROSY read-out', 'Back to the imino proton.'],
        ['!', 'G.H1', 'F3', 'Detected on G H1.']],
        end: 'Out and back: ends on G H1. Two ¹³C peaks per guanosine imino, C2 and C6.' }],
    ref: 'Favier & Brutscher, J. Biomol. NMR 49, 9 (2011); Solyom et al., J. Biomol. NMR 55, 311 (2013)'
  });

  X.push({
    id: 'cn_imino', g: 'CN', D: '2D', n: '2D ¹³C-detected CN-HSQC, imino groups', s: 'every G and U, paired or not',
    set: 'NA_C_CNHSQC', pp: 'na_c_cnhsqc', goals: ['imino', 'dyn', 'base'], solv: 'H2O', need: 'CN', ch: 'HCN', cdet: '¹³C',
    what: 'Shows the imino nitrogen of every G and U, whether or not its proton is visible. The experiment starts and ends on carbon, so exchange of the imino proton with water does not erase the peak. A built-in proton filter inverts the sign of nitrogens whose proton exchanges slowly, which separates protected from unprotected imino groups.',
    dims: [{ ax: 'F2', n: 'C', sw: 50, o: 159, op: 'O1P', dir: 1, aq: 0.1, rg: ['cq'] },
      { ax: 'F1', n: 'N', sw: 40, o: 153, op: 'O3P', td: 128, rg: ['gN1', 'uN3'] }],
    ns: 512, nsm: 4, d1: 1.5,
    par: [['CNST4', '27 Hz', 'J(CN) the C–N transfer is tuned to.'], ['CNST5', '94 Hz', '¹J(NH) used by the proton filter.'], ['O2P', '9 ppm', '¹H carrier (aromatic and imino protons).']],
    opt: [['-DNO_FILTER', 'Records the spectrum without the ¹H filter: all imino nitrogens with the same sign.']],
    lim: [CDET,
      'The carbons involved have no attached proton and relax slowly: D1 of 1.5 s and NS of 512 make this a long experiment.',
      'The sign information of the filter fades when the exchange rate is comparable to ¹J(NH): such peaks are weak or vanish.'],
    paths: [{ t: 'C2 → N3 → C2', sc: 'pair:AU', st: [
      ['*', ['U.C2', 'U.C4'], 'The experiment starts on the carbons next to the imino nitrogen (direct ¹³C excitation).'],
      [['U.C2', 'U.C4'], 'U.N3', 'J', 'J(C,N), tuned to 27 Hz', 'INEPT from carbon to the imino nitrogen.'],
      ['@', 'U.N3', 'F1', 't₁: N3 shift.'],
      ['~', 'U.N3', '¹H filter', 'A spin-echo of 1/(2·¹J(NH)): a nitrogen that keeps its proton evolves under the 94 Hz coupling and changes sign. If the proton exchanges quickly the coupling is averaged away and the sign is kept.'],
      ['U.N3', ['U.C2', 'U.C4'], 'J', 'J(C,N)', 'Back to the carbons.'],
      ['!', ['U.C2', 'U.C4'], 'F2', 'Detected on ¹³C.']],
      end: 'Starts and ends on carbon. Peak at F1 = N3 (U) or N1 (G), F2 = C2/C4 (U) or C2/C6 (G); its sign reports on proton exchange.' }],
    ref: 'Fürtig et al., J. Biomol. NMR 64, 207 (2016)'
  });

  X.push({
    id: 'cn_amino', g: 'CN', D: '2D', n: '2D ¹³C-detected CN-HSQC, amino groups', s: 'amino nitrogens without their protons',
    set: 'NA_C_CN_IASQSP', pp: 'na_c_cn_iasqsp', goals: ['base'], solv: 'both', need: 'CN', ch: 'HCN', cdet: '¹³C',
    what: 'Correlates each amino nitrogen with the carbon it sits on: C4–N4 in cytidine, C6–N6 in adenosine, C2–N2 in guanosine. Amino protons are often broadened beyond detection by rotation and exchange; this experiment does not use them at all and even works in D₂O.',
    dims: [{ ax: 'F2', n: 'C', sw: 50, o: 159, op: 'O1P', dir: 1, aq: 0.1, rg: ['cq'] },
      { ax: 'F1', n: 'N', sw: 40, o: 86, op: 'O3P', td: 128, rg: ['cN4', 'aN6', 'gN2'] }],
    ns: 128, nsm: 4, d1: 1.5, pseudo: { p: 'IP / AP', n: 2, lab: 'interleaved spectra' },
    par: [['CNST3', '75 Hz (A), 55 Hz (C), 65 Hz (both)', '¹J(CC) removed by the in-phase/antiphase scheme.'],
      ['Processing C', 'splitcomb ipap 2 <expno> 1 55', 'C4/N4 of cytidine.'], ['Processing A', 'splitcomb ipap 2 <expno> 1 75', 'C6/N6 of adenosine.'],
      ['Processing G', 'split 2, then phase and add', 'G C2 has no carbon neighbour: split, change the phase of the second spectrum by −90°, process both and add them (adsu).']],
    lim: [CDET,
      'Each nucleotide type needs its own processing because the carbon–carbon coupling that is removed differs (or is absent, for G).',
      'No proton dimension: the peaks have to be linked to the rest of the assignment through the carbon shifts.'],
    paths: [{ t: 'C4 → N4 → C4', sc: 'pair:GC', st: [
      ['*', 'C.C4', 'Starts on the carbon that carries the amino group.'],
      ['C.C4', 'C.N4', 'J', '¹J(C4,N4)', 'INEPT to the amino nitrogen.'],
      ['@', 'C.N4', 'F1', 't₁: N4 shift (93–100 ppm).'],
      ['C.N4', 'C.C4', 'J', '¹J(C4,N4)', 'Back to C4.'],
      ['!', 'C.C4', 'F2', 'Detected on ¹³C. In-phase and antiphase data with respect to C5 are recorded interleaved and combined to remove the 55 Hz doublet.']],
      end: 'Starts and ends on carbon. Peak at F1 = amino ¹⁵N, F2 = the carbon bearing it.' }]
  });

  X.push({
    id: 'hcch_cosy', g: 'CN', D: '2D/3D', n: '3D TROSY-HCCH-COSY', s: 'adenine H2 ↔ H8',
    set: 'NA_TRHCCHCO3D', pp: 'na_trhcchco3d', goals: ['base'], solv: 'both', need: 'CN', ch: 'HCN', tro: 1,
    what: 'Links H2 and H8 of the same adenine through the ring carbons that lie between them. H2 is the key proton for A·U pairs (strong NOE to U H3), H8 belongs to the sequential walk; this experiment ties the two networks together without relying on NOEs.',
    dims: [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['aro'] },
      { ax: 'F2', n: 'C', sw: 25, o: 142, op: 'O2P', td: 1, rg: ['c68', 'c2a'], note: 'TD = 1 gives the F1/F3 plane, enough for RNAs of about 20 nt.' },
      { ax: 'F1', n: 'C', sw: 60, o: 142, op: 'O2P', td: 96, rg: ['c5pu', 'cq', 'c68', 'c2a'] }],
    ns: 8, nsm: 4, d1: 1,
    par: [['O3P', '153 ppm', 'Centre of the imino nitrogen region (decoupling).']],
    lim: ['Adenine only.',
      'C2 has no directly bonded carbon, so the transfers run through small long-range carbon–carbon couplings and need long delays. TROSY limits the loss, but sensitivity still falls quickly with size.',
      'With the default 25 ppm window (129.5–154.5 ppm) adenine C2 at 152–156 ppm sits at the edge of F2. Check for folding.'],
    paths: [
      { t: 'From H2', sc: 'one:A', st: [
        ['*', 'A.H2', 'Start on adenine H2.'],
        ['A.H2', 'A.C2', 'J', '¹J(C2,H2) ≈ 200 Hz', 'INEPT to C2.'],
        ['A.C2', ['A.C4', 'A.C5', 'A.C6'], 'J', 'long-range J(CC)', 'COSY-type transfer to the bridging carbons through two- and three-bond carbon–carbon couplings.'],
        ['@', ['A.C4', 'A.C5', 'A.C6'], 'F1', 't₁: shifts of the bridging carbons.'],
        [['A.C4', 'A.C5', 'A.C6'], 'A.C2', 'J', 'long-range J(CC)', 'Back to C2.'],
        ['@', 'A.C2', 'F2', 't₂: C2 shift (TROSY).'],
        ['A.C2', 'A.H2', 'J', '¹J(C2,H2)', 'Back to H2.'],
        ['!', 'A.H2', 'F3', 'Detected on H2.']],
        end: 'Out and back: ends on H2, labelled with the shifts of C4, C5 and C6.' },
      { t: 'From H8', sc: 'one:A', st: [
        ['*', 'A.H8', 'Start on adenine H8.'],
        ['A.H8', 'A.C8', 'J', '¹J(C8,H8) ≈ 215 Hz', 'INEPT to C8.'],
        ['A.C8', ['A.C4', 'A.C5'], 'J', 'long-range J(CC)', 'Transfer to the bridging carbons C4 and C5.'],
        ['@', ['A.C4', 'A.C5'], 'F1', 't₁: shifts of C4 and C5.'],
        [['A.C4', 'A.C5'], 'A.C8', 'J', 'long-range J(CC)', 'Back to C8.'],
        ['@', 'A.C8', 'F2', 't₂: C8 shift.'],
        ['A.C8', 'A.H8', 'J', '¹J(C8,H8)', 'Back to H8.'],
        ['!', 'A.H8', 'F3', 'Detected on H8.']],
        end: 'Out and back: ends on H8. H2 and H8 of one adenine show peaks at the same C4 and C5 frequencies in F1.' }],
    ref: 'Simon, Zanier & Sattler, J. Biomol. NMR 20, 173 (2001)'
  });

  X.push({
    id: 'h5c5c4', g: 'CN', D: '2D', n: '2D H5(C5)C4', s: 'pyrimidine C4 from H5',
    set: 'NA_H5C5C4', pp: 'na_h5c5c4', goals: ['base', 'hbond'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Reaches the C4 carbon of cytidine and uridine from the non-exchangeable H5. C4 carries the amino group (C) or the carbonyl oxygen (U) that takes part in base pairing. It is the alternative to the HNCO for uridines without an observable imino proton and for all cytidines.',
    dims: [{ ax: 'F2', n: 'H', sw: 10, o: 4.7, dir: 1, aq: 0.12, rg: ['h1p'] },
      { ax: 'F1', n: 'C', sw: 10, o: 166, op: 'O2P', td: 64, rg: ['cq'] }],
    ns: 8, nsm: 4, d1: 1,
    par: [['O3P', '180 ppm', 'Centre of C N3 and U N3 (decoupling).']],
    lim: ['Pyrimidines only.', 'H5 resonates at 5–6 ppm, close to water: easier in D₂O.',
      'The 10 ppm ¹³C window (161–171 ppm) is narrow; C4 shifts outside it fold.'],
    paths: [{ t: 'H5 → C5 → C4', sc: 'one:C', st: [
      ['*', 'C.H5', 'Start on H5.'],
      ['C.H5', 'C.C5', 'J', '¹J(C5,H5) ≈ 175 Hz', 'INEPT to C5.'],
      ['C.C5', 'C.C4', 'J', '¹J(C4,C5) ≈ 55–65 Hz', 'A carbon–carbon INEPT step moves the magnetization on to C4.'],
      ['@', 'C.C4', 'F1', 't₁: C4 shift.'],
      ['C.C4', 'C.C5', 'J', '¹J(C4,C5)', 'Back to C5.'],
      ['C.C5', 'C.H5', 'J', '¹J(C5,H5)', 'Back to H5.'],
      ['!', 'C.H5', 'F2', 'Detected on H5.']],
      end: 'Out and back: ends on H5. Peak at F1 = C4, F2 = H5.' }]
  });

  X.push({
    id: 'py_hnn', g: 'CN', D: '2D', n: 'Pyrimidine H5(C5C4)N3N1-COSY', s: 'H-bonds without any imino proton',
    set: 'NA_H5C5C4N3N1', pp: 'na_h5c5c4n3n1', goals: ['hbond'], solv: 'both', need: 'CN', ch: 'HCN', maxNt: 35,
    what: 'Detects the N–H···N hydrogen bond of G·C and A·U pairs starting from the pyrimidine H5. The magnetization travels H5 → C5 → C4 → N3 and then across the hydrogen bond to N1 of the partner purine. No exchangeable proton is involved, so it works for labile base pairs and in D₂O.',
    dims: [{ ax: 'F2', n: 'H', sw: 10, o: 4.7, dir: 1, aq: 0.12, rg: ['h1p'] },
      { ax: 'F1', n: 'N', sw: 100, o: 185, op: 'O3P', td: 96, rg: ['gN1', 'uN3', 'cN3', 'aN1'] }],
    ns: 256, nsm: 4, d1: 1,
    par: [['D25', '25 ms', 'N3/N1 transfer delay. The N–N transfer takes 4·D25, about 100 ms.'], ['CNST22', '22 ppm', 'Bandwidth of the ¹³C pulses.'],
      ['SPNAM14', 'wvm -a', 'Selective ¹⁵N 180° pulse generated with WaveMaker.'], ['O2P', '99 ppm', 'Centre of the C5 region.']],
    lim: ['The longest pathway in the set: four transfer steps out and four back, with about 100 ms on transverse ¹⁵N. Bruker warns of severe signal loss for larger RNAs; optimise D25.',
      'NS starts at 256: expect a day or more even for small RNAs.',
      'H5 is close to water; Bruker’s tutorial recommends D₂O.'],
    paths: [{ t: 'G·C pair from C H5', sc: 'pair:GC', st: [
      ['*', 'C.H5', 'Start on cytidine H5.'],
      ['C.H5', 'C.C5', 'J', '¹J(C5,H5) ≈ 175 Hz', 'INEPT to C5.'],
      ['C.C5', 'C.C4', 'J', '¹J(C4,C5) ≈ 55 Hz', 'On to C4.'],
      ['C.C4', 'C.N3', 'J', 'J(C4,N3)', 'On to the ring nitrogen N3, the hydrogen-bond acceptor.'],
      ['C.N3', 'G.N1', 'HB', '²ʰJ(N3,N1) ≈ 6–7 Hz', 'N–N COSY across the hydrogen bond to N1 of the paired guanine.'],
      ['@', ['G.N1', 'C.N3'], 'F1', 't₁: G N1 shift (cross peak) and C N3 shift (reference peak).'],
      ['G.N1', 'C.N3', 'HB', '²ʰJ(N3,N1)', 'Back across the hydrogen bond.'],
      ['C.N3', 'C.H5', 'J', 'via C4 and C5', 'The same three steps in reverse return the magnetization to H5.'],
      ['!', 'C.H5', 'F2', 'Detected on H5.']],
      end: 'Ends on C H5. A peak at the G N1 shift (142–149 ppm) in the H5 row proves the hydrogen bond. For uridine the partner is A N1 (219–227 ppm).' }],
    ref: 'Dallmann et al., Angew. Chem. Int. Ed. 52, 10487 (2013)'
  });

  X.push({
    id: 'hccnh', g: 'CN', D: '2D/3D', n: '3D HCCNH-TOCSY', s: 'H6/H8 to imino within one base',
    set: 'NA_TRHCCNH3D', pp: 'na_trhccnh3d', goals: ['base', 'imino'], solv: 'H2O', need: 'CN', ch: 'HCN', tro: 1, maxNt: 30,
    what: 'Connects the imino proton of a G or U with the aromatic carbon (C8 or C6) of the same base, through bonds. This joins the two halves of the assignment: the imino protons, assigned from base pairing, and the H6/H8 protons, assigned from the sequential walk.',
    dims: [{ ax: 'F3', n: 'H', sw: 24, o: 4.7, dir: 1, aq: 0.08, rg: IM_H },
      { ax: 'F2', n: 'C', sw: 20, o: 137, op: 'O2P', td: 64, rg: ['c68'] },
      { ax: 'F1', n: 'N', sw: 30, o: 153, op: 'O3P', td: 1, rg: ['gN1', 'uN3'], note: 'TD = 1: usually only the ¹H/¹³C plane is recorded.' }],
    ns: 64, nsm: 4, d1: 1.5, mix: { p: 'D60', v: 0.028, lab: 'C–C TOCSY mixing', hint: '28 ms.' },
    axNote: AXES + ' Because of the TROSY steps, peaks are displaced by ¹J(HC)/2 in ¹³C (about 100 Hz for G, 90 Hz for U) and by ¹J(HN)/2 (47 Hz) in ¹H: two differently referenced copies of the spectrum are needed.',
    time: 'About 2 days for the ¹H/¹³C plane (Bruker).',
    lim: ['Very insensitive: transfers through couplings of about 10 Hz combined with a long carbon TOCSY.',
      'Bruker limits it to RNAs of at most about 30 nt.',
      'Ends on the imino proton, so that proton has to be observable. Test at two or more temperatures.'],
    paths: [
      { t: 'Guanosine H8 → H1', sc: 'pair:GC', st: [
        ['*', 'G.H8', 'Start on H8.'],
        ['G.H8', 'G.C8', 'J', '¹J(C8,H8) ≈ 215 Hz', 'INEPT to C8.'],
        ['@', 'G.C8', 'F2', 't₂: C8 shift (TROSY, no ¹H decoupling).'],
        ['G.C8', ['G.C4', 'G.C5', 'G.C6'], 'TOC', 'J(CC)', 'Carbon TOCSY (D60) spreads the magnetization over the ring carbons until it reaches the carbons next to N1.'],
        [['G.C6'], 'G.N1', 'J', 'J(C,N) ≈ 10 Hz', 'Carbon-to-nitrogen INEPT through a small coupling.'],
        ['@', 'G.N1', 'F1', 't₁: N1 shift (optional third dimension).'],
        ['G.N1', 'G.H1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'TROSY transfer to the imino proton.'],
        ['!', 'G.H1', 'F3', 'Detected on G H1.']],
        end: 'One-way transfer through the base: starts on H8, ends on the imino proton H1. Peak at (C8, N1, H1).' },
      { t: 'Uridine H6 → H3', sc: 'pair:AU', st: [
        ['*', 'U.H6', 'Start on H6.'],
        ['U.H6', 'U.C6', 'J', '¹J(C6,H6) ≈ 180 Hz', 'INEPT to C6.'],
        ['@', 'U.C6', 'F2', 't₂: C6 shift.'],
        ['U.C6', ['U.C5', 'U.C4'], 'TOC', '¹J(CC) 55–67 Hz', 'Carbon TOCSY along C6–C5–C4.'],
        ['U.C4', 'U.N3', 'J', 'J(C4,N3) ≈ 10 Hz', 'Carbon-to-nitrogen INEPT.'],
        ['@', 'U.N3', 'F1', 't₁: N3 shift.'],
        ['U.N3', 'U.H3', 'J', '¹J(N3,H3) ≈ 90 Hz', 'TROSY transfer to the imino proton.'],
        ['!', 'U.H3', 'F3', 'Detected on U H3.']],
        end: 'Starts on H6, ends on the imino proton H3. Peak at (C6, N3, H3).' }],
    ref: 'Sklenář et al., J. Biomol. NMR 7, 83 (1996)'
  });

  const hcnSt = (H, C, J, det) => [
    ['*', H, 'Start on ' + (H.indexOf('p') > 0 ? 'the anomeric proton H1′.' : 'the aromatic proton.')],
    [H, C, 'J', J, 'INEPT to the attached carbon.'],
    [C, 'G.N9', 'J', '¹J(C,N9) ≈ 11 Hz', 'A second INEPT through the small one-bond carbon–nitrogen coupling moves the magnetization to the glycosidic nitrogen.'],
    ['@', 'G.N9', 'N', 'Nitrogen evolution: shift of N9 (purines) or N1 (pyrimidines).'],
    ['G.N9', C, 'J', '¹J(C,N9)', 'Back to the carbon.'],
    ['@', C, 'C', 'Carbon evolution.'],
    [C, H, 'J', J, 'Back to the proton.'],
    ['!', H, '¹H', det]];

  X.push({
    id: 'hcn', g: 'CN', D: '2D/3D', n: '3D HCN', s: 'base ↔ own ribose through N9 / N1',
    set: 'NA_HCNETGPSISP3D.2', pp: 'na_hcnetgpsisp3d.2', goals: ['link', 'base', 'sugar'], solv: 'both', need: 'CN', ch: 'HCN',
    what: 'Joins each base to its own ribose through the glycosidic nitrogen. H1′–C1′ and H6/H8–C6/C8 of one nucleotide both correlate with the same N9 (purine) or N1 (pyrimidine). Unlike the NOE-based link, this is through bonds and independent of conformation. The nitrogen shift also sorts the nucleotides by type.',
    dims: [{ ax: 'F3', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.1, rg: ['aro', 'h1p'] },
      { ax: 'F2', n: 'C', sw: 40, o: 113, op: 'O2P', td: 48, rg: ['c1p', 'c68'] },
      { ax: 'F1', n: 'N', sw: 40, o: 160, op: 'O3P', td: 48, rg: ['n9', 'pN1'] }],
    ns: 8, nsm: 4, d1: 1, axNote: AXES,
    opt: [['-DBASE', 'Base half only (H6/8–C6/8–N1/9), with C5 decoupling during carbon evolution. Set O2P to 138 ppm and the ¹³C width to 20 ppm.'],
      ['-DSUGAR', 'Ribose half only (H1′–C1′–N1/9), with C2′ decoupling. Set O2P to 89 ppm and the ¹³C width to 12 ppm.']],
    lim: ['The C–N couplings are only about 11–12 Hz, so each transfer takes tens of milliseconds on transverse ¹³C. Aromatic carbons relax fast at high field, and the base half is usually the weaker one.',
      'With O2P = 113 ppm and a 40 ppm width, both C1′ (88–95 ppm) and C6/C8 (136–145 ppm) lie outside the window and fold in on purpose. For larger RNAs run the -DBASE and -DSUGAR versions as two separate 3Ds.',
      'For small RNAs a 2D ¹H/¹⁵N plane is often enough, because N9 and N1 shifts differ between A, G, C and U.'],
    paths: [
      { t: 'Ribose half', sc: 'one:G', st: hcnSt('G.H1p', 'G.C1p', '¹J(C1′,H1′) ≈ 170 Hz', 'Detected on H1′.'), end: 'Out and back: ends on H1′, labelled with C1′ and N9.' },
      { t: 'Base half', sc: 'one:G', st: hcnSt('G.H8', 'G.C8', '¹J(C8,H8) ≈ 215 Hz', 'Detected on H8.'), end: 'Out and back: ends on H8, labelled with C8 and the same N9. Matching N9 shifts pair H8 with H1′.' }],
    ref: 'Sklenář et al., J. Biomol. NMR 3, 721 (1993)'
  });

  X.push({
    id: 'hcnc', g: 'CN', D: '3D', n: '3D (H)CNC, ¹³C-detected', s: 'C6/C8 → N → C1′ in one peak',
    set: 'NA_C_HCNCIASP', pp: 'na_c_hcnciasp', goals: ['link'], solv: 'both', need: 'CN', ch: 'HCN', cdet: '¹³C', tro: 1,
    what: 'The base-to-ribose link as a single straight-through pathway: aromatic carbon, glycosidic nitrogen, C1′, detected on carbon. Each nucleotide gives one peak that contains both ends of the link, where the HCN needs two peaks to be matched. Carbon detection also shows nucleotides whose proton-detected peaks are missing.',
    dims: [{ ax: 'F3', n: 'C', sw: 40, o: 90, op: 'O1P', dir: 1, aq: 0.1, rg: ['c1p'] },
      { ax: 'F2', n: 'N', sw: 40, o: 160, op: 'O3P', td: 40, rg: ['n9', 'pN1'] },
      { ax: 'F1', n: 'C', sw: 12, o: 139, op: 'CNST20', oq: 1, td: 40, rg: ['c68'] }],
    ns: 8, nsm: 4, d1: 0.5, pseudo: { p: 'IPAP', n: 4, lab: 'interleaved spectra' },
    par: [['D3', '35 ms', 'C6/C8 to N1/N9 transfer delay and constant-time carbon evolution.'], ['D5', '40 ms', 'N1/N9 to carbon transfer delay and constant-time nitrogen evolution.'],
      ['D35', '50 ms', 'C1′–N1/N9 refocusing delay.'], ['CNST19', '7.5 ppm', 'Centre of the H6/H8 region.'], ['CNST2', '6 ppm', 'Bandwidth of the H6/H8-selective pulses.'],
      ['Processing', 'splitcomb ipap 4 <expno> 170 44', 'Removes ¹J(C1′,H1′) = 170 Hz and ¹J(C1′,C2′) = 44 Hz from the detected dimension.'],
      ['Referencing', 'sr(F1) = sr(F3) + (o1p − CNST20)·bf1 + ½·¹J(CH)', 'The aromatic carbon is recorded as its TROSY line; about 100 Hz is used as a compromise for the J term.']],
    axNote: 'The centre of the indirect aromatic ¹³C dimension is set by CNST20, which Bruker’s page does not quote; 139 ppm is assumed here.',
    lim: [CDET,
      'More than 100 ms of fixed delays on carbon and nitrogen: sensitivity falls quickly with RNA size.',
      'Processing with splitcomb and the non-standard referencing of F1 are easy to get wrong; compare with the 2D aromatic HSQC.'],
    paths: [{ t: 'H8 → C8 → N9 → C1′', sc: 'one:G', st: [
      ['*', 'G.H8', 'Selective excitation of H6/H8: the proton is only used as a source of polarisation.'],
      ['G.H8', 'G.C8', 'J', '¹J(C8,H8) ≈ 215 Hz', 'INEPT to C8.'],
      ['@', 'G.C8', 'F1', 'Constant-time t₁ (D3): C8 shift, recorded as the TROSY component.'],
      ['G.C8', 'G.N9', 'J', '¹J(C8,N9) ≈ 11 Hz', 'Transfer to the glycosidic nitrogen.'],
      ['@', 'G.N9', 'F2', 'Constant-time t₂ (D5): N9 shift.'],
      ['G.N9', 'G.C1p', 'J', '¹J(C1′,N9) ≈ 11 Hz', 'On to C1′ of the ribose.'],
      ['!', 'G.C1p', 'F3', 'Detected on C1′. Interleaved in-phase/antiphase data remove the splittings from H1′ and C2′.']],
      end: 'One-way transfer: starts on H8 and ends on C1′. One peak per nucleotide at (C8, N9, C1′).' }],
    ref: 'Sklenář et al., J. Biomol. NMR 3, 721 (1993)'
  });

  X.push({
    id: 'hmqc4d', g: 'CN', D: '4D', n: '4D HCCH HMQC-NOESY-HMQC', s: 'sequential walk in four dimensions',
    set: 'NA_HMQCNOESYHMQC4D', pp: 'na_hmqcnoesyhmqc4d', goals: ['walk'], solv: 'D2O', need: 'C', ch: 'HCN', nus: 1,
    what: 'The H1′-to-H6/H8 sequential walk with both ends labelled by their carbon shifts. Every NOE peak has four coordinates (H1′, C1′, C6/C8, H6/H8), which resolves the walk when even the 3D NOESY strips overlap.',
    dims: [{ ax: 'F4', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.08, rg: ['aro'] },
      { ax: 'F3', n: 'C', sw: 10, o: 90, td: 24, rg: ['c1p'] },
      { ax: 'F2', n: 'C', sw: 22, o: 145, op: 'O2P', td: 28, rg: ['c68', 'c2a'] },
      { ax: 'F1', n: 'H', sw: 4, o: 5.7, op: 'CNST17', td: 32, rg: ['h1p'] }],
    ns: 4, nsm: 4, d1: 1, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST16', '7.7 ppm', 'Centre of the H2/H6/H8 region.'], ['CNST17', '5.7 ppm', 'Centre of the H1′ region.'],
      ['CNST23', '4 ppm', 'Bandwidth of the H1′-selective pulses.'], ['CNST24', '6 ppm', 'Bandwidth of the H6/H8-selective pulses.'], ['O3P', '195 ppm', 'Centre of the aromatic nitrogens.']],
    lim: ['Has to be recorded with non-uniform sampling to keep the time reasonable. Peak intensities from sparse data are less reliable, so use it for assignment rather than for distances.',
      'Only the H1′-to-aromatic contacts are recorded; other NOEs are filtered out by the selective pulses.',
      'D₂O only.'],
    paths: [{ t: 'H1′(i) → H6/H8(i+1)', sc: 'seq:GC', st: [
      ['*', 'i.H1p', 'H1′-selective excitation.'],
      ['i.H1p', 'i.C1p', 'J', '¹J(C1′,H1′) ≈ 170 Hz', 'First HMQC: H1′ and C1′ share multiple-quantum coherence.'],
      ['@', 'i.C1p', 'F3', 'Evolution at the C1′ shift.'],
      ['i.C1p', 'i.H1p', 'J', '¹J(C1′,H1′)', 'Back to H1′.'],
      ['@', 'i.H1p', 'F1', 'Evolution at the H1′ shift.'],
      ['i.H1p', 'j.H6', 'NOE', 'τm = D8', 'Sequential NOE to H6/H8 of residue i+1 (and to its own H8).'],
      ['j.H6', 'j.C6', 'J', '¹J(C6,H6) ≈ 180–215 Hz', 'Second HMQC on the aromatic C–H pair.'],
      ['@', 'j.C6', 'F2', 'Evolution at the C6/C8 shift.'],
      ['j.C6', 'j.H6', 'J', '¹J(CH)', 'Back to the aromatic proton.'],
      ['!', 'j.H6', 'F4', 'Detected on H6/H8.']],
      end: 'Starts on H1′(i), ends on H6/H8(i+1). Peak at (H1′, C1′, C6/C8, H6/H8).' }],
    ref: 'Stanek et al., J. Biomol. NMR 57, 1 (2013)'
  });
})();
