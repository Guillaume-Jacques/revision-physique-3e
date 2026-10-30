/* =========================================================
   Chimie — module 3 « pH, acides et bases » (30/10/2026), leçon d'avance
   - Compétence K10 (pH, acides, bases, dilution, réaction acide-métal)
   - Leçon C8, exercices corrigés, générateur, erreurs ciblées, copies « Bats ta note »
   Textes rédigés pour l'appli, sans recopie de manuel.
   Chargé après chimie2.js et avant app.js.
   ========================================================= */

SKILLS.push({ id: 'K10', subj: 'chimie', ref: 'MAT-12/13', name: 'pH, acides et bases', short: 'pH', icon: '🍋', lesson: 'C8' });

Object.assign(ERR_LABELS, {
  phSens: 'Croit qu’un pH bas veut dire « peu acide »',
  dilution: 'Se trompe sur l’effet d’une dilution sur le pH',
});

FICHES.K10 = {
  title: 'pH, acides et bases',
  points: [
    'Le pH va de 0 à 14. <b>pH &lt; 7 : acide</b> ; <b>pH = 7 : neutre</b> ; <b>pH &gt; 7 : basique</b>.',
    'Plus le pH est <b>bas</b>, plus la solution est <b>acide</b>. Plus il est haut, plus elle est basique.',
    'Acide : plus d’ions H⁺ que d’ions HO⁻. Basique : plus d’ions HO⁻ que d’ions H⁺. Neutre : autant des deux.',
    'Diluer (ajouter de l’eau) rapproche le pH de 7, sans jamais le dépasser.',
    'Acide + fer → dihydrogène (petite détonation) + ions Fe²⁺ (précipité vert avec la soude).',
  ],
  formula: 'acide  < 7 <  basique',
  piege: 'pH 2 est PLUS acide que pH 5 : on lit le pH « à l’envers ».',
};
CARDS.K10 = { title: 'pH', body: '< 7 acide • 7 neutre • > 7 basique<br>pH bas = très acide<br>Diluer → pH vers 7' };

const PH_EX = [
  ['le jus de citron', 2.4], ['le vinaigre', 3], ['un soda au cola', 2.5], ['le jus d’orange', 3.8], ['le café', 5], ['le lait', 6.7],
  ['l’eau pure', 7], ['le sang', 7.4], ['l’eau de mer', 8.2], ['le bicarbonate dans l’eau', 8.5], ['l’eau savonneuse', 10], ['l’eau de Javel', 12], ['un déboucheur de canalisations', 13.5],
];
const phKind = (p) => (p < 7 ? 'acide' : p > 7 ? 'basique' : 'neutre');

