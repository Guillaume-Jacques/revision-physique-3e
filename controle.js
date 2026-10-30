/* =========================================================
   Compléments du 30/10/2026 (après le contrôle « vitesse, distance, durée »)
   1. Durées : conversions en secondes et retour aux heures-minutes (V2)
   2. Exercices « contrôle-type » au format des sujets de la classe
      (amende, durée, unités mélangées, écho, lumière), nombres variables
   3. « Contrôle type » : 5 exercices à rédiger, aide dégressive, note sur 20
   4. Leçons : graphiques d(t) et v(t), contrôle corrigé, sujet type Brevet,
      encart « temps de réaction : celui de l'énoncé »
   Fichier autonome : il complète les tableaux existants et s'accroche à
   l'interface sans modifier app.js. Textes rédigés pour l'appli.
   ========================================================= */

/* ---------- 1. Durées : vers les secondes, et retour en h + min ---------- */
(() => {
  const base = GENERATORS.V2;
  const sNote = (t) => ST.piege(t);
  function extra(level) {
    if (level === 1) {
      if (Math.random() < 0.5) {
        const m = pick([2, 5, 8, 12, 15, 20]);
        return num({ skill: 'V2', level, q: `Convertis <b>${m} min</b> en secondes.`, unit: 's', ans: m * 60,
          errs: [{ v: m * 100, code: 'base100', msg: `Une minute fait 60 s, pas 100 : ${m} × 60.` },
                 { v: m / 60, code: 'conv60', msg: 'Des minutes aux secondes, le nombre devient plus grand : on multiplie par 60.' }],
          hints: ['1 min = 60 s.', `${m} × 60`],
          sol: [ST.cherche('une durée en secondes.'), ST.conv('1 min = 60 s. Vers une unité plus petite, le nombre devient plus grand : on <b>multiplie</b>.'), ST.calc(`${m} × 60 = ${m * 60} s`)] });
      }
      const h = pick([1, 2, 3]);
      return num({ skill: 'V2', level, q: `Convertis <b>${h} h</b> en secondes.`, unit: 's', ans: h * 3600,
        errs: [{ v: h * 60, code: 'conv60', msg: `${h * 60}, ce sont des minutes. Pour avoir des secondes, multiplie encore par 60 : 1 h = 3 600 s.` },
               { v: h * 10000, code: 'base100', msg: 'Une heure fait 60 min et une minute 60 s : 1 h = 60 × 60 = 3 600 s.' }],
        hints: ['1 h = 60 min = 60 × 60 s.', `${h} × 3 600`],
        sol: [ST.cherche('une durée en secondes.'), ST.conv('1 h = 60 min = 60 × 60 s = <b>3 600 s</b>.'), ST.calc(`${h} × 3 600 = ${fr(h * 3600, 0)} s`)] });
    }
    if (level === 2) {
      const k = pick(['ms', 'hm', 'dec']);
      if (k === 'ms') {
        const M = rnd(3, 12), S = pick([10, 20, 25, 40, 50, 35]);
        return num({ skill: 'V2', level, q: `Convertis <b>${M} min ${S} s</b> en secondes.`, unit: 's', ans: M * 60 + S,
          errs: [{ v: M * 100 + S, code: 'base100', msg: `Une minute fait 60 s : ${M} × 60 = ${M * 60} s, puis + ${S} s.` },
                 { v: (M + S / 100) * 60, code: 'sec100', msg: `Tu as écrit ${M} min ${S} s comme ${M},${S} min. Les secondes ne sont pas des centièmes : fais ${M} × 60 + ${S}.` }],
          hints: ['Convertis les minutes en secondes, puis ajoute les secondes.', `${M} × 60 + ${S}`],
          sol: [ST.cherche('la durée totale en secondes.'), ST.formule('minutes × 60 + secondes'), ST.calc(`${M} × 60 + ${S} = ${M * 60} + ${S} = ${M * 60 + S} s`),
                sNote(`écrire ${M},${S} min puis multiplier par 60 : les secondes ne sont pas des centièmes de minute.`)] });
      }
      if (k === 'hm') {
        const H = rnd(1, 3), M = pick([10, 20, 30, 40, 50, 15]);
        return num({ skill: 'V2', level, q: `Un trajet dure <b>${H} h ${M} min</b>. La vitesse est en m/s : convertis cette durée en secondes.`, unit: 's', ans: H * 3600 + M * 60,
          errs: [{ v: H * 60 + M, code: 'minutes', msg: `${H * 60 + M}, ce sont des minutes. Multiplie encore par 60 pour avoir des secondes.` },
                 { v: (H + M / 100) * 3600, code: 'base100', msg: `${H} h ${M} min n’est pas ${H},${M} h. Fais ${H} × 3 600 + ${M} × 60.` }],
          hints: ['1 h = 3 600 s et 1 min = 60 s.', `${H} × 3 600 + ${M} × 60`],
          sol: [ST.cherche('la durée en secondes, pour aller avec une vitesse en m/s.'), ST.formule('heures × 3 600 + minutes × 60'),
                ST.calc(`${H} × 3 600 + ${M} × 60 = ${fr(H * 3600, 0)} + ${M * 60} = ${fr(H * 3600 + M * 60, 0)} s`)] });
      }
      const t = pick([2.5, 1.75, 3.4, 0.8, 2.25, 1.2]), H = Math.floor(t), f = Math.round((t - H) * 100) / 100;
      return num({ skill: 'V2', level, q: `Ton calcul donne <b>t = ${fr(t)} h</b>. Écris cette durée en heures et minutes : ${H} h et combien de minutes ?`, unit: 'min', ans: f * 60,
        errs: [{ v: f * 100, code: 'base100', msg: `${fr(f)} h ne fait pas ${fr(f * 100)} min : une heure fait 60 min, donc ${fr(f)} × 60.` }],
        hints: ['Garde les heures entières, puis multiplie la partie après la virgule par 60.', `${fr(f)} × 60`],
        sol: [ST.cherche('la durée écrite en heures et minutes.'), ST.conv(`on garde ${H} h ; il reste ${fr(f)} h = ${fr(f)} × 60 = ${fr(f * 60)} min.`),
              ST.calc(`${fr(t)} h = ${H} h ${fr(f * 60)} min`), sNote(`lire ${fr(t)} h comme « ${H} h ${String(Math.round(f * 100)).padStart(2, '0')} ».`)] });
    }
    const k = pick(['hms', 'dec', 'qcm']);
    if (k === 'hms') {
      const H = rnd(1, 3), M = rnd(5, 55), S = pick([15, 30, 45, 20, 40]);
      const ans = H * 3600 + M * 60 + S;
      return num({ skill: 'V2', level, q: `Convertis <b>${H} h ${M} min ${S} s</b> en secondes.`, unit: 's', ans,
        errs: [{ v: H * 60 + M + S, code: 'conv60', msg: 'Chaque morceau doit être converti en secondes : h × 3 600, min × 60.' },
               { v: H * 3600 + M * 100 + S, code: 'base100', msg: 'Une minute fait 60 s, pas 100.' }],
        hints: ['h × 3 600 + min × 60 + s', `${H} × 3 600 + ${M} × 60 + ${S}`],
        sol: [ST.cherche('la durée totale en secondes.'), ST.formule('heures × 3 600 + minutes × 60 + secondes'),
              ST.calc(`${fr(H * 3600, 0)} + ${M * 60} + ${S} = ${fr(ans, 0)} s`)] });
    }
    if (k === 'dec') {
      const t = pick([2.35, 1.15, 3.45, 0.65, 2.55]), H = Math.floor(t), f = Math.round((t - H) * 100) / 100;
      return num({ skill: 'V2', level, q: `Un calcul de durée donne <b>${fr(t)} h</b>. Combien de minutes faut-il ajouter aux ${H} h ?`, unit: 'min', ans: Math.round(f * 60 * 10) / 10, tol: 0.06,
        errs: [{ v: f * 100, code: 'base100', msg: `Les chiffres après la virgule ne sont pas des minutes : ${fr(f)} × 60 = ${fr(f * 60)} min.` }],
        hints: ['Multiplie la partie décimale par 60.', `${fr(f)} × 60`],
        sol: [ST.conv(`${fr(f)} h = ${fr(f)} × 60 = ${fr(f * 60)} min`), ST.calc(`${fr(t)} h = ${H} h ${fr(f * 60)} min`)] });
    }
    const H = rnd(1, 3), M = pick([30, 15, 45, 20]);
    const good = H + M / 60;
    return qcmFrom('V2', { level, q: `Un trajet dure <b>${H} h ${M} min</b>. Quelle écriture en heures est juste ?`, choices: [
      { t: `${fr(good, 2)} h`, ok: true },
      { t: `${H},${M} h`, msg: `${H},${M} h voudrait dire ${M} centièmes d’heure. Une heure fait 60 min : ${M} ÷ 60 = ${fr(M / 60, 2)}.`, code: 'base100' },
      { t: `${H * 60 + M} h`, msg: `${H * 60 + M}, c’est le nombre de minutes, pas d’heures.`, code: 'minutes' }],
      why: `${M} min = ${M} ÷ 60 = ${fr(M / 60, 2)} h, donc ${H} h ${M} min = ${fr(good, 2)} h.` });
  }
  GENERATORS.V2 = (level) => Math.random() < (level === 1 ? 0.3 : 0.45) ? extra(level) : base(level);
  FICHES.V2.points.push('Avec une vitesse en <b>m/s</b>, la durée doit être en <b>secondes</b> : h × 3 600 + min × 60 + s.',
    'Retour en heures-minutes : 2,5 h = 2 h + 0,5 × 60 min = <b>2 h 30 min</b> (et pas 2 h 50).');
})();

