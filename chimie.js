/* =========================================================
   Chimie — module 1 « L'atome et les ions » (30/10/2026)
   - Compétences K1 à K7 (K6 molécules et K7 ions s'ouvrent à la fin de la leçon C6)
   - Leçon C6, exercices corrigés, générateurs, erreurs ciblées
   - « Contrôle type : l'atome » (5 exercices rédigés, note sur 20)
   - Réglage « Ma calculatrice » (choisi par l'élève ou par le parent)
   Valeurs du prof : mp = mn = 1,67 × 10⁻²⁷ kg ; me = 9,11 × 10⁻³¹ kg ;
   atome ≈ 10⁻¹⁰ m ; noyau ≈ 10⁻¹⁵ m.
   Textes rédigés pour l'appli, sans recopie de manuel.
   ========================================================= */

/* ---------- Écritures : puissances de dix, formules, noyaux ---------- */
const SUP_D = '⁰¹²³⁴⁵⁶⁷⁸⁹', SUB_D = '₀₁₂₃₄₅₆₇₈₉';
const supN = (n) => String(n).replace('-', '⁻').replace(/\d/g, (d) => SUP_D[d]);
const subN = (n) => String(n).replace(/\d/g, (d) => SUB_D[d]);
const p10 = (e) => '10' + supN(e);
function sciParts(v, d) {
  if (!v) return { m: 0, e: 0 };
  let e = Math.floor(Math.log10(Math.abs(v))), m = v / Math.pow(10, e);
  m = Math.round(m * Math.pow(10, d)) / Math.pow(10, d);
  if (Math.abs(m) >= 10) { m = m / 10; e++; }
  return { m, e };
}
function sciTxt(v, d = 2) { const { m, e } = sciParts(v, d); return e === 0 ? fr(m, d) : `${fr(m, d)} × ${p10(e)}`; }
const fml = (parts) => parts.map(([x, n]) => x + (n > 1 ? subN(n) : '')).join('');
const ionTxt = (x, q) => x + (Math.abs(q) > 1 ? supN(Math.abs(q)) : '') + (q > 0 ? '⁺' : '⁻');
const nuc = (A, Z, X) => `<span class="nuc"><span class="nz"><sup>${A}</sup><sub>${Z}</sub></span>${X}</span>`;
const MP = 1.67e-27, ME = 9.11e-31;

/* Atomes utilisés par les générateurs : symbole, nom, Z, A (isotope le plus courant) */
const ATOMS = [
  ['H', 'hydrogène', 1, 1], ['He', 'hélium', 2, 4], ['Li', 'lithium', 3, 7], ['C', 'carbone', 6, 12], ['N', 'azote', 7, 14],
  ['O', 'oxygène', 8, 16], ['F', 'fluor', 9, 19], ['Ne', 'néon', 10, 20], ['Na', 'sodium', 11, 23], ['Mg', 'magnésium', 12, 24],
  ['Al', 'aluminium', 13, 27], ['Si', 'silicium', 14, 28], ['P', 'phosphore', 15, 31], ['S', 'soufre', 16, 32], ['Cl', 'chlore', 17, 35],
  ['K', 'potassium', 19, 39], ['Ca', 'calcium', 20, 40], ['Fe', 'fer', 26, 56], ['Cu', 'cuivre', 29, 63], ['Zn', 'zinc', 30, 65],
];
const atomOf = (x) => ATOMS.find((a) => a[0] === x);
/* Ions monoatomiques : symbole, charge, nom */
const IONS = [
  ['Na', 1, 'ion sodium'], ['K', 1, 'ion potassium'], ['Li', 1, 'ion lithium'], ['Mg', 2, 'ion magnésium'], ['Ca', 2, 'ion calcium'],
  ['Cu', 2, 'ion cuivre II'], ['Zn', 2, 'ion zinc'], ['Fe', 2, 'ion fer II'], ['Fe', 3, 'ion fer III'], ['Al', 3, 'ion aluminium'],
  ['Cl', -1, 'ion chlorure'], ['F', -1, 'ion fluorure'], ['O', -2, 'ion oxyde'], ['S', -2, 'ion sulfure'],
];
const POLY = [['SO₄²⁻', 'ion sulfate', -2], ['NH₄⁺', 'ion ammonium', 1], ['HO⁻', 'ion hydroxyde', -1], ['H₃O⁺', 'ion hydronium', 1], ['NO₃⁻', 'ion nitrate', -1], ['CO₃²⁻', 'ion carbonate', -2]];
/* Molécules : formule en morceaux, nom */
const MOLS = [
  [[['O', 2]], 'dioxygène'], [[['N', 2]], 'diazote'], [[['H', 2]], 'dihydrogène'], [[['H', 2], ['O', 1]], 'eau'], [[['C', 1], ['O', 2]], 'dioxyde de carbone'],
  [[['C', 1], ['H', 4]], 'méthane'], [[['N', 2], ['O', 1]], 'protoxyde d’azote'], [[['N', 1], ['H', 3]], 'ammoniac'], [[['C', 3], ['H', 8]], 'propane'],
  [[['C', 4], ['H', 10]], 'butane'], [[['C', 2], ['H', 6], ['O', 1]], 'éthanol (l’alcool)'], [[['C', 6], ['H', 12], ['O', 6]], 'glucose'],
  [[['C', 1], ['O', 1]], 'monoxyde de carbone'], [[['O', 3]], 'ozone'], [[['H', 2], ['O', 2]], 'eau oxygénée'],
];
const dn = (w) => /^[aeiouyéèêâîôh]/i.test(w) ? 'd’' + w : 'de ' + w;
const ELNAME = { C: 'carbone', H: 'hydrogène', O: 'oxygène', N: 'azote' };

/* ---------- Compétences ---------- */
SKILLS.push(
  { id: 'K1', subj: 'chimie', ref: 'MAT-07', name: 'Décrire l’atome', short: 'L’atome', icon: '⚛️' },
  { id: 'K2', subj: 'chimie', ref: 'MAT-06/07', name: 'Lire la carte d’identité d’un atome (A et Z)', short: 'A et Z', icon: '🪪' },
  { id: 'K3', subj: 'chimie', ref: 'OUT-04', name: 'Calculer avec les puissances de dix', short: '10ⁿ', icon: '🔟' },
  { id: 'K4', subj: 'chimie', ref: 'MAT-07', name: 'Calculer la masse d’un atome', short: 'Masse', icon: '⚖️' },
  { id: 'K5', subj: 'chimie', ref: 'MAT-07', name: 'Rapports de taille et de masse', short: 'Rapports', icon: '🔭' },
  { id: 'K6', subj: 'chimie', ref: 'MAT-05', name: 'Lire et écrire une formule de molécule', short: 'Molécules', icon: '🧪', lesson: 'C6' },
  { id: 'K7', subj: 'chimie', ref: 'MAT-08', name: 'Les ions', short: 'Ions', icon: '🔋', lesson: 'C6' },
);

Object.assign(ERR_LABELS, {
  neutA: 'Prend A (nombre de nucléons) pour le nombre de neutrons',
  zA: 'Inverse A et Z',
  expSigne: 'Se trompe de signe dans l’exposant',
  saisie: 'Puissance de dix fausse (saisie à la calculatrice)',
  sciNon: 'N’écrit pas le résultat en écriture scientifique',
  indice: 'Lit mal une formule chimique (indice)',
  signeIon: 'Se trompe de signe pour un ion (perdre ↔ gagner)',
  noyauIon: 'Change le noyau (les protons) dans un ion',
});

Object.assign(FICHES, {
  K1: {
    title: 'Décrire l’atome',
    points: [
      'Au centre : le <b>noyau</b>, minuscule. Autour : les <b>électrons</b> (charge −), qui bougent sans arrêt.',
      'Le noyau contient des <b>protons</b> (charge +) et des <b>neutrons</b> (sans charge). Protons + neutrons = <b>nucléons</b>.',
      'Un atome a <b>autant de protons que d’électrons</b> : il est électriquement neutre.',
      'L’atome est presque vide (structure lacunaire) et sa masse est concentrée dans le noyau.',
    ],
    formula: 'Atome = noyau (protons + neutrons) + électrons autour',
    piege: 'Les électrons ne sont jamais dans le noyau.',
  },
  K2: {
    title: 'Lire la carte d’identité d’un atome',
    points: [
      '<b>Z</b> (en bas) = nombre de protons = nombre d’électrons (atome neutre).',
      '<b>A</b> (en haut, le plus grand) = nombre de nucléons (protons + neutrons).',
      '<b>Neutrons = A − Z</b> (nucléons moins protons).',
      `Exemple : ${nuc(23, 11, 'Na')} → 11 protons, 11 électrons, 23 − 11 = 12 neutrons.`,
    ],
    formula: 'neutrons = A − Z',
    piege: 'A n’est pas le nombre de neutrons : il faut retirer Z.',
  },
  K3: {
    title: 'Calculer avec les puissances de dix',
    points: [
      'Multiplier : on <b>additionne</b> les exposants. 10³ × 10⁴ = 10⁷.',
      'Diviser : on <b>soustrait</b> l’exposant du bas. 10⁸ ÷ 10² = 10⁶.',
      'Avec des exposants négatifs : 10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁻¹⁰⁺¹⁵ = 10⁵ (moins moins donne plus).',
      'Écriture scientifique : un seul chiffre non nul avant la virgule, × 10ⁿ. 0,00056 = 5,6 × 10⁻⁴.',
    ],
    formula: '10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ  •  10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ',
    piege: '10⁻¹⁰ ÷ 10⁻¹⁵ ne fait pas 10⁻²⁵ : −10 − (−15) = +5.',
  },
  K4: {
    title: 'Calculer la masse d’un atome',
    points: [
      'On additionne les masses de toutes les particules : A nucléons et Z électrons.',
      'mₚ = mₙ = 1,67 × 10⁻²⁷ kg ; mₑ = 9,11 × 10⁻³¹ kg.',
      'm = A × 1,67 × 10⁻²⁷ + Z × 9,11 × 10⁻³¹ (en kg).',
      'Le résultat s’écrit en écriture scientifique, avec l’unité kg.',
    ],
    formula: 'm(atome) = A × mₚ + Z × mₑ',
    piege: 'Ne pas mélanger : les masses données sont en kg, pas en g.',
  },
  K5: {
    title: 'Rapports de taille et de masse',
    points: [
      'Un rapport, c’est une <b>division</b> : la grande valeur ÷ la petite.',
      'Taille : atome ≈ 10⁻¹⁰ m, noyau ≈ 10⁻¹⁵ m. Rapport = 10⁵ = 100 000 : l’atome est presque vide.',
      'Masse : le noyau pèse environ 3 700 fois plus que les électrons : la masse est concentrée dans le noyau.',
      'On termine toujours par une phrase qui explique ce que veut dire le nombre.',
    ],
    formula: 'Rapport = grande valeur ÷ petite valeur',
    piege: 'À la calculatrice, mets le bas de la division entre parenthèses.',
  },
  K6: {
    title: 'Lire et écrire une formule de molécule',
    points: [
      'Une molécule est un assemblage d’au moins deux atomes.',
      'Le petit chiffre en bas compte l’atome <b>juste avant</b> ; pas de chiffre = 1.',
      'CO₂ : 1 carbone et 2 oxygènes. C₂H₆O : 2 carbones, 6 hydrogènes, 1 oxygène.',
      'À connaître : O₂, N₂, H₂O, CO₂, CH₄, N₂O.',
    ],
    formula: 'CₓHᵧOz : x carbones, y hydrogènes, z oxygènes',
    piege: 'CO₂ est UNE molécule (de 3 atomes), pas deux molécules.',
  },
  K7: {
    title: 'Les ions',
    points: [
      'Un ion est un atome (ou un groupe d’atomes) qui a <b>perdu ou gagné des électrons</b>.',
      'Le noyau ne change pas : même nombre de protons.',
      'Électrons perdus → charge + → <b>cation</b> (Na⁺, Cu²⁺). Électrons gagnés → charge − → <b>anion</b> (Cl⁻, O²⁻).',
      'Électrons de l’ion = Z − charge. Cu²⁺ : 29 − 2 = 27 électrons. Cl⁻ : 17 + 1 = 18 électrons.',
    ],
    formula: 'perte d’électrons → + • gain d’électrons → −',
    piege: 'a<b>N</b>ion = <b>N</b>égatif. Moins d’électrons, c’est moins de « − », donc une charge +.',
  },
});