const K10_BANK = [
  { level: 1, q: 'Avec quel instrument mesure-t-on précisément un pH ?', choices: [
    { t: 'Un pH-mètre (ou, moins précis, du papier pH)', ok: true },
    { t: 'Un thermomètre', msg: 'Le thermomètre mesure la température.', code: 'notion' },
    { t: 'Un voltmètre', msg: 'Le voltmètre mesure une tension électrique.', code: 'notion' }],
    why: 'Le papier pH change de couleur (on lit sur une échelle) ; le pH-mètre affiche la valeur.' },
  { level: 1, q: 'Une solution neutre a un pH égal à :', choices: [
    { t: '7', ok: true }, { t: '0', msg: 'pH 0 : très acide.', code: 'phSens' }, { t: '14', msg: 'pH 14 : très basique.', code: 'phSens' }],
    why: 'Neutre = 7, au milieu de l’échelle de 0 à 14.' },
  { level: 1, q: 'Quelle précaution prendre pour manipuler un acide ou une base concentrés ?', choices: [
    { t: 'Porter des lunettes et des gants', ok: true },
    { t: 'Goûter pour vérifier', msg: 'Jamais ! Au laboratoire, on ne goûte rien.', code: 'notion' },
    { t: 'Aucune, ce sont des liquides', msg: 'Acides et bases concentrés sont corrosifs : ils brûlent la peau et les yeux.', code: 'notion' }],
    why: 'Pictogramme « corrosif » : lunettes, gants, blouse. Et on verse toujours l’acide dans l’eau, pas l’inverse.' },
  { level: 2, q: 'Une solution acide contient :', choices: [
    { t: 'Plus d’ions H⁺ que d’ions HO⁻', ok: true },
    { t: 'Plus d’ions HO⁻ que d’ions H⁺', msg: 'Ça, c’est une solution basique.', code: 'phSens' },
    { t: 'Aucun ion', msg: 'Une solution acide contient des ions, surtout des H⁺.', code: 'notion' }],
    why: 'Acide : les ions H⁺ dominent. Basique : les ions HO⁻ dominent. Neutre : autant des deux.' },
  { level: 2, q: 'Plus une solution contient d’ions H⁺, plus son pH est :', choices: [
    { t: 'Bas (proche de 0)', ok: true },
    { t: 'Haut (proche de 14)', msg: 'Le pH varie « à l’envers » : beaucoup de H⁺, pH bas.', code: 'phSens' },
    { t: 'Égal à 7', msg: '7, c’est quand H⁺ et HO⁻ sont en même quantité.', code: 'phSens' }],
    why: 'Beaucoup d’ions H⁺ → très acide → pH bas.' },
  { level: 3, q: 'On verse de l’acide chlorhydrique sur de la paille de fer. Des bulles se forment. Quel test fait-on sur ce gaz ?', choices: [
    { t: 'Une flamme : petite détonation, c’est du dihydrogène', ok: true },
    { t: 'L’eau de chaux : elle se trouble', msg: 'L’eau de chaux sert au CO₂. Ici, c’est du dihydrogène.', code: 'testIon' },
    { t: 'Une bûchette incandescente qui se rallume', msg: 'Ça, c’est le test du dioxygène.', code: 'testIon' }],
    why: 'Acide + fer → dihydrogène (petite détonation) + ions fer II.' },
  { level: 3, q: 'Après la réaction de l’acide sur le fer, on ajoute de la soude à la solution : précipité vert. Que s’est-il formé ?', choices: [
    { t: 'Des ions fer II, Fe²⁺', ok: true },
    { t: 'Des ions cuivre Cu²⁺', msg: 'Cu²⁺ donne un précipité bleu, et il n’y avait pas de cuivre.', code: 'testIon' },
    { t: 'Des ions chlorure Cl⁻', msg: 'Cl⁻ se repère au nitrate d’argent, pas à la soude.', code: 'testIon' }],
    why: 'Le fer est « rongé » par l’acide : les atomes de fer deviennent des ions Fe²⁺ (précipité vert).' },
  { level: 3, q: 'Pendant la réaction entre un acide et le fer, le pH de la solution :', choices: [
    { t: 'Augmente, car des ions H⁺ sont consommés', ok: true },
    { t: 'Diminue', msg: 'Les ions H⁺ sont consommés : il y en a moins, donc le pH monte.', code: 'phSens' },
    { t: 'Ne change pas', msg: 'Les ions H⁺ réagissent (ils forment le dihydrogène) : le pH change.', code: 'phSens' }],
    why: 'Les H⁺ se transforment en dihydrogène H₂ : moins de H⁺, le pH augmente.' },
  { level: 3, q: 'Pourquoi ne faut-il pas stocker un acide dans un récipient en fer ou en zinc ?', choices: [
    { t: 'L’acide attaque ces métaux (corrosion)', ok: true },
    { t: 'Le fer rend l’acide basique', msg: 'Le problème, c’est que l’acide ronge le métal.', code: 'notion' },
    { t: 'Il n’y a aucun problème', msg: 'L’acide réagit avec le fer : le récipient serait rongé et percé.', code: 'notion' }],
    why: 'Acide + métal → le métal est rongé (corrosion) et du dihydrogène se dégage.' },
];