/* ---------- 2. Exercices au format des contrôles de la classe ---------- */
const hms = (H, M, S) => [H ? `${H} h` : '', M ? `${M} min` : '', S ? `${S} s` : ''].filter(Boolean).join(' ');

const CTRL = {
  /* Q1 : vitesse moyenne et amende */
  amende(level, real) {
    let D, H, M, S, lim = 130, trip;
    if (real) { D = 466; H = 3; M = 12; S = 45; trip = 'Paris → Lyon'; }
    else {
      [trip, D] = pick([['Paris → Lille', 225], ['Lyon → Montpellier', 304], ['Paris → Rennes', 350], ['Bordeaux → Toulouse', 245], ['Paris → Reims', 144]]);
      const sec = Math.round(D / rnd(136, 152) * 3600);
      H = Math.floor(sec / 3600); M = Math.floor(sec % 3600 / 60); S = sec % 60;
    }
    const t = H + M / 60 + S / 3600, v = D / t, vr = Math.round(v);
    return stepsItem('V4', level, `Une voiture fait le trajet ${trip}, soit <b>${D} km</b>, en <b>${hms(H, M, S)}</b>. Sur autoroute, la vitesse est limitée à <b>${lim} km/h</b>. Le conducteur risque-t-il une amende ?`, [
      fStep('v = d ÷ t', [['v = t ÷ d', 'La distance va en haut : v = d ÷ t.', 'inverse'], ['v = d × t', 'Pour une vitesse, on divise la distance par la durée.']], 'v = d ÷ t (vitesse moyenne)'),
      nStep('Conversion de la durée', `La vitesse limite est en km/h : convertis ${hms(H, M, S)} en heures. Arrondis au millième.`, t, 'h', null,
        [{ v: H + M / 100 + S / 10000, code: 'base100', msg: 'Les minutes et les secondes ne sont pas des centièmes : min ÷ 60 et s ÷ 3 600.' },
         { v: H + (M + S / 100) / 60, code: 'sec100', msg: `${S} s ne font pas 0,${S} min : ${S} ÷ 3 600 = ${fr(S / 3600, 4)} h.` },
         { v: H * 60 + M + S / 60, code: 'minutes', msg: 'Tu as trouvé des minutes. On veut des heures : divise par 60.' }],
        `🔁 ${hms(H, M, S)} = ${H} + ${M} ÷ 60 + ${S} ÷ 3 600 ≈ ${fr(t, 3)} h`, 0.0015),
      nStep('Le calcul', 'Calcule la vitesse moyenne (arrondie à l’unité) et choisis l’unité.', v, 'km/h', ['km/h', 'm/s', 'km'],
        [{ v: D / (H + M / 100 + S / 10000), code: 'base100', msg: 'Reprends la durée convertie en heures décimales.' }, { v: t / D, code: 'inverse', msg: 'Division à l’envers : d ÷ t.' }],
        `🧮 v = ${D} ÷ ${fr(t, 3)} ≈ ${vr} km/h`, 1),
      { kind: 'qcm', label: 'La comparaison', prompt: `Compare ta vitesse moyenne à la limite de ${lim} km/h :`, choices: [
        { t: `${vr} km/h > ${lim} km/h : la moyenne dépasse la limite`, ok: true },
        { t: `${vr} km/h < ${lim} km/h : la moyenne respecte la limite`, msg: `${vr} est plus grand que ${lim}.`, code: 'question' },
        { t: 'On ne peut rien dire : ce n’est qu’une moyenne', msg: `Si la moyenne dépasse ${lim} km/h, la voiture a forcément roulé plus vite que ${lim} km/h pendant une partie du trajet.`, code: 'notion' }],
        show: `⚖️ ${vr} km/h > ${lim} km/h : la vitesse moyenne dépasse la limite, donc la voiture a forcément roulé au-dessus de ${lim} km/h.` },
      pStep(`Oui, il risque une amende : sa vitesse moyenne, environ ${vr} km/h, dépasse ${lim} km/h.`,
        [[`Sa vitesse moyenne est de ${vr} km/h.`, 'Le calcul est juste, mais la question attend un oui ou un non, justifié.'],
         ['Non, il ne risque pas d’amende.', `Sa vitesse moyenne (${vr} km/h) est au-dessus de ${lim} km/h.`]]),
    ]);
  },
  /* Q2 : durée d'un trajet, réponse en h et min */
  duree(level, real) {
    const [trip, D, V] = real ? ['Lyon → Marseille', 300, 120] : pick([['Bordeaux → Toulouse', 245, 98], ['Nantes → Rennes', 105, 84], ['Paris → Caen', 240, 96], ['Lille → Bruxelles', 110, 88], ['Paris → Orléans', 135, 108]]);
    const t = D / V, H = Math.floor(t), mn = Math.round((t - H) * 60);
    return stepsItem('V5', level, `Une voiture fait le trajet ${trip} : <b>${D} km</b> à la vitesse moyenne de <b>${V} km/h</b>. Quelle a été la durée du trajet ?`, [
      fStep('t = d ÷ v', [['t = v ÷ d', 'La distance va en haut : t = d ÷ v.', 'inverse'], ['t = d × v', 'Pour une durée, on divise la distance par la vitesse.']], 't = d ÷ v'),
      nStep('Le calcul', 'Calcule t et choisis l’unité.', t, 'h', ['h', 'min', 'km/h'],
        [{ v: V / D, code: 'inverse', msg: 'Division à l’envers : t = d ÷ v.' }], `🧮 t = ${D} ÷ ${V} = ${fr(t, 3)} h (km ÷ km/h donne des heures)`, 0.006),
      nStep('En heures et minutes', `${fr(t, 3)} h, c’est ${H} h et combien de minutes ?`, mn, 'min', null,
        [{ v: Math.round((t - H) * 100), code: 'base100', msg: `Les chiffres après la virgule ne sont pas des minutes : ${fr(t - H, 3)} × 60 = ${mn} min.` }],
        `🔁 ${fr(t - H, 3)} h × 60 = ${mn} min, donc ${fr(t, 3)} h = ${H} h ${mn} min`, 0.6),
      pStep(`Le trajet ${trip} a duré ${H} h ${mn} min.`, [[`Le trajet a duré ${H} h ${String(Math.round((t - H) * 100)).padStart(2, '0')} min.`, `${fr(t - H, 2)} h n’est pas ${Math.round((t - H) * 100)} min : une heure fait 60 min.`], [`La voiture roule à ${V} km/h.`, 'C’est une donnée de l’énoncé : on demande une durée.']]),
    ]);
  },
  /* Q3 : vitesse en m/s, durée en h-min → distance */
  mixte(level, real) {
    const [trip, v, H, M] = real ? ['Marseille → Nice', 23.8, 2, 20] : [pick(['Paris → Rouen', 'Lyon → Grenoble', 'Nantes → Angers', 'Dijon → Besançon']), pick([22.5, 25, 27.5, 19.5, 24]), rnd(1, 2), pick([10, 20, 30, 40])];
    const s = H * 3600 + M * 60, d = v * s, km = d / 1000;
    return stepsItem('V5', level, `Une voiture fait le trajet ${trip} en <b>${hms(H, M)}</b>, à la vitesse moyenne de <b>${fr(v)} m/s</b>. Quelle est la distance parcourue ? Donne-la en km.`, [
      fStep('d = v × t', [['d = v ÷ t', 'Pour une distance, on multiplie la vitesse par la durée.'], ['d = t ÷ v', 'Ça, ce n’est pas une distance.']], 'd = v × t'),
      nStep('Conversion de la durée', `La vitesse est en m/s : les unités doivent aller ensemble. Convertis ${hms(H, M)} en secondes.`, s, 's', null,
        [{ v: H * 60 + M, code: 'minutes', msg: `${H * 60 + M}, ce sont des minutes. Avec des m/s, il faut des secondes : × 60.` },
         { v: (H + M / 100) * 3600, code: 'base100', msg: `${H} h ${M} min n’est pas ${H},${M} h : ${H} × 3 600 + ${M} × 60.` },
         { v: H + M / 60, code: 'noconv', msg: 'Ce sont des heures. Avec une vitesse en m/s, la durée doit être en secondes.' }],
        `🔁 ${hms(H, M)} = ${H} × 3 600 + ${M} × 60 = ${fr(s, 0)} s`),
      nStep('Le calcul', 'Calcule d et choisis l’unité.', d, 'm', ['m', 'km', 'm/s'],
        [{ v: v * (H + M / 60), code: 'noconv', msg: 'Tu as multiplié des m/s par des heures : les unités ne vont pas ensemble. Utilise les secondes.' }],
        `🧮 d = ${fr(v)} × ${fr(s, 0)} = ${fr(d, 0)} m`),
      nStep('En kilomètres', 'Convertis cette distance en km.', km, 'km', null,
        [{ v: d / 100, code: 'p10', msg: '1 km = 1 000 m : on divise par 1 000.' }, { v: d * 1000, code: 'p10', msg: 'Des mètres aux kilomètres, le nombre devient plus petit : ÷ 1 000.' }],
        `🔁 ${fr(d, 0)} m ÷ 1 000 = ${fr(km, 2)} km`, 0.6),
      pStep(`La distance ${trip} est d’environ ${fr(Math.round(km))} km.`, [[`La distance ${trip} est d’environ ${fr(v * (H + M / 60), 1)} km.`, 'Ce nombre vient d’un calcul avec des m/s et des heures : les unités ne vont pas ensemble.'], [`La voiture roule ${fr(s, 0)} s.`, 'C’est la durée, pas la distance demandée.']]),
    ]);
  },
  /* Q4 : écho */
  echo(level, real) {
    const [who, il] = real ? ['Pierre', 'il'] : pick([['Lina', 'elle'], ['Hugo', 'il'], ['Sami', 'il'], ['Jade', 'elle']]);
    const [what, ofWhat] = real ? ['une montagne', 'de la montagne'] : pick([['une falaise', 'de la falaise'], ['une montagne', 'de la montagne'], ['un mur de barrage', 'du mur de barrage']]), t = real ? 2.3 : pick([1.8, 3.4, 2.6, 4.2, 1.4]);
    const d = 340 * t / 2;
    return stepsItem('V6', level, `${who} est face à ${what} et crie. <b>${fr(t)} s</b> plus tard, ${il} entend l’écho de sa voix. Le son va à <b>340 m/s</b> dans l’air. À quelle distance ${ofWhat} se trouve-t-${il} ?`, [
      fStep('d = v × t ÷ 2', [['d = v × t', 'Le son fait l’aller ET le retour : il faut diviser par 2.', 'allerretour'], ['d = v ÷ t', 'Pour une distance, on multiplie la vitesse par la durée.']], 'd = v × t ÷ 2 (le son fait l’aller-retour)'),
      nStep('Durée de l’aller', 'Combien de temps dure l’aller seul ?', t / 2, 's', null,
        [{ v: t, code: 'allerretour', msg: `${fr(t)} s, c’est l’aller ET le retour. L’aller seul dure ${fr(t / 2)} s.` }], `🔁 aller seul : ${fr(t)} ÷ 2 = ${fr(t / 2)} s`),
      nStep('Le calcul', 'Calcule la distance et choisis l’unité.', d, 'm', ['m', 'km', 'm/s'],
        [{ v: 340 * t, code: 'allerretour', msg: 'Tu as compté l’aller-retour : divise par 2.' }], `🧮 d = 340 × ${fr(t / 2)} = ${fr(d)} m`),
      pStep(`${who} se trouve à ${fr(d)} m ${ofWhat}.`, [[`Le son parcourt ${fr(340 * t)} m.`, 'C’est l’aller-retour du son, pas la distance demandée.'], [`L’écho revient en ${fr(t)} s.`, 'C’est une donnée de l’énoncé.']]),
    ]);
  },
  /* Q5 : la vitesse de la lumière (grands nombres) */
  lumiere(level, real) {
    const [astre, Dm, M, S] = real ? ['le Soleil', 150, 8, 20] : pick([['Mars (au plus près)', 54, 3, 0], ['Vénus (au plus près)', 42, 2, 20], ['Jupiter', 630, 35, 0], ['Mars (au plus loin)', 375, 20, 50]]);
    const D = Dm * 1e6, s = M * 60 + S, v = D / s;
    const txt = `${Dm} millions de km`;
    return stepsItem('V4', level, `${astre[0].toUpperCase() + astre.slice(1)} se trouve à environ <b>${txt}</b> de la Terre. Sa lumière nous parvient en <b>${hms(0, M, S)}</b>. Quelle est la vitesse de la lumière, en km/s ?`, [
      fStep('v = d ÷ t', [['v = t ÷ d', 'La distance va en haut : v = d ÷ t.', 'inverse'], ['v = d × t', 'Pour une vitesse, on divise la distance par la durée.']], 'v = d ÷ t'),
      nStep('Conversion de la durée', `On veut des km/s : convertis ${hms(0, M, S)} en secondes.`, s, 's', null,
        [{ v: (M + S / 100) * 60, code: 'sec100', msg: `${M} min ${S} s n’est pas ${M},${S} min : ${M} × 60 + ${S}.` }, { v: M * 100 + S, code: 'base100', msg: 'Une minute fait 60 s, pas 100.' }],
        `🔁 ${hms(0, M, S)} = ${M} × 60 + ${S} = ${s} s`),
      nStep('La distance en chiffres', `Écris ${txt} avec tous ses chiffres.`, D, 'km', null,
        [{ v: Dm * 1e3, code: 'p10', msg: 'Un million, c’est 1 000 000 (six zéros).' }, { v: Dm * 1e9, code: 'p10', msg: 'Un million, c’est 1 000 000 (six zéros), pas un milliard.' }],
        `🔢 ${txt} = ${fr(D, 0)} km (un million = 1 000 000)`, 0.5),
      nStep('Le calcul', 'Calcule la vitesse et choisis l’unité.', v, 'km/s', ['km/s', 'km/h', 'm/s'],
        [{ v: D / (M + S / 100) / 60, code: 'sec100', msg: 'Reprends la durée en secondes.' }, { v: s / D, code: 'inverse', msg: 'Division à l’envers : d ÷ t.' }, { v: Dm / s, code: 'p10', msg: 'Utilise la distance écrite avec tous ses chiffres.' }],
        `🧮 v = ${fr(D, 0)} ÷ ${s} = ${fr(v, 0)} km/s`, Math.max(1, v * 0.005)),
      pStep(`La lumière va à environ ${fr(Math.round(v / 1000) * 1000, 0)} km/s.`, [[`La lumière met ${s} s.`, 'C’est la durée : on demande une vitesse.'], [`La lumière parcourt ${fr(D, 0)} km.`, 'C’est la distance de l’énoncé : on demande une vitesse.']],
        `La lumière va à environ ${fr(Math.round(v / 1000) * 1000, 0)} km/s (c ≈ 300 000 km/s = 3 × 10⁸ m/s).`),
    ]);
  },
};
const CTRL_ORDER = [['amende', 'Ex. 1 a', 'Vitesse et amende'], ['duree', 'Ex. 1 b', 'Durée du trajet'], ['mixte', 'Ex. 1 c', 'Distance (m/s et h-min)'], ['echo', 'Ex. 2', 'L’écho'], ['lumiere', 'Ex. 3', 'La lumière']];
function buildCtrl(real, level) { return CTRL_ORDER.map(([k]) => Object.assign(CTRL[k](level, real), { ctrlKey: k })); }

