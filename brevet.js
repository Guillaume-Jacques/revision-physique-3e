/* =========================================================
   « Sujets type Brevet » (31/10/2026)
   La partie physique-chimie des sujets de sciences du brevet, Métropole,
   de 2017 à 2026 (2018, 2020 et 2022 : pas de physique-chimie en Métropole).
   Chaque sujet reprend le thème et les notions du sujet officiel ; les textes,
   les questions et les nombres sont rédigés pour l'appli (nombres tirés au
   hasard à chaque essai).
   Une question n'est posée que si sa notion est ouverte dans l'appli
   (champ need : compétences dont la leçon doit être faite). need vide = notion
   des années précédentes (masse volumique, sources d'énergie, lecture de
   tableau) : toujours posée, mais sans effet sur les médailles ni « À revoir »
   (noTrack).
   Fichier autonome, chargé après chimie3.js et avant app.js.
   ========================================================= */

const bq = (label, prompt, good, bads, show) => ({ kind: 'qcm', label, prompt,
  choices: [{ t: good, ok: true }, ...bads.map(([t, msg, code]) => ({ t, msg, code: code || 'notion' }))], show: show || '✔️ ' + good });
const bCtx = (t) => `<p class="small muted" style="margin:0 0 8px">${t}</p>`;

const BREVET = [
  /* ===================== 2026 ===================== */
  { id: 'b2026', year: 2026, title: 'L’eau de mer sous surveillance', icon: '🌊',
    intro: 'Des flotteurs automatiques dérivent dans les océans. Ils plongent, mesurent la température et le sel de l’eau, puis remontent envoyer leurs mesures à un satellite.',
    qs: [
      { pts: 2.5, skill: 'K7', need: ['K7'], name: 'Les ions de l’eau de mer', make(lv) {
        const [X, q] = pick([['Cl', -1], ['Na', 1], ['Mg', 2]]), [, name, Z] = atomOf(X), I = ionTxt(X, q), n = Math.abs(q), e = Z - q;
        return stepsItem('K7', lv, bCtx('Dans l’eau de mer, le sel est dissous sous forme d’ions.') +
          `L’ion <b>${I}</b> se forme à partir de l’atome ${dn(name)}, qui possède <b>${Z} protons</b>. Décris ce qui s’est passé, puis donne la composition de l’ion.`, [
          bq('Gain ou perte', `Pour devenir ${I}, l’atome ${dn(name)} a :`, `${q > 0 ? 'perdu' : 'gagné'} ${n} électron${n > 1 ? 's' : ''}`,
            [[`${q > 0 ? 'gagné' : 'perdu'} ${n} électron${n > 1 ? 's' : ''}`, q > 0 ? 'Charge + : il y a moins d’électrons que de protons, l’atome en a donc perdu.' : 'Charge − : il y a plus d’électrons que de protons, l’atome en a donc gagné.', 'signeIon'],
             [`${q > 0 ? 'perdu' : 'gagné'} ${n} proton${n > 1 ? 's' : ''}`, 'Le noyau ne change jamais quand un ion se forme : seuls les électrons partent ou arrivent.', 'noyauIon']],
            `🔋 ${I} : ${n} électron${n > 1 ? 's' : ''} ${q > 0 ? 'perdu' : 'gagné'}${n > 1 ? 's' : ''}`),
          nStep('Les protons', `Combien de protons possède l’ion ${I} ?`, Z, 'protons', null,
            [{ v: Z - q, code: 'noyauIon', msg: 'Le noyau ne change pas : l’ion garde les protons de l’atome.' }], `⚛️ protons : ${Z}, comme l’atome`),
          nStep('Les électrons', `Combien d’électrons possède l’ion ${I} ?`, e, 'électrons', null,
            [{ v: Z, code: 'signeIon', msg: `${Z}, c’est le nombre d’électrons de l’atome. L’ion en a ${q > 0 ? 'perdu' : 'gagné'} ${n}.` },
             { v: Z + q, code: 'signeIon', msg: q > 0 ? 'Charge + : l’atome a perdu des électrons, il en a moins.' : 'Charge − : l’atome a gagné des électrons, il en a plus.' }],
            `🧮 électrons : ${Z} ${q > 0 ? '−' : '+'} ${n} = ${e}`),
          pStep(`L’ion ${I} possède ${Z} protons et ${e} électrons : l’atome ${dn(name)} a ${q > 0 ? 'perdu' : 'gagné'} ${n} électron${n > 1 ? 's' : ''}.`,
            [[`L’ion ${I} possède ${Z} protons et ${Z} électrons.`, 'Avec autant de protons que d’électrons, il serait neutre : ce serait un atome.'],
             [`L’ion ${I} possède ${Z + q} protons.`, 'Le nombre de protons ne change pas.']]),
        ]);
      } },
      { pts: 2.5, skill: 'K7', need: ['K7'], name: 'Quelle eau conduit le courant ?', make(lv) {
        const I = rnd(35, 85);
        return stepsItem('K7', lv, bCtx('Le flotteur mesure le sel de l’eau grâce au courant électrique qui la traverse.') +
          `On place successivement dans un circuit (pile, lampe, appareil de mesure) de l’<b>eau distillée</b>, de l’<b>eau sucrée</b> et de l’<b>eau salée</b>. Seule l’eau salée donne un courant : <b>${I} mA</b>. Explique ce résultat.`, [
          bq('L’appareil de mesure', 'Quel appareil mesure l’intensité du courant, et comment le branche-t-on ?', 'Un ampèremètre, branché en série',
            [['Un voltmètre, branché en dérivation', 'Le voltmètre mesure une tension. Pour une intensité, on utilise un ampèremètre.'],
             ['Un ampèremètre, branché en dérivation', 'L’ampèremètre se branche en série, dans la boucle du circuit.']]),
          bq('La solution qui conduit', 'Laquelle des trois conduit le courant ?', 'L’eau salée',
            [['L’eau sucrée', 'Le sucre se dissout sous forme de molécules, qui ne portent pas de charge : pas de courant.'],
             ['L’eau distillée', 'L’eau pure ne contient presque pas d’ions : elle ne conduit presque pas le courant.']]),
          bq('Pourquoi ?', 'Pourquoi l’eau salée conduit-elle le courant ?', 'Elle contient des ions, des particules chargées qui peuvent se déplacer',
            [['Elle contient des molécules de sel', 'Une fois dissous, le sel n’est plus en molécules : il forme des ions Na⁺ et Cl⁻.'],
             ['Toute eau conduit le courant', 'L’eau distillée et l’eau sucrée ne le conduisent pas.']]),
          pStep('Seule l’eau salée conduit le courant, car elle contient des ions (Na⁺ et Cl⁻) qui se déplacent ; l’eau distillée et l’eau sucrée n’en contiennent pas.',
            [['Seule l’eau salée conduit le courant, car le sel est un métal.', 'Le sel n’est pas un métal : ce sont ses ions qui transportent le courant.'],
             [`L’intensité vaut ${I} mA.`, 'C’est une donnée : la question demande une explication.']]),
        ]);
      } },
      { pts: 2, skill: 'V8', need: [], name: 'Lire un tableau de mesures', make(lv) {
        const k = pick([2, 2.4, 2.5, 3]), S = pick([34, 35, 36, 37, 38]), I = k * S;
        const tab = `<table class="tbl"><tr><th>Sel (g/L)</th><td>10</td><td>20</td><td>30</td><td>40</td></tr><tr><th>Intensité (mA)</th>${[10, 20, 30, 40].map((x) => `<td>${fr(k * x)}</td>`).join('')}</tr></table>`;
        return stepsItem('V8', lv, bCtx('Avant le départ, on étalonne le capteur du flotteur avec des eaux plus ou moins salées.') +
          `${tab}En mer, le capteur mesure <b>${fr(I)} mA</b>. Quelle masse de sel contient un litre de cette eau ?`, [
          bq('Lire le tableau', 'Quand la masse de sel double, l’intensité :', 'double aussi : elle est proportionnelle à la masse de sel',
            [['ne change pas', 'Compare les colonnes 10 et 20 g/L : l’intensité change.'], ['est divisée par deux', 'Plus il y a de sel, plus il y a d’ions, plus le courant passe.']]),
          nStep('Le calcul', `Masse de sel pour ${fr(I)} mA :`, S, 'g/L', ['g/L', 'mA', 'g'],
            [{ v: I * k, code: 'inverse', msg: `Chaque gramme de sel par litre donne ${fr(k)} mA : on divise ${fr(I)} par ${fr(k)}.` }, { v: I / 10, code: 'formule', msg: `10 g/L donnent ${fr(10 * k)} mA, et non 10 mA.` }],
            `🧮 1 g/L donne ${fr(10 * k)} ÷ 10 = ${fr(k)} mA, donc ${fr(I)} ÷ ${fr(k)} = ${S} g/L`, 0.3),
          pStep(`Un litre de cette eau de mer contient environ ${S} g de sel.`, [[`L’intensité vaut ${fr(I)} mA.`, 'C’est la mesure, pas la masse de sel demandée.'], [`Un litre contient ${S} mA.`, 'Une masse s’exprime en grammes, pas en milliampères.']]),
        ]);
      } },
      { pts: 3, skill: 'V5', need: ['V5'], name: 'Le passage du satellite', make(lv) {
        const v = pick([27000, 24000, 25200]), tm = pick([8, 9, 10, 12]), d = v * tm / 60, t = tm / 60;
        return stepsItem('V5', lv, bCtx('Le flotteur remonte et envoie ses mesures quand un satellite passe au-dessus de lui.') +
          `Le satellite file à <b>${fr(v, 0)} km/h</b>. Il peut capter le flotteur sur <b>${fr(d, 0)} km</b> de sa trajectoire. Combien de minutes dure la transmission ?`, [
          fStep('t = d ÷ v', [['t = v ÷ d', 'La distance va en haut : t = d ÷ v.', 'inverse'], ['t = d × v', 'Pour une durée, on divise la distance par la vitesse.']], 't = d ÷ v'),
          nStep('Le calcul', 'Calcule t en heures (au millième).', t, 'h', null, [{ v: v / d, code: 'inverse', msg: 'Division à l’envers : t = d ÷ v.' }], `🧮 t = ${fr(d, 0)} ÷ ${fr(v, 0)} ≈ ${fr(t, 3)} h`, 0.002),
          nStep('La conversion', 'Convertis cette durée en minutes, et choisis l’unité.', tm, 'min', ['min', 'h', 's'],
            [{ v: t * 100, code: 'base100', msg: 'Une heure fait 60 min : on multiplie par 60.' }], `🔁 ${fr(t, 3)} h × 60 = ${tm} min`, 0.2),
          pStep(`La transmission dure environ ${tm} minutes.`, [[`Le satellite parcourt ${fr(d, 0)} km.`, 'C’est une donnée : on demande une durée.'], [`La transmission dure ${fr(t, 3)} minutes.`, `${fr(t, 3)}, ce sont des heures.`]]),
        ]);
      } },
    ] },

  /* ===================== 2025 ===================== */
  { id: 'b2025', year: 2025, title: 'Une mission dans la station spatiale', icon: '🚀',
    intro: 'Un astronaute part six mois dans la Station spatiale internationale (ISS). Il faut y recycler l’eau, choisir des matériaux légers et suivre le mouvement de la station.',
    qs: [
      { pts: 2, skill: 'K6', need: ['K6'], name: 'Le dioxygène', make(lv) {
        const [F, nm, tot] = pick([['H₂O', 'l’eau', 3], ['CO₂', 'le dioxyde de carbone', 3], ['H₂', 'le dihydrogène', 2]]);
        return stepsItem('K6', lv, bCtx('Dans la station, une partie de l’eau est décomposée : 2 H₂O → 2 H₂ + O₂. Le dioxygène produit sert à respirer.') +
          `Le dioxygène <b>O₂</b> est-il un atome ou une molécule ? Combien d’atomes compte une molécule de ${nm} (<b>${F}</b>) ?`, [
          bq('Atome ou molécule ?', 'Le dioxygène O₂ est :', 'une molécule formée de 2 atomes d’oxygène',
            [['un atome d’oxygène', 'Le petit 2 indique deux atomes d’oxygène liés : c’est une molécule.', 'indice'],
             ['une molécule formée de 2 atomes différents', 'Il n’y a qu’un seul symbole, O : les deux atomes sont des atomes d’oxygène.', 'indice']]),
          nStep('Compter les atomes', `Nombre total d’atomes dans ${F} :`, tot, 'atomes', null, [{ v: tot - 1, code: 'indice', msg: 'Compte chaque atome : le petit chiffre s’applique au symbole juste avant.' }], `🧪 ${F} : ${tot} atomes`),
          pStep(`O₂ est une molécule de 2 atomes d’oxygène ; ${F} compte ${tot} atomes.`, [['O₂ est un atome.', 'Un atome s’écrit avec un seul symbole et sans indice.'], [`${F} compte ${tot - 1} atomes.`, 'Recompte avec les petits chiffres.']]),
        ]);
      } },
      { pts: 3, skill: 'K8', need: ['K8'], name: 'Recycler l’eau', make(lv) {
        const m = pick([1.8, 2, 3.6, 4.5, 9]), mH = Math.round(m / 9 * 100) / 100, mO = Math.round((m - mH) * 100) / 100;
        return stepsItem('K8', lv, bCtx('Dans la station, de l’eau est décomposée en dihydrogène et en dioxygène : 2 H₂O → 2 H₂ + O₂.') +
          `On décompose <b>${fr(m)} kg</b> d’eau. On obtient <b>${fr(mH)} kg</b> de dihydrogène. Quelle masse de dioxygène obtient-on ?`, [
          bq('La loi à utiliser', 'Lors d’une transformation chimique, la masse :', 'se conserve : masse des réactifs = masse des produits',
            [['diminue, car des gaz se forment', 'Les gaz ont une masse : rien ne disparaît.', 'masseConso'], ['augmente, car il y a plus de molécules', 'Les atomes se réorganisent, leur nombre et leur masse ne changent pas.', 'masseConso']]),
          nStep('Le calcul', 'Masse de dioxygène, et son unité :', mO, 'kg', ['kg', 'g', 'L'],
            [{ v: m + mH, code: 'masseConso', msg: `On enlève la masse de dihydrogène : ${fr(m)} − ${fr(mH)}.` }, { v: m, code: 'masseConso', msg: 'Une partie de la masse est partie dans le dihydrogène.' }],
            `🧮 m(O₂) = ${fr(m)} − ${fr(mH)} = ${fr(mO)} kg`, 0.011),
          bq('Vérifier une proposition', `Un élève écrit : « ${fr(m)} kg d’eau donnent ${fr(m)} kg de dihydrogène et ${fr(m / 2)} kg de dioxygène, car l’équation contient 2 H₂ et 1 O₂. » A-t-il raison ?`,
            `Non : les produits pèseraient ${fr(m * 1.5)} kg, plus que les ${fr(m)} kg d’eau`,
            [['Oui, car il y a deux fois plus de H₂ que de O₂', 'Les nombres devant les formules comptent des molécules, pas des kilogrammes.', 'coefIndice'],
             ['Oui, la masse peut augmenter pendant une réaction', 'La masse se conserve toujours.', 'masseConso']]),
          pStep(`On obtient ${fr(mO)} kg de dioxygène.`, [[`On obtient ${fr(mH)} kg de dioxygène.`, 'C’est la masse de dihydrogène.'], [`On obtient ${fr(m)} kg de dioxygène.`, 'C’est la masse d’eau de départ.']]),
        ]);
      } },
      { pts: 4, skill: 'V8', need: [], name: 'Un métal léger', make(lv) {
        const [met, rho] = pick([['aluminium', 2.7], ['titane', 4.5], ['acier', 7.9]]), V = pick([10, 12, 15, 18, 20]), V1 = pick([40, 50, 60]), V2 = V1 + V, m = Math.round(rho * V * 10) / 10;
        return stepsItem('V8', lv, bCtx('Chaque kilogramme envoyé dans l’espace coûte très cher : on choisit des matériaux légers et solides.') +
          `Une pièce de la station a une masse de <b>${fr(m, 1)} g</b>. On la plonge dans une éprouvette : le niveau de l’eau passe de <b>${V1} mL</b> à <b>${V2} mL</b>. De quel métal est-elle faite ?<br><span class="small">Masses volumiques : acier 7,9 g/mL • aluminium 2,7 g/mL • titane 4,5 g/mL</span>`, [
          nStep('Le volume', 'Volume de la pièce :', V, 'mL', null, [{ v: V2, code: 'question', msg: `${V2} mL, c’est le niveau final. Le volume de la pièce est la différence : ${V2} − ${V1}.` }], `📏 V = ${V2} − ${V1} = ${V} mL`),
          fStep('ρ = m ÷ V', [['ρ = V ÷ m', 'La masse va en haut : ρ = m ÷ V.', 'inverse'], ['ρ = m × V', 'La masse volumique est un quotient : masse divisée par volume.']], 'ρ = m ÷ V'),
          nStep('Le calcul', 'Calcule ρ (au dixième) et choisis l’unité.', rho, 'g/mL', ['g/mL', 'g', 'mL'],
            [{ v: V / m, code: 'inverse', msg: 'Division à l’envers : ρ = m ÷ V.' }, { v: m / V2, code: 'question', msg: 'Utilise le volume de la pièce, pas le niveau final de l’eau.' }], `🧮 ρ = ${fr(m, 1)} ÷ ${V} = ${fr(rho, 1)} g/mL`, 0.06),
          bq('Identifier', 'La pièce est en :', met, [['acier', 'Compare ta valeur au tableau.'], ['aluminium', 'Compare ta valeur au tableau.'], ['titane', 'Compare ta valeur au tableau.']].filter(([t]) => t !== met)),
          pStep(`La masse volumique vaut ${fr(rho, 1)} g/mL : la pièce est en ${met}.`, [[`La pièce a un volume de ${V} mL.`, 'C’est une étape : on demande le métal.'], [`La masse volumique vaut ${fr(m, 1)} g.`, 'Une masse volumique s’exprime en g/mL, et ce n’est pas la masse.']]),
        ]);
      } },
      { pts: 3, skill: 'V5', need: ['V1', 'V5'], name: 'Seize levers de Soleil', make(lv) {
        const v = pick([27600, 28000]), L = pick([42500, 42700, 43000]), t = L / v, n = Math.round(24 / t);
        return stepsItem('V5', lv, bCtx('Depuis la station, les astronautes voient le Soleil se lever plusieurs fois par jour.') +
          `La station tourne autour de la Terre sur un cercle, toujours à <b>${fr(v, 0)} km/h</b>. Un tour mesure <b>${fr(L, 0)} km</b>. Décris son mouvement, puis calcule combien de tours elle fait en 24 h.`, [
          bq('Le mouvement', 'Le mouvement de la station est :', 'circulaire et uniforme',
            [['rectiligne et uniforme', 'La trajectoire est un cercle : le mouvement est circulaire.'], ['circulaire et accéléré', 'La vitesse ne change pas : le mouvement est uniforme.']]),
          fStep('t = d ÷ v', [['t = v ÷ d', 'La distance va en haut.', 'inverse'], ['t = d × v', 'Pour une durée, on divise la distance par la vitesse.']], 't = d ÷ v (durée d’un tour)'),
          nStep('Un tour', 'Durée d’un tour, en heures (au centième) :', t, 'h', null, [{ v: v / L, code: 'inverse', msg: 'Division à l’envers.' }], `🧮 t = ${fr(L, 0)} ÷ ${fr(v, 0)} ≈ ${fr(t, 2)} h`, 0.01),
          nStep('Les tours par jour', 'Nombre de tours en 24 h (arrondi à l’unité) :', n, 'tours', null, [{ v: Math.round(24 * t), code: 'inverse', msg: 'On cherche combien de fois un tour tient dans 24 h : 24 ÷ durée d’un tour.' }], `🧮 24 ÷ ${fr(t, 2)} ≈ ${n} tours`, 0.6),
          pStep(`La station a un mouvement circulaire uniforme ; elle fait environ ${n} tours par jour, donc les astronautes voient environ ${n} levers de Soleil en 24 h.`,
            [[`Un tour dure ${fr(t, 2)} h.`, 'C’est une étape : on demande le nombre de tours par jour.'], ['La station est immobile dans l’espace.', 'Elle tourne très vite autour de la Terre.']]),
        ]);
      } },
    ] },

  /* ===================== 2024 ===================== */
  { id: 'b2024', year: 2024, title: 'Le télescope spatial James Webb', icon: '🔭',
    intro: 'Lancé fin 2021, le télescope James Webb observe la naissance des étoiles et l’atmosphère de planètes lointaines.',
    qs: [
      { pts: 2, skill: 'V1', need: ['V1'], name: 'Un mouvement circulaire uniforme', make(lv) {
        return stepsItem('V1', lv, bCtx('Le télescope tourne autour du Soleil en un an, en restant aligné avec la Terre.') +
          'Qu’appelle-t-on un mouvement circulaire uniforme ? Dans quel référentiel étudie-t-on ce mouvement du télescope ?', [
          bq('Définition', 'Un mouvement circulaire uniforme, c’est :', 'une trajectoire en cercle, parcourue à vitesse constante',
            [['une trajectoire droite, parcourue à vitesse constante', 'Une droite donne un mouvement rectiligne.'], ['une trajectoire en cercle, avec une vitesse qui augmente', 'Uniforme veut dire que la valeur de la vitesse ne change pas.']]),
          bq('Le référentiel', 'Pour décrire sa course autour du Soleil, on se place dans le référentiel :', 'héliocentrique (centré sur le Soleil)',
            [['terrestre', 'Par rapport au sol, on ne voit pas le tour autour du Soleil.'], ['géocentrique (centré sur la Terre)', 'Le télescope suit la Terre : par rapport au centre de la Terre, il bouge à peine.']]),
          pStep('Le télescope décrit un cercle à vitesse constante autour du Soleil : son mouvement est circulaire uniforme dans le référentiel héliocentrique.',
            [['Le télescope est immobile.', 'Il fait le tour du Soleil en un an.'], ['Le mouvement est rectiligne uniforme.', 'La trajectoire est un cercle.']]),
        ]);
      } },
      { pts: 3, skill: 'K6', need: ['K6'], name: 'Les molécules d’une atmosphère', make(lv) {
        const [F, nm, tot] = pick([['H₂S', 'sulfure d’hydrogène', 3], ['H₂O', 'eau', 3], ['CH₄', 'méthane', 5]]);
        return stepsItem('K6', lv, bCtx('Le télescope a détecté du dioxyde de carbone dans l’atmosphère d’une planète située à plus de 700 années-lumière.') +
          `Donne la formule du dioxyde de carbone, compte les atomes d’une molécule de ${nm} (<b>${F}</b>), puis reconnais une molécule d’après sa composition.`, [
          bq('La formule', 'Formule du dioxyde de carbone :', 'CO₂', [['C₂O', 'Le préfixe « di » porte sur l’oxygène : 2 atomes d’oxygène.', 'indice'], ['CO', 'CO, c’est le monoxyde de carbone (un seul oxygène).', 'indice']]),
          nStep('Compter', `Nombre d’atomes dans ${F} :`, tot, 'atomes', null, [{ v: tot - 1, code: 'indice', msg: 'Le petit chiffre compte l’atome juste avant lui.' }], `🧪 ${F} : ${tot} atomes`),
          bq('Reconnaître', 'Une molécule contient 1 atome de carbone et 1 atome d’oxygène. C’est :', 'le monoxyde de carbone CO',
            [['le dioxyde de carbone CO₂', 'CO₂ contient 2 atomes d’oxygène.', 'indice'], ['l’eau H₂O', 'L’eau ne contient pas de carbone.']]),
          pStep(`Le dioxyde de carbone s’écrit CO₂ ; ${F} compte ${tot} atomes ; la molécule CO est le monoxyde de carbone.`, [['Le dioxyde de carbone s’écrit CO.', 'CO est le monoxyde : il manque un oxygène.'], [`${F} compte 2 atomes.`, 'Recompte avec les petits chiffres.']]),
        ]);
      } },
      { pts: 3, skill: 'V8', need: [], name: 'Un système planétaire géant', make(lv) {
        const N = pick([92, 80, 120, 64]), D = N * 150, r = D / 4500;
        return stepsItem('V8', lv, bCtx('Le télescope a photographié une planète en orbite autour d’une autre étoile.') +
          `Cette planète est à <b>${N} unités astronomiques</b> (ua) de son étoile. 1 ua = 150 millions de km (distance Terre-Soleil). Dans notre système solaire, la planète la plus lointaine, Neptune, est à <b>4 500 millions de km</b> du Soleil. Compare les deux systèmes.`, [
          nStep('La conversion', `${N} ua en millions de km :`, D, 'millions de km', null, [{ v: N / 150, code: 'inverse', msg: '1 ua = 150 millions de km : on multiplie.' }], `🔁 ${N} × 150 = ${fr(D, 0)} millions de km`),
          nStep('La comparaison', 'Combien de fois plus loin que Neptune ? (au dixième)', r, 'fois', null, [{ v: 4500 / D, code: 'inverse', msg: 'Mets la plus grande distance en haut.' }], `🧮 ${fr(D, 0)} ÷ 4 500 ≈ ${fr(r, 1)}`, 0.06),
          pStep(`La planète est à ${fr(D, 0)} millions de km de son étoile, environ ${fr(r, 1)} fois la distance Soleil-Neptune : ce système est plus étendu que le système solaire.`,
            [[`La planète est à ${N} km de son étoile.`, 'L’unité est l’ua, pas le km.'], ['Ce système est plus petit que le nôtre.', 'Compare ta distance à celle de Neptune.']]),
        ]);
      } },
      { pts: 3, skill: 'P2', need: ['P2'], name: 'Qui attire le télescope ?', make(lv) {
        const mt = pick([6200, 6500]), G = 6.67e-11, mT = 5.98e24, d = 1.49e9, F = G * mT * mt / (d * d);
        return stepsItem('P2', lv, bCtx('Le télescope est attiré à la fois par la Terre et par le Soleil.') +
          `F = G × m<sub>A</sub> × m<sub>B</sub> ÷ d². Données : G = 6,67 × 10⁻¹¹ ; Terre 5,98 × 10²⁴ kg ; Soleil 1,99 × 10³⁰ kg ; télescope <b>${fr(mt, 0)} kg</b> ; distance Terre-télescope 1,49 × 10⁹ m ; distance Soleil-télescope 1,51 × 10¹¹ m. Calcule la force exercée par la Terre sur le télescope, puis explique pourquoi le Soleil l’attire plus fort.`, [
          bq('Les bonnes valeurs', 'Pour la force de la Terre sur le télescope, on utilise :', 'la masse de la Terre, celle du télescope et la distance Terre-télescope',
            [['la masse du Soleil, celle du télescope et la distance Soleil-télescope', 'Ça, c’est la force exercée par le Soleil.'], ['la masse de la Terre, celle du Soleil et la distance Terre-Soleil', 'Le télescope doit faire partie du calcul.']]),
          nStep('Le calcul', 'Calcule F (au dixième), avec son unité.', F, 'N', ['N', 'kg', 'J'],
            [{ v: G * mT * mt / d, code: 'carre', msg: 'La distance est au carré : divise par d × d.' }], `🧮 F = 6,67 × 10⁻¹¹ × 5,98 × 10²⁴ × ${fr(mt, 0)} ÷ (1,49 × 10⁹)² ≈ ${fr(F, 1)} N`, 0.06),
          bq('Expliquer', 'Le Soleil est environ 100 fois plus loin du télescope que la Terre, mais il l’attire plus fort. Pourquoi ?', 'Sa masse est environ 330 000 fois plus grande, ce qui compense la distance au carré (100² = 10 000)',
            [['Plus on est loin, plus la force est grande', 'C’est l’inverse : la force diminue quand la distance augmente.'], ['Le Soleil est plus chaud', 'La température n’intervient pas dans la gravitation : ce sont les masses et la distance.']]),
          pStep(`La Terre attire le télescope avec une force d’environ ${fr(F, 1)} N ; le Soleil l’attire plus fort car sa masse est bien plus grande.`,
            [[`La Terre attire le télescope avec une force de ${fr(mt, 0)} N.`, `${fr(mt, 0)}, c’est la masse du télescope en kg.`], ['Le télescope n’est attiré par rien dans l’espace.', 'La gravitation agit à distance, même dans l’espace.']]),
        ]);
      } },
    ] },

  /* ===================== 2023 ===================== */
  { id: 'b2023', year: 2023, title: 'La montée du niveau des mers', icon: '🌡️',
    intro: 'Le niveau moyen des mers monte : l’eau se dilate en se réchauffant et les glaciers fondent. Des satellites le surveillent au centimètre près.',
    qs: [
      { pts: 3, skill: 'K2', need: ['K2'], name: 'Un élément de l’eau de mer', make(lv) {
        const [X, name, Z, A] = atomOf(pick(['Na', 'Mg', 'Cl', 'K', 'Ca'])), N = A - Z;
        return stepsItem('K2', lv, bCtx('L’eau de mer contient de nombreux éléments chimiques en petites quantités.') +
          `Dans la classification périodique, le ${name} (<b>${X}</b>) a le numéro atomique <b>${Z}</b>. Un atome de ${name} contient <b>${A} nucléons</b>. Donne la composition de son noyau.`, [
          bq('Le numéro atomique', 'Le numéro atomique Z donne :', 'le nombre de protons du noyau', [['le nombre de nucléons', 'Les nucléons, c’est A.', 'zA'], ['le nombre de neutrons', 'Z compte les protons.', 'zA']]),
          nStep('Les protons', 'Nombre de protons :', Z, 'protons', null, [{ v: A, code: 'zA', msg: `${A}, ce sont les nucléons.` }], `⚛️ protons = Z = ${Z}`),
          nStep('Les neutrons', 'Nombre de neutrons :', N, 'neutrons', null, [{ v: A, code: 'neutA', msg: `Neutrons = nucléons − protons = ${A} − ${Z}.` }, { v: Z, code: 'zA', msg: 'Ça, ce sont les protons.' }].filter((x) => x.v !== N), `🧮 neutrons = ${A} − ${Z} = ${N}`),
          pStep(`Le noyau de l’atome de ${name} contient ${Z} protons et ${N} neutrons.`, [[`Le noyau contient ${A} protons.`, `${A} compte les protons ET les neutrons.`], [`Le noyau contient ${Z} électrons.`, 'Les électrons ne sont pas dans le noyau.']]),
        ]);
      } },
      { pts: 3, skill: 'V8', need: [], name: 'L’eau se dilate', make(lv) {
        const m = pick([500, 1000, 2000]), V = m / 0.997;
        return stepsItem('V8', lv, bCtx('Une partie de la montée des mers vient de la dilatation de l’eau qui se réchauffe.') +
          `On chauffe de l’eau de 5 °C à 25 °C dans un ballon fermé par un tube fin. La balance indique toujours <b>${m} g</b>, mais le niveau monte dans le tube.<br><span class="small">Masse volumique de l’eau : 1,000 g/mL à 5 °C • 0,999 g/mL à 15 °C • 0,997 g/mL à 25 °C</span>`, [
          bq('Lire les données', 'De 5 °C à 25 °C, la masse volumique de l’eau :', 'diminue', [['augmente', 'Compare 1,000 et 0,997.'], ['ne change pas', 'Compare 1,000 et 0,997.']]),
          nStep('Le volume à 25 °C', `Volume de ${m} g d’eau à 25 °C (V = m ÷ ρ), au dixième de mL :`, V, 'mL', null, [{ v: m * 0.997, code: 'inverse', msg: 'V = m ÷ ρ : on divise la masse par la masse volumique.' }], `🧮 V = ${m} ÷ 0,997 ≈ ${fr(V, 1)} mL (au lieu de ${m} mL à 5 °C)`, 0.15),
          bq('Expliquer', 'Pourquoi le niveau monte-t-il dans le tube ?', 'La masse reste la même mais la masse volumique baisse : le volume de l’eau augmente',
            [['On a ajouté de l’eau en chauffant', 'La balance montre que la masse ne change pas.'], ['L’eau s’évapore', 'L’évaporation ferait baisser le niveau, pas monter.']]),
          pStep('En se réchauffant, l’eau garde la même masse mais sa masse volumique diminue : son volume augmente, donc le niveau monte.', [['L’eau devient plus lourde en chauffant.', 'La masse ne change pas.'], ['Le niveau monte car l’eau se transforme en glace.', 'L’eau ne gèle pas à 25 °C.']]),
        ]);
      } },
      { pts: 4, skill: 'V6', need: ['V6'], name: 'Le radar du satellite', make(lv) {
        const tms = pick([8.88, 8.9, 8.92, 8.86]), t = tms / 1000, d = 300000 * t / 2;
        return stepsItem('V6', lv, bCtx('Un satellite mesure la hauteur de la mer avec un radar. Il vole à 1 336 km d’altitude.') +
          `Le radar envoie un signal vers la mer. Le signal va à <b>300 000 km/s</b> et revient au satellite <b>${fr(tms)} ms</b> plus tard (1 ms = 0,001 s). Calcule la distance entre le satellite et la mer.`, [
          fStep('d = v × t ÷ 2', [['d = v × t', 'Le signal fait l’aller ET le retour : on divise par 2.', 'allerretour'], ['d = v ÷ t', 'Pour une distance, on multiplie la vitesse par la durée.']], 'd = v × t ÷ 2 (aller-retour)'),
          nStep('La conversion', `${fr(tms)} ms en secondes :`, t, 's', null, [{ v: tms / 100, code: 'p10', msg: '1 ms = 0,001 s : on divise par 1 000.' }, { v: tms * 1000, code: 'p10', msg: 'Des ms aux s, le nombre devient plus petit : on divise par 1 000.' }], `🔁 ${fr(tms)} ms = ${fr(t, 5)} s`, 0.000005),
          nStep('Le calcul', 'Calcule la distance et choisis l’unité.', d, 'km', ['km', 'm', 'km/s'], [{ v: 2 * d, code: 'allerretour', msg: 'Tu as la distance aller-retour : divise par 2.' }], `🧮 d = 300 000 × ${fr(t, 5)} ÷ 2 = ${fr(d, 0)} km`, 0.6),
          bq('Commenter', 'Le satellite vole à 1 336 km d’altitude. Ta distance :', 'est presque égale à l’altitude : le signal est bien allé jusqu’à la surface de la mer',
            [['vaut le double de l’altitude', 'Tu as oublié de diviser par 2.', 'allerretour'], ['montre que le signal va plus vite que la lumière', 'Le signal radio va à la vitesse de la lumière, pas plus.']],
            `✍️ Le satellite est à environ ${fr(d, 0)} km de la mer, presque son altitude (1 336 km) : la petite différence renseigne sur la hauteur de la mer.`),
        ]);
      } },
    ] },

  /* ===================== 2021 ===================== */
  { id: 'b2021', year: 2021, title: 'La fonte des glaciers', icon: '🏔️',
    intro: 'Les glaciers de montagne reculent : l’air se réchauffe à cause des gaz à effet de serre et la neige d’hiver ne compense plus la fonte d’été.',
    qs: [
      { pts: 3, skill: 'K8', need: ['K6', 'K8'], name: 'La combustion du méthane', make(lv) {
        return stepsItem('K8', lv, bCtx('Le méthane CH₄, gaz à effet de serre, est aussi le principal constituant du gaz naturel, que l’on brûle pour se chauffer.') +
          'La combustion complète du méthane dans le dioxygène produit du dioxyde de carbone et de l’eau. Choisis l’équation qui la modélise et justifie.', [
          nStep('La molécule', 'Nombre total d’atomes dans CH₄ :', 5, 'atomes', null, [{ v: 2, code: 'indice', msg: 'Il y a 1 carbone et 4 hydrogènes.' }, { v: 4, code: 'indice', msg: 'N’oublie pas l’atome de carbone.' }], '🧪 CH₄ : 1 carbone + 4 hydrogènes = 5 atomes'),
          bq('La bonne équation', 'Quelle équation est juste ?', 'CH₄ + 2 O₂ → CO₂ + 2 H₂O',
            [['CH₄ + 2 O₂ → CO₂ + 2 H₂', 'Les produits sont le dioxyde de carbone et l’eau, pas le dihydrogène.', 'reacProd'], ['CH₄ + 2 O₂ → 2 CO₂ + H₂O', 'Compte les carbones : 1 à gauche, 2 à droite. Elle n’est pas ajustée.', 'ajuste']]),
          nStep('Vérifier', 'Dans la bonne équation, combien d’atomes d’oxygène de chaque côté ?', 4, 'atomes', null,
            [{ v: 2, code: 'coefIndice', msg: '2 O₂ = 2 molécules de 2 atomes = 4 atomes.' }, { v: 3, code: 'coefIndice', msg: 'À droite : 2 dans CO₂ + 1 × 2 dans 2 H₂O = 4.' }], '🔍 gauche : 2 × 2 = 4 O ; droite : 2 + 2 × 1 = 4 O'),
          pStep('L’équation est CH₄ + 2 O₂ → CO₂ + 2 H₂O : elle donne les bons produits et conserve les atomes (1 C, 4 H, 4 O de chaque côté).',
            [['L’équation est CH₄ + 2 O₂ → 2 CO₂ + H₂O.', 'Elle n’est pas ajustée.'], ['Le méthane CH₄ contient 4 atomes.', 'Il en contient 5.']]),
        ]);
      } },
      { pts: 2, skill: 'E2', need: ['E2'], name: 'Le barrage', make(lv) {
        return stepsItem('E2', lv, bCtx('L’eau de fonte des glaciers remplit des lacs de barrage qui alimentent des centrales hydroélectriques.') +
          'Quelle forme d’énergie l’eau du lac possède-t-elle ? Quelle conversion réalise l’alternateur de la centrale ?', [
          bq('Le lac', 'L’eau retenue en hauteur dans le lac possède surtout de l’énergie :', 'de position (potentielle)',
            [['cinétique', 'L’eau du lac est presque immobile : pas de vitesse, presque pas d’énergie cinétique.'], ['chimique', 'L’eau ne brûle pas : son énergie vient de sa hauteur.']]),
          bq('L’alternateur', 'L’alternateur :', 'reçoit de l’énergie cinétique (la rotation de la turbine) et fournit de l’énergie électrique, avec une perte thermique',
            [['reçoit de l’énergie électrique et fournit de l’énergie cinétique', 'Ça, c’est un moteur.'], ['crée de l’énergie électrique à partir de rien', 'L’énergie ne se crée pas : elle se convertit.']]),
          pStep('L’eau du lac possède de l’énergie de position ; l’alternateur convertit l’énergie cinétique de la turbine en énergie électrique (et un peu en énergie thermique perdue).',
            [['L’eau du lac possède de l’énergie électrique.', 'L’électricité est produite plus loin, par l’alternateur.'], ['L’alternateur produit de l’énergie.', 'Il la convertit, il ne la produit pas.']]),
        ]);
      } },
      { pts: 2, skill: 'V8', need: [], name: 'Un glacier qui maigrit', make(lv) {
        const e0 = rnd(120, 160), d1 = 4, d2 = pick([8, 9, 10, 12]), e1 = e0 - d1, e2 = e1 - d2;
        return stepsItem('V8', lv, bCtx('On mesure chaque année l’épaisseur de la glace en un point d’un glacier des Alpes.') +
          `Épaisseur mesurée : <b>${e0} m</b> en 1990, <b>${e1} m</b> en 2000, <b>${e2} m</b> en 2010. Compare la diminution des deux décennies.`, [
          nStep('2000 → 2010', 'Diminution de l’épaisseur entre 2000 et 2010 :', d2, 'm', null, [{ v: e2, code: 'question', msg: `${e2} m, c’est l’épaisseur restante. On veut ce qui a été perdu : ${e1} − ${e2}.` }], `🧮 ${e1} − ${e2} = ${d2} m (contre ${d1} m entre 1990 et 2000)`),
          bq('Comparer', 'Que montre la comparaison ?', `La glace fond ${fr(d2 / d1, 1)} fois plus vite : cela va dans le sens d’un réchauffement qui s’accélère`,
            [['La diminution est la même : le climat ne change pas', `${d1} m puis ${d2} m : ce n’est pas pareil.`], ['Le glacier grossit', 'L’épaisseur baisse d’une mesure à l’autre.']]),
          pStep(`Le glacier a perdu ${d1} m entre 1990 et 2000, puis ${d2} m entre 2000 et 2010 : la fonte s’accélère.`, [[`Le glacier mesure ${e2} m.`, 'C’est l’épaisseur, pas la comparaison demandée.'], ['Le glacier a perdu 10 m en 10 ans.', 'Reprends tes valeurs.']]),
        ]);
      } },
      { pts: 3, skill: 'V4', need: ['V4'], name: 'La glace avance', make(lv) {
        const y1 = pick([1788, 1800, 1812]), n = pick([36, 40, 44]), d = pick([3960, 4200, 4370]), v = d / n;
        return stepsItem('V4', lv, bCtx('Un glacier n’est pas immobile : la glace descend lentement la pente, comme un fleuve très lent.') +
          `Une échelle oubliée sur le glacier en <b>${y1}</b> est retrouvée <b>${fr(d, 0)} m</b> plus bas en <b>${y1 + n}</b>. Calcule la vitesse d’écoulement de la glace en mètres par an.`, [
          fStep('v = d ÷ t', [['v = t ÷ d', 'La distance va en haut : v = d ÷ t.', 'inverse'], ['v = d × t', 'Pour une vitesse, on divise la distance par la durée.']], 'v = d ÷ t'),
          nStep('La durée', 'Combien d’années se sont écoulées ?', n, 'ans', null, [{ v: y1 + n, code: 'question', msg: `On veut la durée : ${y1 + n} − ${y1}.` }], `📅 t = ${y1 + n} − ${y1} = ${n} ans`),
          nStep('Le calcul', 'Calcule v (à l’unité) et choisis l’unité.', v, 'm/an', ['m/an', 'm', 'ans'], [{ v: n / d, code: 'inverse', msg: 'Division à l’envers.' }], `🧮 v = ${fr(d, 0)} ÷ ${n} ≈ ${fr(v, 0)} m/an`, 0.6),
          pStep(`La glace avance d’environ ${fr(v, 0)} m par an.`, [[`La glace a avancé de ${fr(d, 0)} m.`, 'C’est la distance totale, pas la vitesse.'], [`La glace avance de ${n} m par an.`, `${n}, c’est la durée en années.`]]),
        ]);
      } },
    ] },

  /* ===================== 2019 ===================== */
  { id: 'b2019', year: 2019, title: 'Les carottes de glace et le climat', icon: '🧊',
    intro: 'Dans les régions polaires, on prélève des cylindres de glace, les « carottes ». Leurs atomes et les bulles d’air piégées racontent le climat du passé.',
    qs: [
      { pts: 3, skill: 'K2', need: ['K2'], name: 'Trois atomes d’oxygène', make(lv) {
        const A = pick([16, 17, 18]);
        return stepsItem('K2', lv, bCtx('La glace contient trois sortes d’atomes d’oxygène stables : l’oxygène 16, l’oxygène 17 et l’oxygène 18 (le nombre indique les nucléons). Tous ont le numéro atomique 8.') +
          `Combien de protons ont ces atomes ? Combien de neutrons a l’oxygène <b>${A}</b> ? Qu’est-ce qui les différencie ?`, [
          bq('Les protons', 'Les oxygènes 16, 17 et 18 ont :', '8 protons chacun, car leur numéro atomique est Z = 8',
            [['16, 17 et 18 protons', 'Ces nombres sont les nucléons (A), pas les protons.', 'zA'], ['8, 9 et 10 protons', 'Ce sont les nombres de neutrons.', 'zA']]),
          nStep('Les neutrons', `Neutrons de l’oxygène ${A} :`, A - 8, 'neutrons', null, [{ v: A, code: 'neutA', msg: `Neutrons = nucléons − protons = ${A} − 8.` }, { v: 8, code: 'zA', msg: 'Ce sont les protons.' }].filter((x) => x.v !== A - 8), `🧮 ${A} − 8 = ${A - 8} neutrons`),
          bq('La différence', 'Ces trois atomes se différencient par :', 'leur nombre de neutrons', [['leur nombre de protons', 'Ils ont tous 8 protons.', 'zA'], ['leur nombre d’électrons', 'Atomes neutres : 8 électrons chacun.', 'zA']]),
          pStep(`Les trois atomes ont 8 protons ; l’oxygène ${A} a ${A - 8} neutrons ; ils ne diffèrent que par le nombre de neutrons.`, [[`L’oxygène ${A} a ${A} protons.`, 'Il a 8 protons et A nucléons.'], ['Ils diffèrent par leurs protons.', 'Même Z = mêmes protons.']]),
        ]);
      } },
      { pts: 3, skill: 'V8', need: [], name: 'Le CO₂ dans l’air', make(lv) {
        const tab = '<table class="tbl"><tr><th>Année</th><td>1810</td><td>1910</td><td>1950</td><td>2010</td></tr><tr><th>CO₂ (% de l’air)</th><td>0,0283</td><td>0,0300</td><td>0,0311</td><td>0,0389</td></tr></table>';
        return stepsItem('V8', lv, bCtx('Les bulles d’air piégées dans la glace donnent la part de dioxyde de carbone dans l’air du passé ; depuis 1958, on la mesure directement.') +
          `${tab}Compare l’évolution entre 1810 et 1950, puis entre 1950 et 2010.`, [
          nStep('1810 → 1950', 'Hausse du pourcentage de CO₂ entre 1810 et 1950 :', 0.0028, '%', null, [{ v: 0.0594, code: 'question', msg: 'On veut la différence : 0,0311 − 0,0283.' }], '🧮 0,0311 − 0,0283 = 0,0028 % en 140 ans', 0.00005),
          nStep('1950 → 2010', 'Hausse entre 1950 et 2010 :', 0.0078, '%', null, [{ v: 0.07, code: 'question', msg: 'On veut la différence : 0,0389 − 0,0311.' }], '🧮 0,0389 − 0,0311 = 0,0078 % en 60 ans', 0.00005),
          bq('Comparer', 'Que montrent ces deux hausses ?', 'La hausse est presque 3 fois plus forte en 60 ans qu’en 140 ans : elle s’accélère',
            [['Les deux hausses sont presque égales', '0,0028 et 0,0078 : la seconde est presque 3 fois plus grande.'], ['Le CO₂ diminue depuis 1950', 'Les valeurs augmentent.']]),
          pStep('Le CO₂ a augmenté de 0,0028 % entre 1810 et 1950, puis de 0,0078 % entre 1950 et 2010 : la hausse s’accélère fortement.', [['Le CO₂ vaut 0,0389 % en 2010.', 'C’est une valeur du tableau, pas la comparaison.'], ['Le CO₂ augmente toujours au même rythme.', 'Compare les durées : 140 ans puis 60 ans.']]),
        ]);
      } },
      { pts: 4, skill: 'P1', need: ['P1', 'P2'], name: 'Le poids d’une carotte de glace', make(lv) {
        const P = pick([216, 236, 255, 275, 294]), g = 9.82, m = P / g;
        return stepsItem('P1', lv, bCtx('Sur la base de Vostok, en Antarctique, l’intensité de la pesanteur vaut g = 9,82 N/kg.') +
          `On extrait une carotte de glace de poids <b>P = ${P} N</b>. Comment représenter ce poids (échelle 1 cm pour 100 N) ? Quelle est la masse de la carotte ?`, [
          bq('La flèche', 'Le poids se représente par une flèche :', 'verticale, vers le bas, partant du centre de la carotte',
            [['verticale, vers le haut', 'Le poids est dirigé vers le centre de la Terre : vers le bas.'], ['horizontale', 'Le poids est toujours vertical.']]),
          nStep('La longueur', 'Longueur de la flèche (1 cm pour 100 N) :', P / 100, 'cm', null, [{ v: 100 / P, code: 'inverse', msg: `Combien de fois 100 N dans ${P} N ? ${P} ÷ 100.` }, { v: P / 10, code: 'p10', msg: '1 cm pour 100 N : on divise par 100.' }], `📏 ${P} ÷ 100 = ${fr(P / 100)} cm`, 0.05),
          fStep('m = P ÷ g', [['m = P × g', 'Pour retrouver la masse, on divise le poids par g.', 'poidsmasse'], ['m = g ÷ P', 'Division à l’envers.', 'inverse']], 'P = m × g, donc m = P ÷ g'),
          nStep('Le calcul', 'Calcule m (au dixième) et choisis l’unité.', m, 'kg', ['kg', 'N', 'g'], [{ v: P * g, code: 'poidsmasse', msg: 'On divise par g.' }, { v: g / P, code: 'inverse', msg: 'Division à l’envers.' }], `🧮 m = ${P} ÷ 9,82 ≈ ${fr(m, 1)} kg`, 0.15),
          pStep(`La carotte a une masse d’environ ${fr(m, 1)} kg ; son poids se représente par une flèche verticale vers le bas de ${fr(P / 100)} cm.`, [[`La carotte a une masse de ${P} N.`, 'Une masse s’exprime en kg ; N, c’est pour le poids.', 'poidsmasse'], [`La carotte a une masse de ${fr(P * g, 0)} kg.`, 'On divise par g, on ne multiplie pas.']]),
        ]);
      } },
    ] },

  /* ===================== 2017 ===================== */
  { id: 'b2017', year: 2017, title: 'Produire de l’électricité', icon: '⚡',
    intro: 'La plupart des centrales électriques brûlent du charbon, du pétrole ou du gaz. Certains pays choisissent plutôt la géothermie, qui utilise la chaleur du sous-sol.',
    qs: [
      { pts: 2, skill: 'E2', need: [], name: 'Deux sortes de centrales', make(lv) {
        return stepsItem('E2', lv, bCtx('Une centrale géothermique fait tourner sa turbine avec la vapeur d’eau chauffée par la Terre, sans combustion.') +
          'Compare la centrale thermique à flamme et la centrale géothermique : source d’énergie, renouvelable ou non, fumées ou non.', [
          bq('La centrale à flamme', 'La centrale thermique à flamme :', 'brûle du charbon, du pétrole ou du gaz : sources non renouvelables, avec des fumées',
            [['utilise une source renouvelable', 'Charbon, pétrole et gaz s’épuisent : ils ne sont pas renouvelables.'], ['ne rejette aucune fumée', 'Toute combustion rejette des fumées et du CO₂.']]),
          bq('La centrale géothermique', 'La centrale géothermique :', 'utilise la chaleur de la Terre : source renouvelable, sans combustion ni fumées',
            [['brûle de la vapeur d’eau', 'La vapeur ne brûle pas : elle fait tourner la turbine.'], ['utilise l’énergie nucléaire', 'C’est la chaleur naturelle du sous-sol.']]),
          pStep('La centrale à flamme utilise des combustibles fossiles non renouvelables et rejette des fumées ; la centrale géothermique utilise la chaleur renouvelable de la Terre, sans fumées.',
            [['Les deux centrales rejettent des fumées.', 'La géothermie n’a pas de combustion.'], ['Les deux sources sont renouvelables.', 'Le charbon, le pétrole et le gaz ne le sont pas.']]),
        ]);
      } },
      { pts: 3, skill: 'K8', need: ['K8'], name: 'Combien de molécules ?', make(lv) {
        const k = pick([3, 6, 9, 1.5]), N = k * 1e22;
        return stepsItem('K8', lv, bCtx('Dans une centrale au gaz, le méthane brûle : CH₄ + 2 O₂ → CO₂ + 2 H₂O.') +
          `On brûle complètement <b>${sciTxt(N)} molécules</b> de méthane. Quel gaz à effet de serre est produit ? Combien de molécules de dioxygène faut-il ? Combien de molécules de dioxyde de carbone se forment ?`, [
          bq('Le gaz à effet de serre', 'Le gaz à effet de serre produit est :', 'le dioxyde de carbone CO₂',
            [['le dioxygène O₂', 'Le dioxygène est un réactif, et ce n’est pas un gaz à effet de serre.', 'reacProd'], ['le méthane CH₄', 'Le méthane est un réactif : il est consommé, pas produit.', 'reacProd']]),
          sciStep('Le dioxygène', 'Molécules de O₂ nécessaires :', 2 * N, 'molécules', null, [{ v: N, code: 'coefIndice', msg: 'L’équation indique 2 O₂ pour 1 CH₄ : il en faut deux fois plus.' }, { v: N / 2, code: 'coefIndice', msg: '2 O₂ pour 1 CH₄ : on multiplie par 2.' }], `🧮 2 × ${sciTxt(N)} = ${sciTxt(2 * N)} molécules de O₂`),
          sciStep('Le dioxyde de carbone', 'Molécules de CO₂ formées :', N, 'molécules', null, [{ v: 2 * N, code: 'coefIndice', msg: '1 CH₄ donne 1 CO₂.' }], `🧮 1 CH₄ → 1 CO₂ : ${sciTxt(N)} molécules de CO₂`),
          pStep(`Il faut ${sciTxt(2 * N)} molécules de dioxygène ; il se forme ${sciTxt(N)} molécules de CO₂, un gaz à effet de serre.`, [[`Il faut ${sciTxt(N)} molécules de dioxygène.`, 'Regarde le 2 devant O₂.'], ['Il se forme du dioxygène.', 'Le dioxygène est consommé.']]),
        ]);
      } },
      { pts: 3, skill: 'E2', need: [], name: 'La puissance de la centrale', make(lv) {
        const t = pick([6600, 6820, 7000, 6500]), E = Math.round(1100 * t / 100000) * 100000, P = E / t;
        return stepsItem('E2', lv, bCtx('Une centrale à flamme a une puissance d’environ 1 100 MW.') +
          `Une centrale géothermique fournit <b>${fr(E, 0)} MWh</b> d’énergie par an, en fonctionnant <b>${fr(t, 0)} heures</b>. Calcule sa puissance et compare-la à celle de la centrale à flamme.`, [
          fStep('P = E ÷ t', [['P = E × t', 'C’est E = P × t ; pour la puissance, on divise E par t.'], ['P = t ÷ E', 'Division à l’envers.', 'inverse']], 'E = P × t, donc P = E ÷ t'),
          nStep('Le calcul', 'Calcule P (à l’unité) et choisis l’unité.', P, 'MW', ['MW', 'MWh', 'h'], [{ v: t / E, code: 'inverse', msg: 'Division à l’envers.' }, { v: E * t, code: 'formule', msg: 'On divise l’énergie par la durée.' }], `🧮 P = ${fr(E, 0)} ÷ ${fr(t, 0)} ≈ ${fr(P, 0)} MW (MWh ÷ h = MW)`, 2),
          bq('Comparer', 'Par rapport à la centrale à flamme (1 100 MW), sa puissance est :', 'équivalente', [['10 fois plus petite', `Compare ${fr(P, 0)} et 1 100.`], ['10 fois plus grande', `Compare ${fr(P, 0)} et 1 100.`]]),
          pStep(`La centrale géothermique a une puissance d’environ ${fr(P, 0)} MW, équivalente à celle de la centrale à flamme.`, [[`La puissance vaut ${fr(E, 0)} MWh.`, 'MWh est une unité d’énergie ; la puissance est en MW.'], [`La centrale fonctionne ${fr(t, 0)} h.`, 'C’est une donnée.']]),
        ]);
      } },
      { pts: 2, skill: 'E2', need: [], name: 'Pourquoi la géothermie ?', make(lv) {
        return stepsItem('E2', lv, bCtx('À puissance égale, certains pays choisissent la géothermie plutôt que les centrales à flamme.') +
          'Donne deux arguments en faveur de la géothermie.', [
          bq('Premier argument', 'Premier argument :', 'Elle utilise une ressource renouvelable, qui ne s’épuise pas',
            [['Elle produit plus d’énergie que toutes les autres centrales', 'Les puissances sont équivalentes.'], ['Elle brûle moins de charbon', 'Elle n’en brûle pas du tout.']]),
          bq('Deuxième argument', 'Deuxième argument :', 'Sans combustion, elle ne rejette pas de CO₂ et ne renforce pas l’effet de serre',
            [['Elle fonctionne sans eau', 'Elle utilise justement l’eau chaude du sous-sol.'], ['Elle rejette du CO₂ qui protège le climat', 'Le CO₂ renforce l’effet de serre.']],
            '✍️ La géothermie utilise une ressource renouvelable et, sans combustion, ne rejette pas de CO₂.'),
        ]);
      } },
    ] },
];

