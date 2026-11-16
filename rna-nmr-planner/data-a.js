/* Experiments for unlabeled RNA, part 1: 1D spectra and the NOESY family.
   Parameter values: Bruker "NMR of Nucleic Acids > Experiments" page. Pathway text: written for this app. */
(function () {
  const X = (window.RNA = window.RNA || { X: [] }).X;
  const DEC_N = ['-DLABEL_N', '¹⁵N decoupling during acquisition for ¹⁵N-labeled RNA. Acquisition time is then limited to 250 ms.'];
  const DEC_CN = ['-DLABEL_CN', '¹³C and ¹⁵N decoupling during acquisition for ¹³C,¹⁵N-labeled RNA. Acquisition time is then limited to 250 ms.'];
  const ZQF = ['-DZQF', 'Zero-quantum filter at the end of the mixing time (Thrippleton & Keeler). Removes dispersive zero-quantum distortions between J-coupled protons such as H5–H6.'];
  const AWS = ['-DAWS', 'Apodization-weighted sampling (Simon & Köstler). Useful for NS > 32. Do not process with linear prediction.'];
  const SPINDIFF = 'Spin diffusion: with long mixing times or large RNAs, magnetization is relayed through a third proton (H2′, H5–H6), so intensity no longer reflects one direct distance. For restraints record a build-up at 50, 100 and 150 ms.';

  X.push({
    id: 'zg_es', g: 'U', D: '1D', n: '1D ¹H, all protons in H₂O', s: 'excitation sculpting',
    set: 'ZGDCESGP', pp: 'zgdcesgp', goals: ['check'], solv: 'H2O', need: 'none', ch: 'H',
    what: 'Full ¹H spectrum in H₂O: imino (10–15 ppm), amino and aromatic (6–9 ppm), H1′ and H5 (5–6 ppm), remaining ribose protons (4–5 ppm). Use it to reference shifts, judge concentration and purity, and see at a glance whether the RNA is folded.',
    dims: [{ ax: 'F1', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.13, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 64, nsm: 8, d1: 1.5,
    par: [['P12 / SP1', 'water-selective 180°', 'A longer P12 narrows the notch around water and recovers RNA signals close to 4.7 ppm. Lower SP1 to match.'],
      ['P16', 'gradient pulse', 'Can be shortened to 300 µs for larger RNAs: more signal, poorer water suppression.']],
    opt: [DEC_N, ['-DLABEL_C', '¹³C decoupling during acquisition for ¹³C-labeled RNA. Acquisition time is then limited to 250 ms.']],
    lim: ['Signals under the water notch (some H1′, H5, H3′) are removed together with the water.',
      'Excitation sculpting dephases water instead of keeping it along +z. Fast-exchanging imino and amino protons lose intensity by exchange with dephased water, so the jump-return spectrum is the better imino experiment.',
      'In labeled RNA every proton on ¹⁵N or ¹³C is split by ¹J (about 90 Hz for NH, 145–215 Hz for CH) unless decoupling is switched on.'],
    paths: [{ t: 'No transfer', sc: 'pair:GC+W', st: [
      ['*', ['G.H1', 'G.H8', 'G.H1p', 'C.H41', 'C.H5', 'C.H6'], 'A hard 90° pulse tips every proton into the transverse plane. Nothing is passed between spins.'],
      ['~', 'W.H', 'dephased', 'Double gradient echo with a water-selective 180° pulse: water is dephased, RNA signals are refocused.'],
      ['!', ['G.H1', 'G.H8', 'G.H1p', 'C.H41', 'C.H5', 'C.H6'], '', 'Every RNA proton is detected as an in-phase line at its own shift.']],
      end: 'Magnetization never leaves the proton it started on.' }],
    ref: 'Hwang & Shaka, J. Magn. Reson. A 112, 275 (1995)'
  });

  X.push({
    id: 'jr', g: 'U', D: '1D', n: '1D ¹H, imino protons', s: 'jump-return echo',
    set: 'NA_ZGGPJRSE', pp: 'na_zggpjrse', goals: ['check', 'imino'], solv: 'H2O', need: 'none', ch: 'H',
    what: 'Imino region (about 10–15 ppm) at the highest sensitivity. Each observable imino proton reports one base pair that is protected from exchange with water. Counting them and following them with temperature, Mg²⁺ or ligand is the fastest test of secondary structure.',
    dims: [{ ax: 'F1', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.1, rg: ['imU', 'imG', 'imGU'] }],
    ns: 64, nsm: 8, d1: 0.5, jr: 'CNST19',
    par: [['CNST19', '12 ppm', 'Shift of maximum excitation. Set it to the centre of your imino region.']],
    opt: [['-DLABEL_N', '¹⁵N decoupling during acquisition (set O3P to 150 ppm). Acquisition time limited to 250 ms; use more dummy scans.']],
    tune: ['Run a temperature series first (Bruker suggests 278–313 K in 5 K steps; the optimum is usually 283–308 K) and pick the temperature with the most and sharpest imino signals.'],
    lim: ['Excitation follows sin³ of the offset from water: zero at water, full at CNST19, zero again at 2·CNST19 − O1P. With CNST19 = 12 ppm a signal at 9 ppm has about half intensity, so amino and aromatic protons are attenuated and intensities are not comparable across the spectrum.',
      'Only imino protons that exchange slowly with water are visible. Loops, bulges, helix ends and the pairs next to them are often broadened away. A missing imino signal does not prove a missing base pair.',
      'Number and width of the signals change with temperature, pH and Mg²⁺ because they control base-pair opening and exchange.'],
    paths: [{ t: 'Imino proton', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Jump-return (90°ₓ – τ – 90°₋ₓ) only excites spins that precess during τ. Imino protons, far from the carrier, end up transverse.'],
      ['~', 'W.H', 'kept at +z', 'Water is on resonance, does not precess during τ and is returned to +z by the second pulse. It is never saturated.'],
      ['!', 'G.H1', '', 'A second jump-return element forms an echo; the imino proton is detected.'],
      ['W.H', 'G.H1', 'EX', 'k_ex', 'Between scans the imino proton exchanges with fully polarised water. This refills its magnetization faster than T₁ relaxation, which is why D1 can be as short as 0.5 s.']],
      end: 'Starts and ends on the imino proton (G H1 or U H3). Water stays along +z the whole time.' }],
    ref: 'Sklenář & Bax, J. Magn. Reson. 74, 469 (1987)'
  });

  X.push({
    id: 'zgpr', g: 'U', D: '1D', n: '1D ¹H, all protons in D₂O', s: 'presaturation',
    set: 'ZGDCPR', pp: 'zgdcpr', goals: ['check'], solv: 'D2O', need: 'none', ch: 'H',
    what: 'Non-exchangeable protons only: aromatic H8, H6, H2, then H5 and H1′, then the ribose. With imino and amino signals gone, the 6–8 ppm region and the ribose protons next to water become clean.',
    dims: [{ ax: 'F1', n: 'H', sw: 12, o: 4.7, dir: 1, aq: 0.28, rg: ['aro', 'h1p', 'rib'] }],
    ns: 64, nsm: 8, d1: 1.5,
    par: [['PLW9', '< 0.001 W', 'Presaturation power for the residual HDO line. Raise carefully for better suppression.'],
      ['O1P', '4.7 ppm', 'Place exactly on the residual water line; fine-tune for best suppression.']],
    opt: [['-DLABEL_C', '¹³C decoupling during acquisition for ¹³C-labeled RNA (acquisition time limited to 250 ms).'],
      ['¹⁵N decoupling', 'Possible but usually pointless in D₂O: all ¹⁵N-bound protons have exchanged for deuterium.']],
    lim: ['No imino or amino protons, so no information about base pairing.',
      'Presaturation also bleaches any RNA proton that sits under the residual HDO line. Keep the power low.',
      'The sample has to be exchanged into D₂O. Compare the aromatic region with the H₂O spectrum to confirm the fold is unchanged.'],
    paths: [{ t: 'No transfer', sc: 'one:G', st: [
      ['*', ['G.H8', 'G.H1p', 'G.H2p', 'G.H3p', 'G.H4p', 'G.H5p'], 'Weak irradiation during D1 saturates residual HDO; a 90° pulse then excites all carbon-bound protons.'],
      ['!', ['G.H8', 'G.H1p', 'G.H2p', 'G.H3p', 'G.H4p', 'G.H5p'], '', 'Detected directly, one in-phase line per proton.']],
      end: 'Magnetization stays on the proton it started on. H1, H21/H22 and O2′H are deuterated and invisible.' }]
  });

  const walk = { t: 'H1′ → base walk', sc: 'seq:GC', st: [
    ['*', 'i.H1p', 'All protons are excited. Follow H1′ of residue i.'],
    ['@', 'i.H1p', 'F1', 't₁: H1′(i) precesses at its own shift (5–6 ppm).'],
    ['i.H1p', ['i.H8', 'j.H6'], 'NOE', 'τm = D8', 'A second 90° pulse stores the magnetization along z. During the mixing time dipolar cross-relaxation moves part of it to its own H8 (about 3.7 Å) and to H6/H8 of the 3′ neighbour (4–5 Å in an A-form helix).'],
    ['!', ['i.H8', 'j.H6'], 'F2', 'A third 90° pulse makes it observable on the aromatic protons.']],
    end: 'Each H1′ gives two aromatic cross peaks (own base, 3′ neighbour) and each H6/H8 gives two H1′ peaks. Stepping between them walks along the strand, 5′ to 3′.' };
  const h2p = { t: 'H2′(i) → H6/H8(i+1)', sc: 'seq:GC', st: [
    ['*', 'i.H2p', 'Follow H2′ of residue i.'],
    ['@', 'i.H2p', 'F1', 't₁: H2′(i) shift (4–5 ppm).'],
    ['i.H2p', 'j.H6', 'NOE', 'τm = D8', 'H2′(i) lies only 2.0–2.5 Å from H6/H8 of the next residue in an A-form helix: the strongest sequential contact.'],
    ['!', 'j.H6', 'F2', 'Detected on H6/H8(i+1).']],
    end: 'A strong H2′(i)–H6/H8(i+1) peak marks an A-form (C3′-endo) step. It is also the main spin-diffusion relay at long mixing times.' };

  X.push({
    id: 'noesy_h2o', g: 'U', D: '2D', n: '2D ¹H,¹H NOESY in H₂O', s: 'all protons',
    set: 'NA_NOESYESGPPH', pp: 'na_noesyesgpph', goals: ['imino', 'walk', 'noe'], solv: 'H2O', need: 'none', ch: 'H',
    what: 'The central experiment for unlabeled RNA: every pair of protons closer than about 5 Å gives a cross peak. In H₂O it links each imino proton to its base-pair partner (U H3 to A H2, G H1 to C amino), to the imino protons of the neighbouring base pairs, and to aromatic and H1′ protons.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.1, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, op: 'CNST22', td: 512, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 8, d1: 1.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '100–150 ms for restraints; 50–200 ms for a build-up; about 300 ms is still useful for assignment only.' },
    par: [['CNST22', '9 ppm', 'Centre of the indirect dimension. Shifting it away from water lets 12 ppm cover 3–15 ppm.'],
      ['P12 / SP1', 'water-selective 180°', 'Longer P12 = narrower water notch, more intensity for RNA signals near water.']],
    opt: [DEC_N, DEC_CN, ZQF, AWS], time: 'About 8 h (Bruker example: 600 MHz, 303 K).',
    lim: [SPINDIFF,
      'Exchange with water during the mixing time weakens imino and amino signals and adds water cross peaks. Base pairs that open quickly disappear.',
      'F1 covers only 3–15 ppm (12 ppm around CNST22). Signals outside this range fold.',
      'Aromatic and H1′ regions overlap heavily above roughly 30–40 nt. Move to ¹³C- or ¹⁵N-edited 3D NOESY.'],
    paths: [
      { t: 'A·U: U H3 → A H2', sc: 'pair:AU', st: [
        ['*', 'U.H3', 'All protons are excited. Follow the uridine imino proton.'],
        ['@', 'U.H3', 'F1', 't₁: U H3 precesses at its own shift (13–14.5 ppm).'],
        ['U.H3', ['A.H2', 'A.H61'], 'NOE', 'τm = D8', 'Stored along z, the magnetization cross-relaxes to protons within about 5 Å: A H2 across the pair (about 2.8 Å, a sharp peak near 7–8 ppm) and the adenine amino proton.'],
        ['!', ['A.H2', 'A.H61'], 'F2', 'Read out after excitation sculpting.']],
        end: 'Cross peak at F1 = U H3, F2 = A H2: the signature of a Watson–Crick A·U pair. The mirror peak appears on the other side of the diagonal.' },
      { t: 'G·C: G H1 → C amino', sc: 'pair:GC', st: [
        ['*', 'G.H1', 'Follow the guanine imino proton.'],
        ['@', 'G.H1', 'F1', 't₁: G H1 shift (12–13.5 ppm).'],
        ['G.H1', ['C.H41', 'G.H21'], 'NOE', 'τm = D8', 'Cross-relaxation to the hydrogen-bonded cytosine amino proton across the pair and to its own amino group.'],
        ['C.H41', 'C.H5', 'NOE', 'relay', 'At longer mixing times a second step relays on to C H5 (spin diffusion). Useful for assignment, misleading for distances.'],
        ['!', ['C.H41', 'G.H21', 'C.H5'], 'F2', 'Detected on the destination protons.']],
        end: 'Cross peaks at F1 = G H1, F2 = C H41/H42 (two amino protons, 8–8.5 and 6.5–7 ppm) identify a G·C pair.' },
      { t: 'Imino → neighbouring imino', sc: 'bp2', st: [
        ['*', 'G.H1', 'Follow G H1 of one base pair.'],
        ['@', 'G.H1', 'F1', 't₁: G H1 shift.'],
        ['G.H1', 'U.H3', 'NOE', 'τm = D8', 'Imino protons of stacked base pairs are 3.5–4.5 Å apart, on the same or on opposite strands.'],
        ['!', 'U.H3', 'F2', 'Detected on the neighbouring imino proton.']],
        end: 'Imino–imino cross peaks give the order of base pairs within each helix.' },
      walk]
  });

  X.push({
    id: 'noesy_d2o', g: 'U', D: '2D', n: '2D ¹H,¹H NOESY in D₂O', s: 'non-exchangeable protons',
    set: 'NA_NOESYGPPHPR', pp: 'na_noesygpphpr', goals: ['walk', 'noe', 'sugar'], solv: 'D2O', need: 'none', ch: 'H',
    what: 'Aromatic-to-ribose NOESY without exchangeable protons. The 6–8 ppm region is free of amino signals, so the H6/H8–H1′ sequential walk and the H5–H6 anchor peaks of pyrimidines are easiest to follow here.',
    dims: [{ ax: 'F2', n: 'H', sw: 9, o: 4.7, dir: 1, aq: 0.21, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 6, o: 5.5, op: 'CNST22', td: 512, rg: ['aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 8, d1: 1.5, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '100–150 ms for restraints; 50–200 ms for a build-up; about 300 ms for assignment only.' },
    par: [['CNST22', '5.5 ppm', 'Centre of the indirect dimension (covers 2.5–8.5 ppm).'],
      ['PLW9', '< 0.001 W', 'Presaturation power for residual HDO.']],
    opt: [DEC_N, DEC_CN, ['-DPP', 'Purge pulse after acquisition. Recommended when D1 is short.'], ZQF, AWS],
    lim: ['No imino or amino NOEs: nothing direct about base pairing.',
      SPINDIFF,
      'The walk breaks where the backbone leaves A-form geometry (loops, bulges, syn nucleotides) because H1′(i)–H6/H8(i+1) then exceeds 5 Å.',
      'H5–H6 is the strongest peak in the spectrum and shows zero-quantum distortion. Use -DZQF.'],
    paths: [walk, h2p,
      { t: 'H5–H6 anchor', sc: 'one:C', st: [
        ['*', 'C.H5', 'Follow H5 of a pyrimidine.'],
        ['@', 'C.H5', 'F1', 't₁: H5 shift (5–6 ppm).'],
        ['C.H5', 'C.H6', 'NOE', 'τm = D8', 'H5 and H6 sit 2.45 Å apart on the same ring, a fixed distance.'],
        ['!', 'C.H6', 'F2', 'Detected on H6.']],
        end: 'Strong H5–H6 peaks mark every C and U. They are the usual starting points for the walk and the reference distance for calibrating NOE intensities.' }]
  });

  X.push({
    id: 'noesy_ii', g: 'U', D: '2D', n: '2D NOESY, imino to imino', s: 'SOFAST-SOFAST',
    set: 'NA_SFNOESYSF2D', pp: 'na_sfnoesysf2d', goals: ['imino'], solv: 'H2O', need: 'none', ch: 'H',
    what: 'NOESY restricted to 9–15 ppm in both dimensions. Imino protons of neighbouring base pairs are 3.5–4.5 Å apart, so the cross peaks give the order of base pairs along each helix at high resolution and with a very short recycle delay.',
    dims: [{ ax: 'F2', n: 'H', sw: 6, o: 12, dir: 1, aq: 0.085, rg: ['imU', 'imG', 'imGU'] },
      { ax: 'F1', n: 'H', sw: 6, o: 12, td: 256, rg: ['imU', 'imG', 'imGU'] }],
    ns: 16, nsm: 4, d1: 0.3, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '100–150 ms.' },
    opt: [DEC_CN, AWS],
    lim: ['Covers 9–15 ppm only: imino-to-imino contacts and nothing else.',
      'The chain of cross peaks stops at helix ends, at pairs whose imino proton exchanges quickly, and across junctions.',
      'A G·U wobble pair gives a very strong G H1–U H3 peak inside one pair. Do not read it as a step to the next pair.',
      'Imino–imino NOEs are weak. Longer mixing helps until exchange with water takes over.'],
    paths: [{ t: 'Pair n → pair n+1', sc: 'bp2+W', st: [
      ['*', 'G.H1', 'Band-selective pulses excite only 9–15 ppm. Water and all other protons stay along +z.'],
      ['@', 'G.H1', 'F1', 't₁: G H1 shift.'],
      ['G.H1', 'U.H3', 'NOE', 'τm = D8', 'Cross-relaxation to the imino proton of the stacked neighbouring pair (3.5–4.5 Å).'],
      ['!', 'U.H3', 'F2', 'Selective read-out of the imino region.'],
      ['W.H', 'G.H1', 'EX', 'k_ex', 'Unperturbed water (and nearby unperturbed protons) restore the imino magnetization between scans, so D1 can be 0.3 s.']],
      end: 'Cross peak at (G H1, U H3) and its mirror. Both dimensions contain imino protons only.' }],
    ref: 'Simon & Köstler, J. Biomol. NMR 73, 155 (2019)'
  });

  X.push({
    id: 'noesy_ai', g: 'U', D: '2D', n: '2D NOESY, all protons to imino', s: 'SOFAST NOESY',
    set: 'NA_SFNOESY2D', pp: 'na_sfnoesy2d', goals: ['imino', 'noe'], solv: 'H2O', need: 'none', ch: 'H',
    what: 'All protons are frequency-labelled in t₁ but only the imino protons are read out. Each imino strip lists every proton within 5 Å: A H2, amino, H1′, H5. Faster than the full H₂O NOESY, and free of water artefacts, when the imino strips are all you need.',
    dims: [{ ax: 'F2', n: 'H', sw: 14, o: 12, dir: 1, aq: 0.085, rg: ['imU', 'imG', 'imGU'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, oq: 1, td: 512, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p', 'rib'] }],
    ns: 16, nsm: 4, d1: 0.3, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    opt: [DEC_CN, AWS],
    axNote: 'Bruker lists O1P = 12 ppm and no separate centre for the 12 ppm indirect dimension; 9 ppm is assumed here. The page text also names the axes the other way round (all protons direct, imino indirect), while the pulse logic and the listed widths put the imino protons in the direct dimension. Check both on your first spectrum.',
    lim: ['Only cross peaks that end on an imino proton are recorded. There is no aromatic-to-ribose walk in this spectrum.',
      SPINDIFF],
    paths: [
      { t: 'A H2 → U H3', sc: 'pair:AU', st: [
        ['*', 'A.H2', 'Non-selective excitation of all protons. Follow A H2.'],
        ['@', 'A.H2', 'F1', 't₁: shift of the source proton.'],
        ['A.H2', 'U.H3', 'NOE', 'τm = D8', 'Cross-relaxation across the base pair to U H3 (about 2.8 Å).'],
        ['!', 'U.H3', 'F2', 'Imino-selective read-out. Water is left along +z.']],
        end: 'Cross peak at F1 = A H2, F2 = U H3. Every proton near an imino proton appears in that imino’s strip.' },
      { t: 'C amino → G H1', sc: 'pair:GC', st: [
        ['*', ['C.H41', 'C.H42'], 'Follow the cytosine amino protons.'],
        ['@', ['C.H41', 'C.H42'], 'F1', 't₁: amino proton shifts.'],
        [['C.H41', 'C.H42'], 'G.H1', 'NOE', 'τm = D8', 'Cross-relaxation to the guanine imino proton across the pair.'],
        ['!', 'G.H1', 'F2', 'Imino-selective read-out.']],
        end: 'Two amino cross peaks in the G H1 strip identify the G·C pair.' }],
    ref: 'Simon & Köstler, J. Biomol. NMR 73, 155 (2019)'
  });
})();
