/* Experiments for 15N-labeled RNA, part 2: RDCs, 15N detection, relaxation, exchange, isotope filters. */
(function () {
  const R = window.RNA, X = R.X, h = R.h;
  const IM_H = ['imU', 'imG', 'imGU'];
  const CALC = ['-DCALC_SP', 'Calculates the band-selective ¹H pulses from CNST54 and CNST55. Recommended.'];
  const IMINO_ONLY = 'Imino groups only: you see base-paired residues with observable imino protons. Loops and bulges, usually the most dynamic parts, stay invisible. Use the ¹³C relaxation experiments for those.';
  const PS3D = 'Bruker’s page lists the spectral widths as SWF1 (¹⁵N) and SWF2 (¹H) as for a 2D. In the pseudo-3D data set the list dimension is F1 (TD1), ¹⁵N is F2 and ¹H is F3.';
  const relDims = [{ ax: 'F3', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.07, rg: IM_H },
    { ax: 'F2', n: 'N', sw: 25, o: 153, op: 'O3P', td: 128, rg: ['gN1', 'uN3'] }];
  const DCN_REL = ['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C,¹⁵N-labeled RNA. Also set CNST21, CNST22 and O2P to 110 ppm.'];
  const relPath = (t, tag, text, end, pre) => ({ t: t, sc: 'pair:GC', st: (pre || [
    ['*', 'G.H1', 'Start on the imino proton.'],
    ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'INEPT moves the magnetization to N1.']]).concat([
    ['~', 'G.N1', tag, text],
    ['@', 'G.N1', 'F2', 't₁: N1 shift.'],
    ['G.N1', 'G.H1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'Reverse INEPT back to the proton.'],
    ['!', 'G.H1', 'F3', 'Detected on the imino proton. The peak sits where it does in the HSQC; its intensity carries the measurement.']]), end: end });

  X.push({
    id: 'h2_1d', g: 'N', D: '1D', n: '1D ²H, solvent splitting', s: 'check alignment before RDCs',
    set: 'H2', pp: 'zg2h', goals: ['rdc'], solv: 'both', need: 'none', ch: 'D',
    what: 'Measures the ²H signal of the solvent. In an aligned sample (Pf1 phage, bicelles, a stretched gel) the deuterium quadrupolar coupling of D₂O no longer averages to zero and the line splits into a doublet. The splitting tells you whether, and how strongly, the medium is aligned before you invest in RDC experiments.',
    dims: [{ ax: 'F1', n: 'D', sw: 12, o: 4.7, dir: 1, aq: 1 }],
    ns: 4, nsm: 1, d1: 1,
    lim: ['It reports on the alignment of the medium, not of the RNA. The RDCs you finally measure also depend on the shape and charge of the RNA.',
      'The lock channel is used for observation, so the lock has to be off during the experiment.',
      'Bruker’s ¹⁵N tutorial mentions splittings of roughly 20–25 Hz as typical for small RNAs.'],
    paths: [{ t: 'Solvent deuterium', sc: 'pair:GC+W', st: [
      ['*', 'W.H', 'The ²H nuclei of the solvent are excited through the lock coil.'],
      ['!', 'W.H', '', 'Detected on ²H. Isotropic sample: one line. Aligned sample: a doublet split by the residual quadrupolar coupling.']],
      end: 'No transfer and no RNA signal: the experiment only looks at the solvent.' }]
  });

  X.push({
    id: 'ipap_n', g: 'N', D: '2D', n: '2D ¹H,¹⁵N IPAP-SOFAST-HMQC', s: 'imino N–H RDCs',
    set: 'NA_SFHMQCIA', pp: 'na_sfhmqcia', goals: ['rdc'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'Measures the one-bond N–H splitting of every imino group. Recorded once in isotropic solution (¹J, about 90 Hz) and once in an alignment medium (¹J + ¹D), the difference is the residual dipolar coupling. RDCs give the orientation of each N–H bond in a common molecular frame: long-range information that NOEs cannot provide.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.2, rg: IM_H },
      { ax: 'F1', n: 'N', sw: 25, o: 153, td: 256, rg: ['gN1', 'uN3'] }],
    ns: 16, nsm: 4, d1: 0.4, pseudo: { p: 'IP / AP', n: 2, lab: 'interleaved spectra' },
    par: [['CNST54', '12.5 ppm', 'Centre of the imino proton region.'], ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.'],
      ['Processing', 'split ipap', 'Separates in-phase and antiphase data. Process with 16k–30k points in F2 and 4k in F1.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C,¹⁵N-labeled RNA.'], CALC],
    lim: ['Imino RDCs come only from stable base pairs, and N–H bonds within one helix point in similar directions. They define helix orientations well but say little about loops and bulges; add ¹H–¹³C RDCs for those.',
      'Precision is limited by the line width in the coupled ¹H dimension. Exchange-broadened imino protons give poor RDCs.',
      'The alignment medium may broaden lines or interact with the RNA. Confirm that chemical shifts are unchanged.',
      'Two matched samples (isotropic and aligned) and two spectra are needed.'],
    paths: [{ t: 'Coupled imino doublet', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Imino-selective excitation. Water stays along +z.'],
      ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'After 1/(2J) a ¹⁵N 90° pulse creates multiple-quantum coherence.'],
      ['@', 'G.N1', 'F1', 't₁: N1 shift.'],
      ['G.N1', 'G.H1', 'J', '¹J(N1,H1)', 'Back to H1. In alternate experiments the proton doublet is prepared in phase (IP) or antiphase (AP).'],
      ['!', 'G.H1', 'F2', 'Detected without ¹⁵N decoupling: H1 is a doublet split by ¹J(NH) + ¹D(NH). IP + AP gives one line, IP − AP the other.'],
      h.water('G.H1')],
      end: 'Ends on the imino proton as a doublet. The distance between its two lines is what you measure.' }],
    ref: 'Schanda et al., J. Biomol. NMR 33, 199 (2005)'
  });

  X.push({
    id: 'n_btrosy', g: 'N', D: '2D', n: '2D ¹⁵N-detected BEST-TROSY, imino', s: 'detection on nitrogen',
    set: 'NA_N_BTROSY', pp: 'n_btrosy', goals: ['imino'], solv: 'H2O', need: 'N', ch: 'HN', tro: 1, cdet: '¹⁵N',
    what: 'Imino correlations detected on ¹⁵N instead of ¹H. The ¹⁵N TROSY line of an imino group relaxes very slowly, so for large RNAs at high field this gives the best resolution, and there is no water signal in the detected dimension.',
    dims: [{ ax: 'F2', n: 'N', sw: 50, o: 153, op: 'O3P', dir: 1, aq: 0.25, rg: ['gN1', 'uN3'] },
      { ax: 'F1', n: 'H', sw: 8, o: 12.5, op: 'O1P', td: 128, rg: IM_H }],
    ns: 128, nsm: 4, d1: 0.4,
    par: [['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C,¹⁵N-labeled RNA.']],
    lim: ['Inherently insensitive: detecting on ¹⁵N costs roughly a factor of 30 against ¹H, only partly recovered by the narrow line. Bruker states that a cryoprobe is required and that a TXO cryoprobe is best.',
      'For small RNAs the ¹H-detected BEST-TROSY is far more sensitive. This experiment pays off for large constructs at high field.'],
    paths: [{ t: 'H1 → N1, detect ¹⁵N', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Imino-selective excitation: the experiment starts on the proton for its high polarisation and fast recovery.'],
      ['@', 'G.H1', 'F1', 't₁: ¹H shift of the imino proton (the indirect dimension).'],
      ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'Transfer to N1, keeping the slowly relaxing TROSY component.'],
      ['!', 'G.N1', 'F2', 'Detected on ¹⁵N without ¹H decoupling: the narrow line of the nitrogen doublet.'],
      h.water('G.H1')],
      end: 'One-way transfer: starts on the imino proton and ends on its nitrogen, which is detected directly.' }],
    ref: 'Schnieders et al., J. Biomol. NMR 69, 31 (2017)'
  });

  X.push({
    id: 'n_t1', g: 'N', D: 'pseudo-3D', n: '¹⁵N T₁ relaxation, imino', s: 'ps–ns motion',
    set: 'HSQCT1ETF3GPTCWG3D', pp: 'hsqct1etf3gptcwg3d', goals: ['dyn'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'Longitudinal relaxation of each imino nitrogen. R₁ is sensitive to motion on the picosecond-to-nanosecond time scale; together with R₂ or R₁ρ and the heteronuclear NOE it yields order parameters and the overall tumbling time.',
    dims: relDims, ns: 16, nsm: 8, d1: 1.5, extra: 0.7, pseudo: { p: 'VDLIST', n: 8, lab: 'relaxation delays' }, axNote: PS3D,
    par: [['VDLIST', '8 or more delays, 0 to 1–2 s', 'Match the range to the expected T₁.'],
      ['TD1', '= number of VDLIST entries', 'Pseudo-dimension, FnMODE = QF.']],
    opt: [DCN_REL],
    lim: [IMINO_ONLY,
      'A series costs one 2D spectrum per delay. Repeat at least two delays to estimate errors.',
      'Exchange of the imino proton with water competes with relaxation during the delay and can bias the fit for labile base pairs.'],
    paths: [relPath('T₁ period on N1', 'relax T₁', 'N1 magnetization is stored along z for a variable delay taken from VDLIST and decays with R₁ = 1/T₁. Temperature compensation keeps the heating equal for all delays.',
      'Out and back with a variable waiting period on ¹⁵N in the middle. Intensity versus delay gives T₁ in Dynamics Center.')]
  });

  X.push({
    id: 'n_t2', g: 'N', D: 'pseudo-3D', n: '¹⁵N T₂ relaxation, imino', s: 'CPMG',
    set: 'HSQCT2ETF3GPTCWG3D', pp: 'hsqct2etf3gptcwg3d', goals: ['dyn'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'Transverse relaxation of each imino nitrogen, measured with a CPMG pulse train. R₂ grows with molecular size and is also raised by exchange on the microsecond-to-millisecond time scale, so it reports on both overall tumbling and slow internal motion.',
    dims: relDims, ns: 16, nsm: 8, d1: 1.5, extra: 0.08, pseudo: { p: 'VCLIST', n: 8, lab: 'CPMG loop counts' }, axNote: PS3D,
    par: [['VCLIST', '8 or more loop counts', 'From 1 up to the count at which count × d31 reaches about 100–200 ms.'],
      ['TD1', '= number of VCLIST entries', 'Pseudo-dimension, FnMODE = QF.']],
    opt: [DCN_REL],
    lim: [IMINO_ONLY,
      'R₂ contains exchange contributions. A high value can mean µs–ms dynamics rather than slow tumbling; compare with R₁ρ at high spin-lock power.',
      'CPMG pulse trains heat the sample. Keep the built-in temperature compensation on.'],
    paths: [relPath('T₂ period on N1', 'relax T₂', 'Transverse N1 magnetization is refocused by a train of 180° pulses (CPMG). The loop count from VCLIST sets the total time; the signal decays with R₂ = 1/T₂.',
      'Out and back with a CPMG period on ¹⁵N. Intensity versus CPMG time gives T₂.')]
  });

  X.push({
    id: 'n_t1rho', g: 'N', D: 'pseudo-3D', n: '¹⁵N T₁ρ relaxation, imino', s: 'spin lock',
    set: 'NA_HSQCTRETF3GPSITC3D.3', pp: 'na_hsqctretf3gpsitc3d.3', goals: ['dyn'], solv: 'H2O', need: 'N', ch: 'HN', sl: 1500,
    what: 'Relaxation of ¹⁵N magnetization locked along a radio-frequency field. With a strong spin lock (about 2 kHz) exchange contributions slower than the lock field are suppressed, so the pure R₂ can be extracted more cleanly than from a CPMG experiment.',
    dims: relDims, ns: 16, nsm: 4, d1: 2, extra: 0.1, pseudo: { p: 'VDLIST', n: 8, lab: 'spin-lock times' }, axNote: PS3D,
    par: [['CNST27', '2000 Hz', 'Spin-lock field strength (usual range 1500–2500 Hz).'],
      ['CNST30', '1500 Hz at 600 MHz', 'Offset of the spin lock from the ¹⁵N carrier. Scale with field.'],
      ['P33', '3 ms', 'Length of the adiabatic ramp.'],
      ['SP36 / SP37', 'Gaussramp down / up', 'Use the “+” shapes when CNST30 > 0 and the “−” shapes when CNST30 < 0.'],
      ['VDLIST', '8 or more times, 10–200 ms', 'Spin-lock durations.'], ['TD1', '= number of VDLIST entries', 'Pseudo-dimension.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C,¹⁵N-labeled RNA. Set O2P to 110 ppm.']],
    lim: [IMINO_ONLY,
      'What is measured is R₁ρ = R₁cos²θ + R₂sin²θ, with θ the tilt of the effective field for each peak. Extracting R₂ needs the offset of every peak and a separate T₁ series.',
      'The spin lock heats the sample. Bruker advises D1 of 1.5–2.5 s.'],
    paths: [relPath('Spin lock on N1', 'spin lock', 'Adiabatic ramps align N1 magnetization with the effective field of the spin lock (CNST27, offset CNST30). It decays there with R₁ρ for a variable time from VDLIST.',
      'Out and back with a spin-lock period on ¹⁵N. Intensity versus spin-lock time gives T₁ρ.')]
  });

  X.push({
    id: 'n_hetnoe', g: 'N', D: 'pseudo-3D', n: '¹⁵N{¹H} heteronuclear NOE, imino', s: 'fast internal motion',
    set: 'NA_HSQCNOEF3GPWG3D', pp: 'hsqcnoef3gpwg3d', goals: ['dyn'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'Two interleaved spectra, with and without saturation of the protons. Their intensity ratio is the steady-state heteronuclear NOE, the most direct indicator of fast (ps–ns) motion of an N–H bond: about 0.8 for a rigid imino group, lower or negative for a mobile one.',
    dims: relDims, ns: 64, nsm: 8, d1: 5, pseudo: { p: 'TD1', n: 2, lab: 'saturated / reference' }, axNote: PS3D,
    par: [['D1', '5 s or longer', 'A long recycle delay is essential for accurate values.'], ['TD1', '2', 'Saturated and reference spectrum.']],
    opt: [DCN_REL],
    lim: ['It starts from ¹⁵N polarisation, a tenth of the proton’s. With NS = 64 and D1 ≥ 5 s it is the longest experiment of the relaxation set.',
      'Imino protons exchange with water. Saturating protons also saturates water, and exchange carries that saturation to the imino proton. The faster the exchange, the larger the error in the NOE.',
      IMINO_ONLY],
    paths: [relPath('Steady-state NOE', 'NOE onto N1', 'In one of the two experiments the protons are saturated during the recycle delay. Cross-relaxation then changes the equilibrium N1 magnetization by an amount set by fast motion of the N–H bond.',
      'Starts on ¹⁵N and ends on the imino proton. NOE = I(saturated) / I(reference).',
      [['*', 'G.N1', 'The experiment starts from equilibrium ¹⁵N magnetization, not from the proton.']])]
  });

  X.push({
    id: 'zz', g: 'N', D: 'pseudo-3D', n: 'ZZ-exchange, imino', s: 'slow conformational exchange',
    set: 'NA_B_HSQCEXF3GP3D', pp: 'na_b_hsqcexf3gp3d', goals: ['dyn'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'Detects slow exchange (roughly 0.1 to 100 s⁻¹) between two conformations that give separate peaks, for example the two folds of a bistable RNA or a riboswitch with and without ligand. Magnetization is stored along z on ¹⁵N; molecules that switch conformation in that time carry it to the other state and produce cross peaks between the two sets of signals.',
    dims: relDims, ns: 8, nsm: 8, d1: 0.5, extra: 0.5, pseudo: { p: 'VDLIST', n: 8, lab: 'mixing delays' }, axNote: PS3D,
    par: [['VDLIST', '8 or more delays, 0 to 1–2 s', 'Match to the time scale of the exchange. One delay and TD1 = 1 is enough for a qualitative yes/no.'],
      ['CNST54', '12.5 ppm', 'Centre of the imino proton region.'], ['CNST55', '6 ppm', 'Bandwidth of the imino-selective pulses.']],
    opt: [['-DLABEL_CN', '¹³C decoupling in the ¹⁵N dimension for ¹³C,¹⁵N-labeled RNA.'], CALC],
    lim: ['Both states must be populated enough to be seen, and exchange must be slow enough for two resolved peaks. Faster processes need R₁ρ relaxation dispersion.',
      'The accessible rates are bounded by ¹⁵N T₁ (about a second): much slower exchange gives no cross peak before the signal has relaxed.',
      'Auto and exchange peaks have to be resolved in both dimensions for a quantitative fit.',
      'Exchange of the imino proton with water competes during the mixing delay.'],
    paths: [{ t: 'State A → state B', sc: 'pair:GC+W', st: [
      ['*', 'G.H1', 'Imino-selective excitation of a molecule in state A.'],
      ['G.H1', 'G.N1', 'J', '¹J(N1,H1) ≈ 90 Hz', 'INEPT to N1.'],
      ['@', 'G.N1', 'F2', 't₁: N1 shift of state A.'],
      ['~', 'G.N1', 'mixing, N_z', 'Magnetization is stored along z on ¹⁵N for a delay from VDLIST. Molecules that change conformation during this time take it with them to state B.'],
      ['G.N1', 'G.H1', 'J', '¹J(N1,H1)', 'Back to the imino proton of the molecule, in whichever state it now is.'],
      ['!', 'G.H1', 'F3', 'Detected at the ¹H shift of state A (auto peak) or of state B (exchange peak).']],
      end: 'Exchange cross peaks at (N of state A, H of state B) and the reverse. Their build-up and the decay of the auto peaks give the two rate constants.' }]
  });

  X.push({
    id: 'xhf_noesy', g: 'N', D: '2D', n: 'X double-half-filter NOESY', s: 'selectively ¹⁵N-labeled RNA',
    set: 'NA_NOESYF3GPPHXF19', pp: 'na_noesyf3gpphxf19', goals: ['inter', 'noe', 'imino'], solv: 'H2O', need: 'N', ch: 'HN', wantSel: 1,
    what: 'A NOESY with a ¹⁵N half-filter in both dimensions, for RNA in which only some nucleotides (G or U) carry ¹⁵N. Four interleaved data sets are combined into four sub-spectra: ¹⁴N-bound to ¹⁴N-bound, two mixed spectra, and ¹⁵N-bound to ¹⁵N-bound. The mixed spectra contain only cross peaks between a labeled and an unlabeled site and have no diagonal.',
    dims: [{ ax: 'F2', n: 'H', sw: 26, o: 4.7, dir: 1, aq: 0.08, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p'] },
      { ax: 'F1', n: 'H', sw: 12, o: 9, op: 'CNST22', td: 256, rg: ['imU', 'imG', 'imGU', 'am', 'aro', 'h1p'] }],
    ns: 64, nsm: 8, d1: 1, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' }, pseudo: { p: 'interleaved', n: 4, lab: 'phase combinations' },
    par: [['CNST19', '11 ppm', 'Centre of the region with maximum intensity in F2.'], ['CNST22', '9 ppm', 'Centre of the NOESY dimension F1.'],
      ['O3P', '153 ppm', 'Centre of the imino nitrogens.'], ['Processing', 'split ipap 4', 'Separates the four sub-spectra.']],
    lim: ['Bruker warns of a significant loss of sensitivity against a conventional NOESY.',
      'Carbon-bound protons count as “not bound to ¹⁵N”. In a sample labeled only with ¹⁵N the mixed spectra therefore link labeled imino and amino protons to every aromatic and ribose proton nearby.',
      'The filter is tuned to one ¹J(NH). Exchange-broadened N–H groups leak into the wrong sub-spectrum.',
      'The two mixed spectra hold the same information with F1 and F2 swapped; they differ in digital resolution and in artefacts near the diagonal.'],
    paths: [{ t: 'Labeled G → unlabeled C', sc: 'pair:GC', st: [
      ['*', 'G.H1', 'All protons are excited. Follow the imino proton of a ¹⁵N-labeled guanine.'],
      ['~', 'G.H1', '¹⁵N half-filter', 'First half-filter: a 1/(2J) period with or without a ¹⁵N 180° pulse marks the proton as ¹⁵N-bound.'],
      ['@', 'G.H1', 'F1', 't₁: G H1 shift.'],
      ['G.H1', 'C.H41', 'NOE', 'τm = D8', 'Cross-relaxation to a neighbouring proton, here on an unlabeled cytosine.'],
      ['~', 'C.H41', '¹⁵N half-filter', 'Second half-filter before detection marks the destination proton as not bound to ¹⁵N.'],
      ['!', 'C.H41', 'F2', 'Detected. The four phase combinations are stored separately and combined afterwards.']],
      end: 'This pathway lands in a mixed sub-spectrum (¹⁵N-bound in F1, ¹⁴N-bound in F2), free of diagonal peaks.' }],
    ref: 'Otting & Wüthrich, J. Magn. Reson. 85, 586 (1989)'
  });

  X.push({
    id: 'noesy_nfilt', g: 'N', D: '2D', n: '2D NOESY, ¹⁵N-filtered in F1 and F2', s: 'a “D₂O NOESY” in H₂O',
    set: 'NA_NOESYGPPHXF15N', pp: 'noesygpphwgxf15N', goals: ['walk', 'noe'], solv: 'H2O', need: 'N', ch: 'HN',
    what: 'A NOESY of a ¹⁵N-labeled sample in H₂O in which every proton bound to ¹⁵N is purged in both dimensions. All imino and amino signals vanish and the spectrum looks like a D₂O NOESY, with aromatic and sugar protons only. You get a clean aromatic–H1′ walk without preparing a second sample.',
    dims: [{ ax: 'F2', n: 'H', sw: 10, o: 4.7, dir: 1, aq: 0.15, rg: ['aro', 'h1p', 'rib'] },
      { ax: 'F1', n: 'H', sw: 8, o: 5.5, op: 'CNST19', td: 400, rg: ['aro', 'h1p', 'rib'] }],
    ns: 64, nsm: 8, d1: 1, mix: { p: 'D8', v: 0.15, lab: 'NOE mixing time', hint: '150 ms.' },
    par: [['CNST19', '5.5 ppm', 'Centre of the F1 dimension.'], ['O3P', '115 ppm', 'Centre of amino and imino nitrogens.'],
      ['SP1 / SP11', 'optimise', 'Water-selective pulses: tune carefully for good water suppression.']],
    opt: [['PRESAT', 'ZGOPTNS PRESAT adds presaturation for water suppression.']],
    lim: ['Water is still present. WATERGATE removes H1′, H5 and ribose signals close to 4.7 ppm that a real D₂O sample would show.',
      'Exchange-broadened amino protons are partly decoupled from ¹⁵N by the exchange and can leak through the purge.',
      'The extra filter elements cost sensitivity compared with a plain NOESY.',
      'All nitrogens must be ¹⁵N-labeled. In unlabeled or selectively labeled RNA the ¹⁴N-bound protons are not removed.'],
    paths: [{ t: 'H1′ → base walk, N–H removed', sc: 'seq:GC', st: [
      ['*', 'i.H1p', 'All protons are excited. Follow H1′(i), a carbon-bound proton.'],
      ['~', 'i.H1p', 'passes ¹⁵N purge', 'Purge element: protons coupled to ¹⁵N (¹J about 90 Hz) are turned into unobservable coherence and dephased. Carbon-bound protons pass unchanged.'],
      ['@', 'i.H1p', 'F1', 't₁: H1′(i) shift.'],
      ['i.H1p', ['i.H8', 'j.H6'], 'NOE', 'τm = D8', 'Cross-relaxation to its own H8 and to H6/H8 of the 3′ neighbour.'],
      ['~', 'i.H8', 'passes ¹⁵N purge', 'A second purge before detection removes anything that ended up on an N–H proton.'],
      ['!', ['i.H8', 'j.H6'], 'F2', 'WATERGATE read-out on the aromatic protons.']],
      end: 'Only pathways that start and end on carbon-bound protons survive: the aromatic-to-ribose NOE network.' }],
    ref: 'Breeze, Prog. NMR Spectrosc. 36, 323 (2000)'
  });
})();