function genK10(level) {
  const r = Math.random(), bank = (lv) => qcmFrom('K10', pickFresh(K10_BANK.filter((b) => b.level === lv)));
  if (level === 1) {
    if (r < 0.3) return bank(1);
    const [name, ph] = pick(PH_EX), k = phKind(ph);
    return qcmFrom('K10', { level, q: `Le pH de ${name} vaut environ <b>${fr(ph, 1)}</b>. Cette solution est :`, choices: [
      { t: k[0].toUpperCase() + k.slice(1), ok: true },
      ...['acide', 'neutre', 'basique'].filter((x) => x !== k).map((x) => ({ t: x[0].toUpperCase() + x.slice(1), msg: `pH < 7 : acide ; pH = 7 : neutre ; pH > 7 : basique. Ici ${fr(ph, 1)}.`, code: 'phSens' }))],
      why: `${fr(ph, 1)} ${ph < 7 ? '< 7 : acide' : ph > 7 ? '> 7 : basique' : '= 7 : neutre'}.` });
  }
  if (level === 2) {
    if (r < 0.3) return bank(2);
    if (r < 0.65) {
      const acid = Math.random() < 0.6, pool = shuffle(PH_EX.filter(([, p]) => (acid ? p < 7 : p > 7)));
      const three = pool.slice(0, 3).filter((x, i, a) => a.findIndex((y) => y[1] === x[1]) === i);
      if (three.length < 3) return bank(2);
      const best = three.slice().sort((a, b) => (acid ? a[1] - b[1] : b[1] - a[1]))[0];
      return qcmFrom('K10', { level, q: `Laquelle de ces solutions est la plus <b>${acid ? 'acide' : 'basique'}</b> ? ${three.map(([n, p]) => `${n} (pH ${fr(p, 1)})`).join(' ; ')}.`,
        choices: three.map(([n, p]) => (n === best[0] ? { t: n[0].toUpperCase() + n.slice(1), ok: true } : { t: n[0].toUpperCase() + n.slice(1), msg: acid ? 'Plus acide = pH plus BAS.' : 'Plus basique = pH plus HAUT.', code: 'phSens' })),
        why: acid ? `La plus acide a le pH le plus bas : ${fr(best[1], 1)}.` : `La plus basique a le pH le plus haut : ${fr(best[1], 1)}.` });
    }
    const acid = Math.random() < 0.6, ph = acid ? pick([2, 2.5, 3, 4]) : pick([10, 11, 12, 13]);
    const good = acid ? ph + pick([1, 1.5, 2]) : ph - pick([1, 1.5, 2]);
    return qcmFrom('K10', { level, q: `On ajoute beaucoup d’eau à une solution de pH <b>${fr(ph, 1)}</b>. Quel pH peut-on mesurer ensuite ?`, choices: [
      { t: fr(good, 1), ok: true },
      { t: fr(acid ? ph - 1 : ph + 1, 1), msg: 'Diluer rend la solution moins acide (ou moins basique) : le pH se rapproche de 7.', code: 'dilution' },
      { t: acid ? '8' : '6', msg: 'En ajoutant de l’eau, on se rapproche de 7 mais on ne passe jamais de l’autre côté.', code: 'dilution' }],
      why: `Diluer rapproche le pH de 7 sans le dépasser : de ${fr(ph, 1)} on passe par exemple à ${fr(good, 1)}.` });
  }
  if (r < 0.5) return bank(3);
  const k = pick(['acide', 'basique', 'neutre']);
  const desc = { acide: 'plus d’ions H⁺ que d’ions HO⁻', basique: 'plus d’ions HO⁻ que d’ions H⁺', neutre: 'autant d’ions H⁺ que d’ions HO⁻' }[k];
  return qcmFrom('K10', { level, q: `Une solution contient <b>${desc}</b>. Son pH est :`, choices: [
    { t: { acide: 'Inférieur à 7', basique: 'Supérieur à 7', neutre: 'Égal à 7' }[k], ok: true },
    ...['acide', 'basique', 'neutre'].filter((x) => x !== k).map((x) => ({ t: { acide: 'Inférieur à 7', basique: 'Supérieur à 7', neutre: 'Égal à 7' }[x], msg: 'H⁺ domine → acide (pH < 7) ; HO⁻ domine → basique (pH > 7) ; autant → neutre (7).', code: 'phSens' }))],
    why: `${desc} → solution ${k}.` });
}
GENERATORS.K10 = genK10;

