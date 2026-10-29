/* =========================================================
   Contenu pédagogique — Module 1 : Vitesse & sécurité routière
   Aligné sur le cahier de l'élève (Chap. 1 Notion de vitesse,
   fiche Étude du mouvement, Ch. II Distance d'arrêt).
   ========================================================= */

const MODULE = { id: 'M1', title: 'Vitesse & sécurité routière', chapter: 'Mouvement et interactions' };

const SKILLS = [
  { id: 'V1', ref: 'MVT-01/02', name: 'Décrire un mouvement', short: 'Mouvement', icon: '🧭' },
  { id: 'V2', ref: 'OUT-03', name: 'Convertir les durées', short: 'Durées', icon: '⏱️' },
  { id: 'V3', ref: 'OUT-03', name: 'km/h ↔ m/s', short: 'km/h ↔ m/s', icon: '🔁' },
  { id: 'V4', ref: 'MVT-03', name: 'Calculer une vitesse', short: 'Vitesse', icon: '🏎️' },
  { id: 'V5', ref: 'MVT-03', name: 'Distance et durée', short: 'd et t', icon: '📏' },
  { id: 'V6', ref: 'SIG-05', name: 'Son, lumière et écho', short: 'Son & écho', icon: '🔊' },
  { id: 'V7', ref: 'NRJ-05', name: "Distance d'arrêt", short: 'Arrêt', icon: '🛑' },
  { id: 'V8', ref: 'OUT-07', name: 'Lire la question, rédiger', short: 'Méthode', icon: '🎯' },
];

const ERR_LABELS = {
  base100: 'Compte 100 min dans une heure (ou 100 s dans une minute)',
  sec100: 'Écrit les secondes comme des centièmes (15 s → 0,15)',
  minutes: "Calcule avec des minutes au lieu d'heures",
  inverse: 'Divise à l’envers (temps ÷ distance)',
  formule: 'Se trompe de formule',
  conv36: 'Se trompe de sens avec 3,6',
  noconv: 'Oublie de convertir les unités',
  allerretour: "Oublie l'aller-retour de l'écho",
  oubli_df: 'Oublie la distance de freinage',
  oubli_dr: 'Oublie la distance de réaction',
  carre: 'Oublie le carré de la vitesse',
  tr_faux: "Ne garde pas la donnée de l'énoncé",
  pct_total: 'Confond pourcentage final et augmentation',
  question: 'Ne répond pas à la question posée',
  notion: 'Notion de cours pas encore sûre',
  p10: 'Erreur de virgule ou de puissance de 10',
  conv60: 'Se trompe avec ×60 / ÷60',
  arrondi: 'Arrondit trop tôt',
  nsp: '« Je ne sais pas »',
  autre: 'Autre erreur',
};

/* ---------- Fiches de cours (une par compétence) ---------- */
const FICHES = {
  V1: {
    title: 'Décrire un mouvement',
    points: [
      '<b>Mobile</b> : l’objet ou le point qu’on étudie pendant son déplacement.',
      '<b>Référentiel</b> : l’objet à partir duquel on regarde. Sol = <i>terrestre</i>, centre de la Terre = <i>géocentrique</i>, centre du Soleil = <i>héliocentrique</i>.',
      'Un objet est en mouvement <b>par rapport à</b> quelque chose : assise dans un train, tu es immobile par rapport au wagon, mais en mouvement par rapport au quai.',
      '<b>Trajectoire</b> : droite → rectiligne ; cercle → circulaire ; courbe → curviligne.',
      'Distances <b>égales</b> à intervalles égaux → uniforme. Distances qui <b>grandissent</b> → accéléré. Qui <b>rapetissent</b> → ralenti.',
    ],
    formula: 'Mouvement = trajectoire + évolution de la vitesse',
    piege: 'La valve d’une roue de vélo : circulaire vue depuis le vélo, mais curviligne vue depuis le trottoir.',
  },
  V2: {
    title: 'Convertir les durées',
    points: [
      '1 h = <b>60</b> min et 1 min = <b>60</b> s. Jamais 100 !',
      'Pour passer des minutes aux heures : on <b>divise par 60</b>. 30 min = 30 ÷ 60 = 0,5 h.',
      'Pour les secondes : on divise par 3 600. 12 s = 12 ÷ 3 600 h.',
      'Méthode unique : <b>h + min ÷ 60 + s ÷ 3 600</b>.',
    ],
    formula: '3 h 15 min = 3 + 15 ÷ 60 = 3,25 h',
    piege: '15 s ne s’écrit pas 0,15 min : 15 ÷ 60 = 0,25 min.',
  },
  V3: {
    title: 'km/h ↔ m/s',
    points: [
      '1 km/h = 1 000 m en 3 600 s. C’est pour ça qu’on utilise <b>3,6</b>.',
      'km/h → m/s : on <b>divise</b> par 3,6 (le nombre devient plus petit).',
      'm/s → km/h : on <b>multiplie</b> par 3,6 (le nombre devient plus grand).',
    ],
    formula: '90 km/h ÷ 3,6 = 25 m/s',
    piege: 'Vérifie : une valeur en m/s est toujours plus petite que la même vitesse en km/h.',
  },
  V4: {
    title: 'Calculer une vitesse',
    points: [
      'La vitesse moyenne = distance parcourue ÷ durée du parcours.',
      'La <b>distance va en haut</b>, la durée en bas.',
      'L’unité dépend des unités utilisées : km et h → km/h ; m et s → m/s.',
      'Si la durée est en h et min, convertis-la d’abord en heures décimales.',
    ],
    formula: 'v = d ÷ t',
    piege: '300 km en 3 h 15 min : 300 ÷ 3,25 et pas 300 ÷ 3,15.',
  },
  V5: {
    title: 'Distance et durée',
    points: [
      'Distance parcourue : <b>d = v × t</b>.',
      'Durée du parcours : <b>t = d ÷ v</b>.',
      'Les unités doivent aller ensemble : km/h avec h et km ; m/s avec s et m.',
      'Si on te demande des minutes : calcule en heures puis multiplie par 60.',
    ],
    formula: 'd = v × t   •   t = d ÷ v',
    piege: '250 m à 44,5 km/h : convertis d’abord 44,5 km/h en m/s (12,36 m/s).',
  },
  V6: {
    title: 'Son, lumière et écho',
    points: [
      'Le son a besoin de matière pour avancer : il <b>ne se propage pas dans le vide</b>.',
      'Son dans l’air : environ <b>340 m/s</b> (Mach 1).',
      'Lumière : <b>c = 300 000 km/s = 3 × 10⁸ m/s</b>.',
      'Écho : le son fait <b>l’aller ET le retour</b>. Distance de l’obstacle = 340 × t ÷ 2.',
    ],
    formula: 'd = v × t  (écho : on divise par 2)',
    piege: 'Tonnerre entendu 3 s après l’éclair : 340 × 3 = 1 020 m (pas d’aller-retour ici).',
  },
  V7: {
    title: "Distance d'arrêt",
    points: [
      '<b>Distance de réaction dr</b> : parcourue entre le moment où on voit l’obstacle et le moment où on freine, à vitesse constante. dr = v × tr.',
      '<b>Distance de freinage df</b> : parcourue pendant le freinage.',
      '<b>Distance d’arrêt</b> : da = dr + df.',
      'Réaction : allongée par l’alcool, la fatigue, le téléphone, la vitesse. Freinage : allongé par la vitesse, la route mouillée, les pneus, les freins, la charge.',
      'Si df = k × v², la vitesse doit être en <b>m/s</b> et on n’oublie pas le carré.',
    ],
    formula: 'da = dr + df  •  dr = v × tr',
    piege: 'Utilise toujours le temps de réaction de l’énoncé (1,2 s ≠ 1 s).',
  },
  V8: {
    title: 'Lire la question, rédiger',
    points: [
      '1. Relis la question : qu’est-ce qu’on demande <b>exactement</b> ?',
      '2. Données → 3. formule → 4. conversions → 5. calcul.',
      '6. Résultat avec <b>unité</b>, puis une <b>phrase réponse</b>.',
      '« Gain de temps » = ancienne durée − nouvelle durée.',
      '« Augmentation en % » = (nouvelle − ancienne) ÷ ancienne × 100.',
    ],
    formula: 'Données → formule → conversion → calcul → unité → phrase',
    piege: 'Si 50 m deviennent 87,5 m, c’est 175 % de l’ancienne distance, donc une augmentation de 75 %.',
  },
};

