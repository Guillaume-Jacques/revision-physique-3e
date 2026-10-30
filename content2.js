/* =========================================================
   Contenu pédagogique — compléments du 30/10/2026
   - Module 2 (en avance sur la classe) : énergie cinétique, poids et masse.
     Ces compétences restent verrouillées tant que la leçon liée n'est pas
     terminée (ou qu'un contrôle les annonce).
   - Mode « Rédige comme sur ta copie » : problèmes en étapes, avec aide
     dégressive (niveau 1 très guidé → niveau 3 en autonomie).
   Textes rédigés pour l'appli, sans recopie de manuel.
   ========================================================= */

SKILLS.push(
  { id: 'E1', ref: 'NRJ-04', name: 'Calculer une énergie cinétique', short: 'Ec', icon: '⚡', lesson: 'C4' },
  { id: 'E2', ref: 'NRJ-01/02/05', name: 'Formes et conversions d’énergie', short: 'Énergie', icon: '🔋', lesson: 'C4' },
  { id: 'P1', ref: 'MVT-07', name: 'Poids et masse : P = m × g', short: 'P = m × g', icon: '⚖️', lesson: 'C5' },
  { id: 'P2', ref: 'MVT-06/07/08', name: 'Poids, force et gravitation', short: 'Gravitation', icon: '🌍', lesson: 'C5' },
);

Object.assign(ERR_LABELS, {
  demi: 'Oublie le ½ de la formule Ec = ½ × m × v²',
  poidsmasse: 'Confond poids (en N) et masse (en kg)',
  unite: 'Se trompe d’unité dans le résultat',
  hasard: 'Bonne réponse donnée au hasard',
  copie: 'Erreur relevée sur une copie de contrôle',
});

Object.assign(FICHES, {
  E1: {
    title: 'Calculer une énergie cinétique',
    points: [
      'Un objet qui <b>bouge</b> possède de l’énergie cinétique, notée <b>Ec</b>.',
      'Ec = ½ × m × v² : la masse <b>m en kg</b>, la vitesse <b>v en m/s</b>, l’énergie <b>Ec en joules (J)</b>.',
      'v² veut dire v × v. On calcule le carré <b>avant</b> de multiplier.',
      'Si la vitesse est en km/h : on divise d’abord par 3,6.',
      'Vitesse × 2 → Ec × 4. Vitesse × 3 → Ec × 9. Masse × 2 → Ec × 2.',
    ],
    formula: 'Ec = ½ × m × v²   (J, kg, m/s)',
    piege: 'Oublier le ½ ou le carré : 1 000 kg à 10 m/s, c’est 0,5 × 1 000 × 100 = 50 000 J.',
  },
  E2: {
    title: 'Formes et conversions d’énergie',
    points: [
      'Formes d’énergie : cinétique (mouvement), potentielle de position (hauteur), thermique, électrique, chimique, lumineuse, nucléaire.',
      'L’énergie ne se crée pas et ne disparaît pas : elle se <b>convertit</b> d’une forme à une autre.',
      'Chute : l’énergie de position diminue, l’énergie cinétique augmente.',
      'Freinage : l’énergie cinétique devient de l’énergie thermique (les freins chauffent).',
      'On ne dit pas « produire » de l’énergie : on la convertit.',
    ],
    formula: 'Énergie reçue = énergie utile + énergie perdue',
    piege: 'Une source (le Soleil, une pile, le vent) n’est pas une forme d’énergie.',
  },
  P1: {
    title: 'Poids et masse',
    points: [
      'La <b>masse</b> m mesure la quantité de matière, en <b>kg</b>, avec une balance. Elle ne change pas d’un astre à l’autre.',
      'Le <b>poids</b> P est une <b>force</b> : l’attraction de l’astre sur l’objet. Il se mesure en <b>newtons (N)</b>, avec un dynamomètre.',
      '<b>P = m × g</b>, avec g en N/kg. Sur Terre g ≈ 9,8 N/kg ; sur la Lune g ≈ 1,6 N/kg.',
      'Pour trouver la masse : m = P ÷ g.',
    ],
    formula: 'P = m × g   (N, kg, N/kg)',
    piege: 'Sur la Lune, un astronaute de 80 kg a toujours une masse de 80 kg ; c’est son poids qui baisse.',
  },
  P2: {
    title: 'Poids, force et gravitation',
    points: [
      'Une force se décrit par 4 caractéristiques : point d’application, direction, sens, valeur (en N).',
      'Le poids : appliqué au centre de l’objet, direction verticale, vers le bas (vers le centre de l’astre), valeur P = m × g.',
      'Sur un schéma, on le représente par une flèche ; sa longueur suit une échelle (ex. 1 cm pour 10 N).',
      'Gravitation : deux objets qui ont une masse s’attirent <b>l’un l’autre</b>. Plus les masses sont grandes et plus ils sont proches, plus l’attraction est forte.',
    ],
    formula: 'Poids : vertical, vers le bas, P = m × g',
    piege: 'La Terre attire la Lune, mais la Lune attire aussi la Terre (les marées).',
  },
});