/* ---------- Leçon C8 ---------- */
SVG.ph = `
  <svg viewBox="0 0 330 96" class="svg" role="img" aria-label="Échelle de pH de 0 à 14 : acide à gauche de 7, neutre à 7, basique à droite">
    <defs><linearGradient id="phg" x1="0" x2="1"><stop offset="0" stop-color="#e5484d"/><stop offset=".3" stop-color="#f5a524"/><stop offset=".5" stop-color="#30a46c"/><stop offset=".75" stop-color="#3e63dd"/><stop offset="1" stop-color="#8e4ec6"/></linearGradient></defs>
    <rect x="15" y="22" width="300" height="18" rx="9" fill="url(#phg)"/>
    <text x="15" y="56" class="s-txt" text-anchor="middle">0</text><text x="165" y="56" class="s-txt" text-anchor="middle">7</text><text x="315" y="56" class="s-txt" text-anchor="middle">14</text>
    <path d="M165 16 V46" class="s-line"/>
    <text x="85" y="14" class="s-txt" text-anchor="middle">ACIDE</text><text x="165" y="76" class="s-txt" text-anchor="middle">neutre</text><text x="245" y="14" class="s-txt" text-anchor="middle">BASIQUE</text>
    <text x="40" y="90" class="s-txt">citron 2</text><text x="128" y="90" class="s-txt">eau 7</text><text x="225" y="90" class="s-txt">Javel 12</text>
  </svg>`;