/* ---------- Outils ---------- */
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const shuffle = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fr = (n, d = 2) => Number(Number(n).toFixed(d)).toLocaleString('fr-FR', { maximumFractionDigits: d });
const uid = () => Math.random().toString(36).slice(2, 8);

function num(o) { return Object.assign({ type: 'num', id: o.skill + '-' + uid() }, o); }
function qcm(o) { return Object.assign({ type: 'qcm', id: o.skill + '-' + uid() }, o, { choices: shuffle(o.choices) }); }

/* ---------- V1 : banque de QCM ---------- */
const V1_BANK = [
  { level: 1, q: 'Léa est assise dans un TGV qui roule. <b>Par rapport au wagon</b>, Léa est :', choices: [
    { t: 'Immobile', ok: true },
    { t: 'En mouvement', msg: 'La distance entre Léa et le wagon ne change pas : par rapport au wagon, elle ne bouge pas.', code: 'notion' } ] },
  { level: 1, q: 'Léa est assise dans un TGV qui roule. <b>Par rapport au quai de la gare</b>, Léa est :', choices: [
    { t: 'En mouvement', ok: true },
    { t: 'Immobile', msg: 'La distance entre Léa et le quai change à chaque seconde : elle est en mouvement par rapport au quai.', code: 'notion' } ] },
  { level: 1, q: 'Une balle tombe tout droit. Sa trajectoire est :', choices: [
    { t: 'Rectiligne', ok: true },
    { t: 'Circulaire', msg: 'Circulaire = un cercle. Ici la balle suit une droite.', code: 'notion' },
    { t: 'Curviligne', msg: 'Curviligne = une courbe. Ici la balle suit une droite.', code: 'notion' } ] },
  { level: 1, q: 'Le bout de la grande aiguille d’une horloge a une trajectoire :', choices: [
    { t: 'Circulaire', ok: true },
    { t: 'Rectiligne', msg: 'Le bout de l’aiguille tourne en rond : il décrit un cercle.', code: 'notion' },
    { t: 'Curviligne', msg: 'Presque ! Mais quand la courbe est un cercle, on dit circulaire.', code: 'notion' } ] },
  { level: 1, q: 'En physique, un « mobile », c’est :', choices: [
    { t: 'L’objet ou le point qu’on étudie pendant son déplacement', ok: true },
    { t: 'Un objet qui ne bouge jamais', msg: 'Au contraire : le mobile est ce qui se déplace.', code: 'notion' },
    { t: 'Le référentiel', msg: 'Le référentiel, c’est ce à partir de quoi on regarde le mobile.', code: 'notion' } ] },
  { level: 2, q: 'La valve d’une roue de vélo qui avance, vue par un piéton <b>sur le trottoir</b>, a une trajectoire :', choices: [
    { t: 'Curviligne', ok: true },
    { t: 'Circulaire', msg: 'Circulaire, c’est vu depuis le vélo. Vu du trottoir, la roue avance en même temps qu’elle tourne : la valve dessine des arches.', code: 'notion' },
    { t: 'Rectiligne', msg: 'La valve monte et descend en tournant, ce n’est pas une droite.', code: 'notion' } ] },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances entre deux positions : <b>2 cm, 2 cm, 2 cm, 2 cm</b>. Le mouvement est :', choices: [
    { t: 'Uniforme', ok: true },
    { t: 'Accéléré', msg: 'Accéléré = les distances grandissent. Ici elles sont toutes égales.', code: 'notion' },
    { t: 'Ralenti', msg: 'Ralenti = les distances rapetissent. Ici elles sont toutes égales.', code: 'notion' } ] },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances : <b>1 cm, 2 cm, 3 cm, 4 cm</b>. Le mouvement est :', choices: [
    { t: 'Accéléré', ok: true },
    { t: 'Uniforme', msg: 'Uniforme = distances égales. Ici elles augmentent.', code: 'notion' },
    { t: 'Ralenti', msg: 'Les distances augmentent : le mobile va de plus en plus vite.', code: 'notion' } ] },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances : <b>5 cm, 4 cm, 2 cm, 1 cm</b>. Le mouvement est :', choices: [
    { t: 'Ralenti', ok: true },
    { t: 'Accéléré', msg: 'Les distances diminuent : le mobile ralentit.', code: 'notion' },
    { t: 'Uniforme', msg: 'Uniforme = distances égales. Ici elles diminuent.', code: 'notion' } ] },
  { level: 2, q: 'Le référentiel « centre de la Terre » s’appelle :', choices: [
    { t: 'Géocentrique', ok: true },
    { t: 'Héliocentrique', msg: 'Hélio = Soleil. Géo = Terre.', code: 'notion' },
    { t: 'Terrestre', msg: 'Terrestre = le sol. Le centre de la Terre, c’est géocentrique.', code: 'notion' } ] },
  { level: 3, q: 'Le compteur d’une voiture indique 50 km/h. C’est :', choices: [
    { t: 'La vitesse instantanée', ok: true },
    { t: 'La vitesse moyenne du trajet', msg: 'Le compteur donne la vitesse à l’instant précis où tu le regardes. La vitesse moyenne se calcule sur tout le trajet avec d ÷ t.', code: 'notion' } ] },
  { level: 3, q: 'Pour étudier un satellite qui tourne autour de la Terre, on choisit le référentiel :', choices: [
    { t: 'Géocentrique', ok: true },
    { t: 'Terrestre', msg: 'Le sol tourne avec la Terre : pour un satellite, on se place au centre de la Terre (géocentrique).', code: 'notion' },
    { t: 'Héliocentrique', msg: 'Héliocentrique sert pour les planètes autour du Soleil.', code: 'notion' } ] },
];