Object.assign(CARDS, {
  E1: { title: 'Énergie cinétique', body: 'Ec = ½ × m × v²<br>J • kg • m/s<br>v × 2 → Ec × 4' },
  E2: { title: 'Conversions', body: 'Chute : position → cinétique<br>Freinage : cinétique → thermique' },
  P1: { title: 'Poids', body: 'P = m × g<br>Terre 9,8 N/kg • Lune 1,6 N/kg' },
  P2: { title: 'La force poids', body: 'Centre de l’objet • verticale<br>vers le bas • valeur en N' },
});

/* ---------- E1 : énergie cinétique ---------- */
function genE1(level) {
  const ecSol = (m, v, extra) => [ST.cherche('une énergie cinétique, en joules.'), ST.formule('Ec = ½ × m × v² (m en kg, v en m/s)'),
    ...(extra || []), ST.calc(`v² = ${fr(v)} × ${fr(v)} = ${fr(v * v)} ; Ec = 0,5 × ${fr(m)} × ${fr(v * v)} = ${fr(0.5 * m * v * v)} J`),
    ST.phrase(`l’énergie cinétique vaut ${fr(0.5 * m * v * v)} J.`)];
  if (level === 1) {
    const [obj, m] = pick([['Une voiture de 1 000 kg', 1000], ['Un cycliste et son vélo (80 kg)', 80], ['Une moto de 200 kg', 200], ['Un camion de 3 000 kg', 3000], ['Un ballon de 0,5 kg', 0.5]]);
    const v = pick([2, 4, 5, 10, 12, 20]);
    const ans = 0.5 * m * v * v;
    return num({ skill: 'E1', level, q: `${obj} roule à <b>${v} m/s</b>. Calcule son énergie cinétique.`, unit: 'J', ans,
      errs: [{ v: m * v * v, code: 'demi', msg: 'Tu as oublié le ½ : la formule est Ec = ½ × m × v², donc on divise aussi par 2.' },
             { v: 0.5 * m * v, code: 'carre', msg: 'La vitesse doit être mise au carré : v² = v × v.' },
             { v: 0.5 * m * 2 * v, code: 'carre', msg: 'v² ne veut pas dire v × 2 mais v × v.' }],
      hints: ['Ec = ½ × m × v²', `v² = ${v} × ${v} = ${v * v}, puis 0,5 × ${fr(m)} × ${v * v}`],
      sol: ecSol(m, v) });
  }
  if (level === 2) {
    const [obj, m] = pick([['Une voiture de 1 200 kg', 1200], ['Une voiture de 800 kg', 800], ['Un scooter et son pilote (150 kg)', 150], ['Un car de 10 000 kg', 10000]]);
    const vk = pick([36, 54, 72, 90, 18]);
    const v = vk / 3.6, ans = 0.5 * m * v * v;
    return num({ skill: 'E1', level, q: `${obj} roule à <b>${vk} km/h</b>. Calcule son énergie cinétique en joules.`, unit: 'J', ans,
      errs: [{ v: 0.5 * m * vk * vk, code: 'noconv', msg: `La vitesse doit être en m/s : ${vk} ÷ 3,6 = ${fr(v)} m/s avant de calculer.` },
             { v: m * v * v, code: 'demi', msg: 'Tu as oublié le ½ de la formule.' },
             { v: 0.5 * m * v, code: 'carre', msg: 'N’oublie pas le carré de la vitesse.' }],
      hints: ['La vitesse doit être en m/s : divise par 3,6.', `v = ${vk} ÷ 3,6 = ${fr(v)} m/s, puis Ec = 0,5 × ${m} × ${fr(v)}²`],
      sol: ecSol(m, v, [ST.conv(`${vk} km/h ÷ 3,6 = ${fr(v)} m/s`)]) });
  }
  if (Math.random() < 0.5) {
    const k = pick([2, 3]);
    return num({ skill: 'E1', level, q: `Une voiture roule ${k === 2 ? '<b>deux fois</b>' : '<b>trois fois</b>'} plus vite qu’une autre voiture identique. Son énergie cinétique est multipliée par combien ?`, unit: '', ans: k * k, tol: 0.01,
      errs: [{ v: k, code: 'carre', msg: `La vitesse est au carré dans la formule : ${k} × ${k} = ${k * k}.` }],
      hints: ['Dans Ec = ½ × m × v², la vitesse est au carré.', `Multiplier v par ${k} multiplie v² par ${k} × ${k}.`],
      sol: [ST.cherche('par combien Ec est multipliée.'), ST.formule('Ec = ½ × m × v² : la masse est la même, seule la vitesse change.'),
            ST.calc(`v est multipliée par ${k}, donc v² est multipliée par ${k} × ${k} = ${k * k}.`), ST.phrase(`l’énergie cinétique est multipliée par ${k * k}.`),
            ST.piege(`répondre ${k} : c’est vrai pour la masse, pas pour la vitesse.`)] });
  }
  const g = pick([450, 600, 58, 160]);
  const v = pick([10, 20, 30, 15]);
  const m = g / 1000, ans = 0.5 * m * v * v;
  return num({ skill: 'E1', level, q: `Une balle de <b>${g} g</b> est lancée à <b>${v} m/s</b>. Calcule son énergie cinétique.`, unit: 'J', ans,
    errs: [{ v: 0.5 * g * v * v, code: 'noconv', msg: `La masse doit être en kg : ${g} g = ${fr(m, 3)} kg.` },
           { v: m * v * v, code: 'demi', msg: 'Tu as oublié le ½.' }],
    hints: ['La masse doit être en kg : divise les grammes par 1 000.', `m = ${fr(m, 3)} kg, puis 0,5 × ${fr(m, 3)} × ${v}²`],
    sol: ecSol(m, v, [ST.conv(`${g} g ÷ 1 000 = ${fr(m, 3)} kg`)]), round: 'Arrondis au dixième si besoin.' });
}

