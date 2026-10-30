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
      '<b>Temps</b> de réaction : allongé par l’alcool, la fatigue, le téléphone. <b>Distance</b> de réaction : plus grande si la vitesse augmente (on parcourt plus de mètres pendant le même temps).',
      'Distance de freinage : plus grande avec la vitesse, la route mouillée, des pneus ou des freins usés, une charge lourde.',
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

/* Correction en 5 temps : ce qu'on cherche → formule → conversion → calcul → phrase */
const ST = {
  cherche: (t) => `🎯 <b>Ce qu’on cherche :</b> ${t}`,
  formule: (t) => `📐 <b>La formule :</b> ${t}`,
  conv: (t) => `🔁 <b>Les unités :</b> ${t}`,
  calc: (t) => `🧮 <b>Le calcul :</b> ${t}`,
  phrase: (t) => `✍️ <b>La phrase réponse :</b> ${t}`,
  piege: (t) => `⚠️ <b>Le piège :</b> ${t}`,
};

/* Tirage sans répétition rapprochée des QCM */
const RECENT_Q = [];
function pickFresh(pool) {
  const fresh = pool.filter((b) => !RECENT_Q.includes(b.q));
  const b = pick(fresh.length ? fresh : pool);
  RECENT_Q.push(b.q); if (RECENT_Q.length > 25) RECENT_Q.shift();
  return b;
}
function qcmFrom(skill, b, extra) {
  return qcm(Object.assign({ skill, level: b.level, q: b.q, choices: b.choices, why: b.why,
    hints: [b.hint || b.why], sol: [`📌 ${b.why}`] }, extra || {}));
}