function genV1(level) {
  const pool = V1_BANK.filter((b) => b.level === level);
  const b = pick(pool.length ? pool : V1_BANK);
  return qcm({ skill: 'V1', level: b.level, q: b.q, choices: b.choices,
    hints: [FICHES.V1.points[level === 1 ? 2 : 4]], sol: ['Relis la fiche « Décrire un mouvement ».'] });
}

/* ---------- V2 : durées ---------- */
function genV2(level) {
  if (level === 1) {
    const kind = pick(['min', 'min', 'sec']);
    if (kind === 'sec') {
      const s = pick([15, 30, 45, 12, 6, 36]);
      return num({ skill: 'V2', level, q: `Convertis <b>${s} s</b> en minutes.`, unit: 'min', ans: s / 60,
        errs: [{ v: s / 100, code: 'sec100', msg: `Tu as fait comme s’il y avait 100 secondes dans une minute. Il y en a 60 : ${s} ÷ 60.` },
               { v: s * 60, code: 'conv60', msg: 'Tu as multiplié par 60. Des secondes aux minutes, le nombre devient plus petit : on divise.' }],
        hints: ['1 min = 60 s.', `On divise par 60 : ${s} ÷ 60.`], sol: [`${s} ÷ 60 = ${fr(s / 60)} min`] });
    }
    const m = pick([15, 30, 45, 6, 12, 20, 40, 36, 48, 54]);
    return num({ skill: 'V2', level, q: `Convertis <b>${m} min</b> en heures (nombre décimal).`, unit: 'h', ans: m / 60, tol: 0.006,
      errs: [{ v: m / 100, code: 'base100', msg: `Tu as écrit ${fr(m / 100)} comme si une heure faisait 100 minutes. Elle en fait 60 : ${m} ÷ 60.` },
             { v: m * 60, code: 'conv60', msg: 'Tu as multiplié. Des minutes aux heures, le nombre devient plus petit : on divise par 60.' }],
      hints: ['1 h = 60 min.', `On divise par 60 : ${m} ÷ 60.`], sol: [`${m} ÷ 60 = ${fr(m / 60)} h`],
      round: m % 3 ? 'Arrondis au centième.' : '' });
  }
  if (level === 2) {
    if (Math.random() < 0.3) {
      const h = pick([0.25, 0.75, 0.2, 0.4, 0.6, 1.5]);
      return num({ skill: 'V2', level, q: `Un trajet dure <b>${fr(h)} h</b>. Combien de minutes cela fait-il ?`, unit: 'min', ans: h * 60,
        errs: [{ v: h * 100, code: 'base100', msg: `${fr(h)} h ce n’est pas ${fr(h * 100)} min : une heure fait 60 min, donc ${fr(h)} × 60.` },
               { v: h / 60, code: 'conv60', msg: 'Des heures aux minutes, le nombre devient plus grand : on multiplie par 60.' }],
        hints: ['1 h = 60 min.', `On multiplie : ${fr(h)} × 60.`], sol: [`${fr(h)} × 60 = ${fr(h * 60)} min`] });
    }
    const H = rnd(1, 4), M = pick([15, 30, 45, 12, 18, 24, 36, 48, 6, 54]);
    const ans = H + M / 60;
    return num({ skill: 'V2', level, q: `Convertis <b>${H} h ${M} min</b> en heures (nombre décimal).`, unit: 'h', ans, tol: 0.006,
      errs: [{ v: H + M / 100, code: 'base100', msg: `${H} h ${M} min n’est pas ${fr(H + M / 100)} h : les minutes ne sont pas des centièmes d’heure. Calcule ${M} ÷ 60.` },
             { v: H * 60 + M, code: 'minutes', msg: `Tu as trouvé la durée en minutes (${H * 60 + M} min). On voulait des heures : divise par 60.` }],
      hints: ['Garde les heures entières, puis convertis seulement les minutes.', `${H} + ${M} ÷ 60`], sol: [`${M} min = ${M} ÷ 60 = ${fr(M / 60, 3)} h`, `${H} + ${fr(M / 60, 3)} = ${fr(ans, 3)} h`],
      round: 'Arrondis au centième si besoin.' });
  }
  if (Math.random() < 0.5) {
    const M = rnd(2, 59), S = pick([15, 30, 45, 12, 36, 24, 48]);
    return num({ skill: 'V2', level, q: `Un coureur met <b>${M} min ${S} s</b>. Convertis cette durée en minutes (nombre décimal).`, unit: 'min', ans: M + S / 60, tol: 0.006,
      errs: [{ v: M + S / 100, code: 'sec100', msg: `${S} s ne s’écrivent pas 0,${S} min : une minute fait 60 s, donc ${S} ÷ 60 = ${fr(S / 60)} min.` },
             { v: M * 60 + S, code: 'conv60', msg: 'Tu as trouvé la durée en secondes. On voulait des minutes.' }],
      hints: ['Garde les minutes entières et convertis seulement les secondes.', `${M} + ${S} ÷ 60`],
      sol: [`${S} s = ${S} ÷ 60 = ${fr(S / 60)} min`, `${M} + ${fr(S / 60)} = ${fr(M + S / 60)} min`] });
  }
  const H = rnd(1, 11), M = rnd(5, 55), S = pick([15, 30, 45, 12, 36, 20]);
  const ans = H + M / 60 + S / 3600;
  return num({ skill: 'V2', level, q: `Convertis <b>${H} h ${M} min ${S} s</b> en heures. Arrondis au centième.`, unit: 'h', ans, tol: 0.006,
    errs: [{ v: H + (M + S / 100) / 60, code: 'sec100', msg: `Les secondes ne sont pas des centièmes de minute : ${S} s = ${S} ÷ 60 = ${fr(S / 60)} min.` },
           { v: H + M / 100 + S / 10000, code: 'base100', msg: 'Les minutes et les secondes ne sont pas des centièmes : on divise par 60 et par 3 600.' },
           { v: H * 60 + M + S / 60, code: 'minutes', msg: 'Tu as trouvé la durée en minutes. On voulait des heures : divise par 60.' }],
    hints: ['Méthode : h + min ÷ 60 + s ÷ 3 600.', `${H} + ${M} ÷ 60 + ${S} ÷ 3 600`],
    sol: [`${M} ÷ 60 = ${fr(M / 60, 4)} h`, `${S} ÷ 3 600 = ${fr(S / 3600, 4)} h`, `Total : ${fr(ans, 4)} ≈ ${fr(ans, 2)} h`] });
}