/* ---------- E2 : formes et conversions ---------- */
const E2_BANK = [
  { level: 1, q: 'Une voiture qui roule possède surtout de l’énergie :', choices: [
    { t: 'cinétique', ok: true }, { t: 'lumineuse', msg: 'L’énergie liée au mouvement s’appelle l’énergie cinétique.', code: 'notion' }, { t: 'nucléaire', msg: 'Rien de nucléaire ici : un objet en mouvement a de l’énergie cinétique.', code: 'notion' }],
    why: 'Tout objet en mouvement possède de l’énergie cinétique.' },
  { level: 1, q: 'L’unité de l’énergie est :', choices: [
    { t: 'le joule (J)', ok: true }, { t: 'le newton (N)', msg: 'Le newton est l’unité des forces (comme le poids).', code: 'notion' }, { t: 'le watt (W)', msg: 'Le watt est l’unité de la puissance.', code: 'notion' }],
    why: 'Énergie en joules (J). Le kWh est une autre unité d’énergie, utilisée pour l’électricité.' },
  { level: 1, q: 'Quand une voiture freine, son énergie cinétique devient surtout :', choices: [
    { t: 'de l’énergie thermique (les freins chauffent)', ok: true }, { t: 'de l’énergie électrique', msg: 'Sauf sur certaines voitures électriques, l’énergie part en chaleur dans les freins.', code: 'notion' }, { t: 'rien : elle disparaît', msg: 'L’énergie ne disparaît jamais : elle est convertie.', code: 'notion' }],
    why: 'Au freinage, l’énergie cinétique est convertie en énergie thermique.' },
  { level: 1, q: 'Lequel n’est PAS une forme d’énergie ?', choices: [
    { t: 'Le Soleil', ok: true }, { t: 'L’énergie thermique', msg: 'L’énergie thermique est bien une forme d’énergie.', code: 'notion' }, { t: 'L’énergie chimique', msg: 'L’énergie chimique (stockée dans un carburant, un aliment, une pile) est une forme.', code: 'notion' }],
    why: 'Le Soleil est une source d’énergie. Il nous envoie de l’énergie sous forme lumineuse.' },
  { level: 2, q: 'Une pomme tombe d’un arbre. Pendant la chute :', choices: [
    { t: 'son énergie de position diminue et son énergie cinétique augmente', ok: true },
    { t: 'son énergie cinétique diminue', msg: 'Elle va de plus en plus vite : son énergie cinétique augmente.', code: 'notion' },
    { t: 'son énergie totale augmente', msg: 'L’énergie ne se crée pas : l’une diminue pendant que l’autre augmente.', code: 'notion' }],
    why: 'En tombant, la pomme perd de la hauteur (énergie de position) et gagne de la vitesse (énergie cinétique).' },
  { level: 2, q: 'Deux voitures roulent à la même vitesse. L’une a une masse double de l’autre. Son énergie cinétique est :', choices: [
    { t: 'deux fois plus grande', ok: true }, { t: 'quatre fois plus grande', msg: 'Le carré concerne la vitesse, pas la masse : masse × 2 → Ec × 2.', code: 'carre' }, { t: 'la même', msg: 'La masse est dans la formule : plus lourd → plus d’énergie.', code: 'notion' }],
    why: 'Ec = ½ × m × v² : Ec est proportionnelle à la masse.' },
  { level: 2, q: 'Une voiture passe de 50 km/h à 100 km/h. Son énergie cinétique est :', choices: [
    { t: 'multipliée par 4', ok: true }, { t: 'multipliée par 2', msg: 'La vitesse est au carré : 2 × 2 = 4.', code: 'carre' }, { t: 'multipliée par 100', msg: 'On regarde le rapport des vitesses : 100 ÷ 50 = 2, puis on met au carré.', code: 'carre' }],
    why: 'Vitesse doublée → énergie cinétique quadruplée. C’est pour ça que la distance de freinage augmente autant.' },
  { level: 2, q: 'Pourquoi la distance de freinage augmente-t-elle beaucoup avec la vitesse ?', choices: [
    { t: 'Parce que l’énergie cinétique à dissiper augmente avec le carré de la vitesse', ok: true },
    { t: 'Parce que le conducteur réagit moins vite', msg: 'Ça, c’est la distance de réaction. Le freinage dépend de l’énergie à évacuer.', code: 'notion' },
    { t: 'Parce que la masse augmente avec la vitesse', msg: 'La masse ne change pas avec la vitesse.', code: 'notion' }],
    why: 'Les freins doivent convertir toute l’énergie cinétique en chaleur ; elle augmente comme v².' },
  { level: 2, q: 'Dans une lampe, l’énergie électrique reçue est convertie en :', choices: [
    { t: 'énergie lumineuse et énergie thermique', ok: true }, { t: 'énergie lumineuse seulement', msg: 'Une lampe chauffe aussi : une partie part en énergie thermique.', code: 'notion' }, { t: 'énergie électrique', msg: 'C’est ce qu’elle reçoit, pas ce qu’elle donne.', code: 'notion' }],
    why: 'Énergie reçue = énergie utile (lumière) + énergie perdue (chaleur).' },
  { level: 3, q: 'Un skieur descend une pente sans frottement. En bas, son énergie cinétique est égale à :', choices: [
    { t: 'l’énergie de position qu’il a perdue', ok: true }, { t: 'zéro', msg: 'Il va vite en bas : son énergie cinétique est grande.', code: 'notion' }, { t: 'le double de l’énergie perdue', msg: 'L’énergie se conserve : il ne peut pas en gagner plus qu’il n’en a perdu.', code: 'notion' }],
    why: 'Conservation de l’énergie : ce qui est perdu en hauteur est gagné en vitesse (sans frottements).' },
  { level: 3, q: 'Quelle phrase est correcte ?', choices: [
    { t: 'Une éolienne convertit l’énergie cinétique du vent en énergie électrique', ok: true },
    { t: 'Une éolienne produit de l’énergie à partir de rien', msg: 'Rien ne se crée : le vent apporte son énergie cinétique.', code: 'notion' },
    { t: 'Une éolienne consomme de l’énergie électrique', msg: 'Elle en fournit au réseau.', code: 'notion' }],
    why: 'On ne produit pas l’énergie, on la convertit d’une forme à une autre.' },
  { level: 3, q: 'Un objet est immobile sur une table. Son énergie cinétique vaut :', choices: [
    { t: '0 J', ok: true }, { t: 'Elle dépend de sa masse', msg: 'Sans vitesse, v = 0, donc Ec = ½ × m × 0 = 0.', code: 'notion' }, { t: 'Elle dépend de la hauteur de la table', msg: 'La hauteur concerne l’énergie de position, pas l’énergie cinétique.', code: 'notion' }],
    why: 'v = 0 donc Ec = 0, quelle que soit la masse.' },
];
function genE2(level) {
  const pool = E2_BANK.filter((b) => b.level === level);
  return qcmFrom('E2', pickFresh(pool.length ? pool : E2_BANK));
}

