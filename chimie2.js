/* =========================================================
   Chimie — module 2 « Les transformations chimiques » (30/10/2026)
   Source de référence : livre de chimie de Louise (chapitres
   « Transformations chimiques » et « Ions, pH »), pages 84 à 93.
   Textes, exemples et nombres rédigés pour l'appli, sans recopie.
   - Compétences K8 (transformations, équations, conservation)
     et K9 (reconnaître des ions et des gaz par un test)
   - Leçon C7, 9 exercices corrigés, générateurs, erreurs ciblées
   Chargé après chimie.js et avant app.js.
   ========================================================= */

SKILLS.push(
  { id: 'K8', subj: 'chimie', ref: 'MAT-09/10/14', name: 'Transformations chimiques et équations', short: 'Réactions', icon: '🔥', lesson: 'C7' },
  { id: 'K9', subj: 'chimie', ref: 'MAT-11', name: 'Reconnaître un ion ou un gaz par un test', short: 'Tests', icon: '🧫', lesson: 'C7' },
);

Object.assign(ERR_LABELS, {
  ajuste: 'Choisit ou écrit une équation non ajustée',
  coefIndice: 'Confond le grand chiffre devant (coefficient) et le petit chiffre (indice)',
  masseConso: 'Oublie que la masse se conserve',
  reacProd: 'Confond réactifs et produits',
  testIon: 'Se trompe de test ou de couleur de précipité',
});

Object.assign(FICHES, {
  K8: {
    title: 'Transformations chimiques et équations',
    points: [
      'Transformation chimique : des espèces disparaissent (<b>réactifs</b>) et de nouvelles apparaissent (<b>produits</b>). Fondre ou dissoudre n’en est pas une.',
      'Bilan : réactifs → produits. Ex. : méthane + dioxygène → dioxyde de carbone + eau.',
      'Les <b>atomes</b> se réarrangent : ils se conservent (même nombre de chaque sorte). Les <b>molécules</b>, elles, changent.',
      'La <b>masse totale</b> se conserve : masse des réactifs = masse des produits.',
      'Équation ajustée : autant d’atomes de chaque sorte à gauche et à droite. CH₄ + 2 O₂ → CO₂ + 2 H₂O.',
    ],
    formula: 'm(réactifs) = m(produits)  •  2\u00a0H₂O = 4\u00a0H + 2\u00a0O',
    piege: 'Le grand chiffre devant multiplie toute la molécule ; on ne touche jamais aux petits chiffres.',
  },
  K9: {
    title: 'Reconnaître un ion ou un gaz par un test',
    points: [
      'On ajoute quelques gouttes d’un réactif : si un <b>précipité</b> (solide) coloré apparaît, l’ion est présent.',
      'Avec la <b>soude</b> : Cu²⁺ → bleu ; Fe²⁺ → vert ; Fe³⁺ → orange-rouille ; Al³⁺ et Zn²⁺ → blanc.',
      'Avec le <b>nitrate d’argent</b> : Cl⁻ → précipité blanc qui noircit à la lumière.',
      'Eau : le sulfate de cuivre anhydre (blanc) devient bleu. CO₂ : l’eau de chaux se trouble.',
      'Dihydrogène : petite détonation à la flamme. Dioxygène : il ravive une bûchette incandescente.',
    ],
    formula: 'Test positif → l’espèce est présente • aucun changement → elle est absente',
    piege: 'Bien lire le réactif : Cl⁻ se teste au nitrate d’argent, pas à la soude.',
  },
});

Object.assign(CARDS, {
  K8: { title: 'Réactions', body: 'Réactifs → produits<br>Atomes et masse conservés<br>CH₄ + 2 O₂ → CO₂ + 2 H₂O' },
  K9: { title: 'Tests', body: 'Soude : Cu²⁺ bleu, Fe²⁺ vert,<br>Fe³⁺ rouille, Al³⁺/Zn²⁺ blanc<br>Nitrate d’argent : Cl⁻ blanc → noircit' },
});