/* Les exercices au format de la classe se mêlent aussi au mode « Rédiger » */
(() => {
  const base = genRedac;
  genRedac = function (skill, level) {
    const lv = Math.max(1, Math.min(3, level || 1));
    if (Math.random() < 0.4) {
      if (skill === 'V4') return pick([CTRL.amende, CTRL.lumiere])(lv, false);
      if (skill === 'V5') return pick([CTRL.duree, CTRL.mixte])(lv, false);
      if (skill === 'V6') return CTRL.echo(lv, false);
    }
    return base(skill, level);
  };
})();

/* ---------- 3. « Contrôle type » : écran, lancement, note sur 20 ---------- */
const CTRL_LV = { 1: 'Beaucoup d’aide : le début de chaque exercice est fait', 2: 'Un peu d’aide : la formule est donnée', 3: 'Comme le jour J : tout est à toi' };
function ctrlState() { S.ctrl = S.ctrl || { lv: 1, best: {}, hist: [] }; return S.ctrl; }
function screenCtrl() {
  const C = ctrlState();
  const last = C.hist[C.hist.length - 1];
  render(`
    <div class="row between" style="margin-bottom:10px"><button class="link" id="cBack">← Accueil</button><span class="chip">📝 Contrôle type</span></div>
    <div class="card hero stack">
      <h2>Vitesse, distance, durée</h2>
      <p class="muted" style="margin:0">Les 5 exercices au format des contrôles de la classe : une amende sur autoroute, la durée d’un trajet, des unités mélangées, un écho, la vitesse de la lumière. Tu rédiges chaque exercice comme sur ta copie, puis tu obtiens une note sur 20.</p>
      <div class="tip" style="color:var(--ink)">🎚️ <b>Niveau d’aide ${C.lv}/3</b> : ${CTRL_LV[C.lv]}.<br><span class="small">Avec 14/20 ou plus, l’aide diminue la fois suivante.</span></div>
      ${last ? `<p class="small" style="margin:0">Dernier essai : <b>${fr(last.note, 1)}/20</b> (aide ${last.lv}/3) • Record « comme le jour J » : <b>${C.best[3] != null ? fr(C.best[3], 1) + '/20' : 'pas encore'}</b></p>` : ''}
    </div>
    <div class="stack">
      <button class="btn" id="cReal">▶ Le sujet de la classe</button>
      <button class="btn ghost" id="cNew">🔀 Un nouveau sujet (autres nombres)</button>
      ${C.lv > 1 ? '<button class="link" id="cHelp">Je préfère plus d’aide cette fois</button>' : ''}
    </div>`);
  document.getElementById('cBack').onclick = screenHome;
  const go = (real, lv) => { startRun('redac', null, buildCtrl(real, lv)); RUN.ctrl = { real, lv }; };
  document.getElementById('cReal').onclick = () => go(true, C.lv);
  document.getElementById('cNew').onclick = () => go(false, C.lv);
  const h = document.getElementById('cHelp'); if (h) h.onclick = () => go(false, C.lv - 1);
}
function ctrlPoints(r) {
  const own = r.item.steps.filter((s) => !s.given);
  return own.length ? 4 * own.filter((s) => s.res === 'ok').length / own.length : 0;
}
function finishCtrl() {
  stopTimer();
  const run = RUN, res = run.results, C = ctrlState();
  const streakMsg = touchStreak();
  S.sessions++;
  const pts = res.map(ctrlPoints);
  const note = Math.round(pts.reduce((a, b) => a + b, 0) * 2) / 2;
  const prevBest = C.best[run.ctrl.lv];
  C.hist.push({ date: todayStr(), lv: run.ctrl.lv, note, real: run.ctrl.real });
  C.hist = C.hist.slice(-20);
  if (prevBest == null || note > prevBest) C.best[run.ctrl.lv] = note;
  let up = '';
  if (note >= 14 && run.ctrl.lv === C.lv && C.lv < 3) { C.lv++; up = `Prochaine fois : niveau d’aide ${C.lv}/3 (${CTRL_LV[C.lv].toLowerCase()}).`; }
  addXP(30 + Math.round(note) * 2);
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${note >= 14 ? '🏆' : note >= 10 ? '💪' : '🌱'}</div>
      <h2>Contrôle type terminé</h2>
      <div class="big-num">${fr(note, 1)}/20</div>
      <p class="muted">${run.ctrl.lv === 3 ? 'Sans aide, comme le jour J.' : `Avec l’aide de niveau ${run.ctrl.lv}/3.`} ${prevBest != null && note > prevBest ? `Nouveau record à ce niveau (avant : ${fr(prevBest, 1)}).` : ''}</p>
      ${up ? `<p><b>⬆️ ${up}</b></p>` : note < 14 ? '<p class="small">Les exercices ratés reviennent dans « À revoir » demain. Retente le contrôle type dans quelques jours.</p>' : ''}
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <h3 style="margin:8px 4px">Ta copie corrigée</h3>
    ${res.map((r, i) => `<div class="card"><div class="row between"><span class="chip">${CTRL_ORDER[i] ? CTRL_ORDER[i][1] + ' • ' + CTRL_ORDER[i][2] : 'Q' + (i + 1)}</span><b>${fr(pts[i], 1)}/4</b></div>
      <details style="margin-top:8px"><summary class="small"><b>Énoncé et correction</b></summary><p class="small">${r.item.q}</p>
      <div class="fb sol small"><ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol></div></details></div>`).join('')}
    <div class="stack"><button class="btn" id="cAgain">🔀 Un nouveau sujet</button><button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
  document.getElementById('home').onclick = screenHome;
  document.getElementById('cAgain').onclick = screenCtrl;
}