/* ---------- V1 : décrire un mouvement ---------- */
const V1_BANK = [
  { level: 1, q: 'Léa est assise dans un TGV qui roule. <b>Par rapport au wagon</b>, Léa est :', choices: [
    { t: 'Immobile', ok: true },
    { t: 'En mouvement', msg: 'La distance entre Léa et le wagon ne change pas : par rapport au wagon, elle ne bouge pas.', code: 'notion' }],
    why: 'On est en mouvement par rapport à un objet si la distance avec lui change. Ici elle reste la même.' },
  { level: 1, q: 'Léa est assise dans un TGV qui roule. <b>Par rapport au quai de la gare</b>, Léa est :', choices: [
    { t: 'En mouvement', ok: true },
    { t: 'Immobile', msg: 'La distance entre Léa et le quai change à chaque seconde : elle est en mouvement par rapport au quai.', code: 'notion' }],
    why: 'Le mouvement dépend du référentiel : immobile par rapport au wagon, en mouvement par rapport au quai.' },
  { level: 1, q: 'Une balle tombe tout droit. Sa trajectoire est :', choices: [
    { t: 'Rectiligne', ok: true },
    { t: 'Circulaire', msg: 'Circulaire = un cercle. Ici la balle suit une droite.', code: 'notion' },
    { t: 'Curviligne', msg: 'Curviligne = une courbe. Ici la balle suit une droite.', code: 'notion' }],
    why: 'Une trajectoire en ligne droite est rectiligne.' },
  { level: 1, q: 'Le bout de la grande aiguille d’une horloge a une trajectoire :', choices: [
    { t: 'Circulaire', ok: true },
    { t: 'Rectiligne', msg: 'Le bout de l’aiguille tourne en rond : il décrit un cercle.', code: 'notion' },
    { t: 'Curviligne', msg: 'Presque ! Mais quand la courbe est un cercle, on dit circulaire.', code: 'notion' }],
    why: 'Un cercle ou un arc de cercle donne une trajectoire circulaire.' },
  { level: 1, q: 'En physique, un « mobile », c’est :', choices: [
    { t: 'L’objet ou le point qu’on étudie pendant son déplacement', ok: true },
    { t: 'Un objet qui ne bouge jamais', msg: 'Au contraire : le mobile est ce qui se déplace.', code: 'notion' },
    { t: 'Le référentiel', msg: 'Le référentiel, c’est ce à partir de quoi on regarde le mobile.', code: 'notion' }],
    why: 'Le mobile est l’objet étudié ; le référentiel est le point de vue d’où on l’observe.' },
  { level: 1, q: 'Un skieur descend une piste en faisant des virages. Sa trajectoire est :', choices: [
    { t: 'Curviligne', ok: true },
    { t: 'Rectiligne', msg: 'Avec des virages, le chemin n’est pas une droite.', code: 'notion' },
    { t: 'Circulaire', msg: 'Les virages ne forment pas un cercle complet ni un arc de cercle régulier : c’est une courbe quelconque.', code: 'notion' }],
    why: 'Une courbe qui n’est ni une droite ni un cercle donne une trajectoire curviligne.' },
  { level: 1, q: 'Le référentiel « le sol » s’appelle :', choices: [
    { t: 'Terrestre', ok: true },
    { t: 'Géocentrique', msg: 'Géocentrique = le centre de la Terre, pas le sol.', code: 'notion' },
    { t: 'Héliocentrique', msg: 'Héliocentrique = le centre du Soleil.', code: 'notion' }],
    why: 'Sol = terrestre • centre de la Terre = géocentrique • centre du Soleil = héliocentrique.' },
  { level: 2, q: 'La valve d’une roue de vélo qui avance, vue par un piéton <b>sur le trottoir</b>, a une trajectoire :', choices: [
    { t: 'Curviligne', ok: true },
    { t: 'Circulaire', msg: 'Circulaire, c’est vu depuis le vélo. Vu du trottoir, la roue avance en même temps qu’elle tourne : la valve dessine des arches.', code: 'notion' },
    { t: 'Rectiligne', msg: 'La valve monte et descend en tournant, ce n’est pas une droite.', code: 'notion' }],
    why: 'La trajectoire dépend du référentiel : circulaire pour le cycliste, curviligne pour le piéton.' },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances entre deux positions : <b>2 cm, 2 cm, 2 cm, 2 cm</b>. Le mouvement est :', choices: [
    { t: 'Uniforme', ok: true },
    { t: 'Accéléré', msg: 'Accéléré = les distances grandissent. Ici elles sont toutes égales.', code: 'notion' },
    { t: 'Ralenti', msg: 'Ralenti = les distances rapetissent. Ici elles sont toutes égales.', code: 'notion' }],
    why: 'Mêmes distances pendant des durées égales = vitesse constante = mouvement uniforme.' },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances : <b>1 cm, 2 cm, 3 cm, 4 cm</b>. Le mouvement est :', choices: [
    { t: 'Accéléré', ok: true },
    { t: 'Uniforme', msg: 'Uniforme = distances égales. Ici elles augmentent.', code: 'notion' },
    { t: 'Ralenti', msg: 'Les distances augmentent : le mobile va de plus en plus vite.', code: 'notion' }],
    why: 'Des distances de plus en plus grandes pendant des durées égales : la vitesse augmente.' },
  { level: 2, q: 'Chronophotographie (une photo toutes les 0,1 s). Distances : <b>5 cm, 4 cm, 2 cm, 1 cm</b>. Le mouvement est :', choices: [
    { t: 'Ralenti', ok: true },
    { t: 'Accéléré', msg: 'Les distances diminuent : le mobile ralentit.', code: 'notion' },
    { t: 'Uniforme', msg: 'Uniforme = distances égales. Ici elles diminuent.', code: 'notion' }],
    why: 'Des distances de plus en plus petites pendant des durées égales : la vitesse diminue.' },
  { level: 2, q: 'Le référentiel « centre de la Terre » s’appelle :', choices: [
    { t: 'Géocentrique', ok: true },
    { t: 'Héliocentrique', msg: 'Hélio = Soleil. Géo = Terre.', code: 'notion' },
    { t: 'Terrestre', msg: 'Terrestre = le sol. Le centre de la Terre, c’est géocentrique.', code: 'notion' }],
    why: 'Géo veut dire Terre, hélio veut dire Soleil.' },
  { level: 2, q: 'Une voiture freine sur une route droite jusqu’au feu rouge. Son mouvement est :', choices: [
    { t: 'Rectiligne et ralenti', ok: true },
    { t: 'Rectiligne et uniforme', msg: 'En freinant, la vitesse diminue : ce n’est pas uniforme.', code: 'notion' },
    { t: 'Curviligne et ralenti', msg: 'La route est droite : la trajectoire est rectiligne.', code: 'notion' }],
    why: 'On décrit un mouvement avec deux informations : la forme de la trajectoire et l’évolution de la vitesse.' },
  { level: 2, q: 'Une voiture tourne sur un rond-point en gardant 30 km/h au compteur. Qu’est-ce qui change dans sa vitesse ?', choices: [
    { t: 'Sa direction', ok: true },
    { t: 'Sa valeur', msg: 'Le compteur reste à 30 km/h : la valeur ne change pas.', code: 'notion' },
    { t: 'Rien du tout', msg: 'La voiture tourne : la direction de sa vitesse change à chaque instant.', code: 'notion' }],
    why: 'Une vitesse a une direction, un sens et une valeur. Dans un virage, la direction change même si la valeur reste la même.' },
  { level: 3, q: 'Le compteur d’une voiture indique 50 km/h. C’est :', choices: [
    { t: 'La vitesse instantanée', ok: true },
    { t: 'La vitesse moyenne du trajet', msg: 'Le compteur donne la vitesse à l’instant précis où tu le regardes. La vitesse moyenne se calcule sur tout le trajet avec d ÷ t.', code: 'notion' }],
    why: 'Compteur et radar mesurent la vitesse instantanée ; d ÷ t donne une vitesse moyenne.' },
  { level: 3, q: 'Pour étudier un satellite qui tourne autour de la Terre, on choisit le référentiel :', choices: [
    { t: 'Géocentrique', ok: true },
    { t: 'Terrestre', msg: 'Le sol tourne avec la Terre : pour un satellite, on se place au centre de la Terre (géocentrique).', code: 'notion' },
    { t: 'Héliocentrique', msg: 'Héliocentrique sert pour les planètes autour du Soleil.', code: 'notion' }],
    why: 'On choisit le référentiel au centre de l’objet autour duquel le mobile tourne.' },
  { level: 3, q: 'Sur une chronophotographie, entre deux photos prises à <b>0,1 s</b> d’intervalle, un ballon avance de <b>0,8 m</b>. Sa vitesse est :', choices: [
    { t: '8 m/s', ok: true },
    { t: '0,08 m/s', msg: 'Tu as multiplié 0,8 par 0,1. Pour une vitesse, on divise : v = d ÷ t = 0,8 ÷ 0,1.', code: 'formule' },
    { t: '0,125 m/s', msg: 'Tu as divisé à l’envers (0,1 ÷ 0,8). La distance va en haut : 0,8 ÷ 0,1.', code: 'inverse' }],
    why: 'v = d ÷ t = 0,8 ÷ 0,1 = 8 m/s.' },
  { level: 3, q: 'Un passager marche vers l’avant dans un train qui roule. Par rapport au quai, il va :', choices: [
    { t: 'Plus vite que le train', ok: true },
    { t: 'Moins vite que le train', msg: 'Il avance dans le même sens que le train : sa vitesse par rapport au quai s’ajoute à celle du train.', code: 'notion' },
    { t: 'À la même vitesse que le train', msg: 'Ce serait vrai s’il restait assis. En marchant vers l’avant, il va un peu plus vite.', code: 'notion' }],
    why: 'La vitesse dépend du référentiel : par rapport au quai, on ajoute sa marche à la vitesse du train.' },
];
function genV1(level) {
  const pool = V1_BANK.filter((b) => b.level === level);
  return qcmFrom('V1', pickFresh(pool.length ? pool : V1_BANK));
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
        hints: ['1 min = 60 s.', `On divise par 60 : ${s} ÷ 60.`],
        sol: [ST.cherche('une durée en minutes.'), ST.conv('1 min = 60 s (et pas 100). Des secondes aux minutes, le nombre devient plus petit : on <b>divise</b> par 60.'),
              ST.calc(`${s} ÷ 60 = ${fr(s / 60)} min`), ST.piege(`écrire 0,${s} min, comme si une minute faisait 100 s.`)] });
    }
    const m = pick([15, 30, 45, 6, 12, 20, 40, 36, 48, 54]);
    return num({ skill: 'V2', level, q: `Convertis <b>${m} min</b> en heures (nombre décimal).`, unit: 'h', ans: m / 60, tol: 0.006,
      errs: [{ v: m / 100, code: 'base100', msg: `Tu as écrit ${fr(m / 100)} comme si une heure faisait 100 minutes. Elle en fait 60 : ${m} ÷ 60.` },
             { v: m * 60, code: 'conv60', msg: 'Tu as multiplié. Des minutes aux heures, le nombre devient plus petit : on divise par 60.' }],
      hints: ['1 h = 60 min.', `On divise par 60 : ${m} ÷ 60.`],
      sol: [ST.cherche('une durée en heures, écrite avec une virgule.'), ST.conv('1 h = 60 min (et pas 100). Des minutes aux heures, le nombre devient plus petit : on <b>divise</b> par 60.'),
            ST.calc(`${m} ÷ 60 = ${fr(m / 60)} h`), ST.piege(`écrire 0,${String(m).padStart(2, '0')} h : les minutes ne sont pas des centièmes d’heure.`)],
      round: m % 3 ? 'Arrondis au centième.' : '' });
  }
  if (level === 2) {
    if (Math.random() < 0.3) {
      const h = pick([0.25, 0.75, 0.2, 0.4, 0.6, 1.5]);
      return num({ skill: 'V2', level, q: `Un trajet dure <b>${fr(h)} h</b>. Combien de minutes cela fait-il ?`, unit: 'min', ans: h * 60,
        errs: [{ v: h * 100, code: 'base100', msg: `${fr(h)} h ce n’est pas ${fr(h * 100)} min : une heure fait 60 min, donc ${fr(h)} × 60.` },
               { v: h / 60, code: 'conv60', msg: 'Des heures aux minutes, le nombre devient plus grand : on multiplie par 60.' }],
        hints: ['1 h = 60 min.', `On multiplie : ${fr(h)} × 60.`],
        sol: [ST.cherche('une durée en minutes.'), ST.conv('1 h = 60 min. Des heures aux minutes, le nombre devient plus grand : on <b>multiplie</b> par 60.'),
              ST.calc(`${fr(h)} × 60 = ${fr(h * 60)} min`), ST.piege(`lire « ${fr(h)} h » comme « ${fr(h * 100)} min ».`)] });
    }
    const H = rnd(1, 4), M = pick([15, 30, 45, 12, 18, 24, 36, 48, 6, 54]);
    const ans = H + M / 60;
    return num({ skill: 'V2', level, q: `Convertis <b>${H} h ${M} min</b> en heures (nombre décimal).`, unit: 'h', ans, tol: 0.006,
      errs: [{ v: H + M / 100, code: 'base100', msg: `${H} h ${M} min n’est pas ${fr(H + M / 100)} h : les minutes ne sont pas des centièmes d’heure. Calcule ${M} ÷ 60.` },
             { v: H * 60 + M, code: 'minutes', msg: `Tu as trouvé la durée en minutes (${H * 60 + M} min). On voulait des heures : divise par 60.` }],
      hints: ['Garde les heures entières, puis convertis seulement les minutes.', `${H} + ${M} ÷ 60`],
      sol: [ST.cherche('la durée en heures, avec une virgule.'), ST.formule('heures + minutes ÷ 60'),
            ST.conv(`on garde les ${H} h ; on convertit seulement les minutes : ${M} ÷ 60 = ${fr(M / 60, 3)} h.`),
            ST.calc(`${H} + ${fr(M / 60, 3)} = ${fr(ans, 3)} h`), ST.piege(`écrire ${H},${M} h : c’est faux car une heure fait 60 min, pas 100.`)],
      round: 'Arrondis au centième si besoin.' });
  }
  if (Math.random() < 0.5) {
    const M = rnd(2, 59), S = pick([15, 30, 45, 12, 36, 24, 48]);
    return num({ skill: 'V2', level, q: `Un coureur met <b>${M} min ${S} s</b>. Convertis cette durée en minutes (nombre décimal).`, unit: 'min', ans: M + S / 60, tol: 0.006,
      errs: [{ v: M + S / 100, code: 'sec100', msg: `${S} s ne s’écrivent pas 0,${S} min : une minute fait 60 s, donc ${S} ÷ 60 = ${fr(S / 60)} min.` },
             { v: M * 60 + S, code: 'conv60', msg: 'Tu as trouvé la durée en secondes. On voulait des minutes.' }],
      hints: ['Garde les minutes entières et convertis seulement les secondes.', `${M} + ${S} ÷ 60`],
      sol: [ST.cherche('la durée en minutes, avec une virgule.'), ST.formule('minutes + secondes ÷ 60'),
            ST.conv(`on garde les ${M} min ; on convertit seulement les secondes : ${S} ÷ 60 = ${fr(S / 60)} min.`),
            ST.calc(`${M} + ${fr(S / 60)} = ${fr(M + S / 60)} min`), ST.piege(`écrire ${M},${S} min, comme si une minute faisait 100 s.`)] });
  }
  const H = rnd(1, 11), M = rnd(5, 55), S = pick([15, 30, 45, 12, 36, 20]);
  const ans = H + M / 60 + S / 3600;
  return num({ skill: 'V2', level, q: `Convertis <b>${H} h ${M} min ${S} s</b> en heures. Arrondis au centième.`, unit: 'h', ans, tol: 0.006,
    errs: [{ v: H + (M + S / 100) / 60, code: 'sec100', msg: `Les secondes ne sont pas des centièmes de minute : ${S} s = ${S} ÷ 60 = ${fr(S / 60)} min.` },
           { v: H + M / 100 + S / 10000, code: 'base100', msg: 'Les minutes et les secondes ne sont pas des centièmes : on divise par 60 et par 3 600.' },
           { v: H * 60 + M + S / 60, code: 'minutes', msg: 'Tu as trouvé la durée en minutes. On voulait des heures : divise par 60.' }],
    hints: ['Méthode : h + min ÷ 60 + s ÷ 3 600.', `${H} + ${M} ÷ 60 + ${S} ÷ 3 600`],
    sol: [ST.cherche('la durée en heures.'), ST.formule('heures + minutes ÷ 60 + secondes ÷ 3 600 (1 h = 3 600 s)'),
          ST.conv(`${M} min = ${M} ÷ 60 = ${fr(M / 60, 4)} h • ${S} s = ${S} ÷ 3 600 = ${fr(S / 3600, 4)} h`),
          ST.calc(`${H} + ${fr(M / 60, 4)} + ${fr(S / 3600, 4)} = ${fr(ans, 4)} ≈ ${fr(ans, 2)} h (on n’arrondit qu’à la fin)`)] });
}