/* ---------- P1 : P = m × g ---------- */
function genP1(level) {
  if (level === 1) {
    const [obj, m] = pick([['Un sac de 5 kg', 5], ['Un élève de 50 kg', 50], ['Un chien de 20 kg', 20], ['Une valise de 12 kg', 12], ['Un vélo de 15 kg', 15]]);
    const ans = m * 9.8;
    return num({ skill: 'P1', level, q: `${obj} est sur Terre (g = 9,8 N/kg). Calcule son <b>poids</b>.`, unit: 'N', ans,
      errs: [{ v: m, code: 'poidsmasse', msg: `${m}, c’est la masse (en kg). Le poids est une force : P = m × g.` },
             { v: m / 9.8, code: 'inverse', msg: 'Pour le poids on multiplie : P = m × g.' }],
      hints: ['P = m × g', `${m} × 9,8`],
      sol: [ST.cherche('un poids, donc une force en newtons.'), ST.formule('P = m × g'), ST.calc(`P = ${m} × 9,8 = ${fr(ans)} N`), ST.phrase(`le poids vaut ${fr(ans)} N.`),
            ST.piege('répondre en kg : la masse est en kg, le poids en N.')] });
  }
  if (level === 2) {
    if (Math.random() < 0.5) {
      const m = pick([60, 70, 80, 90, 120]);
      const ans = m * 1.6;
      return num({ skill: 'P1', level, q: `Un astronaute de masse <b>${m} kg</b> marche sur la Lune (g = 1,6 N/kg). Quel est son poids sur la Lune ?`, unit: 'N', ans,
        errs: [{ v: m * 9.8, code: 'notion', msg: 'Tu as pris g de la Terre. Sur la Lune, g = 1,6 N/kg.' }, { v: m, code: 'poidsmasse', msg: 'La masse reste 80 kg partout ; le poids, lui, se calcule avec P = m × g.' }],
        hints: ['P = m × g avec le g de la Lune.', `${m} × 1,6`],
        sol: [ST.cherche('le poids sur la Lune, en N.'), ST.formule('P = m × g, avec g Lune = 1,6 N/kg'), ST.calc(`P = ${m} × 1,6 = ${fr(ans)} N`),
              ST.phrase(`sur la Lune, son poids vaut ${fr(ans)} N ; sa masse reste ${m} kg.`)] });
    }
    const P = pick([49, 98, 196, 490, 686]);
    const ans = P / 9.8;
    return num({ skill: 'P1', level, q: `Un objet a un poids de <b>${P} N</b> sur Terre (g = 9,8 N/kg). Quelle est sa masse ?`, unit: 'kg', ans,
      errs: [{ v: P * 9.8, code: 'inverse', msg: 'Pour trouver m, on divise : m = P ÷ g.' }, { v: P, code: 'poidsmasse', msg: 'Le poids (N) n’est pas la masse (kg) : m = P ÷ g.' }],
      hints: ['P = m × g, donc m = P ÷ g.', `${P} ÷ 9,8`],
      sol: [ST.cherche('une masse, en kg.'), ST.formule('P = m × g, donc m = P ÷ g'), ST.calc(`m = ${P} ÷ 9,8 = ${fr(ans)} kg`), ST.phrase(`sa masse est de ${fr(ans)} kg.`)] });
  }
  if (Math.random() < 0.5) {
    const g = pick([250, 500, 750, 200]);
    const ans = g / 1000 * 9.8;
    return num({ skill: 'P1', level, q: `Une trousse a une masse de <b>${g} g</b>. Calcule son poids sur Terre (g = 9,8 N/kg).`, unit: 'N', ans,
      errs: [{ v: g * 9.8, code: 'noconv', msg: `La masse doit être en kg : ${g} g = ${fr(g / 1000, 3)} kg.` }],
      hints: ['Convertis d’abord la masse en kg.', `${fr(g / 1000, 3)} × 9,8`],
      sol: [ST.cherche('un poids en N.'), ST.formule('P = m × g (m en kg)'), ST.conv(`${g} g ÷ 1 000 = ${fr(g / 1000, 3)} kg`), ST.calc(`P = ${fr(g / 1000, 3)} × 9,8 = ${fr(ans)} N`), ST.phrase(`le poids de la trousse vaut ${fr(ans)} N.`)] });
  }
  const P = pick([588, 735, 490]);
  const m = P / 9.8, ans = m * 3.7;
  return num({ skill: 'P1', level, q: `Sur Terre, le poids d’un robot vaut <b>${P} N</b> (g = 9,8 N/kg). Quel serait son poids sur Mars (g = 3,7 N/kg) ?`, unit: 'N', ans, tol: 0.6,
    errs: [{ v: P * 3.7, code: 'poidsmasse', msg: 'Il faut d’abord retrouver la masse (m = P ÷ 9,8), puis calculer le poids sur Mars.' }, { v: m, code: 'question', msg: `${fr(m)} kg, c’est sa masse. La question demande son poids sur Mars.` }],
    hints: ['Étape 1 : la masse ne change pas. m = P ÷ 9,8.', `m = ${fr(m)} kg, puis P Mars = ${fr(m)} × 3,7`],
    sol: [ST.cherche('le poids sur Mars, en N.'), ST.formule('m = P ÷ g (Terre), puis P = m × g (Mars)'), ST.calc(`m = ${P} ÷ 9,8 = ${fr(m)} kg ; P Mars = ${fr(m)} × 3,7 ≈ ${fr(ans, 1)} N`),
          ST.phrase(`sur Mars, le robot pèserait environ ${fr(ans, 1)} N.`), ST.piege('la masse est la même partout, c’est elle qui fait le lien entre les deux astres.')] });
}

