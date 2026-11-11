/* =========================================================
   Chimie — module 4 « Les ions, le cours du prof » (11/11/2026)
   Source principale : le cahier (cours du prof). Le livre ne sert que de complément.
   - Leçon C9 (placée juste après C6) : espèces chimiques, atome neutre, ¹⁶O et ¹⁷O,
     ion sodium, ion oxygène, méthode des charges en excès, composition d'un ion,
     ions à connaître, compter des atomes (exercices sur l'aluminium).
   - Compétences K11 (isotopes), K12 (charge et formule d'un ion), K13 (compter des atomes).
   - « Contrôle type : les ions » (5 exercices rédigés, note sur 20).
   Mots du prof : électriquement neutre / chargé, charges en excès, formule chimique de l'ion,
   « ion oxygène » (nom officiel : ion oxyde).
   Textes rédigés pour l'appli, sans recopie de manuel.
   Chargé après chimie3.js et avant app.js.
   ========================================================= */

SKILLS.push(
  { id: 'K11', subj: 'chimie', ref: 'MAT-07', name: 'Comparer deux atomes du même élément (isotopes)', short: 'Isotopes', icon: '👯', lesson: 'C9' },
  { id: 'K12', subj: 'chimie', ref: 'MAT-08', name: 'Trouver la charge et la formule d’un ion', short: 'Charge des ions', icon: '➕', lesson: 'C9' },
  { id: 'K13', subj: 'chimie', ref: 'OUT-04', name: 'Compter des atomes (dans un objet, alignés)', short: 'Compter', icon: '🔢', lesson: 'C9' },
);

Object.assign(ERR_LABELS, {
  isotope: 'Confond ce qui change entre deux isotopes (les neutrons)',
  chargeIon: 'Compte mal les charges en excès d’un ion',
  formIon: 'Écrit mal la formule d’un ion',
  rayonDiam: 'Prend le rayon d’un atome pour son diamètre',
});

Object.assign(FICHES, {
  K11: {
    title: 'Comparer deux atomes du même élément',
    points: [
      `${nuc(16, 8, 'O')} et ${nuc(17, 8, 'O')} sont deux atomes d’oxygène : <b>même nombre de protons</b> (8) et d’électrons (8).`,
      'Ce qui change : le nombre de <b>neutrons</b>. 16 − 8 = 8 neutrons pour l’un, 17 − 8 = 9 pour l’autre.',
      'Celui qui a le plus de neutrons est le <b>plus lourd</b>.',
      'On appelle ces atomes des <b>isotopes</b>. Ils ont le même symbole chimique.',
    ],
    formula: 'mêmes protons • neutrons différents',
    piege: 'Un neutron de plus ne change pas la charge : les deux atomes restent neutres.',
  },
  K12: {
    title: 'Trouver la charge et la formule d’un ion',
    points: [
      'Atome : autant de protons (+) que d’électrons (−). Il est <b>électriquement neutre</b>.',
      'Ion : l’atome a perdu ou gagné des électrons. Il est <b>électriquement chargé</b>. Le noyau ne change pas.',
      'On compte : 11 protons → +11 ; 10 électrons → −10 ; il reste +1 : <b>1 charge positive en excès</b> → Na⁺.',
      '8 protons → +8 ; 10 électrons → −10 ; il reste −2 : <b>2 charges négatives en excès</b> → O²⁻.',
      'La charge s’écrit en haut à droite du symbole. Pour une seule charge, on n’écrit pas le 1.',
    ],
    formula: 'charges + (protons) et charges − (électrons) → ce qui reste = la charge',
    piege: 'Perdre des électrons, c’est perdre des « − » : l’ion devient positif.',
  },
  K13: {
    title: 'Compter des atomes',
    points: [
      'Dans un objet : <b>N = masse de l’objet ÷ masse d’un atome</b>, les deux en kg. 1 g = 0,001 kg.',
      'Alignés : <b>N = longueur ÷ diamètre d’un atome</b>, les deux en m. 2,5 cm = 0,025 m.',
      'Le <b>diamètre</b> est le double du rayon : rayon 1,25 × 10⁻¹⁰ m → diamètre 2,5 × 10⁻¹⁰ m.',
      'À la calculatrice, mets le bas de la division entre parenthèses.',
    ],
    formula: 'N = total ÷ ce que vaut UN atome (mêmes unités)',
    piege: 'Diviser par le rayon : un atome occupe son diamètre, pas son rayon.',
  },
});
FICHES.K7.points.push('Ton prof dit : ion <b>positif</b> ou <b>négatif</b>, avec des charges <b>en excès</b>. Cation = ion positif ; anion = ion négatif.');

Object.assign(CARDS, {
  K11: { title: 'Isotopes', body: 'Mêmes protons, mêmes électrons<br>Neutrons différents<br>Plus de neutrons = plus lourd' },
  K12: { title: 'Charge d’un ion', body: 'Protons : +  •  électrons : −<br>Ce qui reste = charge en excès<br>Na⁺ : +11 et −10 → 1+' },
  K13: { title: 'Compter des atomes', body: 'masse ÷ masse d’un atome (kg)<br>longueur ÷ diamètre (m)<br>diamètre = 2 × rayon' },
});

/* ---------- Données ---------- */
const ION4 = [
  ['Na', 1, 'ion sodium'], ['K', 1, 'ion potassium'], ['Li', 1, 'ion lithium'], ['Mg', 2, 'ion magnésium'], ['Ca', 2, 'ion calcium'],
  ['Cu', 2, 'ion cuivre II'], ['Zn', 2, 'ion zinc'], ['Fe', 2, 'ion fer II'], ['Fe', 3, 'ion fer III'], ['Al', 3, 'ion aluminium'],
  ['Cl', -1, 'ion chlorure'], ['F', -1, 'ion fluorure'], ['O', -2, 'ion oxygène (ion oxyde)'], ['S', -2, 'ion sulfure'],
];
const ION4_KNOWN = [['ion sodium', 'Na', 1], ['ion hydrogène', 'H', 1], ['ion cuivre II', 'Cu', 2], ['ion fer II', 'Fe', 2], ['ion fer III', 'Fe', 3], ['ion zinc', 'Zn', 2], ['ion aluminium', 'Al', 3], ['ion chlorure', 'Cl', -1]];
const ISO4 = [
  ['H', 'hydrogène', 1, [1, 2, 3]], ['C', 'carbone', 6, [12, 13, 14]], ['N', 'azote', 7, [14, 15]], ['O', 'oxygène', 8, [16, 17, 18]],
  ['Mg', 'magnésium', 12, [24, 25, 26]], ['Cl', 'chlore', 17, [35, 37]], ['Cu', 'cuivre', 29, [63, 65]],
];
/* Rayons d'atomes, en 10⁻¹⁰ m, écrits comme dans le cahier (aluminium : 1,25 × 10⁻¹⁰ m) */
const RAD4 = [['Al', 1.25], ['Fe', 1.4], ['Cu', 1.35], ['Na', 1.8], ['Mg', 1.5], ['Zn', 1.35]];
const pl4 = (n) => (n > 1 ? 's' : '');
const chTxt = (q) => { const n = Math.abs(q); return `${n} charge${pl4(n)} ${q > 0 ? 'positive' : 'négative'}${pl4(n)} en excès`; };
const mAt4 = (X) => { const [, , Z, A] = atomOf(X); return A * MP + Z * ME; };
/* Formules proposées pour un ion X de charge q qui possède e électrons */
function ionChoices4(X, q, e) {
  const n = Math.abs(q), sg = q > 0 ? 1 : -1, good = ionTxt(X, q);
  const ch = [{ t: good, ok: true },
    { t: ionTxt(X, -q), msg: q > 0 ? 'Il y a plus de protons (+) que d’électrons (−) : les charges en excès sont positives.' : 'Il y a plus d’électrons (−) que de protons (+) : les charges en excès sont négatives.', code: 'signeIon' },
    n > 1 ? { t: ionTxt(X, sg), msg: `Il y a ${n} charges en excès : il faut écrire le ${n} devant le signe.`, code: 'formIon' }
          : { t: ionTxt(X, 2 * sg), msg: 'Une seule charge en excès : on écrit seulement le signe, sans chiffre.', code: 'chargeIon' },
    { t: X + supN(e) + (q > 0 ? '⁺' : '⁻'), msg: `${e}, c’est le nombre d’électrons. En haut à droite, on écrit seulement les charges en excès.`, code: 'formIon' }];
  return ch.filter((c, i) => ch.findIndex((d) => d.t === c.t) === i);
}

/* ---------- Schéma : un atome devient un ion ---------- */
function ionSvg4(Z, e0, e1, nameA, nameI, arrow) {
  const side = (cx, e, name, sub) => `<circle cx="${cx}" cy="64" r="44" class="s-line dash"/><circle cx="${cx}" cy="64" r="17" class="s-r2"/>
    <text x="${cx}" y="68" class="s-txt w" text-anchor="middle">${Z} +</text><text x="${cx}" y="13" class="s-txt" text-anchor="middle">${e} électrons (−)</text>
    <text x="${cx}" y="128" class="s-txt b" text-anchor="middle">${name}</text><text x="${cx}" y="144" class="s-txt" text-anchor="middle">${sub}</text>`;
  return `
  <svg viewBox="0 0 330 150" class="svg" role="img" aria-label="${nameA} : ${Z} protons et ${e0} électrons. ${arrow}. ${nameI} : ${Z} protons et ${e1} électrons.">
    ${side(68, e0, nameA, 'neutre')}${side(262, e1, nameI, 'chargé')}
    <path d="M124 64 H204" class="s-line arrow" marker-end="url(#ah9)"/><text x="165" y="52" class="s-txt" text-anchor="middle">${arrow}</text>
    <defs><marker id="ah9" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0 0 L10 5 L0 10 z" class="s-head"/></marker></defs>
  </svg>`;
}