COURS.push({
  id: 'C8', subj: 'chimie', chap: 'En avance — Acides et bases', title: 'pH, acides et bases', icon: '🍋', ahead: true,
  cahier: 'le prochain chapitre probable de ton livre de chimie (« Ions, pH, propriétés acido-basiques »).',
  skills: ['K10'],
  sections: [
    { title: 'L’échelle de pH',
      html: `<p>Le jus de citron et le vinaigre piquent : ils sont <b>acides</b>. Le savon, glissant au toucher, est <b>basique</b>, tout comme l’eau de Javel (à ne jamais toucher). L’eau pure n’est ni l’un ni l’autre : elle est <b>neutre</b>.</p>
        <p>Pour le dire avec un nombre, on mesure le <b>pH</b>, qui va de 0 à 14 :</p>
        ${SVG.ph}
        <div class="formula">pH &lt; 7 : acide • pH = 7 : neutre • pH &gt; 7 : basique</div>`,
      retenir: 'pH de 0 à 14 : en dessous de 7 acide, 7 neutre, au-dessus de 7 basique.',
      quiz: [{ q: 'Une solution de pH 9 est :', choices: [{ t: 'Basique', ok: true }, { t: 'Acide', msg: '9 > 7 : basique.' }, { t: 'Neutre', msg: 'Neutre, c’est exactement 7.' }] }] },
    { title: 'Lire le pH dans le bon sens',
      html: `<p>Attention, le pH se lit « à l’envers » : <b>plus il est bas, plus la solution est acide</b>. Un soda (pH 2,5) est bien plus acide qu’un café (pH 5).</p>
        <p>De l’autre côté, <b>plus le pH est haut, plus la solution est basique</b> : l’eau de Javel (pH 12) est plus basique que l’eau savonneuse (pH 10).</p>
        <table class="tbl c"><tr><th>Solution</th><th>pH environ</th></tr>
          <tr><td>jus de citron</td><td>2,4</td></tr><tr><td>vinaigre</td><td>3</td></tr><tr><td>lait</td><td>6,7</td></tr><tr><td>eau pure</td><td>7</td></tr>
          <tr><td>sang</td><td>7,4</td></tr><tr><td>eau savonneuse</td><td>10</td></tr><tr><td>eau de Javel</td><td>12</td></tr></table>`,
      retenir: 'Plus le pH est bas, plus c’est acide. Plus il est haut, plus c’est basique.',
      quiz: [{ q: 'Le plus acide est :', choices: [{ t: 'Le vinaigre (pH 3)', ok: true }, { t: 'Le café (pH 5)', msg: 'Plus acide = pH plus bas : 3 < 5.' }] }] },
    { title: 'Mesurer un pH',
      html: `<p>Deux outils :</p>
        <ul><li>le <b>papier pH</b> : on y dépose une goutte avec un agitateur, il prend une couleur qu’on compare à l’échelle de la boîte (rapide mais peu précis) ;</li>
        <li>le <b>pH-mètre</b> : on plonge la sonde, il affiche la valeur, par exemple 3,2 (plus précis).</li></ul>
        <p><b>Sécurité</b> : un acide ou une base concentrés sont <b>corrosifs</b> (pictogramme de la main rongée). Lunettes, gants, blouse. Pour diluer, on verse toujours <b>l’acide dans l’eau</b>, jamais l’eau dans l’acide (risque de projections).</p>`,
      retenir: 'Papier pH (couleur, approximatif) ou pH-mètre (valeur précise). Corrosif : lunettes et gants ; l’acide dans l’eau.' },
    { title: 'Ce que cache le pH : les ions H⁺ et HO⁻',
      html: `<p>Toutes ces solutions contiennent des ions. Deux décident du pH : l’ion <b>hydrogène H⁺</b> et l’ion <b>hydroxyde HO⁻</b>.</p>
        <ul><li>Solution <b>acide</b> : plus d’ions H⁺ que d’ions HO⁻.</li>
        <li>Solution <b>basique</b> : plus d’ions HO⁻ que d’ions H⁺.</li>
        <li>Solution <b>neutre</b> : autant des deux.</li></ul>
        <p>Plus il y a d’ions H⁺, plus le pH est bas. L’acide chlorhydrique contient par exemple des ions H⁺ et Cl⁻ ; la soude contient des ions Na⁺ et HO⁻.</p>`,
      retenir: 'Acide : H⁺ dominent. Basique : HO⁻ dominent. Neutre : autant des deux. Beaucoup de H⁺ = pH bas.',
      quiz: [{ q: 'La soude contient surtout des ions HO⁻. Elle est :', choices: [{ t: 'Basique', ok: true }, { t: 'Acide', msg: 'HO⁻ domine : basique.' }] }] },
    { title: 'Diluer un acide ou une base',
      html: `<p><b>Diluer</b>, c’est ajouter de l’eau. Les ions sont alors plus dispersés : la solution devient <b>moins acide</b> (ou moins basique).</p>
        <ul><li>Un acide dilué : son pH <b>augmente</b> et se rapproche de 7.</li>
        <li>Une base diluée : son pH <b>diminue</b> et se rapproche de 7.</li></ul>
        <div class="ex">Du vinaigre (pH 3) dilué dans beaucoup d’eau peut passer à pH 4 ou 5… mais jamais à 8 : on ne transforme pas un acide en base en ajoutant de l’eau.</div>`,
      retenir: 'Diluer rapproche le pH de 7, sans jamais le dépasser.',
      quiz: [{ q: 'On dilue une solution de pH 12. Son pH peut devenir :', choices: [{ t: '10', ok: true }, { t: '13', msg: 'Diluer rend moins basique : le pH baisse vers 7.' }, { t: '5', msg: 'On ne passe jamais de l’autre côté de 7 en ajoutant de l’eau.' }] }] },
    { title: 'Quand un acide attaque un métal',
      html: `<p>Versons de l’acide chlorhydrique sur de la paille de fer : des <b>bulles</b> apparaissent et le fer disparaît peu à peu. C’est une transformation chimique.</p>
        <ul><li>Le gaz produit fait une petite <b>détonation</b> à la flamme : c’est du <b>dihydrogène H₂</b>.</li>
        <li>On ajoute de la soude au liquide : précipité <b>vert</b> → il s’est formé des <b>ions fer II, Fe²⁺</b>.</li>
        <li>Les ions H⁺ sont consommés : le pH <b>augmente</b>.</li></ul>
        <div class="formula">acide + fer → dihydrogène + ions fer II</div>
        <p>C’est pour cela qu’on ne range pas un acide dans une boîte en fer ou en zinc : le métal serait rongé. C’est une forme de <b>corrosion</b>.</p>`,
      retenir: 'Acide + fer → dihydrogène (détonation) + ions Fe²⁺ (précipité vert avec la soude). Les H⁺ sont consommés, le pH monte.' },
  ],
  exos: [
    { title: 'Classer des solutions', enonce: 'Classe du plus acide au plus basique : eau de Javel (pH 12), jus de citron (pH 2,4), lait (pH 6,7), eau savonneuse (pH 10).',
      steps: ['Plus acide = pH le plus bas.', 'Ordre croissant des pH : 2,4 < 6,7 < 10 < 12.'], rep: 'Jus de citron, lait, eau savonneuse, eau de Javel (le citron et le lait sont acides, les deux autres basiques).' },
    { title: 'Papier pH', enonce: 'Le papier pH devient orange avec un soda : sur l’échelle, cela correspond à pH 3. Que conclure ?',
      steps: ['3 < 7.', 'La solution est donc acide.'], rep: 'Le soda est acide (pH 3 < 7).' },
    { title: 'Dilution', enonce: 'Léo dilue 10 fois une solution d’acide de pH 2. Il mesure ensuite pH 9. Est-ce possible ?',
      steps: ['Diluer un acide fait monter son pH vers 7.', 'Mais le pH ne peut pas dépasser 7 en ajoutant de l’eau.'], rep: 'Non : la mesure est fausse. On s’attend à un pH entre 2 et 7 (environ 3 pour une dilution par 10).', piege: 'Penser que plus on ajoute d’eau, plus le pH monte sans limite.' },
    { title: 'Les ions d’une solution', enonce: 'Une solution contient beaucoup plus d’ions HO⁻ que d’ions H⁺. Est-elle acide, neutre ou basique ? Donne un pH possible.',
      steps: ['HO⁻ domine → solution basique.', 'Basique → pH > 7.'], rep: 'Elle est basique, par exemple pH 11.' },
    { title: 'Acide sur du fer', enonce: 'On verse de l’acide chlorhydrique sur un clou en fer. Quels tests permettent d’identifier le gaz et l’ion formés ?',
      steps: ['Gaz : on approche une flamme → petite détonation → dihydrogène.', 'Liquide : on ajoute de la soude → précipité vert → ions Fe²⁺.'], rep: 'Le gaz est du dihydrogène (détonation) et la solution contient des ions fer II Fe²⁺ (précipité vert).' },
    { title: 'Le pH pendant la réaction', enonce: 'Au début de la réaction de l’acide sur le fer, le pH vaut 1. Une heure plus tard, il vaut 3. Explique.',
      steps: ['Le pH a augmenté : la solution est moins acide.', 'Les ions H⁺ ont été consommés : ils ont formé le dihydrogène.'], rep: 'Des ions H⁺ ont été consommés par la réaction : il en reste moins, le pH augmente.' },
  ],
});