/* ---------- V3 : km/h <-> m/s ---------- */
function genV3(level) {
  if (level === 1) {
    const v = pick([18, 36, 54, 72, 90, 108, 126]);
    return num({ skill: 'V3', level, q: `Convertis <b>${v} km/h</b> en m/s.`, unit: 'm/s', ans: v / 3.6,
      errs: [{ v: v * 3.6, code: 'conv36', msg: 'Tu as multiplié par 3,6. Des km/h aux m/s, le nombre devient plus petit : on divise.' },
             { v: v * 1000 / 60, code: 'conv60', msg: 'Une heure fait 3 600 s, pas 60. Le raccourci : ÷ 3,6.' }],
      hints: ['km/h → m/s : on divise par 3,6.', `${v} ÷ 3,6`], sol: [`${v} ÷ 3,6 = ${fr(v / 3.6)} m/s`] });
  }
  if (level === 2) {
    const v = pick([5, 10, 15, 20, 25, 30, 12.5]);
    return num({ skill: 'V3', level, q: `Convertis <b>${fr(v)} m/s</b> en km/h.`, unit: 'km/h', ans: v * 3.6,
      errs: [{ v: v / 3.6, code: 'conv36', msg: 'Tu as divisé. Des m/s aux km/h, le nombre devient plus grand : on multiplie par 3,6.' }],
      hints: ['m/s → km/h : on multiplie par 3,6.', `${fr(v)} × 3,6`], sol: [`${fr(v)} × 3,6 = ${fr(v * 3.6)} km/h`] });
  }
  const v = pick([44.5, 130, 50, 110, 80, 3.6 * 9.5]);
  return num({ skill: 'V3', level, q: `${v < 50 ? 'Un sprinteur court' : 'Une voiture roule'} à <b>${fr(v)} km/h</b>. Convertis en m/s. Arrondis au centième.`, unit: 'm/s', ans: v / 3.6, tol: 0.011,
    errs: [{ v: v * 3.6, code: 'conv36', msg: 'Tu as multiplié par 3,6. Des km/h aux m/s, on divise.' }],
    hints: ['km/h → m/s : ÷ 3,6.', `${fr(v)} ÷ 3,6 puis arrondis.`], sol: [`${fr(v)} ÷ 3,6 ≈ ${fr(v / 3.6)} m/s`] });
}

/* ---------- V4 : vitesse ---------- */
function genV4(level) {
  if (level === 1) {
    const t = rnd(2, 5), v = pick([15, 20, 25, 60, 80, 90]), d = v * t;
    const who = pick([['Un cycliste', 'km'], ['Une voiture', 'km'], ['Un bus', 'km']]);
    return num({ skill: 'V4', level, q: `${who[0]} parcourt <b>${d} km en ${t} h</b>. Calcule sa vitesse moyenne en km/h.`, unit: 'km/h', ans: v,
      errs: [{ v: t / d, code: 'inverse', msg: `Tu as divisé ${t} par ${d}. La vitesse, c’est la distance divisée par le temps : la distance en haut.` },
             { v: d * t, code: 'formule', msg: 'Tu as multiplié. Pour la vitesse, on divise : v = d ÷ t.' }],
      hints: ['v = d ÷ t', `${d} ÷ ${t}`], sol: ['v = d ÷ t', `v = ${d} ÷ ${t} = ${v} km/h`, `La vitesse moyenne est de ${v} km/h.`] });
  }
  if (level === 2) {
    const H = rnd(1, 3), M = pick([15, 30, 45, 12, 24, 36, 48]), t = H + M / 60;
    const d = pick([120, 150, 180, 200, 240, 300]);
    const ans = d / t;
    const who = pick(['Une voiture', 'Une moto', 'Un camion']);
    return num({ skill: 'V4', level, q: `${who} parcourt <b>${d} km en ${H} h ${M} min</b>. Calcule sa vitesse moyenne en km/h (arrondis à l’unité).`, unit: 'km/h', ans, tol: 0.6,
      errs: [{ v: d / (H + M / 100), code: 'base100', tol: 0.6, msg: `${H} h ${M} min n’est pas ${fr(H + M / 100)} h. Convertis d’abord : ${H} + ${M} ÷ 60 = ${fr(t, 2)} h.` },
             { v: d / (H * 60 + M), code: 'minutes', tol: 0.05, msg: `Tu as divisé par des minutes : tu obtiens des km par minute. Pour des km/h, la durée doit être en heures (${fr(t, 2)} h).` },
             { v: t / d, code: 'inverse', tol: 0.01, msg: 'Tu as divisé la durée par la distance. C’est l’inverse : v = d ÷ t.' },
             { v: d / H, code: 'noconv', tol: 0.6, msg: `Tu as oublié les ${M} minutes. La durée est ${H} h ${M} min = ${fr(t, 2)} h.` }],
      hints: [`Convertis d’abord ${H} h ${M} min en heures : ${H} + ${M} ÷ 60.`, `Puis v = ${d} ÷ ${fr(t, 2)}.`],
      sol: [`t = ${H} + ${M} ÷ 60 = ${fr(t, 3)} h`, `v = d ÷ t = ${d} ÷ ${fr(t, 3)} ≈ ${fr(ans, 0)} km/h`] });
  }
  const variant = pick(['ms', 'kmh']);
  if (variant === 'ms') {
    const d = pick([100, 200, 400]), t = pick([10, 12.5, 20, 25, 40, 50, 80]);
    const vms = d / t, ans = vms * 3.6;
    return num({ skill: 'V4', level, q: `Un coureur parcourt <b>${d} m en ${fr(t)} s</b>. Calcule sa vitesse <b>en km/h</b>.`, unit: 'km/h', ans,
      errs: [{ v: vms, code: 'noconv', msg: `${fr(vms)}, c’est la vitesse en m/s. On demandait des km/h : multiplie par 3,6.` },
             { v: vms / 3.6, code: 'conv36', msg: 'Des m/s aux km/h, on multiplie par 3,6 (le nombre grandit).' },
             { v: t / d, code: 'inverse', msg: 'Tu as divisé à l’envers : v = d ÷ t.' }],
      hints: ['Calcule d’abord v = d ÷ t en m/s.', 'Puis convertis en km/h : × 3,6.'],
      sol: [`v = ${d} ÷ ${fr(t)} = ${fr(vms)} m/s`, `${fr(vms)} × 3,6 = ${fr(ans)} km/h`] });
  }
  const d = pick([300, 180, 360]), t = pick([4, 2.5, 5]);
  const vk = d / t, ans = vk / 3.6;
  return num({ skill: 'V4', level, q: `Un camion parcourt <b>${d} km en ${fr(t)} h</b>. Donne sa vitesse <b>en m/s</b> (arrondis au centième).`, unit: 'm/s', ans, tol: 0.011,
    errs: [{ v: vk, code: 'noconv', msg: `${fr(vk)}, c’est en km/h. On demandait des m/s : divise par 3,6.` },
           { v: vk * 3.6, code: 'conv36', msg: 'Des km/h aux m/s, on divise par 3,6.' }],
    hints: ['Calcule v = d ÷ t en km/h.', 'Puis divise par 3,6.'],
    sol: [`v = ${d} ÷ ${fr(t)} = ${fr(vk)} km/h`, `${fr(vk)} ÷ 3,6 ≈ ${fr(ans)} m/s`] });
}