/* ---------- K11 : isotopes ---------- */
const K11_BANK = [
  { level: 1, q: `${nuc(16, 8, 'O')} et ${nuc(17, 8, 'O')} ont le même nombre de :`, choices: [
    { t: 'Protons (et d’électrons)', ok: true },
    { t: 'Neutrons', msg: '16 − 8 = 8 neutrons pour l’un, 17 − 8 = 9 pour l’autre : ce n’est pas le même nombre.', code: 'isotope' },
    { t: 'Nucléons', msg: 'Le nombre du haut est différent : 16 nucléons et 17 nucléons.', code: 'isotope' }],
    why: 'Le nombre du bas (8) est le même : 8 protons, donc 8 électrons. Seuls les neutrons changent.' },
  { level: 1, q: `Qu’est-ce qui change entre ${nuc(16, 8, 'O')} et ${nuc(17, 8, 'O')} ?`, choices: [
    { t: 'Le nombre de neutrons', ok: true },
    { t: 'Le nombre de protons', msg: 'Le nombre du bas est 8 pour les deux : 8 protons.', code: 'isotope' },
    { t: 'Le nombre d’électrons', msg: 'Les deux atomes sont neutres, avec 8 protons : ils ont 8 électrons tous les deux.', code: 'isotope' }],
    why: '8 neutrons pour le premier, 9 pour le second. Tout le reste est pareil.' },
  { level: 1, q: 'Deux atomes qui ont le même nombre de protons mais pas le même nombre de neutrons sont :', choices: [
    { t: 'Des isotopes', ok: true },
    { t: 'Des ions', msg: 'Un ion, c’est un atome qui a perdu ou gagné des électrons.', code: 'isotope' },
    { t: 'Des molécules', msg: 'Une molécule est un assemblage de plusieurs atomes.', code: 'notion' }],
    why: 'Isotopes : même élément (mêmes protons), neutrons différents.' },
  { level: 2, q: `${nuc(17, 8, 'O')} est plus lourd que ${nuc(16, 8, 'O')} parce qu’il possède :`, choices: [
    { t: 'Un neutron de plus', ok: true },
    { t: 'Un proton de plus', msg: 'Avec un proton de plus, ce ne serait plus de l’oxygène.', code: 'isotope' },
    { t: 'Un électron de plus', msg: 'Avec un électron de plus, ce serait un ion. Et un électron ne pèse presque rien.', code: 'isotope' }],
    why: '17 − 8 = 9 neutrons au lieu de 8 : un nucléon de plus dans le noyau, donc un atome plus lourd.' },
  { level: 2, q: `Les atomes ${nuc(16, 8, 'O')} et ${nuc(17, 8, 'O')} sont-ils électriquement neutres ?`, choices: [
    { t: 'Oui, tous les deux : 8 protons et 8 électrons', ok: true },
    { t: 'Seulement le premier', msg: 'Le neutron en plus n’a pas de charge : il ne change rien à la neutralité.', code: 'isotope' },
    { t: 'Non, aucun des deux', msg: 'Un atome a autant de protons que d’électrons : il est toujours neutre.', code: 'notion' }],
    why: 'Un neutron n’a pas de charge. Autant de + que de − : les deux atomes sont neutres.' },
  { level: 3, q: 'Un atome possède 8 protons, 8 électrons et 10 neutrons. C’est :', choices: [
    { t: `Un atome d’oxygène plus lourd : ${nuc(18, 8, 'O')}`, ok: true },
    { t: 'L’ion O²⁻', msg: 'L’ion O²⁻ a 10 <b>électrons</b>. Ici ce sont 10 neutrons, et il y a autant d’électrons que de protons.', code: 'isotope' },
    { t: 'Un atome de néon', msg: 'C’est le nombre de protons qui donne le nom : 8 protons, c’est de l’oxygène.', code: 'isotope' }],
    why: '8 protons : oxygène. 8 + 10 = 18 nucléons. Autant de protons que d’électrons : c’est un atome, pas un ion.' },
  { level: 3, q: 'On ajoute un proton dans le noyau d’un atome d’oxygène (8 protons). On obtient :', choices: [
    { t: 'Un autre élément (9 protons : le fluor)', ok: true },
    { t: 'Un isotope de l’oxygène', msg: 'Un isotope garde le même nombre de protons : ce sont les neutrons qui changent.', code: 'isotope' },
    { t: 'Un ion oxygène', msg: 'Un ion se forme en changeant le nombre d’électrons, pas de protons.', code: 'noyauIon' }],
    why: 'Le nombre de protons est la « carte d’identité » de l’élément : 8 = oxygène, 9 = fluor.' },
  { level: 3, q: `Pour passer de l’atome ${nuc(16, 8, 'O')} à l’ion O²⁻, on ajoute :`, choices: [
    { t: '2 électrons', ok: true },
    { t: '2 neutrons', msg: `Avec 2 neutrons de plus, on obtient ${nuc(18, 8, 'O')} : un atome plus lourd, toujours neutre.`, code: 'isotope' },
    { t: '2 protons', msg: 'Le noyau ne change pas quand un ion se forme.', code: 'noyauIon' }],
    why: 'Ion : les électrons changent. Isotope : les neutrons changent. Autre élément : les protons changent.' },
];
function genK11(level) {
  const r = Math.random(), bank = (lv) => qcmFrom('K11', pickFresh(K11_BANK.filter((b) => b.level === lv)));
  const [X, name, Z, As] = pick(level === 1 ? ISO4.slice(1, 4) : ISO4), two = shuffle(As).slice(0, 2).sort((a, b) => a - b), [A1, A2] = two;
  const pair = `${nuc(A1, Z, X)} et ${nuc(A2, Z, X)}`;
  if (level === 1) {
    if (r < 0.45) return bank(1);
    const what = pick(['protons', 'électrons']);
    return num({ skill: 'K11', level, q: `Voici deux atomes ${dn(name)} : ${pair}. Combien ${what === 'protons' ? 'de' : 'd’'}<b>${what === 'protons' ? ' ' : ''}${what}</b> possède le <b>second</b> ?`, unit: what, ans: Z,
      errs: [{ v: A2, code: 'zA', msg: `${A2}, c’est le nombre de nucléons (en haut). Les ${what}, c’est le nombre du bas.` }, { v: A2 - Z, code: 'neutA', msg: `${A2 - Z}, ce sont ses neutrons.` }].filter((e) => e.v !== Z),
      hints: ['Le nombre du bas est le même pour les deux atomes.', `Z = ${Z}`],
      sol: [ST.formule('Z (en bas) = protons = électrons, pour les deux atomes'), ST.calc(`${what} = ${Z}, comme pour le premier`), ST.piege('croire que le second a plus de protons : seuls ses neutrons sont plus nombreux.')] });
  }
  if (level === 2) {
    if (r < 0.3) return bank(2);
    if (r < 0.65) return num({ skill: 'K11', level, q: `Voici deux atomes ${dn(name)} : ${pair}. Combien de <b>neutrons</b> possède le <b>second</b> ?`, unit: 'neutrons', ans: A2 - Z,
      errs: [{ v: A2, code: 'neutA', msg: `${A2}, ce sont les nucléons. Retire les ${Z} protons.` }, { v: A1 - Z, code: 'isotope', msg: `${A1 - Z}, ce sont les neutrons du premier. Pour le second : ${A2} − ${Z}.` }, { v: Z, code: 'zA', msg: `${Z}, ce sont les protons.` }]
        .filter((e, i, a) => e.v !== A2 - Z && a.findIndex((d) => d.v === e.v) === i),
      hints: ['Neutrons = A − Z, avec le A du second atome.', `${A2} − ${Z}`],
      sol: [ST.formule('neutrons = A − Z'), ST.calc(`premier : ${A1} − ${Z} = ${A1 - Z} ; second : ${A2} − ${Z} = ${A2 - Z}`), ST.phrase(`Le second atome possède ${A2 - Z} neutrons, soit ${A2 - A1} de plus que le premier.`)] });
    return qcmFrom('K11', { level, q: `Lequel de ces deux atomes ${dn(name)} est le plus lourd : ${pair} ?`, choices: [
      { t: `${nuc(A2, Z, X)}, il a ${A2 - A1} neutron${pl4(A2 - A1)} de plus`, ok: true },
      { t: `${nuc(A1, Z, X)}`, msg: `Il a moins de nucléons (${A1} contre ${A2}) : il est plus léger.`, code: 'isotope' },
      { t: 'Ils ont la même masse', msg: 'Ils n’ont pas le même nombre de nucléons : leurs masses sont différentes.', code: 'isotope' }],
      why: `${A2} nucléons contre ${A1} : le noyau du second contient ${A2 - A1} neutron${pl4(A2 - A1)} de plus, il est plus lourd.` });
  }
  if (r < 0.4) return bank(3);
  if (r < 0.7) {
    const other = ATOMS.find((a) => a[2] === Z + 1) || ATOMS.find((a) => a[2] === Z - 1);
    return qcmFrom('K11', { level, q: `Lequel de ces atomes est un isotope de ${nuc(A1, Z, X)} ?`, choices: [
      { t: nuc(A2, Z, X), ok: true },
      { t: nuc(A1, other[2], other[0]), msg: `Le nombre de protons est différent (${other[2]}) : c’est un autre élément, le ${other[1]}.`, code: 'isotope' },
      { t: nuc(A2, other[2], other[0]), msg: `Le nombre de protons est différent (${other[2]}) : c’est un autre élément, le ${other[1]}.`, code: 'isotope' }],
      why: `Un isotope a le même nombre de protons (${Z}) et un nombre de nucléons différent.` });
  }
  const N1 = A1 - Z, N2 = A2 - Z;
  return num({ skill: 'K11', level, q: `Un atome ${dn(name)} possède <b>${Z} protons</b> et <b>${N1} neutrons</b>. Un autre atome ${dn(name)} possède <b>${N2} neutrons</b>. Quel est le nombre de nucléons A du second ?`, unit: 'nucléons', ans: A2,
    errs: [{ v: A1, code: 'isotope', msg: `${A1}, c’est le premier atome. Le second a ${N2} neutrons.` }, { v: N2, code: 'neutA', msg: 'Les nucléons, ce sont les protons ET les neutrons.' }, { v: N1 + N2, code: 'isotope', msg: 'On n’additionne pas les neutrons des deux atomes : A = protons + neutrons du second.' }]
      .filter((e, i, a) => e.v !== A2 && a.findIndex((d) => d.v === e.v) === i),
    hints: [`Même élément : le second a aussi ${Z} protons.`, `${Z} + ${N2}`],
    sol: [ST.formule('même élément → même nombre de protons ; A = protons + neutrons'), ST.calc(`A = ${Z} + ${N2} = ${A2}`), ST.phrase(`Le second atome s’écrit ${nuc(A2, Z, X)}.`)] });
}