Object.assign(CARDS, {
  K1: { title: 'L’atome', body: 'Noyau : protons (+) et neutrons<br>Autour : électrons (−)<br>Atome neutre' },
  K2: { title: 'A et Z', body: 'Z = protons = électrons<br>A = nucléons<br>neutrons = A − Z' },
  K3: { title: 'Puissances de 10', body: '× : on additionne<br>÷ : on soustrait<br>10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁵' },
  K4: { title: 'Masse d’un atome', body: 'A × 1,67 × 10⁻²⁷<br>+ Z × 9,11 × 10⁻³¹ (kg)' },
  K5: { title: 'Rapports', body: 'Atome ÷ noyau ≈ 10⁵ : vide<br>Noyau ÷ électrons ≈ 3 700' },
  K6: { title: 'Formules', body: 'L’indice compte l’atome d’avant<br>CO₂ = 1 C + 2 O' },
  K7: { title: 'Ions', body: 'Perte d’e⁻ → cation +<br>Gain d’e⁻ → anion −<br>Noyau inchangé' },
});

/* ---------- K1 : décrire l'atome (QCM) ---------- */
const K1_BANK = [
  { level: 1, q: 'Où se trouvent les électrons d’un atome ?', choices: [
    { t: 'Autour du noyau', ok: true },
    { t: 'Dans le noyau', msg: 'Le noyau contient les protons et les neutrons. Les électrons sont autour.', code: 'notion' },
    { t: 'Collés aux neutrons', msg: 'Les neutrons sont dans le noyau ; les électrons tournent autour.', code: 'notion' }],
    why: 'Le noyau (protons + neutrons) est au centre, les électrons se déplacent autour.' },
  { level: 1, q: 'Le noyau d’un atome contient :', choices: [
    { t: 'Des protons et des neutrons', ok: true },
    { t: 'Des protons et des électrons', msg: 'Les électrons ne sont pas dans le noyau.', code: 'notion' },
    { t: 'Seulement des électrons', msg: 'Les électrons sont autour du noyau, pas dedans.', code: 'notion' }],
    why: 'Protons et neutrons forment le noyau : ce sont les nucléons.' },
  { level: 1, q: 'La charge électrique d’un proton est :', choices: [
    { t: 'Positive', ok: true },
    { t: 'Négative', msg: 'Négatif, c’est l’électron. Le proton est positif (pense à « p comme plus »).', code: 'notion' },
    { t: 'Nulle', msg: 'Sans charge, c’est le neutron.', code: 'notion' }],
    why: 'Proton : +. Électron : −. Neutron : neutre.' },
  { level: 1, q: 'La charge électrique d’un neutron est :', choices: [
    { t: 'Nulle (il est neutre)', ok: true },
    { t: 'Positive', msg: 'Positif, c’est le proton. Le neutron, comme son nom l’indique, est neutre.', code: 'notion' },
    { t: 'Négative', msg: 'Négatif, c’est l’électron.', code: 'notion' }],
    why: 'Neutron → neutre : aucune charge.' },
  { level: 1, q: 'Un électron porte une charge :', choices: [
    { t: 'Négative', ok: true },
    { t: 'Positive', msg: 'Positif, c’est le proton.', code: 'notion' },
    { t: 'Nulle', msg: 'Sans charge, c’est le neutron.', code: 'notion' }],
    why: 'Les électrons sont chargés négativement.' },
  { level: 1, q: 'Les « nucléons », ce sont :', choices: [
    { t: 'Les protons et les neutrons', ok: true },
    { t: 'Les protons et les électrons', msg: 'Nucléon vient de « noyau » : ce sont les particules du noyau, protons et neutrons.', code: 'notion' },
    { t: 'Seulement les neutrons', msg: 'Les protons sont aussi dans le noyau : ce sont aussi des nucléons.', code: 'neutA' }],
    why: 'Nucléon = particule du noyau : proton ou neutron.' },
  { level: 2, q: 'Pourquoi un atome est-il électriquement neutre ?', choices: [
    { t: 'Il a autant de protons que d’électrons', ok: true },
    { t: 'Il a autant de neutrons que de protons', msg: 'Les neutrons n’ont pas de charge : ils ne comptent pas ici.', code: 'notion' },
    { t: 'Il ne contient aucune charge', msg: 'Il contient des charges + (protons) et − (électrons), mais autant des deux.', code: 'notion' }],
    why: 'Les charges + des protons et − des électrons sont en même nombre : elles s’annulent.' },
  { level: 2, q: 'Où est concentrée presque toute la masse d’un atome ?', choices: [
    { t: 'Dans son noyau', ok: true },
    { t: 'Dans ses électrons', msg: 'Un électron est environ 1 800 fois plus léger qu’un proton.', code: 'notion' },
    { t: 'Elle est répartie partout dans l’atome', msg: 'L’atome est presque vide : la masse est dans le tout petit noyau.', code: 'notion' }],
    why: 'Protons et neutrons sont bien plus lourds que les électrons : la masse est dans le noyau.' },
  { level: 2, q: 'Un atome est surtout constitué :', choices: [
    { t: 'De vide', ok: true },
    { t: 'De protons', msg: 'Les protons sont dans un noyau 100 000 fois plus petit que l’atome.', code: 'notion' },
    { t: 'D’électrons serrés les uns contre les autres', msg: 'Les électrons sont très loin du noyau, et entre les deux il y a du vide.', code: 'notion' }],
    why: 'L’atome a une structure lacunaire : entre le noyau et les électrons, il y a du vide.' },
  { level: 2, q: 'Deux atomes d’éléments différents se distinguent par :', choices: [
    { t: 'Leur nombre de protons (Z)', ok: true },
    { t: 'Leur couleur', msg: 'Les couleurs des dessins sont un modèle : un atome n’a pas de couleur.', code: 'notion' },
    { t: 'Leur nombre d’électrons perdus', msg: 'Un atome ne perd pas d’électrons (sinon c’est un ion).', code: 'notion' }],
    why: 'C’est Z, le nombre de protons, qui dit de quel élément il s’agit.' },
  { level: 3, q: 'Si le noyau d’un atome avait la taille d’une bille de 1 cm, l’atome mesurerait environ :', choices: [
    { t: '1 km', ok: true },
    { t: '1 m', msg: 'L’atome est 100 000 fois plus grand : 1 cm × 100 000 = 100 000 cm = 1 km.', code: 'p10' },
    { t: '10 cm', msg: 'Bien trop petit : le rapport est 100 000, donc 100 000 cm = 1 km.', code: 'p10' }],
    why: 'Rapport 10⁵ : 1 cm × 100 000 = 100 000 cm = 1 000 m = 1 km.' },
  { level: 3, q: 'Un dessin d’atome avec des boules de couleur est :', choices: [
    { t: 'Un modèle, une représentation simplifiée', ok: true },
    { t: 'Une photo prise au microscope', msg: 'Un atome est bien trop petit pour être photographié ainsi : c’est un dessin, un modèle.', code: 'notion' },
    { t: 'La vraie couleur des atomes', msg: 'Les atomes n’ont pas de couleur : les couleurs servent à les reconnaître sur le dessin.', code: 'notion' }],
    why: 'Un modèle est une image simplifiée de la réalité.' },
  { level: 3, q: 'Combien d’éléments chimiques différents connaît-on aujourd’hui ?', choices: [
    { t: 'Environ 118', ok: true },
    { t: 'Environ 26', msg: 'Il y en a bien plus : ils sont tous rangés dans le tableau périodique, environ 118.', code: 'notion' },
    { t: 'Plusieurs millions', msg: 'Ce sont les molécules qui sont innombrables. Les éléments sont environ 118.', code: 'notion' }],
    why: '118 éléments, rangés dans le tableau périodique ; en les combinant, on obtient des millions de molécules.' },
  { level: 3, q: 'Dans l’écriture ᴬZX, la lettre Z représente :', choices: [
    { t: 'Le nombre de protons', ok: true },
    { t: 'Le nombre de nucléons', msg: 'Les nucléons, c’est A (en haut).', code: 'zA' },
    { t: 'Le nombre de neutrons', msg: 'Les neutrons se calculent : A − Z.', code: 'neutA' }],
    why: 'Z = numéro atomique = nombre de protons (et d’électrons dans l’atome).' },
];
function genK1(level) { const pool = K1_BANK.filter((b) => b.level === level); return qcmFrom('K1', pickFresh(pool.length ? pool : K1_BANK)); }

/* ---------- K2 : ᴬZX ---------- */
function genK2(level) {
  const [X, name, Z, A] = pick(level === 1 ? ATOMS.slice(1, 17) : ATOMS.slice(3));
  const N = A - Z, id = `${nuc(A, Z, X)} (${name})`;
  const sol0 = [ST.cherche('un nombre de particules.'), ST.formule('Z (en bas) = protons = électrons • A (en haut) = nucléons • neutrons = A − Z')];
  if (level === 1) {
    const what = pick(['protons', 'électrons']);
    return num({ skill: 'K2', level, q: `Combien ${what === 'protons' ? 'de ' : 'd’'}<b>${what}</b> possède l’atome ${id} ?`, unit: what, ans: Z,
      errs: [{ v: A, code: 'zA', msg: `${A}, c’est A, le nombre de nucléons (en haut). Le nombre de ${what} est Z, en bas.` },
             { v: N, code: 'neutA', msg: `${N}, ce sont les neutrons (A − Z). Les ${what}, c’est Z.` }].filter((e) => e.v !== Z),
      hints: ['Z, le petit nombre en bas, donne le nombre de protons.', what === 'électrons' ? 'Un atome est neutre : autant d’électrons que de protons.' : `Lis le nombre en bas : ${Z}.`],
      sol: [...sol0, ST.calc(`${what} = Z = ${Z}`)] });
  }
  if (level === 2) {
    return num({ skill: 'K2', level, q: `Combien de <b>neutrons</b> possède l’atome ${id} ?`, unit: 'neutrons', ans: N,
      errs: [{ v: A, code: 'neutA', msg: `${A}, c’est le nombre de nucléons (protons + neutrons). Retire les ${Z} protons : ${A} − ${Z}.` },
             ...(Z !== N ? [{ v: Z, code: 'zA', msg: `${Z}, c’est le nombre de protons. Neutrons = A − Z.` }] : []),
             { v: A + Z, code: 'formule', msg: 'On ne les additionne pas : neutrons = A − Z.' }],
      hints: ['Neutrons = nucléons − protons.', `${A} − ${Z}`],
      sol: [...sol0, ST.calc(`neutrons = A − Z = ${A} − ${Z} = ${N}`), ST.piege(`répondre ${A} : c’est le nombre de nucléons, pas de neutrons.`)] });
  }
  if (Math.random() < 0.5) {
    return num({ skill: 'K2', level, q: `Un atome ${dn(name)} (${X}) possède <b>${Z} protons</b> et <b>${N} neutrons</b>. Quel est son nombre de nucléons A ?`, unit: 'nucléons', ans: A,
      errs: [{ v: N, code: 'neutA', msg: 'Les nucléons, ce sont les protons ET les neutrons.' }, { v: N - Z, code: 'formule', msg: 'A = protons + neutrons : on additionne.' }],
      hints: ['Nucléons = protons + neutrons.', `${Z} + ${N}`],
      sol: [ST.cherche('le nombre de nucléons A.'), ST.formule('A = protons + neutrons'), ST.calc(`A = ${Z} + ${N} = ${A}`), ST.phrase(`L’atome s’écrit ${nuc(A, Z, X)}.`)] });
  }
  return qcmFrom('K2', { level, q: `Un atome ${dn(name)} a <b>${Z} protons</b> et <b>${N} neutrons</b>. Quelle écriture est juste ?`, choices: [
    { t: nuc(A, Z, X), ok: true },
    { t: nuc(Z, A, X), msg: 'A (nucléons, le plus grand nombre) va en haut, Z (protons) en bas.', code: 'zA' },
    { t: nuc(N, Z, X), msg: `En haut, on écrit le nombre de nucléons : ${Z} + ${N} = ${A}, pas seulement les neutrons.`, code: 'neutA' }],
    why: `A = ${Z} + ${N} = ${A} en haut ; Z = ${Z} en bas.` });
}