/* ---------- V5 : distance et durée ---------- */
function genV5(level) {
  if (level === 1) {
    const v = pick([50, 60, 80, 90, 110, 130]), t = rnd(2, 4);
    return num({ skill: 'V5', level, q: `Une voiture roule à <b>${v} km/h pendant ${t} h</b>. Quelle distance parcourt-elle ?`, unit: 'km', ans: v * t,
      errs: [{ v: v / t, code: 'formule', msg: 'Tu as divisé. Pour la distance, on multiplie : d = v × t.' },
             { v: t / v, code: 'formule', msg: 'Pour la distance : d = v × t.' }],
      hints: ['d = v × t', `${v} × ${t}`], sol: [`d = v × t = ${v} × ${t} = ${v * t} km`, `La voiture parcourt ${v * t} km.`] });
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const v = pick([60, 90, 120, 80]), m = pick([30, 15, 45, 20]), d = v * m / 60;
      return num({ skill: 'V5', level, q: `Combien de <b>minutes</b> faut-il pour parcourir <b>${fr(d)} km à ${v} km/h</b> ?`, unit: 'min', ans: m,
        errs: [{ v: m / 60, code: 'noconv', msg: `${fr(m / 60, 3)}, c’est en heures. On demandait des minutes : multiplie par 60.` },
               { v: v / d, code: 'inverse', msg: 'La durée, c’est t = d ÷ v (la distance en haut).' },
               { v: d * v, code: 'formule', msg: 'Pour une durée, on divise : t = d ÷ v.' }],
        hints: ['t = d ÷ v donne des heures.', 'Puis × 60 pour avoir des minutes.'], sol: [`t = ${fr(d)} ÷ ${v} = ${fr(m / 60, 3)} h`, `${fr(m / 60, 3)} × 60 = ${m} min`] });
    }
    const v = pick([60, 80, 100, 50]), H = rnd(1, 3), M = pick([30, 15, 45, 12]);
    const t = H + M / 60, ans = v * t;
    return num({ skill: 'V5', level, q: `Un car roule à <b>${v} km/h pendant ${H} h ${M} min</b>. Quelle distance parcourt-il ?`, unit: 'km', ans,
      errs: [{ v: v * (H + M / 100), code: 'base100', msg: `${H} h ${M} min n’est pas ${fr(H + M / 100)} h. Convertis : ${H} + ${M} ÷ 60 = ${fr(t)} h.` },
             { v: v * (H * 60 + M), code: 'minutes', msg: 'Tu as multiplié des km/h par des minutes. La durée doit être en heures.' }],
      hints: [`Convertis la durée : ${H} + ${M} ÷ 60.`, `Puis d = ${v} × ${fr(t)}.`], sol: [`t = ${fr(t, 3)} h`, `d = ${v} × ${fr(t, 3)} = ${fr(ans)} km`] });
  }
  if (Math.random() < 0.5) {
    const v = pick([44.5, 36, 30, 40]), d = pick([100, 200, 250, 400]);
    const vms = v / 3.6, ans = d / vms;
    return num({ skill: 'V5', level, q: `Un sprinteur court à <b>${fr(v)} km/h</b>. Combien de <b>secondes</b> lui faut-il pour parcourir <b>${d} m</b> ? Arrondis au dixième.`, unit: 's', ans, tol: 0.11,
      errs: [{ v: d / v, code: 'noconv', tol: 0.05, msg: 'Tu as mélangé des mètres et des km/h. Convertis d’abord la vitesse en m/s (÷ 3,6).' },
             { v: vms / d, code: 'inverse', tol: 0.005, msg: 'La durée, c’est t = d ÷ v (la distance en haut).' },
             { v: d / (v * 3.6), code: 'conv36', tol: 0.05, msg: 'Pour passer des km/h aux m/s, on divise par 3,6.' }],
      hints: [`Convertis la vitesse : ${fr(v)} ÷ 3,6 = ${fr(vms)} m/s.`, `Puis t = ${d} ÷ ${fr(vms)}.`],
      sol: [`v = ${fr(v)} ÷ 3,6 ≈ ${fr(vms)} m/s`, `t = d ÷ v = ${d} ÷ ${fr(vms)} ≈ ${fr(ans, 1)} s`] });
  }
  const v = pick([850, 800, 900]), H = rnd(2, 6), M = rnd(10, 50), S = pick([12, 36, 24]);
  const t = H + M / 60 + S / 3600, ans = v * t;
  return num({ skill: 'V5', level, q: `Un avion vole à <b>${v} km/h pendant ${H} h ${M} min ${S} s</b>. Quelle distance parcourt-il ? Arrondis à l’unité.`, unit: 'km', ans, tol: 1.5,
    errs: [{ v: v * Math.floor(t * 100) / 100, code: 'arrondi', tol: 0.6, msg: 'Presque ! Tu as arrondi la durée trop tôt. Garde tous les chiffres de la durée et n’arrondis qu’à la fin.' },
           { v: v * (H + M / 100 + S / 10000), code: 'base100', tol: 2, msg: 'Les minutes et secondes ne sont pas des centièmes : h + min ÷ 60 + s ÷ 3 600.' },
           { v: v * (H + (M + S / 100) / 60), code: 'sec100', tol: 1, msg: `${S} s ne font pas 0,${S} min : ${S} ÷ 60 = ${fr(S / 60)} min.` }],
    hints: ['Convertis la durée en heures : h + min ÷ 60 + s ÷ 3 600.', 'Garde le résultat complet dans la calculatrice, puis × vitesse.'],
    sol: [`t = ${H} + ${M} ÷ 60 + ${S} ÷ 3 600 ≈ ${fr(t, 4)} h`, `d = ${v} × ${fr(t, 4)} ≈ ${fr(ans, 0)} km`] });
}

