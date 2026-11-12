/* =========================================================
   Chimie — module 5 « Les ions : compléments » (12/11/2026)
   Compléments au cours du prof (leçon C9), inspirés du livre « Physique-chimie 3e – Tout savoir ! »
   et des photos du cahier. Le cahier reste la référence : mêmes mots (charges en excès,
   ion oxygène), mêmes valeurs (mₚ = 1,67 × 10⁻²⁷ kg, rayon de l'aluminium 1,25 × 10⁻¹⁰ m).
   - 3 parties ajoutées à la FIN de C9 (pour ne pas décaler la progression déjà enregistrée) :
     le bilan en un schéma (atome / ion, charge électrique totale),
     un seul atome ou un groupe d'atomes (atome, molécule ou ion ? d'où vient un ion ?),
     des nombres très petits (préfixes pico / nano, quatre atomes du corps humain).
   - 7 exercices corrigés ajoutés à la fin de C9.
   - Nouveaux exercices tirés au hasard dans K12 (≈ 30 %) et K13 (≈ 35 %).
   Textes rédigés pour l'appli, sans recopie du manuel. Chargé après chimie4.js.
   ========================================================= */

/* ---------- Données ---------- */
/* Rayons usuels, en m (hydrogène, carbone, azote, oxygène) */
const HCNO5 = [['H', 'hydrogène', 2.5e-11], ['C', 'carbone', 7.0e-11], ['N', 'azote', 6.5e-11], ['O', 'oxygène', 6.0e-11]];
const ATOM5 = ['H', 'C', 'N', 'O', 'Na', 'Fe', 'Cu', 'Al', 'Zn', 'Mg', 'He'];
const isMono5 = (t) => (t.match(/[A-Z]/g) || []).length === 1;

/* ---------- Schémas ---------- */
const SVG5 = {
  bilan: `
  <svg viewBox="0 0 330 238" class="svg" role="img" aria-label="Bilan : un atome neutre qui perd des électrons devient un ion positif ; s’il en gagne, il devient un ion négatif.">
    <rect x="85" y="6" width="160" height="48" rx="10" class="s-line fill"/>
    <text x="165" y="26" class="s-txt b" text-anchor="middle">ATOME : neutre</text>
    <text x="165" y="43" class="s-txt" text-anchor="middle">protons = électrons</text>
    <path d="M130 56 L72 118" class="s-line arrow" marker-end="url(#ah5)"/><path d="M200 56 L258 118" class="s-line arrow" marker-end="url(#ah5)"/>
    <text x="42" y="80" class="s-txt" text-anchor="middle">perd des</text><text x="42" y="94" class="s-txt" text-anchor="middle">électrons</text>
    <text x="290" y="80" class="s-txt" text-anchor="middle">gagne des</text><text x="290" y="94" class="s-txt" text-anchor="middle">électrons</text>
    <rect x="6" y="124" width="150" height="104" rx="10" class="s-line"/>
    <text x="81" y="144" class="s-txt b" text-anchor="middle">ION POSITIF</text>
    <text x="81" y="159" class="s-txt" text-anchor="middle">(cation)</text>
    <text x="81" y="178" class="s-txt" text-anchor="middle">moins d’électrons</text><text x="81" y="192" class="s-txt" text-anchor="middle">que de protons</text>
    <text x="81" y="216" class="s-big" text-anchor="middle" style="font-size:16px">Na⁺ Mg²⁺ Al³⁺</text>
    <rect x="174" y="124" width="150" height="104" rx="10" class="s-line"/>
    <text x="249" y="144" class="s-txt b" text-anchor="middle">ION NÉGATIF</text>
    <text x="249" y="159" class="s-txt" text-anchor="middle">(anion)</text>
    <text x="249" y="178" class="s-txt" text-anchor="middle">plus d’électrons</text><text x="249" y="192" class="s-txt" text-anchor="middle">que de protons</text>
    <text x="249" y="216" class="s-big" text-anchor="middle" style="font-size:16px">Cl⁻ F⁻ O²⁻</text>
    <defs><marker id="ah5" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`,
  /* Les quatre atomes du corps humain, à la même échelle (1 px ≈ 2,5 × 10⁻¹² m) */
  hcno: `
  <svg viewBox="0 0 330 112" class="svg" role="img" aria-label="Quatre atomes dessinés à la même échelle : l’hydrogène est le plus petit, le carbone le plus gros.">
    <circle cx="34" cy="50" r="10" fill="#f4f4f7" stroke="#8a8aa0" stroke-width="2"/>
    <circle cx="112" cy="50" r="28" fill="#2b2b33"/>
    <circle cx="200" cy="50" r="26" fill="#2f6fde"/>
    <circle cx="284" cy="50" r="24" fill="#e2412f"/>
    <text x="34" y="54" class="s-txt" text-anchor="middle">H</text><text x="112" y="54" class="s-txt w" text-anchor="middle">C</text>
    <text x="200" y="54" class="s-txt w" text-anchor="middle">N</text><text x="284" y="54" class="s-txt w" text-anchor="middle">O</text>
    <text x="34" y="100" class="s-txt" text-anchor="middle">hydrogène</text><text x="112" y="100" class="s-txt" text-anchor="middle">carbone</text>
    <text x="200" y="100" class="s-txt" text-anchor="middle">azote</text><text x="284" y="100" class="s-txt" text-anchor="middle">oxygène</text>
  </svg>`,
};