/* ---------- V3 : km/h <-> m/s ---------- */
function genV3(level) {
  const why36 = '1 km/h = 1 000 m en 3 600 s, et 3 600 ÷ 1 000 = 3,6.';
  if (level === 1) {
    const v = pick([18, 36, 54, 72, 90, 108, 126]);
    return num({ skill: 'V3', level, q: `Convertis <b>${v} km/h</b> en m/s.`, unit: 'm/s', ans: v / 3.6,
      errs: [{ v: v * 3.6, code: 'conv36', msg: 'Tu as multiplié par 3,6. Des km/h aux m/s, le nombre devient plus petit : on divise.' },
             { v: v * 1000 / 60, code: 'conv60', msg: 'Une heure fait 3 600 s, pas 60. Le raccourci : ÷ 3,6.' }],
      hints: ['km/h → m/s : on divise par 3,6.', `${v} ÷ 3,6`],
      sol: [ST.cherche('la même vitesse, écrite en m/s.'), ST.conv(`${why36} Vers les m/s, le nombre devient plus petit : on <b>divise</b> par 3,6.`),
            ST.calc(`${v} ÷ 3,6 = ${fr(v / 3.6)} m/s`), `✅ <b>Vérification :</b> ${fr(v / 3.6)} est bien plus petit que ${v}.`] });
  }
  if (level === 2) {
    const v = pick([5, 10, 15, 20, 25, 30, 12.5]);
    return num({ skill: 'V3', level, q: `Convertis <b>${fr(v)} m/s</b> en km/h.`, unit: 'km/h', ans: v * 3.6,
      errs: [{ v: v / 3.6, code: 'conv36', msg: 'Tu as divisé. Des m/s aux km/h, le nombre devient plus grand : on multiplie par 3,6.' }],
      hints: ['m/s → km/h : on multiplie par 3,6.', `${fr(v)} × 3,6`],
      sol: [ST.cherche('la même vitesse, écrite en km/h.'), ST.conv(`${why36} Vers les km/h, le nombre devient plus grand : on <b>multiplie</b> par 3,6.`),
            ST.calc(`${fr(v)} × 3,6 = ${fr(v * 3.6)} km/h`), `✅ <b>Vérification :</b> ${fr(v * 3.6)} est bien plus grand que ${fr(v)}.`] });
  }
  const v = pick([44.5, 130, 50, 110, 80, 3.6 * 9.5]);
  return num({ skill: 'V3', level, q: `${v < 50 ? 'Un sprinteur court' : 'Une voiture roule'} à <b>${fr(v)} km/h</b>. Convertis en m/s. Arrondis au centième.`, unit: 'm/s', ans: v / 3.6, tol: 0.011,
    errs: [{ v: v * 3.6, code: 'conv36', msg: 'Tu as multiplié par 3,6. Des km/h aux m/s, on divise.' }],
    hints: ['km/h → m/s : ÷ 3,6.', `${fr(v)} ÷ 3,6 puis arrondis.`],
    sol: [ST.cherche('la vitesse en m/s, arrondie au centième.'), ST.conv(`${why36} Vers les m/s on <b>divise</b> par 3,6.`),
          ST.calc(`${fr(v)} ÷ 3,6 = ${fr(v / 3.6, 4)}… ≈ ${fr(v / 3.6)} m/s`), '✅ <b>Arrondi au centième :</b> on garde 2 chiffres après la virgule.'] });
}