/* ---------- K12 : charge et formule d'un ion (la méthode du cahier) ---------- */
const K12_BANK = [
  { level: 1, q: 'Un atome est électriquement neutre parce qu’il possède :', choices: [
    { t: 'Autant de protons que d’électrons', ok: true },
    { t: 'Autant de protons que de neutrons', msg: 'Les neutrons n’ont pas de charge : ils ne comptent pas ici.', code: 'notion' },
    { t: 'Aucune charge électrique', msg: 'Il a des charges + et des charges −, mais en même nombre.', code: 'notion' }],
    why: 'Autant de charges + (protons) que de charges − (électrons) : elles se compensent.' },
  { level: 1, q: 'Dans la formule Na⁺, le petit « + » en haut à droite indique :', choices: [
    { t: 'La charge électrique de l’ion', ok: true },
    { t: 'Le nombre de protons', msg: 'Le nombre de protons est Z, en bas à gauche du symbole de l’atome.', code: 'formIon' },
    { t: 'Qu’on ajoute un atome', msg: 'C’est une charge électrique, pas une addition.', code: 'formIon' }],
    why: 'Na : le symbole chimique. Le + : une charge positive en excès.' },
  { level: 1, q: 'Un ion, c’est un atome qui a :', choices: [
    { t: 'Perdu ou gagné des électrons', ok: true },
    { t: 'Perdu ou gagné des protons', msg: 'Le noyau ne change pas : ce sont les électrons qui partent ou arrivent.', code: 'noyauIon' },
    { t: 'Perdu ou gagné des neutrons', msg: 'Changer les neutrons donne un isotope, toujours neutre.', code: 'isotope' }],
    why: 'Seuls les électrons changent : l’atome n’est plus neutre, il devient un ion.' },
  { level: 1, q: 'Les trois espèces chimiques de ton cours sont :', choices: [
    { t: 'L’atome, la molécule, l’ion', ok: true },
    { t: 'Le proton, le neutron, l’électron', msg: 'Ce sont les particules qui composent l’atome.', code: 'notion' },
    { t: 'Le solide, le liquide, le gaz', msg: 'Ce sont les états de la matière.', code: 'notion' }],
    why: 'Atome (neutre), molécule (plusieurs atomes), ion (chargé).' },
  { level: 2, q: 'Quand l’atome de sodium devient l’ion Na⁺, quel électron a disparu ?', choices: [
    { t: 'Un électron de la dernière couche, le plus loin du noyau', ok: true },
    { t: 'Un électron du noyau', msg: 'Il n’y a pas d’électrons dans le noyau.', code: 'notion' },
    { t: 'L’électron le plus proche du noyau', msg: 'C’est l’électron le plus éloigné qui part : il est le moins retenu.', code: 'notion' }],
    why: 'Dans ton cahier : « l’électron sur la dernière couche a disparu ».' },
  { level: 2, q: 'Dans la formule O²⁻, que veut dire « 2− » ?', choices: [
    { t: '2 charges négatives en excès : 2 électrons de plus que de protons', ok: true },
    { t: 'L’ion possède 2 électrons en tout', msg: 'Il en possède 10. Le 2 compte seulement ceux qui sont en plus.', code: 'chargeIon' },
    { t: 'L’atome a perdu 2 électrons', msg: 'S’il en avait perdu, la charge serait positive.', code: 'signeIon' }],
    why: '8 protons (+8) et 10 électrons (−10) : il reste 2 charges négatives.' },
  { level: 2, q: 'Pourquoi écrit-on Na⁺ et pas Na¹⁺ ?', choices: [
    { t: 'Avec une seule charge en excès, on n’écrit pas le 1', ok: true },
    { t: 'Parce que le sodium n’a qu’un électron', msg: 'L’atome de sodium a 11 électrons.', code: 'chargeIon' },
    { t: 'Les deux écritures sont utilisées', msg: 'Par convention, on écrit Na⁺, sans le 1.', code: 'formIon' }],
    why: 'Comme dans les formules de molécules : le 1 ne s’écrit pas.' },
  { level: 3, q: 'L’atome de chlore (17 protons) devient l’ion chlorure Cl⁻. Il a :', choices: [
    { t: 'Gagné 1 électron : il en possède 18', ok: true },
    { t: 'Perdu 1 électron : il en possède 16', msg: 'Charge négative : il a PLUS d’électrons que de protons.', code: 'signeIon' },
    { t: 'Gagné 1 proton', msg: 'Le noyau ne change pas.', code: 'noyauIon' }],
    why: '17 protons (+17) et 18 électrons (−18) : 1 charge négative en excès.' },
  { level: 3, q: 'L’atome de sodium et l’ion sodium ont le même nombre de charges positives. Pourquoi ?', choices: [
    { t: 'Leur noyau est le même : 11 protons', ok: true },
    { t: 'Ils ont le même nombre d’électrons', msg: 'Non : 11 électrons pour l’atome, 10 pour l’ion.', code: 'signeIon' },
    { t: 'L’ion a gagné une charge positive', msg: 'Il n’a rien gagné : il a perdu une charge négative (un électron).', code: 'signeIon' }],
    why: 'Quand un ion se forme, le noyau ne bouge pas. Seuls les électrons changent.' },
  { level: 3, q: 'L’ion Cu²⁺ a 29 protons et 27 électrons. Quel atome lui a donné naissance ?', choices: [
    { t: 'Un atome de cuivre qui a perdu 2 électrons', ok: true },
    { t: 'Un atome de cuivre qui a gagné 2 électrons', msg: 'Il aurait alors 31 électrons et une charge 2−.', code: 'signeIon' },
    { t: 'Un atome à 27 protons qui a gagné 2 protons', msg: 'Le noyau ne change jamais : c’est du cuivre, 29 protons, avant comme après.', code: 'noyauIon' }],
    why: '29 − 27 = 2 charges positives en excès : 2 électrons perdus.' },
];
function genK12(level) {
  const r = Math.random(), bank = (lv) => qcmFrom('K12', pickFresh(K12_BANK.filter((b) => b.level === lv)));
  const [X, q, iname] = pick(ION4), [, aname, Z, A] = atomOf(X), n = Math.abs(q), e = Z - q, I = ionTxt(X, q), N = A - Z;
  const lines = `+${Z} (protons) et −${e} (électrons)`;
  if (level === 1) {
    if (r < 0.3) return bank(1);
    if (r < 0.55) return num({ skill: 'K12', level, q: `Un ion possède <b>${Z} protons</b> et <b>${e} électrons</b>. Combien de charges a-t-il <b>en excès</b> ?`, unit: 'charge(s)', ans: n,
      errs: [{ v: Z + e, code: 'chargeIon', msg: 'On ne les additionne pas : les + et les − se compensent. Cherche la différence.' }, { v: e, code: 'chargeIon', msg: `${e}, ce sont tous les électrons. Combien de charges ne sont pas compensées ?` }, { v: Z, code: 'chargeIon', msg: `${Z}, ce sont tous les protons. Combien de charges ne sont pas compensées ?` }],
      hints: ['Chaque proton (+) compense un électron (−). Que reste-t-il ?', `${Math.max(Z, e)} − ${Math.min(Z, e)}`],
      sol: [ST.formule('charges + (protons) et charges − (électrons) : on regarde ce qui reste'), ST.calc(`${lines} : il reste ${q > 0 ? '+' : '−'}${n}`), ST.phrase(`L’ion a ${chTxt(q)}.`)] });
    if (r < 0.8) return qcmFrom('K12', { level, q: `Un ion possède <b>${Z} protons</b> et <b>${e} électrons</b>. Ses charges en excès sont :`, choices: [
      { t: q > 0 ? 'Positives' : 'Négatives', ok: true },
      { t: q > 0 ? 'Négatives' : 'Positives', msg: q > 0 ? 'Il y a plus de protons (+) que d’électrons (−).' : 'Il y a plus d’électrons (−) que de protons (+).', code: 'signeIon' }],
      why: `${lines} : il reste ${chTxt(q)}.` });
    const neutral = Math.random() < 0.5, ee = neutral ? Z : e;
    return qcmFrom('K12', { level, q: `Une espèce chimique possède <b>${Z} protons</b> et <b>${ee} électrons</b>. Elle est :`, choices: [
      { t: neutral ? 'Électriquement neutre : c’est un atome' : 'Électriquement chargée : c’est un ion', ok: true },
      { t: neutral ? 'Électriquement chargée : c’est un ion' : 'Électriquement neutre : c’est un atome', msg: neutral ? 'Autant de + que de − : aucune charge en excès.' : `${Z} charges + et ${ee} charges − : elles ne se compensent pas toutes.`, code: 'chargeIon' }],
      why: neutral ? `${Z} protons et ${Z} électrons : les charges se compensent, c’est un atome ${dn(aname)}.` : `+${Z} et −${ee} : il reste ${chTxt(q)}, c’est un ion.` });
  }
  if (level === 2) {
    if (r < 0.25) return bank(2);
    if (r < 0.45) {
      const [kn, kx, kq] = pick(ION4_KNOWN), s1 = kq > 0 ? 1 : -1, alt = Math.abs(kq) === 1 ? 2 * s1 : (Math.abs(kq) - 1) * s1;
      return qcmFrom('K12', { level, q: `Quelle est la formule chimique de l’<b>${kn}</b> ?`, choices: [
        { t: ionTxt(kx, kq), ok: true },
        { t: ionTxt(kx, -kq), msg: kq > 0 ? 'Cet ion est positif : il vient d’un atome qui a perdu des électrons.' : 'Cet ion est négatif : il vient d’un atome qui a gagné un électron.', code: 'signeIon' },
        { t: ionTxt(kx, alt), msg: 'Ce n’est pas le bon nombre de charges : revois le tableau des ions à connaître.', code: 'formIon' }],
        why: `À connaître par cœur : ${kn} → ${ionTxt(kx, kq)}.` });
    }
    if (r < 0.75) return qcmFrom('K12', { level, q: `Un ion possède <b>${Z} protons</b> (c’est du ${aname}, symbole ${X}) et <b>${e} électrons</b>. Quelle est sa formule chimique ?`, choices: ionChoices4(X, q, e),
      why: `${lines} : il reste ${chTxt(q)}. On l’écrit en haut à droite du symbole : ${I}.` });
    return qcmFrom('K12', { level, q: `L’atome ${dn(aname)} (${Z} protons, ${Z} électrons) <b>${q > 0 ? 'perd' : 'gagne'} ${n} électron${pl4(n)}</b>. Quelle est la formule de l’ion formé ?`, choices: ionChoices4(X, q, e),
      why: `Il possède maintenant ${e} électrons : ${lines}, soit ${chTxt(q)} → ${I}.` });
  }
  if (r < 0.25) return bank(3);
  if (r < 0.5) return qcmFrom('K12', { level, q: `Quelle est la composition exacte de l’ion <b>${I}</b> ? L’atome ${dn(aname)} s’écrit ${nuc(A, Z, X)}.`, choices: [
    { t: `${Z} protons, ${N} neutrons, ${e} électrons`, ok: true },
    { t: `${Z} protons, ${N} neutrons, ${Z} électrons`, msg: 'Ça, c’est l’atome (neutre). L’ion n’a pas le même nombre d’électrons.', code: 'chargeIon' },
    { t: `${Z} protons, ${N} neutrons, ${Z + q} électrons`, msg: q > 0 ? 'Charge + : l’atome a PERDU des électrons, il en a moins.' : 'Charge − : l’atome a GAGNÉ des électrons, il en a plus.', code: 'signeIon' },
    { t: `${e} protons, ${N} neutrons, ${Z} électrons`, msg: 'Le noyau ne change pas : ce sont les électrons qui changent, pas les protons.', code: 'noyauIon' }],
    why: `Noyau inchangé : ${Z} protons, ${A} − ${Z} = ${N} neutrons. Électrons : ${Z} ${q > 0 ? '−' : '+'} ${n} = ${e}.` });
  if (r < 0.75) return num({ skill: 'K12', level, q: `Combien de <b>neutrons</b> possède l’ion <b>${I}</b> ? L’atome ${dn(aname)} s’écrit ${nuc(A, Z, X)}.`, unit: 'neutrons', ans: N,
    errs: [{ v: A, code: 'neutA', msg: `${A}, ce sont les nucléons. Retire les ${Z} protons.` }, { v: e, code: 'question', msg: `${e}, ce sont les électrons de l’ion. On demande les neutrons.` }, { v: N - q, code: 'noyauIon', msg: 'Les neutrons sont dans le noyau : la charge de l’ion ne les change pas.' }]
      .filter((x, i, a) => x.v !== N && a.findIndex((d) => d.v === x.v) === i),
    hints: ['Le noyau de l’ion est le même que celui de l’atome.', `${A} − ${Z}`],
    sol: [ST.formule('le noyau ne change pas : neutrons = A − Z'), ST.calc(`${A} − ${Z} = ${N} neutrons`), ST.phrase(`L’ion ${I} contient ${Z} protons, ${N} neutrons et ${e} électrons.`)] });
  return num({ skill: 'K12', level, q: `L’ion <b>${I}</b> possède <b>${e} électrons</b>. Combien de <b>protons</b> possède-t-il ?`, unit: 'protons', ans: Z,
    errs: [{ v: e, code: 'chargeIon', msg: 'S’il avait autant de protons que d’électrons, il serait neutre.' }, { v: e - q, code: 'signeIon', msg: q > 0 ? 'Ion positif : il a PLUS de protons que d’électrons.' : 'Ion négatif : il a MOINS de protons que d’électrons.' }],
    hints: [q > 0 ? `${chTxt(q)} : il y a ${n} proton${pl4(n)} de plus que d’électrons.` : `${chTxt(q)} : il y a ${n} électron${pl4(n)} de plus que de protons.`, `${e} ${q > 0 ? '+' : '−'} ${n}`],
    sol: [ST.formule(q > 0 ? 'ion positif : protons = électrons + charges en excès' : 'ion négatif : protons = électrons − charges en excès'), ST.calc(`${e} ${q > 0 ? '+' : '−'} ${n} = ${Z} protons`), ST.phrase(`L’ion ${I} possède ${Z} protons : c’est bien du ${aname}.`)] });
}