/* ---------- P2 : force, poids, gravitation ---------- */
const P2_BANK = [
  { level: 1, q: 'Le poids s’exprime en :', choices: [
    { t: 'newtons (N)', ok: true }, { t: 'kilogrammes (kg)', msg: 'Le kilogramme est l’unité de la masse. Le poids est une force, en newtons.', code: 'poidsmasse' }, { t: 'joules (J)', msg: 'Le joule est l’unité de l’énergie.', code: 'notion' }],
    why: 'Le poids est une force : il s’exprime en newtons.' },
  { level: 1, q: 'Un astronaute va sur la Lune. Sa masse :', choices: [
    { t: 'reste la même', ok: true }, { t: 'diminue', msg: 'C’est son poids qui diminue. La masse (quantité de matière) ne change pas.', code: 'poidsmasse' }, { t: 'devient nulle', msg: 'Il a toujours autant de matière : sa masse ne change pas.', code: 'poidsmasse' }],
    why: 'La masse ne dépend pas de l’endroit ; le poids, si.' },
  { level: 1, q: 'Pour mesurer un poids, on utilise :', choices: [
    { t: 'un dynamomètre', ok: true }, { t: 'une balance', msg: 'La balance mesure une masse (en kg).', code: 'poidsmasse' }, { t: 'un thermomètre', msg: 'Le thermomètre mesure une température.', code: 'notion' }],
    why: 'Dynamomètre → force (N). Balance → masse (kg).' },
  { level: 1, q: 'Le poids d’un objet est dirigé :', choices: [
    { t: 'verticalement, vers le bas', ok: true }, { t: 'horizontalement', msg: 'Lâche un objet : il tombe tout droit vers le sol, donc à la verticale.', code: 'notion' }, { t: 'vers le haut', msg: 'Le poids attire vers le centre de la Terre, donc vers le bas.', code: 'notion' }],
    why: 'Direction : la verticale. Sens : vers le bas (vers le centre de la Terre).' },
  { level: 2, q: 'Où place-t-on le point de départ de la flèche qui représente le poids ?', choices: [
    { t: 'Au centre de l’objet (centre de gravité)', ok: true }, { t: 'Au point de contact avec le sol', msg: 'Le poids est une action à distance qui s’exerce sur tout l’objet : on le place au centre.', code: 'notion' }, { t: 'N’importe où', msg: 'Le point d’application fait partie des caractéristiques d’une force : c’est le centre de l’objet.', code: 'notion' }],
    why: 'Point d’application du poids : le centre de gravité de l’objet.' },
  { level: 2, q: 'Avec l’échelle 1 cm pour 100 N, un poids de 500 N est représenté par une flèche de :', choices: [
    { t: '5 cm', ok: true }, { t: '50 cm', msg: '500 ÷ 100 = 5 : la flèche mesure 5 cm.', code: 'p10' }, { t: '500 cm', msg: 'On divise par la valeur d’un centimètre : 500 ÷ 100 = 5 cm.', code: 'p10' }],
    why: 'Longueur = valeur ÷ échelle : 500 ÷ 100 = 5 cm.' },
  { level: 2, q: 'Le poids est une action :', choices: [
    { t: 'à distance', ok: true }, { t: 'de contact', msg: 'La Terre attire un objet même s’il ne la touche pas (en train de tomber, par exemple).', code: 'notion' }],
    why: 'L’attraction de la Terre agit sans contact : c’est une action à distance.' },
  { level: 2, q: 'Pourquoi le poids d’un objet est-il plus petit sur la Lune ?', choices: [
    { t: 'Parce que la Lune attire moins que la Terre (g plus petit)', ok: true }, { t: 'Parce que l’objet perd de la matière', msg: 'L’objet garde toute sa matière : sa masse ne change pas.', code: 'poidsmasse' }, { t: 'Parce qu’il n’y a pas d’air', msg: 'L’air ne joue pas sur le poids : c’est la masse de l’astre qui compte.', code: 'notion' }],
    why: 'La Lune a une masse plus petite que la Terre : son g vaut environ 1,6 N/kg contre 9,8.' },
  { level: 3, q: 'La Terre attire la Lune. Que fait la Lune ?', choices: [
    { t: 'Elle attire aussi la Terre', ok: true }, { t: 'Rien', msg: 'L’interaction est réciproque : la Lune attire aussi la Terre (c’est l’origine des marées).', code: 'notion' }, { t: 'Elle repousse la Terre', msg: 'La gravitation attire toujours, elle ne repousse jamais.', code: 'notion' }],
    why: 'La gravitation est une interaction réciproque : chacun attire l’autre.' },
  { level: 3, q: 'Si on éloigne deux objets l’un de l’autre, la force de gravitation entre eux :', choices: [
    { t: 'diminue', ok: true }, { t: 'augmente', msg: 'Plus on est loin, plus l’attraction est faible.', code: 'notion' }, { t: 'ne change pas', msg: 'La distance est dans la formule (au carré, en bas) : elle compte beaucoup.', code: 'notion' }],
    why: 'Plus la distance augmente, plus l’attraction diminue (elle est divisée par d²).' },
  { level: 3, q: 'Quelle phrase est juste ?', choices: [
    { t: '« Ce sac pèse 49 N, sa masse est de 5 kg. »', ok: true }, { t: '« Ce sac pèse 5 N, sa masse est de 49 kg. »', msg: 'Sur Terre, P = m × 9,8 : le nombre en N est environ 10 fois plus grand que celui en kg.', code: 'poidsmasse' }, { t: '« Ce sac a un poids de 5 kg. »', msg: 'Un poids ne s’exprime pas en kg.', code: 'poidsmasse' }],
    why: 'P = 5 × 9,8 = 49 N. Masse en kg, poids en N.' },
];
function genP2(level) {
  const pool = P2_BANK.filter((b) => b.level === level);
  return qcmFrom('P2', pickFresh(pool.length ? pool : P2_BANK));
}