/* ---------- V4 : vitesse ---------- */
function genV4(level) {
  if (level === 1) {
    const t = rnd(2, 5), v = pick([15, 20, 25, 60, 80, 90]), d = v * t;
    const who = pick(['Un cycliste', 'Une voiture', 'Un bus']);
    return num({ skill: 'V4', level, q: `${who} parcourt <b>${d} km en ${t} h</b>. Calcule sa vitesse moyenne en km/h.`, unit: 'km/h', ans: v,
      errs: [{ v: t / d, code: 'inverse', msg: `Tu as divisé ${t} par ${d}. La vitesse, c’est la distance divisée par le temps : la distance en haut.` },
             { v: d * t, code: 'formule', msg: 'Tu as multiplié. Pour la vitesse, on divise : v = d ÷ t.' }],
      hints: ['v = d ÷ t', `${d} ÷ ${t}`],
      sol: [ST.cherche('une vitesse.'), ST.formule('v = d ÷ t (la distance en haut, la durée en bas)'),
            ST.conv('des km et des h donnent directement des km/h : rien à convertir.'),
            ST.calc(`v = ${d} ÷ ${t} = ${v} km/h`), ST.phrase(`la vitesse moyenne est de ${v} km/h.`)] });
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
      sol: [ST.cherche('une vitesse en km/h.'), ST.formule('v = d ÷ t'),
            ST.conv(`pour des km/h, la durée doit être en heures : ${H} + ${M} ÷ 60 = ${fr(t, 3)} h (et pas ${H},${M} h).`),
            ST.calc(`v = ${d} ÷ ${fr(t, 3)} ≈ ${fr(ans, 0)} km/h`), ST.phrase(`la vitesse moyenne est d’environ ${fr(ans, 0)} km/h.`)] });
  }
  if (pick(['ms', 'kmh']) === 'ms') {
    const d = pick([100, 200, 400]), t = pick([10, 12.5, 20, 25, 40, 50, 80]);
    const vms = d / t, ans = vms * 3.6;
    return num({ skill: 'V4', level, q: `Un coureur parcourt <b>${d} m en ${fr(t)} s</b>. Calcule sa vitesse <b>en km/h</b>.`, unit: 'km/h', ans,
      errs: [{ v: vms, code: 'noconv', msg: `${fr(vms)}, c’est la vitesse en m/s. On demandait des km/h : multiplie par 3,6.` },
             { v: vms / 3.6, code: 'conv36', msg: 'Des m/s aux km/h, on multiplie par 3,6 (le nombre grandit).' },
             { v: t / d, code: 'inverse', msg: 'Tu as divisé à l’envers : v = d ÷ t.' }],
      hints: ['Calcule d’abord v = d ÷ t en m/s.', 'Puis convertis en km/h : × 3,6.'],
      sol: [ST.cherche('une vitesse, demandée en km/h.'), ST.formule('v = d ÷ t'),
            ST.calc(`avec des m et des s, on obtient des m/s : ${d} ÷ ${fr(t)} = ${fr(vms)} m/s`),
            ST.conv(`on demande des km/h : × 3,6 → ${fr(vms)} × 3,6 = ${fr(ans)} km/h`), ST.phrase(`le coureur va à ${fr(ans)} km/h.`)] });
  }
  const d = pick([300, 180, 360]), t = pick([4, 2.5, 5]);
  const vk = d / t, ans = vk / 3.6;
  return num({ skill: 'V4', level, q: `Un camion parcourt <b>${d} km en ${fr(t)} h</b>. Donne sa vitesse <b>en m/s</b> (arrondis au centième).`, unit: 'm/s', ans, tol: 0.011,
    errs: [{ v: vk, code: 'noconv', msg: `${fr(vk)}, c’est en km/h. On demandait des m/s : divise par 3,6.` },
           { v: vk * 3.6, code: 'conv36', msg: 'Des km/h aux m/s, on divise par 3,6.' }],
    hints: ['Calcule v = d ÷ t en km/h.', 'Puis divise par 3,6.'],
    sol: [ST.cherche('une vitesse, demandée en m/s.'), ST.formule('v = d ÷ t'),
          ST.calc(`avec des km et des h, on obtient des km/h : ${d} ÷ ${fr(t)} = ${fr(vk)} km/h`),
          ST.conv(`on demande des m/s : ÷ 3,6 → ${fr(vk)} ÷ 3,6 ≈ ${fr(ans)} m/s`), ST.phrase(`le camion roule à environ ${fr(ans)} m/s.`)] });
}

/* ---------- V5 : distance et durée ---------- */
function genV5(level) {
  if (level === 1) {
    const v = pick([50, 60, 80, 90, 110, 130]), t = rnd(2, 4);
    return num({ skill: 'V5', level, q: `Une voiture roule à <b>${v} km/h pendant ${t} h</b>. Quelle distance parcourt-elle ?`, unit: 'km', ans: v * t,
      errs: [{ v: v / t, code: 'formule', msg: 'Tu as divisé. Pour la distance, on multiplie : d = v × t.' },
             { v: t / v, code: 'formule', msg: 'Pour la distance : d = v × t.' }],
      hints: ['d = v × t', `${v} × ${t}`],
      sol: [ST.cherche('une distance.'), ST.formule('d = v × t (dans le triangle, on cache d : il reste v × t)'),
            ST.conv('des km/h multipliés par des h donnent des km : rien à convertir.'),
            ST.calc(`d = ${v} × ${t} = ${v * t} km`), ST.phrase(`la voiture parcourt ${v * t} km.`)] });
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const v = pick([60, 90, 120, 80]), m = pick([30, 15, 45, 20]), d = v * m / 60;
      return num({ skill: 'V5', level, q: `Combien de <b>minutes</b> faut-il pour parcourir <b>${fr(d)} km à ${v} km/h</b> ?`, unit: 'min', ans: m,
        errs: [{ v: m / 60, code: 'noconv', msg: `${fr(m / 60, 3)}, c’est en heures. On demandait des minutes : multiplie par 60.` },
               { v: v / d, code: 'inverse', msg: 'La durée, c’est t = d ÷ v (la distance en haut).' },
               { v: d * v, code: 'formule', msg: 'Pour une durée, on divise : t = d ÷ v.' }],
        hints: ['t = d ÷ v donne des heures.', 'Puis × 60 pour avoir des minutes.'],
        sol: [ST.cherche('une durée, demandée en minutes.'), ST.formule('t = d ÷ v (la distance en haut)'),
              ST.calc(`des km divisés par des km/h donnent des heures : ${fr(d)} ÷ ${v} = ${fr(m / 60, 3)} h`),
              ST.conv(`on demande des minutes : × 60 → ${fr(m / 60, 3)} × 60 = ${m} min`), ST.phrase(`il faut ${m} minutes.`)] });
    }
    const v = pick([60, 80, 100, 50]), H = rnd(1, 3), M = pick([30, 15, 45, 12]);
    const t = H + M / 60, ans = v * t;
    return num({ skill: 'V5', level, q: `Un car roule à <b>${v} km/h pendant ${H} h ${M} min</b>. Quelle distance parcourt-il ?`, unit: 'km', ans,
      errs: [{ v: v * (H + M / 100), code: 'base100', msg: `${H} h ${M} min n’est pas ${fr(H + M / 100)} h. Convertis : ${H} + ${M} ÷ 60 = ${fr(t)} h.` },
             { v: v * (H * 60 + M), code: 'minutes', msg: 'Tu as multiplié des km/h par des minutes. La durée doit être en heures.' }],
      hints: [`Convertis la durée : ${H} + ${M} ÷ 60.`, `Puis d = ${v} × ${fr(t)}.`],
      sol: [ST.cherche('une distance.'), ST.formule('d = v × t'),
            ST.conv(`la vitesse est en km/h, donc la durée doit être en heures : ${H} + ${M} ÷ 60 = ${fr(t, 3)} h.`),
            ST.calc(`d = ${v} × ${fr(t, 3)} = ${fr(ans)} km`), ST.phrase(`le car parcourt ${fr(ans)} km.`)] });
  }
  if (Math.random() < 0.5) {
    const v = pick([44.5, 36, 30, 40]), d = pick([100, 200, 250, 400]);
    const vms = v / 3.6, ans = d / vms;
    return num({ skill: 'V5', level, q: `Un sprinteur court à <b>${fr(v)} km/h</b>. Combien de <b>secondes</b> lui faut-il pour parcourir <b>${d} m</b> ? Arrondis au dixième.`, unit: 's', ans, tol: 0.11,
      errs: [{ v: d / v, code: 'noconv', tol: 0.05, msg: 'Tu as mélangé des mètres et des km/h. Convertis d’abord la vitesse en m/s (÷ 3,6).' },
             { v: vms / d, code: 'inverse', tol: 0.005, msg: 'La durée, c’est t = d ÷ v (la distance en haut).' },
             { v: d / (v * 3.6), code: 'conv36', tol: 0.05, msg: 'Pour passer des km/h aux m/s, on divise par 3,6.' }],
      hints: [`Convertis la vitesse : ${fr(v)} ÷ 3,6 = ${fr(vms)} m/s.`, `Puis t = ${d} ÷ ${fr(vms)}.`],
      sol: [ST.cherche('une durée en secondes.'), ST.formule('t = d ÷ v'),
            ST.conv(`la distance est en m et on veut des s : la vitesse doit être en m/s. ${fr(v)} ÷ 3,6 ≈ ${fr(vms)} m/s.`),
            ST.calc(`t = ${d} ÷ ${fr(vms)} ≈ ${fr(ans, 1)} s`), ST.phrase(`il lui faut environ ${fr(ans, 1)} secondes.`)] });
  }
  const v = pick([850, 800, 900]), H = rnd(2, 6), M = rnd(10, 50), S = pick([12, 36, 24]);
  const t = H + M / 60 + S / 3600, ans = v * t;
  return num({ skill: 'V5', level, q: `Un avion vole à <b>${v} km/h pendant ${H} h ${M} min ${S} s</b>. Quelle distance parcourt-il ? Arrondis à l’unité.`, unit: 'km', ans, tol: 1.5,
    errs: [{ v: v * Math.floor(t * 100) / 100, code: 'arrondi', tol: 0.6, msg: 'Presque ! Tu as arrondi la durée trop tôt. Garde tous les chiffres de la durée et n’arrondis qu’à la fin.' },
           { v: v * (H + M / 100 + S / 10000), code: 'base100', tol: 2, msg: 'Les minutes et secondes ne sont pas des centièmes : h + min ÷ 60 + s ÷ 3 600.' },
           { v: v * (H + (M + S / 100) / 60), code: 'sec100', tol: 1, msg: `${S} s ne font pas 0,${S} min : ${S} ÷ 60 = ${fr(S / 60)} min.` }],
    hints: ['Convertis la durée en heures : h + min ÷ 60 + s ÷ 3 600.', 'Garde le résultat complet dans la calculatrice, puis × vitesse.'],
    sol: [ST.cherche('une distance en km.'), ST.formule('d = v × t'),
          ST.conv(`la durée doit être en heures : ${H} + ${M} ÷ 60 + ${S} ÷ 3 600 ≈ ${fr(t, 4)} h. On garde tous les chiffres.`),
          ST.calc(`d = ${v} × ${fr(t, 4)} ≈ ${fr(ans, 0)} km`), ST.phrase(`l’avion parcourt environ ${fr(ans, 0)} km.`)] });
}