/* Bouton sur l'accueil : ajouté dans la grille « Autres activités » à chaque affichage */
(() => {
  const app = document.getElementById('app');
  if (!app) return;
  new MutationObserver(() => {
    const acts = app.querySelector('.acts');
    if (!acts || acts.querySelector('#ctrlAct') || typeof S === 'undefined' || !S || !S.pseudo) return;
    const C = S.ctrl || {}, last = (C.hist || [])[(C.hist || []).length - 1];
    const b = document.createElement('button');
    b.className = 'act'; b.id = 'ctrlAct'; b.style.gridColumn = '1 / -1'; b.style.minHeight = '0';
    b.innerHTML = `<span class="ic">📝</span><b>Contrôle type : vitesse, distance, durée</b><span class="small muted">${last ? `Dernière note ${fr(last.note, 1)}/20 • aide ${C.lv}/3` : '5 exercices à rédiger, note sur 20'}</span>`;
    b.onclick = screenCtrl;
    acts.insertBefore(b, acts.firstChild);
  }).observe(app, { childList: true, subtree: true });
})();

/* Accroches qui ont besoin d'app.js (chargé après ce fichier) */
window.addEventListener('DOMContentLoaded', () => {
  if (typeof finishRun === 'function') {
    const base = finishRun;
    finishRun = function () { return RUN && RUN.ctrl ? finishCtrl() : base(); };
  }
  if (typeof COPY_TYPES !== 'undefined') COPY_TYPES.push(['Unités mélangées (m/s avec une durée en heures ou minutes)', 'V5', 'noconv']);
  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Contrôle type', (s) => {
    const C = s.ctrl; if (!C || !C.hist || !C.hist.length) return 'pas encore tenté';
    const l = C.hist[C.hist.length - 1];
    return `dernier ${fr(l.note, 1)}/20 (aide ${l.lv}/3), ${C.hist.length} essai${C.hist.length > 1 ? 's' : ''}${C.best && C.best[3] != null ? ` • sans aide : ${fr(C.best[3], 1)}/20` : ''}`;
  }, '5 exercices au format des contrôles de la classe, rédigés en entier. L’aide diminue à partir de 14/20.']);
});