Object.assign(GENERATORS, { E1: genE1, E2: genE2, P1: genP1, P2: genP2 });

/* =========================================================
   Mode « Rédige comme sur ta copie »
   Chaque problème = des étapes. Selon le niveau, les premières étapes sont
   données (exemple travaillé) et l'élève fait la suite :
   niveau 1 → elle fait les 2 dernières étapes, niveau 2 → tout sauf la
   formule, niveau 3 → tout.
   Étapes : qcm (formule, phrase) ou num (conversion, calcul, avec unité à choisir).
   ========================================================= */
const REDAC_SKILLS = ['V4', 'V5', 'V6', 'V7', 'V8'];

function stepsItem(skill, level, q, steps) {
  const n = steps.length;
  const given = level === 1 ? n - 2 : level === 2 ? 1 : 0;
  steps.forEach((s, i) => { s.given = i < given; if (s.choices) s.choices = shuffle(s.choices); if (s.units) s.units = shuffle(s.units); });
  return { type: 'steps', redac: true, id: skill + '-r-' + uid(), skill, level, q, steps, hints: [], sol: steps.map((s) => s.show) };
}
const fStep = (good, bad, show) => ({ kind: 'qcm', label: 'La formule', prompt: 'Quelle formule utilises-tu ?',
  choices: [{ t: good, ok: true }, ...bad.map(([t, msg, code]) => ({ t, msg, code: code || 'formule' }))], show: '📐 ' + show });
const pStep = (good, bad, show) => ({ kind: 'qcm', label: 'La phrase réponse', prompt: 'Quelle phrase répond exactement à la question ?',
  choices: [{ t: good, ok: true }, ...bad.map(([t, msg]) => ({ t, msg, code: 'question' }))], show: '✍️ ' + (show || good) });
const nStep = (label, prompt, ans, unit, units, errs, show, tol) => ({ kind: 'num', label, prompt, ans, unit, units, errs: errs || [], show, tol });