/* ---------- V6 : son, lumière, écho ---------- */
const V6_BANK = [
  { q: 'Le son peut-il se propager dans le vide (dans l’espace) ?', choices: [
    { t: 'Non', ok: true }, { t: 'Oui', msg: 'Le son a besoin de matière (air, eau, solide) pour avancer. Dans le vide, il n’y a rien pour le transporter.', code: 'notion' }],
    why: 'Le son a besoin d’un milieu matériel (air, eau, solide) : il ne se propage pas dans le vide.' },
  { q: 'La vitesse du son dans l’air est d’environ :', choices: [
    { t: '340 m/s', ok: true }, { t: '300 000 km/s', msg: '300 000 km/s, c’est la lumière.', code: 'notion' }, { t: '340 km/h', msg: 'C’est 340 mètres par seconde, beaucoup plus rapide que 340 km/h.', code: 'notion' }],
    why: 'Son dans l’air : environ 340 m/s (on dit aussi Mach 1).' },
  { q: 'La vitesse de la lumière dans le vide vaut :', choices: [
    { t: '300 000 km/s', ok: true }, { t: '340 m/s', msg: '340 m/s, c’est le son dans l’air.', code: 'notion' }, { t: '300 000 km/h', msg: 'C’est par seconde, pas par heure !', code: 'notion' }],
    why: 'Lumière : c = 300 000 km/s = 3 × 10⁸ m/s.' },
  { q: 'Pendant un orage, on voit l’éclair avant d’entendre le tonnerre parce que :', choices: [
    { t: 'La lumière va beaucoup plus vite que le son', ok: true }, { t: 'Le tonnerre se produit après l’éclair', msg: 'Ils se produisent en même temps. C’est la lumière qui arrive presque instantanément, le son met plus de temps.', code: 'notion' }],
    why: 'Éclair et tonnerre partent en même temps ; la lumière arrive presque tout de suite, le son à 340 m/s.' },
  { q: '3 × 10⁸ m/s, cela s’écrit aussi :', choices: [
    { t: '300 000 000 m/s', ok: true }, { t: '3 000 m/s', msg: '10⁸ veut dire 1 suivi de 8 zéros : 3 × 100 000 000.', code: 'p10' }, { t: '30 000 000 m/s', msg: 'Compte les zéros : 10⁸ = 100 000 000 (8 zéros), donc 300 000 000.', code: 'p10' }],
    why: '10⁸ = 1 suivi de 8 zéros. 3 × 10⁸ = 300 000 000.' },
  { q: '300 000 km/s, c’est combien en m/s ?', choices: [
    { t: '300 000 000 m/s', ok: true }, { t: '300 m/s', msg: 'Des km aux m on multiplie par 1 000 (le nombre grandit) : 300 000 × 1 000.', code: 'p10' }, { t: '300 000 m/s', msg: 'Il faut convertir les km en m : × 1 000.', code: 'noconv' }],
    why: '1 km = 1 000 m, donc 300 000 km/s × 1 000 = 300 000 000 m/s.' },
  { q: '« Mach 1 », c’est :', choices: [
    { t: 'La vitesse du son', ok: true }, { t: 'La vitesse de la lumière', msg: 'La lumière se note c. Mach 1 = vitesse du son, environ 340 m/s.', code: 'notion' }],
    why: 'Mach 1 = la vitesse du son dans l’air (environ 340 m/s). Mach 2 = deux fois plus vite.' },
  { q: 'Un sonar de bateau envoie un son vers le fond. Pour trouver la profondeur avec la durée mesurée, il faut :', choices: [
    { t: 'Diviser la distance totale par 2', ok: true }, { t: 'Garder la distance totale', msg: 'Le son est descendu puis remonté : la distance totale vaut deux fois la profondeur.', code: 'allerretour' }],
    why: 'Écho = aller + retour : on divise par 2.' },
  { q: 'Pour l’orage (éclair puis tonnerre), faut-il diviser par 2 ?', choices: [
    { t: 'Non, le son fait le trajet une seule fois', ok: true }, { t: 'Oui, comme pour l’écho', msg: 'Le tonnerre va de l’orage jusqu’à toi, sans revenir : il n’y a pas d’aller-retour.', code: 'allerretour' }],
    why: 'On divise par 2 seulement quand le son revient (écho). Le tonnerre fait un trajet simple.' },
  { q: 'Le son se propage-t-il dans l’eau ?', choices: [
    { t: 'Oui, et même plus vite que dans l’air', ok: true }, { t: 'Non, seulement dans l’air', msg: 'Les baleines communiquent sous l’eau ! Le son passe dans tous les milieux matériels.', code: 'notion' }],
    why: 'Le son passe dans l’air, l’eau et les solides. Il ne passe pas dans le vide.' },
  { q: 'Les astronautes sur la Lune se parlent :', choices: [
    { t: 'Par radio', ok: true }, { t: 'En criant très fort', msg: 'Il n’y a pas d’air sur la Lune : le son ne peut pas aller d’un casque à l’autre.', code: 'notion' }],
    why: 'Sans air, le son ne se propage pas. Les ondes radio, elles, voyagent dans le vide comme la lumière.' },
  { q: 'Dans la formule de l’écho d = 340 × t ÷ 2, que représente t ?', choices: [
    { t: 'La durée de l’aller ET du retour', ok: true }, { t: 'La durée de l’aller seulement', msg: 'Le chronomètre tourne du cri jusqu’au retour de l’écho : il mesure l’aller et le retour. C’est pour ça qu’on divise par 2.', code: 'allerretour' }],
    why: 'Le chronomètre mesure aller + retour ; la distance de l’obstacle est la moitié.' },
];
function genV6(level) {
  if (level === 1) return qcmFrom('V6', Object.assign({ level: 1 }, pickFresh(V6_BANK)));
  if (level === 2) {
    const t = pick([2, 3, 4, 5, 6]);
    return num({ skill: 'V6', level, q: `Tu vois un éclair et tu entends le tonnerre <b>${t} s</b> plus tard. À quelle distance est l’orage ? (son : 340 m/s)`, unit: 'm', ans: 340 * t,
      errs: [{ v: 340 / t, code: 'formule', msg: 'Pour une distance : d = v × t, on multiplie.' },
             { v: 340 * t / 2, code: 'allerretour', msg: 'Ici pas d’aller-retour : le son vient de l’orage jusqu’à toi, une seule fois.' }],
      hints: ['d = v × t', `340 × ${t}`],
      sol: [ST.cherche('la distance entre toi et l’orage.'), ST.formule('d = v × t, avec v = 340 m/s (vitesse du son)'),
            ST.conv('la lumière arrive presque tout de suite : la durée mesurée est le trajet du son, une seule fois (pas de ÷ 2).'),
            ST.calc(`d = 340 × ${t} = ${340 * t} m`), ST.phrase(`l’orage est à ${340 * t} m, soit environ ${fr(340 * t / 1000, 1)} km.`)] });
  }
  if (Math.random() < 0.7) {
    const t = pick([2, 3, 4, 1.5, 2.4, 5]);
    return num({ skill: 'V6', level, q: `Ethan crie face à une montagne et entend l’<b>écho ${fr(t)} s</b> plus tard. À quelle distance est la montagne ? (son : 340 m/s)`, unit: 'm', ans: 340 * t / 2,
      errs: [{ v: 340 * t, code: 'allerretour', msg: `${fr(340 * t)} m, c’est le trajet total du son : aller ET retour. La montagne est à la moitié.` },
             { v: 340 / t, code: 'formule', msg: 'Distance = vitesse × durée, on multiplie.' }],
      hints: ['Le son fait l’aller jusqu’à la montagne, puis le retour.', `340 × ${fr(t)} ÷ 2`],
      sol: [ST.cherche('la distance entre Ethan et la montagne.'), ST.formule('d = v × t ÷ 2 (écho = aller + retour)'),
            ST.calc(`trajet total du son : 340 × ${fr(t)} = ${fr(340 * t)} m`), ST.calc(`aller seul : ${fr(340 * t)} ÷ 2 = ${fr(340 * t / 2)} m`),
            ST.phrase(`la montagne est à ${fr(340 * t / 2)} m.`)] });
  }
  return num({ skill: 'V6', level, q: 'La Lune est à <b>384 000 km</b> de la Terre. Combien de secondes met la lumière (300 000 km/s) pour nous arriver ? Arrondis au centième.', unit: 's', ans: 1.28, tol: 0.006,
    errs: [{ v: 384000 / 300000000, code: 'noconv', tol: 0.0001, msg: 'Tu as mélangé km et m. Ici tout est en km : 384 000 ÷ 300 000.' },
           { v: 300000 / 384000, code: 'inverse', tol: 0.01, msg: 'La durée, c’est t = d ÷ v (la distance en haut).' }],
    hints: ['t = d ÷ v', '384 000 ÷ 300 000'],
    sol: [ST.cherche('une durée en secondes.'), ST.formule('t = d ÷ v'), ST.conv('distance en km et vitesse en km/s : on obtient directement des secondes.'),
          ST.calc('t = 384 000 ÷ 300 000 = 1,28 s'), ST.phrase('la lumière de la Lune met 1,28 s pour nous arriver.')] });
}