/* ---------- Disponibilité : une question n'est posée que si sa notion est ouverte ---------- */
const bqOpen = (q) => q.need.every((k) => skillActive(k));
const bqLesson = (q) => {
  const k = q.need.find((x) => !skillActive(x)), s = SKILLS.find((x) => x.id === k), c = s && COURS.find((x) => x.id === s.lesson);
  return c ? c.title : (s ? s.name : '');
};
const brevOpenQs = (b) => b.qs.filter(bqOpen);
const brevOk = (b) => brevOpenQs(b).length >= 2;
function brevState() { S.brev = S.brev || { lv: 1, best: {}, hist: [] }; return S.brev; }

function brevItems(b, lv) {
  return brevOpenQs(b).map((q) => {
    const it = q.make(lv);
    it.brevPts = q.pts; it.brevName = q.name;
    if (!q.need.includes(it.skill)) it.noTrack = true;
    return it;
  });
}

/* ---------- Écran liste ---------- */
function screenBrevet() {
  const B = brevState();
  const last = B.hist[B.hist.length - 1];
  const card = (b) => {
    const open = brevOpenQs(b), lock = b.qs.filter((q) => !bqOpen(q)), best = B.best[b.id];
    const ok = brevOk(b);
    const lessons = [...new Set(lock.map(bqLesson).filter(Boolean))];
    return `<button class="card brev ${ok ? '' : 'off'}" data-b="${b.id}" style="display:block;width:100%;text-align:left;cursor:pointer;font:inherit;color:inherit${ok ? '' : ';opacity:.6'}">
      <div class="row between"><span class="chip">${b.icon} Brevet ${b.year}</span>${best != null ? `<b>${fr(best, 1)}/20</b>` : ''}</div>
      <h3 style="margin:8px 0 4px">${b.title}</h3>
      <p class="small muted" style="margin:0">${ok ? `${open.length} question${open.length > 1 ? 's' : ''} • environ ${open.length * 4} min` : '🔒 Pas encore assez de notions vues'}${lock.length ? `${ok ? ' • ' : ' : '}${lock.length} question${lock.length > 1 ? 's' : ''} après ${lessons.map((t) => `« ${t} »`).join(', ')}` : ''}</p>
    </button>`;
  };
  render(`
    <div class="row between" style="margin-bottom:10px"><button class="link" id="bBack">← Accueil</button><span class="chip">🎓 Sujets type Brevet</span></div>
    <div class="card hero stack">
      <h2>La physique-chimie du brevet</h2>
      <p class="muted" style="margin:0">Les sujets tombés en Métropole, réécrits pour l’appli, avec d’autres nombres à chaque essai. Tu rédiges chaque question comme sur ta copie, puis tu obtiens une note sur 20.</p>
      <div class="tip" style="color:var(--ink)">🎚️ <b>Niveau d’aide ${B.lv}/3</b> : ${CTRL_LV[B.lv]}.<br><span class="small">Avec 14/20 ou plus, l’aide diminue la fois suivante. Les questions sur des notions pas encore vues sont gardées pour plus tard.</span></div>
      ${last ? `<p class="small" style="margin:0">Dernier essai : <b>${fr(last.note, 1)}/20</b> (Brevet ${(BREVET.find((x) => x.id === last.id) || {}).year || ''}, aide ${last.lv}/3)</p>` : ''}
      ${B.lv > 1 ? '<button class="link" id="bHelp" style="text-align:left">Je préfère plus d’aide la prochaine fois</button>' : ''}
    </div>
    <div class="stack">${BREVET.map(card).join('')}</div>
    <p class="small muted" style="margin:12px 4px">Au brevet, la physique-chimie est la moitié de l’épreuve de sciences (1 h, deux disciplines sur la même copie). En Métropole, il n’y avait pas de physique-chimie en 2018 et 2022, ni d’épreuve en 2020.</p>`);
  document.getElementById('bBack').onclick = screenHome;
  const h = document.getElementById('bHelp'); if (h) h.onclick = () => { B.lv = Math.max(1, B.lv - 1); saveState(); screenBrevet(); };
  document.querySelectorAll('[data-b]').forEach((el) => el.onclick = () => {
    const b = BREVET.find((x) => x.id === el.dataset.b);
    if (!brevOk(b)) return toast(`Ce sujet s’ouvre après la leçon ${[...new Set(b.qs.filter((q) => !bqOpen(q)).map(bqLesson))].map((t) => `« ${t} »`).join(' ou ')}.`);
    startRun('redac', null, brevItems(b, B.lv)); RUN.brev = { id: b.id, lv: B.lv };
  });
}