/* ---------- K13 : compter des atomes ---------- */
const K13_BANK = [
  { level: 1, q: 'Pour savoir combien d’atomes on peut aligner sur une longueur, on calcule :', choices: [
    { t: 'Longueur ÷ diamètre d’un atome', ok: true },
    { t: 'Longueur ÷ rayon d’un atome', msg: 'Un atome occupe toute sa largeur : son diamètre, soit 2 fois le rayon.', code: 'rayonDiam' },
    { t: 'Longueur × diamètre d’un atome', msg: 'On cherche combien de fois le diamètre « rentre » dans la longueur : c’est une division.', code: 'formule' }],
    why: 'Combien de fois la largeur d’un atome rentre-t-elle dans la longueur ? Une division.' },
  { level: 1, q: 'Pour savoir combien d’atomes contient un objet, on calcule :', choices: [
    { t: 'Masse de l’objet ÷ masse d’un atome', ok: true },
    { t: 'Masse d’un atome ÷ masse de l’objet', msg: 'Division à l’envers : le résultat serait minuscule.', code: 'inverse' },
    { t: 'Masse de l’objet × masse d’un atome', msg: 'On cherche combien de fois la masse d’un atome rentre dans celle de l’objet : une division.', code: 'formule' }],
    why: 'N = masse de l’objet ÷ masse d’un atome, avec les deux masses en kg.' },
  { level: 1, q: 'Dans 1 g d’aluminium, le nombre d’atomes est :', choices: [
    { t: 'Gigantesque (un 2 suivi de 22 zéros)', ok: true },
    { t: 'Environ un millier', msg: 'Un atome est si léger qu’il en faut des milliers de milliards de milliards pour faire 1 g.', code: 'notion' },
    { t: 'Plus petit que 1', msg: 'Un nombre d’atomes plus petit que 1 n’a pas de sens : la division a dû être faite à l’envers.', code: 'inverse' }],
    why: '0,001 ÷ 4,51 × 10⁻²⁶ ≈ 2,2 × 10²² atomes.' },
];
function genK13(level) {
  const r = Math.random();
  if (level === 1) {
    if (r < 0.25) return qcmFrom('K13', pickFresh(K13_BANK));
    if (r < 0.5) {
      const L = pick([2.5, 5, 1.5, 10, 0.5, 3, 4]), ans = L / 100;
      return num({ skill: 'K13', level, tol: ans * 0.005, q: `Convertis <b>${fr(L, 1)} cm</b> en mètres.`, unit: 'm', ans,
        errs: [{ v: L * 100, code: 'noconv', msg: 'Un mètre, c’est 100 cm : en mètres, le nombre devient plus petit.' }, { v: L / 10, code: 'p10', msg: '1 m = 100 cm : on divise par 100, pas par 10.' }, { v: L / 1000, code: 'p10', msg: '1 m = 100 cm : on divise par 100, pas par 1 000.' }],
        hints: ['1 m = 100 cm.', `${fr(L, 1)} ÷ 100`], sol: [ST.conv(`${fr(L, 1)} cm = ${fr(L, 1)} ÷ 100 = ${fr(ans, 3)} m`)] });
    }
    if (r < 0.75) {
      const m = pick([1, 2, 5, 0.5, 10, 3]), ans = m / 1000;
      return num({ skill: 'K13', level, tol: ans * 0.005, q: `Convertis <b>${fr(m, 1)} g</b> en kilogrammes.`, unit: 'kg', ans,
        errs: [{ v: m * 1000, code: 'noconv', msg: 'Un kilogramme, c’est 1 000 g : en kg, le nombre devient plus petit.' }, { v: m / 100, code: 'p10', msg: '1 kg = 1 000 g : on divise par 1 000.' }, { v: m / 10000, code: 'p10', msg: '1 kg = 1 000 g : on divise par 1 000.' }],
        hints: ['1 kg = 1 000 g.', `${fr(m, 1)} ÷ 1 000`], sol: [ST.conv(`${fr(m, 1)} g = ${fr(m, 1)} ÷ 1 000 = ${fr(ans, 4)} kg`)] });
    }
    const [X, rad] = pick(RAD4), name = atomOf(X)[1];
    return num({ skill: 'K13', level, q: `Le rayon d’un atome ${dn(name)} vaut <b>${fr(rad)} × 10⁻¹⁰ m</b>. Combien vaut son <b>diamètre</b> ? Réponds en « × 10⁻¹⁰ m ».`, unit: '× 10⁻¹⁰ m', ans: 2 * rad,
      errs: [{ v: rad / 2, code: 'rayonDiam', msg: 'Le diamètre est le DOUBLE du rayon, pas la moitié.' }, { v: rad, code: 'rayonDiam', msg: 'Ça, c’est le rayon. Le diamètre vaut 2 fois le rayon.' }],
      hints: ['Diamètre = 2 × rayon.', `2 × ${fr(rad)}`], sol: [ST.formule('diamètre = 2 × rayon'), ST.calc(`2 × ${fr(rad)} × 10⁻¹⁰ = ${fr(2 * rad)} × 10⁻¹⁰ m`)] });
  }
  if (level === 2 || r < 0.35) {
    const [txt, X, m] = pick([['1 g d’aluminium', 'Al', 1], ['2 g d’aluminium', 'Al', 2], ['0,5 g d’aluminium', 'Al', 0.5], ['5 g de fer', 'Fe', 5], ['1 g de fer', 'Fe', 1], ['3 g de cuivre', 'Cu', 3], ['1 g de cuivre', 'Cu', 1], ['1 g de carbone', 'C', 1], ['10 g de zinc', 'Zn', 10]]);
    const name = atomOf(X)[1], ma = mAt4(X), kg = m / 1000, ans = kg / ma;
    return num({ skill: 'K13', level, sci: true, q: `Combien y a-t-il d’atomes dans <b>${txt}</b> ? Un atome ${dn(name)} a une masse de <b>${sciTxt(ma)} kg</b>.`, unit: 'atomes', ans,
      errs: [{ v: m / ma, code: 'noconv', msg: `La masse de l’atome est en kg : convertis d’abord ${fr(m, 1)} g en kg (÷ 1 000).` }, { v: ma / kg, code: 'inverse', msg: 'Division à l’envers : masse de l’objet ÷ masse d’un atome.' }, { v: ma / m, code: 'inverse', msg: 'Division à l’envers : masse de l’objet ÷ masse d’un atome.' }],
      hints: ['Nombre d’atomes = masse de l’objet ÷ masse d’un atome, les deux en kg.', `${fr(m, 1)} g = ${fr(kg, 4)} kg, puis ${fr(kg, 4)} ÷ (${sciTxt(ma)})`],
      sol: [ST.cherche('un nombre d’atomes.'), ST.formule('N = masse de l’objet ÷ masse d’un atome'), ST.conv(`${fr(m, 1)} g = ${fr(kg, 4)} kg`), ST.calc(`N = ${fr(kg, 4)} ÷ (${sciTxt(ma)}) ≈ ${sciTxt(ans)}`),
            ST.phrase(`Il y a environ ${sciTxt(ans)} atomes dans ${txt}.`), ST.piege('laisser la masse en grammes : le résultat serait 1 000 fois trop grand.')] });
  }
  const [X, rad] = pick(RAD4), name = atomOf(X)[1], L = pick([2.5, 1, 5, 10, 0.5, 4]), d = 2 * rad * 1e-10, ans = (L / 100) / d;
  return num({ skill: 'K13', level, sci: true, q: `Le rayon d’un atome ${dn(name)} vaut <b>${fr(rad)} × 10⁻¹⁰ m</b>. Combien d’atomes ${dn(name)} peut-on aligner sur une distance de <b>${fr(L, 1)} cm</b> ?`, unit: 'atomes', ans,
    errs: [{ v: 2 * ans, code: 'rayonDiam', msg: 'Tu as divisé par le rayon. Un atome occupe son diamètre : 2 × rayon.' }, { v: ans * 100, code: 'noconv', msg: `Le rayon est en mètres : convertis d’abord ${fr(L, 1)} cm en m (÷ 100).` }, { v: 200 * ans, code: 'noconv', msg: 'Deux oublis : convertir les cm en m, et prendre le diamètre (2 × rayon).' }, { v: d / (L / 100), code: 'inverse', msg: 'Division à l’envers : longueur ÷ diamètre.' }],
    hints: ['Nombre d’atomes = longueur ÷ diamètre d’un atome, les deux en mètres.', `Diamètre = ${fr(2 * rad)} × 10⁻¹⁰ m ; ${fr(L, 1)} cm = ${fr(L / 100, 3)} m`],
    sol: [ST.cherche('un nombre d’atomes.'), ST.formule('N = longueur ÷ diamètre d’un atome'), ST.conv(`diamètre = 2 × ${fr(rad)} × 10⁻¹⁰ = ${fr(2 * rad)} × 10⁻¹⁰ m ; ${fr(L, 1)} cm = ${fr(L / 100, 3)} m`),
          ST.calc(`N = ${fr(L / 100, 3)} ÷ (${fr(2 * rad)} × 10⁻¹⁰) ≈ ${sciTxt(ans)}`), ST.phrase(`On peut aligner environ ${sciTxt(ans)} atomes ${dn(name)} sur ${fr(L, 1)} cm.`),
          ST.piege('à la calculatrice, mets le bas de la division entre parenthèses.')] });
}

Object.assign(GENERATORS, { K11: genK11, K12: genK12, K13: genK13 });