/* Copies à corriger (« Bats ta note ») */
if (typeof CHIM_BAT !== 'undefined') CHIM_BAT.push(
  { skill: 'K10', level: 2, q: '🕵️ Chasse à l’erreur : « Le jus de citron (pH 2,4) est moins acide que le lait (pH 6,7), car 2,4 est plus petit ». Où est l’erreur ?', choices: [
    { t: 'C’est l’inverse : plus le pH est bas, plus c’est acide', ok: true },
    { t: 'Le lait est basique', msg: '6,7 < 7 : le lait est (faiblement) acide.', code: 'phSens' },
    { t: 'Il n’y a pas d’erreur', msg: 'Le pH se lit à l’envers : pH bas = très acide.', code: 'phSens' }],
    why: '2,4 < 6,7 : le citron est plus acide que le lait.' },
  { skill: 'K10', level: 3, q: '🕵️ Chasse à l’erreur : « J’ai dilué du vinaigre (pH 3) : il est maintenant à pH 8 ». Où est l’erreur ?', choices: [
    { t: 'Diluer rapproche de 7 mais ne le dépasse jamais', ok: true },
    { t: 'Diluer fait baisser le pH', msg: 'Pour un acide, diluer fait monter le pH… jusqu’à 7 au maximum.', code: 'dilution' },
    { t: 'Il n’y a pas d’erreur', msg: 'Ajouter de l’eau ne rend pas une solution basique.', code: 'dilution' }],
    why: 'Un acide dilué reste acide : pH entre 3 et 7.' },
);

window.addEventListener('DOMContentLoaded', () => {
  if (typeof COPY_TYPES !== 'undefined') COPY_TYPES.push(['Chimie : pH lu à l’envers', 'K10', 'phSens'], ['Chimie : effet d’une dilution sur le pH', 'K10', 'dilution']);
  if (typeof ERR_ADVICE !== 'undefined') Object.assign(ERR_ADVICE, {
    phSens: 'le pH se lit à l’envers : pH 2 est plus acide que pH 5 ; en dessous de 7 acide, au-dessus basique.',
    dilution: 'ajouter de l’eau rapproche le pH de 7, sans jamais le dépasser.',
  });
});