function genRedac(skill, level) {
  level = Math.max(1, Math.min(3, level));
  if (skill === 'V4') {
    const D = pick([300, 240, 180, 420, 150]), H = rnd(1, 4), M = pick([15, 30, 45, 12, 36, 48]);
    const t = H + M / 60, v = D / t;
    return stepsItem('V4', level, `Une voiture parcourt <b>${D} km</b> en <b>${H} h ${M} min</b>. Calcule sa vitesse moyenne en km/h. Arrondis à l’unité.`, [
      fStep('v = d ÷ t', [['v = t ÷ d', 'La distance va en haut : v = d ÷ t.', 'inverse'], ['v = d × t', 'Pour une vitesse, on divise la distance par la durée.']], 'v = d ÷ t'),
      nStep('Conversion de la durée', `Convertis ${H} h ${M} min en heures (nombre décimal).`, t, 'h', null,
        [{ v: H + M / 100, code: 'base100', msg: `Une heure fait 60 min : ${M} ÷ 60 = ${fr(M / 60, 3)}, donc ${fr(t, 3)} h.` }], `🔁 ${H} h ${M} min = ${H} + ${M} ÷ 60 = ${fr(t, 3)} h`, 0.006),
      nStep('Le calcul', `Calcule v et choisis l’unité.`, v, 'km/h', ['km/h', 'm/s', 'km'],
        [{ v: D / (H + M / 100), code: 'base100', msg: 'Utilise la durée en heures décimales.' }, { v: t / D, code: 'inverse', msg: 'C’est la division à l’envers.' }], `🧮 v = ${D} ÷ ${fr(t, 3)} ≈ ${fr(v, 0)} km/h`, 1),
      pStep(`La vitesse moyenne de la voiture est d’environ ${fr(v, 0)} km/h.`, [[`La voiture roule pendant ${fr(t, 2)} h.`, 'C’est la durée, pas la vitesse demandée.'], [`La voiture parcourt ${D} km.`, 'C’est une donnée de l’énoncé, pas la réponse.']]),
    ]);
  }
  if (skill === 'V5') {
    const vk = pick([36, 18, 27, 45, 54]), d = pick([100, 200, 400, 150, 300]);
    const v = vk / 3.6, t = d / v;
    return stepsItem('V5', level, `Un cycliste roule à <b>${vk} km/h</b>. Combien de temps, en secondes, met-il pour parcourir <b>${d} m</b> ? Arrondis au dixième.`, [
      fStep('t = d ÷ v', [['t = v ÷ d', 'La distance va en haut : t = d ÷ v.', 'inverse'], ['t = d × v', 'Pour une durée, on divise la distance par la vitesse.']], 't = d ÷ v'),
      nStep('Conversion de la vitesse', `Les mètres et les secondes vont ensemble : convertis ${vk} km/h en m/s.`, v, 'm/s', null,
        [{ v: vk * 3.6, code: 'conv36', msg: 'Des km/h aux m/s on divise par 3,6.' }], `🔁 ${vk} ÷ 3,6 = ${fr(v)} m/s`, 0.011),
      nStep('Le calcul', 'Calcule t et choisis l’unité.', t, 's', ['s', 'h', 'm/s'],
        [{ v: d / vk, code: 'noconv', msg: 'Utilise la vitesse en m/s, avec la distance en m.' }, { v: v / d, code: 'inverse', msg: 'Division à l’envers.' }], `🧮 t = ${d} ÷ ${fr(v)} ≈ ${fr(t, 1)} s`, 0.11),
      pStep(`Le cycliste met environ ${fr(t, 1)} s pour parcourir ${d} m.`, [[`Le cycliste roule à ${fr(v)} m/s.`, 'C’est une étape du calcul, pas ce qu’on demande.'], [`Le cycliste parcourt ${fr(t, 1)} m.`, 'Le résultat est une durée, en secondes.']]),
    ]);
  }
  if (skill === 'V6') {
    const t = pick([2, 3, 4, 1.5, 2.4, 5]), d = 340 * t / 2;
    return stepsItem('V6', level, `Léa crie face à une falaise. Elle entend l’écho <b>${fr(t)} s</b> plus tard. Le son va à 340 m/s dans l’air. À quelle distance est la falaise ?`, [
      fStep('d = v × t ÷ 2', [['d = v × t', 'Le son fait l’aller ET le retour : il faut diviser par 2.', 'allerretour'], ['d = v ÷ t', 'Pour une distance, on multiplie la vitesse par la durée.']], 'd = v × t ÷ 2 (aller-retour)'),
      nStep('Durée de l’aller', 'Quelle est la durée de l’aller seul, en secondes ?', t / 2, 's', null,
        [{ v: t, code: 'allerretour', msg: `${fr(t)} s, c’est l’aller ET le retour. L’aller seul dure ${fr(t / 2)} s.` }], `🔁 aller seul : ${fr(t)} ÷ 2 = ${fr(t / 2)} s`),
      nStep('Le calcul', 'Calcule la distance et choisis l’unité.', d, 'm', ['m', 'km', 'm/s'],
        [{ v: 340 * t, code: 'allerretour', msg: 'Tu as compté l’aller-retour : divise par 2.' }], `🧮 d = 340 × ${fr(t / 2)} = ${fr(d)} m`),
      pStep(`La falaise se trouve à ${fr(d)} m de Léa.`, [[`Le son parcourt ${fr(340 * t)} m.`, 'C’est la distance aller-retour du son, pas la distance de la falaise.'], [`L’écho met ${fr(t)} s.`, 'C’est une donnée de l’énoncé.']]),
    ]);
  }
  if (skill === 'V7') {
    const vk = pick([50, 90, 72, 108, 36]), tr = pick([1, 1.2, 1.5, 2]), df = pick([14, 25, 40, 50, 60]);
    const v = vk / 3.6, dr = v * tr, da = dr + df;
    return stepsItem('V7', level, `Une voiture roule à <b>${vk} km/h</b>. Le conducteur a un temps de réaction de <b>${fr(tr)} s</b>. Sa distance de freinage est de <b>${df} m</b>. Calcule sa distance d’arrêt. Arrondis au dixième.`, [
      fStep('da = dr + df, avec dr = v × tr', [['da = df', 'Il faut ajouter la distance parcourue pendant le temps de réaction.', 'oubli_dr'], ['da = v × tr', 'Ça, c’est seulement la distance de réaction : il manque le freinage.', 'oubli_df']], 'da = dr + df, avec dr = v × tr'),
      nStep('Conversion de la vitesse', `Convertis ${vk} km/h en m/s.`, v, 'm/s', null, [{ v: vk * 3.6, code: 'conv36', msg: 'On divise par 3,6.' }], `🔁 ${vk} ÷ 3,6 = ${fr(v)} m/s`, 0.011),
      nStep('Distance de réaction', `Calcule dr = v × tr (temps de réaction de l’énoncé : ${fr(tr)} s).`, dr, 'm', ['m', 's', 'km/h'],
        [{ v: vk * tr, code: 'noconv', msg: 'La vitesse doit être en m/s.' }, { v: v, code: 'tr_faux', msg: `Utilise le temps de réaction de l’énoncé : ${fr(tr)} s.` }], `🧮 dr = ${fr(v)} × ${fr(tr)} = ${fr(dr, 1)} m`, 0.15),
      nStep('Distance d’arrêt', 'Calcule da = dr + df.', da, 'm', ['m', 'km', 's'], [{ v: dr, code: 'oubli_df', msg: 'Ajoute la distance de freinage.' }, { v: df, code: 'oubli_dr', msg: 'Ajoute la distance de réaction.' }], `🧮 da = ${fr(dr, 1)} + ${df} = ${fr(da, 1)} m`, 0.15),
      pStep(`La distance d’arrêt de la voiture est d’environ ${fr(da, 1)} m.`, [[`La distance de réaction est de ${fr(dr, 1)} m.`, 'C’est une étape : la question demande la distance d’arrêt.'], [`Le conducteur met ${fr(tr)} s à réagir.`, 'C’est une donnée de l’énoncé.']]),
    ]);
  }
  // V8 : gain de temps
  const d = pick([20, 30, 15, 40, 25]), v1 = 50, v2 = pick([60, 80, 70, 90]);
  const t1 = d / v1 * 60, t2 = d / v2 * 60, g = t1 - t2;
  return stepsItem('V8', level, `Un automobiliste fait un trajet de <b>${d} km</b>. Il roule à <b>${v2} km/h</b> au lieu de <b>${v1} km/h</b>. Quel temps gagne-t-il, en minutes ? Arrondis au dixième.`, [
    fStep('t = d ÷ v pour chaque vitesse, puis gain = t1 − t2', [['gain = d ÷ (v2 − v1)', 'On ne soustrait pas les vitesses : on calcule les deux durées et on les soustrait.'], ['t = d ÷ v2 suffit', 'Ça donne la nouvelle durée, pas le gain : il faut comparer avec l’ancienne.', 'question']], 'Durée à chaque vitesse (t = d ÷ v), puis gain = ancienne durée − nouvelle durée'),
    nStep('Durée à 50 km/h', `Calcule la durée du trajet à ${v1} km/h, en minutes.`, t1, 'min', null, [{ v: d / v1, code: 'conv60', msg: `${fr(d / v1)} h : multiplie par 60 pour avoir des minutes.` }], `🧮 t1 = ${d} ÷ ${v1} = ${fr(d / v1, 3)} h = ${fr(t1, 1)} min`, 0.15),
    nStep(`Durée à ${v2} km/h`, `Calcule la durée du trajet à ${v2} km/h, en minutes.`, t2, 'min', null, [{ v: d / v2, code: 'conv60', msg: 'Multiplie les heures par 60 pour avoir des minutes.' }], `🧮 t2 = ${d} ÷ ${v2} = ${fr(d / v2, 3)} h = ${fr(t2, 1)} min`, 0.15),
    nStep('Le gain de temps', 'Calcule le gain et choisis l’unité.', g, 'min', ['min', 'h', 'km/h'], [{ v: t2, code: 'question', msg: 'Ça, c’est la nouvelle durée. Le gain = ancienne − nouvelle.' }], `🧮 gain = ${fr(t1, 1)} − ${fr(t2, 1)} = ${fr(g, 1)} min`, 0.2),
    pStep(`En roulant à ${v2} km/h, il gagne environ ${fr(g, 1)} min.`, [[`Le trajet dure ${fr(t2, 1)} min.`, 'C’est la nouvelle durée, pas le temps gagné.'], [`Il roule ${v2 - v1} km/h plus vite.`, 'La question porte sur le temps gagné, en minutes.']]),
  ]);
}