/* ---------- Rédaction (mode « Rédiger » et contrôle type) ---------- */
const K9R = {
  /* Ex. 1 : deux atomes du même élément (cahier : ¹⁶O et ¹⁷O) */
  iso(lv, real) {
    const [X, name, Z, As] = real ? ISO4[3] : pick(ISO4), [A1, A2] = real ? [16, 17] : shuffle(As).slice(0, 2).sort((a, b) => a - b), dN = A2 - A1;
    return stepsItem('K11', lv, `Voici deux atomes ${dn(name)} : ${nuc(A1, Z, X)} et ${nuc(A2, Z, X)}. Donne la composition de chacun, puis dis ce qu’ils ont en commun et lequel est le plus lourd.`, [
      nStep('Les protons', 'Combien de protons dans chacun des deux atomes ?', Z, 'protons', null, [{ v: A1, code: 'zA', msg: 'Les protons, c’est le nombre du bas.' }, { v: A2, code: 'zA', msg: 'Les protons, c’est le nombre du bas.' }].filter((e) => e.v !== Z), `🪪 ${Z} protons et ${Z} électrons pour les deux (le nombre du bas)`),
      nStep('Neutrons du premier', `Neutrons de l’atome à ${A1} nucléons :`, A1 - Z, 'neutrons', null, [{ v: A1, code: 'neutA', msg: `Neutrons = A − Z = ${A1} − ${Z}.` }].filter((e) => e.v !== A1 - Z), `🧮 premier : ${A1} − ${Z} = ${A1 - Z} neutrons`),
      nStep('Neutrons du second', `Neutrons de l’atome à ${A2} nucléons :`, A2 - Z, 'neutrons', null, [{ v: A2, code: 'neutA', msg: `Neutrons = A − Z = ${A2} − ${Z}.` }, { v: A1 - Z, code: 'isotope', msg: 'Ça, c’est le premier atome.' }].filter((e) => e.v !== A2 - Z), `🧮 second : ${A2} − ${Z} = ${A2 - Z} neutrons`),
      pStep(`Les deux atomes ont ${Z} protons et ${Z} électrons ; le second a ${dN} neutron${pl4(dN)} de plus : il est plus lourd.`,
        [[`Les deux atomes ont ${Z} protons ; le second a ${dN} proton${pl4(dN)} de plus : il est plus lourd.`, 'Avec un proton de plus, ce ne serait plus le même élément. Ce sont les neutrons qui changent.'],
         ['Les deux atomes ont le même nombre de neutrons et la même masse.', `Non : ${A1 - Z} neutrons pour l’un, ${A2 - Z} pour l’autre.`]]),
    ]);
  },
  /* Ex. 2 et 3 : un atome devient un ion (cahier : sodium, puis oxygène) */
  form(lv, real, sign) {
    const pool = ION4.filter(([, q]) => (q > 0) === (sign > 0));
    const [X, q, iname] = real ? ION4.find(([x]) => x === (sign > 0 ? 'Na' : 'O')) : pick(pool), [, aname, Z, A] = atomOf(X), n = Math.abs(q), e = Z - q, I = ionTxt(X, q);
    return stepsItem('K12', lv, `L’atome ${dn(aname)} ${nuc(A, Z, X)} <b>${q > 0 ? 'perd' : 'gagne'} ${n} électron${pl4(n)}</b>. Compte les charges de l’ion formé, puis écris sa formule chimique.`, [
      nStep('Les charges +', 'Combien de protons (charges positives) dans l’ion ?', Z, 'protons', null, [{ v: e, code: 'noyauIon', msg: 'Le noyau ne change pas : l’ion garde tous les protons de l’atome.' }, { v: A, code: 'zA', msg: 'Les protons, c’est le nombre du bas.' }], `➕ ${Z} protons : +${Z} (le noyau ne change pas)`),
      nStep('Les charges −', 'Combien d’électrons (charges négatives) dans l’ion ?', e, 'électrons', null, [{ v: Z + q, code: 'signeIon', msg: q > 0 ? 'Il en a perdu : il en a moins que l’atome.' : 'Il en a gagné : il en a plus que l’atome.' }, { v: Z, code: 'signeIon', msg: `${Z}, c’est l’atome. L’ion en a ${q > 0 ? 'perdu' : 'gagné'} ${n}.` }], `➖ ${Z} ${q > 0 ? '−' : '+'} ${n} = ${e} électrons : −${e}`),
      { kind: 'qcm', label: 'Le bilan', prompt: `+${Z} et −${e} : que reste-t-il ?`, choices: [
        { t: chTxt(q)[0].toUpperCase() + chTxt(q).slice(1), ok: true },
        { t: chTxt(-q)[0].toUpperCase() + chTxt(-q).slice(1), msg: q > 0 ? 'Il y a plus de + que de − : ce qui reste est positif.' : 'Il y a plus de − que de + : ce qui reste est négatif.', code: 'signeIon' },
        { t: 'Aucune charge en excès', msg: `${Z} et ${e} ne sont pas égaux : les charges ne se compensent pas toutes.`, code: 'chargeIon' }],
        show: `⚖️ +${Z} et −${e} : il reste ${chTxt(q)} → l’ion est électriquement chargé` },
      { kind: 'qcm', label: 'La formule', prompt: 'Quelle est la formule chimique de l’ion ?', choices: ionChoices4(X, q, e), show: `🔋 formule chimique de l’ion : ${I}` },
      pStep(`L’${iname} ${I} possède ${Z} protons et ${e} électrons : ${chTxt(q)}.`,
        [[`L’ion ${I} possède ${Z} protons et ${Z} électrons.`, 'Ça, c’est l’atome : il est neutre.'], [`L’atome ${dn(aname)} possède ${Z} protons.`, 'C’est une donnée : on demande l’ion.']]),
    ]);
  },
  /* Ex. 4 : composition exacte d'un ion (cahier : Al³⁺) */
  compo(lv, real) {
    const [X, q, iname] = real ? ION4.find(([x]) => x === 'Al') : pick(ION4), [, aname, Z, A] = atomOf(X), n = Math.abs(q), e = Z - q, I = ionTxt(X, q), N = A - Z;
    return stepsItem('K12', lv, `L’${iname} a pour formule chimique <b>${I}</b>. L’atome ${dn(aname)} s’écrit ${nuc(A, Z, X)}. Donne la composition exacte de cet ion.`, [
      nStep('Les protons', 'Combien de protons ?', Z, 'protons', null, [{ v: e, code: 'noyauIon', msg: 'Le noyau ne change pas : même nombre de protons que l’atome.' }, { v: A, code: 'zA', msg: 'Les protons, c’est le nombre du bas.' }], `🪪 ${Z} protons (le noyau ne change pas)`),
      nStep('Les neutrons', 'Combien de neutrons ?', N, 'neutrons', null, [{ v: A, code: 'neutA', msg: `Neutrons = A − Z = ${A} − ${Z}.` }].filter((x) => x.v !== N), `🧮 ${A} − ${Z} = ${N} neutrons`),
      { kind: 'qcm', label: 'Lire la charge', prompt: `Que dit la charge de ${I} ?`, choices: [
        { t: `L’atome a ${q > 0 ? 'perdu' : 'gagné'} ${n} électron${pl4(n)}`, ok: true },
        { t: `L’atome a ${q > 0 ? 'gagné' : 'perdu'} ${n} électron${pl4(n)}`, msg: q > 0 ? 'Charge + : il manque des électrons, il en a perdu.' : 'Charge − : il y a des électrons en plus, il en a gagné.', code: 'signeIon' },
        { t: `L’atome a ${q > 0 ? 'gagné' : 'perdu'} ${n} proton${pl4(n)}`, msg: 'Le noyau ne change pas.', code: 'noyauIon' }],
        show: `🔋 ${I} : ${chTxt(q)}, donc ${n} électron${pl4(n)} ${q > 0 ? 'perdu' : 'gagné'}${pl4(n)}` },
      nStep('Les électrons', 'Combien d’électrons ?', e, 'électrons', null, [{ v: Z, code: 'chargeIon', msg: 'C’est le nombre d’électrons de l’atome, pas de l’ion.' }, { v: Z + q, code: 'signeIon', msg: q > 0 ? 'Il en a perdu : il en a moins.' : 'Il en a gagné : il en a plus.' }], `➖ ${Z} ${q > 0 ? '−' : '+'} ${n} = ${e} électrons`),
      pStep(`L’ion ${I} contient ${Z} protons, ${N} neutrons et ${e} électrons.`,
        [[`L’ion ${I} contient ${Z} protons, ${N} neutrons et ${Z} électrons.`, 'C’est la composition de l’atome, pas de l’ion.'], [`L’ion ${I} contient ${e} protons, ${N} neutrons et ${Z} électrons.`, 'Ce sont les électrons qui changent, pas les protons.']]),
    ]);
  },
  /* Ex. 5 : compter des atomes (cahier : 1 g d'aluminium, 2,5 cm) */
  compte(lv, real) {
    const [X, rad] = real ? RAD4[0] : pick(RAD4.slice(0, 3)), name = atomOf(X)[1], m = real ? 1 : pick([1, 2, 5]), L = real ? 2.5 : pick([2.5, 5, 1, 10]);
    const ma = mAt4(X), kg = m / 1000, N1 = kg / ma, d = 2 * rad * 1e-10, N2 = (L / 100) / d;
    return stepsItem('K13', lv, `a) Combien y a-t-il d’atomes ${dn(name)} dans <b>${m} g</b> ${dn(name)} ? Un atome a une masse de ${sciTxt(ma)} kg.<br>b) Le rayon d’un atome ${dn(name)} vaut <b>${fr(rad)} × 10⁻¹⁰ m</b>. Combien peut-on en aligner sur une distance de <b>${fr(L, 1)} cm</b> ?`, [
      nStep('a) En kilogrammes', `${m} g = … kg`, kg, 'kg', null, [{ v: m * 1000, code: 'noconv', msg: 'En kg, le nombre est plus petit : on divise par 1 000.' }], `🔁 ${m} g = ${fr(kg, 4)} kg`, kg * 0.005),
      sciStep('a) Le nombre d’atomes', `${fr(kg, 4)} ÷ (${sciTxt(ma)}) =`, N1, 'atomes', null, [{ v: N1 * 1000, code: 'noconv', msg: 'La masse de l’objet doit être en kg.' }, { v: ma / kg, code: 'inverse', msg: 'Division à l’envers.' }], `🧮 N = ${fr(kg, 4)} ÷ (${sciTxt(ma)}) ≈ ${sciTxt(N1)} atomes`),
      nStep('b) Le diamètre', 'Diamètre = 2 × rayon = … × 10⁻¹⁰ m', 2 * rad, '', null, [{ v: rad / 2, code: 'rayonDiam', msg: 'Le diamètre est le double du rayon.' }, { v: rad, code: 'rayonDiam', msg: 'Ça, c’est le rayon.' }], `📏 diamètre = 2 × ${fr(rad)} × 10⁻¹⁰ = ${fr(2 * rad)} × 10⁻¹⁰ m ; ${fr(L, 1)} cm = ${fr(L / 100, 3)} m`),
      sciStep('b) Les atomes alignés', `${fr(L / 100, 3)} ÷ (${fr(2 * rad)} × 10⁻¹⁰) =`, N2, 'atomes', null, [{ v: 2 * N2, code: 'rayonDiam', msg: 'Tu as divisé par le rayon : il faut le diamètre.' }, { v: N2 * 100, code: 'noconv', msg: 'La longueur doit être en mètres.' }], `🧮 N = ${fr(L / 100, 3)} ÷ (${fr(2 * rad)} × 10⁻¹⁰) ≈ ${sciTxt(N2)} atomes`),
      pStep(`Il y a environ ${sciTxt(N1)} atomes dans ${m} g ${dn(name)} ; on peut en aligner environ ${sciTxt(N2)} sur ${fr(L, 1)} cm.`,
        [[`Un atome ${dn(name)} a une masse de ${sciTxt(ma)} kg et un rayon de ${fr(rad)} × 10⁻¹⁰ m.`, 'Ce sont les données : on demande deux nombres d’atomes.'],
         [`Il y a environ ${sciTxt(N1)} atomes dans ${m} g ; on peut en aligner environ ${sciTxt(2 * N2)} sur ${fr(L, 1)} cm.`, 'Le second nombre vient d’une division par le rayon : il faut le diamètre.']]),
    ]);
  },
};
const CTRLI_ORDER = [['iso', 'Ex. 1', 'Deux atomes du même élément'], ['pos', 'Ex. 2', 'Un ion positif'], ['neg', 'Ex. 3', 'Un ion négatif'], ['compo', 'Ex. 4', 'Composition d’un ion'], ['compte', 'Ex. 5', 'Compter des atomes']];
const ctrlIItem = (k, lv, real) => (k === 'pos' ? K9R.form(lv, real, 1) : k === 'neg' ? K9R.form(lv, real, -1) : K9R[k](lv, real));
REDAC_SKILLS.push('K12', 'K13');
(() => {
  const base = genRedac;
  genRedac = function (skill, level) {
    const lv = Math.max(1, Math.min(3, level || 1));
    if (skill === 'K12') return pick([() => K9R.form(lv, false, 1), () => K9R.form(lv, false, -1), () => K9R.compo(lv, false)])();
    if (skill === 'K13') return K9R.compte(lv, false);
    return base(skill, level);
  };
})();