/* ---------- Fin du sujet : note sur 20 ---------- */
function brevPoints(r) {
  const own = r.item.steps.filter((s) => !s.given);
  return own.length ? r.item.brevPts * own.filter((s) => s.res === 'ok').length / own.length : 0;
}
function finishBrevet() {
  stopTimer();
  const run = RUN, res = run.results, B = brevState(), b = BREVET.find((x) => x.id === run.brev.id);
  const streakMsg = touchStreak();
  S.sessions++;
  const pts = res.map(brevPoints), tot = res.reduce((s, r) => s + r.item.brevPts, 0);
  const note = Math.round(pts.reduce((a, x) => a + x, 0) / tot * 20 * 2) / 2;
  const prevBest = B.best[b.id];
  B.hist.push({ date: todayStr(), id: b.id, lv: run.brev.lv, note, n: res.length });
  B.hist = B.hist.slice(-30);
  if (prevBest == null || note > prevBest) B.best[b.id] = note;
  let up = '';
  if (note >= 14 && run.brev.lv === B.lv && B.lv < 3) { B.lv++; up = `Prochaine fois : niveau d’aide ${B.lv}/3 (${CTRL_LV[B.lv].toLowerCase()}).`; }
  addXP(30 + Math.round(note) * 2);
  saveState(); flush();
  const skipped = b.qs.filter((q) => !bqOpen(q));
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${note >= 14 ? '🏆' : note >= 10 ? '💪' : '🌱'}</div>
      <h2>Brevet ${b.year} : ${b.title}</h2>
      <div class="big-num">${fr(note, 1)}/20</div>
      <p class="muted">${run.brev.lv === 3 ? 'Sans aide, comme le jour J.' : `Avec l’aide de niveau ${run.brev.lv}/3.`} ${prevBest != null && note > prevBest ? `Nouveau record sur ce sujet (avant : ${fr(prevBest, 1)}).` : ''}</p>
      ${up ? `<p><b>⬆️ ${up}</b></p>` : note < 14 ? '<p class="small">Les questions ratées reviennent dans « À revoir ». Retente un sujet dans quelques jours.</p>' : ''}
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <h3 style="margin:8px 4px">Ta copie corrigée</h3>
    ${res.map((r, i) => `<div class="card"><div class="row between"><span class="chip">Q${i + 1} • ${r.item.brevName}</span><b>${fr(pts[i], 1)}/${fr(r.item.brevPts, 1)}</b></div>
      <details style="margin-top:8px"><summary class="small"><b>Énoncé et correction</b></summary><div class="small">${r.item.q}</div>
      <div class="fb sol small"><ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol></div></details></div>`).join('')}
    ${skipped.length ? `<p class="small muted" style="margin:8px 4px">Pas encore posée${skipped.length > 1 ? 's' : ''} : ${skipped.map((q) => `${q.name} (après « ${bqLesson(q)} »)`).join(', ')}.</p>` : ''}
    <div class="stack"><button class="btn" id="bAgain">🎓 Un autre sujet</button><button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
  document.getElementById('home').onclick = screenHome;
  document.getElementById('bAgain').onclick = screenBrevet;
}