/* Fiche « atome | ion » comme dans un tableau à compléter */
function fiche5(X, q) {
  const [, name, Z, A] = atomOf(X), e = Z - q, N = A - Z, I = ionTxt(X, q), sg = q > 0 ? '+' : '−';
  return `<table class="tbl c"><tr><th></th><th>Atome ${nuc(A, Z, X)}</th><th>Ion ${I}</th></tr>
    <tr><td><b>Protons</b></td><td>${Z}</td><td>${Z}</td></tr>
    <tr><td><b>Neutrons</b></td><td>${A} − ${Z} = ${N}</td><td>${N}</td></tr>
    <tr><td><b>Électrons</b></td><td>${Z}</td><td>${Z} ${q > 0 ? '−' : '+'} ${Math.abs(q)} = ${e}</td></tr>
    <tr><td><b>Charge totale</b></td><td>+${Z} − ${Z} = 0</td><td>+${Z} − ${e} = ${sg}${Math.abs(q)}</td></tr></table>
    <p class="small muted">${name[0].toUpperCase() + name.slice(1)} : la dernière ligne, c’est la méthode des trois lignes du cahier, écrite en une seule.</p>`;
}

/* ---------- Leçon C9 : trois parties de plus, à la fin ---------- */
(function addSections5() {
  const L = COURS.find((c) => c.id === 'C9');
  if (!L) return;
  L.sections.push(
    { title: 'Le bilan en un schéma',
      html: `<p>Tout le chapitre tient dans ce schéma. Le noyau ne bouge jamais : seuls les <b>électrons</b> partent ou arrivent.</p>
        ${SVG5.bilan}
        <p>On peut aussi présenter un atome et son ion côte à côte, comme une fiche à compléter. Exemple avec l’aluminium de ton cahier :</p>
        ${fiche5('Al', 3)}
        <div class="ex"><b>Charge totale :</b> on ajoute les charges + des protons et les charges − des électrons. 0 pour l’atome, +3 pour l’ion. C’est exactement « 3 charges positives en excès ».</div>`,
      retenir: 'Atome : charge totale 0. Il perd des électrons → ion positif. Il en gagne → ion négatif. Le noyau ne change pas.',
      quiz: [{ q: 'Ion F⁻ : 9 protons et 10 électrons. Sa charge totale vaut :', choices: [{ t: '−1', ok: true }, { t: '+1', msg: '+9 − 10 = −1 : il y a un électron de plus que de protons.' }, { t: '19', msg: 'On n’additionne pas les nombres : chaque proton compense un électron.' }] },
             { q: 'Un atome devient un ion. Qu’est-ce qui ne change pas ?', choices: [{ t: 'Le noyau (protons et neutrons)', ok: true }, { t: 'Le nombre d’électrons', msg: 'C’est justement les électrons qui changent.' }] }] },
    { title: 'Un seul atome ou un groupe d’atomes ?',
      html: `<p>Pour reconnaître une espèce chimique, regarde sa formule :</p>
        <table class="tbl c"><tr><th>Ce que tu vois</th><th>C’est</th><th>Exemples</th></tr>
          <tr><td>une seule majuscule, pas de charge</td><td><b>un atome</b></td><td>C, Fe, Na</td></tr>
          <tr><td>plusieurs atomes, pas de charge</td><td><b>une molécule</b></td><td>O₂, H₂O, CH₄</td></tr>
          <tr><td>une charge en haut à droite</td><td><b>un ion</b></td><td>Na⁺, SO₄²⁻</td></tr></table>
        <p>Parmi les ions, on distingue :</p>
        <ul><li>l’ion qui vient d’<b>un seul atome</b> (une seule majuscule) : Na⁺, Cl⁻, Mg²⁺, Al³⁺… On dit <b>monoatomique</b>.</li>
        <li>l’ion qui vient d’<b>un groupe d’atomes</b> (plusieurs majuscules) : SO₄²⁻ (sulfate), HO⁻ (hydroxyde), NH₄⁺ (ammonium)… On dit <b>polyatomique</b>.</li></ul>
        <div class="ex"><b>D’où vient un ion ?</b> Cache sa charge avec ton doigt : il reste le symbole de l’atome. Zn²⁺ vient de l’atome de zinc Zn, Cl⁻ de l’atome de chlore Cl.</div>`,
      retenir: 'Une charge = un ion. Une seule majuscule : ion d’un seul atome (Na⁺). Plusieurs majuscules : ion d’un groupe d’atomes (SO₄²⁻).',
      quiz: [{ q: 'NH₄⁺ est :', choices: [{ t: 'Un ion formé d’un groupe d’atomes', ok: true }, { t: 'Une molécule', msg: 'Il porte une charge (+) : c’est un ion.' }, { t: 'Un ion formé d’un seul atome', msg: 'N et H : deux majuscules, donc plusieurs atomes.' }] },
             { q: 'De quel atome vient l’ion Fe³⁺ ?', choices: [{ t: 'L’atome de fer', ok: true }, { t: 'L’atome de fluor', msg: 'Le fluor, c’est F. Fe, c’est le fer.' }, { t: 'Trois atomes de fer', msg: 'Le 3 est la charge, pas un nombre d’atomes.' }] }] },
    { title: 'Des nombres très petits',
      html: `<p>Les atomes sont si petits qu’on écrit leurs tailles avec des <b>puissances de dix</b>. Voici quatre atomes très présents dans ton corps, dessinés à la même échelle :</p>
        ${SVG5.hcno}
        <table class="tbl c"><tr><th>Atome</th><th>Rayon</th><th>Masse</th></tr>
          ${HCNO5.map(([X, n, r]) => `<tr><td><b>${n}</b> ${X}</td><td>${sciTxt(r, 1)} m</td><td>${sciTxt(mAt4(X))} kg</td></tr>`).join('')}</table>
        <p class="small muted">Masses calculées avec les valeurs de ton prof : A × 1,67 × 10⁻²⁷ + Z × 9,11 × 10⁻³¹ kg.</p>
        <p>On rencontre aussi des <b>préfixes</b> :</p>
        <div class="formula">1 mm = 10⁻³ m • 1 nm = 10⁻⁹ m • 1 pm = 10⁻¹² m</div>
        <p><b>Écriture scientifique</b> : un seul chiffre non nul avant la virgule. Quand on recule la virgule de 2 rangs vers la gauche, l’exposant monte de 2 :</p>
        <div class="formula">125 × 10⁻¹² m = 1,25 × 10⁻¹⁰ m</div>
        <div class="ex"><b>Pour passer à l’écriture décimale :</b> exposant positif, la virgule part vers la droite (3,2 × 10³ = 3 200) ; exposant négatif, elle part vers la gauche (3,2 × 10⁻³ = 0,0032).</div>`,
      retenir: '1 mm = 10⁻³ m, 1 nm = 10⁻⁹ m, 1 pm = 10⁻¹² m. Écriture scientifique : un seul chiffre avant la virgule (1,25 × 10⁻¹⁰).',
      quiz: [{ q: '70 × 10⁻¹² m s’écrit en écriture scientifique :', choices: [{ t: '7,0 × 10⁻¹¹ m', ok: true }, { t: '7,0 × 10⁻¹³ m', msg: 'La virgule recule d’un rang : le nombre devant diminue, l’exposant doit monter (−12 + 1 = −11).' }, { t: '70 × 10⁻¹¹ m', msg: 'Ce n’est pas l’écriture scientifique : il faut un seul chiffre avant la virgule.' }] },
             { q: 'Quel atome est le plus petit ?', choices: [{ t: 'L’hydrogène', ok: true }, { t: 'Le carbone', msg: 'Le carbone (7,0 × 10⁻¹¹ m) est le plus gros des quatre.' }] }] },
  );
  L.exos.push(
    { title: 'Atome, molécule ou ion ?', enonce: 'Classe ces espèces chimiques : O₂ ; Cl⁻ ; C ; SO₄²⁻ ; CH₄ ; Zn²⁺ ; Na ; HO⁻.',
      steps: ['Atomes (une majuscule, pas de charge) : C et Na.', 'Molécules (plusieurs atomes, pas de charge) : O₂ et CH₄.', 'Ions (une charge) : Cl⁻ et Zn²⁺ (un seul atome) ; SO₄²⁻ et HO⁻ (un groupe d’atomes).'],
      rep: 'Atomes : C, Na. Molécules : O₂, CH₄. Ions : Cl⁻, Zn²⁺, SO₄²⁻, HO⁻.', piege: 'Prendre SO₄²⁻ pour une molécule : la charge en haut à droite dit que c’est un ion.' },
    { title: 'La fiche de l’ion potassium', enonce: `L’atome de potassium ${nuc(39, 19, 'K')} devient l’ion K⁺. Ion positif ou négatif ? A-t-il perdu ou gagné un électron ? Complète la fiche de l’atome et de l’ion, avec la charge totale.`, ans: 18, unit: 'électrons dans l’ion',
      steps: ['Charge + : c’est un ion positif (un cation). L’atome a perdu 1 électron.', 'Atome : 19 protons, 39 − 19 = 20 neutrons, 19 électrons. Charge totale : +19 − 19 = 0.', 'Ion : 19 protons, 20 neutrons, 19 − 1 = 18 électrons. Charge totale : +19 − 18 = +1.'],
      rep: 'K⁺ est un ion positif : 19 protons, 20 neutrons, 18 électrons ; sa charge totale vaut +1.', piege: 'Écrire 20 électrons : un ion positif a perdu des électrons.' },
    { title: 'La fiche de l’ion fluorure', enonce: `L’atome de fluor ${nuc(19, 9, 'F')} devient l’ion F⁻. Ion positif ou négatif ? A-t-il perdu ou gagné un électron ? Complète la fiche de l’atome et de l’ion, avec la charge totale.`, ans: 10, unit: 'électrons dans l’ion',
      steps: ['Charge − : c’est un ion négatif (un anion). L’atome a gagné 1 électron.', 'Atome : 9 protons, 19 − 9 = 10 neutrons, 9 électrons. Charge totale : +9 − 9 = 0.', 'Ion : 9 protons, 10 neutrons, 9 + 1 = 10 électrons. Charge totale : +9 − 10 = −1.'],
      rep: 'F⁻ est un ion négatif : 9 protons, 10 neutrons, 10 électrons ; sa charge totale vaut −1.', piege: 'Changer le nombre de protons : le noyau ne bouge pas.' },
    { title: 'Perdre ou gagner : écrire la formule', enonce: 'L’atome de magnésium Mg perd deux électrons. L’atome de soufre S gagne deux électrons. Écris la formule de chaque ion en justifiant.',
      steps: ['Mg perd 2 électrons : il a 2 protons de plus que d’électrons, soit 2 charges positives en excès → Mg²⁺.', 'S gagne 2 électrons : il a 2 électrons de plus que de protons, soit 2 charges négatives en excès → S²⁻.'],
      rep: 'L’ion magnésium s’écrit Mg²⁺ et l’ion sulfure S²⁻.', piege: 'Écrire Mg²⁻ : perdre des électrons, c’est perdre des charges −, donc l’ion devient positif.' },
    { title: 'Une mine de crayon', enonce: `Une mine de crayon contient 0,1 g de carbone. Combien d’atomes de carbone contient-elle ? Un atome de carbone a une masse de ${sciTxt(mAt4('C'))} kg.`, ans: 0.0001 / mAt4('C'), sci: true, unit: 'atomes',
      steps: ['🔁 0,1 g = 0,1 ÷ 1 000 = 0,0001 kg = 1 × 10⁻⁴ kg.', `📐 N = masse de la mine ÷ masse d’un atome = 10⁻⁴ ÷ (${sciTxt(mAt4('C'))}).`, `🧮 N ≈ ${sciTxt(0.0001 / mAt4('C'))}.`],
      rep: `La mine contient environ ${sciTxt(0.0001 / mAt4('C'))} atomes de carbone.`, piege: 'Garder 0,1 g sans le convertir en kg : le résultat serait 1 000 fois trop grand.' },
    { title: 'L’épaisseur d’un cheveu', enonce: 'Un cheveu a une épaisseur de 0,07 mm. Le rayon d’un atome de carbone vaut 7,0 × 10⁻¹¹ m. Combien d’atomes de carbone faudrait-il aligner pour couvrir l’épaisseur du cheveu ?', ans: 7e-5 / 1.4e-10, sci: true, unit: 'atomes',
      steps: ['🔁 0,07 mm = 0,07 ÷ 1 000 = 0,000 07 m = 7 × 10⁻⁵ m.', '📐 diamètre = 2 × 7,0 × 10⁻¹¹ = 1,4 × 10⁻¹⁰ m.', '🧮 N = 7 × 10⁻⁵ ÷ (1,4 × 10⁻¹⁰) = 5 × 10⁵.'],
      rep: 'Il faudrait aligner environ 5 × 10⁵ atomes, soit 500 000 atomes de carbone.', piege: 'Diviser par le rayon : on trouverait 1 000 000, deux fois trop.' },
    { title: 'Écrire un rayon en écriture scientifique', enonce: 'Un livre donne le rayon de l’atome d’aluminium en picomètres : 125 pm, soit 125 × 10⁻¹² m. Écris ce rayon en écriture scientifique, en mètres.', ans: 1.25e-10, sci: true, unit: 'm',
      steps: ['📐 Écriture scientifique : un seul chiffre avant la virgule, donc 125 devient 1,25.', '🔁 125 = 1,25 × 10², donc 125 × 10⁻¹² = 1,25 × 10² × 10⁻¹².', '🧮 10² × 10⁻¹² = 10²⁻¹² = 10⁻¹⁰.'],
      rep: 'Le rayon vaut 1,25 × 10⁻¹⁰ m : c’est bien la valeur de ton cahier.', piege: 'Écrire 1,25 × 10⁻¹⁴ : quand le nombre devant devient plus petit, l’exposant doit monter.' },
  );
})();

