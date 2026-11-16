/* Experiments for unlabeled RNA, part 2: heteronuclear correlations at natural abundance, TOCSY, ROESY, 31P, HMBC.
   Also defines the shared path helpers RNA.h used by the later data files. */
(function () {
  const R = (window.RNA = window.RNA || { X: [] }), X = R.X;
  const WATER = ['W.H', null, 'EX', 'k_ex', 'Water was never excited. Exchange with it (and fast relaxation next to unperturbed protons) restores the starting magnetization between scans, so the recycle delay can be very short.'];

  /* Out-and-back builders. o: {exc, back, evo, det, end, ax, extra[]} */
  const h = R.h = {
    hmqc(t, sc, H, Xn, J, o) {
      o = o || {};
      const st = [
        ['*', H, o.exc || 'Band-selective pulses excite only this proton region. Water and all other protons stay along +z.'],
        [H, Xn, 'J', J, o.out || 'Delay 1/(2J): the proton becomes antiphase to its heteronucleus. A 90° pulse on the heteronucleus turns this into multiple-quantum coherence shared by both spins.'],
        ['@', Xn, o.ax || 'F1', o.evo || 't₁: the coherence evolves at the heteronuclear shift. The selective ¹H 180° pulse in the middle of t₁ refocuses the proton shift.'],
        [Xn, H, 'J', J, o.back || 'A second 90° pulse and another 1/(2J) delay return in-phase proton magnetization.'],
        ['!', H, o.dax || 'F2', o.det || 'Detected on the proton with heteronuclear decoupling.']];
      if (o.water) { const w = WATER.slice(); w[1] = [].concat(H)[0]; st.push(w); }
      return { t: t, sc: sc, st: st.concat(o.extra || []), end: o.end || 'Out and back: the signal ends on the proton it started on, labelled with the shift of the attached heteronucleus.' };
    },
    hsqc(t, sc, H, Xn, J, o) {
      o = o || {};
      const st = [
        ['*', H, o.exc || 'A 90° pulse excites the proton.'],
        [H, Xn, 'J', J, o.out || 'INEPT: two delays of 1/(4J) around simultaneous 180° pulses make the proton antiphase to the heteronucleus; a pair of 90° pulses then moves the magnetization onto the heteronucleus.'],
        ['@', Xn, o.ax || 'F1', o.evo || 't₁: single-quantum coherence of the heteronucleus evolves at its own shift. A ¹H 180° pulse in the middle removes the coupling to the proton.'],
        [Xn, H, 'J', J, o.back || 'Reverse INEPT: back to the proton and refocused to in-phase magnetization.'],
        ['!', H, o.dax || 'F2', o.det || 'Detected on the proton with heteronuclear decoupling.']];
      if (o.water) { const w = WATER.slice(); w[1] = [].concat(H)[0]; st.push(w); }
      return { t: t, sc: sc, st: st.concat(o.extra || []), end: o.end || 'Out and back: the signal ends on the proton it started on, labelled with the shift of the attached heteronucleus.' };
    },
    water(H) { const w = WATER.slice(); w[1] = H; return w; }
  };
  R.txt = {
    P_FIELD: '³¹P relaxes mainly through its chemical shift anisotropy, which grows with the square of the field. ³¹P lines broaden at high field, so 500–600 MHz usually beats 800 MHz and above for ³¹P experiments.',
    P_PROBE: 'Needs a probe with a ³¹P channel (QCI-P cryoprobe, or a broadband probe).',
    NATAB: 'At natural abundance only 1.1 % of carbons are ¹³C and 0.37 % of nitrogens are ¹⁵N. Plan for 0.5–1 mM RNA or more and long acquisitions.'
  };

  X.push({
    id: 'sfhmqc_n', g: 'U', g2: 'N', D: '2D', n: '2D ¹H,¹⁵N SOFAST-HMQC, imino', s: 'G N1 / U N3 fingerprint',
    set: 'NA_SFHMQCF3GPPH', pp: 'sfhmqcf3gpph', goals: ['imino', 'check'], solv: 'H2O', need: 'N', nat: 1, ch: 'HN',
    what: 'One peak per observable imino group at (¹⁵N, ¹H). The ¹⁵N shift separates G N1 (about 142–149 ppm) from U N3 (about 155–164 ppm), so the imino spectrum is sorted by nucleotide type. It works at natural abundance and is the fastest heteronuclear fingerprint of a folded RNA.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.07, rg: ['imU', 'imG', 'imGU'] },
      { ax: 'F1', n: 'N', sw: 25, o: 153, td: 128, rg: ['gN1', 'uN3'] }],
    ns: { nat: 1024, lab: 8 }, nsm: 8, d1: 0.3,
    par: [['CNST54', '12.5 ppm', 'Centre of the imino proton region (centre of the selective pulses).'],
      ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.']],
    opt: [['-DCALC_SP', 'Calculates all band-selective ¹H pulses from CNST54 and CNST55. Recommended.'],
      ['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C-labeled RNA.']],
    time: 'About 15 min with ¹⁵N labeling, about 18 h at natural abundance (Bruker).',
    lim: ['Only imino groups whose proton survives exchange with water are seen.',
      'During t₁ the signal is multiple-quantum coherence, which relaxes faster than the TROSY component. For RNAs above roughly 50 nt or at 800 MHz and higher, BEST-TROSY gives narrower lines.',
      'Imino protons outside CNST54 ± CNST55/2 (9.5–15.5 ppm with the defaults) are not excited.'],
    paths: [
      h.hmqc('G imino', 'pair:GC+W', 'G.H1', 'G.N1', '¹J(N1,H1) ≈ 90 Hz', { water: 1, end: 'Out and back: ends on G H1. Peak at F1 = G N1 (142–149 ppm), F2 = G H1.' }),
      h.hmqc('U imino', 'pair:AU+W', 'U.H3', 'U.N3', '¹J(N3,H3) ≈ 90 Hz', { water: 1, end: 'Out and back: ends on U H3. Peak at F1 = U N3 (155–164 ppm), F2 = U H3.' })],
    ref: 'Schanda & Brutscher, J. Biomol. NMR 33, 199 (2005)'
  });

  X.push({
    id: 'sfhmqc_c', g: 'U', D: '2D', n: '2D ¹H,¹³C SOFAST-HMQC, aromatic', s: 'H2 / H6 / H8 at natural abundance',
    set: 'NA_SFHMQCGPPH', pp: 'sf_mehmqcgpph', goals: ['base'], solv: 'both', need: 'C', nat: 1, natOnly: 1, ch: 'HC',
    what: 'Aromatic C–H map without labeling: C8–H8 of purines (136–142 ppm), C6–H6 of pyrimidines (140–144 ppm) and C2–H2 of adenine (152–156 ppm). The ¹³C shift tells adenine H2 from H6/H8 and pulls apart overlapped aromatic protons.',
    dims: [{ ax: 'F2', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.1, rg: ['aro'] },
      { ax: 'F1', n: 'C', sw: 25, o: 143, td: 128, rg: ['c68', 'c2a'] }],
    ns: 256, nsm: 8, d1: 0.3,
    par: [['CNST2', '185 Hz', '¹J(CH) used for the transfer delays.'],
      ['CNST49', '8.5 ppm', 'Centre of the H2/H6/H8 region.'],
      ['CNST55', '4 ppm', 'Bandwidth of the aromatic-selective pulses.']],
    opt: [['-DCALC_SP', 'Calculates the band-selective ¹H pulses from the centre and bandwidth constants. Recommended.']],
    time: 'About 5 h (Bruker).',
    lim: ['Aromatic region only. H5, H1′ and the ribose are too close to water for the selective pulses.',
      R.txt.NATAB,
      'The default window ends at 155.5 ppm, right where adenine C2 resonates. Widen SWF1 or raise O2P if you need the H2 peaks.',
      'Bruker lists this parameter set for unlabeled RNA. In ¹³C-labeled RNA the ¹J(CC) splittings (C5–C6 about 67 Hz) call for the selective HSQC with C5 decoupling.'],
    paths: [
      h.hmqc('Purine H8–C8', 'one:G', 'G.H8', 'G.C8', '¹J(C8,H8) ≈ 215 Hz', { out: 'Delay 1/(2J) ≈ 2.7 ms: H8 becomes antiphase to C8. A ¹³C 90° pulse creates multiple-quantum coherence.', end: 'Out and back: ends on H8. Peak at F1 = C8, F2 = H8.' }),
      h.hmqc('Adenine H2–C2', 'one:A', 'A.H2', 'A.C2', '¹J(C2,H2) ≈ 200 Hz', { end: 'Out and back: ends on H2. Peak at F1 = C2 (152–156 ppm), clearly apart from C6/C8.' }),
      h.hmqc('Pyrimidine H6–C6', 'one:C', 'C.H6', 'C.C6', '¹J(C6,H6) ≈ 180 Hz', { end: 'Out and back: ends on H6. Peak at F1 = C6, F2 = H6.' })],
    ref: 'Schanda & Brutscher, J. Biomol. NMR 33, 199 (2005)'
  });

  X.push({
    id: 'hsqc_c_nat', g: 'U', D: '2D', n: '2D ¹H,¹³C HSQC, all protons', s: 'natural abundance',
    set: 'NA_HSQCETGPSP.4', pp: 'hsqcetgpsp.4', goals: ['check', 'base', 'sugar'], solv: 'both', need: 'C', nat: 1, ch: 'HC',
    what: 'All C–H pairs in one spectrum: aromatic carbons (136–156 ppm), C5 (96–106), C1′ (88–95), C4′, C2′/C3′ and C5′ (62–69). For unlabeled RNA it is mostly a fingerprint for comparing samples.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.12, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'C', sw: 100, o: 107, td: 256, rg: ['c68', 'c2a', 'c5', 'c1p', 'c4p', 'c2p3p', 'c5p'] }],
    ns: 128, nsm: 4, d1: 1,
    par: [['CNST2', '170 Hz', '¹J(CH). One compromise value for ribose (145–170 Hz) and aromatic carbons (180–215 Hz).']],
    time: 'About 9 h (Bruker).',
    lim: ['Bruker notes that it plays a minor role for unlabeled RNA: with a 100 ppm ¹³C width the resolution per increment is poor.',
      R.txt.NATAB,
      'Gradient coherence selection gives excellent water suppression, so ribose peaks next to water are visible, but it costs sensitivity compared with the SOFAST-HMQC for the aromatic region.'],
    paths: [
      h.hsqc('Ribose H1′–C1′', 'one:G', 'G.H1p', 'G.C1p', '¹J(C1′,H1′) ≈ 170 Hz', { end: 'Out and back: ends on H1′. Peak at F1 = C1′ (88–95 ppm), F2 = H1′.' }),
      h.hsqc('Base H8–C8', 'one:G', 'G.H8', 'G.C8', '¹J(C8,H8) ≈ 215 Hz', { end: 'Out and back: ends on H8. Peak at F1 = C8, F2 = H8.' })],
    ref: 'Asami et al., Angew. Chem. Int. Ed. 57, 14498 (2018)'
  });

  X.push({
    id: 'tocsy', g: 'U', D: '2D', n: '2D ¹H,¹H TOCSY', s: 'H5–H6 of pyrimidines',
    set: 'NA_DIPSI2ESGPPH', pp: 'na_dipsi2esgpph', goals: ['base', 'sugar'], solv: 'both', need: 'none', ch: 'H',
    what: 'Through-bond H5–H6 peak for every cytosine and uracil (³J about 7–8 Hz): a cleaner way than NOESY to find the pyrimidines. Ribose protons only appear for C2′-endo sugars, which makes the spectrum a quick probe of sugar pucker.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.2, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 6, o: 5.5, op: 'CNST22', td: 400, rg: ['aro', 'h1p', 'rib'] }],
    ns: 8, nsm: 8, d1: 1, mix: { p: 'D9', v: 0.06, lab: 'TOCSY mixing time', hint: '60 ms. Short is enough for H5–H6.' },
    par: [['CNST22', '5.5 ppm', 'Centre of the indirect dimension.']],
    opt: [['-DLABEL_C', '¹³C decoupling during acquisition for ¹³C-labeled RNA (acquisition time limited to 250 ms).'],
      ['-DZQF', 'Zero-quantum filter at the end of the mixing time.'],
      ['-DAWS', 'Apodization-weighted sampling, useful for NS > 32.'],
      ['-DMOCCA', 'MOCCA mixing sequence with better relaxation behaviour (Furrer et al.).']],
    lim: ['Ribose spin systems cannot be traced in A-form RNA: ³J(H1′,H2′) is about 1 Hz for C3′-endo sugars, so nothing leaves H1′.',
      'An H1′–H2′ cross peak (³J 8–10 Hz) flags a C2′-endo sugar, typically in loops and bulges.',
      'Purines give no cross peaks: H8 and H2 have no proton coupling partner.',
      'Relaxation during the spin lock costs signal in larger RNAs.'],
    paths: [
      { t: 'Pyrimidine H5 → H6', sc: 'one:C', st: [
        ['*', 'C.H5', 'All protons are excited. Follow H5.'],
        ['@', 'C.H5', 'F1', 't₁: H5 shift (5–6 ppm).'],
        ['C.H5', 'C.H6', 'TOC', '³J(H5,H6) ≈ 7–8 Hz', 'DIPSI-2 spin lock for D9 = 60 ms. Under isotropic mixing in-phase magnetization oscillates between J-coupled protons; 1/(2J) ≈ 65 ms gives nearly complete transfer.'],
        ['!', 'C.H6', 'F2', 'Detected on H6 after excitation sculpting.']],
        end: 'In-phase H5–H6 cross peak (and its mirror) for every C and U.' },
      { t: 'C2′-endo sugar', sc: 'one:G', st: [
        ['*', 'G.H1p', 'Follow H1′.'],
        ['@', 'G.H1p', 'F1', 't₁: H1′ shift.'],
        ['G.H1p', 'G.H2p', 'TOC', '³J(H1′,H2′) ≈ 8–10 Hz', 'Transfer only happens when the sugar is C2′-endo. In an A-form (C3′-endo) nucleotide this coupling is about 1 Hz and the step fails.'],
        ['G.H2p', 'G.H3p', 'TOC', '³J(H2′,H3′) ≈ 5 Hz', 'With longer mixing the magnetization relays further round the ring.'],
        ['!', ['G.H2p', 'G.H3p'], 'F2', 'Detected on H2′ (and H3′).']],
        end: 'An H1′ row with ribose cross peaks identifies a non-A-form sugar.' }],
    ref: 'Thrippleton & Keeler, Angew. Chem. Int. Ed. 42, 3938 (2003); Furrer et al., J. Magn. Reson. 166, 36 (2004)'
  });

  const pDims = [{ ax: 'F2', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.17, rg: ['aro', 'h1p', 'rib'] },
    { ax: 'F1', n: 'P', sw: 25, o: -1, op: 'O2P', td: 128, rg: ['pp'] }];

  X.push({
    id: 'hp_tocsy', g: 'U', D: '2D', n: '2D ¹H,³¹P hetero-TOCSY', s: 'ribose to phosphorus',
    set: 'NA_HPDI', pp: 'na_hpdi', goals: ['backbone'], solv: 'D2O', need: 'none', ch: 'HP',
    what: 'Correlates each backbone ³¹P with the ribose protons on both sides of it, without labeling. Run it to optimise the hetero-TOCSY step before the long HP-DINO, and to find phosphates with unusual shifts.',
    dims: pDims, ns: 64, nsm: 8, d1: 1,
    mix: { p: 'D21', v: 0.09, lab: 'Hetero-TOCSY mixing', hint: '20 ms keeps the transfer close to the phosphate (Bruker: H2′/H3′/H4′ only); 90 ms spreads it over all ribose protons.' },
    opt: [['-DLABEL_CN', '¹³C decoupling during acquisition for ¹³C-labeled RNA.']],
    lim: ['³¹P shifts of regular A-form phosphates fall within about 1 ppm, so the ³¹P dimension resolves little.',
      'H3′, H4′ and H5′/H5″ overlap between 4 and 5 ppm.',
      'All ¹H–³¹P couplings are below 12 Hz, so the mixing is long and relaxation losses grow quickly with size.',
      R.txt.P_FIELD, R.txt.P_PROBE],
    paths: [{ t: '³¹P → ribose', sc: 'seq:GC', st: [
      ['*', 'j.P', 'Magnetization starts on ³¹P (100 % natural abundance).'],
      ['@', 'j.P', 'F1', 't₁: ³¹P shift.'],
      ['j.P', ['i.H3p', 'j.H5p', 'j.H4p'], 'CP', 'ⁿJ(P,H) < 12 Hz', 'Synchronous DIPSI-2 on ¹H and ³¹P (hetero-TOCSY) for D21: in-phase transfer to H3′ of the 5′ residue and to H5′/H5″ and H4′ of the 3′ residue.'],
      ['i.H3p', 'i.H2p', 'TOC', '³J(HH)', 'The same spin lock mixes the protons with one another, so with 90 ms the magnetization spreads further round each ribose.'],
      ['!', ['i.H3p', 'i.H2p', 'j.H5p', 'j.H4p'], 'F2', 'Detected on the ribose protons, in phase and absorptive.']],
      end: 'Each ³¹P row shows ribose protons of the two residues it joins: H3′ side of residue i, H4′/H5′/H5″ side of residue i+1.' }],
    ref: 'Kellogg, J. Magn. Reson. 98, 176 (1992); Kellogg & Schweitzer, J. Biomol. NMR 3, 577 (1993)'
  });

  X.push({
    id: 'hp_dino', g: 'U', D: '2D', n: '2D ¹H,³¹P HP-DINO', s: 'hetero-TOCSY-NOESY',
    set: 'NA_HPDINO', pp: 'na_hpdino', goals: ['backbone', 'walk'], solv: 'D2O', need: 'none', ch: 'HP', maxNt: 25,
    what: 'Sequential assignment through the backbone without labeling. Each ³¹P is linked to the H6/H8 and H1′ protons of the residues on both sides, which also works in loops and single strands where the NOE walk fails.',
    dims: pDims, ns: 64, nsm: 8, d1: 1,
    mix: { p: 'D8', v: 0.3, lab: 'NOESY mixing time', hint: '250–500 ms.' }, extra: 0.09,
    par: [['D21', '90 ms', 'Hetero-TOCSY mixing time for transfer to all ribose protons. Optimise it first with NA_HPDI.']],
    opt: [['-DLABEL_CN', '¹³C decoupling during acquisition for ¹³C-labeled RNA.'],
      ['na_hpdino3d', 'Bruker supplies a 3D version for overlapping signals.']],
    time: 'About 6 h at 700 MHz with a QCI cryoprobe and 1 mM RNA (Bruker example).',
    lim: ['Very insensitive: two long transfer steps in a row. Bruker quotes at least 1 mM RNA and sizes up to about 25 nt.',
      'A 250–500 ms NOE step is deep in the spin-diffusion regime. Use the spectrum for assignment, not for distances.',
      'Poor ³¹P dispersion: residues in regular helices overlap.',
      R.txt.P_FIELD, R.txt.P_PROBE],
    paths: [{ t: '³¹P → ribose → base', sc: 'seq:GC', st: [
      ['*', 'j.P', 'Magnetization starts on ³¹P.'],
      ['@', 'j.P', 'F1', 't₁: ³¹P shift.'],
      ['j.P', ['i.H3p', 'j.H5p', 'j.H4p'], 'CP', 'ⁿJ(P,H) < 12 Hz', 'Hetero-TOCSY (D21 = 90 ms) moves ³¹P magnetization to the ribose protons of both neighbouring residues.'],
      [['i.H3p', 'i.H3p', 'j.H5p'], ['i.H8', 'j.H6', 'j.H6'], 'NOE', 'τm = D8', 'A NOESY step carries it through space to the bases: H3′(i) to its own H8/H6 and to H6/H8 of residue i+1; H5′/H5″(i+1) to H6/H8(i+1).'],
      ['!', ['i.H8', 'j.H6'], 'F2', 'Detected on aromatic (and H1′) protons.']],
      end: 'Each ³¹P shows the H6/H8 protons of the residues on both of its sides. Shared aromatic shifts lead from one phosphate to the next along the chain.' }],
    ref: 'Kellogg, Szewczak & Moore, J. Am. Chem. Soc. 114, 2727 (1992)'
  });

  X.push({
    id: 'roesy', g: 'U', D: '2D', n: '2D ¹H,¹H ROESY', s: 'EASY-ROESY',
    set: 'NA_ROESYADESJSGPPH', pp: 'na_roesyadesjsgpph', goals: ['dyn', 'noe'], solv: 'both', need: 'none', ch: 'H',
    what: 'NOE measured in the rotating frame. Its main use for RNA is telling true through-space contacts from chemical or conformational exchange: ROE cross peaks have the opposite sign to the diagonal, exchange peaks the same sign. In a NOESY of an RNA both have the sign of the diagonal and look alike.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.1, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, op: 'CNST22', td: 512, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] }],
    dimsD2O: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.2, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 6, o: 5.5, op: 'CNST22', td: 512, rg: ['aro', 'h1p', 'rib'] }],
    ns: 8, nsm: 8, d1: 1, mix: { p: 'D8', v: 0.15, lab: 'ROESY spin-lock time', hint: '150 ms.' },
    par: [['CNST22', '9 ppm in H₂O, 5.5 ppm in D₂O', 'Centre of the indirect dimension.'],
      ['CNST26', '5000', 'Spin-lock field strength γB₁ (Hz).'],
      ['CNST28', '45°', 'Tilt angle of the off-resonance spin lock.']],
    opt: [['-DLABEL_N', '¹⁵N decoupling during acquisition (acquisition time limited to 250 ms).'],
      ['-DLABEL_CN', '¹³C and ¹⁵N decoupling during acquisition (acquisition time limited to 250 ms).'],
      ['-DAWS', 'Apodization-weighted sampling, useful for NS > 32.']],
    time: 'About 16 h (Bruker example).',
    lim: ['The ROE builds up against fast T₁ρ relaxation, so sensitivity is lower than NOESY for RNA-sized molecules.',
      'TOCSY transfer between J-coupled protons (H5–H6, ribose) can leak in with the sign of the diagonal. The adiabatic off-resonance spin lock at 45° tilt suppresses most of it.',
      'Cross-peak intensity depends on the offset from the spin-lock carrier, so quantitative distances need a correction.'],
    paths: [
      { t: 'ROE contact', sc: 'seq:GC', st: [
        ['*', 'i.H1p', 'All protons are excited. Follow H1′(i).'],
        ['@', 'i.H1p', 'F1', 't₁: H1′(i) shift.'],
        ['i.H1p', ['i.H8', 'j.H6'], 'ROE', 'spin lock, D8', 'Adiabatic ramps tilt the magnetization to 45° and lock it there. Cross-relaxation in the rotating frame passes it to protons within 4–5 Å with inverted sign.'],
        ['!', ['i.H8', 'j.H6'], 'F2', 'Detected on the destination protons.']],
        end: 'Cross peak with sign opposite to the diagonal: a true through-space contact.' },
      { t: 'Exchange peak', sc: 'pair:GC+W', st: [
        ['*', 'W.H', 'Follow water (or one conformer of an exchanging pair).'],
        ['@', 'W.H', 'F1', 't₁: shift of the starting site.'],
        ['W.H', 'G.H1', 'EX', 'k_ex', 'During the spin lock the proton itself moves: by chemical exchange between water and a labile site, or between two conformations.'],
        ['!', 'G.H1', 'F2', 'Detected at the shift of the destination site.']],
        end: 'Cross peak with the same sign as the diagonal: exchange, not proximity.' }],
    ref: 'Thiele, Petzold & Schleucher, Chem. Eur. J. 15, 585 (2009)'
  });

  X.push({
    id: 'p31', g: 'U', D: '1D', n: '1D ³¹P', s: 'backbone phosphates',
    set: 'NA_P31', pp: 'zgig', goals: ['check', 'backbone'], solv: 'both', need: 'none', ch: 'P',
    what: 'One line per backbone phosphate. Regular A-form phosphates crowd into about 1 ppm; phosphates in loops, turns and bulges, terminal phosphates and metal-bound sites can move well outside it. A quick check for unusual backbone conformations.',
    dims: [{ ax: 'F1', n: 'P', sw: 20, o: -1, dir: 1, aq: 0.4, rg: ['pp'] }],
    ns: 512, nsm: 8, d1: 1.5,
    lim: ['Very poor dispersion: individual phosphates cannot be assigned without the 2D or 3D correlation experiments.',
      R.txt.P_FIELD, 'The probe must be able to observe ³¹P directly (a broadband observe probe is ideal).'],
    paths: [{ t: 'Direct ³¹P', sc: 'seq:GC', st: [
      ['*', 'j.P', 'A 90° pulse on ³¹P.'],
      ['!', 'j.P', '', 'Detected on ³¹P. ¹H decoupling is switched on only during acquisition (inverse gated), so intensities are not distorted by an NOE.']],
      end: 'Starts and ends on ³¹P.' }]
  });

  X.push({
    id: 'hmbc', g: 'U', D: '2D', n: '2D ¹H,¹³C HMBC', s: 'adenine H2 ↔ H8',
    set: 'NA_HMBCGPL2NDWG', pp: 'hmbcgpl2ndwg', goals: ['base'], solv: 'both', need: 'C', nat: 1, natOnly: 1, ch: 'HC', maxNt: 25,
    what: 'Connects H2 and H8 of the same adenine without labeling. Both protons have a long-range coupling of 5–12 Hz to C4 (three bonds each: H2–C2–N3–C4 and H8–C8–N9–C4), so they share a cross peak at the C4 shift.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.2, rg: ['aro'] },
      { ax: 'F1', n: 'C', sw: 60, o: 145, td: 128, rg: ['cq', 'c2a', 'c68', 'c5pu'] }],
    ns: 256, nsm: 4, d1: 1,
    par: [['CNST13', '8 Hz', 'Long-range ⁿJ(CH) the transfer delay is tuned to: 1/(2·8 Hz) = 62.5 ms.'],
      ['CNST6', '170 Hz', 'Smallest ¹J(CH) for the low-pass filter.'],
      ['CNST7', '210 Hz', 'Largest ¹J(CH) for the low-pass filter.'],
      ['Processing', 'PH_mod(F1) = pk (or no)', 'Process with xfb, then xf2m (magnitude in F2).']],
    time: 'Bruker example: 2 days at 600 MHz for 780 µM RNA in D₂O.',
    lim: ['Adenine only.',
      'Natural abundance plus a 62.5 ms long-range delay: relaxation losses are severe. Practical only for small, concentrated RNAs.',
      'No ¹³C decoupling and magnitude mode in F2, so resolution and sensitivity are modest. H2, with its long T₂, gives the stronger peaks.',
      'Residual one-bond peaks (doublets split by about 200 Hz) can leak through the low-pass filter.'],
    paths: [{ t: 'H2 and H8 meet at C4', sc: 'one:A', st: [
      ['*', ['A.H2', 'A.H8'], 'Both aromatic protons are excited.'],
      [['A.H2', 'A.H8'], 'A.C4', 'J', 'ⁿJ(C4,H) 5–12 Hz', 'During 62.5 ms each proton becomes antiphase to C4, three bonds away. One-bond couplings (170–210 Hz) are removed by a two-step low-pass J filter. A ¹³C 90° pulse creates multiple-quantum coherence.'],
      ['@', 'A.C4', 'F1', 't₁: evolves at the C4 shift (149–152 ppm).'],
      ['A.C4', ['A.H2', 'A.H8'], 'J', 'ⁿJ(C4,H)', 'Converted back to antiphase proton magnetization.'],
      ['!', ['A.H2', 'A.H8'], 'F2', 'Detected without ¹³C decoupling.']],
      end: 'H2 and H8 of one adenine line up at the same C4 frequency in F1. H2 additionally reaches C6 and H8 reaches C5.' }],
    ref: 'van Dongen et al., J. Biomol. NMR 8, 207 (1996)'
  });
})();