/* ---------- V7 : distance d'arrêt ---------- */
const V7_BANK = [
  { q: 'Qu’est-ce qui allonge la distance de <b>réaction</b> ?', choices: [
    { t: 'L’alcool ou la fatigue', ok: true },
    { t: 'Des pneus usés', msg: 'Les pneus jouent sur le freinage, pas sur le temps que met le conducteur à réagir.', code: 'notion' },
    { t: 'Une route mouillée', msg: 'La route mouillée allonge le freinage. La réaction dépend du conducteur.', code: 'notion' }],
    why: 'La réaction dépend du conducteur : réflexes, alcool, fatigue, distraction.' },
  { q: 'Qu’est-ce qui allonge la distance de <b>freinage</b> ?', choices: [
    { t: 'Une route mouillée', ok: true },
    { t: 'Téléphoner en conduisant', msg: 'Le téléphone ralentit la réaction du conducteur, pas le freinage de la voiture.', code: 'notion' },
    { t: 'L’âge du conducteur', msg: 'L’âge joue sur les réflexes, donc sur la réaction.', code: 'notion' }],
    why: 'Le freinage dépend du véhicule et de la route : freins, pneus, chaussée, météo, charge, vitesse.' },
  { q: 'La distance d’arrêt se calcule avec :', choices: [
    { t: 'da = dr + df', ok: true }, { t: 'da = df − dr', msg: 'On additionne les deux distances : d’abord la réaction, ensuite le freinage.', code: 'notion' }, { t: 'da = dr × df', msg: 'On additionne : da = dr + df.', code: 'notion' }],
    why: 'On roule d’abord pendant la réaction, puis pendant le freinage : les deux distances s’additionnent.' },
  { q: 'Pendant le temps de réaction, la voiture roule :', choices: [
    { t: 'À vitesse constante', ok: true }, { t: 'En ralentissant', msg: 'Le conducteur n’a pas encore appuyé sur le frein : la vitesse ne change pas encore.', code: 'notion' }],
    why: 'Tant que le pied n’est pas sur le frein, la vitesse ne change pas : c’est pour ça que dr = v × tr.' },
  { q: 'Quel facteur allonge <b>à la fois</b> la distance de réaction et la distance de freinage ?', choices: [
    { t: 'La vitesse', ok: true }, { t: 'L’état des freins', msg: 'Les freins jouent seulement sur le freinage.', code: 'notion' }, { t: 'La fatigue', msg: 'La fatigue joue seulement sur la réaction.', code: 'notion' }],
    why: 'La vitesse est dans les deux formules : dr = v × tr et df = k × v².' },
  { q: 'Une voiture très chargée (coffre plein, 5 passagers) a une distance de freinage :', choices: [
    { t: 'Plus longue', ok: true }, { t: 'Plus courte', msg: 'Plus la voiture est lourde, plus il faut de distance pour l’arrêter.', code: 'notion' }, { t: 'Identique', msg: 'La masse et la charge jouent sur le freinage.', code: 'notion' }],
    why: 'Masse et chargement allongent le freinage (et donc l’arrêt), pas la réaction.' },
  { q: 'Un conducteur discute avec ses passagers et regarde moins la route. Cela allonge :', choices: [
    { t: 'La distance de réaction', ok: true }, { t: 'La distance de freinage', msg: 'La discussion ne change pas les freins : elle retarde le moment où il appuie dessus.', code: 'notion' }],
    why: 'Tout ce qui distrait le conducteur allonge son temps de réaction, donc dr et da.' },
  { q: 'Sur une route verglacée, qu’est-ce qui change ?', choices: [
    { t: 'La distance de freinage augmente', ok: true }, { t: 'La distance de réaction augmente', msg: 'Le verglas ne change pas les réflexes du conducteur : il rend le freinage moins efficace.', code: 'notion' }],
    why: 'Route glissante = freinage plus long. La réaction ne dépend que du conducteur (et de la vitesse).' },
  { q: 'Le temps de réaction tr, c’est la durée entre :', choices: [
    { t: 'Le moment où l’on voit l’obstacle et le moment où l’on appuie sur le frein', ok: true },
    { t: 'Le moment où l’on freine et l’arrêt complet', msg: 'Ça, c’est le temps de freinage tf.', code: 'notion' },
    { t: 'Le moment où l’on voit l’obstacle et l’arrêt complet', msg: 'Ça, c’est le temps d’arrêt ta = tr + tf.', code: 'notion' }],
    why: 'tr : voir → freiner • tf : freiner → arrêt • ta : voir → arrêt.' },
  { q: 'Dans df = k × v², si la vitesse <b>double</b>, la distance de freinage est :', choices: [
    { t: 'Multipliée par 4', ok: true }, { t: 'Multipliée par 2', msg: 'La vitesse est au carré : (2 × v)² = 4 × v². La distance est multipliée par 4.', code: 'carre' }],
    why: 'À cause du carré : 2² = 4. Rouler deux fois plus vite, c’est freiner sur une distance quatre fois plus longue.' },
  { q: 'Dans df = k × v², pourquoi k est-il plus grand sur route mouillée (0,14) que sur route sèche (0,08) ?', choices: [
    { t: 'Parce que les pneus adhèrent moins : on freine sur une plus longue distance', ok: true },
    { t: 'Parce que le conducteur réagit moins vite', msg: 'k concerne seulement le freinage (la route et le véhicule), pas le conducteur.', code: 'notion' }],
    why: 'k traduit l’adhérence : moins d’adhérence = k plus grand = freinage plus long.' },
  { q: 'Pour calculer dr = v × tr en mètres, la vitesse doit être en :', choices: [
    { t: 'm/s', ok: true }, { t: 'km/h', msg: 'tr est en secondes : il faut des m/s pour obtenir des mètres (÷ 3,6 depuis les km/h).', code: 'noconv' }],
    why: 'm/s × s = m. On convertit donc toujours la vitesse en m/s avant de calculer dr ou df.' },
];
function genV7(level) {
  if (level === 1) return qcmFrom('V7', Object.assign({ level: 1 }, pickFresh(V7_BANK)));
  if (level === 2) {
    const vk = pick([36, 54, 72, 90, 108]), tr = pick([1, 1.2, 1.5, 2]);
    const v = vk / 3.6, ans = v * tr;
    const errs = [{ v: vk * tr, code: 'noconv', msg: `Tu as utilisé ${vk} km/h directement. Pour des mètres, convertis en m/s : ${vk} ÷ 3,6 = ${fr(v)} m/s.` }];
    if (tr !== 1) errs.push({ v: v, code: 'tr_faux', msg: `Tu as pris 1 s. L’énoncé dit ${fr(tr)} s : garde la donnée de l’énoncé.` });
    return num({ skill: 'V7', level, q: `Une voiture roule à <b>${vk} km/h</b>. Le temps de réaction du conducteur est <b>${fr(tr)} s</b>. Calcule la distance de réaction.`, unit: 'm', ans, errs,
      hints: [`Convertis : ${vk} ÷ 3,6 = ${fr(v)} m/s.`, `dr = v × tr = ${fr(v)} × ${fr(tr)}`],
      sol: [ST.cherche('la distance de réaction dr, en mètres.'), ST.formule('dr = v × tr (pendant la réaction, la vitesse ne change pas)'),
            ST.conv(`tr est en secondes, on veut des mètres : la vitesse doit être en m/s. ${vk} ÷ 3,6 = ${fr(v)} m/s.`),
            ST.calc(`dr = ${fr(v)} × ${fr(tr)} = ${fr(ans)} m`), ST.phrase(`pendant sa réaction, la voiture parcourt ${fr(ans)} m.`)] });
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
    sol: [ST.cherche('la distance d’arrêt da = distance de réaction + distance de freinage.'),
          ST.conv(`dans les deux formules la vitesse doit être en m/s : ${vk} ÷ 3,6 = ${fr(v)} m/s.`),
          ST.calc(`réaction : dr = v × tr = ${fr(v)} × ${fr(tr)} = ${fr(dr)} m`),
          ST.calc(`freinage : df = k × v² = ${fr(k)} × ${fr(v)} × ${fr(v)} = ${fr(k)} × ${fr(v * v)} = ${fr(df)} m`),
          ST.calc(`arrêt : da = ${fr(dr)} + ${fr(df)} = ${fr(ans)} m`), ST.phrase(`sur route ${wet ? 'mouillée' : 'sèche'}, la voiture s’arrête en ${fr(ans)} m.`)] });
}