/* ---------- V6 : son, lumière, écho ---------- */
function genV6(level) {
  if (level === 1) {
    const bank = [
      { q: 'Le son peut-il se propager dans le vide (dans l’espace) ?', choices: [
        { t: 'Non', ok: true }, { t: 'Oui', msg: 'Le son a besoin de matière (air, eau, solide) pour avancer. Dans le vide, il n’y a rien pour le transporter.', code: 'notion' }] },
      { q: 'La vitesse du son dans l’air est d’environ :', choices: [
        { t: '340 m/s', ok: true }, { t: '300 000 km/s', msg: '300 000 km/s, c’est la lumière.', code: 'notion' }, { t: '340 km/h', msg: 'C’est 340 mètres par seconde, beaucoup plus rapide que 340 km/h.', code: 'notion' }] },
      { q: 'La vitesse de la lumière dans le vide vaut :', choices: [
        { t: '300 000 km/s', ok: true }, { t: '340 m/s', msg: '340 m/s, c’est le son dans l’air.', code: 'notion' }, { t: '300 000 km/h', msg: 'C’est par seconde, pas par heure !', code: 'notion' }] },
      { q: 'Pendant un orage, on voit l’éclair avant d’entendre le tonnerre parce que :', choices: [
        { t: 'La lumière va beaucoup plus vite que le son', ok: true }, { t: 'Le tonnerre se produit après l’éclair', msg: 'Ils se produisent en même temps. C’est la lumière qui arrive presque instantanément, le son met plus de temps.', code: 'notion' }] },
    ];
    const b = pick(bank);
    return qcm({ skill: 'V6', level, q: b.q, choices: b.choices, hints: [FICHES.V6.points[1]], sol: ['Relis la fiche « Son, lumière et écho ».'] });
  }
  if (level === 2) {
    const t = pick([2, 3, 4, 5, 6]);
    return num({ skill: 'V6', level, q: `Tu vois un éclair et tu entends le tonnerre <b>${t} s</b> plus tard. À quelle distance est l’orage ? (son : 340 m/s)`, unit: 'm', ans: 340 * t,
      errs: [{ v: 340 / t, code: 'formule', msg: 'Pour une distance : d = v × t, on multiplie.' },
             { v: 340 * t / 2, code: 'allerretour', msg: 'Ici pas d’aller-retour : le son vient de l’orage jusqu’à toi, une seule fois.' }],
      hints: ['d = v × t', `340 × ${t}`], sol: [`d = 340 × ${t} = ${340 * t} m`, `L’orage est à ${340 * t} m.`] });
  }
  if (Math.random() < 0.7) {
    const t = pick([2, 3, 4, 1.5, 2.4, 5]);
    return num({ skill: 'V6', level, q: `Ethan crie face à une montagne et entend l’<b>écho ${fr(t)} s</b> plus tard. À quelle distance est la montagne ? (son : 340 m/s)`, unit: 'm', ans: 340 * t / 2,
      errs: [{ v: 340 * t, code: 'allerretour', msg: `${fr(340 * t)} m, c’est le trajet total du son : aller ET retour. La montagne est à la moitié.` },
             { v: 340 / t, code: 'formule', msg: 'Distance = vitesse × durée, on multiplie.' }],
      hints: ['Le son fait l’aller jusqu’à la montagne, puis le retour.', `340 × ${fr(t)} ÷ 2`], sol: [`Trajet total : 340 × ${fr(t)} = ${fr(340 * t)} m`, `Aller seul : ${fr(340 * t)} ÷ 2 = ${fr(340 * t / 2)} m`] });
  }
  return num({ skill: 'V6', level, q: 'La Lune est à <b>384 000 km</b> de la Terre. Combien de secondes met la lumière (300 000 km/s) pour nous arriver ? Arrondis au centième.', unit: 's', ans: 1.28, tol: 0.006,
    errs: [{ v: 384000 / 300000000, code: 'noconv', tol: 0.0001, msg: 'Tu as mélangé km et m. Ici tout est en km : 384 000 ÷ 300 000.' },
           { v: 300000 / 384000, code: 'inverse', tol: 0.01, msg: 'La durée, c’est t = d ÷ v (la distance en haut).' }],
    hints: ['t = d ÷ v', '384 000 ÷ 300 000'], sol: ['t = 384 000 ÷ 300 000 = 1,28 s'] });
}