/* ---------- Tuile sur l'accueil (les deux matières) ---------- */
(() => {
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(() => {
    const acts = app.querySelector('.acts');
    if (!acts || acts.querySelector('#brevAct') || typeof S === 'undefined' || !S || !S.pseudo) return;
    const B = S.brev || {}, last = (B.hist || [])[(B.hist || []).length - 1];
    const n = BREVET.filter(brevOk).length;
    const el = document.createElement('button');
    el.className = 'act'; el.id = 'brevAct'; el.style.order = '1'; el.style.gridColumn = '1 / -1'; el.style.minHeight = '0';
    el.innerHTML = `<span class="ic">🎓</span><b>Sujets type Brevet</b><span class="small muted">${last ? `Dernière note ${fr(last.note, 1)}/20` : `${n} sujet${n > 1 ? 's' : ''} de Métropole ouvert${n > 1 ? 's' : ''}`}</span>`;
    el.onclick = screenBrevet;
    acts.appendChild(el);
  }).observe(app, { childList: true, subtree: true });
})();

/* ---------- Accroches qui ont besoin d'app.js ---------- */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof finishRun === 'function') {
    const base = finishRun;
    finishRun = function () { return RUN && RUN.brev ? finishBrevet() : base(); };
  }
  /* Questions sur des notions sans compétence dans l'appli : ni médaille, ni « À revoir » */
  if (typeof finishItem === 'function') {
    const base = finishItem;
    finishItem = function (...a) {
      const it = RUN && RUN.cur && RUN.cur.item;
      if (!it || !it.noTrack) return base(...a);
      const ar = addReview, um = updateMasteryAfter, lv = JSON.stringify(S.redacLv || {});
      addReview = () => {}; updateMasteryAfter = () => {};
      try { return base(...a); } finally { addReview = ar; updateMasteryAfter = um; S.redacLv = JSON.parse(lv); }
    };
  }
  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Sujets type Brevet', (s) => {
    const B = s.brev; if (!B || !B.hist || !B.hist.length) return 'pas encore tenté';
    const l = B.hist[B.hist.length - 1], b = BREVET.find((x) => x.id === l.id);
    return `dernier ${fr(l.note, 1)}/20 (Brevet ${b ? b.year : ''}, aide ${l.lv}/3), ${B.hist.length} essai${B.hist.length > 1 ? 's' : ''}`;
  }, 'La physique-chimie des sujets du brevet tombés en Métropole (2017 à 2026), réécrits avec d’autres nombres. Seules les questions sur des notions déjà vues sont posées.']);
});

/* ---------- Les erreurs reviennent sous forme de questions de brevet ---------- */
(() => {
  const BY = {};
  BREVET.forEach((b) => b.qs.forEach((q) => { if (q.need.includes(q.skill)) (BY[q.skill] = BY[q.skill] || []).push(q); }));
  const OWN = ['V4', 'V5', 'V6', 'V7', 'V8', 'K4', 'K5'];
  const base = genRedac;
  genRedac = function (skill, level) {
    const lv = Math.max(1, Math.min(3, level || 1));
    const pool = (BY[skill] || []).filter(bqOpen);
    if (pool.length && (!OWN.includes(skill) || Math.random() < 0.3)) {
      const q = pick(pool), it = q.make(lv);
      return it;
    }
    return base(skill, level);
  };
})();