/* ---------- « Contrôle type : les ions » ---------- */
function ctrlIState() { S.ctrlI = S.ctrlI || { lv: 1, best: {}, hist: [] }; return S.ctrlI; }
function screenCtrlI() {
  const C = ctrlIState(), last = C.hist[C.hist.length - 1];
  render(`
    <div class="row between" style="margin-bottom:10px"><button class="link" id="cBack">← Accueil</button><span class="chip">📝 Contrôle type</span></div>
    <div class="card hero stack">
      <h2>Les ions</h2>
      <p class="muted" style="margin:0">5 exercices comme dans ton cahier : deux atomes du même élément, un ion positif, un ion négatif, la composition exacte d’un ion, compter des atomes. Tu rédiges chaque exercice comme sur ta copie, puis tu obtiens une note sur 20.</p>
      <div class="tip" style="color:var(--ink)">🎚️ <b>Niveau d’aide ${C.lv}/3</b> : ${CTRL_LV[C.lv]}.<br><span class="small">Avec 14/20 ou plus, l’aide diminue la fois suivante.</span></div>
      ${last ? `<p class="small" style="margin:0">Dernier essai : <b>${fr(last.note, 1)}/20</b> (aide ${last.lv}/3) • Record « comme le jour J » : <b>${C.best[3] != null ? fr(C.best[3], 1) + '/20' : 'pas encore'}</b></p>` : ''}
      <button class="link" id="cCalc" style="padding:0;text-align:left">🧮 Comment taper 4,51 × 10⁻²⁶ sur ma calculatrice ?</button>
    </div>
    <div class="stack">
      <button class="btn" id="cReal">▶ Le sujet du cahier (oxygène, sodium, aluminium)</button>
      <button class="btn ghost" id="cNew">🔀 Un nouveau sujet (autres atomes)</button>
      ${C.lv > 1 ? '<button class="link" id="cHelp">Je préfère plus d’aide cette fois</button>' : ''}
    </div>`);
  document.getElementById('cBack').onclick = screenHome;
  document.getElementById('cCalc').onclick = () => openCalc();
  const go = (real, lv) => { startRun('redac', null, CTRLI_ORDER.map(([k]) => Object.assign(ctrlIItem(k, lv, real), { ctrlKey: k }))); RUN.ctrlI = { real, lv }; };
  document.getElementById('cReal').onclick = () => go(true, C.lv);
  document.getElementById('cNew').onclick = () => go(false, C.lv);
  const h = document.getElementById('cHelp'); if (h) h.onclick = () => go(false, C.lv - 1);
}
function finishCtrlI() {
  stopTimer();
  const run = RUN, res = run.results, C = ctrlIState();
  const streakMsg = touchStreak();
  S.sessions++;
  const pts = res.map(ctrlPoints), note = Math.round(pts.reduce((a, b) => a + b, 0) * 2) / 2, prevBest = C.best[run.ctrlI.lv];
  C.hist.push({ date: todayStr(), lv: run.ctrlI.lv, note, real: run.ctrlI.real }); C.hist = C.hist.slice(-20);
  if (prevBest == null || note > prevBest) C.best[run.ctrlI.lv] = note;
  let up = '';
  if (note >= 14 && run.ctrlI.lv === C.lv && C.lv < 3) { C.lv++; up = `Prochaine fois : niveau d’aide ${C.lv}/3 (${CTRL_LV[C.lv].toLowerCase()}).`; }
  addXP(30 + Math.round(note) * 2);
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${note >= 14 ? '🏆' : note >= 10 ? '💪' : '🌱'}</div>
      <h2>Contrôle type terminé</h2>
      <div class="big-num">${fr(note, 1)}/20</div>
      <p class="muted">${run.ctrlI.lv === 3 ? 'Sans aide, comme le jour J.' : `Avec l’aide de niveau ${run.ctrlI.lv}/3.`} ${prevBest != null && note > prevBest ? `Nouveau record à ce niveau (avant : ${fr(prevBest, 1)}).` : ''}</p>
      ${up ? `<p><b>⬆️ ${up}</b></p>` : note < 14 ? '<p class="small">Les exercices ratés reviennent dans « À revoir » demain. Retente le contrôle type dans quelques jours.</p>' : ''}
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <h3 style="margin:8px 4px">Ta copie corrigée</h3>
    ${res.map((r, i) => `<div class="card"><div class="row between"><span class="chip">${CTRLI_ORDER[i] ? CTRLI_ORDER[i][1] + ' • ' + CTRLI_ORDER[i][2] : 'Q' + (i + 1)}</span><b>${fr(pts[i], 1)}/4</b></div>
      <details style="margin-top:8px"><summary class="small"><b>Énoncé et correction</b></summary><p class="small">${r.item.q}</p>
      <div class="fb sol small"><ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol></div></details></div>`).join('')}
    <div class="stack"><button class="btn" id="cAgain">🔀 Un nouveau sujet</button><button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
  document.getElementById('home').onclick = screenHome;
  document.getElementById('cAgain').onclick = screenCtrlI;
}
(() => {
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(() => {
    const acts = app.querySelector('.acts');
    if (!acts || acts.querySelector('#ctrlIAct') || typeof S === 'undefined' || !S || !S.pseudo) return;
    const C = S.ctrlI || {}, last = (C.hist || [])[(C.hist || []).length - 1];
    const b = document.createElement('button');
    b.className = 'act'; b.id = 'ctrlIAct'; b.style.minHeight = '0';
    b.innerHTML = `<span class="ic">📝</span><b>Contrôle type : les ions</b><span class="small muted">${last ? `Dernière note ${fr(last.note, 1)}/20 • aide ${C.lv}/3` : '5 exercices comme dans ton cahier, note sur 20'}</span>`;
    b.onclick = screenCtrlI;
    acts.insertBefore(b, acts.firstChild);
  }).observe(app, { childList: true, subtree: true });
})();

/* ---------- « Bats ta note » : copies à corriger sur les ions ---------- */
if (typeof CHIM_BAT !== 'undefined') CHIM_BAT.push(
  { skill: 'K12', level: 2, q: '🕵️ Chasse à l’erreur : « L’ion sodium a 11 protons et 10 électrons : il a 1 charge négative en excès, sa formule est Na⁻ ». Où est l’erreur ?', choices: [
    { t: 'Il reste une charge positive : +11 et −10 donnent Na⁺', ok: true },
    { t: 'L’ion sodium a 12 électrons', msg: 'Non : il en a bien 10, l’atome en a perdu un.', code: 'signeIon' },
    { t: 'Il n’y a pas d’erreur', msg: '11 charges + contre 10 charges − : ce qui reste est positif.', code: 'signeIon' }],
    why: '+11 et −10 : il reste +1, une charge positive en excès. Formule : Na⁺.' },
  { skill: 'K12', level: 2, q: '🕵️ Chasse à l’erreur : « L’ion O²⁻ a gagné 2 électrons : il possède 8 protons et 6 électrons ». Où est l’erreur ?', choices: [
    { t: 'Gagner, c’est en avoir plus : 8 + 2 = 10 électrons', ok: true },
    { t: 'Il possède 10 protons', msg: 'Le noyau ne change pas : 8 protons.', code: 'noyauIon' },
    { t: 'Il n’y a pas d’erreur', msg: 'Avec 6 électrons pour 8 protons, la charge serait positive.', code: 'signeIon' }],
    why: '8 protons (+8) et 10 électrons (−10) : 2 charges négatives en excès.' },
  { skill: 'K12', level: 3, q: `🕵️ Chasse à l’erreur : « L’ion Al³⁺ (atome ${nuc(27, 13, 'Al')}) contient 10 protons, 14 neutrons et 13 électrons ». Où est l’erreur ?`, choices: [
    { t: 'Protons et électrons sont échangés : 13 protons et 10 électrons', ok: true },
    { t: 'Il contient 27 neutrons', msg: '27, ce sont les nucléons : 27 − 13 = 14 neutrons, c’est juste.', code: 'neutA' },
    { t: 'Il contient 16 électrons', msg: 'Charge 3+ : il a perdu 3 électrons, 13 − 3 = 10.', code: 'signeIon' }],
    why: 'Le noyau ne change pas (13 protons, 14 neutrons). Ce sont les électrons qui passent de 13 à 10.' },
  { skill: 'K11', level: 2, q: `🕵️ Chasse à l’erreur : « ${nuc(17, 8, 'O')} est plus lourd que ${nuc(16, 8, 'O')} car il a un proton de plus ». Où est l’erreur ?`, choices: [
    { t: 'Il a un neutron de plus, pas un proton', ok: true },
    { t: 'Il a un électron de plus', msg: 'Les deux atomes ont 8 électrons.', code: 'isotope' },
    { t: 'Il n’est pas plus lourd', msg: 'Si : 17 nucléons contre 16.', code: 'isotope' }],
    why: 'Les deux ont 8 protons. 17 − 8 = 9 neutrons contre 8 : un neutron de plus.' },
  { skill: 'K13', level: 3, q: '🕵️ Chasse à l’erreur : « Rayon d’un atome : 1,25 × 10⁻¹⁰ m. Sur 2,5 cm, on aligne 0,025 ÷ (1,25 × 10⁻¹⁰) = 2 × 10⁸ atomes ». Où est l’erreur ?', choices: [
    { t: 'Il faut diviser par le diamètre : 2,5 × 10⁻¹⁰ m', ok: true },
    { t: '2,5 cm ne font pas 0,025 m', msg: 'Si : 2,5 ÷ 100 = 0,025 m.', code: 'noconv' },
    { t: 'Il fallait multiplier', msg: 'Pour savoir combien de fois un atome rentre dans la longueur, on divise.', code: 'formule' }],
    why: 'Un atome occupe son diamètre : 2 × 1,25 = 2,5 × 10⁻¹⁰ m. Résultat : 1 × 10⁸ atomes.' },
  { skill: 'K13', level: 2, q: '🕵️ Chasse à l’erreur : « Dans 1 g d’aluminium : 1 ÷ (4,51 × 10⁻²⁶) = 2,2 × 10²⁵ atomes ». Où est l’erreur ?', choices: [
    { t: 'La masse doit être en kg : 0,001 kg', ok: true },
    { t: 'Il fallait multiplier', msg: 'Nombre d’atomes = masse de l’objet ÷ masse d’un atome : c’est bien une division.', code: 'formule' },
    { t: 'Il n’y a pas d’erreur', msg: 'La masse de l’atome est en kg et celle de l’objet en g : les unités ne vont pas ensemble.', code: 'noconv' }],
    why: '1 g = 0,001 kg. 0,001 ÷ (4,51 × 10⁻²⁶) ≈ 2,2 × 10²² atomes.' },
);

/* ---------- Leçon C9 (insérée juste après C6) ---------- */
Object.assign(SVG, {
  ionNa: ionSvg4(11, 11, 10, 'atome de sodium Na', 'ion sodium Na⁺', 'perd 1 électron'),
  ionO: ionSvg4(8, 8, 10, 'atome d’oxygène O', 'ion oxygène O²⁻', 'gagne 2 électrons'),
});
const tbl4 = (rows) => `<table class="tbl c"><tr><th></th><th>Charges +</th><th>Charges −</th><th>Ce qui reste</th></tr>${rows.map((r) => `<tr>${r.map((c, i) => `<td>${i ? c : `<b>${c}</b>`}</td>`).join('')}</tr>`).join('')}</table>`;