/* ---------- V7 : distance d'arrêt ---------- */
function genV7(level) {
  if (level === 1) {
    const bank = [
      { q: 'Qu’est-ce qui allonge la distance de <b>réaction</b> ?', choices: [
        { t: 'L’alcool ou la fatigue', ok: true },
        { t: 'Des pneus usés', msg: 'Les pneus jouent sur le freinage, pas sur le temps que met le conducteur à réagir.', code: 'notion' },
        { t: 'Une route mouillée', msg: 'La route mouillée allonge le freinage. La réaction dépend du conducteur.', code: 'notion' }] },
      { q: 'Qu’est-ce qui allonge la distance de <b>freinage</b> ?', choices: [
        { t: 'Une route mouillée', ok: true },
        { t: 'Téléphoner en conduisant', msg: 'Le téléphone ralentit la réaction du conducteur, pas le freinage de la voiture.', code: 'notion' },
        { t: 'L’âge du conducteur', msg: 'L’âge joue sur les réflexes, donc sur la réaction.', code: 'notion' }] },
      { q: 'La distance d’arrêt se calcule avec :', choices: [
        { t: 'da = dr + df', ok: true }, { t: 'da = df − dr', msg: 'On additionne les deux distances : d’abord la réaction, ensuite le freinage.', code: 'notion' }, { t: 'da = dr × df', msg: 'On additionne : da = dr + df.', code: 'notion' }] },
      { q: 'Pendant le temps de réaction, la voiture roule :', choices: [
        { t: 'À vitesse constante', ok: true }, { t: 'En ralentissant', msg: 'Le conducteur n’a pas encore appuyé sur le frein : la vitesse ne change pas encore.', code: 'notion' }] },
      { q: 'Quel facteur allonge <b>à la fois</b> la distance de réaction et la distance de freinage ?', choices: [
        { t: 'La vitesse', ok: true }, { t: 'L’état des freins', msg: 'Les freins jouent seulement sur le freinage.', code: 'notion' }, { t: 'La fatigue', msg: 'La fatigue joue seulement sur la réaction.', code: 'notion' }] },
    ];
    const b = pick(bank);
    return qcm({ skill: 'V7', level, q: b.q, choices: b.choices, hints: [FICHES.V7.points[3]], sol: ['Relis la fiche « Distance d’arrêt ».'] });
  }
  if (level === 2) {
    const vk = pick([36, 54, 72, 90, 108]), tr = pick([1, 1.2, 1.5, 2]);
    const v = vk / 3.6, ans = v * tr;
    const errs = [{ v: vk * tr, code: 'noconv', msg: `Tu as utilisé ${vk} km/h directement. Pour des mètres, convertis en m/s : ${vk} ÷ 3,6 = ${fr(v)} m/s.` }];
    if (tr !== 1) errs.push({ v: v, code: 'tr_faux', msg: `Tu as pris 1 s. L’énoncé dit ${fr(tr)} s : garde la donnée de l’énoncé.` });
    return num({ skill: 'V7', level, q: `Une voiture roule à <b>${vk} km/h</b>. Le temps de réaction du conducteur est <b>${fr(tr)} s</b>. Calcule la distance de réaction.`, unit: 'm', ans, errs,
      hints: [`Convertis : ${vk} ÷ 3,6 = ${fr(v)} m/s.`, `dr = v × tr = ${fr(v)} × ${fr(tr)}`], sol: [`v = ${fr(v)} m/s`, `dr = ${fr(v)} × ${fr(tr)} = ${fr(ans)} m`] });
  }
  const vk = pick([36, 54, 72, 90, 108]), tr = pick([1, 1.2, 1.5]), wet = Math.random() < 0.5, k = wet ? 0.14 : 0.08;
  const v = vk / 3.6, dr = v * tr, df = k * v * v, ans = dr + df;
  const errs = [
    { v: df, code: 'oubli_dr', msg: `Tu as trouvé la distance de freinage (${fr(df)} m). Il manque la distance de réaction : da = dr + df.` },
    { v: dr, code: 'oubli_df', msg: `Tu as trouvé la distance de réaction (${fr(dr)} m). Il manque la distance de freinage : da = dr + df.` },
    { v: dr + k * v, code: 'carre', msg: 'Attention au carré : df = k × v × v.' },
    { v: vk * tr + k * vk * vk, code: 'noconv', tol: 2, msg: 'La vitesse doit être en m/s dans les deux formules.' },
  ];
  if (tr !== 1) errs.push({ v: v + df, code: 'tr_faux', msg: `Tu as pris 1 s pour la réaction. L’énoncé dit ${fr(tr)} s.` });
  return num({ skill: 'V7', level, q: `Une voiture roule à <b>${vk} km/h</b> sur route <b>${wet ? 'mouillée' : 'sèche'}</b>. Temps de réaction : <b>${fr(tr)} s</b>. La distance de freinage est df = k × v² avec v en m/s et k = ${fr(k)}. Calcule la <b>distance d’arrêt</b>.`, unit: 'm', ans, tol: Math.max(0.5, ans * 0.01), errs,
    hints: [`Étape 1 : v = ${vk} ÷ 3,6 = ${fr(v)} m/s. Étape 2 : dr = v × tr.`, `Étape 3 : df = ${fr(k)} × ${fr(v)}². Étape 4 : da = dr + df.`],
    sol: [`v = ${fr(v)} m/s`, `dr = ${fr(v)} × ${fr(tr)} = ${fr(dr)} m`, `df = ${fr(k)} × ${fr(v)}² = ${fr(df)} m`, `da = ${fr(dr)} + ${fr(df)} = ${fr(ans)} m`] });
}

/* ---------- V8 : lire la question, rédiger, chasse à l'erreur ---------- */
const V8_QCM = [
  { level: 1, q: 'Question : « Quel est le <b>gain de temps</b> ? ». Que faut-il calculer à la fin ?', choices: [
    { t: 'Ancienne durée − nouvelle durée', ok: true },
    { t: 'La nouvelle durée', msg: 'La nouvelle durée est une étape. Le gain, c’est ce qu’on économise : la différence entre les deux durées.', code: 'question' },
    { t: 'Ancienne durée + nouvelle durée', msg: 'Le gain est une différence, pas une somme.', code: 'question' }] },
  { level: 1, q: 'Quelle réponse est complète ?', choices: [
    { t: 'La vitesse moyenne du camion est de 75 km/h.', ok: true },
    { t: '75', msg: 'Il manque l’unité et la phrase réponse.', code: 'question' },
    { t: 'v = 75', msg: 'Il manque l’unité et la phrase qui répond à la question.', code: 'question' }] },
  { level: 2, q: 'Une distance passe de 50 m à 87,5 m. 87,5 ÷ 50 × 100 = 175 %. L’<b>augmentation</b> est de :', choices: [
    { t: '75 %', ok: true },
    { t: '175 %', msg: '175 %, c’est la nouvelle distance comparée à l’ancienne. L’augmentation, c’est ce qu’on a ajouté : 175 − 100 = 75 %.', code: 'pct_total' },
    { t: '37,5 %', msg: '37,5, ce sont des mètres (87,5 − 50). En pourcentage : 37,5 ÷ 50 × 100.', code: 'pct_total' }] },
  { level: 2, bat: true, q: '🕵️ Chasse à l’erreur : « 11 h 32 min 15 s = 692 min et 15 s = 692,15 min ». Où est l’erreur ?', choices: [
    { t: '15 s ne font pas 0,15 min mais 0,25 min', ok: true },
    { t: '11 h ne font pas 660 min', msg: '11 × 60 = 660, c’est juste. Regarde plutôt les secondes.', code: 'sec100' },
    { t: 'Il n’y a pas d’erreur', msg: 'Regarde les secondes : 15 s = 15 ÷ 60 min.', code: 'sec100' }] },
  { level: 2, bat: true, q: '🕵️ Chasse à l’erreur : pour la vitesse du cycliste (300 km en 692,25 min), on a écrit « v = 692,25 ÷ 300 ». Où est l’erreur ?', choices: [
    { t: 'La division est à l’envers : v = distance ÷ durée', ok: true },
    { t: 'Il fallait multiplier', msg: 'Pour une vitesse on divise bien, mais la distance va en haut.', code: 'inverse' },
    { t: 'Il n’y a pas d’erreur', msg: 'v = d ÷ t : la distance (300) doit être en haut.', code: 'inverse' }] },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : un trajet dure 20 min à 50 km/h. À 60 km/h il dure 16 min 40 s. Réponse écrite : « Gain de temps : 16 min 40 s ». Où est l’erreur ?', choices: [
    { t: '16 min 40 s est la nouvelle durée ; le gain est 20 min − 16 min 40 s = 3 min 20 s', ok: true },
    { t: 'Le calcul de 16 min 40 s est faux', msg: 'Le calcul est juste ! C’est la question qui n’est pas respectée.', code: 'question' },
    { t: 'Il n’y a pas d’erreur', msg: 'Relis la question : on demande un gain, donc une différence.', code: 'question' }] },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : énoncé « v = 25 m/s, temps de réaction 1,2 s ». Calcul écrit : « dr = 25 × 1 = 25 m ». Où est l’erreur ?', choices: [
    { t: 'Le temps de réaction de l’énoncé est 1,2 s, pas 1 s', ok: true },
    { t: 'Il fallait convertir 25 m/s en km/h', msg: 'Non, m/s × s donne bien des mètres. Regarde le temps de réaction.', code: 'tr_faux' },
    { t: 'Il n’y a pas d’erreur', msg: 'Compare avec l’énoncé : le temps de réaction est 1,2 s.', code: 'tr_faux' }] },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : « 5 h 35 min 12 s ≈ 5,58 h, donc d = 850 × 5,58 = 4 743 km ». Quel est le problème ?', choices: [
    { t: 'La durée a été arrondie trop tôt (5,5867 h) : il faut garder tous les chiffres jusqu’au bout', ok: true },
    { t: 'Il fallait faire 850 ÷ 5,58', msg: 'Pour une distance on multiplie bien. Le souci est l’arrondi de la durée.', code: 'arrondi' },
    { t: 'Il n’y a pas d’erreur', msg: '5 + 35 ÷ 60 + 12 ÷ 3 600 = 5,5867 h : en coupant à 5,58 on perd 6 km.', code: 'arrondi' }] },
];