/* ---------- K8 : transformations chimiques ---------- */
const K8_BANK = [
  { level: 1, q: 'Dans une transformation chimique, les « réactifs » sont :', choices: [
    { t: 'Les espèces qui disparaissent (celles de départ)', ok: true },
    { t: 'Les espèces qui apparaissent', msg: 'Celles qui apparaissent sont les produits.', code: 'reacProd' },
    { t: 'Les atomes qui disparaissent', msg: 'Les atomes ne disparaissent jamais : ils se réarrangent.', code: 'notion' }],
    why: 'Réactifs = au départ (ils sont consommés) ; produits = à l’arrivée (ils sont formés).' },
  { level: 1, q: 'Lequel de ces changements est une transformation chimique ?', choices: [
    { t: 'Le bois qui brûle', ok: true },
    { t: 'La glace qui fond', msg: 'C’est toujours de l’eau : c’est un changement d’état (transformation physique).', code: 'notion' },
    { t: 'Le sucre qui se dissout dans le thé', msg: 'Le sucre est toujours là, dispersé dans l’eau : c’est une dissolution, pas une réaction.', code: 'notion' }],
    why: 'Une combustion fait apparaître de nouvelles espèces (dioxyde de carbone, eau…) : c’est une transformation chimique.' },
  { level: 1, q: 'Dans « méthane + dioxygène → dioxyde de carbone + eau », les produits sont :', choices: [
    { t: 'Le dioxyde de carbone et l’eau', ok: true },
    { t: 'Le méthane et le dioxygène', msg: 'Ceux-là sont à gauche de la flèche : ce sont les réactifs.', code: 'reacProd' },
    { t: 'Le méthane et l’eau', msg: 'Les produits sont tous à droite de la flèche.', code: 'reacProd' }],
    why: 'À gauche de la flèche : les réactifs. À droite : les produits.' },
  { level: 1, q: 'Pendant une transformation chimique, qu’est-ce qui se conserve ?', choices: [
    { t: 'Les atomes et la masse totale', ok: true },
    { t: 'Les molécules', msg: 'Non : les molécules se cassent et de nouvelles se forment. Ce sont les atomes qui restent.', code: 'notion' },
    { t: 'Rien du tout', msg: 'Les atomes se réarrangent sans disparaître : leur nombre et la masse totale restent les mêmes.', code: 'masseConso' }],
    why: 'Les atomes changent de « partenaires » mais aucun ne disparaît : la masse totale est conservée.' },
  { level: 1, q: 'La combustion complète du méthane (gaz de cuisine) produit :', choices: [
    { t: 'Du dioxyde de carbone et de l’eau', ok: true },
    { t: 'Du dioxygène et de l’eau', msg: 'Le dioxygène est consommé (c’est un réactif), il n’est pas produit.', code: 'reacProd' },
    { t: 'Rien : le gaz disparaît', msg: 'La matière ne disparaît pas : elle se transforme en CO₂ et en eau, des gaz qu’on ne voit pas.', code: 'masseConso' }],
    why: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O.' },
  { level: 2, q: 'Quelle équation est <b>ajustée</b> ?', choices: [
    { t: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O', ok: true },
    { t: 'CH₄ + O₂ → CO₂ + H₂O', msg: 'Compte les H : 4 à gauche, 2 à droite. Et les O : 2 à gauche, 3 à droite. Elle n’est pas ajustée.', code: 'ajuste' },
    { t: 'CH₄ + O₄ → CO₂ + H₄O', msg: 'On n’a pas le droit de changer les petits chiffres : O₄ et H₄O ne sont plus les bonnes molécules.', code: 'coefIndice' }],
    why: 'À gauche : 1 C, 4 H, 4 O. À droite : 1 C, 4 H (2 × 2), 4 O (2 + 2). Tout est équilibré.' },
  { level: 2, q: '« 2 H₂O » représente :', choices: [
    { t: '2 molécules d’eau, soit 4 atomes H et 2 atomes O', ok: true },
    { t: '1 molécule avec 2 atomes H et 1 atome O', msg: 'Le 2 devant compte les molécules : il y en a 2.', code: 'coefIndice' },
    { t: '2 atomes H et 2 atomes O', msg: 'Chaque molécule a 2 H : 2 molécules → 4 H.', code: 'coefIndice' }],
    why: 'Le grand chiffre devant multiplie toute la molécule : 2 × (2 H + 1 O) = 4 H + 2 O.' },
  { level: 2, q: 'Pour ajuster une équation, on a le droit de modifier :', choices: [
    { t: 'Les nombres placés devant les formules', ok: true },
    { t: 'Les petits chiffres dans les formules', msg: 'Changer un petit chiffre change la molécule (H₂O deviendrait autre chose).', code: 'coefIndice' },
    { t: 'Les symboles des atomes', msg: 'Les atomes ne changent pas de nature pendant une réaction.', code: 'notion' }],
    why: 'On place des coefficients devant les formules ; les formules elles-mêmes restent intactes.' },
  { level: 2, q: 'On fait brûler une bougie sur une balance, à l’air libre. L’affichage :', choices: [
    { t: 'Diminue, car des gaz produits s’échappent dans l’air', ok: true },
    { t: 'Diminue, car de la matière est détruite', msg: 'Rien n’est détruit : la masse part sous forme de gaz (CO₂ et vapeur d’eau).', code: 'masseConso' },
    { t: 'Ne bouge pas', msg: 'Les gaz formés partent dans l’air : la balance ne les pèse plus.', code: 'masseConso' }],
    why: 'Dans un récipient fermé, la masse ne changerait pas. À l’air libre, les gaz produits s’envolent.' },
  { level: 2, q: 'Une combustion est « incomplète » quand :', choices: [
    { t: 'Il manque du dioxygène : il se forme aussi du carbone (suie) et du monoxyde de carbone', ok: true },
    { t: 'Le combustible ne brûle pas du tout', msg: 'Il brûle, mais mal, faute de dioxygène.', code: 'notion' },
    { t: 'Elle ne produit que de l’eau', msg: 'Au contraire : elle forme en plus du carbone et du monoxyde de carbone.', code: 'notion' }],
    why: 'Pas assez de dioxygène (appareil mal entretenu, pièce mal aérée) → suie et CO, un gaz toxique.' },
  { level: 3, q: 'Pourquoi le monoxyde de carbone (CO) est-il si dangereux ?', choices: [
    { t: 'Il est invisible et sans odeur, et prend la place du dioxygène dans le sang', ok: true },
    { t: 'Il sent très fort et brûle les yeux', msg: 'Justement non : on ne le sent pas et on ne le voit pas. Il faut un détecteur.', code: 'notion' },
    { t: 'Il explose au contact de l’air', msg: 'Le danger, c’est l’intoxication : il empêche le sang de transporter le dioxygène.', code: 'notion' }],
    why: 'Le CO se fixe dans le sang à la place du dioxygène : maux de tête, nausées, puis malaise. Aérer, entretenir les appareils et installer un détecteur protègent.' },
  { level: 3, q: '1 % correspond à combien de ppm (parties par million) ?', choices: [
    { t: '10 000 ppm', ok: true },
    { t: '100 ppm', msg: '100 ppm, c’est 0,01 %. 1 % = 1 sur 100 = 10 000 sur 1 000 000.', code: 'p10' },
    { t: '1 000 ppm', msg: '1 000 ppm = 0,1 %. Pour 1 % : 1 000 000 ÷ 100 = 10 000 ppm.', code: 'p10' }],
    why: '1 % = 1/100 = 10 000/1 000 000 = 10 000 ppm. Donc 0,01 % = 100 ppm.' },
  { level: 3, q: 'L’air que l’on respire contient environ :', choices: [
    { t: '78 % de diazote et 21 % de dioxygène', ok: true },
    { t: '78 % de dioxygène et 21 % de diazote', msg: 'C’est l’inverse : le diazote (N₂) est le plus abondant.', code: 'notion' },
    { t: '100 % de dioxygène', msg: 'Le dioxygène n’en représente qu’environ un cinquième.', code: 'notion' }],
    why: 'Air : environ 4/5 de diazote N₂, 1/5 de dioxygène O₂, et 1 % d’autres gaz (argon, CO₂…).' },
  { level: 3, q: 'Combien d’atomes d’oxygène au total à droite de : CH₄ + 2 O₂ → CO₂ + 2 H₂O ?', choices: [
    { t: '4', ok: true },
    { t: '3', msg: 'CO₂ en apporte 2, et 2 H₂O en apportent 2 × 1 = 2 : total 4.', code: 'coefIndice' },
    { t: '2', msg: 'N’oublie ni le CO₂ ni le 2 devant H₂O : 2 + 2 = 4.', code: 'coefIndice' }],
    why: 'CO₂ : 2 O ; 2 H₂O : 2 O. Total : 4, comme à gauche (2 O₂ = 4 O).' },
];

/* Coefficient manquant : [gauche, droite, réponse] avec « … » à la place du nombre cherché */
const EQ_MISS = [
  ['CH₄ + … O₂', 'CO₂ + 2 H₂O', 2, 'O : à droite 2 + 2 = 4 atomes, il faut donc 2 O₂ à gauche.'],
  ['2 H₂ + O₂', '… H₂O', 2, 'H : 4 à gauche, il faut 2 H₂O (2 × 2 = 4 H) ; O : 2 de chaque côté.'],
  ['C + O₂', '… CO₂', 1, 'Un C et deux O de chaque côté : un seul CO₂ (on n’écrit pas le 1).'],
  ['2 C + O₂', '… CO', 2, '2 C à gauche → 2 CO à droite ; et 2 O de chaque côté.'],
  ['2 CO + O₂', '… CO₂', 2, 'C : 2 à gauche → 2 CO₂ ; O : 2 + 2 = 4 à gauche, 2 × 2 = 4 à droite.'],
  ['N₂ + … H₂', '2 NH₃', 3, 'H : 2 × 3 = 6 à droite, il faut 3 H₂ (3 × 2 = 6) à gauche.'],
  ['C₃H₈ + 5 O₂', '3 CO₂ + … H₂O', 4, 'H : 8 à gauche, il faut 4 H₂O (4 × 2 = 8) à droite.'],
  ['2 Cu + O₂', '… CuO', 2, 'Cu : 2 à gauche → 2 CuO ; O : 2 de chaque côté.'],
  ['C₂H₆O + 3 O₂', '2 CO₂ + … H₂O', 3, 'H : 6 à gauche, il faut 3 H₂O (3 × 2 = 6).'],
];

/* Combustions : [combustible, masse combustible, masse O2, produit connu, sa masse, produit cherché] (nombres réalistes) */
const MASS_CASES = [
  ['méthane', 16, 64, 'eau', 36, 'dioxyde de carbone'],
  ['méthane', 8, 32, 'eau', 18, 'dioxyde de carbone'],
  ['carbone', 12, 32, null, 0, 'dioxyde de carbone'],
  ['carbone', 6, 16, null, 0, 'dioxyde de carbone'],
  ['propane', 44, 160, 'eau', 72, 'dioxyde de carbone'],
  ['butane', 58, 208, 'eau', 90, 'dioxyde de carbone'],
  ['éthanol', 46, 96, 'eau', 54, 'dioxyde de carbone'],
];

function genK8(level) {
  const r = Math.random();
  if (level === 1) {
    if (r < 0.65) { const pool = K8_BANK.filter((b) => b.level === 1); return qcmFrom('K8', pickFresh(pool)); }
    const [comb, m1, m2, known, mk, wanted] = pick(MASS_CASES), ans = m1 + m2 - mk;
    return num({ skill: 'K8', level, q: `On brûle complètement <b>${m1} g</b> ${dn(comb)} avec <b>${m2} g</b> de dioxygène. ${known ? `Il se forme <b>${mk} g</b> d’${known} et ` : 'Il se forme '}du ${wanted}. Quelle masse de ${wanted} se forme-t-il ?`, unit: 'g', ans,
      errs: [{ v: m1 + m2 + mk, code: 'masseConso', msg: `L’${known} fait partie des produits : on la retire, on ne l’ajoute pas.` }, { v: m1, code: 'masseConso', msg: 'Le dioxygène compte aussi : sa masse se retrouve dans les produits.' }, { v: m2, code: 'masseConso', msg: 'Le combustible compte aussi : sa masse se retrouve dans les produits.' }].filter((e) => e.v !== ans),
      hints: ['La masse des réactifs = la masse des produits.', known ? `${m1} + ${m2} − ${mk}` : `${m1} + ${m2}`],
      sol: [ST.formule('masse des réactifs = masse des produits (la masse se conserve)'), ST.calc(known ? `${m1} + ${m2} = ${m1 + m2} g de réactifs, donc ${m1 + m2} − ${mk} = ${ans} g` : `${m1} + ${m2} = ${ans} g`), ST.phrase(`Il se forme ${ans} g de ${wanted}.`)] });
  }
  if (level === 2) {
    if (r < 0.5) { const pool = K8_BANK.filter((b) => b.level === 2); return qcmFrom('K8', pickFresh(pool)); }
    if (r < 0.75) {
      const [L, R, ans, why] = pick(EQ_MISS);
      return num({ skill: 'K8', level, q: `Complète l’équation pour qu’elle soit ajustée : <b>${L} → ${R}</b>. Quel nombre remplace « … » ?`, unit: '', ans,
        errs: [{ v: ans === 1 ? 2 : 1, code: 'ajuste', msg: 'Compte chaque sorte d’atome à gauche puis à droite : il en faut autant des deux côtés.' }],
        hints: ['Compte les atomes de chaque sorte de chaque côté.', why],
        sol: [ST.formule('même nombre d’atomes de chaque sorte à gauche et à droite'), ST.calc(why)] });
    }
    const [parts, name] = pick([[[['H', 2], ['O', 1]], 'eau'], [[['C', 1], ['O', 2]], 'dioxyde de carbone'], [[['O', 2]], 'dioxygène'], [[['C', 1], ['H', 4]], 'méthane'], [[['N', 1], ['H', 3]], 'ammoniac']]);
    const k = pick([2, 3, 4]), [el, n] = pick(parts), ans = k * n, F = fml(parts);
    return num({ skill: 'K8', level, q: `Combien d’atomes ${dn(ELNAME[el])} y a-t-il dans <b>${k} ${F}</b> (${k} molécules ${dn(name)}) ?`, unit: 'atomes', ans,
      errs: [{ v: n, code: 'coefIndice', msg: `Ça, c’est pour UNE molécule. Il y en a ${k}.` }, { v: k, code: 'coefIndice', msg: `Chaque molécule contient ${n} atome${n > 1 ? 's' : ''} ${dn(ELNAME[el])}.` }, { v: k + n, code: 'coefIndice', msg: 'On multiplie le coefficient par le petit chiffre, on ne les additionne pas.' }].filter((e) => e.v !== ans),
      hints: ['Le grand chiffre devant multiplie toute la molécule.', `${k} × ${n}`],
      sol: [ST.formule('nombre d’atomes = coefficient × petit chiffre'), ST.calc(`${k} × ${n} = ${ans} atomes ${dn(ELNAME[el])}`)] });
  }
  if (r < 0.55) { const pool = K8_BANK.filter((b) => b.level === 3); return qcmFrom('K8', pickFresh(pool)); }
  if (r < 0.8) {
    const toPpm = Math.random() < 0.5, pct = pick([0.01, 0.02, 0.04, 0.05, 0.06, 0.1, 0.5]), ppm = Math.round(pct * 10000);
    return toPpm
      ? num({ skill: 'K8', level, q: `L’air d’une pièce contient <b>${fr(pct, 2)} %</b> de monoxyde de carbone. Combien cela fait-il en ppm ?`, unit: 'ppm', ans: ppm,
          errs: [{ v: ppm / 100, code: 'p10', msg: '1 % = 10 000 ppm : on multiplie par 10 000.' }, { v: ppm * 10, code: 'p10', msg: '1 % = 10 000 ppm, pas 100 000.' }],
          hints: ['1 % = 10 000 ppm.', `${fr(pct, 2)} × 10 000`], sol: [ST.formule('1 % = 10 000 ppm'), ST.calc(`${fr(pct, 2)} × 10 000 = ${ppm} ppm`)] })
      : num({ skill: 'K8', level, q: `Un détecteur affiche <b>${ppm} ppm</b> de monoxyde de carbone. Combien cela fait-il en pourcentage ?`, unit: '%', ans: pct,
          errs: [{ v: pct * 100, code: 'p10', msg: 'On divise par 10 000 (1 % = 10 000 ppm).' }, { v: pct / 10, code: 'p10', msg: '1 % = 10 000 ppm, pas 100 000.' }],
          hints: ['1 % = 10 000 ppm.', `${ppm} ÷ 10 000`], sol: [ST.formule('1 % = 10 000 ppm'), ST.calc(`${ppm} ÷ 10 000 = ${fr(pct, 2)} %`)] });
  }
  const [Lr, l, h] = pick([[4, 5, 2.5], [3, 4, 2.5], [5, 6, 2.5], [4, 4, 2.5]]), V = Lr * l * h, VL = V * 1000, co = pick([5, 10, 15, 20, 25]), pct = co / VL * 100;
  return num({ skill: 'K8', level, q: `Une pièce mesure ${Lr} m × ${l} m × ${fr(h, 1)} m. Un chauffage mal réglé y rejette <b>${co} L</b> de monoxyde de carbone. Quel pourcentage de l’air cela représente-t-il ? (1 m³ = 1 000 L)`, unit: '%', ans: pct, tol: pct * 0.03,
    errs: [{ v: co / V * 100, code: 'noconv', msg: 'Le volume de la pièce est en m³ et celui du gaz en L : convertis d’abord (1 m³ = 1 000 L).' }, { v: co / VL, code: 'question', msg: 'Ça, c’est une fraction. Pour un pourcentage, multiplie par 100.' }],
    hints: [`Volume de la pièce : ${Lr} × ${l} × ${fr(h, 1)} = ${fr(V, 1)} m³ = ${fr(VL, 0)} L.`, `${co} ÷ ${fr(VL, 0)} × 100`],
    sol: [ST.formule('pourcentage = volume du gaz ÷ volume d’air × 100'), ST.conv(`V = ${Lr} × ${l} × ${fr(h, 1)} = ${fr(V, 1)} m³ = ${fr(VL, 0)} L`), ST.calc(`${co} ÷ ${fr(VL, 0)} × 100 = ${fr(pct, 3)} % (soit ${fr(pct * 10000, 0)} ppm)`)] });
}

/* ---------- K9 : tests ---------- */
const TESTS = [
  ['Cu²⁺', 'ion cuivre II', 'soude', 'bleu'], ['Fe²⁺', 'ion fer II', 'soude', 'vert'], ['Fe³⁺', 'ion fer III', 'soude', 'orange-rouille'],
  ['Al³⁺', 'ion aluminium', 'soude', 'blanc'], ['Zn²⁺', 'ion zinc', 'soude', 'blanc'], ['Cl⁻', 'ion chlorure', 'nitrate d’argent', 'blanc qui noircit à la lumière'],
];
const K9_BANK = [
  { level: 1, q: 'Un « précipité », c’est :', choices: [
    { t: 'Un solide qui apparaît dans un liquide', ok: true },
    { t: 'Un gaz qui fait des bulles', msg: 'Des bulles, c’est un dégagement gazeux. Un précipité est un solide.', code: 'notion' },
    { t: 'Un liquide qui change de couleur', msg: 'Le précipité est un solide, souvent coloré, qui se forme dans la solution.', code: 'notion' }],
    why: 'Précipité = petit solide, souvent coloré, qui se forme quand on ajoute le réactif du test.' },
  { level: 1, q: 'Pour savoir si un liquide contient de l’eau, on utilise :', choices: [
    { t: 'Le sulfate de cuivre anhydre, qui devient bleu', ok: true },
    { t: 'L’eau de chaux, qui se trouble', msg: 'L’eau de chaux sert à repérer le dioxyde de carbone.', code: 'testIon' },
    { t: 'La soude, qui donne un précipité vert', msg: 'La soude sert à repérer certains ions métalliques.', code: 'testIon' }],
    why: 'Sulfate de cuivre anhydre : poudre blanche qui bleuit au contact de l’eau.' },
  { level: 1, q: 'L’eau de chaux se trouble en présence de :', choices: [
    { t: 'Dioxyde de carbone', ok: true },
    { t: 'Dioxygène', msg: 'Le dioxygène se repère avec une bûchette incandescente qui se rallume.', code: 'testIon' },
    { t: 'Eau', msg: 'L’eau se repère avec le sulfate de cuivre anhydre.', code: 'testIon' }],
    why: 'CO₂ + eau de chaux → trouble blanc. C’est ainsi qu’on prouve qu’une combustion produit du CO₂.' },
  { level: 2, q: 'On approche une flamme d’un tube rempli de gaz : on entend une petite détonation. Ce gaz est :', choices: [
    { t: 'Du dihydrogène', ok: true },
    { t: 'Du dioxygène', msg: 'Le dioxygène ravive une bûchette incandescente, sans détonation.', code: 'testIon' },
    { t: 'Du dioxyde de carbone', msg: 'Le CO₂ éteint plutôt la flamme ; on le repère à l’eau de chaux.', code: 'testIon' }],
    why: 'Dihydrogène → petite détonation (« pop ») à la flamme.' },
  { level: 2, q: 'Pour savoir si une eau contient des ions chlorure Cl⁻, on ajoute :', choices: [
    { t: 'Du nitrate d’argent', ok: true },
    { t: 'De la soude', msg: 'La soude repère des ions métalliques (Cu²⁺, Fe²⁺, Fe³⁺…), pas Cl⁻.', code: 'testIon' },
    { t: 'De l’eau de chaux', msg: 'L’eau de chaux sert pour le dioxyde de carbone.', code: 'testIon' }],
    why: 'Nitrate d’argent + Cl⁻ → précipité blanc qui noircit à la lumière.' },
  { level: 3, q: 'Une solution donne un précipité blanc avec la soude. Que peut-on dire ?', choices: [
    { t: 'Elle contient des ions Al³⁺ ou Zn²⁺ (il faut un autre test pour trancher)', ok: true },
    { t: 'Elle contient forcément des ions Cl⁻', msg: 'Cl⁻ se repère au nitrate d’argent, pas à la soude.', code: 'testIon' },
    { t: 'Elle contient des ions Fe³⁺', msg: 'Fe³⁺ donne un précipité orange-rouille.', code: 'testIon' }],
    why: 'Avec la soude, Al³⁺ et Zn²⁺ donnent tous les deux un précipité blanc.' },
  { level: 3, q: 'On ajoute de la soude à une solution : rien ne se passe. Conclusion ?', choices: [
    { t: 'Elle ne contient ni Cu²⁺, ni Fe²⁺, ni Fe³⁺, ni Al³⁺, ni Zn²⁺', ok: true },
    { t: 'Elle ne contient aucun ion', msg: 'Elle peut contenir d’autres ions (Na⁺, Cl⁻…) que la soude ne révèle pas.', code: 'testIon' },
    { t: 'Le test est raté', msg: 'Un test négatif est une information : l’ion cherché est absent.', code: 'notion' }],
    why: 'Pas de précipité → les ions qui réagissent avec la soude sont absents. Les autres restent possibles.' },
  { level: 3, q: 'La solution de « sulfate de cuivre » est bleue. Avec la soude elle donnera un précipité :', choices: [
    { t: 'Bleu, car elle contient des ions Cu²⁺', ok: true },
    { t: 'Vert, car elle contient des ions sulfate', msg: 'C’est l’ion cuivre Cu²⁺ qui réagit avec la soude : précipité bleu.', code: 'testIon' },
    { t: 'Blanc qui noircit', msg: 'Ça, c’est Cl⁻ avec le nitrate d’argent.', code: 'testIon' }],
    why: 'Sulfate de cuivre = ions Cu²⁺ et SO₄²⁻. Cu²⁺ + soude → précipité bleu.' },
];

function genK9(level) {
  const r = Math.random();
  const bank = (lv) => qcmFrom('K9', pickFresh(K9_BANK.filter((b) => b.level === lv)));
  if (level === 1) {
    if (r < 0.4) return bank(1);
    const [ion, name, reac, col] = pick(TESTS);
    const others = shuffle(TESTS.filter((t) => t[3] !== col && t[0] !== 'Zn²⁺')).slice(0, 2);
    return qcmFrom('K9', { level, q: `On ajoute quelques gouttes de <b>${reac}</b> à une solution qui contient des ${name}s <b>${ion}</b>. Le précipité obtenu est :`,
      choices: [{ t: col[0].toUpperCase() + col.slice(1), ok: true }, ...others.map((o) => ({ t: o[3][0].toUpperCase() + o[3].slice(1), msg: `${o[3]} : c’est le test de ${o[0]}.`, code: 'testIon' }))],
      why: `${ion} + ${reac} → précipité ${col}.` });
  }
  if (level === 2) {
    if (r < 0.4) return bank(2);
    const [ion, name, reac, col] = pick(TESTS.filter((t) => t[3] !== 'blanc'));
    const others = shuffle(TESTS.filter((t) => t[0] !== ion && t[3] !== 'blanc')).slice(0, 2);
    return qcmFrom('K9', { level, q: `Avec le <b>${reac}</b>, une solution donne un précipité <b>${col}</b>. Elle contient :`,
      choices: [{ t: `Des ${name}s ${ion}`, ok: true }, ...others.map((o) => ({ t: `Des ${o[1]}s ${o[0]}`, msg: `${o[0]} donne un précipité ${o[3]}${o[2] !== reac ? ` avec le ${o[2]}` : ''}.`, code: 'testIon' }))],
      why: `Précipité ${col} avec le ${reac} → ${ion}.` });
  }
  if (r < 0.5) return bank(3);
  const salts = [['chlorure de cuivre', 'Cu²⁺', 'Cl⁻', 'bleu'], ['chlorure de fer III', 'Fe³⁺', 'Cl⁻', 'orange-rouille'], ['chlorure de zinc', 'Zn²⁺', 'Cl⁻', 'blanc'], ['sulfate de fer II', 'Fe²⁺', null, 'vert'], ['sulfate de cuivre', 'Cu²⁺', null, 'bleu']];
  const [sname, cat, an, col] = pick(salts);
  const chloreTxt = an ? 'un précipité blanc qui noircit' : 'rien du tout';
  return qcmFrom('K9', { level, q: `Test 1 : avec la soude, précipité <b>${col}</b>. Test 2 : avec le nitrate d’argent, <b>${chloreTxt}</b>. La solution est probablement :`,
    choices: shuffle(salts.filter((s) => s[0] !== sname)).slice(0, 2).map((s) => ({ t: `Du ${s[0]}`, msg: `Le ${s[0]} contient ${s[1]} (précipité ${s[3]} avec la soude) ${s[2] ? 'et Cl⁻ (le nitrate d’argent réagirait)' : 'et pas de Cl⁻ (le nitrate d’argent ne donnerait rien)'}.`, code: 'testIon' })).concat([{ t: `Du ${sname}`, ok: true }]),
    why: `Précipité ${col} → ${cat}. ${an ? 'Le nitrate d’argent réagit → Cl⁻ présent.' : 'Le nitrate d’argent ne réagit pas → pas de Cl⁻.'} D’où : ${sname}.` });
}

Object.assign(GENERATORS, { K8: genK8, K9: genK9 });

/* ---------- Leçon C7 ---------- */
Object.assign(SVG, {
  reaction: `
  <svg viewBox="0 0 330 120" class="svg" role="img" aria-label="Une molécule de méthane et deux de dioxygène donnent une molécule de dioxyde de carbone et deux d’eau : les atomes sont les mêmes, réarrangés">
    <circle cx="30" cy="50" r="12" class="s-line" fill="none"/><text x="30" y="54" class="s-txt" text-anchor="middle">C</text>
    <circle cx="14" cy="36" r="6" class="s-r2"/><circle cx="46" cy="36" r="6" class="s-r2"/><circle cx="14" cy="64" r="6" class="s-r2"/><circle cx="46" cy="64" r="6" class="s-r2"/>
    <text x="64" y="55" class="s-big" text-anchor="middle">+</text>
    <circle cx="88" cy="38" r="9" class="s-r1"/><circle cx="104" cy="38" r="9" class="s-r1"/>
    <circle cx="88" cy="66" r="9" class="s-r1"/><circle cx="104" cy="66" r="9" class="s-r1"/>
    <path d="M125 52 H175" class="s-line arrow" marker-end="url(#ah7)"/>
    <circle cx="200" cy="38" r="9" class="s-r1"/><circle cx="218" cy="38" r="11" class="s-line" fill="none"/><text x="218" y="42" class="s-txt" text-anchor="middle">C</text><circle cx="236" cy="38" r="9" class="s-r1"/>
    <text x="256" y="55" class="s-big" text-anchor="middle">+</text>
    <circle cx="290" cy="38" r="9" class="s-r1"/><circle cx="278" cy="28" r="6" class="s-r2"/><circle cx="302" cy="28" r="6" class="s-r2"/>
    <circle cx="290" cy="74" r="9" class="s-r1"/><circle cx="278" cy="64" r="6" class="s-r2"/><circle cx="302" cy="64" r="6" class="s-r2"/>
    <text x="45" y="108" class="s-txt" text-anchor="middle">CH₄</text><text x="96" y="108" class="s-txt" text-anchor="middle">2 O₂</text>
    <text x="218" y="108" class="s-txt" text-anchor="middle">CO₂</text><text x="290" y="108" class="s-txt" text-anchor="middle">2 H₂O</text>
    <defs><marker id="ah7" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`,
});

COURS.push({
  id: 'C7', subj: 'chimie', chap: 'Chimie — Les réactions', title: 'Les transformations chimiques', icon: '🔥',
  cahier: 'les pages « Transformations chimiques » et « Ions » de ton livre de chimie.',
  skills: ['K8', 'K9'],
  sections: [
    { title: 'Physique ou chimique ?',
      html: `<p>Quand la glace fond ou que le sucre se dissout dans le thé, la matière change d’aspect, mais <b>ce sont toujours les mêmes espèces</b> : de l’eau, du sucre. C’est une <b>transformation physique</b>.</p>
        <p>Quand le gaz brûle dans la cuisinière, le gaz et une partie de l’air <b>disparaissent</b> et de <b>nouvelles espèces apparaissent</b> (dioxyde de carbone, vapeur d’eau). C’est une <b>transformation chimique</b>, qu’on appelle aussi une réaction chimique.</p>
        <div class="ex"><b>Indices d’une transformation chimique :</b> un gaz se forme, une couleur change, de la chaleur ou une flamme apparaît, un solide se forme… et surtout, un test prouve qu’une nouvelle espèce est là.</div>`,
      retenir: 'Transformation chimique : des espèces disparaissent et d’autres apparaissent. Fondre ou dissoudre n’en est pas une.',
      quiz: [{ q: 'Le chocolat qui fond au soleil, c’est :', choices: [{ t: 'Une transformation physique', ok: true }, { t: 'Une transformation chimique', msg: 'C’est toujours du chocolat, juste liquide : changement d’état, donc physique.' }] }] },
    { title: 'Réactifs et produits',
      html: `<p>Les espèces présentes au départ, qui sont consommées, sont les <b>réactifs</b>. Celles qui sont formées sont les <b>produits</b>.</p>
        <p>On résume la transformation par un <b>bilan</b> : les réactifs à gauche, une flèche, les produits à droite. La flèche se lit « donnent ».</p>
        <div class="formula">méthane + dioxygène → dioxyde de carbone + eau</div>
        <p>Le méthane est le gaz de la cuisinière et de la chaudière ; le dioxygène vient de l’air.</p>`,
      retenir: 'Réactifs (à gauche, consommés) → produits (à droite, formés).',
      quiz: [{ q: 'Dans « carbone + dioxygène → dioxyde de carbone », le carbone est :', choices: [{ t: 'Un réactif', ok: true }, { t: 'Un produit', msg: 'Il est à gauche de la flèche : il est consommé, c’est un réactif.' }] }] },
    { title: 'Ce qui se conserve',
      html: `<p>Pendant la réaction, les molécules des réactifs se cassent et leurs atomes <b>se réarrangent</b> pour former les molécules des produits. On retrouve exactement les mêmes atomes au début et à la fin.</p>
        ${SVG.reaction}
        <ul><li>Les <b>atomes</b> se conservent : même nombre de chaque sorte.</li>
        <li>Les <b>molécules</b> ne se conservent pas : ce ne sont plus les mêmes.</li>
        <li>La <b>masse totale</b> se conserve.</li></ul>
        <div class="formula">masse des réactifs = masse des produits</div>
        <div class="ex"><b>Exemple :</b> 8 g de méthane brûlent avec 32 g de dioxygène et forment 18 g d’eau. Masse de dioxyde de carbone : 8 + 32 − 18 = <b>22 g</b>.</div>`,
      retenir: 'Les atomes et la masse totale se conservent ; les molécules, non. Masse des réactifs = masse des produits.',
      quiz: [{ q: 'Pendant une réaction, il y a conservation…', choices: [{ t: 'des atomes', ok: true }, { t: 'des molécules', msg: 'Les molécules changent ; ce sont les atomes qui se conservent.' }] }] },
    { title: 'Écrire une équation',
      html: `<p>L’<b>équation de réaction</b> est le bilan écrit avec des formules : CH₄ + O₂ → CO₂ + H₂O. Mais attention : il faut qu’il y ait <b>autant d’atomes de chaque sorte à gauche et à droite</b>. On dit alors que l’équation est <b>ajustée</b>.</p>
        <p>Comptons : à gauche 4 H, à droite 2 H. Ça ne va pas ! On ajoute des nombres <b>devant</b> les formules (les coefficients) :</p>
        <div class="formula">CH₄ + 2 O₂ → CO₂ + 2 H₂O</div>
        <table class="tbl c"><tr><th>Atome</th><th>À gauche</th><th>À droite</th></tr>
          <tr><td>C</td><td>1</td><td>1</td></tr><tr><td>H</td><td>4</td><td>2 × 2 = 4</td></tr><tr><td>O</td><td>2 × 2 = 4</td><td>2 + 2 × 1 = 4</td></tr></table>
        <p><b>Grand chiffre devant</b> = nombre de molécules. <b>Petit chiffre en bas</b> = nombre d’atomes dans la molécule. On ajuste avec les grands chiffres ; on ne touche <b>jamais</b> aux petits, sinon on change de molécule.</p>
        <p>⚠️ Dans un QCM, l’équation <b>sans</b> coefficients (CH₄ + O₂ → CO₂ + H₂O) est un piège classique : elle a les bonnes molécules mais elle n’est pas ajustée.</p>`,
      retenir: 'Équation ajustée = même nombre d’atomes de chaque sorte des deux côtés. On ajuste avec les nombres devant les formules, jamais avec les petits chiffres.',
      quiz: [{ q: 'Combien d’atomes H dans « 2 H₂O » ?', choices: [{ t: '4', ok: true }, { t: '2', msg: '2 molécules × 2 H = 4 H.' }, { t: '3', msg: 'On multiplie : 2 × 2 = 4.' }] },
             { q: 'Quelle équation est ajustée ?', choices: [{ t: '2 H₂ + O₂ → 2 H₂O', ok: true }, { t: 'H₂ + O₂ → H₂O', msg: 'O : 2 à gauche, 1 à droite. Il manque des coefficients.' }] }] },
    { title: 'Les combustions',
      html: `<p>Une <b>combustion</b> est une transformation chimique entre un <b>combustible</b> (bois, gaz, essence, bougie…) et le <b>dioxygène</b> de l’air. Elle libère de la chaleur.</p>
        <p>L’air contient environ <b>78 % de diazote</b>, <b>21 % de dioxygène</b> et 1 % d’autres gaz. Seul le dioxygène participe à la combustion.</p>
        <ul><li><b>Combustion complète</b> (assez de dioxygène) : il se forme du dioxyde de carbone et de l’eau.</li>
        <li><b>Combustion incomplète</b> (pas assez de dioxygène : appareil mal entretenu, pièce mal aérée) : il se forme en plus du <b>carbone</b> (la suie noire) et du <b>monoxyde de carbone CO</b>.</li></ul>
        <div class="formula">C + O₂ → CO₂  •  CH₄ + 2 O₂ → CO₂ + 2 H₂O</div>`,
      retenir: 'Combustion = combustible + dioxygène. Complète : CO₂ + eau. Incomplète : en plus de la suie (carbone) et du monoxyde de carbone (CO).' },
    { title: 'Le monoxyde de carbone, un gaz dangereux',
      html: `<p>Le monoxyde de carbone (CO) est <b>invisible et sans odeur</b> : on ne peut pas le détecter seul. Respiré, il prend la place du dioxygène dans le sang, qui n’en apporte plus assez aux organes. Premiers signes : maux de tête, nausées, fatigue. À forte dose, il peut tuer.</p>
        <p><b>Se protéger :</b> aérer chaque jour, faire vérifier chaque année la chaudière et les chauffages, ne jamais utiliser un barbecue ou un groupe électrogène à l’intérieur, installer un <b>détecteur</b>.</p>
        <p>On mesure les faibles quantités de gaz en <b>ppm</b> (parties par million) :</p>
        <div class="formula">1 % = 10 000 ppm  •  0,01 % = 100 ppm</div>
        <div class="ex"><b>Calculer un pourcentage :</b> une pièce de 4 m × 5 m × 2,5 m a un volume de 50 m³, soit 50 000 L. Si 10 L de CO s’y répandent : 10 ÷ 50 000 × 100 = 0,02 %, soit 200 ppm.</div>`,
      retenir: 'CO : invisible, sans odeur, toxique. Aérer, entretenir, détecteur. 1 % = 10 000 ppm ; 1 m³ = 1 000 L.',
      quiz: [{ q: '0,03 % de CO, cela fait :', choices: [{ t: '300 ppm', ok: true }, { t: '30 ppm', msg: '0,03 × 10 000 = 300.' }, { t: '3 000 ppm', msg: '0,03 × 10 000 = 300, pas 3 000.' }] }] },
    { title: 'Reconnaître des ions',
      html: `<p>Une eau minérale, une solution de laboratoire contiennent des <b>ions</b> invisibles. Pour savoir lesquels, on fait un <b>test</b> : on verse quelques gouttes d’un réactif. S’il se forme un <b>précipité</b> (un petit solide) d’une couleur précise, l’ion est présent.</p>
        <table class="tbl c"><tr><th>Ion</th><th>Réactif</th><th>Précipité</th></tr>
          <tr><td>Cu²⁺ (cuivre II)</td><td>soude</td><td>🔵 bleu</td></tr>
          <tr><td>Fe²⁺ (fer II)</td><td>soude</td><td>🟢 vert</td></tr>
          <tr><td>Fe³⁺ (fer III)</td><td>soude</td><td>🟠 orange-rouille</td></tr>
          <tr><td>Al³⁺, Zn²⁺</td><td>soude</td><td>⚪ blanc</td></tr>
          <tr><td>Cl⁻ (chlorure)</td><td>nitrate d’argent</td><td>⚪ blanc qui noircit à la lumière</td></tr></table>
        <p>La soude est une solution d’hydroxyde de sodium (ions Na⁺ et HO⁻). Pour rédiger : « J’ajoute quelques gouttes de soude. J’observe un précipité bleu. J’en conclus que la solution contient des ions Cu²⁺. »</p>`,
      retenir: 'Soude : Cu²⁺ bleu, Fe²⁺ vert, Fe³⁺ orange-rouille, Al³⁺ et Zn²⁺ blanc. Nitrate d’argent : Cl⁻ blanc qui noircit.',
      quiz: [{ q: 'Précipité vert avec la soude : la solution contient…', choices: [{ t: 'des ions Fe²⁺', ok: true }, { t: 'des ions Fe³⁺', msg: 'Fe³⁺ donne un précipité orange-rouille.' }, { t: 'des ions Cu²⁺', msg: 'Cu²⁺ donne un précipité bleu.' }] }] },
    { title: 'Reconnaître les produits d’une combustion',
      html: `<p>Pour <b>prouver</b> qu’une combustion a formé de l’eau et du dioxyde de carbone, on utilise d’autres tests :</p>
        <table class="tbl"><tr><th>Espèce</th><th>Test</th></tr>
          <tr><td>Eau</td><td>Le sulfate de cuivre anhydre (poudre blanche) devient <b>bleu</b>.</td></tr>
          <tr><td>Dioxyde de carbone</td><td>L’eau de chaux se <b>trouble</b> (devient blanche et laiteuse).</td></tr>
          <tr><td>Dioxygène</td><td>Une bûchette incandescente se <b>rallume</b>.</td></tr>
          <tr><td>Dihydrogène</td><td>Petite <b>détonation</b> à l’approche d’une flamme.</td></tr></table>
        <div class="ex"><b>Exemple :</b> on retourne un verre froid au-dessus d’une bougie : de la buée apparaît et bleuit le sulfate de cuivre anhydre → de l’eau s’est formée. On verse ensuite de l’eau de chaux dans le verre : elle se trouble → du CO₂ s’est formé.</div>`,
      retenir: 'Eau : sulfate de cuivre anhydre bleuit. CO₂ : eau de chaux se trouble. O₂ : bûchette rallumée. H₂ : détonation.' },
  ],
  exos: [
    { title: 'Bilan de la combustion du méthane', enonce: 'Le méthane brûle dans le dioxygène et forme du dioxyde de carbone et de l’eau. Nomme les réactifs, les produits, et écris le bilan.',
      steps: ['Réactifs (consommés) : méthane et dioxygène.', 'Produits (formés) : dioxyde de carbone et eau.', 'Bilan : méthane + dioxygène → dioxyde de carbone + eau.'], rep: 'méthane + dioxygène → dioxyde de carbone + eau' },
    { title: 'Ajuster l’équation du méthane', enonce: 'L’équation CH₄ + O₂ → CO₂ + H₂O est-elle ajustée ? Sinon, ajuste-la.',
      steps: ['Compte à gauche : 1 C, 4 H, 2 O. À droite : 1 C, 2 H, 3 O. Elle n’est pas ajustée.', 'Pour les H : 2 H₂O à droite (4 H).', 'Pour les O : à droite 2 + 2 = 4, donc 2 O₂ à gauche.'], rep: 'CH₄ + 2 O₂ → CO₂ + 2 H₂O', piege: 'Cocher l’équation sans coefficients parce qu’elle contient « les bonnes molécules ».' },
    { title: 'Masse de dioxyde de carbone', enonce: '16 g de méthane brûlent complètement avec 64 g de dioxygène. Il se forme 36 g d’eau. Quelle masse de dioxyde de carbone se forme-t-il ?', ans: 44, unit: 'g',
      steps: ['📐 La masse se conserve : m(méthane) + m(dioxygène) = m(dioxyde de carbone) + m(eau).', '🧮 m(dioxyde de carbone) = 16 + 64 − 36 = 44 g.'], rep: 'Il se forme 44 g de dioxyde de carbone.', piege: 'Ajouter la masse d’eau au lieu de la retirer.' },
    { title: 'La combustion du carbone', enonce: 'Le charbon de bois (carbone) brûle dans le dioxygène et forme du dioxyde de carbone. Écris l’équation, puis calcule la masse de CO₂ formée avec 36 g de carbone et 96 g de dioxygène.', ans: 132, unit: 'g',
      steps: ['Équation : C + O₂ → CO₂ (1 C et 2 O de chaque côté : déjà ajustée).', '🧮 Un seul produit : m(CO₂) = 36 + 96 = 132 g.'], rep: 'C + O₂ → CO₂ ; il se forme 132 g de dioxyde de carbone.' },
    { title: 'Ajuster une autre équation', enonce: 'Le dihydrogène brûle dans le dioxygène et forme de l’eau : H₂ + O₂ → H₂O. Ajuste cette équation.',
      steps: ['O : 2 à gauche, 1 à droite → on met 2 devant H₂O.', 'H : à droite 2 × 2 = 4 → on met 2 devant H₂.', 'Vérification : 4 H et 2 O de chaque côté.'], rep: '2 H₂ + O₂ → 2 H₂O' },
    { title: 'Décrire une molécule', enonce: 'L’aspirine a pour formule C₉H₈O₄. Donne sa composition et son nombre total d’atomes.', ans: 21, unit: 'atomes',
      steps: ['9 atomes de carbone, 8 atomes d’hydrogène, 4 atomes d’oxygène.', '🧮 9 + 8 + 4 = 21 atomes.'], rep: 'La molécule d’aspirine contient 9 C, 8 H et 4 O, soit 21 atomes.' },
    { title: 'Du CO dans un garage', enonce: 'Un garage mesure 6 m × 4 m × 2,5 m. Un moteur qui tourne y rejette 18 L de monoxyde de carbone. Calcule le pourcentage de CO dans l’air, puis convertis-le en ppm. Données : 1 m³ = 1 000 L ; 1 % = 10 000 ppm ; maux de tête à partir d’environ 200 ppm.', ans: 300, unit: 'ppm',
      steps: ['🔁 V = 6 × 4 × 2,5 = 60 m³ = 60 000 L.', '🧮 18 ÷ 60 000 × 100 = 0,03 %.', '🧮 0,03 × 10 000 = 300 ppm.'], rep: 'L’air contient 0,03 % de CO, soit 300 ppm : c’est dangereux (au-dessus de 200 ppm). Il faut couper le moteur et aérer.', piege: 'Diviser 18 L par 60 m³ sans convertir les m³ en litres.' },
    { title: 'Identifier un ion', enonce: 'On ajoute de la soude à une solution inconnue : un précipité orange-rouille apparaît. Que contient la solution ? Rédige.',
      steps: ['J’ajoute quelques gouttes de soude.', 'J’observe un précipité orange-rouille.', 'J’en conclus que la solution contient des ions fer III, Fe³⁺.'], rep: 'La solution contient des ions Fe³⁺.' },
    { title: 'Deux tests sur une eau', enonce: 'Une solution donne un précipité bleu avec la soude et un précipité blanc qui noircit avec le nitrate d’argent. Quels ions contient-elle ? Quel nom peut-on lui donner ?',
      steps: ['Précipité bleu avec la soude → ions cuivre II Cu²⁺.', 'Précipité blanc qui noircit avec le nitrate d’argent → ions chlorure Cl⁻.'], rep: 'Elle contient des ions Cu²⁺ et Cl⁻ : c’est une solution de chlorure de cuivre.' },
  ],
});

/* ---------- Accroches qui ont besoin d'app.js ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof COPY_TYPES !== 'undefined') COPY_TYPES.push(
    ['Chimie : équation non ajustée', 'K8', 'ajuste'],
    ['Chimie : coefficient et petit chiffre confondus', 'K8', 'coefIndice'],
    ['Chimie : conservation de la masse oubliée', 'K8', 'masseConso'],
    ['Chimie : réactifs et produits confondus', 'K8', 'reacProd'],
    ['Chimie : test d’ion ou de gaz faux', 'K9', 'testIon'],
  );
  if (typeof ERR_ADVICE !== 'undefined') Object.assign(ERR_ADVICE, {
    ajuste: 'compter les atomes de chaque sorte à gauche puis à droite : il en faut autant.',
    coefIndice: 'le grand chiffre devant compte les molécules, le petit en bas compte les atomes : 2 H₂O = 4 H et 2 O.',
    masseConso: 'rien ne disparaît : masse des réactifs = masse des produits.',
    reacProd: 'à gauche de la flèche les réactifs (consommés), à droite les produits (formés).',
    testIon: 'relire ensemble le tableau des tests : soude pour les ions métalliques, nitrate d’argent pour Cl⁻.',
  });
});