/* ---------- K3 : puissances de dix ---------- */
function genK3(level) {
  if (level === 1) {
    const a = rnd(2, 9), b = rnd(3, 9), mul = Math.random() < 0.6;
    if (mul) return num({ skill: 'K3', level, q: `Complète : 10${supN(a)} × 10${supN(b)} = 10<sup>?</sup>. Donne l’exposant.`, unit: '', ans: a + b,
      errs: [{ v: a * b, code: 'p10', msg: 'Pour multiplier des puissances de dix, on additionne les exposants (on ne les multiplie pas).' }],
      hints: ['Multiplier → on additionne les exposants.', `${a} + ${b}`], sol: [ST.formule('10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ'), ST.calc(`${a} + ${b} = ${a + b}, donc 10${supN(a + b)}`)] });
    const big = Math.max(a, b) + 2, sm = Math.min(a, b);
    return num({ skill: 'K3', level, q: `Complète : 10${supN(big)} ÷ 10${supN(sm)} = 10<sup>?</sup>. Donne l’exposant.`, unit: '', ans: big - sm,
      errs: [{ v: big + sm, code: 'expSigne', msg: 'Pour diviser, on soustrait l’exposant du bas.' }],
      hints: ['Diviser → on soustrait l’exposant du bas.', `${big} − ${sm}`], sol: [ST.formule('10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ'), ST.calc(`${big} − ${sm} = ${big - sm}, donc 10${supN(big - sm)}`)] });
  }
  if (level === 2) {
    const k = pick(['div', 'div', 'mul']);
    if (k === 'mul') {
      const a = -rnd(3, 12); let b = rnd(2, 9); if (b === -a) b++;
      return num({ skill: 'K3', level, neg: true, q: `Complète : 10${supN(a)} × 10${supN(b)} = 10<sup>?</sup>. Donne l’exposant.`, unit: '', ans: a + b,
        errs: [{ v: a - b, code: 'expSigne', msg: 'Multiplier → on additionne : ' + `${a} + ${b}.` }, { v: -(a + b), code: 'expSigne', msg: 'Attention au signe du résultat.' }],
        hints: ['On additionne les exposants, en gardant les signes.', `(${a}) + ${b}`], sol: [ST.formule('10ᵃ × 10ᵇ = 10ᵃ⁺ᵇ'), ST.calc(`(${a}) + ${b} = ${a + b}, donc 10${supN(a + b)}`)] });
    }
    const a = -pick([6, 8, 9, 10, 10, 12]), b = a - pick([2, 3, 4, 5, 5]);
    return num({ skill: 'K3', level, neg: true, q: `Calcule : 10${supN(a)} ÷ 10${supN(b)} = 10<sup>?</sup>. Donne l’exposant.`, unit: '', ans: a - b,
      errs: [{ v: a + b, code: 'expSigne', msg: `On soustrait l’exposant du bas : ${a} − (${b}) = ${a} + ${-b}. Moins moins donne plus.` },
             { v: b - a, code: 'expSigne', msg: 'C’est l’exposant du HAUT moins celui du BAS.' }],
      hints: ['Diviser → exposant du haut − exposant du bas.', `${a} − (${b}) = ${a} + ${-b}`],
      sol: [ST.formule('10ᵃ ÷ 10ᵇ = 10ᵃ⁻ᵇ'), ST.calc(`${a} − (${b}) = ${a} + ${-b} = ${a - b}, donc 10${supN(a - b)}`), ST.piege(`écrire 10${supN(a + b)} : on a ajouté au lieu de soustraire.`)] });
  }
  const k = pick(['toSci', 'toSci', 'toDec']);
  if (k === 'toSci') {
    const e = -rnd(3, 7), m = pick([5.6, 3.2, 7.5, 1.8, 4.1, 9.3, 2.6]);
    const dec = (m * Math.pow(10, e)).toFixed(-e + 1).replace('.', ',');
    return num({ skill: 'K3', level, neg: true, q: `Écris <b>${dec}</b> en écriture scientifique : ${fr(m)} × 10<sup>?</sup>. Donne l’exposant.`, unit: '', ans: e,
      errs: [{ v: -e, code: 'expSigne', msg: 'Un nombre plus petit que 1 a un exposant négatif.' }, { v: e + 1, code: 'p10', msg: 'Compte de combien de rangs la virgule se déplace pour arriver juste après le premier chiffre non nul.' }, { v: e - 1, code: 'p10', msg: 'Compte de combien de rangs la virgule se déplace pour arriver juste après le premier chiffre non nul.' }],
      hints: ['Compte de combien de rangs la virgule doit avancer pour se placer après le premier chiffre non nul.', 'Le nombre est plus petit que 1 : l’exposant est négatif.'],
      sol: [ST.formule('un seul chiffre non nul avant la virgule, puis × 10ⁿ'), ST.calc(`la virgule avance de ${-e} rangs : ${dec} = ${fr(m)} × 10${supN(e)}`)] });
  }
  const e = -rnd(3, 6), m = pick([3.2, 4.5, 1.2, 6.7, 2.4]);
  const good = (m * Math.pow(10, e)).toFixed(-e + 1).replace('.', ',');
  const less = (m * Math.pow(10, e - 1)).toFixed(-e + 2).replace('.', ','), more = (m * Math.pow(10, e + 1)).toFixed(-e).replace('.', ',');
  return qcmFrom('K3', { level, q: `Quelle est l’écriture décimale de <b>${fr(m)} × 10${supN(e)}</b> ?`, choices: [
    { t: good, ok: true },
    { t: less, msg: `Un zéro de trop : la virgule recule de ${-e} rangs, pas ${-e + 1}.`, code: 'p10' },
    { t: more, msg: `Il manque un zéro : la virgule recule de ${-e} rangs.`, code: 'p10' },
    { t: fr(m * Math.pow(10, -e), 0), msg: 'L’exposant est négatif : le nombre est plus petit que 1.', code: 'expSigne' }],
    why: `10${supN(e)} : la virgule recule de ${-e} rangs, donc ${fr(m)} × 10${supN(e)} = ${good}.` });
}

/* ---------- K4 : masse d'un atome ---------- */
const DONNEES = '<span class="small">Données : mₚ = mₙ = 1,67 × 10⁻²⁷ kg ; mₑ = 9,11 × 10⁻³¹ kg.</span>';
function genK4(level) {
  if (level === 1) {
    const [X, name, Z, A] = pick(ATOMS.slice(1, 12));
    const kind = pick(['p', 'n']);
    const n = kind === 'p' ? Z : A - Z, ans = n * MP;
    return num({ skill: 'K4', level, sci: true, q: `L’atome ${nuc(A, Z, X)} (${name}) a ${kind === 'p' ? `<b>${n} protons</b>` : `<b>${n} neutrons</b>`}. Calcule la masse de ses ${kind === 'p' ? 'protons' : 'neutrons'}.<br>${DONNEES}`, unit: 'kg', ans,
      errs: [{ v: ans * 1000, code: 'unite', msg: 'Le résultat est en g : les masses données sont en kg.' }],
      hints: [`Masse = nombre de particules × masse d’une particule.`, `${n} × 1,67 × 10⁻²⁷`],
      sol: [ST.formule(`masse = ${n} × 1,67 × 10⁻²⁷`), ST.calc(`${n} × 1,67 × 10⁻²⁷ = ${fr(n * 1.67, 2)} × 10⁻²⁷${n * 1.67 >= 10 ? ` = ${sciTxt(ans)}` : ''} kg`)] });
  }
  if (level === 2) {
    const [X, name, Z, A] = pick(ATOMS.slice(3));
    const ans = A * MP + Z * ME;
    return num({ skill: 'K4', level, sci: true, q: `Calcule la masse de l’atome ${nuc(A, Z, X)} (${name}).<br>${DONNEES}`, unit: 'kg', ans,
      errs: [{ v: Z * MP + Z * ME, code: 'zA', msg: `Tu n’as compté que les ${Z} protons. Le noyau contient ${A} nucléons (protons + neutrons).` },
             { v: (A - Z) * MP + Z * ME, code: 'neutA', msg: `Tu n’as compté que les neutrons. Le noyau contient ${A} nucléons.` },
             { v: ans * 1000, code: 'unite', msg: 'Le résultat est en g : les masses données sont en kg.' }],
      hints: [`m = A × mₚ + Z × mₑ`, `${A} × 1,67 × 10⁻²⁷ + ${Z} × 9,11 × 10⁻³¹`],
      sol: [ST.cherche('la masse d’un atome, en kg.'), ST.formule(`m = A × mₚ + Z × mₑ (${A} nucléons, ${Z} électrons)`),
            ST.calc(`m = ${A} × 1,67 × 10⁻²⁷ + ${Z} × 9,11 × 10⁻³¹ = ${sciTxt(A * MP, 3)} + ${sciTxt(Z * ME, 3)} ≈ ${sciTxt(ans)} kg`),
            ST.piege('les électrons comptent très peu : la masse est presque celle du noyau.')] });
  }
  const objs = [['un clou en fer de 5 g', 'Fe', 0.005], ['un fil de cuivre de 2 g', 'Cu', 0.002], ['une feuille d’aluminium de 3 g', 'Al', 0.003], ['une mine de crayon en carbone de 0,6 g', 'C', 0.0006]];
  const [obj, X, m] = pick(objs), [, name, Z, A] = atomOf(X), ma = A * MP + Z * ME, ans = m / ma;
  return num({ skill: 'K4', level, sci: true, q: `On considère ${obj}. Un atome ${dn(name)} (${nuc(A, Z, X)}) a une masse de ${sciTxt(ma)} kg. Combien d’atomes contient l’objet ?`, unit: 'atomes', ans,
    errs: [{ v: m * 1000 / ma, code: 'unite', msg: 'Convertis d’abord la masse de l’objet en kg (÷ 1 000).' }, { v: ma / m, code: 'inverse', msg: 'Division à l’envers : nombre d’atomes = masse de l’objet ÷ masse d’un atome.' }],
    hints: ['Nombre d’atomes = masse de l’objet ÷ masse d’un atome.', `Mets la masse de l’objet en kg : ${fr(m, 4)} kg.`],
    sol: [ST.formule('N = masse de l’objet ÷ masse d’un atome'), ST.conv(`${fr(m * 1000, 1)} g = ${fr(m, 4)} kg`), ST.calc(`N = ${fr(m, 4)} ÷ ${sciTxt(ma)} ≈ ${sciTxt(ans)} atomes`),
          ST.phrase(`L’objet contient environ ${sciTxt(ans, 1)} atomes : un nombre gigantesque.`)] });
}