COURS.splice(COURS.findIndex((c) => c.id === 'C6') + 1, 0, {
  id: 'C9', subj: 'chimie', chap: 'Chimie — Les ions', title: 'Les ions : atome neutre, ion chargé', icon: '🔋', examFirst: true,
  cahier: 'les pages « électriquement neutre », « électriquement chargé », l’ion sodium, l’ion oxygène et les trois exercices sur l’aluminium.',
  skills: ['K11', 'K12', 'K13'],
  sections: [
    { title: 'Trois espèces chimiques',
      html: `<p>Dans ton cahier, ton prof a écrit trois <b>espèces chimiques</b> :</p>
        <ul><li>l’<b>atome</b> : il est électriquement neutre ;</li>
        <li>la <b>molécule</b> : plusieurs atomes attachés ensemble, comme H₂O ;</li>
        <li>l’<b>ion</b> : c’est le mot encadré, celui de ce chapitre.</li></ul>
        <p>Un ion ressemble beaucoup à un atome. Une seule chose change : il porte une <b>charge électrique</b>.</p>`,
      retenir: 'Trois espèces chimiques : l’atome, la molécule, l’ion. L’ion porte une charge électrique.',
      quiz: [{ q: 'Laquelle de ces espèces chimiques porte une charge électrique ?', choices: [{ t: 'L’ion', ok: true }, { t: 'L’atome', msg: 'L’atome est électriquement neutre.' }, { t: 'La molécule', msg: 'Une molécule est un assemblage d’atomes : elle est neutre.' }] }] },
    { title: 'Rappel : l’atome est électriquement neutre',
      html: `<p>Prenons l’atome de sodium de ton cahier. Son symbole chimique est <b>Na</b> et il s’écrit ${nuc(23, 11, 'Na')}.</p>
        <ul><li>11 protons : <b>11 charges positives</b> ;</li><li>11 électrons : <b>11 charges négatives</b>.</li></ul>
        <p>Autant de + que de − : les charges se compensent. L’atome est <b>électriquement neutre</b>.</p>
        <div class="ex">Les 23 − 11 = 12 neutrons n’ont pas de charge : on ne les compte pas ici.</div>`,
      retenir: 'Atome : autant de protons (+) que d’électrons (−). Il est électriquement neutre.',
      quiz: [{ q: 'L’atome de sodium a 11 protons. Pourquoi est-il neutre ?', choices: [{ t: 'Il a aussi 11 électrons', ok: true }, { t: 'Il a 12 neutrons', msg: 'Les neutrons n’ont pas de charge : ils n’expliquent pas la neutralité.' }, { t: 'Il n’a pas de charges', msg: 'Il a 11 charges + et 11 charges − : elles se compensent.' }] }] },
    { title: 'Deux atomes d’oxygène : ¹⁶O et ¹⁷O',
      html: `<p>Ton prof a comparé deux atomes d’oxygène.</p>
        <table class="tbl c"><tr><th></th><th>${nuc(16, 8, 'O')}</th><th>${nuc(17, 8, 'O')}</th></tr>
          <tr><td><b>Protons</b></td><td>8</td><td>8</td></tr><tr><td><b>Électrons</b></td><td>8</td><td>8</td></tr>
          <tr><td><b>Neutrons</b></td><td>16 − 8 = 8</td><td>17 − 8 = 9</td></tr></table>
        <p>Même nombre de protons et d’électrons : ce sont deux atomes d’<b>oxygène</b>, tous les deux neutres.</p>
        <p>Le second a <b>un neutron de plus</b> : il est <b>plus lourd</b>. C’est le « + lourd » de ton cahier.</p>
        <p>On appelle ces atomes des <b>isotopes</b>.</p>`,
      retenir: '¹⁶O et ¹⁷O : mêmes protons (8), mêmes électrons (8). Seuls les neutrons changent (8 et 9). ¹⁷O est plus lourd.',
      quiz: [{ q: `Combien de neutrons dans ${nuc(17, 8, 'O')} ?`, choices: [{ t: '9', ok: true }, { t: '17', msg: '17, ce sont les nucléons. Neutrons = 17 − 8 = 9.' }, { t: '8', msg: '8, c’est le nombre de protons. Neutrons = 17 − 8 = 9.' }] },
             { q: 'Un neutron de plus : l’atome est-il toujours neutre ?', choices: [{ t: 'Oui, un neutron n’a pas de charge', ok: true }, { t: 'Non, il devient un ion', msg: 'Un ion se forme quand le nombre d’électrons change, pas celui des neutrons.' }] }] },
    { title: 'L’ion sodium : un électron en moins',
      html: `<p>L’atome de sodium peut <b>perdre un électron</b>. Dans ton cahier : « l’électron sur la dernière couche a disparu ».</p>
        ${SVG.ionNa}
        <p>Le noyau ne change pas : toujours 11 protons. On compte les charges, comme ton prof :</p>
        ${tbl4([['Ion sodium', '11 protons : +11', '10 électrons : −10', '+1']])}
        <p>Il reste <b>1 charge positive en excès</b>. L’atome n’est plus neutre : il est <b>électriquement chargé</b>. C’est un <b>ion</b>.</p>
        <div class="formula">Na⁺</div>
        <p>C’est la <b>formule chimique de l’ion sodium</b>. Le « + » en haut à droite est sa charge électrique.</p>`,
      retenir: 'Ion sodium : 11 protons (+11) et 10 électrons (−10). Il reste 1 charge positive en excès : Na⁺.',
      quiz: [{ q: 'Combien d’électrons possède l’ion Na⁺ ?', choices: [{ t: '10', ok: true }, { t: '11', msg: '11, c’est l’atome. L’ion en a perdu un.' }, { t: '12', msg: 'Il a perdu un électron, il n’en a pas gagné.' }] },
             { q: 'Combien de protons possède l’ion Na⁺ ?', choices: [{ t: '11, comme l’atome', ok: true }, { t: '10', msg: 'Le noyau ne change pas : seuls les électrons changent.' }] }] },
    { title: 'L’ion oxygène : deux électrons en plus',
      html: `<p>Un atome peut aussi <b>gagner</b> des électrons. L’atome d’oxygène en gagne deux.</p>
        ${SVG.ionO}
        ${tbl4([['Ion oxygène', '8 protons : +8', '10 électrons : −10', '−2']])}
        <p>Il reste <b>deux charges négatives en excès</b>.</p>
        <div class="formula">O²⁻</div>
        <p>Le 2 s’écrit <b>avant</b> le signe : « 2− » se lit « deux moins ».</p>
        <div class="ex">Ton prof l’appelle <b>ion oxygène</b>. Son nom officiel est « ion oxyde » : c’est le même ion, O²⁻.</div>`,
      retenir: 'Ion oxygène : 8 protons (+8) et 10 électrons (−10). Il reste 2 charges négatives en excès : O²⁻.',
      quiz: [{ q: 'Dans O²⁻, il y a :', choices: [{ t: '2 électrons de plus que de protons', ok: true }, { t: '2 électrons en tout', msg: 'Il y en a 10. Le 2 compte ceux qui sont en plus.' }, { t: '2 protons de plus que d’électrons', msg: 'La charge serait alors positive.' }] }] },
    { title: 'La méthode en trois lignes',
      html: `<p>Pour trouver la charge et la formule d’un ion, écris toujours ces trois lignes :</p>
        <ul><li><b>Ligne 1</b> : les protons, précédés de +.</li><li><b>Ligne 2</b> : les électrons, précédés de −.</li><li><b>Ligne 3</b> : ce qui reste. C’est la charge en excès.</li></ul>
        ${tbl4([['Ion chlorure', '17 protons : +17', '18 électrons : −18', '−1 → Cl⁻'], ['Ion cuivre II', '29 protons : +29', '27 électrons : −27', '+2 → Cu²⁺']])}
        <p>Puis écris la charge en haut à droite du symbole. Pour une seule charge, on n’écrit pas le 1 : Na⁺, Cl⁻.</p>
        <div class="ex"><b>À retenir :</b> perdre des électrons, c’est perdre des « − ». L’ion devient <b>positif</b>. Gagner des électrons le rend <b>négatif</b>.</div>`,
      retenir: 'Protons : +. Électrons : −. Ce qui reste est la charge en excès, écrite en haut à droite du symbole.',
      quiz: [{ q: 'Un ion a 12 protons et 10 électrons (magnésium, Mg). Sa formule est :', choices: [{ t: 'Mg²⁺', ok: true }, { t: 'Mg²⁻', msg: '+12 et −10 : il reste +2, la charge est positive.' }, { t: 'Mg⁺', msg: 'Il reste 2 charges : il faut écrire le 2.' }] },
             { q: 'Un atome qui perd un électron devient un ion :', choices: [{ t: 'Positif', ok: true }, { t: 'Négatif', msg: 'Il perd une charge − : il lui reste plus de + que de −.' }] }] },
    { title: 'À l’envers : de la formule à la composition',
      html: `<p>C’est l’exercice 3 de ton cahier : « L’ion aluminium a pour formule Al³⁺. Donnez la composition exacte de cet ion. »</p>
        <p>L’atome d’aluminium s’écrit ${nuc(27, 13, 'Al')}.</p>
        <ul><li><b>Protons</b> : 13. Le noyau ne change pas.</li><li><b>Neutrons</b> : 27 − 13 = 14. Le noyau ne change pas.</li>
        <li><b>Électrons</b> : « 3+ » veut dire 3 charges positives en excès. L’atome a <b>perdu 3 électrons</b> : 13 − 3 = 10.</li></ul>
        <div class="formula">Al³⁺ : 13 protons, 14 neutrons, 10 électrons</div>
        <p>Vérifie avec les trois lignes : +13 et −10, il reste bien +3.</p>`,
      retenir: 'Dans un ion, le noyau est celui de l’atome. Charge + : électrons = Z − charge. Charge − : électrons = Z + charge.',
      quiz: [{ q: 'L’ion Cl⁻ vient de l’atome de chlore (17 protons). Combien d’électrons possède-t-il ?', choices: [{ t: '18', ok: true }, { t: '16', msg: 'Charge − : il a gagné un électron, 17 + 1 = 18.' }, { t: '17', msg: '17, c’est l’atome. L’ion en a un de plus.' }] }] },
    { title: 'Les ions à connaître',
      html: `<p>Ces ions reviennent souvent. Apprends leur nom et leur formule.</p>
        <table class="tbl c"><tr><th>Ions positifs</th><th>Ions négatifs</th></tr>
          <tr><td>ion sodium Na⁺</td><td>ion chlorure Cl⁻</td></tr><tr><td>ion hydrogène H⁺</td><td>ion hydroxyde HO⁻</td></tr>
          <tr><td>ion cuivre II Cu²⁺</td><td>ion nitrate NO₃⁻</td></tr><tr><td>ion fer II Fe²⁺</td><td>ion sulfate SO₄²⁻</td></tr>
          <tr><td>ion fer III Fe³⁺</td><td></td></tr><tr><td>ion zinc Zn²⁺</td><td></td></tr><tr><td>ion aluminium Al³⁺</td><td></td></tr></table>
        <p>Le chiffre romain donne la charge : fer <b>II</b> → 2+, fer <b>III</b> → 3+.</p>
        <p>HO⁻, NO₃⁻ et SO₄²⁻ viennent d’un <b>groupe d’atomes</b> qui a gagné des électrons.</p>
        <div class="ex">Un ion positif s’appelle aussi un <b>cation</b>, un ion négatif un <b>anion</b>.</div>`,
      retenir: 'Positifs : Na⁺, H⁺, Cu²⁺, Fe²⁺, Fe³⁺, Zn²⁺, Al³⁺. Négatifs : Cl⁻, HO⁻, NO₃⁻, SO₄²⁻.',
      quiz: [{ q: 'Quelle est la formule de l’ion fer III ?', choices: [{ t: 'Fe³⁺', ok: true }, { t: 'Fe²⁺', msg: 'Fe²⁺, c’est l’ion fer II.' }, { t: 'Fe³⁻', msg: 'Les ions des métaux sont positifs.' }] }] },
    { title: 'Compter des atomes',
      html: `<p>Ce sont les exercices 1 et 2 de ton cahier, sur l’aluminium.</p>
        <p><b>Dans 1 g d’aluminium.</b> Un atome d’aluminium a une masse de 4,51 × 10⁻²⁶ kg. On met tout en kg : 1 g = 0,001 kg.</p>
        <div class="formula">N = 0,001 ÷ (4,51 × 10⁻²⁶) ≈ 2,2 × 10²²</div>
        <p><b>Alignés sur 2,5 cm.</b> Le rayon d’un atome vaut 1,25 × 10⁻¹⁰ m. Un atome occupe son <b>diamètre</b> : 2 × 1,25 = 2,5 × 10⁻¹⁰ m. On met tout en mètres : 2,5 cm = 0,025 m.</p>
        <div class="formula">N = 0,025 ÷ (2,5 × 10⁻¹⁰) = 1 × 10⁸</div>
        <p>Cela fait <b>100 millions</b> d’atomes sur 2,5 cm.</p>
        <div class="ex"><b>Les deux pièges :</b> oublier de convertir (g en kg, cm en m), et diviser par le rayon au lieu du diamètre.</div>`,
      retenir: 'N = masse ÷ masse d’un atome (en kg). N = longueur ÷ diamètre (en m). Diamètre = 2 × rayon.',
      quiz: [{ q: 'Le rayon d’un atome vaut 1,25 × 10⁻¹⁰ m. Son diamètre vaut :', choices: [{ t: '2,5 × 10⁻¹⁰ m', ok: true }, { t: '0,625 × 10⁻¹⁰ m', msg: 'Le diamètre est le double du rayon, pas la moitié.' }, { t: '1,25 × 10⁻¹⁰ m', msg: 'Ça, c’est le rayon.' }] }] },
  ],
  exos: [
    { title: 'Cahier, ex. 1 : dans 1 g d’aluminium', enonce: 'Combien y a-t-il d’atomes d’aluminium dans 1 g d’aluminium ? Un atome d’aluminium a une masse de 4,51 × 10⁻²⁶ kg.', ans: 0.001 / mAt4('Al'), sci: true, unit: 'atomes',
      steps: ['📐 N = masse de l’objet ÷ masse d’un atome.', '🔁 1 g = 0,001 kg.', '🧮 N = 0,001 ÷ (4,51 × 10⁻²⁶) ≈ 2,2 × 10²².'], rep: 'Il y a environ 2,2 × 10²² atomes dans 1 g d’aluminium.', piege: 'Laisser 1 g : le résultat serait 1 000 fois trop grand.' },
    { title: 'Cahier, ex. 2 : alignés sur 2,5 cm', enonce: 'Le rayon d’un atome d’aluminium vaut 1,25 × 10⁻¹⁰ m. Combien peut-on aligner d’atomes d’aluminium sur une distance de 2,5 cm ?', ans: 1e8, sci: true, unit: 'atomes',
      steps: ['📐 N = longueur ÷ diamètre d’un atome.', '🔁 Diamètre = 2 × 1,25 × 10⁻¹⁰ = 2,5 × 10⁻¹⁰ m ; 2,5 cm = 0,025 m.', '🧮 N = 0,025 ÷ (2,5 × 10⁻¹⁰) = 1 × 10⁸.'], rep: 'On peut aligner 1 × 10⁸ atomes, soit 100 millions.', piege: 'Diviser par le rayon : on trouverait 2 × 10⁸, le double.' },
    { title: 'Cahier, ex. 3 : l’ion aluminium', enonce: `L’ion aluminium a pour formule chimique Al³⁺. Donne la composition exacte de cet ion. L’atome s’écrit ${nuc(27, 13, 'Al')}.`, ans: 10, unit: 'électrons',
      steps: ['Le noyau ne change pas : 13 protons et 27 − 13 = 14 neutrons.', '3+ : 3 charges positives en excès, l’atome a perdu 3 électrons.', 'Électrons : 13 − 3 = 10.'], rep: 'L’ion Al³⁺ contient 13 protons, 14 neutrons et 10 électrons.', piege: 'Écrire 16 électrons : une charge + veut dire des électrons en moins.' },
    { title: 'L’ion sodium (cahier)', enonce: `L’atome de sodium ${nuc(23, 11, 'Na')} perd un électron. Compte les charges de l’ion et écris sa formule.`, ans: 10, unit: 'électrons',
      steps: ['Protons : 11, soit +11 (le noyau ne change pas).', 'Électrons : 11 − 1 = 10, soit −10.', 'Il reste +1 : une charge positive en excès.'], rep: 'L’ion sodium a pour formule Na⁺ : 11 protons et 10 électrons.' },
    { title: 'L’ion oxygène (cahier)', enonce: `L’atome d’oxygène ${nuc(16, 8, 'O')} gagne deux électrons. Compte les charges de l’ion et écris sa formule.`, ans: 10, unit: 'électrons',
      steps: ['Protons : 8, soit +8.', 'Électrons : 8 + 2 = 10, soit −10.', 'Il reste −2 : deux charges négatives en excès.'], rep: 'L’ion oxygène a pour formule O²⁻ : 8 protons et 10 électrons.', piege: 'Écrire O⁻² : le chiffre se place avant le signe.' },
    { title: '¹⁶O et ¹⁷O (cahier)', enonce: `Donne la composition des atomes ${nuc(16, 8, 'O')} et ${nuc(17, 8, 'O')}. Lequel est le plus lourd ?`, ans: 9, unit: 'neutrons dans le second',
      steps: ['Les deux : 8 protons et 8 électrons.', 'Neutrons : 16 − 8 = 8 pour le premier, 17 − 8 = 9 pour le second.'], rep: 'Le second atome a un neutron de plus : il est plus lourd.' },
    { title: 'L’ion chlorure', enonce: 'L’atome de chlore a 17 protons. Il gagne un électron. Donne le nombre d’électrons de l’ion et sa formule.', ans: 18, unit: 'électrons',
      steps: ['Protons : +17.', 'Électrons : 17 + 1 = 18, soit −18.', 'Il reste −1 : une charge négative en excès.'], rep: 'L’ion chlorure a pour formule Cl⁻ : 17 protons et 18 électrons.' },
    { title: 'L’ion cuivre II', enonce: 'L’atome de cuivre a 29 protons. Il perd deux électrons. Donne le nombre d’électrons de l’ion et sa formule.', ans: 27, unit: 'électrons',
      steps: ['Protons : +29.', 'Électrons : 29 − 2 = 27, soit −27.', 'Il reste +2 : deux charges positives en excès.'], rep: 'L’ion cuivre II a pour formule Cu²⁺ : 29 protons et 27 électrons.' },
    { title: 'Retrouver la formule', enonce: 'Un ion possède 26 protons (c’est du fer, Fe) et 23 électrons. Combien de charges a-t-il en excès ? Écris sa formule.', ans: 3, unit: 'charges en excès',
      steps: ['+26 et −23.', 'Il reste +3 : trois charges positives en excès.'], rep: 'C’est l’ion fer III, de formule Fe³⁺.' },
    { title: 'L’ion magnésium', enonce: `L’ion magnésium a pour formule Mg²⁺. L’atome s’écrit ${nuc(24, 12, 'Mg')}. Donne la composition exacte de l’ion.`, ans: 10, unit: 'électrons',
      steps: ['Noyau inchangé : 12 protons et 24 − 12 = 12 neutrons.', '2+ : l’atome a perdu 2 électrons, 12 − 2 = 10.'], rep: 'L’ion Mg²⁺ contient 12 protons, 12 neutrons et 10 électrons.' },
    { title: 'Dans 5 g de fer', enonce: 'Combien y a-t-il d’atomes de fer dans un clou de 5 g ? Un atome de fer a une masse de 9,35 × 10⁻²⁶ kg.', ans: 0.005 / 9.35e-26, sci: true, unit: 'atomes',
      steps: ['🔁 5 g = 0,005 kg.', '🧮 N = 0,005 ÷ (9,35 × 10⁻²⁶) ≈ 5,35 × 10²².'], rep: 'Le clou contient environ 5,35 × 10²² atomes de fer.' },
    { title: 'Alignés sur 1 cm', enonce: 'Le rayon d’un atome de cuivre vaut 1,35 × 10⁻¹⁰ m. Combien d’atomes de cuivre peut-on aligner sur 1 cm ?', ans: 0.01 / 270e-12, sci: true, unit: 'atomes',
      steps: ['🔁 Diamètre = 2 × 1,35 × 10⁻¹⁰ = 2,7 × 10⁻¹⁰ m ; 1 cm = 0,01 m.', '🧮 N = 0,01 ÷ (2,7 × 10⁻¹⁰) ≈ 3,7 × 10⁷.'], rep: 'On peut aligner environ 3,7 × 10⁷ atomes de cuivre, soit 37 millions.' },
  ],
});