/* ---------- Fiches et cartes ---------- */
FICHES.K12.points.push('Charge totale = protons (+) et électrons (−) ensemble : 0 pour un atome, +3 pour Al³⁺.');
FICHES.K12.points.push('Une seule majuscule (Na⁺) : ion d’un seul atome. Plusieurs majuscules (SO₄²⁻) : ion d’un groupe d’atomes. Cache la charge pour retrouver l’atome.');
FICHES.K13.points.push('Préfixes : 1 mm = 10⁻³ m, 1 nm = 10⁻⁹ m, 1 pm = 10⁻¹² m. 125 × 10⁻¹² m = 1,25 × 10⁻¹⁰ m.');

/* ---------- K12 : nouveaux exercices ---------- */
function genK12c(level) {
  const r = Math.random();
  if (level === 1) {
    if (r < 0.5) {
      const kind = pick(['atome', 'molécule', 'ion']);
      const t = kind === 'atome' ? pick(ATOM5) : kind === 'molécule' ? fml(pick(MOLS)[0]) : (Math.random() < 0.5 ? ionTxt(...pick(IONS).slice(0, 2)) : pick(POLY)[0]);
      const why = { atome: `${t} : une seule majuscule et aucune charge, c’est un atome.`, molécule: `${t} : plusieurs atomes et aucune charge, c’est une molécule.`, ion: `${t} porte une charge en haut à droite : c’est un ion.` }[kind];
      const msg = { atome: 'Une seule majuscule et aucune charge : un atome.', molécule: 'Plusieurs atomes attachés, sans charge : une molécule.', ion: 'La charge en haut à droite montre que c’est un ion.' }[kind];
      return qcmFrom('K12', { level, q: `<b>${t}</b> est :`, choices: [{ t: kind === 'atome' ? 'Un atome' : kind === 'molécule' ? 'Une molécule' : 'Un ion', ok: true },
        ...['atome', 'molécule', 'ion'].filter((k) => k !== kind).map((k) => ({ t: k === 'atome' ? 'Un atome' : k === 'molécule' ? 'Une molécule' : 'Un ion', msg, code: 'notion' }))], why });
    }
    const poly = Math.random() < 0.5, t = poly ? pick(POLY)[0] : ionTxt(...pick(IONS).slice(0, 2));
    return qcmFrom('K12', { level, q: `L’ion <b>${t}</b> vient :`, choices: [
      { t: poly ? 'D’un groupe d’atomes' : 'D’un seul atome', ok: true },
      { t: poly ? 'D’un seul atome' : 'D’un groupe d’atomes', msg: poly ? 'Il y a plusieurs majuscules : plusieurs atomes.' : 'Une seule majuscule : un seul atome. Le chiffre en haut est la charge.', code: 'notion' }],
      why: poly ? `${t} contient plusieurs symboles d’atomes : c’est un ion formé d’un groupe d’atomes (polyatomique).` : `${t} ne contient qu’un symbole d’atome : c’est un ion formé d’un seul atome (monoatomique).` });
  }
  const [X, q] = pick(IONS), [, name, Z] = atomOf(X), e = Z - q, I = ionTxt(X, q), n = Math.abs(q);
  if (level === 2) {
    if (r < 0.5) {
      const pool = shuffle(ATOMS.filter((a) => a[0] !== X)), others = [...pool.filter((a) => a[0][0] === X[0]), ...pool.filter((a) => a[0][0] !== X[0])].slice(0, 2);
      return qcmFrom('K12', { level, q: `De quel atome vient l’ion <b>${I}</b> ?`, choices: [
        { t: `L’atome ${dn(name)} (${X})`, ok: true },
        ...others.map((a) => ({ t: `L’atome ${dn(a[1])} (${a[0]})`, msg: `Cache la charge : il reste ${X}, le symbole ${dn(name)}.`, code: 'notion' })),
        ...(n > 1 ? [{ t: `${n} atomes ${dn(name)}`, msg: `Le ${n} en haut à droite est la charge, pas un nombre d’atomes.`, code: 'formIon' }] : [])],
        why: `On cache la charge de ${I} : il reste ${X}, l’atome ${dn(name)}.` });
    }
    const sg = q > 0 ? '+' : '−';
    return qcmFrom('K12', { level, q: `L’ion <b>${I}</b> possède ${Z} protons et ${e} électrons. Sa <b>charge totale</b> vaut :`, choices: [
      { t: `${sg}${n}`, ok: true },
      { t: `${q > 0 ? '−' : '+'}${n}`, msg: q > 0 ? 'Il y a plus de protons (+) que d’électrons (−) : la charge totale est positive.' : 'Il y a plus d’électrons (−) que de protons (+) : la charge totale est négative.', code: 'signeIon' },
      { t: '0', msg: 'Charge totale 0, c’est l’atome. L’ion n’a pas autant d’électrons que de protons.', code: 'chargeIon' },
      { t: String(Z + e), msg: 'On n’additionne pas les nombres : chaque proton (+) compense un électron (−).', code: 'chargeIon' }],
      why: `+${Z} − ${e} = ${sg}${n}.` });
  }
  const pos = q > 0;
  return qcmFrom('K12', { level, q: `Que peut-on dire de l’ion <b>${I}</b> ?`, choices: [
    { t: `C’est un ion ${pos ? 'positif (cation)' : 'négatif (anion)'} : l’atome a ${pos ? 'perdu' : 'gagné'} ${n} électron${pl4(n)}`, ok: true },
    { t: `C’est un ion ${pos ? 'positif (cation)' : 'négatif (anion)'} : l’atome a ${pos ? 'gagné' : 'perdu'} ${n} électron${pl4(n)}`, msg: pos ? 'Un ion positif a moins d’électrons que de protons : il en a perdu.' : 'Un ion négatif a plus d’électrons que de protons : il en a gagné.', code: 'signeIon' },
    { t: `C’est un ion ${pos ? 'négatif (anion)' : 'positif (cation)'} : l’atome a ${pos ? 'perdu' : 'gagné'} ${n} électron${pl4(n)}`, msg: `Le signe ${pos ? '+' : '−'} donne un ion ${pos ? 'positif' : 'négatif'}.`, code: 'signeIon' },
    { t: `C’est un ion ${pos ? 'positif (cation)' : 'négatif (anion)'} : l’atome a ${pos ? 'gagné' : 'perdu'} ${n} proton${pl4(n)}`, msg: 'Le noyau ne change pas : ce sont des électrons qui partent ou arrivent.', code: 'noyauIon' }],
    why: `${I} : ${chTxt(q)}. L’atome ${dn(name)} (${Z} électrons) a ${pos ? 'perdu' : 'gagné'} ${n} électron${pl4(n)} : il en a ${e}.` });
}