/* ---------- K5 : rapports ---------- */
const K5_QCM = [
  { level: 1, q: 'Le rapport taille de l’atome ÷ taille du noyau vaut 100 000. On en conclut que :', choices: [
    { t: 'L’atome est essentiellement vide', ok: true },
    { t: 'Le noyau est plus grand que l’atome', msg: 'C’est l’inverse : l’atome est 100 000 fois plus grand que son noyau.', code: 'notion' },
    { t: 'Les électrons sont dans le noyau', msg: 'Non : ils sont autour, très loin du noyau.', code: 'notion' }],
    why: 'Un noyau minuscule, des électrons très loin : entre les deux, du vide. On parle de structure lacunaire.' },
  { level: 2, q: 'Le noyau d’un atome est environ 3 700 fois plus lourd que l’ensemble de ses électrons. On en conclut que :', choices: [
    { t: 'La masse de l’atome est concentrée dans son noyau', ok: true },
    { t: 'Les électrons sont plus lourds que le noyau', msg: 'C’est l’inverse : c’est le noyau qui est 3 700 fois plus lourd.', code: 'notion' },
    { t: 'L’atome est vide', msg: 'Le vide se déduit du rapport des tailles. Ici on compare des masses.', code: 'notion' }],
    why: 'Presque toute la masse est dans le noyau : on peut même négliger la masse des électrons.' },
];
function genK5(level) {
  if (level === 1) {
    if (Math.random() < 0.4) return qcmFrom('K5', pickFresh(K5_QCM.filter((b) => b.level === 1)));
    const ea = -pick([10, 10, 10, 9]), en = -pick([14, 15, 15]), ans = Math.pow(10, ea - en);
    return num({ skill: 'K5', level, sci: true, q: `Un atome mesure environ <b>10${supN(ea)} m</b> et son noyau environ <b>10${supN(en)} m</b>. Combien de fois l’atome est-il plus grand que son noyau ?`, unit: 'fois', ans,
      errs: [{ v: Math.pow(10, ea + en), code: 'expSigne', msg: `On soustrait l’exposant du bas : ${ea} − (${en}) = ${ea - en}.` }, { v: Math.pow(10, en - ea), code: 'inverse', msg: 'Division à l’envers : la grande taille (l’atome) va en haut.' }],
      hints: ['Rapport = taille de l’atome ÷ taille du noyau.', `10${supN(ea)} ÷ 10${supN(en)} = 10 puissance (${ea} − (${en}))`],
      sol: [ST.formule('rapport = taille de l’atome ÷ taille du noyau'), ST.calc(`10${supN(ea)} ÷ 10${supN(en)} = 10${supN(ea)}${supN('+' + -en).replace('+', '⁺')} = 10${supN(ea - en)} = ${fr(ans, 0)}`),
            ST.phrase(`L’atome est ${fr(ans, 0)} fois plus grand que son noyau : il est essentiellement vide.`)] });
  }
  if (level === 2) {
    if (Math.random() < 0.3) return qcmFrom('K5', pickFresh(K5_QCM));
    const [X, name, Z, A] = pick(ATOMS.slice(3)), mn = A * MP, me = Z * ME, ans = mn / me;
    return num({ skill: 'K5', level, tol: Math.max(2, ans * 0.005), q: `Pour l’atome ${nuc(A, Z, X)} (${name}), calcule le rapport : masse du noyau ÷ masse de l’ensemble des électrons.<br>${DONNEES}<br><span class="small">Arrondis à l’unité.</span>`, unit: '', ans,
      errs: [{ v: me / mn, code: 'inverse', msg: 'Division à l’envers : la masse du noyau va en haut.' },
             { v: A * MP / ME * Z, code: 'saisie', msg: 'Il manque des parenthèses : ÷ (Z × 9,11 × 10⁻³¹). Sans elles, la calculatrice multiplie par Z au lieu de diviser.' }],
      hints: [`Masse du noyau = ${A} × 1,67 × 10⁻²⁷ ; masse des électrons = ${Z} × 9,11 × 10⁻³¹.`, 'À la calculatrice : mets tout le bas de la division entre parenthèses.'],
      sol: [ST.formule('rapport = masse du noyau ÷ masse des électrons'), ST.calc(`(${A} × 1,67 × 10⁻²⁷) ÷ (${Z} × 9,11 × 10⁻³¹) = ${sciTxt(mn, 3)} ÷ ${sciTxt(me, 3)} ≈ ${fr(ans, 0)}`),
            ST.phrase(`Le noyau est environ ${fr(ans, 0)} fois plus lourd que les électrons : la masse de l’atome est concentrée dans son noyau.`)] });
  }
  const L = pick([[1e-3, '1 mm'], [1e-2, '1 cm'], [1e-6, '1 µm (un micromètre)']]), ans = L[0] / 1e-10;
  if (Math.random() < 0.3) return qcmFrom('K5', pickFresh(K5_QCM));
  return num({ skill: 'K5', level, sci: true, q: `Un atome mesure environ <b>10⁻¹⁰ m</b>. Combien d’atomes faudrait-il aligner pour faire <b>${L[1]}</b> (${sciTxt(L[0], 0)} m) ?`, unit: 'atomes', ans,
    errs: [{ v: 1e-10 / L[0], code: 'inverse', msg: 'Division à l’envers : longueur totale ÷ taille d’un atome.' }],
    hints: ['Nombre d’atomes = longueur totale ÷ taille d’un atome.', `${sciTxt(L[0], 0)} ÷ 10⁻¹⁰`],
    sol: [ST.formule('N = longueur ÷ taille d’un atome'), ST.calc(`${sciTxt(L[0], 0)} ÷ 10⁻¹⁰ = ${sciTxt(ans, 0)}`), ST.phrase(`Il faudrait aligner environ ${sciTxt(ans, 0)} atomes.`)] });
}

/* ---------- K6 : molécules ---------- */
function genK6(level) {
  const [parts, name] = pick(level === 1 ? MOLS.slice(3, 11) : MOLS.slice(3));
  const F = fml(parts), total = parts.reduce((s, [, n]) => s + n, 0);
  if (level === 1) {
    const [el, n] = pick(parts);
    return num({ skill: 'K6', level, q: `Combien d’atomes ${dn(ELNAME[el]).replace(ELNAME[el], '')}<b>${ELNAME[el]}</b> (${el}) contient une molécule ${dn(name)}, de formule <b>${F}</b> ?`, unit: 'atomes', ans: n,
      errs: [{ v: total, code: 'indice', msg: 'Ça, c’est le nombre total d’atomes. On demande seulement ceux ' + dn(ELNAME[el]) + '.' }, { v: n === 1 ? 0 : 1, code: 'indice', msg: 'Pas de petit chiffre après le symbole = 1 atome ; un petit chiffre = ce nombre d’atomes.' }],
      hints: ['Le petit chiffre compte l’atome juste avant lui.', 'Pas de chiffre = 1.'],
      sol: [ST.formule('le petit chiffre en bas compte l’atome juste avant ; pas de chiffre = 1'), ST.calc(`${F} : ${parts.map(([x, k]) => `${k} ${ELNAME[x]}`).join(', ')}`)] });
  }
  if (level === 2) {
    return num({ skill: 'K6', level, q: `Combien d’atomes <b>en tout</b> contient une molécule ${dn(name)}, de formule <b>${F}</b> ?`, unit: 'atomes', ans: total,
      errs: [{ v: parts.length, code: 'indice', msg: `${parts.length}, c’est le nombre de sortes d’atomes. Compte chaque atome grâce aux petits chiffres.` }].filter((e) => e.v !== total),
      hints: ['Additionne les petits chiffres (pas de chiffre = 1).', parts.map(([, k]) => k).join(' + ')],
      sol: [ST.calc(`${F} : ${parts.map(([x, k]) => `${k} ${ELNAME[x]}`).join(' + ')} = ${total} atomes`)] });
  }
  const sorted = parts.slice();
  const wrong1 = fml(sorted.map(([x, n]) => [x, 1])) + (sorted.length === 1 ? subN(sorted[0][1]) : '');
  const wrong2 = sorted.map(([x, n]) => (n > 1 ? n : '') + x).join('');
  const wrong3 = fml(sorted.slice().reverse().map(([x], i, arr) => [x, sorted[i][1]]));
  const ch = [{ t: F, ok: true }];
  [[wrong2, 'Le nombre d’atomes s’écrit en petit, en bas, APRÈS le symbole.'], [wrong3, 'Chaque petit chiffre doit suivre le bon atome.'], [wrong1, 'Il manque des indices : chaque atome présent plusieurs fois a son petit chiffre.']]
    .forEach(([t, msg]) => { if (t !== F && !ch.some((c) => c.t === t)) ch.push({ t, msg, code: 'indice' }); });
  return qcmFrom('K6', { level, q: `Une molécule ${dn(name)} contient ${parts.map(([x, n]) => `<b>${n}</b> atome${n > 1 ? 's' : ''} ${dn(ELNAME[x])}`).join(', ')}. Quelle est sa formule ?`, choices: ch,
    why: `On écrit chaque symbole, suivi en petit du nombre d’atomes (rien s’il n’y en a qu’un) : ${F}.` });
}

/* ---------- K7 : ions ---------- */
function genK7(level) {
  if (level === 1) {
    if (Math.random() < 0.3) {
      const [f, name, q] = pick(POLY);
      return qcmFrom('K7', { level, q: `L’${name} <b>${f}</b> est :`, choices: [
        { t: q > 0 ? 'Un cation' : 'Un anion', ok: true },
        { t: q > 0 ? 'Un anion' : 'Un cation', msg: q > 0 ? 'Sa charge est + : c’est un cation.' : 'Sa charge est − : c’est un a<b>N</b>ion (<b>N</b>égatif).', code: 'signeIon' },
        { t: 'Une molécule', msg: 'Il porte une charge : c’est un ion (formé d’un groupe d’atomes : un ion polyatomique).', code: 'notion' }],
        why: 'Charge + → cation ; charge − → anion. Plusieurs majuscules : l’ion est formé de plusieurs atomes.' });
    }
    const [X, q, name] = pick(IONS);
    return qcmFrom('K7', { level, q: `L’${name} <b>${ionTxt(X, q)}</b> est :`, choices: [
      { t: q > 0 ? 'Un cation' : 'Un anion', ok: true },
      { t: q > 0 ? 'Un anion' : 'Un cation', msg: q > 0 ? 'Sa charge est + : c’est un cation.' : 'Sa charge est − : c’est un a<b>N</b>ion (<b>N</b>égatif).', code: 'signeIon' },
      { t: 'Un atome', msg: 'Il porte une charge électrique : un atome est neutre, ceci est un ion.', code: 'notion' }],
      why: 'Charge + → cation ; charge − → anion (a<b>N</b>ion = <b>N</b>égatif).' });
  }
  const [X, q, name] = pick(IONS), [, aname, Z] = atomOf(X), n = Math.abs(q), I = ionTxt(X, q);
  if (level === 2) {
    if (Math.random() < 0.5) return qcmFrom('K7', { level, q: `Pour devenir l’ion <b>${I}</b>, l’atome ${dn(aname)} a :`, choices: [
      { t: `${q > 0 ? 'Perdu' : 'Gagné'} ${n} électron${n > 1 ? 's' : ''}`, ok: true },
      { t: `${q > 0 ? 'Gagné' : 'Perdu'} ${n} électron${n > 1 ? 's' : ''}`, msg: q > 0 ? 'Charge + : il a MOINS d’électrons que de protons, donc il en a perdu.' : 'Charge − : il a PLUS d’électrons que de protons, donc il en a gagné.', code: 'signeIon' },
      { t: `${q > 0 ? 'Gagné' : 'Perdu'} ${n} proton${n > 1 ? 's' : ''}`, msg: 'Le noyau ne change jamais : ce sont les électrons qui partent ou arrivent.', code: 'noyauIon' }],
      why: `${I} : charge ${q > 0 ? '+' : '−'}${n > 1 ? n : ''} → ${n} électron${n > 1 ? 's' : ''} ${q > 0 ? 'perdu' : 'gagné'}${n > 1 ? 's' : ''}.` });
    return num({ skill: 'K7', level, q: `L’atome ${dn(aname)} a <b>${Z} protons</b>. Combien de <b>protons</b> possède l’ion <b>${I}</b> ?`, unit: 'protons', ans: Z,
      errs: [{ v: Z - q, code: 'noyauIon', msg: 'Le noyau ne change pas quand un ion se forme : seuls les électrons changent.' }, { v: Z + q, code: 'noyauIon', msg: 'Le noyau ne change pas quand un ion se forme : seuls les électrons changent.' }],
      hints: ['Un ion garde le même noyau que son atome.', `Protons = ${Z}`], sol: [ST.formule('un ion a le même noyau que l’atome'), ST.calc(`${I} : ${Z} protons, comme l’atome ${dn(aname)}`)] });
  }
  const A = atomOf(X)[3], e = Z - q;
  return num({ skill: 'K7', level, q: `Combien d’<b>électrons</b> possède l’ion <b>${I}</b> ? L’atome ${dn(aname)} s’écrit ${nuc(A, Z, X)}.`, unit: 'électrons', ans: e,
    errs: [{ v: Z, code: 'signeIon', msg: `${Z}, c’est le nombre d’électrons de l’atome. L’ion en a ${q > 0 ? 'perdu' : 'gagné'} ${n}.` },
           { v: Z + q, code: 'signeIon', msg: q > 0 ? 'Charge + : l’atome a PERDU des électrons, il en a donc moins.' : 'Charge − : l’atome a GAGNÉ des électrons, il en a donc plus.' },
           { v: A - Z, code: 'neutA', msg: 'Ça, c’est le nombre de neutrons.' }].filter((x) => x.v !== e),
    hints: [`L’atome a ${Z} électrons. ${q > 0 ? 'Charge + : il en a perdu.' : 'Charge − : il en a gagné.'}`, `${Z} ${q > 0 ? '−' : '+'} ${n}`],
    sol: [ST.formule('électrons de l’ion = Z − charge'), ST.calc(`${I} : ${Z} ${q > 0 ? '−' : '+'} ${n} = ${e} électrons (${Z} protons, ${A - Z} neutrons)`),
          ST.phrase(`L’ion ${I} possède ${e} électrons.`)] });
}

