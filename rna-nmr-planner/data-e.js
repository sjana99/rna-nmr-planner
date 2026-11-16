/* Experiments for 13C/15N-labeled RNA, part 1: HSQC family and 13C-edited / filtered NOESY. */
(function () {
  const R = window.RNA, X = R.X, h = R.h;
  const JCC = 'In uniformly ¹³C-labeled RNA every carbon is split in the ¹³C dimension by its carbon neighbours: 40–45 Hz within the ribose, about 67 Hz for C5–C6, 55–65 Hz for C4–C5.';
  const SPINDIFF = 'Spin diffusion applies as in any NOESY. Use short mixing times and a build-up series for distance restraints.';
  const PLANES = 'Before the 3D, record the two 2D planes (TD of F1 or of F2 set to 1) to check the setup and any folding.';
  const LEAK = 'Filter leakage: the purge is tuned to a range of ¹J couplings. Incomplete labeling, or protons whose coupling falls outside the range (aromatic ¹J(CH) reaches 215 Hz), leave residual intramolecular peaks that look like intermolecular ones. Run a control with the filter switched off and one on the free RNA.';

  X.push({
    id: 'hsqc_c', g: 'CN', D: '2D', n: '2D ¹H,¹³C HSQC, all protons', s: 'full C–H map',
    set: 'NA_HSQCETGPSP.4', pp: 'hsqcetgpsp.4', goals: ['check', 'base', 'sugar'], solv: 'both', need: 'C', ch: 'HC',
    what: 'All C–H pairs of a ¹³C-labeled RNA in one map, recorded with broadband shaped ¹³C pulses that cover 110 ppm. A quick overview and quality check; the region-selective HSQCs give the resolution needed for assignment.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.12, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'C', sw: 110, o: 105, td: 256, rg: ['c68', 'c2a', 'c5', 'c1p', 'c4p', 'c2p3p', 'c5p'] }],
    ns: 4, nsm: 4, d1: 1,
    opt: [['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to 160 ppm (N9 of A and G, N1 of C and U).']],
    lim: [JCC + ' Without constant-time evolution or selective decoupling these splittings limit the resolution.',
      'A 110 ppm ¹³C window needs many increments for useful resolution.'],
    paths: [
      h.hsqc('Ribose H1′–C1′', 'one:G', 'G.H1p', 'G.C1p', '¹J(C1′,H1′) ≈ 170 Hz', { end: 'Out and back: ends on H1′. Peak at F1 = C1′, F2 = H1′.' }),
      h.hsqc('Base H8–C8', 'one:G', 'G.H8', 'G.C8', '¹J(C8,H8) ≈ 215 Hz', { end: 'Out and back: ends on H8. Peak at F1 = C8, F2 = H8.' }),
      h.hsqc('Pyrimidine H5–C5', 'one:C', 'C.H5', 'C.C5', '¹J(C5,H5) ≈ 175 Hz', { end: 'Out and back: ends on H5. Peak at F1 = C5 (96–106 ppm), F2 = H5.' })]
  });

  X.push({
    id: 'ct_hsqc', g: 'CN', D: '2D', n: '2D ¹H,¹³C CT-HSQC, ribose', s: 'constant time, singlets in ¹³C',
    set: 'NA_HSQCCTETGPSP', pp: 'na_hsqcctetgpsp', goals: ['sugar'], solv: 'both', need: 'C', ch: 'HC',
    what: 'Ribose C–H map with every carbon as a singlet. During a constant-time period matched to ¹J(CC) ≈ 40 Hz the carbon–carbon couplings refocus, so C2′, C3′ and C4′, which overlap badly in a normal HSQC, become resolved.',
    dims: [{ ax: 'F2', n: 'H', sw: 10, o: 4.7, dir: 1, aq: 0.12, rg: ['h1p', 'rib'] },
      { ax: 'F1', n: 'C', sw: 40, o: 77, td: 256, ct: 0.025, rg: ['c1p', 'c4p', 'c2p3p', 'c5p'] }],
    ns: 8, nsm: 4, d1: 1,
    par: [['D23', '12.5 ms or 25 ms', 'Bruker: 12.5 ms for 1/(2·¹J(CC)), 25 ms for 1/¹J(CC). The longer setting doubles the maximum t₁.']],
    opt: [['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to 160 ppm.']],
    lim: ['Sensitivity drops because ¹³C stays transverse for the whole constant-time period and relaxes. If only C1′ or C5′ matter, the selective HSQC versions are more sensitive.',
      'The longest t₁ is fixed by the constant-time period. Adding increments beyond it is impossible, so resolution in ¹³C has a hard ceiling.',
      'With the shorter period, peak sign depends on the number of carbon neighbours: C1′ and C5′ (one neighbour) are opposite to C2′, C3′ and C4′ (two neighbours). Useful for assignment, confusing if unexpected.'],
    paths: [{ t: 'H3′–C3′', sc: 'one:G', st: [
      ['*', 'G.H3p', 'A 90° pulse excites the ribose protons. Follow H3′.'],
      ['G.H3p', 'G.C3p', 'J', '¹J(C3′,H3′) ≈ 150 Hz', 'INEPT to C3′.'],
      ['@', 'G.C3p', 'F1', 'Constant-time t₁: the carbon shift evolves while a 180° pulse moves through a period of fixed total length.'],
      ['~', 'G.C3p', 'J(CC) refocused', 'The couplings to C2′ and C4′ (40–45 Hz each) act for the full fixed period whatever t₁ is. They end as a sign factor only, so no splitting appears in F1.'],
      ['G.C3p', 'G.H3p', 'J', '¹J(C3′,H3′)', 'Reverse INEPT.'],
      ['!', 'G.H3p', 'F2', 'Detected on H3′ with ¹³C decoupling.']],
      end: 'Out and back: ends on the ribose proton. One singlet per C–H.' }]
  });

  const sel = (id, n, s, set, o2, sw, j, c20, c22, c25, dec, rgC, rgH, n15, what, lim, path) => X.push({
    id: id, g: 'CN', D: '2D', n: n, s: s, set: set, pp: 'na_shsqcetgpsp', goals: id === 'shsqc_c1p' || id === 'shsqc_c5p' ? ['sugar'] : ['base'],
    solv: 'both', need: 'C', ch: 'HC', what: what,
    dims: [{ ax: 'F2', n: 'H', sw: 10, o: 4.7, dir: 1, aq: 0.12, rg: rgH }, { ax: 'F1', n: 'C', sw: sw, o: o2, td: 256, rg: rgC }],
    ns: 4, nsm: 4, d1: 1,
    par: [['CNST2', j + ' Hz', '¹J(CH) for the transfer delays.'], ['CNST20', c20 + ' ppm', 'Bandwidth of the selective ¹³C refocusing pulse.'],
      ['CNST22', c22 + ' ppm', 'Offset of the selective ¹³C decoupling (' + dec + ').'], ['CNST25', c25 + ' ppm', 'Bandwidth of that decoupling.']],
    opt: n15 ? [['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to ' + n15 + ' ppm.']] : [],
    lim: lim.concat(['One carbon type per experiment. A carbon whose coupling partner resonates outside the decoupled band stays split.']),
    paths: path
  });
  sel('shsqc_c1p', '2D ¹H,¹³C HSQC, ribose C1′–H1′', 'selective, C2′ decoupled', 'NA_SHSQCETGPSP_C1PRIME', 90, 12, 170, 12, 72, 12, 'C2′', ['c1p'], ['h1p'], 160,
    'One peak per nucleotide at (C1′, H1′), with the coupling to C2′ removed by selective decoupling. The best-resolved fingerprint of a ¹³C-labeled RNA: C1′ and H1′ shifts respond to sugar pucker and to the glycosidic angle.',
    ['H1′ lies at 5–6 ppm, close to water: in H₂O the gradient selection must work well. D₂O is easier.'],
    [h.hsqc('H1′–C1′', 'one:G', 'G.H1p', 'G.C1p', '¹J(C1′,H1′) ≈ 170 Hz', { evo: 't₁: C1′ shift. A band-selective 180° pulse refocuses only C1′, and C2′ is decoupled selectively, so the 43 Hz splitting disappears.', end: 'Out and back: ends on H1′. A singlet at F1 = C1′ (88–95 ppm).' })]);
  sel('shsqc_c5p', '2D ¹H,¹³C HSQC, ribose C5′–H5′', 'selective, C4′ decoupled', 'NA_SHSQCETGPSP_C5PRIME', 63, 10, 150, 12, 82, 12, 'C4′', ['c5p'], ['rib'], 0,
    'The C5′ methylene groups, with the coupling to C4′ removed. H5′ and H5″ appear as two proton peaks at one C5′ shift; their shifts and couplings carry information on the backbone torsion γ.',
    ['H5′ and H5″ (3.9–4.6 ppm) sit right next to water. This experiment is much easier in D₂O.', 'Stereospecific assignment of H5′ versus H5″ needs further experiments.'],
    [h.hsqc('H5′/H5″–C5′', 'one:G', 'G.H5p', 'G.C5p', '¹J(C5′,H5′) ≈ 150 Hz', { evo: 't₁: C5′ shift, with C4′ decoupled selectively.', end: 'Out and back: ends on H5′ and H5″. Two ¹H peaks at one C5′ shift (62–69 ppm).' })]);
  sel('shsqc_c5', '2D ¹H,¹³C HSQC, pyrimidine C5–H5', 'selective, C4 and C6 decoupled', 'NA_SHSQCETGPSP_C5', 99, 15, 180, 12, 150, 40, 'C4 and C6', ['c5'], ['h1p'], 0,
    'C5–H5 of every cytosine and uracil. The C5 shift separates the two cleanly (C about 96–99 ppm, U about 102–106 ppm), so the map counts and types the pyrimidines.',
    ['H5 (5–6 ppm) overlaps the H1′ region in ¹H and is close to water in H₂O.'],
    [h.hsqc('H5–C5', 'one:C', 'C.H5', 'C.C5', '¹J(C5,H5) ≈ 175–180 Hz', { evo: 't₁: C5 shift. Both carbon neighbours, C4 and C6, are decoupled with one selective band at 150 ppm.', end: 'Out and back: ends on H5. A singlet at F1 = C5.' })]);
  sel('shsqc_aro', '2D ¹H,¹³C HSQC, aromatic C2 / C6 / C8', 'selective, C5 decoupled', 'NA_SHSQCETGPSP_C2C6C8', 143, 30, 200, 30, 99, 15, 'C5 of C and U', ['c68', 'c2a'], ['aro'], 195,
    'The aromatic C–H map of a labeled RNA: C8–H8 of purines, C6–H6 of pyrimidines and C2–H2 of adenine. Decoupling C5 removes the 67 Hz splitting of the pyrimidine C6 peaks. This is the reference spectrum for all aromatic 3D experiments.',
    ['Purine C8 and adenine C2 have no directly bonded carbon; only pyrimidine C6 gains from the decoupling.', 'Aromatic ¹³C relaxes quickly through its large chemical shift anisotropy at high field; for large RNAs TROSY-type experiments give sharper lines.'],
    [h.hsqc('Pyrimidine H6–C6', 'one:C', 'C.H6', 'C.C6', '¹J(C6,H6) ≈ 180 Hz', { evo: 't₁: C6 shift, with C5 decoupled selectively.', end: 'Out and back: ends on H6. A singlet at F1 = C6.' }),
      h.hsqc('Purine H8–C8', 'one:G', 'G.H8', 'G.C8', '¹J(C8,H8) ≈ 215 Hz', { end: 'Out and back: ends on H8. Peak at F1 = C8 (136–142 ppm).' }),
      h.hsqc('Adenine H2–C2', 'one:A', 'A.H2', 'A.C2', '¹J(C2,H2) ≈ 200 Hz', { end: 'Out and back: ends on H2. Peak at F1 = C2 (152–156 ppm).' })]);

  const edited = (first, h1txt) => [
    ['*', 'i.H1p', 'All protons are excited. Follow H1′ of residue i.'],
    ['@', 'i.H1p', 'F1', 't₁: H1′(i) shift.'],
    ['i.H1p', 'j.H6', 'NOE', 'τm = D8', 'Sequential NOE to H6/H8 of residue i+1. (The NOE to its own H8 gives a second peak in the strip of residue i.)'],
    ['j.H6', 'j.C6', 'J', '¹J(C6,H6) ≈ 180–215 Hz', first],
    ['@', 'j.C6', 'F2', 't₂: C6/C8 shift.'],
    ['j.C6', 'j.H6', 'J', '¹J(CH)', 'Back to the aromatic proton.'],
    ['!', 'j.H6', 'F3', h1txt]];
  const END3D = 'Ends on the aromatic proton. Peak at (F1 = neighbouring proton, F2 = aromatic ¹³C, F3 = aromatic ¹H).';

  X.push({
    id: 'noesy_hsqc_c', g: 'CN', D: '3D', n: '3D NOESY ¹³C-HSQC, aromatic', s: 'aromatic strips resolved by ¹³C',
    set: 'NA_C6NOESYHSQCGP3D.2', pp: 'na_c6noesyhsqcgp3d.2', goals: ['walk', 'noe'], solv: 'both', need: 'C', ch: 'HC',
    what: 'The aromatic strips of the NOESY, separated by the ¹³C shift of C6, C8 and C2. Each aromatic proton gets its own strip listing the protons around it (its own and the preceding H1′, H2′, H3′, and H5), which removes most of the overlap that stops the 2D walk above about 30 nt.',
    dims: [{ ax: 'F3', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.09, rg: ['aro'] },
      { ax: 'F2', n: 'C', sw: 30, o: 145, td: 48, rg: ['c68', 'c2a'] },
      { ax: 'F1', n: 'H', sw: 8, o: 6, op: 'CNST19', td: 128, rg: ['aro', 'h1p', 'rib'] }],
    ns: 8, nsm: 4, d1: 1, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST2', '195 Hz', '¹J(CH) of aromatic carbons.'], ['CNST16', '8.5 ppm', 'Region of maximum intensity in the detected dimension (H6/H8).'],
      ['CNST19', '6 ppm', 'Centre of the NOESY dimension F1.'], ['CNST28', '105 ppm', 'C5 offset for selective C5 decoupling.'], ['CNST59', '35 ppm', 'Bandwidth of the C5 decoupling during t₂.']],
    opt: [['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to 195 ppm (aromatic nitrogens).']],
    time: 'Bruker example: about 23 h at 800 MHz.',
    lim: ['F1 covers 2–10 ppm. Imino protons are not in the indirect dimension.',
      'The ¹³C window can be narrowed to save time; carbons then fold. Check folded positions against the 2D aromatic HSQC.',
      PLANES, SPINDIFF,
      'For distance restraints record it with uniform sampling rather than non-uniform sampling.'],
    paths: [{ t: 'H1′(i) → H6/H8(i+1) → C', sc: 'seq:GC', st: edited('INEPT to the attached aromatic carbon.', 'Detected on H6/H8 with WATERGATE water suppression.'), end: END3D }]
  });

  X.push({
    id: 'noesy_sfhmqc_c', g: 'CN', D: '3D', n: '3D NOESY ¹³C-SOFAST-HMQC, aromatic', s: 'fast-pulsing version',
    set: 'NA_NOESY_SFHMQCHCH3D', pp: 'na_noesy_sfhmqchch3d', goals: ['walk', 'noe'], solv: 'both', need: 'C', ch: 'HC',
    what: 'The same strips as the 3D NOESY-HSQC, with a SOFAST-HMQC read-out that only touches the aromatic protons. The short recycle delay gives more signal per unit time.',
    dims: [{ ax: 'F3', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.09, rg: ['aro'] },
      { ax: 'F2', n: 'C', sw: 30, o: 145, td: 48, rg: ['c68', 'c2a'] },
      { ax: 'F1', n: 'H', sw: 12, o: 8, op: 'CNST22', td: 128, rg: ['imU', 'imG', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 4, d1: 0.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST2', '200 Hz', '¹J(CH) of aromatic carbons.'], ['CNST10', '90–110', 'Flip angle of the first pulse of the HMQC.'],
      ['CNST22', '8 ppm', 'Centre of the NOESY dimension F1.'], ['CNST54', '8.5 ppm', 'Centre of the aromatic proton region.'], ['CNST55', '5 ppm', 'Bandwidth of the aromatic-selective pulses.']],
    opt: [['-DLABEL_CN', '¹⁵N decoupling for ¹³C,¹⁵N-labeled RNA. Set O3P to 120 ppm.'], ['-DCALC_SP', 'Calculates the selective ¹H pulses from CNST54 and CNST55. Recommended.']],
    time: 'Bruker example: about 18 h at 600 MHz.',
    lim: ['Only aromatic protons within CNST54 ± CNST55/2 (6–11 ppm) are read out.',
      'For distance restraints the HSQC version with uniform sampling is the safer choice; use this one to gain sensitivity for assignment.',
      'Folding of the ¹³C dimension should be checked against a 2D ¹H,¹³C SOFAST-HMQC.', PLANES, SPINDIFF],
    paths: [{ t: 'H1′(i) → H6/H8(i+1) → C', sc: 'seq:GC', st: edited('Aromatic-selective SOFAST-HMQC: after 1/(2J) the proton and its carbon share multiple-quantum coherence.', 'Detected on H6/H8. Water and ribose protons were never touched by the read-out.'), end: END3D }],
    ref: 'Rossi et al., J. Biomol. NMR 66, 259 (2016)'
  });

  X.push({
    id: 'noesy_xf3d', g: 'CN', D: '3D', n: '3D X-filtered NOESY ¹³C-SOFAST-HMQC', s: 'unlabeled partner → labeled RNA',
    set: 'NA_NOESY_SFHMQCHCHXF3D', pp: 'na_noesy_sfhmqchchxf3d', goals: ['inter', 'noe'], solv: 'both', need: 'C', ch: 'HCN', wantMix: 1,
    what: 'Finds NOEs between an unlabeled partner and the labeled RNA. A filter before t₁ removes every proton bound to ¹³C or ¹⁵N, so F1 holds only protons of the unlabeled molecule: a ligand, a protein, an unlabeled strand or the unlabeled nucleotides of a selectively labeled RNA. After mixing, only aromatic protons of the labeled part are read out.',
    dims: [{ ax: 'F3', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.09, rg: ['aro'] },
      { ax: 'F2', n: 'C', sw: 30, o: 145, td: 48, rg: ['c68', 'c2a'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, op: 'CNST22', td: 128, rg: ['imU', 'imG', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 4, d1: 0.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST6', '145 Hz', 'Smallest ¹J(CH) covered by the X-filter.'], ['CNST7', '200 Hz', 'Largest ¹J(CH) covered by the X-filter.'],
      ['CNST2', '200 Hz', '¹J(CH) of aromatic carbons.'], ['CNST22', '9 ppm', 'Centre of the NOESY dimension F1.'],
      ['CNST54', '8.5 ppm', 'Centre of the aromatic proton region.'], ['CNST55', '5 ppm', 'Bandwidth of the aromatic-selective pulses.'], ['O3P', '120 ppm', 'Centre of imino and amino nitrogens.']],
    opt: [['-DNO_FILTER', 'Switches the X-filter off. Use it to test the setup and as a control.'], ['-DCALC_SP', 'Calculates the selective ¹H pulses. Recommended.']],
    lim: [LEAK,
      'Intermolecular NOEs are weak. They need a tight, slowly exchanging complex at high concentration.',
      PLANES],
    paths: [{ t: 'Partner ¹H → RNA aromatic', sc: 'seq:GC+L', st: [
      ['*', 'L.H', 'All protons are excited. Follow a proton of the unlabeled partner.'],
      ['~', 'L.H', 'passes X-filter', 'Filter before t₁: protons bound to ¹³C or ¹⁵N are purged. Only protons on ¹²C or ¹⁴N survive.'],
      ['@', 'L.H', 'F1', 't₁: shift of the partner proton.'],
      ['L.H', 'j.H6', 'NOE', 'τm = D8', 'Intermolecular NOE to an aromatic proton of the labeled RNA.'],
      ['j.H6', 'j.C6', 'J', '¹J(CH) ≈ 200 Hz', 'Aromatic-selective SOFAST-HMQC.'],
      ['@', 'j.C6', 'F2', 't₂: aromatic ¹³C shift.'],
      ['j.C6', 'j.H6', 'J', '¹J(CH)', 'Back to the aromatic proton.'],
      ['!', 'j.H6', 'F3', 'Detected on the RNA aromatic proton.']],
      end: 'Starts on the unlabeled partner and ends on a ¹³C-bound aromatic proton of the RNA. Every peak is a contact across the interface.' }],
    ref: 'Breeze, Prog. NMR Spectrosc. 36, 323 (2000); Rossi et al., J. Biomol. NMR 66, 259 (2016)'
  });

  X.push({
    id: 'noesy_xfed', g: 'CN', D: '2D', n: '2D NOESY, X-filtered in F1, ¹³C/¹⁵N-edited in F2', s: 'ligand–RNA contacts in 2D',
    set: 'NA_NOESYESGPPHXFED', pp: 'na_noesyesgpphxfed', goals: ['inter', 'noe'], solv: 'both', need: 'CN', ch: 'HCN', wantMix: 1,
    what: 'The 2D form of the filtered and edited NOESY. F1 keeps only protons that are not bound to ¹³C or ¹⁵N; F2 detects only protons that are. Every cross peak is therefore a contact from an unlabeled site to a labeled one: ligand to RNA, or unlabeled to labeled nucleotides.',
    dims: [{ ax: 'F2', n: 'H', sw: 24, o: 4.7, dir: 1, aq: 0.09, rg: ['imU', 'imG', 'am', 'aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, op: 'CNST22', td: 256, rg: ['imU', 'imG', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 64, nsm: 4, d1: 1.3, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST22', '9 ppm', 'Centre of the indirect proton dimension.'], ['O2P', '107 ppm', 'Centre of the carbon resonances.'], ['O3P', '120 ppm', 'Centre of imino and amino nitrogens.'],
      ['Adiabatic pulse', 'wvm -a', 'The matched adiabatic pulse of the filter is generated with WaveMaker.']],
    opt: [['-DAWS', 'Apodization-weighted sampling, useful for NS > 32. Process without linear prediction.'], ['-DNOFILTER', 'Switches the ¹³C/¹⁵N filter in F1 off. Use it to test the setup.']],
    axNote: 'Bruker’s page lists the direct width as “SWF3 = 24 ppm”. In the 2D data set this is F2.',
    lim: ['Bruker warns of a significant loss of sensitivity: many more scans are needed than for a plain NOESY.',
      'No heteronuclear dimension, so proton overlap is the same as in any 2D NOESY.', LEAK],
    paths: [{ t: 'Partner ¹H → labeled RNA ¹H', sc: 'pair:GC+L', st: [
      ['*', 'L.H', 'All protons are excited. Follow a proton of the unlabeled partner.'],
      ['~', 'L.H', 'passes filter', 'An adiabatic filter, matched to the way ¹J(CH) varies with ¹³C shift, purges all protons bound to ¹³C or ¹⁵N.'],
      ['@', 'L.H', 'F1', 't₁: shift of the partner proton.'],
      ['L.H', 'G.H8', 'NOE', 'τm = D8', 'Intermolecular NOE to a proton of the labeled RNA.'],
      ['~', 'G.H8', 'isotope-edited', 'An editing step keeps only protons that are bound to ¹³C or ¹⁵N.'],
      ['!', 'G.H8', 'F2', 'Detected on the RNA proton.']],
      end: 'Starts on a ¹²C/¹⁴N-bound proton and ends on a ¹³C/¹⁵N-bound one.' }],
    ref: 'Zwahlen et al., J. Am. Chem. Soc. 119, 6711 (1997)'
  });
})();