/* ---------- 4. Banques de questions et leçons ---------- */
/* Petits graphiques d(t) et v(t) */
function graphSvg(axis, curve, w) {
  const P = { up: 'M22 92 L148 22', acc: 'M22 92 Q110 92 148 18', ral: 'M22 92 Q40 22 148 22', flat: 'M22 55 L148 55', down: 'M22 25 L148 92' };
  return `<svg viewBox="0 0 160 110" class="svg" style="max-width:${w || 200}px;margin:6px auto" role="img" aria-label="Graphique ${axis} en fonction de t">
    <path d="M22 100 V8 M14 100 H156" class="s-line thin"/>
    <text x="4" y="16" class="s-txt b" style="font-size:16px">${axis}</text><text x="146" y="110" class="s-txt b" style="font-size:16px">t</text>
    <path d="${P[curve]}" class="s-line"/></svg>`;
}
const graphRow = (axis, list) => `<table class="tbl"><tr>${list.map(([c, t]) => `<td style="text-align:center;padding:4px">${graphSvg(axis, c, 120)}<span class="small"><b>${t}</b></span></td>`).join('')}</tr></table>`;

V1_BANK.push(
  { level: 2, q: `Voici le graphique de la <b>distance</b> parcourue en fonction du temps.${graphSvg('d', 'up')}Le mouvement est :`, choices: [
    { t: 'Uniforme', ok: true },
    { t: 'Accéléré', msg: 'Une droite qui monte : la distance augmente toujours de la même quantité à chaque seconde. La vitesse ne change pas.', code: 'notion' },
    { t: 'Immobile', msg: 'La distance augmente : l’objet avance. Immobile, la courbe serait plate.', code: 'notion' }],
    why: 'd(t) en ligne droite qui monte = distances égales pendant des durées égales = mouvement uniforme.' },
  { level: 2, q: `Voici le graphique de la <b>distance</b> parcourue en fonction du temps.${graphSvg('d', 'acc')}Le mouvement est :`, choices: [
    { t: 'Accéléré', ok: true },
    { t: 'Ralenti', msg: 'La courbe monte de plus en plus fort : chaque seconde, l’objet parcourt plus de distance. Il accélère.', code: 'notion' },
    { t: 'Uniforme', msg: 'Uniforme donnerait une droite. Ici la courbe se redresse : la vitesse augmente.', code: 'notion' }],
    why: 'd(t) qui se redresse = distances de plus en plus grandes à chaque seconde = accéléré.' },
  { level: 3, q: `Voici le graphique de la <b>vitesse</b> en fonction du temps.${graphSvg('v', 'flat')}Le mouvement est :`, choices: [
    { t: 'Uniforme', ok: true },
    { t: 'Immobile', msg: 'Attention, c’est la vitesse qui est tracée : elle reste à la même valeur, qui n’est pas zéro. L’objet avance à vitesse constante.', code: 'notion' },
    { t: 'Ralenti', msg: 'La vitesse ne baisse pas : la ligne est plate.', code: 'notion' }],
    why: 'v(t) plate (et pas à zéro) = vitesse constante = mouvement uniforme. Le piège : confondre avec d(t) plate, qui voudrait dire « immobile ».' },
  { level: 3, q: `Voici le graphique de la <b>vitesse</b> en fonction du temps.${graphSvg('v', 'down')}Le mouvement est :`, choices: [
    { t: 'Ralenti', ok: true },
    { t: 'Accéléré', msg: 'La vitesse descend au fil du temps : l’objet ralentit.', code: 'notion' },
    { t: 'Uniforme', msg: 'Uniforme, la vitesse resterait la même : la ligne serait plate.', code: 'notion' }],
    why: 'v(t) qui descend = la vitesse diminue = mouvement ralenti (une voiture qui freine).' },
  { level: 3, q: `Voici le graphique de la <b>distance</b> parcourue en fonction du temps.${graphSvg('d', 'flat')}L’objet est :`, choices: [
    { t: 'Immobile', ok: true },
    { t: 'En mouvement uniforme', msg: 'La distance ne change pas : l’objet n’avance plus. (C’est v(t) plate qui voudrait dire uniforme.)', code: 'notion' }],
    why: 'd(t) plate = la distance ne bouge plus = l’objet est immobile.' },
);
FICHES.V1.points.push('Graphiques : <b>d(t)</b> droite qui monte → uniforme, courbe qui se redresse → accéléré. <b>v(t)</b> plate → uniforme, qui monte → accéléré, qui descend → ralenti.');