Object.assign(GENERATORS, { K1: genK1, K2: genK2, K3: genK3, K4: genK4, K5: genK5, K6: genK6, K7: genK7 });

/* ---------- Rédaction (mode « Rédiger » et contrôle type) ---------- */
const sciStep = (label, prompt, ans, unit, units, errs, show) => Object.assign(nStep(label, prompt, ans, unit, units, errs, show), { sci: true });
const K = {
  /* Ex. 1 : carte d'identité */
  ident(lv, real) {
    const [X, name, Z, A] = real ? atomOf('O') : pick(ATOMS.slice(3)), N = A - Z;
    return stepsItem('K2', lv, `L’atome ${dn(name)} s’écrit ${nuc(A, Z, X)}. Donne sa composition, puis explique pourquoi il est électriquement neutre.`, [
      { kind: 'qcm', label: 'Lire Z et A', prompt: 'Que représentent les deux nombres ?', choices: [{ t: `Z = ${Z} protons ; A = ${A} nucléons`, ok: true },
        { t: `Z = ${Z} neutrons ; A = ${A} protons`, msg: 'Z (en bas) donne les protons ; A (en haut) les nucléons.', code: 'zA' },
        { t: `A = ${A} neutrons ; Z = ${Z} électrons seulement`, msg: 'A compte tous les nucléons (protons + neutrons), pas seulement les neutrons.', code: 'neutA' }], show: `🪪 Z = ${Z} (protons), A = ${A} (nucléons)` },
      nStep('Les électrons', 'Combien d’électrons ?', Z, 'électrons', null, [{ v: A, code: 'zA', msg: 'Atome neutre : autant d’électrons que de protons (Z).' }], `⚛️ électrons = Z = ${Z}`),
      nStep('Les neutrons', 'Combien de neutrons ?', N, 'neutrons', null, [{ v: A, code: 'neutA', msg: `Neutrons = A − Z = ${A} − ${Z}.` }], `🧮 neutrons = A − Z = ${A} − ${Z} = ${N}`),
      pStep(`L’atome est neutre car il possède autant de protons (${Z}, charges +) que d’électrons (${Z}, charges −).`, [[`L’atome est neutre car il possède ${N} neutrons.`, 'Les neutrons n’ont pas de charge : ils n’expliquent pas la neutralité.'], ['L’atome est neutre car il ne contient pas de charges.', 'Il contient des charges + et −, mais en même nombre.']]),
    ]);
  },
  /* Ex. 2 : atome et noyau */
  taille(lv, real) {
    const ea = real ? -10 : -pick([10, 10, 9]), en = real ? -15 : -pick([14, 15]), d = ea - en, R = Math.pow(10, d);
    return stepsItem('K5', lv, `Un atome mesure environ <b>10${supN(ea)} m</b> ; son noyau mesure environ <b>10${supN(en)} m</b>. Calcule le rapport entre la taille de l’atome et celle de son noyau, puis interprète le résultat.`, [
      fStep('rapport = taille de l’atome ÷ taille du noyau', [['rapport = taille du noyau ÷ taille de l’atome', 'La grande valeur (l’atome) va en haut.', 'inverse'], ['rapport = taille de l’atome × taille du noyau', 'Un rapport est une division.']], 'rapport = taille de l’atome ÷ taille du noyau'),
      Object.assign(nStep('L’exposant', `10${supN(ea)} ÷ 10${supN(en)} = 10 puissance… (donne l’exposant)`, d, '', null, [{ v: ea + en, code: 'expSigne', msg: `On soustrait : ${ea} − (${en}) = ${ea} + ${-en}.` }], `🔟 ${ea} − (${en}) = ${d}, donc 10${supN(d)}`), { neg: true }),
      nStep('En chiffres', `Écris 10${supN(d)} sans puissance.`, R, '', null, [{ v: Math.pow(10, d - 1), code: 'p10', msg: `10${supN(d)} = 1 suivi de ${d} zéros.` }, { v: Math.pow(10, d + 1), code: 'p10', msg: `10${supN(d)} = 1 suivi de ${d} zéros.` }], `🧮 10${supN(d)} = ${fr(R, 0)}`),
      pStep(`L’atome est ${fr(R, 0)} fois plus grand que son noyau : il est essentiellement constitué de vide.`, [[`Le noyau est ${fr(R, 0)} fois plus grand que l’atome.`, 'C’est l’inverse : l’atome est le plus grand.'], ['L’atome est plein de matière.', 'Un noyau minuscule et des électrons très loin : l’atome est presque vide.']]),
    ]);
  },
  /* Ex. 3 : masse d'un atome */
  masse(lv, real) {
    const [X, name, Z, A] = real ? atomOf('O') : pick(ATOMS.slice(3)), mN = A * MP, mE = Z * ME, m = mN + mE;
    return stepsItem('K4', lv, `Calcule la masse de l’atome ${nuc(A, Z, X)} (${name}).<br>${DONNEES}`, [
      fStep('m = A × 1,67 × 10⁻²⁷ + Z × 9,11 × 10⁻³¹', [[`m = Z × 1,67 × 10⁻²⁷ + Z × 9,11 × 10⁻³¹`, `Le noyau contient ${A} nucléons, pas seulement les ${Z} protons.`, 'zA'], [`m = (A − Z) × 1,67 × 10⁻²⁷`, 'Il faut compter tous les nucléons (protons et neutrons).', 'neutA']], `m = A × mₚ + Z × mₑ = ${A} × 1,67 × 10⁻²⁷ + ${Z} × 9,11 × 10⁻³¹`),
      sciStep('Le noyau', `Masse du noyau : ${A} × 1,67 × 10⁻²⁷ =`, mN, 'kg', null, [{ v: Z * MP, code: 'zA', msg: `Il y a ${A} nucléons dans le noyau.` }], `🧮 noyau : ${A} × 1,67 × 10⁻²⁷ = ${sciTxt(mN, 3)} kg`),
      sciStep('Les électrons', `Masse des électrons : ${Z} × 9,11 × 10⁻³¹ =`, mE, 'kg', null, [], `🧮 électrons : ${Z} × 9,11 × 10⁻³¹ = ${sciTxt(mE, 3)} kg`),
      sciStep('La masse de l’atome', 'Additionne, et choisis l’unité.', m, 'kg', ['kg', 'g', 'm'], [{ v: m * 1000, code: 'unite', msg: 'Les masses données sont en kg.' }], `🧮 m = ${sciTxt(mN, 3)} + ${sciTxt(mE, 3)} ≈ ${sciTxt(m)} kg`),
      pStep(`La masse de l’atome ${dn(name)} est d’environ ${sciTxt(m)} kg.`, [[`La masse du noyau est de ${A} kg.`, `${A} est un nombre de nucléons, pas une masse.`], [`L’atome ${dn(name)} a ${Z} électrons.`, 'C’est une donnée, pas la masse demandée.']]),
    ]);
  },
  /* Ex. 4 : où est la masse ? */
  rapport(lv, real) {
    const [X, name, Z, A] = real ? atomOf('O') : pick(ATOMS.slice(3)), mN = A * MP, mE = Z * ME, R = mN / mE;
    return stepsItem('K5', lv, `Pour l’atome ${nuc(A, Z, X)} (${name}), calcule le rapport entre la masse du noyau et la masse de l’ensemble des électrons. Que peut-on en conclure ?<br>${DONNEES}`, [
      fStep('rapport = masse du noyau ÷ masse des électrons', [['rapport = masse des électrons ÷ masse du noyau', 'La plus grande masse (le noyau) va en haut.', 'inverse'], ['rapport = masse du noyau − masse des électrons', 'Un rapport est une division.']], 'rapport = masse du noyau ÷ masse des électrons'),
      nStep('Le calcul', `(${A} × 1,67 × 10⁻²⁷) ÷ (${Z} × 9,11 × 10⁻³¹) ≈ ? (arrondis à l’unité)`, R, '', null,
        [{ v: mE / mN, code: 'inverse', msg: 'Division à l’envers.' }, { v: (A * MP / ME) * Z, code: 'saisie', msg: 'Parenthèses oubliées autour du bas de la division.' }], `🧮 rapport = ${sciTxt(mN, 3)} ÷ ${sciTxt(mE, 3)} ≈ ${fr(R, 0)}`, Math.max(2, R * 0.01)),
      pStep(`Le noyau est environ ${fr(R, 0)} fois plus lourd que les électrons : la masse de l’atome est concentrée dans son noyau.`, [['Les électrons sont plus lourds que le noyau.', 'C’est l’inverse.'], ['L’atome est essentiellement vide.', 'Juste, mais cela se déduit des tailles. Ici on compare des masses.']]),
    ]);
  },
  /* Ex. 5 : molécules et ions */
  molion(lv, real) {
    const [parts, mname] = real ? MOLS[4] : pick(MOLS.slice(3, 12)), F = fml(parts), tot = parts.reduce((s, [, n]) => s + n, 0);
    const [X, q, iname] = real ? ['Cu', 2, 'ion cuivre II'] : pick(IONS), [, aname, Z] = atomOf(X), I = ionTxt(X, q), n = Math.abs(q);
    return stepsItem('K7', lv, `a) La molécule ${dn(mname)} a pour formule <b>${F}</b>. Combien d’atomes contient-elle en tout ?<br>b) L’atome ${dn(aname)} (Z = ${Z}) peut devenir l’${iname} <b>${I}</b>. Est-ce un cation ou un anion ? Combien d’électrons possède cet ion ?`, [
      nStep('a) Les atomes', `Nombre total d’atomes dans ${F} :`, tot, 'atomes', null, [{ v: parts.length, code: 'indice', msg: 'Compte chaque atome grâce aux petits chiffres.' }], `🧪 ${F} : ${parts.map(([x, k]) => `${k} ${ELNAME[x]}`).join(' + ')} = ${tot} atomes`),
      { kind: 'qcm', label: 'b) Cation ou anion', prompt: `${I} est :`, choices: [{ t: `${q > 0 ? 'Un cation' : 'Un anion'} : il a ${q > 0 ? 'perdu' : 'gagné'} ${n} électron${n > 1 ? 's' : ''}`, ok: true },
        { t: `${q > 0 ? 'Un anion' : 'Un cation'} : il a ${q > 0 ? 'gagné' : 'perdu'} ${n} électron${n > 1 ? 's' : ''}`, msg: 'Perte d’électrons → charge + → cation ; gain → charge − → anion.', code: 'signeIon' },
        { t: `${q > 0 ? 'Un cation' : 'Un anion'} : il a ${q > 0 ? 'gagné' : 'perdu'} ${n} proton${n > 1 ? 's' : ''}`, msg: 'Le noyau ne change pas : ce sont des électrons.', code: 'noyauIon' }],
        show: `🔋 ${I} : ${q > 0 ? 'cation' : 'anion'}, ${n} électron${n > 1 ? 's' : ''} ${q > 0 ? 'perdu' : 'gagné'}${n > 1 ? 's' : ''}` },
      nStep('b) Les électrons', `Nombre d’électrons de ${I} :`, Z - q, 'électrons', null, [{ v: Z, code: 'signeIon', msg: 'C’est le nombre d’électrons de l’atome, pas de l’ion.' }, { v: Z + q, code: 'signeIon', msg: q > 0 ? 'Il en a perdu : il en a moins.' : 'Il en a gagné : il en a plus.' }], `🧮 ${Z} ${q > 0 ? '−' : '+'} ${n} = ${Z - q} électrons`),
      pStep(`${F} contient ${tot} atomes ; ${I} est ${q > 0 ? 'un cation' : 'un anion'} qui possède ${Z - q} électrons.`, [[`${I} possède ${Z} électrons.`, 'C’est le nombre de l’atome, pas de l’ion.'], [`${F} contient ${parts.length} atomes.`, 'Ce sont les sortes d’atomes, pas leur nombre.']]),
    ]);
  },
};
const CTRLK_ORDER = [['ident', 'Ex. 1', 'Carte d’identité d’un atome'], ['taille', 'Ex. 2', 'Atome et noyau'], ['masse', 'Ex. 3', 'Masse d’un atome'], ['rapport', 'Ex. 4', 'Où est la masse ?'], ['molion', 'Ex. 5', 'Molécules et ions']];
REDAC_SKILLS.push('K4', 'K5');
(() => {
  const base = genRedac;
  genRedac = function (skill, level) {
    const lv = Math.max(1, Math.min(3, level || 1));
    if (skill === 'K4') return K.masse(lv, false);
    if (skill === 'K5') return pick([K.taille, K.rapport])(lv, false);
    return base(skill, level);
  };
})();