/* ---------- K13 : nouveaux exercices ---------- */
function genK13c(level) {
  const r = Math.random();
  if (level === 1) {
    const [v, x] = pick([[125, -12], [70, -12], [65, -12], [60, -12], [135, -12], [180, -12], [25, -12], [140, -12], [50, -9], [300, -9]]);
    const ans = v * Math.pow(10, x), { m, e } = sciParts(ans, 2), shift = Math.round(Math.log10(v / m));
    return num({ skill: 'K13', level, sci: true, q: `Écris <b>${v} × ${p10(x)} m</b> en écriture scientifique.`, unit: 'm', ans,
      errs: [{ v: m * Math.pow(10, x - shift), code: 'expSigne', msg: `Le nombre devant devient ${shift} rang${pl4(shift)} plus petit : l’exposant doit MONTER de ${shift} (${String(x).replace('-', '−')} + ${shift} = ${String(e).replace('-', '−')}).` }, { v: m * Math.pow(10, x), code: 'p10', msg: `Tu as changé le nombre devant, mais pas l’exposant : la virgule a reculé de ${shift} rang${pl4(shift)}, l’exposant doit monter d’autant.` }],
      hints: ['Un seul chiffre avant la virgule.', `${v} = ${fr(m)} × ${p10(shift)}, puis ${p10(shift)} × ${p10(x)} = ${p10(e)}`],
      sol: [ST.formule('un seul chiffre non nul avant la virgule'), ST.calc(`${v} = ${fr(m)} × ${p10(shift)}, donc ${v} × ${p10(x)} = ${fr(m)} × ${p10(shift + x)}`), ST.phrase(`${v} × ${p10(x)} m = ${sciTxt(ans)} m.`),
            ST.piege('quand le nombre devant diminue, l’exposant augmente.')] });
  }
  if (r < 0.5) {
    const [txt, X, g] = pick([['une mine de crayon de 0,1 g (carbone)', 'C', 0.1], ['un diamant de 0,2 g (carbone)', 'C', 0.2], ['1 g de carbone', 'C', 1], ['0,5 g de carbone', 'C', 0.5],
      ['1 g d’hydrogène', 'H', 1], ['2 g d’hydrogène', 'H', 2], ['1 g d’oxygène', 'O', 1], ['1 g d’azote', 'N', 1]]);
    const name = atomOf(X)[1], ma = mAt4(X), kg = g / 1000, ans = kg / ma;
    return num({ skill: 'K13', level, sci: true, q: `Combien y a-t-il d’atomes ${dn(name)} dans <b>${txt}</b> ? Un atome ${dn(name)} a une masse de <b>${sciTxt(ma)} kg</b>.`, unit: 'atomes', ans,
      errs: [{ v: g / ma, code: 'noconv', msg: `La masse de l’atome est en kg : convertis d’abord ${fr(g, 1)} g en kg (÷ 1 000).` }, { v: ma / kg, code: 'inverse', msg: 'Division à l’envers : masse de l’objet ÷ masse d’un atome.' }],
      hints: ['Nombre d’atomes = masse de l’objet ÷ masse d’un atome, les deux en kg.', `${fr(g, 1)} g = ${fr(kg, 4)} kg, puis ${fr(kg, 4)} ÷ (${sciTxt(ma)})`],
      sol: [ST.cherche('un nombre d’atomes.'), ST.formule('N = masse de l’objet ÷ masse d’un atome'), ST.conv(`${fr(g, 1)} g = ${fr(kg, 4)} kg`), ST.calc(`N = ${fr(kg, 4)} ÷ (${sciTxt(ma)}) ≈ ${sciTxt(ans)}`),
            ST.phrase(`Il y a environ ${sciTxt(ans)} atomes ${dn(name)} dans ${txt}.`)] });
  }
  const [X, name, rad] = pick(HCNO5), [lt, mm] = pick([['l’épaisseur d’un cheveu (0,07 mm)', 0.07], ['l’épaisseur d’une feuille de papier (0,1 mm)', 0.1], ['1 mm', 1], ['la pointe d’un stylo (0,5 mm)', 0.5], ['2 mm', 2]]);
  const L = mm / 1000, d = 2 * rad, ans = L / d;
  return num({ skill: 'K13', level, sci: true, q: `Le rayon d’un atome ${dn(name)} vaut <b>${sciTxt(rad, 1)} m</b>. Combien d’atomes ${dn(name)} faut-il aligner pour couvrir <b>${lt}</b> ?`, unit: 'atomes', ans,
    errs: [{ v: 2 * ans, code: 'rayonDiam', msg: 'Tu as divisé par le rayon. Un atome occupe son diamètre : 2 × rayon.' }, { v: ans * 1000, code: 'noconv', msg: `Le rayon est en mètres : convertis d’abord ${fr(mm, 2)} mm en m (÷ 1 000).` },
      { v: ans * 10, code: 'p10', msg: '1 m = 1 000 mm : on divise par 1 000, pas par 100.' }],
    hints: ['Nombre d’atomes = longueur ÷ diamètre d’un atome, les deux en mètres.', `Diamètre = ${sciTxt(d, 1)} m ; ${fr(mm, 2)} mm = ${sciTxt(L, 1)} m`],
    sol: [ST.cherche('un nombre d’atomes.'), ST.formule('N = longueur ÷ diamètre d’un atome'), ST.conv(`diamètre = 2 × ${sciTxt(rad, 1)} = ${sciTxt(d, 1)} m ; ${fr(mm, 2)} mm = ${fr(mm, 2)} ÷ 1 000 = ${sciTxt(L, 1)} m`),
          ST.calc(`N = ${sciTxt(L, 1)} ÷ (${sciTxt(d, 1)}) ≈ ${sciTxt(ans)}`), ST.phrase(`Il faut aligner environ ${sciTxt(ans)} atomes ${dn(name)}.`), ST.piege('1 mm = 0,001 m : on divise par 1 000.')] });
}

{
  const baseK12 = GENERATORS.K12, baseK13 = GENERATORS.K13;
  GENERATORS.K12 = (level) => (Math.random() < 0.3 ? genK12c(level) : baseK12(level));
  GENERATORS.K13 = (level) => (Math.random() < 0.35 ? genK13c(level) : baseK13(level));
}