V7_BANK.push(
  { q: 'Un livre dit : « la distance de réaction, c’est la distance parcourue en 1 seconde ». Ton énoncé donne un temps de réaction de <b>1,5 s</b>. Quelle durée utilises-tu ?', choices: [
    { t: '1,5 s', ok: true },
    { t: '1 s', msg: 'Le « 1 seconde » des livres est une valeur moyenne. Au contrôle, on prend toujours le temps de réaction donné dans l’énoncé.', code: 'tr_faux' },
    { t: '1,2 s', msg: '1,2 s est la valeur de l’exercice du cours. Ici l’énoncé dit 1,5 s : c’est elle qui compte.', code: 'tr_faux' }],
    why: 'On utilise toujours le temps de réaction de l’énoncé. « 1 s » n’est qu’une moyenne utilisée dans certains livres.' },
);

(() => {
  const C1 = COURS.find((c) => c.id === 'C1'), C2 = COURS.find((c) => c.id === 'C2'), C3 = COURS.find((c) => c.id === 'C3');
  if (C1) C1.sections.push({
    title: 'Lire un graphique de mouvement',
    html: `
      <p>Au lieu d’une chronophotographie, on peut décrire un mouvement avec un <b>graphique</b>. Le temps t est toujours en bas (axe horizontal). Regarde bien ce qui est tracé en haut : la <b>distance d</b> ou la <b>vitesse v</b>.</p>
      <p><b>Graphique de la distance d(t)</b></p>
      ${graphRow('d', [['up', 'Droite : uniforme'], ['acc', 'Se redresse : accéléré'], ['ral', 'S’aplatit : ralenti']])}
      <p><b>Graphique de la vitesse v(t)</b></p>
      ${graphRow('v', [['flat', 'Plate : uniforme'], ['up', 'Monte : accéléré'], ['down', 'Descend : ralenti']])}
      <div class="piege">⚠️ Une ligne plate n’a pas le même sens sur les deux graphiques : d(t) plate → l’objet est <b>immobile</b> ; v(t) plate → l’objet roule à <b>vitesse constante</b>.</div>`,
    retenir: 'Avant de lire la courbe, lis l’axe vertical : d ou v ? Sur v(t), plat = uniforme ; sur d(t), plat = immobile.',
    quiz: [
      { q: 'Sur un graphique v(t), la vitesse reste à 3 km/s pendant tout le trajet. Le mouvement est :', choices: [
        { t: 'Uniforme', ok: true },
        { t: 'Immobile', msg: 'C’est la vitesse qui est tracée, et elle vaut 3 km/s : l’objet avance, à vitesse constante.' }] },
      { q: 'Sur un graphique d(t), la courbe monte de plus en plus fort. Le mouvement est :', choices: [
        { t: 'Accéléré', ok: true },
        { t: 'Ralenti', msg: 'Une courbe qui se redresse = plus de distance à chaque seconde : la vitesse augmente.' }] },
    ],
  });
  if (C2) C2.exos.push(
    {
      title: 'Le contrôle « vitesse, distance, durée » (corrigé)',
      enonce: '1 a) Une voiture fait Paris → Lyon (466 km) en 3 h 12 min 45 s. Limite : 130 km/h. Risque-t-elle une amende ? 1 b) Lyon → Marseille : 300 km à 120 km/h de moyenne. Durée ? 1 c) Marseille → Nice en 2 h 20 min à 23,8 m/s. Distance ? 2) Pierre crie face à une montagne et entend l’écho 2,3 s plus tard. Distance de la montagne ? 3) Le Soleil est à 150 millions de km ; sa lumière arrive en 8 min 20 s. Vitesse de la lumière ?',
      steps: [
        '1 a) t = 3 + 12 ÷ 60 + 45 ÷ 3 600 = 3,2125 h (pas 3,1245 !). v = 466 ÷ 3,2125 ≈ 145 km/h. 145 > 130 : oui, il risque une amende.',
        '1 b) t = d ÷ v = 300 ÷ 120 = 2,5 h. 0,5 h = 0,5 × 60 = 30 min, donc 2 h 30 min (pas 2 h 50).',
        '1 c) La vitesse est en m/s : la durée doit être en secondes. 2 h 20 min = 2 × 3 600 + 20 × 60 = 8 400 s. d = 23,8 × 8 400 = 199 920 m ≈ 200 km.',
        '2) Le son fait l’aller-retour : d = 340 × 2,3 ÷ 2 = 391 m.',
        '3) 8 min 20 s = 8 × 60 + 20 = 500 s. 150 millions de km = 150 000 000 km. v = 150 000 000 ÷ 500 = 300 000 km/s.',
      ],
      rep: '1 a) Oui, environ 145 km/h > 130 km/h. 1 b) 2 h 30 min. 1 c) Environ 200 km. 2) 391 m. 3) 300 000 km/s.',
    },
    {
      title: 'Sujet type Brevet : la Terre autour du Soleil',
      enonce: 'Dans le référentiel héliocentrique, le centre de la Terre décrit un cercle de rayon R = 1,5 × 10⁸ km autour du Soleil, en 365,25 jours. Le périmètre d’un cercle vaut C = 2 × π × R. 1) Quelle distance la Terre parcourt-elle en un an ? 2) Calcule sa vitesse en km/h, puis en km/s.',
      steps: [
        '1) d = 2 × π × 1,5 × 10⁸ ≈ 9,42 × 10⁸ km, soit environ 942 millions de km.',
        'Durée en heures : 365,25 × 24 = 8 766 h.',
        '2) v = d ÷ t = 942 000 000 ÷ 8 766 ≈ 107 500 km/h.',
        'En km/s : une heure fait 3 600 s, donc 107 500 ÷ 3 600 ≈ 30 km/s.',
      ],
      rep: 'La Terre parcourt environ 942 millions de km par an, à environ 107 500 km/h, soit près de 30 km/s.',
    },
  );
  if (C3) {
    const s = C3.sections.find((x) => /distance de réaction/i.test(x.title));
    if (s) {
      s.html += `<div class="tip" style="margin-top:10px">📘 Certains livres disent que la distance de réaction est « la distance parcourue en 1 seconde ». C’est une valeur moyenne, prise par habitude. Dans un exercice, le temps de réaction est donné : c’est <b>toujours celui de l’énoncé</b> qui compte (dans ton cours : 1,2 s).</div>`;
      s.quiz.push({ q: 'Ton livre dit « 1 seconde » mais l’énoncé donne tr = 1,2 s. Tu calcules dr avec :', choices: [
        { t: '1,2 s', ok: true },
        { t: '1 s', msg: 'Le « 1 s » du livre est une moyenne. On prend toujours la donnée de l’énoncé : 1,2 s.' }] });
    }
  }
})();