/* ---------- V8 : lire la question, rédiger, chasse à l'erreur ---------- */
const V8_QCM = [
  { level: 1, q: 'Question : « Quel est le <b>gain de temps</b> ? ». Que faut-il calculer à la fin ?', choices: [
    { t: 'Ancienne durée − nouvelle durée', ok: true },
    { t: 'La nouvelle durée', msg: 'La nouvelle durée est une étape. Le gain, c’est ce qu’on économise : la différence entre les deux durées.', code: 'question' },
    { t: 'Ancienne durée + nouvelle durée', msg: 'Le gain est une différence, pas une somme.', code: 'question' }],
    why: 'Un gain est toujours une différence : ce qu’on avait avant moins ce qu’on a maintenant.' },
  { level: 1, q: 'Quelle réponse est complète ?', choices: [
    { t: 'La vitesse moyenne du camion est de 75 km/h.', ok: true },
    { t: '75', msg: 'Il manque l’unité et la phrase réponse.', code: 'question' },
    { t: 'v = 75', msg: 'Il manque l’unité et la phrase qui répond à la question.', code: 'question' }],
    why: 'Une réponse complète = le nombre + son unité + une phrase qui répond à la question.' },
  { level: 1, q: 'Dans un exercice, par quoi commence-t-on ?', choices: [
    { t: 'Relire la question pour savoir ce qu’on cherche', ok: true },
    { t: 'Taper les nombres dans la calculatrice', msg: 'Sans savoir ce qu’on cherche, on risque de calculer autre chose. On commence par la question.', code: 'question' }],
    why: 'Méthode : question → données → formule → conversions → calcul → unité → phrase.' },
  { level: 1, q: 'L’énoncé donne une durée en minutes et une vitesse en km/h. Que faut-il faire avant de calculer ?', choices: [
    { t: 'Convertir la durée en heures', ok: true },
    { t: 'Rien, on peut calculer directement', msg: 'km/h va avec des heures : il faut convertir les minutes en heures (÷ 60).', code: 'noconv' }],
    why: 'Les unités doivent aller ensemble : km/h avec h et km ; m/s avec s et m.' },
  { level: 2, q: 'Une distance passe de 50 m à 87,5 m. 87,5 ÷ 50 × 100 = 175 %. L’<b>augmentation</b> est de :', choices: [
    { t: '75 %', ok: true },
    { t: '175 %', msg: '175 %, c’est la nouvelle distance comparée à l’ancienne. L’augmentation, c’est ce qu’on a ajouté : 175 − 100 = 75 %.', code: 'pct_total' },
    { t: '37,5 %', msg: '37,5, ce sont des mètres (87,5 − 50). En pourcentage : 37,5 ÷ 50 × 100.', code: 'pct_total' }],
    why: 'Augmentation en % = (nouvelle − ancienne) ÷ ancienne × 100.' },
  { level: 2, q: 'Pour calculer une augmentation en %, on divise la différence par :', choices: [
    { t: 'L’ancienne valeur (celle de départ)', ok: true },
    { t: 'La nouvelle valeur', msg: 'On compare toujours à la valeur de départ : (nouvelle − ancienne) ÷ ancienne.', code: 'pct_total' },
    { t: 'Une autre valeur de l’exercice', msg: 'On divise par la valeur de départ de la même grandeur. Par exemple 80 m pour une distance d’arrêt, et pas 50 m qui est une distance de freinage.', code: 'pct_total' }],
    why: 'Le pourcentage d’augmentation se calcule toujours par rapport à la valeur de départ.' },
  { level: 2, q: 'Ta calculatrice affiche 4,7482… et on te demande un arrondi au dixième. Tu écris :', choices: [
    { t: '4,7', ok: true }, { t: '4,74', msg: 'Au dixième = 1 seul chiffre après la virgule.', code: 'arrondi' }, { t: '5', msg: 'Ça, c’est l’arrondi à l’unité.', code: 'arrondi' }],
    why: 'Dixième = 1 chiffre après la virgule ; centième = 2 chiffres ; unité = aucun.' },
  { level: 2, bat: true, q: '🕵️ Chasse à l’erreur : « 11 h 32 min 15 s = 692 min et 15 s = 692,15 min ». Où est l’erreur ?', choices: [
    { t: '15 s ne font pas 0,15 min mais 0,25 min', ok: true },
    { t: '11 h ne font pas 660 min', msg: '11 × 60 = 660, c’est juste. Regarde plutôt les secondes.', code: 'sec100' },
    { t: 'Il n’y a pas d’erreur', msg: 'Regarde les secondes : 15 s = 15 ÷ 60 min.', code: 'sec100' }],
    why: '15 s = 15 ÷ 60 = 0,25 min, donc 692,25 min.' },
  { level: 2, bat: true, q: '🕵️ Chasse à l’erreur : pour la vitesse du cycliste (300 km en 692,25 min), on a écrit « v = 692,25 ÷ 300 ». Où est l’erreur ?', choices: [
    { t: 'La division est à l’envers : v = distance ÷ durée', ok: true },
    { t: 'Il fallait multiplier', msg: 'Pour une vitesse on divise bien, mais la distance va en haut.', code: 'inverse' },
    { t: 'Il n’y a pas d’erreur', msg: 'v = d ÷ t : la distance (300) doit être en haut.', code: 'inverse' }],
    why: 'v = d ÷ t : la distance en haut. Et pour des km/h, la durée doit être en heures (692,25 ÷ 60 = 11,54 h).' },
  { level: 2, bat: true, q: '🕵️ Chasse à l’erreur : « 3 h 15 min = 3,15 h, donc v = 300 ÷ 3,15 = 95,2 km/h ». Où est l’erreur ?', choices: [
    { t: '3 h 15 min = 3,25 h, pas 3,15 h', ok: true },
    { t: 'Il fallait faire 3,15 ÷ 300', msg: 'La division est dans le bon sens. Le problème est la conversion de la durée.', code: 'base100' },
    { t: 'Il n’y a pas d’erreur', msg: '15 min = 15 ÷ 60 = 0,25 h. Donc 3,25 h et v ≈ 92,3 km/h.', code: 'base100' }],
    why: '15 min = 15 ÷ 60 = 0,25 h. Les minutes ne sont pas des centièmes d’heure.' },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : un trajet dure 20 min à 50 km/h. À 60 km/h il dure 16 min 40 s. Réponse écrite : « Gain de temps : 16 min 40 s ». Où est l’erreur ?', choices: [
    { t: '16 min 40 s est la nouvelle durée ; le gain est 20 min − 16 min 40 s = 3 min 20 s', ok: true },
    { t: 'Le calcul de 16 min 40 s est faux', msg: 'Le calcul est juste ! C’est la question qui n’est pas respectée.', code: 'question' },
    { t: 'Il n’y a pas d’erreur', msg: 'Relis la question : on demande un gain, donc une différence.', code: 'question' }],
    why: 'Un gain de temps est une différence : ancienne durée − nouvelle durée.' },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : énoncé « v = 25 m/s, temps de réaction 1,2 s ». Calcul écrit : « dr = 25 × 1 = 25 m ». Où est l’erreur ?', choices: [
    { t: 'Le temps de réaction de l’énoncé est 1,2 s, pas 1 s', ok: true },
    { t: 'Il fallait convertir 25 m/s en km/h', msg: 'Non, m/s × s donne bien des mètres. Regarde le temps de réaction.', code: 'tr_faux' },
    { t: 'Il n’y a pas d’erreur', msg: 'Compare avec l’énoncé : le temps de réaction est 1,2 s.', code: 'tr_faux' }],
    why: 'On utilise toujours les données de l’énoncé : dr = 25 × 1,2 = 30 m.' },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : « 5 h 35 min 12 s ≈ 5,58 h, donc d = 850 × 5,58 = 4 743 km ». Quel est le problème ?', choices: [
    { t: 'La durée a été arrondie trop tôt (5,5867 h) : il faut garder tous les chiffres jusqu’au bout', ok: true },
    { t: 'Il fallait faire 850 ÷ 5,58', msg: 'Pour une distance on multiplie bien. Le souci est l’arrondi de la durée.', code: 'arrondi' },
    { t: 'Il n’y a pas d’erreur', msg: '5 + 35 ÷ 60 + 12 ÷ 3 600 = 5,5867 h : en coupant à 5,58 on perd 6 km.', code: 'arrondi' }],
    why: 'On garde tous les chiffres dans la calculatrice et on n’arrondit qu’au résultat final : 850 × 5,5867 ≈ 4 749 km.' },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : « La distance d’arrêt passe de 80 m à 117,5 m. Augmentation : 37,5 ÷ 50 × 100 = 75 % ». Où est l’erreur ?', choices: [
    { t: 'Il faut diviser par 80 (l’ancienne distance d’arrêt), pas par 50', ok: true },
    { t: 'Il fallait diviser par 117,5', msg: 'On divise par la valeur de départ, qui est 80 m.', code: 'pct_total' },
    { t: 'Il n’y a pas d’erreur', msg: '50 m est la distance de freinage, pas la distance d’arrêt. 37,5 ÷ 80 × 100 ≈ 47 %.', code: 'pct_total' }],
    why: 'On compare à la valeur de départ de la même grandeur : 37,5 ÷ 80 × 100 ≈ 47 %.' },
  { level: 3, bat: true, q: '🕵️ Chasse à l’erreur : « Sprinteur à 44,5 km/h sur 250 m : t = 250 ÷ 44,5 = 5,6 s ». Où est l’erreur ?', choices: [
    { t: 'On a mélangé des mètres et des km/h : il faut d’abord 44,5 ÷ 3,6 = 12,36 m/s', ok: true },
    { t: 'Il fallait faire 44,5 ÷ 250', msg: 'La distance va bien en haut. Le problème, ce sont les unités.', code: 'noconv' },
    { t: 'Il n’y a pas d’erreur', msg: '5,6 s pour 250 m, ce serait plus rapide qu’un record du monde ! Il faut convertir la vitesse en m/s.', code: 'noconv' }],
    why: 'Mètres avec m/s : t = 250 ÷ 12,36 ≈ 20,2 s.' },
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
      sol: [ST.cherche('un gain de temps = ancienne durée − nouvelle durée.'),
            ST.calc(`longueur du trajet : d = v × t = ${v1} × ${t1} ÷ 60 = ${fr(d)} km (÷ 60 car ${t1} min = ${fr(t1 / 60, 3)} h)`),
            ST.calc(`nouvelle durée : t = d ÷ v = ${fr(d)} ÷ ${v2} = ${fr(d / v2, 4)} h = ${fr(t2)} min`),
            ST.calc(`gain : ${t1} − ${fr(t2)} = ${fr(gain)} min${unitOut === 's' ? ` = ${fr(gain * 60, 0)} s` : ''}`),
            ST.phrase(`on gagne seulement ${unitOut === 's' ? fr(gain * 60, 0) + ' secondes' : fr(gain) + ' minutes'}.`)] });
  }
  if (level >= 2 && Math.random() < 0.3) {
    const [a, b] = pick([[50, 87.5], [80, 117.5], [40, 50], [60, 75], [75, 112.5]]);
    const ans = (b - a) / a * 100;
    return num({ skill: 'V8', level, q: `Une distance de freinage passe de <b>${fr(a)} m</b> à <b>${fr(b)} m</b> sur route mouillée. Quelle est l’<b>augmentation en %</b> ? Arrondis à l’unité.`, unit: '%', ans, tol: 0.6,
      errs: [{ v: b / a * 100, code: 'pct_total', tol: 0.6, msg: `${fr(b / a * 100)} %, c’est la nouvelle distance comparée à l’ancienne. L’augmentation : retire 100.` },
             { v: b - a, code: 'pct_total', msg: `${fr(b - a)}, ce sont des mètres. Transforme en % : ÷ ${fr(a)} × 100.` }],
      hints: ['Augmentation = (nouvelle − ancienne) ÷ ancienne × 100', `(${fr(b)} − ${fr(a)}) ÷ ${fr(a)} × 100`],
      sol: [ST.cherche('une augmentation en pourcentage.'), ST.formule('(nouvelle − ancienne) ÷ ancienne × 100'),
            ST.calc(`ce qui a été ajouté : ${fr(b)} − ${fr(a)} = ${fr(b - a)} m`),
            ST.calc(`comparé à la valeur de départ : ${fr(b - a)} ÷ ${fr(a)} × 100 ≈ ${fr(ans, 0)} %`),
            ST.phrase(`la distance de freinage augmente d’environ ${fr(ans, 0)} %.`)] });
  }
  const pool = V8_QCM.filter((b) => b.level <= level);
  const b = pickFresh(pool);
  return qcmFrom('V8', b, { bat: !!b.bat });
}

const GENERATORS = { V1: genV1, V2: genV2, V3: genV3, V4: genV4, V5: genV5, V6: genV6, V7: genV7, V8: genV8 };
function generate(skill, level) { return GENERATORS[skill](Math.max(1, Math.min(3, level))); }

/* ---------- Évaluation de départ (15 questions, facile → difficile, en 3 blocs de 5) ---------- */
const DIAG_PLAN = [
  ['V1', 1], ['V2', 1], ['V3', 1], ['V4', 1], ['V6', 1], ['V7', 1], ['V1', 2],
  ['V2', 2], ['V3', 2], ['V4', 2], ['V5', 2], ['V6', 3], ['V2', 3], ['V7', 3], ['V8', 2],
];
function buildDiagnostic(block) { const plan = block == null ? DIAG_PLAN : DIAG_PLAN.slice(block * 5, block * 5 + 5); return plan.map(([s, l]) => generate(s, l)); }

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