/* ---------- Accroches qui ont besoin d'app.js ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof finishRun === 'function') {
    const base = finishRun;
    finishRun = function () { return RUN && RUN.ctrlI ? finishCtrlI() : base(); };
  }
  /* Semaine d'un contrôle : la leçon qui tombe au contrôle se lit avant les séances « Spécial contrôle » */
  if (typeof mission === 'function') {
    const baseM = mission;
    mission = function () {
      const m = baseM.apply(this, arguments);
      try {
        const e = nextExam();
        if (!e || e.days < 1 || e.days > 7 || !/Contrôle/.test(m.chip || '') || !(e.skills || []).length) return m;
        const L = COURS.find((c) => c.examFirst && !coursProg(c.id).done && c.skills.some((k) => e.skills.includes(k)));
        if (!L) return m;
        const p = coursProg(L.id), first = Math.max(0, L.sections.findIndex((_, i) => !p.seen.includes(i)));
        return { chip: `📅 Contrôle ${examWhen(e)}`, title: `Leçon : ${L.title}`, sub: `C’est le cours qui tombe au contrôle. ${p.seen.length ? 'Tu l’as commencée, environ' : 'Environ'} ${lessonMinutes(L, first)} min${p.seen.length ? ' pour la finir' : ''}, puis on s’entraîne.`,
          btn: p.seen.length ? '▶ Continuer la leçon' : '▶ Lire la leçon', go: () => { MISSION_LESSON = L.id; screenLesson(L.id, first); } };
      } catch (err) { return m; }
    };
  }
  if (typeof COPY_TYPES !== 'undefined') COPY_TYPES.push(
    ['Chimie : isotopes, ce qui change entre deux atomes', 'K11', 'isotope'],
    ['Chimie : charges en excès d’un ion mal comptées', 'K12', 'chargeIon'],
    ['Chimie : formule d’un ion mal écrite', 'K12', 'formIon'],
    ['Chimie : nombre d’atomes, conversion oubliée (g en kg, cm en m)', 'K13', 'noconv'],
    ['Chimie : rayon pris pour le diamètre', 'K13', 'rayonDiam'],
  );
  if (typeof ERR_ADVICE !== 'undefined') Object.assign(ERR_ADVICE, {
    isotope: 'entre deux isotopes, seuls les neutrons changent : mêmes protons, mêmes électrons.',
    chargeIon: 'écrire les trois lignes du cahier : protons (+), électrons (−), puis ce qui reste.',
    formIon: 'la charge en excès s’écrit en haut à droite du symbole, le chiffre avant le signe (O²⁻), sans chiffre pour une seule charge (Na⁺).',
    rayonDiam: 'un atome occupe son diamètre : 2 fois le rayon.',
  });
  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Contrôle type : les ions', (s) => {
    const C = s.ctrlI; if (!C || !C.hist || !C.hist.length) return 'pas encore tenté';
    const l = C.hist[C.hist.length - 1];
    return `dernier ${fr(l.note, 1)}/20 (aide ${l.lv}/3), ${C.hist.length} essai${C.hist.length > 1 ? 's' : ''}${C.best && C.best[3] != null ? ` • sans aide : ${fr(C.best[3], 1)}/20` : ''}`;
  }, '5 exercices rédigés comme dans le cahier (isotopes, ion positif, ion négatif, composition d’un ion, nombre d’atomes). L’aide diminue à partir de 14/20.']);
});