/* ---------- « Contrôle type : l'atome » ---------- */
function ctrlKState() { S.ctrlK = S.ctrlK || { lv: 1, best: {}, hist: [] }; return S.ctrlK; }
function screenCtrlK() {
  const C = ctrlKState(), last = C.hist[C.hist.length - 1];
  render(`
    <div class="row between" style="margin-bottom:10px"><button class="link" id="cBack">← Accueil</button><span class="chip">📝 Contrôle type</span></div>
    <div class="card hero stack">
      <h2>L’atome</h2>
      <p class="muted" style="margin:0">5 exercices comme au contrôle : la carte d’identité d’un atome, le rapport des tailles, la masse d’un atome, le rapport des masses, les molécules et les ions. Tu rédiges chaque exercice comme sur ta copie, puis tu obtiens une note sur 20.</p>
      <div class="tip" style="color:var(--ink)">🎚️ <b>Niveau d’aide ${C.lv}/3</b> : ${CTRL_LV[C.lv]}.<br><span class="small">Avec 14/20 ou plus, l’aide diminue la fois suivante.</span></div>
      ${last ? `<p class="small" style="margin:0">Dernier essai : <b>${fr(last.note, 1)}/20</b> (aide ${last.lv}/3) • Record « comme le jour J » : <b>${C.best[3] != null ? fr(C.best[3], 1) + '/20' : 'pas encore'}</b></p>` : ''}
      <button class="link" id="cCalc" style="padding:0;text-align:left">🧮 Comment taper 1,67 × 10⁻²⁷ sur ma calculatrice ?</button>
    </div>
    <div class="stack">
      <button class="btn" id="cReal">▶ Le sujet de la classe (atome d’oxygène)</button>
      <button class="btn ghost" id="cNew">🔀 Un nouveau sujet (autres atomes)</button>
      ${C.lv > 1 ? '<button class="link" id="cHelp">Je préfère plus d’aide cette fois</button>' : ''}
    </div>`);
  document.getElementById('cBack').onclick = screenHome;
  document.getElementById('cCalc').onclick = () => openCalc();
  const go = (real, lv) => { startRun('redac', null, CTRLK_ORDER.map(([k]) => Object.assign(K[k](lv, real), { ctrlKey: k }))); RUN.ctrlK = { real, lv }; };
  document.getElementById('cReal').onclick = () => go(true, C.lv);
  document.getElementById('cNew').onclick = () => go(false, C.lv);
  const h = document.getElementById('cHelp'); if (h) h.onclick = () => go(false, C.lv - 1);
}
function finishCtrlK() {
  stopTimer();
  const run = RUN, res = run.results, C = ctrlKState();
  const streakMsg = touchStreak();
  S.sessions++;
  const pts = res.map(ctrlPoints), note = Math.round(pts.reduce((a, b) => a + b, 0) * 2) / 2, prevBest = C.best[run.ctrlK.lv];
  C.hist.push({ date: todayStr(), lv: run.ctrlK.lv, note, real: run.ctrlK.real }); C.hist = C.hist.slice(-20);
  if (prevBest == null || note > prevBest) C.best[run.ctrlK.lv] = note;
  let up = '';
  if (note >= 14 && run.ctrlK.lv === C.lv && C.lv < 3) { C.lv++; up = `Prochaine fois : niveau d’aide ${C.lv}/3 (${CTRL_LV[C.lv].toLowerCase()}).`; }
  addXP(30 + Math.round(note) * 2);
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${note >= 14 ? '🏆' : note >= 10 ? '💪' : '🌱'}</div>
      <h2>Contrôle type terminé</h2>
      <div class="big-num">${fr(note, 1)}/20</div>
      <p class="muted">${run.ctrlK.lv === 3 ? 'Sans aide, comme le jour J.' : `Avec l’aide de niveau ${run.ctrlK.lv}/3.`} ${prevBest != null && note > prevBest ? `Nouveau record à ce niveau (avant : ${fr(prevBest, 1)}).` : ''}</p>
      ${up ? `<p><b>⬆️ ${up}</b></p>` : note < 14 ? '<p class="small">Les exercices ratés reviennent dans « À revoir » demain. Retente le contrôle type dans quelques jours.</p>' : ''}
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <h3 style="margin:8px 4px">Ta copie corrigée</h3>
    ${res.map((r, i) => `<div class="card"><div class="row between"><span class="chip">${CTRLK_ORDER[i] ? CTRLK_ORDER[i][1] + ' • ' + CTRLK_ORDER[i][2] : 'Q' + (i + 1)}</span><b>${fr(pts[i], 1)}/4</b></div>
      <details style="margin-top:8px"><summary class="small"><b>Énoncé et correction</b></summary><p class="small">${r.item.q}</p>
      <div class="fb sol small"><ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol></div></details></div>`).join('')}
    <div class="stack"><button class="btn" id="cAgain">🔀 Un nouveau sujet</button><button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
  document.getElementById('home').onclick = screenHome;
  document.getElementById('cAgain').onclick = screenCtrlK;
}
(() => {
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(() => {
    const acts = app.querySelector('.acts');
    if (!acts || acts.querySelector('#ctrlKAct') || typeof S === 'undefined' || !S || !S.pseudo) return;
    const C = S.ctrlK || {}, last = (C.hist || [])[(C.hist || []).length - 1];
    const b = document.createElement('button');
    b.className = 'act'; b.id = 'ctrlKAct'; b.style.gridColumn = '1 / -1'; b.style.minHeight = '0';
    b.innerHTML = `<span class="ic">📝</span><b>Contrôle type : l’atome</b><span class="small muted">${last ? `Dernière note ${fr(last.note, 1)}/20 • aide ${C.lv}/3` : '5 exercices à rédiger, note sur 20'}</span>`;
    b.onclick = screenCtrlK;
    acts.insertBefore(b, acts.firstChild);
  }).observe(app, { childList: true, subtree: true });
})();

