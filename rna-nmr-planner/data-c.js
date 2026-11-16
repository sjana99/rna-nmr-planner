/* Experiments for 15N-labeled RNA, part 1: correlation, hydrogen-bond and NOE experiments. */
(function () {
  const R = window.RNA, X = R.X, h = R.h;
  const IM_H = ['imU', 'imG', 'imGU'];
  const CALC = ['-DCALC_SP', 'Calculates the band-selective pulses from their centre and bandwidth constants. Recommended.'];
  const DCN = ['-DLABEL_CN', '¹³C decoupling for ¹³C,¹⁵N-labeled RNA.'];
  const C13_RELAX = 'Best on ¹⁵N-only samples. In ¹³C-labeled RNA, H2 and H8 relax faster through the dipolar coupling to their own ¹³C, and the long transfer delays lose more signal.';

  X.push({
    id: 'btrosy', g: 'N', D: '2D', n: '2D ¹H,¹⁵N BEST-TROSY, imino', s: 'narrow lines for larger RNAs',
    set: 'NA_B_TROSYF3GPPH', pp: 'b_trosyf3gpph.2', goals: ['imino', 'check'], solv: 'H2O', need: 'N', nat: 1, ch: 'HN', tro: 1,
    what: 'The same imino N–H map as the SOFAST-HMQC, but only the slowly relaxing TROSY multiplet component is kept. Lines stay narrow over a longer acquisition, which buys ¹⁵N resolution. The better choice for larger RNAs and high fields.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.1, rg: IM_H },
      { ax: 'F1', n: 'N', sw: 25, o: 153, td: 160, rg: ['gN1', 'uN3'] }],
    ns: { nat: 1024, lab: 4 }, nsm: 4, d1: 0.3,
    par: [['CNST54', '12.5 ppm', 'Centre of the imino proton region.'], ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.']],
    opt: [CALC, ['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C-labeled RNA.']],
    time: 'About 15 min for ¹⁵N-labeled RNA (Bruker).',
    lim: ['Only one of the four multiplet components is used. For small RNAs at 600 MHz or below the SOFAST-HMQC is as good or better.',
      'No decoupling in either dimension: peaks sit ¹J(NH)/2 ≈ 45 Hz away from their HSQC/HMQC positions in both ¹H and ¹⁵N. Correct for this before comparing shift lists.',
      'The cancellation of dipolar and CSA relaxation behind TROSY improves with field; the advantage is largest at 800 MHz and above.',
      'Only imino groups whose proton survives exchange with water are seen.'],
    paths: [{ t: 'G imino', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Band-selective excitation of the imino protons (BEST). Water stays along +z.'],
      ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'INEPT (two delays of 1/(4J), 5.4 ms in total) moves the magnetization to N1.'],
      ['@', 'G.N1', 'F1', 't₁ without ¹H decoupling: N1 evolves as a doublet. Only the line in which dipolar and CSA relaxation cancel is carried forward.'],
      ['G.N1', 'G.H1', 'J', 'ST2-PT', 'Single-transition-to-single-transition polarisation transfer connects that ¹⁵N line with the matching slowly relaxing ¹H line.'],
      ['!', 'G.H1', 'F2', 'Detected without ¹⁵N decoupling: one sharp component of the four-line multiplet.'],
      h.water('G.H1')],
      end: 'Ends on the imino proton. One peak per N–H at the TROSY position (offset by ¹J/2 in both dimensions).' }],
    ref: 'Favier & Brutscher, J. Biomol. NMR 49, 9 (2011); Lescop, Kern & Brutscher, J. Magn. Reson. 203, 190 (2010)'
  });

  X.push({
    id: 'fhsqc', g: 'N', D: '2D', n: '2D ¹H,¹⁵N FAST-HSQC', s: 'imino and amino groups',
    set: 'NA_FHSQCF3GPPH', pp: 'na_fhsqcf3gpph', goals: ['imino', 'base'], solv: 'H2O', need: 'N', nat: 1, ch: 'HN', wg: 'CNST19',
    what: 'Imino and amino N–H groups in one spectrum. The amino groups of C (N4, about 93–100 ppm), A (N6, about 77–85 ppm) and G (N2, about 71–77 ppm) appear below the imino peaks. Water is never saturated, so protons in fast exchange with it keep their intensity.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.07, rg: ['imU', 'imG', 'imGU', 'am'] },
      { ax: 'F1', n: 'N', sw: 109, o: 115, td: 256, rg: ['gN1', 'uN3', 'cN4', 'aN6', 'gN2'] }],
    ns: 8, nsm: 4, d1: 0.8,
    par: [['CNST19', '9.5 ppm', 'Centre of the proton region with maximum intensity (between amino and imino protons).']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C-labeled RNA.']],
    lim: ['The binomial 3-9-19 water suppression has an excitation profile: zero at water, a broad maximum around CNST19, zero again at 2·CNST19 − O1P (14.3 ppm with the default). Downfield U imino protons lose intensity; move CNST19 towards 11–12 ppm when the imino groups matter more.',
      'Amino protons are often broadened by rotation about the C–N bond. Cytosine amino groups in Watson–Crick pairs give two sharp peaks; G and A amino groups frequently give one broad peak or none.',
      'A 109 ppm ¹⁵N window needs many increments for decent resolution. Record imino and amino regions separately when resolution matters.'],
    paths: [
      h.hsqc('G imino', 'pair:GC+W', 'G.H1', 'G.N1', '¹J(N1,H1) ≈ 90 Hz', { water: 1, det: 'A 3-9-19 WATERGATE element returns water to +z; the imino proton is detected with ¹⁵N decoupling.', end: 'Out and back: ends on G H1. Peak at F1 = G N1, F2 = G H1.' }),
      h.hsqc('C amino', 'pair:GC+W', ['C.H41', 'C.H42'], 'C.N4', '¹J(N4,H) ≈ 90 Hz', { water: 1, exc: 'Both amino protons are excited.', end: 'Out and back: ends on the amino protons. Two ¹H peaks (H41 hydrogen-bonded, about 8–8.5 ppm; H42, about 6.5–7 ppm) at one N4 shift.' })],
    ref: 'Mori et al., J. Magn. Reson. B 108, 94 (1995)'
  });

  const hnn = (t, sc, H, Nd, Na, lab, end) => ({ t: t, sc: sc, st: [
    ['*', H, 'Imino-selective excitation (BEST). Water stays along +z.'],
    [H, Nd, 'J', '¹J(NH) ≈ 90 Hz', 'INEPT moves the magnetization to the donor nitrogen.'],
    [Nd, Na, 'HB', lab, 'N–N COSY step: over about 30 ms the donor nitrogen becomes partly antiphase to the acceptor nitrogen through the coupling across the hydrogen bond. A ¹⁵N 90° pulse transfers that part to the acceptor.'],
    ['@', [Na, Nd], 'F1', 't₁: the transferred part evolves at the acceptor shift (cross peak); the part that stayed evolves at the donor shift (reference peak).'],
    [Na, Nd, 'HB', lab, 'A second COSY step brings the magnetization back to the donor nitrogen.'],
    [Nd, H, 'J', 'TROSY read-out', 'Back to the imino proton.'],
    ['!', H, 'F3', 'Detected on the imino proton.'],
    h.water(H)], end: end });

  X.push({
    id: 'hnn_cosy', g: 'N', D: '2D/3D', n: 'HNN-COSY', s: 'N–H···N hydrogen bonds',
    set: 'NA_B_TRHNNCOSYGPPH3D', pp: 'na_b_trhnncosygpph3d', goals: ['hbond', 'imino'], solv: 'H2O', need: 'N', ch: 'HN', tro: 1,
    what: 'Direct proof of N–H···N hydrogen bonds. The imino proton is correlated with its own nitrogen and, through the ²ʰJ(NN) coupling across the hydrogen bond (about 6–7 Hz), with the acceptor nitrogen of the partner base: C N3 for G·C (about 193–200 ppm) and A N1 for A·U (about 219–227 ppm).',
    dims: [{ ax: 'F3', n: 'H', sw: 21, o: 12, dir: 1, aq: 0.08, rg: IM_H },
      { ax: 'F2', n: 'N', sw: 30, o: 153, op: 'CNST21', td: 1, rg: ['gN1', 'uN3'], note: 'TD = 1 records the 2D ¹H/F1 plane; raise it for the 3D.' },
      { ax: 'F1', n: 'N', sw: 100, o: 185, op: 'O3P', td: 128, rg: ['gN1', 'uN3', 'cN3', 'aN1'] }],
    ns: 16, nsm: 8, d1: 0.3,
    par: [['CNST21', '≈153 ppm', 'Centre of the hydrogen-bond donor nitrogens (U N3, G N1).'],
      ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.'],
      ['O2P', '105 ppm', 'Middle of the ¹³C resonances (for ¹³C decoupling).']],
    opt: [DCN],
    lim: ['It starts and ends on the imino proton, so base pairs with exchange-broadened imino protons give nothing (in Bruker’s example hairpin four residues are missing at 303 K). Use the long-range version or the pyrimidine H5-based experiment for those.',
      'G·U wobble pairs only have N–H···O hydrogen bonds and give no cross peak.',
      'Magnetization sits transverse on ¹⁵N for about 60 ms in total. Signal falls quickly with size; the TROSY read-out and high field help.',
      'Cross and reference peaks have opposite signs. Their ratio gives the coupling: I(cross)/I(ref) = −tan²(2πJT) for an N–N evolution period of 2T.'],
    paths: [
      hnn('G·C pair', 'pair:GC+W', 'G.H1', 'G.N1', 'C.N3', '²ʰJ(N1,N3) ≈ 6–7 Hz', 'Ends on G H1. At the G H1 shift there are two ¹⁵N peaks of opposite sign: G N1 (reference) and C N3 (reached through the hydrogen bond).'),
      hnn('A·U pair', 'pair:AU+W', 'U.H3', 'U.N3', 'A.N1', '²ʰJ(N3,N1) ≈ 6–7 Hz', 'Ends on U H3. At the U H3 shift: U N3 (reference) and A N1 (through the hydrogen bond). A cross peak at the A N7 shift instead would indicate a Hoogsteen pair.')],
    ref: 'Dingley & Grzesiek, J. Am. Chem. Soc. 120, 8293 (1998)'
  });

  X.push({
    id: 'lr_hnn_cosy', g: 'N', D: '2D/3D', n: 'Long-range HNN-COSY', s: 'H-bonds seen from adenine H2',
    set: 'NA_B_SLRHNNCOSYGPPH', pp: 'na_b_slrhnncosygpph', goals: ['hbond'], solv: 'H2O', need: 'N', ch: 'HN', avoidC: 1,
    what: 'Hydrogen-bond detection that does not need the imino proton. It starts on the non-exchangeable adenine H2, reaches A N1 through ²J(H2,N1) and crosses the hydrogen bond to U N3. It therefore works for A·U pairs whose imino proton is broadened away by exchange with water.',
    dims: [{ ax: 'F2', n: 'H', sw: 13, o: 4.7, dir: 1, aq: 0.12, rg: ['aro'] },
      { ax: 'F1', n: 'N', sw: 100, o: 200, op: 'O3P', td: 128, rg: ['uN3', 'aN1', 'aN3', 'n7'] }],
    ns: 16, nsm: 8, d1: 0.4,
    par: [['CNST54', '7.5 ppm', 'Centre of the H2/H8 selective pulses.'], ['CNST55', '2 ppm', 'Bandwidth of the H2/H8 selective pulses.'],
      ['CNST56', '225 ppm', 'Centre of the adenine N1 region.'], ['CNST57', '20 ppm', 'Bandwidth of the N1-selective pulses.'],
      ['O2P', '154 ppm', 'On the C2 carbons (for ¹³C decoupling).']],
    opt: [DCN, ['-DCALC_SP', 'Calculates the selective ¹H pulses (CNST54/55) and ¹⁵N pulses (CNST56/57). Recommended.']],
    lim: ['A·U pairs only (any pair with adenine N1 as acceptor). For G·C use the pyrimidine H5(C5C4)N3N1-COSY, which needs ¹³C labeling.',
      'Two slow transfers in a row (²J(HN) about 15 Hz, ²ʰJ(NN) about 6–7 Hz) keep the magnetization transverse for well over 100 ms. The slow relaxation of H2 makes this feasible, but sensitivity still drops steeply with size.',
      C13_RELAX,
      'With re-tuned delays the same experiment reaches purine N7 from H8 through ²J(H8,N7) and detects Hoogsteen-type hydrogen bonds.'],
    paths: [{ t: 'A·U pair from H2', sc: 'pair:AU', st: [
      ['*', 'A.H2', 'Band-selective excitation of H2/H8.'],
      ['A.H2', 'A.N1', 'J', '²J(H2,N1) ≈ 15 Hz', 'Long-range INEPT (tens of milliseconds) moves the magnetization to A N1.'],
      ['A.N1', 'U.N3', 'HB', '²ʰJ(N1,N3) ≈ 6–7 Hz', 'N–N COSY across the hydrogen bond to the donor nitrogen of uridine.'],
      ['@', ['U.N3', 'A.N1'], 'F1', 't₁: U N3 shift (cross peak) and A N1 shift (reference peak).'],
      ['U.N3', 'A.N1', 'HB', '²ʰJ(N1,N3)', 'Back across the hydrogen bond.'],
      ['A.N1', 'A.H2', 'J', '²J(H2,N1)', 'Back to H2.'],
      ['!', 'A.H2', 'F2', 'Detected on A H2.']],
      end: 'Ends on A H2. A cross peak at the U N3 shift (155–164 ppm) in the H2 row proves the N1···H3–N3 hydrogen bond even when H3 itself is invisible.' }],
    ref: 'Dallmann et al., Angew. Chem. Int. Ed. 52, 10487 (2013)'
  });

  X.push({
    id: 'cpmg_noesy', g: 'N', D: '2D', n: '2D ¹H,¹⁵N CPMG-NOESY', s: 'NOEs from imino and amino groups',
    set: 'NA_HSQCF3GPNOWGXY', pp: 'na_hsqcf3gpnowgxy', goals: ['noe', 'imino', 'base'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'A ¹⁵N-edited NOESY in 2D form. Magnetization is first put on the nitrogen of an imino or amino group and labelled there, then passed by NOE from that group’s proton to anything nearby. The CPMG-type transfer keeps exchange-broadened amino groups alive, so amino-to-H5, amino-to-H1′ and imino-to-H2 contacts become visible.',
    dims: [{ ax: 'F2', n: 'H', sw: 22, o: 4.7, dir: 1, aq: 0.07, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'N', sw: 103, o: 116, op: 'O3P', td: 128, rg: ['gN1', 'uN3', 'cN4', 'aN6', 'gN2'] }],
    ns: 16, nsm: 8, d1: 1.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '80–240 ms.' },
    par: [['CNST4', '93 Hz', '¹J of imino NH and amino NH₂.'], ['CNST19', '9 ppm', 'Centre of imino and amino protons.'],
      ['CNST29', '86 ppm', 'Optional frequency jump: with SWF1 = 32 ppm it centres F1 on the amino nitrogens. Imino nitrogens then fold.'],
      ['SPW1 / PHCOR9', 'optimise in gs', 'Power and phase of the water-selective pulses (P11) in the soft WATERGATE.'],
      ['SPW11 / PHCOR8', 'optimise in gs', 'Power and phase of the water flip-back pulse (P29) during the mixing time.'],
      ['O2P', '105 ppm', 'Centre of ¹³C resonances (for decoupling).']],
    opt: [DCN],
    lim: ['Water suppression is delicate. Optimise O1P, SPW1/PHCOR9 and SPW11/PHCOR8 carefully, or the C N4–H5 peaks next to water are lost.',
      'With the reduced F1 width the imino nitrogens fold into the amino region. Check that folded imino diagonal peaks do not cover imino–amino cross peaks.',
      'F1 gives the ¹⁵N shift of the source group, not its ¹H shift. Assignments lean on the 2D HSQC.',
      'Amino rotation and exchange depend on temperature; record at more than one temperature.'],
    paths: [
      { t: 'C amino → H5', sc: 'pair:GC', st: [
        ['*', ['C.H41', 'C.H42'], 'All protons are excited. Follow the cytosine amino protons.'],
        [['C.H41', 'C.H42'], 'C.N4', 'J', '¹J(NH) ≈ 93 Hz', 'CPMG-INEPT: the 1/(2J) transfer runs under synchronised trains of 180° pulses on ¹H and ¹⁵N. The rapid refocusing suppresses losses from exchange with water and from rotation of the amino group.'],
        ['@', 'C.N4', 'F1', 't₁: N4 shift (93–100 ppm).'],
        ['C.N4', ['C.H41', 'C.H42'], 'J', '¹J(NH)', 'CPMG-INEPT back to the amino protons.'],
        [['C.H42', 'C.H41'], ['C.H5', 'G.H1'], 'NOE', 'τm = D8', 'NOE from the amino protons: to H5 on the same ring (mainly from H42) and across the pair to G H1 (from H41).'],
        ['!', ['C.H5', 'G.H1', 'C.H41', 'C.H42'], 'F2', 'Detected on whichever proton now carries the magnetization.']],
        end: 'The row at the C N4 shift shows the amino protons themselves plus C H5 and G H1. Bruker notes the N4–H5 peak is usually visible for base-paired cytosines when water suppression is good.' },
      { t: 'U imino → A H2', sc: 'pair:AU', st: [
        ['*', 'U.H3', 'Follow the uridine imino proton.'],
        ['U.H3', 'U.N3', 'J', '¹J(NH) ≈ 93 Hz', 'CPMG-INEPT to N3.'],
        ['@', 'U.N3', 'F1', 't₁: N3 shift.'],
        ['U.N3', 'U.H3', 'J', '¹J(NH)', 'Back to H3.'],
        ['U.H3', 'A.H2', 'NOE', 'τm = D8', 'NOE across the base pair to A H2.'],
        ['!', ['A.H2', 'U.H3'], 'F2', 'Detected on A H2 (cross peak) and U H3 (diagonal).']],
        end: 'Typical U N3–A H2 cross peak: ends on A H2, labelled with the nitrogen shift of the uridine it faces.' }],
    ref: 'Mueller, Legault & Pardi, J. Am. Chem. Soc. 117, 11043 (1995); Mulder et al., J. Biomol. NMR 8, 223 (1996)'
  });

  const lrDims = [{ ax: 'F2', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.12, rg: ['aro'] },
    { ax: 'F1', n: 'N', sw: 100, o: 200, op: 'O3P', td: 128, rg: ['n9', 'aN3', 'aN1', 'n7'] }];
  const lrPaths = (mk, endG, endA) => [
    mk('Purine H8 → N7, N9', 'one:G', 'G.H8', ['G.N7', 'G.N9'], '²J(H8,N7) ≈ 11 Hz, ²J(H8,N9) ≈ 8 Hz', { out: 'The transfer delay is stretched to tens of milliseconds so that the small two-bond couplings can act. H8 becomes antiphase to N7 and N9.', end: endG }),
    mk('Adenine H2 → N1, N3', 'one:A', 'A.H2', ['A.N1', 'A.N3'], '²J(H2,N1) ≈ ²J(H2,N3) ≈ 15 Hz', { out: 'The long transfer delay lets H2 become antiphase to both neighbouring ring nitrogens.', end: endA })];

  X.push({
    id: 'lr_fhsqc', g: 'N', D: '2D', n: '2D ¹H,¹⁵N LR-FAST-HSQC', s: 'H2/H8 to ring nitrogens',
    set: 'NA_LRHSQCF3GPPH', pp: 'na_lrhsqcf3gpph', goals: ['base', 'hbond'], solv: 'both', need: 'N', ch: 'HN', avoidC: 1, wg: 'CNST19',
    what: 'Assigns purine ring nitrogens from the non-exchangeable protons: H8 reaches N7 and N9, adenine H2 reaches N1 and N3, all through two-bond couplings of 8–15 Hz. It supplies the N1 and N7 shifts needed to read HNN-COSY spectra, and those shifts report on protonation, metal binding and Hoogsteen pairing.',
    dims: lrDims, ns: 16, nsm: 4, d1: 1,
    par: [['CNST4', '20 Hz', 'Relaxation-optimised value for the ²J(NH) transfer (delays shorter than the couplings would ideally need).'],
      ['CNST19', '8 ppm', 'Centre of the proton region with maximum intensity.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C-labeled RNA.']],
    lim: [C13_RELAX,
      'The transfer is tuned as a compromise between coupling size and relaxation. Sensitivity falls with RNA size.',
      'Pyrimidines are weak or missing: their two- and three-bond H–N couplings are small.',
      'The window (150–250 ppm) leaves out the amino and most pyrimidine N1 nitrogens.'],
    paths: lrPaths(h.hsqc, 'Out and back: ends on H8. Two peaks in the H8 row: N7 (228–238 ppm) and N9 (166–173 ppm).', 'Out and back: ends on H2. Two peaks in the H2 row: N1 (219–227 ppm) and N3 (211–216 ppm).'),
    ref: 'Mori et al., J. Magn. Reson. B 108, 94 (1995)'
  });

  X.push({
    id: 'lr_sfhmqc', g: 'N', D: '2D', n: '2D ¹H,¹⁵N LR-SOFAST-HMQC', s: 'H2/H8 to ring nitrogens, fast pulsing',
    set: 'NA_LRSFHMQCF3GPPH', pp: 'na_lrsfhmqcf3gpph', goals: ['base', 'hbond'], solv: 'H2O', need: 'N', ch: 'HN', avoidC: 1,
    what: 'The same H2/H8-to-nitrogen correlations as the LR-FAST-HSQC, recorded as a SOFAST-HMQC. Only the aromatic protons are excited, so the recycle delay drops to 0.4 s and more scans fit into the same time.',
    dims: lrDims, ns: 16, nsm: 4, d1: 0.4,
    par: [['CNST4', '20 Hz', 'Relaxation-optimised value for the ²J(NH) transfer.'],
      ['CNST54', '7.5 ppm', 'Centre of the H2/H8 region.'], ['CNST55', '3 ppm', 'Bandwidth of the H2/H8-selective pulses.']],
    lim: [C13_RELAX,
      'Aromatic protons outside CNST54 ± CNST55/2 (6–9 ppm) are not excited.',
      'Pyrimidines are weak or missing: their two- and three-bond H–N couplings are small.'],
    paths: lrPaths(h.hmqc, 'Out and back: ends on H8, with peaks at the N7 and N9 shifts.', 'Out and back: ends on H2, with peaks at the N1 and N3 shifts.'),
    ref: 'Schanda & Brutscher, J. Biomol. NMR 33, 199 (2005)'
  });

  X.push({
    id: 'xf1d', g: 'N', D: '1D', n: '1D ¹H imino, ¹⁵N-filtered / ¹⁵N-edited', s: 'for selective labeling',
    set: 'NA_SF15NXF', pp: 'na_sf15Nxf', goals: ['imino', 'inter'], solv: 'H2O', need: 'N', nat: 1, ch: 'HN', wantSel: 1,
    what: 'Two imino spectra from one experiment: one with only the protons bound to ¹⁵N (edited) and one with only those bound to ¹⁴N (filtered). Meant for selectively labeled samples: ¹⁵N on G or on U only, segmental labeling, or a labeled RNA bound to an unlabeled partner.',
    dims: [{ ax: 'F1', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.1, rg: IM_H }],
    ns: 128, nsm: 8, d1: 0.3, pseudo: { p: 'interleaved', n: 2, lab: 'sub-spectra' },
    par: [['CNST4', '93 Hz', '¹J(NH) the filter is tuned to.'], ['CNST54', '12.5 ppm', 'Centre of the imino proton region.'], ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.'],
      ['Processing', 'split ipap', 'Separates the pseudo-2D data: first spectrum ¹⁵N-filtered, second ¹⁵N-edited.']],
    opt: [CALC],
    lim: ['In a uniformly ¹⁵N-labeled sample the filtered spectrum is empty; in an unlabeled sample the edited one is. The pair is only informative with selective or mixed labeling.',
      'The filter is tuned to 93 Hz. Imino protons in fast exchange with water lose their coupling to ¹⁵N and leak into the ¹⁴N spectrum.',
      'Incomplete isotope incorporation shows up as residual signal in the filtered spectrum.'],
    paths: [{ t: 'Sorting by nitrogen isotope', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Imino-selective excitation.'],
      ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 93 Hz', 'During 1/(2J) = 5.4 ms a proton on ¹⁵N becomes antiphase to it. A proton on ¹⁴N does not evolve.'],
      ['~', 'G.N1', 'sign ±', 'A ¹⁵N pulse applied in alternate scans inverts the sign of the ¹⁵N-bound signal only.'],
      ['G.N1', 'G.H1', 'J', '¹J(N1,H1)', 'Refocused to in-phase proton magnetization.'],
      ['!', 'G.H1', '', 'Both data sets are stored interleaved. Their sum keeps the ¹⁴N-bound protons, their difference the ¹⁵N-bound ones.']],
      end: 'Magnetization returns to the imino proton. The nitrogen is only used to mark it as ¹⁵N-bound or not.' }],
    ref: 'Schanda & Brutscher, J. Biomol. NMR 33, 199 (2005)'
  });

  X.push({
    id: 'noesy_sfhmqc_n', g: 'N', D: '3D', n: '3D ¹H,¹⁵N NOESY-SOFAST-HMQC', s: 'imino strips resolved by ¹⁵N',
    set: 'NA_NOESYSFHMQCF3GPPH3D', pp: 'noesysfhmqcf3gpph3d', goals: ['imino', 'noe'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'The imino strips of the H₂O NOESY, spread out by the ¹⁵N shift of each imino nitrogen. Overlapping imino protons with different N1 or N3 shifts are separated, and G strips are told from U strips at a glance.',
    dims: [{ ax: 'F3', n: 'H', sw: 14, o: 8, dir: 1, aq: 0.08, rg: IM_H },
      { ax: 'F2', n: 'N', sw: 25, o: 153, op: 'O3P', td: 40, rg: ['gN1', 'uN3'] },
      { ax: 'F1', n: 'H', sw: 12, o: 8, td: 128, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 4, d1: 0.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST54', '11–12.5 ppm', 'Centre of the imino (or amino + imino) proton region.'], ['CNST55', '6–8 ppm', 'Bandwidth of the selective pulses.'],
      ['CNST10', '90–110', 'Flip angle of the first ¹H pulse of the HMQC.'], ['CNST22', '116 ppm', 'Centre of imino and amino ¹⁵N for decoupling during t₁.'],
      ['O2P', '110 ppm', 'Centre of ¹³C resonances.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in F1 and F2 for ¹³C-labeled RNA.'], CALC],
    lim: ['Only NOEs that end on an imino proton are recorded.',
      'SWF2 can be cut to about 9 ppm to save time. Imino nitrogens then fold: check the folded positions against the 2D SOFAST-HMQC.',
      'Before starting the 3D, record the two 2D planes (TD of F1 or of F2 set to 1) to verify the setup.',
      'Spin diffusion applies as in any NOESY: use short mixing times for distance restraints.'],
    paths: [{ t: 'A H2 → U imino', sc: 'pair:AU+W', st: [
      ['*', 'A.H2', 'All protons are excited. Follow A H2.'],
      ['@', 'A.H2', 'F1', 't₁: shift of the source proton.'],
      ['A.H2', 'U.H3', 'NOE', 'τm = D8', 'Cross-relaxation across the base pair to the imino proton.'],
      ['U.H3', 'U.N3', 'J', '¹J(N3,H3) ≈ 90 Hz', 'Imino-selective SOFAST-HMQC: only magnetization that arrived on an imino proton is taken on to its nitrogen.'],
      ['@', 'U.N3', 'F2', 't₂: U N3 shift.'],
      ['U.N3', 'U.H3', 'J', '¹J(N3,H3)', 'Back to the imino proton.'],
      ['!', 'U.H3', 'F3', 'Detected on U H3 with ¹⁵N decoupling.']],
      end: 'Ends on the imino proton. Peak at (F1 = nearby proton, F2 = imino ¹⁵N, F3 = imino ¹H).' }],
    ref: 'Rossi et al., J. Biomol. NMR 66, 259 (2016); Schanda & Brutscher, J. Am. Chem. Soc. 127, 8014 (2005)'
  });
})();