function genV8(level) {
  if (level >= 2 && Math.random() < 0.45) {
    const combos = [[50, 60, 30, 'min'], [50, 60, 20, 's'], [90, 110, 66, 'min'], [80, 100, 30, 'min'], [100, 120, 36, 'min']];
    const [v1, v2, t1, unitOut] = pick(combos);
    const d = v1 * t1 / 60, t2 = d / v2 * 60, gain = t1 - t2;
    const ans = unitOut === 's' ? gain * 60 : gain;
    return num({ skill: 'V8', level, q: `Un trajet dure <b>${t1} min à ${v1} km/h</b>. Quel est le <b>gain de temps</b> si on roule à <b>${v2} km/h</b> ? Réponds en ${unitOut === 's' ? 'secondes' : 'minutes'}.`, unit: unitOut, ans, tol: unitOut === 's' ? 2 : 0.1,
      errs: [{ v: unitOut === 's' ? t2 * 60 : t2, code: 'question', tol: unitOut === 's' ? 2 : 0.1, msg: 'Tu as calculé la nouvelle durée. Le gain, c’est ancienne durée − nouvelle durée.' }],
      hints: [`Étape 1 : la distance d = ${v1} × ${t1} ÷ 60 = ${fr(d)} km.`, `Étape 2 : nouvelle durée = ${fr(d)} ÷ ${v2} × 60 = ${fr(t2)} min. Étape 3 : le gain = ${t1} − ${fr(t2)}.`],
      sol: [`d = ${fr(d)} km`, `Nouvelle durée : ${fr(t2)} min`, `Gain : ${t1} − ${fr(t2)} = ${fr(gain)} min${unitOut === 's' ? ` = ${fr(gain * 60, 0)} s` : ''}`] });
  }
  if (level >= 2 && Math.random() < 0.3) {
    const [a, b] = pick([[50, 87.5], [80, 117.5], [40, 50], [60, 75], [75, 112.5]]);
    const ans = (b - a) / a * 100;
    return num({ skill: 'V8', level, q: `La distance d’arrêt passe de <b>${fr(a)} m</b> à <b>${fr(b)} m</b> sur route mouillée. Quelle est l’<b>augmentation en %</b> ? Arrondis à l’unité.`, unit: '%', ans, tol: 0.6,
      errs: [{ v: b / a * 100, code: 'pct_total', tol: 0.6, msg: `${fr(b / a * 100)} %, c’est la nouvelle distance comparée à l’ancienne. L’augmentation : retire 100.` },
             { v: b - a, code: 'pct_total', msg: `${fr(b - a)}, ce sont des mètres. Transforme en % : ÷ ${fr(a)} × 100.` }],
      hints: ['Augmentation = (nouvelle − ancienne) ÷ ancienne × 100', `(${fr(b)} − ${fr(a)}) ÷ ${fr(a)} × 100`],
      sol: [`${fr(b)} − ${fr(a)} = ${fr(b - a)} m`, `${fr(b - a)} ÷ ${fr(a)} × 100 ≈ ${fr(ans, 0)} %`] });
  }
  const pool = V8_QCM.filter((b) => b.level <= level);
  const b = pick(pool);
  return qcm({ skill: 'V8', level: b.level, bat: !!b.bat, q: b.q, choices: b.choices, hints: [FICHES.V8.points[0]], sol: ['Relis la fiche « Lire la question, rédiger ».'] });
}

const GENERATORS = { V1: genV1, V2: genV2, V3: genV3, V4: genV4, V5: genV5, V6: genV6, V7: genV7, V8: genV8 };
function generate(skill, level) { return GENERATORS[skill](Math.max(1, Math.min(3, level))); }

/* ---------- Évaluation de départ (14 questions, facile → difficile) ---------- */
const DIAG_PLAN = [
  ['V1', 1], ['V2', 1], ['V3', 1], ['V4', 1], ['V6', 1], ['V7', 1], ['V1', 2],
  ['V2', 2], ['V3', 2], ['V4', 2], ['V5', 2], ['V6', 3], ['V2', 3], ['V7', 3], ['V8', 2],
];
function buildDiagnostic() { return DIAG_PLAN.map(([s, l]) => generate(s, l)); }

/* ---------- Cartes formules (débloquées au bronze) ---------- */
const CARDS = {
  V1: { title: 'Les trajectoires', body: 'Droite → rectiligne<br>Cercle → circulaire<br>Courbe → curviligne' },
  V2: { title: 'Durées', body: 'h + min ÷ 60 + s ÷ 3 600<br>1 h = 60 min = 3 600 s' },
  V3: { title: 'Le 3,6', body: 'km/h ÷ 3,6 = m/s<br>m/s × 3,6 = km/h' },
  V4: { title: 'Vitesse', body: 'v = d ÷ t<br>distance en haut !' },
  V5: { title: 'Distance & durée', body: 'd = v × t<br>t = d ÷ v' },
  V6: { title: 'Son & lumière', body: 'Son : 340 m/s<br>Lumière : 3 × 10⁸ m/s<br>Écho : ÷ 2' },
  V7: { title: 'Arrêt', body: 'da = dr + df<br>dr = v × tr (v en m/s)' },
  V8: { title: 'Méthode', body: 'Données → formule → conversion → calcul → unité → phrase' },
};