/* ---------- Réglage « Ma calculatrice » ---------- */
const CALCS = [
  { id: 'fx92p', name: 'Casio fx-92+ Spéciale Collège', key: '×10ˣ', minus: '(−)' },
  { id: 'fx92', name: 'Casio fx-92 Collège (modèle récent)', key: '×10ˣ', minus: '(−)' },
  { id: 'ticp', name: 'TI-Collège Plus (Solaire)', key: '×10ⁿ', minus: '(−)' },
  { id: 'numw', name: 'NumWorks', key: '×10ˣ', minus: '−' },
  { id: 'ti83', name: 'TI-83 Premium CE', key: '2nde puis « , » (EE)', minus: '(−)' },
  { id: 'g35', name: 'Casio Graph 35+E II', key: '×10ˣ', minus: '(−)' },
  { id: 'autre', name: 'Je ne sais pas / téléphone', key: '× 10 ^', minus: '−' },
];
const calcOf = (id) => CALCS.find((c) => c.id === id);
function calcFiche(c) {
  const k = `<b>${esc(c.key)}</b>`, m = `<b>${esc(c.minus)}</b>`;
  const enter = c.id === 'autre' ? `1,67 × 10 ^ ( ${m} 27 )` : `1,67 ${k} ${m} 27`;
  return `<ol class="fiche">
    <li><b>Entrer 1,67 × 10⁻²⁷</b> : tape ${enter}. ${c.id === 'autre' ? 'Mets bien l’exposant entre parenthèses.' : `N’écris pas « × 10 » toi-même : la touche ${k} le fait.`}</li>
    <li><b>Masse d’un atome</b> : 16 × 1,67 × 10⁻²⁷ + 8 × 9,11 × 10⁻³¹ → l’écran affiche environ <b>2,67 × 10⁻²⁶</b> (parfois écrit 2,67E-26).</li>
    <li><b>Le piège du rapport</b> : 16 × 1,67 × 10⁻²⁷ ÷ <b>(</b> 8 × 9,11 × 10⁻³¹ <b>)</b>. Sans les parenthèses autour du bas, le résultat est faux. Résultat attendu : environ 3 666.</li>
    <li>Le signe moins de l’exposant : touche ${m}${c.minus === '(−)' ? ' (le petit moins, pas celui de la soustraction)' : ''}.</li>
  </ol>`;
}
function openCalc() {
  if (document.getElementById('calcm')) return;
  const cur = calcOf(S.calc);
  const pickHtml = `<p class="small muted" style="margin:0">Choisis ta calculatrice : l’appli t’indiquera les bonnes touches.</p>
    <div class="stack">${CALCS.map((c) => `<button class="btn ghost ${S.calc === c.id ? 'on' : ''}" data-calc="${c.id}">${esc(c.name)}${S.calc === c.id ? ' ✓' : ''}</button>`).join('')}</div>`;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal sheet-bg" id="calcm" role="dialog" aria-modal="true"><div class="card sheet stack pop" style="max-height:85vh;overflow:auto">
    <h2>🧮 Ma calculatrice</h2>
    ${cur ? `<p style="margin:0"><b>${esc(cur.name)}</b></p>${calcFiche(cur)}<details><summary class="small"><b>Changer de calculatrice</b></summary>${pickHtml}</details>` : pickHtml}
    <button class="link" id="calcClose">Fermer</button></div></div>`);
  const close = () => { const m = document.getElementById('calcm'); if (m) m.remove(); };
  document.getElementById('calcClose').onclick = close;
  document.getElementById('calcm').onclick = (e) => { if (e.target.id === 'calcm') close(); };
  document.querySelectorAll('#calcm [data-calc]').forEach((b) => b.onclick = () => { S.calc = b.dataset.calc; S.calcAt = Date.now(); if (!PREVIEW) saveState(); close(); openCalc(); });
}
/* Réglages posés par le parent (rv_plan kind « reglage ») : le plus récent l'emporte */
function applyReglages() {
  const r = (PLAN || []).filter((p) => p.kind === 'reglage' && p.label === 'calc').sort((a, b) => a.created_at < b.created_at ? 1 : -1)[0];
  if (!r || !calcOf(r.error_code)) return;
  const t = new Date(r.created_at).getTime();
  if (!S.calcAt || t > S.calcAt) { S.calc = r.error_code; S.calcAt = t; }
}

/* ---------- Leçon C6 ---------- */
Object.assign(SVG, {
  atome: `
  <svg viewBox="0 0 330 200" class="svg" role="img" aria-label="Atome d’oxygène : un noyau de 8 protons et 8 neutrons, 8 électrons autour">
    <ellipse cx="120" cy="100" rx="95" ry="38" class="s-line" fill="none" stroke-dasharray="4 4"/>
    <ellipse cx="120" cy="100" rx="95" ry="38" class="s-line" fill="none" stroke-dasharray="4 4" transform="rotate(60 120 100)"/>
    <ellipse cx="120" cy="100" rx="95" ry="38" class="s-line" fill="none" stroke-dasharray="4 4" transform="rotate(-60 120 100)"/>
    <circle cx="112" cy="94" r="7" class="s-r1"/><circle cx="126" cy="94" r="7" class="s-r2"/><circle cx="119" cy="106" r="7" class="s-r1"/>
    <circle cx="105" cy="106" r="7" class="s-r2"/><circle cx="133" cy="106" r="7" class="s-r1"/><circle cx="119" cy="83" r="7" class="s-r2"/>
    <circle cx="215" cy="100" r="5" class="s-head"/><circle cx="25" cy="100" r="5" class="s-head"/><circle cx="168" cy="20" r="5" class="s-head"/>
    <circle cx="72" cy="180" r="5" class="s-head"/><circle cx="72" cy="20" r="5" class="s-head"/><circle cx="168" cy="180" r="5" class="s-head"/>
    <circle cx="190" cy="140" r="5" class="s-head"/><circle cx="50" cy="60" r="5" class="s-head"/>
    <text x="235" y="60" class="s-txt">noyau :</text><text x="235" y="76" class="s-txt">protons (+)</text><text x="235" y="92" class="s-txt">et neutrons</text>
    <text x="235" y="130" class="s-txt">● électrons (−)</text><text x="235" y="146" class="s-txt">autour</text>
    <text x="235" y="180" class="s-txt">(pas à l’échelle)</text>
  </svg>`,
  ions: `
  <svg viewBox="0 0 330 120" class="svg" role="img" aria-label="Un atome qui perd des électrons devient un cation, qui en gagne devient un anion">
    <rect x="115" y="40" width="100" height="40" rx="10" class="s-r2"/><text x="165" y="65" class="s-txt" text-anchor="middle">atome neutre</text>
    <path d="M115 60 H55" class="s-line arrow" marker-end="url(#ah3)"/><path d="M215 60 H275" class="s-line arrow" marker-end="url(#ah3)"/>
    <text x="85" y="50" class="s-txt" text-anchor="middle">perd des e⁻</text><text x="245" y="50" class="s-txt" text-anchor="middle">gagne des e⁻</text>
    <text x="30" y="65" class="s-big" text-anchor="middle">+</text><text x="30" y="95" class="s-txt" text-anchor="middle">cation</text>
    <text x="300" y="65" class="s-big" text-anchor="middle">−</text><text x="300" y="95" class="s-txt" text-anchor="middle">anion</text>
    <defs><marker id="ah3" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`,
});

COURS.push({
  id: 'C6', subj: 'chimie', chap: 'Chimie — L’atome', title: 'L’atome et les ions', icon: '⚛️',
  cahier: 'le cours du tableau (atome d’oxygène, masses et tailles), puis la suite logique : molécules et ions.',
  skills: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7'],
  sections: [
    { title: 'Tout est fait d’atomes',
      html: `<p>Ta table, l’air que tu respires, ton corps et même les étoiles sont faits d’<b>atomes</b>. Ce sont les « briques » de la matière.</p>
        <p>Il en existe environ <b>118 sortes</b>, appelées éléments chimiques. Elles sont toutes rangées dans le <b>tableau périodique</b>, chacune avec son symbole : H pour l’hydrogène, C pour le carbone, O pour l’oxygène, Fe pour le fer…</p>
        <p>Un atome est bien trop petit pour être vu. On le dessine comme une boule de couleur : c’est un <b>modèle</b>, une image simplifiée, pas une photo. Un atome n’a pas de couleur.</p>`,
      retenir: 'Toute la matière est faite d’atomes ; il en existe environ 118 sortes, rangées dans le tableau périodique.',
      quiz: [{ q: 'Une boule rouge sur un dessin d’atome, c’est :', choices: [{ t: 'Un modèle : un code pour reconnaître l’atome', ok: true }, { t: 'La vraie couleur de l’atome', msg: 'Les atomes n’ont pas de couleur : la couleur est un code du dessin.' }] }] },
    { title: 'Dans l’atome',
      html: `<p>Au centre de l’atome se trouve un <b>noyau</b>, minuscule. Autour, des <b>électrons</b> se déplacent sans arrêt.</p>
        ${SVG.atome}
        <table class="tbl"><tr><th>Particule</th><th>Où ?</th><th>Charge</th></tr>
          <tr><td><b>Proton</b></td><td>dans le noyau</td><td>positive (+)</td></tr>
          <tr><td><b>Neutron</b></td><td>dans le noyau</td><td>aucune (neutre)</td></tr>
          <tr><td><b>Électron</b></td><td>autour du noyau</td><td>négative (−)</td></tr></table>
        <p>Protons et neutrons ont un nom commun : ce sont les <b>nucléons</b> (les particules du noyau).</p>
        <p>Un atome a toujours <b>autant de protons que d’électrons</b> : les charges + et − s’annulent. On dit que l’atome est <b>électriquement neutre</b>.</p>`,
      retenir: 'Noyau = protons (+) et neutrons (neutres) = nucléons. Électrons (−) autour. Autant de protons que d’électrons : l’atome est neutre.',
      quiz: [{ q: 'Où sont les électrons ?', choices: [{ t: 'Autour du noyau', ok: true }, { t: 'Dans le noyau', msg: 'Le noyau contient protons et neutrons ; les électrons sont autour.' }] },
             { q: 'Un atome a 6 protons. Combien a-t-il d’électrons ?', choices: [{ t: '6', ok: true }, { t: '12', msg: 'Un atome est neutre : autant d’électrons que de protons, donc 6.' }, { t: '0', msg: 'Les électrons sont toujours là, autant que de protons.' }] }] },
    { title: 'La carte d’identité d’un atome',
      html: `<p>Chaque atome a une « carte d’identité » : son symbole X, avec deux nombres.</p>
        <ul><li><b>Z</b>, en bas : le nombre de <b>protons</b>. C’est aussi le nombre d’électrons, puisque l’atome est neutre.</li>
        <li><b>A</b>, en haut : le nombre de <b>nucléons</b> (protons + neutrons). C’est toujours le plus grand des deux.</li></ul>
        <div class="formula">neutrons = A − Z</div>
        <p>C’est « nucléons moins protons », comme au tableau.</p>
        <div class="ex"><b>Exemple 1 :</b> ${nuc(12, 6, 'C')} (carbone) → 6 protons, 6 électrons, 12 − 6 = <b>6 neutrons</b>.<br>
        <b>Exemple 2 :</b> ${nuc(23, 11, 'Na')} (sodium) → 11 protons, 11 électrons, 23 − 11 = <b>12 neutrons</b>.</div>`,
      retenir: 'Z (en bas) = protons = électrons. A (en haut) = nucléons. Neutrons = A − Z.',
      quiz: [{ q: `Combien de neutrons dans ${nuc(14, 7, 'N')} ?`, choices: [{ t: '7', ok: true }, { t: '14', msg: '14, ce sont les nucléons. Neutrons = 14 − 7 = 7.' }, { t: '21', msg: 'On soustrait : 14 − 7 = 7.' }] }] },
    { title: 'Un atome presque vide',
      html: `<p>Un atome mesure environ <b>10⁻¹⁰ m</b>. Son noyau mesure environ <b>10⁻¹⁵ m</b>. Pour comparer, on calcule leur <b>rapport</b>, c’est-à-dire une division :</p>
        <div class="formula">10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁵ = 100 000</div>
        <p>L’atome est donc <b>100 000 fois plus grand</b> que son noyau.</p>
        <div class="ex"><b>Pour imaginer :</b> si le noyau était une bille de 1 cm, l’atome ferait 100 000 cm, soit <b>1 km</b> de large. Entre la bille et les électrons : du vide.</div>
        <p>On dit que l’atome a une <b>structure lacunaire</b> : il est essentiellement constitué de vide.</p>`,
      retenir: 'Atome ≈ 10⁻¹⁰ m, noyau ≈ 10⁻¹⁵ m : l’atome est 10⁵ = 100 000 fois plus grand. Il est presque vide.' },
    { title: 'Les puissances de dix, mode d’emploi',
      html: `<p>Pour multiplier deux puissances de dix, on <b>additionne</b> les exposants :</p>
        <div class="formula">10³ × 10⁴ = 10³⁺⁴ = 10⁷</div>
        <p>Pour diviser, on <b>soustrait</b> l’exposant du bas :</p>
        <div class="formula">10⁸ ÷ 10² = 10⁸⁻² = 10⁶</div>
        <p><b>Piège n° 1</b> : avec des exposants négatifs, « moins moins » donne « plus ».</p>
        <div class="formula">10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁻¹⁰⁺¹⁵ = 10⁵</div>
        <p><b>Écriture scientifique</b> : un seul chiffre non nul avant la virgule, puis × 10 puissance quelque chose. Par exemple 0,00056 = 5,6 × 10⁻⁴ et la masse de l’atome d’oxygène s’écrit 2,67 × 10⁻²⁶ kg.</p>
        <p>Pour la taper sur ta calculatrice, ouvre la fiche « 🧮 Ma calculatrice » dans les réglages ⚙️.</p>`,
      retenir: 'Multiplier : on additionne les exposants. Diviser : on soustrait celui du bas. 10⁻¹⁰ ÷ 10⁻¹⁵ = 10⁵.',
      quiz: [{ q: '10⁻⁶ ÷ 10⁻⁹ = ?', choices: [{ t: '10³', ok: true }, { t: '10⁻¹⁵', msg: 'On soustrait : −6 − (−9) = −6 + 9 = 3.' }, { t: '10⁻³', msg: 'Attention au signe : −6 − (−9) = +3.' }] }] },
    { title: 'La masse d’un atome',
      html: `<p>Pour trouver la masse d’un atome, on additionne les masses de <b>toutes ses particules</b>. Ton prof donne :</p>
        <div class="formula">mₚ = mₙ = 1,67 × 10⁻²⁷ kg • mₑ = 9,11 × 10⁻³¹ kg</div>
        <div class="ex"><b>Exemple : le carbone</b> ${nuc(12, 6, 'C')}, soit 12 nucléons et 6 électrons.<br>
        m = 12 × 1,67 × 10⁻²⁷ + 6 × 9,11 × 10⁻³¹<br>m ≈ 2,004 × 10⁻²⁶ + 0,0005 × 10⁻²⁶ ≈ <b>2,00 × 10⁻²⁶ kg</b></div>
        <p>Le noyau pèse environ <b>3 700 fois plus</b> que l’ensemble des électrons. On dit que la masse de l’atome est <b>concentrée dans son noyau</b>.</p>
        <p>À la calculatrice, pour ce rapport, mets tout le bas de la division entre parenthèses : (12 × 1,67 × 10⁻²⁷) ÷ (6 × 9,11 × 10⁻³¹).</p>`,
      retenir: 'm(atome) = A × 1,67 × 10⁻²⁷ + Z × 9,11 × 10⁻³¹ kg. Le noyau pèse environ 3 700 fois plus que les électrons : la masse est dans le noyau.' },
    { title: 'Les molécules',
      html: `<p>Des atomes peuvent s’assembler : ils forment une <b>molécule</b>. Une molécule contient au moins deux atomes.</p>
        <p>Sa <b>formule chimique</b> dit quels atomes elle contient, et combien. Le petit chiffre en bas compte l’atome <b>juste avant</b> lui ; pas de chiffre veut dire 1.</p>
        <div class="ex">CO₂ : 1 carbone et 2 oxygènes (3 atomes en tout).<br>C₂H₆O (l’alcool) : 2 carbones, 6 hydrogènes, 1 oxygène.</div>
        <table class="tbl"><tr><th>Molécule</th><th>Formule</th></tr><tr><td>dioxygène</td><td>O₂</td></tr><tr><td>diazote</td><td>N₂</td></tr><tr><td>eau</td><td>H₂O</td></tr>
          <tr><td>dioxyde de carbone</td><td>CO₂</td></tr><tr><td>méthane</td><td>CH₄</td></tr><tr><td>protoxyde d’azote</td><td>N₂O</td></tr></table>`,
      retenir: 'Une molécule = au moins 2 atomes. Dans la formule, le petit chiffre compte l’atome juste avant (pas de chiffre = 1).',
      quiz: [{ q: 'Combien d’atomes en tout dans CH₄ ?', choices: [{ t: '5', ok: true }, { t: '4', msg: '4 hydrogènes, plus 1 carbone : 5 atomes.' }, { t: '2', msg: '2, ce sont les sortes d’atomes (C et H). En tout : 1 + 4 = 5.' }] }] },
    { title: 'Les ions',
      html: `<p>Un atome peut <b>perdre ou gagner des électrons</b>. Il n’est alors plus neutre : il devient un <b>ion</b>. Son noyau, lui, ne change pas.</p>
        ${SVG.ions}
        <ul><li>Il <b>perd</b> des électrons → charge <b>+</b> → c’est un <b>cation</b>. Na⁺ : 11 protons et 10 électrons.</li>
        <li>Il <b>gagne</b> des électrons → charge <b>−</b> → c’est un <b>anion</b>. O²⁻ : 8 protons et 10 électrons.</li></ul>
        <p>Astuce : a<b>N</b>ion = <b>N</b>égatif.</p>
        <p>Certains ions viennent d’un <b>groupe d’atomes</b> (ions polyatomiques) : SO₄²⁻ (sulfate), NH₄⁺ (ammonium), HO⁻ (hydroxyde).</p>`,
      retenir: 'Ion = atome qui a perdu (cation, +) ou gagné (anion, −) des électrons. Le noyau ne change pas.',
      quiz: [{ q: 'Cu²⁺ : l’atome de cuivre a…', choices: [{ t: 'perdu 2 électrons', ok: true }, { t: 'gagné 2 électrons', msg: 'Charge + : il a moins d’électrons que de protons, donc il en a perdu.' }, { t: 'perdu 2 protons', msg: 'Le noyau ne change pas : ce sont des électrons.' }] }] },
  ],
  exos: [
    { title: 'L’atome d’oxygène (le tableau)', enonce: `Donne la composition de l’atome ${nuc(16, 8, 'O')}.`, steps: ['Z = 8 : 8 protons et 8 électrons (atome neutre).', 'A = 16 nucléons, donc neutrons = 16 − 8 = 8.'], rep: 'L’atome d’oxygène contient 8 protons, 8 neutrons et 8 électrons.' },
    { title: 'Masse de l’atome d’oxygène', enonce: `Calcule la masse de l’atome ${nuc(16, 8, 'O')}. Données : mₚ = mₙ = 1,67 × 10⁻²⁷ kg ; mₑ = 9,11 × 10⁻³¹ kg.`, ans: 16 * MP + 8 * ME, sci: true, unit: 'kg',
      steps: ['📐 m = A × mₚ + Z × mₑ = 16 × 1,67 × 10⁻²⁷ + 8 × 9,11 × 10⁻³¹.', '🧮 m = 2,672 × 10⁻²⁶ + 7,29 × 10⁻³⁰ ≈ 2,67 × 10⁻²⁶ kg.'], rep: 'La masse de l’atome d’oxygène est d’environ 2,67 × 10⁻²⁶ kg.', piege: 'Oublier les 8 neutrons et ne compter que les 8 protons.' },
    { title: 'Noyau et électrons', enonce: 'Pour l’atome d’oxygène, calcule le rapport masse du noyau ÷ masse des électrons, puis conclus.', ans: 16 * MP / (8 * ME), tol: 5, unit: '',
      steps: ['📐 rapport = (16 × 1,67 × 10⁻²⁷) ÷ (8 × 9,11 × 10⁻³¹).', '🧮 rapport ≈ 3 666.'], rep: 'Le noyau est environ 3 700 fois plus lourd que les électrons : la masse de l’atome est concentrée dans son noyau.', piege: 'Oublier les parenthèses du bas à la calculatrice.' },
    { title: 'Atome et noyau', enonce: 'Un atome mesure 10⁻¹⁰ m et son noyau 10⁻¹⁵ m. Combien de fois l’atome est-il plus grand ?', ans: 1e5, sci: true, unit: 'fois',
      steps: ['📐 rapport = 10⁻¹⁰ ÷ 10⁻¹⁵.', '🧮 10⁻¹⁰⁺¹⁵ = 10⁵ = 100 000.'], rep: 'L’atome est 100 000 fois plus grand que son noyau : il est presque vide.', piege: 'Écrire 10⁻²⁵ en additionnant les exposants.' },
    { title: 'L’atome d’aluminium', enonce: `Donne la composition de l’atome ${nuc(27, 13, 'Al')}, puis calcule sa masse.`, ans: 27 * MP + 13 * ME, sci: true, unit: 'kg',
      steps: ['13 protons, 13 électrons, 27 − 13 = 14 neutrons.', '🧮 m = 27 × 1,67 × 10⁻²⁷ + 13 × 9,11 × 10⁻³¹ ≈ 4,51 × 10⁻²⁶ kg.'], rep: 'L’atome d’aluminium a 13 protons, 14 neutrons, 13 électrons ; sa masse vaut environ 4,51 × 10⁻²⁶ kg.' },
    { title: 'Lire des formules', enonce: 'Donne la composition de C₃H₈ (propane) et de NH₃ (ammoniac).',
      steps: ['C₃H₈ : 3 carbones et 8 hydrogènes, soit 11 atomes.', 'NH₃ : 1 azote et 3 hydrogènes, soit 4 atomes.'], rep: 'Le propane contient 3 C et 8 H ; l’ammoniac 1 N et 3 H.' },
    { title: 'L’ion calcium', enonce: `L’atome de calcium ${nuc(40, 20, 'Ca')} devient l’ion Ca²⁺. Cation ou anion ? Donne la composition de l’ion.`, ans: 18, unit: 'électrons',
      steps: ['Charge + : c’est un cation, l’atome a perdu 2 électrons.', 'Noyau inchangé : 20 protons et 40 − 20 = 20 neutrons.', 'Électrons : 20 − 2 = 18.'], rep: 'Ca²⁺ est un cation : 20 protons, 20 neutrons et 18 électrons.', piege: 'Écrire 22 électrons : perdre des électrons en enlève.' },
    { title: 'L’ion sulfure', enonce: `L’atome de soufre ${nuc(32, 16, 'S')} gagne 2 électrons. Écris la formule de l’ion et donne son nombre d’électrons.`, ans: 18, unit: 'électrons',
      steps: ['Gain de 2 électrons : charge 2−, l’ion s’écrit S²⁻ (un anion).', 'Électrons : 16 + 2 = 18.'], rep: 'L’ion sulfure S²⁻ possède 16 protons et 18 électrons.' },
  ],
});
(() => {
  const c = COURS.find((x) => x.id === 'C6');
  if (c) c.videos = { 0: [['Élément chimique et atome', 'RdjjCXnsTLI']], 1: [['De quoi est composé un atome ?', 'gZFsimsG-44']], 2: [['Déterminer la composition d’un atome', 'dEEMoFKD3Ww']],
    6: [['Qu’est-ce qu’une molécule ?', 'Y8JZAbXu9fQ'], ['Formule chimique d’une molécule', '0zrIQZkD84E']], 7: [['Qu’est-ce qu’un ion ?', 'edke0BOjeMU'], ['Ions monoatomiques et polyatomiques', 'HAZKFfyCgsI']] };
})();

/* ---------- Accroches qui ont besoin d'app.js ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof finishRun === 'function') {
    const base = finishRun;
    finishRun = function () { return RUN && RUN.ctrlK ? finishCtrlK() : base(); };
  }
  if (typeof COPY_TYPES !== 'undefined') COPY_TYPES.push(
    ['Chimie : neutrons comptés comme A (oubli de A − Z)', 'K2', 'neutA'],
    ['Chimie : A et Z inversés', 'K2', 'zA'],
    ['Chimie : erreur de signe dans les puissances de dix', 'K3', 'expSigne'],
    ['Chimie : masse d’un atome fausse (calcul ou calculatrice)', 'K4', 'saisie'],
    ['Chimie : rapport mal calculé ou mal interprété', 'K5', 'inverse'],
    ['Chimie : formule de molécule mal lue', 'K6', 'indice'],
    ['Chimie : ions, perte et gain d’électrons confondus', 'K7', 'signeIon'],
  );
  if (typeof ERR_ADVICE !== 'undefined') Object.assign(ERR_ADVICE, {
    neutA: 'A compte tous les nucléons : pour les neutrons, on retire Z (A − Z).',
    zA: 'le plus grand nombre (A, en haut) est celui des nucléons ; Z, en bas, celui des protons.',
    expSigne: 'pour diviser des puissances de dix, on soustrait : −10 − (−15) = +5.',
    saisie: 'faites ensemble la fiche « Ma calculatrice » (menu ⚙️) : touche ×10ˣ et parenthèses.',
    sciNon: 'un seul chiffre non nul avant la virgule : 2,67 × 10⁻²⁶.',
    indice: 'le petit chiffre compte l’atome juste avant lui : CO₂ = 1 C et 2 O.',
    signeIon: 'perdre des électrons donne une charge + (cation), en gagner une charge − (anion).',
    noyauIon: 'quand un ion se forme, le noyau ne bouge pas : seuls les électrons changent.',
    unite: 'les masses données sont en kg : le résultat aussi.',
  });
  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Contrôle type : l’atome', (s) => {
    const C = s.ctrlK; if (!C || !C.hist || !C.hist.length) return 'pas encore tenté';
    const l = C.hist[C.hist.length - 1];
    return `dernier ${fr(l.note, 1)}/20 (aide ${l.lv}/3), ${C.hist.length} essai${C.hist.length > 1 ? 's' : ''}${C.best && C.best[3] != null ? ` • sans aide : ${fr(C.best[3], 1)}/20` : ''}`;
  }, '5 exercices de chimie rédigés en entier (atome, masses, rapports, ions). L’aide diminue à partir de 14/20.'],
  ['Calculatrice', (s) => { const c = calcOf(s.calc); return c ? c.name : 'pas encore choisie'; }, 'Modèle choisi par l’élève ou par toi (Réglages) : l’appli adapte les consignes de saisie des puissances de dix.']);
});
