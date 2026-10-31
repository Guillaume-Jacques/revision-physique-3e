/* Outils transversaux (31/10) — chargé APRÈS chimie3.js et brevet.js, AVANT app.js.
   Trois compétences de méthode, ouvertes d'emblée et utiles dans tous les chapitres (référentiel OUT-01 à OUT-03) :
   O1 Convertir longueurs, masses et volumes • O2 Isoler une grandeur dans une formule • O3 Pourcentages et proportionnalité.
   Les durées (V2), le 3,6 (V3), la rédaction (V8) et les puissances de dix (K3) existaient déjà.
   Aussi : les questions des « sprints » de 60 secondes (SPRINTS), utilisées par boost.js. Textes et nombres rédigés par Claude. */
(function () {
  SKILLS.push(
    { id: 'O1', ref: 'OUT-03', name: 'Convertir longueurs, masses et volumes', short: 'Unités', icon: '📐', tool: true },
    { id: 'O2', ref: 'OUT-02', name: 'Isoler une grandeur dans une formule', short: 'Formules', icon: '🧩', tool: true },
    { id: 'O3', ref: 'OUT-01', name: 'Pourcentages et proportionnalité', short: '%', icon: '📊', tool: true },
  );

  Object.assign(FICHES, {
    O1: {
      title: 'Convertir longueurs, masses et volumes',
      points: [
        '1 km = <b>1 000</b> m • 1 m = <b>100</b> cm • 1 cm = <b>10</b> mm.',
        '1 kg = <b>1 000</b> g • 1 t = <b>1 000</b> kg.',
        '1 L = <b>1 000</b> mL • 1 mL = <b>1</b> cm³ • 1 m³ = <b>1 000</b> L.',
        'Vers une <b>plus petite</b> unité, le nombre devient <b>plus grand</b> : on multiplie. Vers une plus grande unité : on divise.',
      ],
      formula: 'Plus petite unité → nombre plus grand',
      piege: '1 m³ = 1 000 L, et pas 100 L : un cube de 1 m de côté contient 10 × 10 × 10 cubes de 1 dm (1 dm³ = 1 L).',
    },
    O2: {
      title: 'Isoler une grandeur dans une formule',
      points: [
        'Si <b>a = b × c</b>, alors <b>b = a ÷ c</b> et <b>c = a ÷ b</b>.',
        'Si <b>a = b ÷ c</b>, alors <b>b = a × c</b> et <b>c = b ÷ a</b>.',
        'Le truc du triangle : la grandeur seule en haut, les deux autres en bas. On cache celle qu’on cherche.',
        'Vérifie avec des nombres simples : 6 = 2 × 3, donc 2 = 6 ÷ 3 ✓.',
      ],
      formula: 'v = d ÷ t  ⇔  d = v × t  ⇔  t = d ÷ v',
      piege: 't = v ÷ d est faux : la grandeur « du haut » (d) reste toujours en haut.',
    },
    O3: {
      title: 'Pourcentages et proportionnalité',
      points: [
        '<b>p %</b> d’une quantité = quantité × p ÷ 100.',
        '<b>Augmentation en %</b> = (nouvelle − ancienne) ÷ <b>ancienne</b> × 100. On divise toujours par la valeur de <b>départ</b>.',
        'Si 50 devient 87,5 : 87,5 ÷ 50 = 1,75 → c’est 175 % de l’ancienne valeur, donc <b>+75 %</b>.',
        'Proportionnalité : le produit en croix. Si 12 km ↔ 40 min, alors x km ↔ 90 min : x = 12 × 90 ÷ 40.',
      ],
      formula: 'Évolution % = (nouvelle − ancienne) ÷ ancienne × 100',
      piege: 'Diviser par la nouvelle valeur au lieu de l’ancienne : c’est l’erreur la plus fréquente.',
    },
  });
  Object.assign(CARDS, {
    O1: { title: 'Unités', body: 'km →×1 000→ m →×100→ cm<br>kg →×1 000→ g<br>1 L = 1 000 mL = 1 000 cm³<br>1 m³ = 1 000 L' },
    O2: { title: 'Isoler', body: 'a = b × c<br>b = a ÷ c • c = a ÷ b' },
    O3: { title: 'Pourcentages', body: '(nouvelle − ancienne) ÷ ancienne × 100<br>p % de Q = Q × p ÷ 100' },
  });

  /* ---------- O1 : unités ---------- */
  const UNITS = [
    // [de, vers, facteur (de → vers), contexte]
    ['km', 'm', 1000, 'longueur'], ['m', 'cm', 100, 'longueur'], ['cm', 'mm', 10, 'longueur'], ['m', 'mm', 1000, 'longueur'],
    ['kg', 'g', 1000, 'masse'], ['t', 'kg', 1000, 'masse'], ['L', 'mL', 1000, 'volume'], ['m³', 'L', 1000, 'volume'], ['L', 'cm³', 1000, 'volume'],
  ];
  const conv1 = (lv) => {
    const easy = lv === 1 ? UNITS.slice(0, 7).filter((u) => u[1] !== 'mm' || u[0] === 'cm') : UNITS;
    const [a, b, f] = pick(easy);
    const up = Math.random() < (lv === 1 ? 0.6 : 0.5); // up : grande → petite unité (×)
    const x = lv === 1 ? pick([2, 3, 4, 5, 1.5, 2.5, 0.5]) : lv === 2 ? pick([3.4, 0.25, 1.2, 0.08, 7.5, 0.6, 12.5]) : pick([0.035, 2.45, 0.004, 15.6, 0.75, 120]);
    const val = up ? x : x * f, from = up ? a : b, to = up ? b : a, ans = up ? x * f : x;
    const why = `1 ${a} = ${fr(f, 0)} ${b}`;
    return num({ skill: 'O1', level: lv, q: `Convertis <b>${fr(val, 4)} ${from}</b> en ${to}.`, unit: to, ans,
      errs: [{ v: up ? val / f : val * f, code: 'p10', msg: `C’est le mauvais sens. ${why} : vers les ${up ? b : a}, le nombre devient ${up ? 'plus grand (on multiplie)' : 'plus petit (on divise)'}.` }],
      hints: [why, up ? `${fr(val, 4)} × ${fr(f, 0)}` : `${fr(val, 4)} ÷ ${fr(f, 0)}`],
      sol: [ST.conv(`${why}.`), ST.calc(`${fr(val, 4)} ${up ? '×' : '÷'} ${fr(f, 0)} = ${fr(ans, 4)} ${to}`),
            `✅ <b>Vérification :</b> vers une ${up ? 'plus petite unité, le nombre grandit' : 'plus grande unité, le nombre diminue'}.`] });
  };
  function genO1(level) {
    if (level < 3 || Math.random() < 0.5) return conv1(level);
    // niveau 3 : deux étapes (ex. mm → m, cm³ → m³ via L)
    const k = pick(['mmkm', 'cm3m3', 'gt']);
    if (k === 'mmkm') { const x = pick([2500, 750, 12000, 40]); return num({ skill: 'O1', level, q: `Convertis <b>${fr(x, 0)} cm</b> en km.`, unit: 'km', ans: x / 100000,
      errs: [{ v: x / 1000, code: 'p10', msg: 'cm → m : ÷ 100, puis m → km : ÷ 1 000. Au total ÷ 100 000.' }, { v: x * 100000, code: 'p10', msg: 'Vers une plus grande unité, le nombre diminue : on divise.' }],
      hints: ['cm → m (÷ 100), puis m → km (÷ 1 000).', `${fr(x, 0)} ÷ 100 ÷ 1 000`], sol: [ST.conv('1 m = 100 cm et 1 km = 1 000 m, donc 1 km = 100 000 cm.'), ST.calc(`${fr(x, 0)} ÷ 100 000 = ${fr(x / 100000, 5)} km`)] }); }
    if (k === 'cm3m3') { const x = pick([500, 2500, 750, 12000]); return num({ skill: 'O1', level, q: `Un récipient contient <b>${fr(x, 0)} cm³</b>. Combien de m³ ?`, unit: 'm³', ans: x / 1e6,
      errs: [{ v: x / 1000, code: 'p10', msg: `${fr(x, 0)} cm³ = ${fr(x / 1000, 3)} L. Il reste L → m³ : encore ÷ 1 000.` }, { v: x / 100, code: 'p10', msg: 'Pour les volumes, les facteurs sont 1 000 (et pas 100) : 1 m³ = 1 000 L = 1 000 000 cm³.' }],
      hints: ['cm³ → L (÷ 1 000), puis L → m³ (÷ 1 000).', `${fr(x, 0)} ÷ 1 000 000`], sol: [ST.conv('1 L = 1 000 cm³ et 1 m³ = 1 000 L, donc 1 m³ = 1 000 000 cm³.'), ST.calc(`${fr(x, 0)} ÷ 1 000 000 = ${fr(x / 1e6, 6)} m³`)] }); }
    const x = pick([350, 1200, 85, 4500]); return num({ skill: 'O1', level, q: `Un camion transporte <b>${fr(x, 0)} kg</b>. Écris cette masse en tonnes.`, unit: 't', ans: x / 1000,
      errs: [{ v: x * 1000, code: 'p10', msg: 'Vers une plus grande unité, le nombre diminue : on divise par 1 000.' }, { v: x / 100, code: 'p10', msg: '1 t = 1 000 kg, pas 100.' }],
      hints: ['1 t = 1 000 kg.', `${fr(x, 0)} ÷ 1 000`], sol: [ST.conv('1 t = 1 000 kg.'), ST.calc(`${fr(x, 0)} ÷ 1 000 = ${fr(x / 1000, 3)} t`)] });
  }

  /* ---------- O2 : isoler une grandeur ---------- */
  const FORMS = [
    // [relation, grandeur du produit/quotient, formes]  a = b × c
    { rel: 'd = v × t', names: { d: 'la distance', v: 'la vitesse', t: 'la durée' }, top: 'd', b: 'v', c: 't' },
    { rel: 'U = R × I', names: { U: 'la tension', R: 'la résistance', I: 'l’intensité' }, top: 'U', b: 'R', c: 'I' },
    { rel: 'P = m × g', names: { P: 'le poids', m: 'la masse', g: 'l’intensité de pesanteur' }, top: 'P', b: 'm', c: 'g' },
    { rel: 'E = P × t', names: { E: 'l’énergie', P: 'la puissance', t: 'la durée' }, top: 'E', b: 'P', c: 't' },
    { rel: 'm = ρ × V', names: { m: 'la masse', ρ: 'la masse volumique', V: 'le volume' }, top: 'm', b: 'ρ', c: 'V' },
  ];
  function isoQcm(level) {
    const f = pick(FORMS), want = pick([f.b, f.c]), other = want === f.b ? f.c : f.b;
    return qcm({ skill: 'O2', level, q: `On connaît la relation <b>${f.rel}</b>. Quelle est l’expression de ${f.names[want]} <b>${want}</b> ?`,
      choices: [
        { t: `${want} = ${f.top} ÷ ${other}`, ok: true },
        { t: `${want} = ${other} ÷ ${f.top}`, msg: `À l’envers : ${f.top} est « en haut » dans la relation, il reste en haut.`, code: 'inverse' },
        { t: `${want} = ${f.top} × ${other}`, msg: `Pour enlever « × ${other} », on fait l’opération inverse : on divise par ${other}.`, code: 'formule' },
      ],
      why: `${f.rel}, donc ${want} = ${f.top} ÷ ${other}. Vérifie avec 6 = 2 × 3 : 2 = 6 ÷ 3.`,
      hints: [`Pour enlever « × ${other} », on divise par ${other} des deux côtés.`] });
  }
  function genO2(level) {
    if (level === 1) return isoQcm(1);
    if (level === 2) {
      if (Math.random() < 0.35) return isoQcm(2);
      const c = pick([
        () => { const v = pick([15, 20, 25, 30, 12]), t = pick([4, 6, 8, 12]); return { q: `On sait que <b>d = v × t</b>. Avec <b>d = ${v * t} m</b> et <b>v = ${v} m/s</b>, calcule la durée t.`, ans: t, unit: 's', a: v * t, b: v, f: 't = d ÷ v' }; },
        () => { const R = pick([10, 20, 50, 100]), I = pick([0.2, 0.5, 0.1, 0.3]); return { q: `On sait que <b>U = R × I</b>. Avec <b>U = ${fr(R * I)} V</b> et <b>R = ${R} Ω</b>, calcule l’intensité I.`, ans: I, unit: 'A', a: R * I, b: R, f: 'I = U ÷ R' }; },
        () => { const m = pick([2, 5, 12, 40, 60]); return { q: `Sur Terre, <b>P = m × g</b> avec <b>g = 9,8 N/kg</b>. Un objet pèse <b>P = ${fr(m * 9.8)} N</b>. Calcule sa masse m.`, ans: m, unit: 'kg', a: m * 9.8, b: 9.8, f: 'm = P ÷ g' }; },
      ])();
      return num({ skill: 'O2', level, q: c.q, unit: c.unit, ans: c.ans,
        errs: [{ v: c.a * c.b, code: 'formule', msg: `Tu as multiplié. Pour isoler, on fait l’opération inverse : ${c.f}.` }, { v: c.b / c.a, code: 'inverse', msg: `Division à l’envers : ${c.f}.` }],
        hints: [c.f, `${fr(c.a)} ÷ ${fr(c.b)}`], sol: [ST.formule(c.f), ST.calc(`${fr(c.a)} ÷ ${fr(c.b)} = ${fr(c.ans)} ${c.unit}`)] });
    }
    // niveau 3 : un carré à défaire (distance de freinage)
    const v = pick([10, 15, 20, 25, 30]), k = pick([0.08, 0.05, 0.1]), df = k * v * v;
    return num({ skill: 'O2', level, q: `La distance de freinage vérifie <b>df = k × v²</b>. Avec <b>df = ${fr(df)} m</b> et <b>k = ${fr(k)}</b>, calcule la vitesse v (en m/s).`, unit: 'm/s', ans: v,
      errs: [{ v: df / k, code: 'formule', msg: `${fr(df)} ÷ ${fr(k)} = ${fr(df / k)} : c’est v², pas v. Il reste à prendre la racine carrée.` }, { v: df * k, code: 'formule', msg: 'On divise par k (opération inverse de × k), puis on prend la racine carrée.' }],
      hints: ['v² = df ÷ k, puis v = √(df ÷ k).', `√(${fr(df)} ÷ ${fr(k)})`],
      sol: [ST.formule('v² = df ÷ k, donc v = √(df ÷ k)'), ST.calc(`${fr(df)} ÷ ${fr(k)} = ${fr(v * v)}, et √${fr(v * v)} = ${v} m/s`), ST.piege('s’arrêter à v² : la racine carrée défait le carré.')] });
  }

  /* ---------- O3 : pourcentages et proportionnalité ---------- */
  function genO3(level) {
    if (level === 1) {
      if (Math.random() < 0.5) { const q = pick([80, 200, 50, 120, 60, 400]), p = pick([10, 20, 25, 50, 75]); return num({ skill: 'O3', level, q: `Calcule <b>${p} %</b> de <b>${q}</b>.`, unit: '', ans: q * p / 100,
        errs: [{ v: q * 100 / p, code: 'pct_total', msg: `On multiplie par ${p} puis on divise par 100 : ${q} × ${p} ÷ 100.` }],
        hints: [`p % de Q = Q × p ÷ 100`, `${q} × ${p} ÷ 100`], sol: [ST.formule('p % de Q = Q × p ÷ 100'), ST.calc(`${q} × ${p} ÷ 100 = ${fr(q * p / 100)}`)] }); }
      const a = pick([40, 50, 80, 200]), p = pick([10, 25, 50, 20]), b = a * (1 + p / 100);
      return num({ skill: 'O3', level, q: `Une distance passe de <b>${a} m</b> à <b>${fr(b)} m</b>. De combien de % a-t-elle augmenté ?`, unit: '%', ans: p,
        errs: [{ v: 100 + p, code: 'pct_total', msg: `${fr(b)} m, c’est ${100 + p} % de ${a} m. L’augmentation, c’est ce qui dépasse 100 % : ${p} %.` },
               { v: (b - a) / b * 100, code: 'pct_total', msg: 'Tu as divisé par la nouvelle valeur. On divise toujours par la valeur de départ.' }],
        hints: ['(nouvelle − ancienne) ÷ ancienne × 100', `(${fr(b)} − ${a}) ÷ ${a} × 100`], sol: [ST.formule('évolution = (nouvelle − ancienne) ÷ ancienne × 100'), ST.calc(`(${fr(b)} − ${a}) ÷ ${a} × 100 = ${p} %`), ST.phrase(`la distance a augmenté de ${p} %.`)] });
    }
    if (level === 2) {
      const a = pick([50, 40, 25, 80, 120]), p = pick([75, 60, 35, 150, 12.5]), b = a * (1 + p / 100);
      const what = pick(['La distance de freinage', 'Le prix d’un billet', 'La distance d’arrêt']), u = what.includes('prix') ? '€' : 'm';
      return num({ skill: 'O3', level, q: `${what} passe de <b>${fr(a)} ${u}</b> à <b>${fr(b)} ${u}</b>. Calcule l’augmentation en pourcentage.`, unit: '%', ans: p, tol: 0.06,
        errs: [{ v: 100 + p, code: 'pct_total', msg: `${fr(b)} ÷ ${fr(a)} = ${fr(1 + p / 100)} : c’est ${fr(100 + p)} % de la valeur de départ, donc une augmentation de ${fr(p)} %.` },
               { v: (b - a) / b * 100, code: 'pct_total', msg: 'Tu as divisé par la nouvelle valeur. On divise toujours par la valeur de départ.' }],
        hints: ['(nouvelle − ancienne) ÷ ancienne × 100', `(${fr(b)} − ${fr(a)}) ÷ ${fr(a)} × 100`],
        sol: [ST.cherche('une augmentation en %, par rapport à la valeur de départ.'), ST.formule('(nouvelle − ancienne) ÷ ancienne × 100'), ST.calc(`(${fr(b)} − ${fr(a)}) ÷ ${fr(a)} × 100 = ${fr(p)} %`), ST.piege(`répondre ${fr(100 + p)} % : c’est la nouvelle valeur comparée à l’ancienne, pas l’augmentation.`)] });
    }
    const d = pick([12, 9, 15, 6]), t1 = pick([40, 30, 20]), t2 = pick([90, 60, 150, 120]), ans = d * t2 / t1;
    return num({ skill: 'O3', level, q: `Un cycliste parcourt <b>${d} km en ${t1} min</b>. À la même vitesse, quelle distance parcourt-il en <b>${t2} min</b> ?`, unit: 'km', ans,
      errs: [{ v: d * t1 / t2, code: 'inverse', msg: 'Produit en croix à l’envers : plus de temps → plus de distance.' }, { v: d + (t2 - t1), code: 'formule', msg: 'Ce n’est pas une addition : c’est une situation de proportionnalité (produit en croix).' }],
      hints: [`${d} km ↔ ${t1} min et x km ↔ ${t2} min`, `x = ${d} × ${t2} ÷ ${t1}`],
      sol: [ST.formule(`produit en croix : x = ${d} × ${t2} ÷ ${t1}`), ST.calc(`${d} × ${t2} ÷ ${t1} = ${fr(ans)} km`), ST.phrase(`en ${t2} min, il parcourt ${fr(ans)} km.`)] });
  }
  Object.assign(GENERATORS, { O1: genO1, O2: genO2, O3: genO3 });

  /* ---------- Sprints de 60 secondes : questions très courtes ---------- */
  const r2 = (x) => Math.round(x * 10000) / 10000;
  const big = (e) => Number(Math.pow(10, e)).toLocaleString('fr-FR').replace(/\u202f|\u00a0/g, ' '); // 1 000 000
  const SP = {
    conv: () => pick([
      () => { const v = pick([18, 36, 54, 72, 90, 108, 7.2, 3.6, 144]); return { q: `${fr(v)} km/h = ? m/s`, ans: r2(v / 3.6), sk: 'V3' }; },
      () => { const v = pick([5, 10, 15, 20, 25, 30, 2]); return { q: `${v} m/s = ? km/h`, ans: r2(v * 3.6), sk: 'V3' }; },
      () => { const m = pick([30, 15, 45, 6, 12, 90, 20, 36]); return { q: `${m} min = ? h`, ans: r2(m / 60), sk: 'V2' }; },
      () => { const h = pick([1.5, 2.5, 0.5, 0.25, 0.75, 0.1, 1.2]); return { q: `${fr(h)} h = ? min`, ans: r2(h * 60), sk: 'V2' }; },
      () => { const h = pick([1, 2, 0.5, 3]); return { q: `${fr(h)} h = ? s`, ans: h * 3600, sk: 'V2' }; },
      () => { const m = pick([2, 5, 1.5, 10, 4]); return { q: `${fr(m)} min = ? s`, ans: m * 60, sk: 'V2' }; },
      () => { const x = pick([3.4, 0.5, 12, 1.25, 0.08]); return { q: `${fr(x)} km = ? m`, ans: r2(x * 1000), sk: 'O1' }; },
      () => { const x = pick([250, 1500, 80, 500, 3000]); return { q: `${x} g = ? kg`, ans: r2(x / 1000), sk: 'O1' }; },
      () => { const x = pick([250, 1500, 750, 330, 2000]); return { q: `${x} mL = ? L`, ans: r2(x / 1000), sk: 'O1' }; },
      () => { const x = pick([2, 0.5, 1.5, 3]); return { q: `${fr(x)} m³ = ? L`, ans: x * 1000, sk: 'O1' }; },
    ])(),
    formule: () => {
      const f = pick(FORMS.concat([{ rel: 'v = d ÷ t', top: 'd', quot: true }])), opts = [];
      if (f.quot) { // v = d ÷ t
        const want = pick(['d', 't']);
        if (want === 'd') opts.push(['d = v × t', 1], ['d = v ÷ t', 0], ['d = t ÷ v', 0]); else opts.push(['t = d ÷ v', 1], ['t = v ÷ d', 0], ['t = d × v', 0]);
        return { q: `${f.rel} donc…`, choices: shuffle(opts), sk: 'O2' };
      }
      const want = pick([f.b, f.c]), other = want === f.b ? f.c : f.b;
      opts.push([`${want} = ${f.top} ÷ ${other}`, 1], [`${want} = ${other} ÷ ${f.top}`, 0], [`${want} = ${f.top} × ${other}`, 0]);
      return { q: `${f.rel} donc…`, choices: shuffle(opts), sk: 'O2' };
    },
    p10: () => pick([
      () => { const a = rnd(-9, 9) || 2, b = rnd(-9, 9) || -3; return { q: `10${supN(a)} × 10${supN(b)} = 10<sup>?</sup>`, ans: a + b, neg: true, sk: 'K3' }; },
      () => { const a = rnd(-6, 12) || 5, b = rnd(-9, 9) || 2; return { q: `10${supN(a)} ÷ 10${supN(b)} = 10<sup>?</sup>`, ans: a - b, neg: true, sk: 'K3' }; },
      () => { const e = rnd(-6, -1); return { q: `${fr(Math.pow(10, e), 6)} = 10<sup>?</sup>`, ans: e, neg: true, sk: 'K3' }; },
      () => { const e = rnd(2, 9); return { q: `${big(e)} = 10<sup>?</sup>`, ans: e, neg: true, sk: 'K3' }; },
      () => { const e = rnd(2, 8); return { q: `(10${supN(e)})² = 10<sup>?</sup>`, ans: 2 * e, neg: true, sk: 'K3' }; },
    ])(),
  };
  window.SPRINTS = {
    conv: { subj: 'physique', icon: '🔁', name: 'Conversions', sub: 'km/h ↔ m/s, heures, minutes, unités', gen: SP.conv },
    formule: { subj: 'physique', icon: '🧩', name: 'Formules', sub: 'Isoler une grandeur', gen: SP.formule },
    p10: { subj: 'chimie', icon: '🔟', name: 'Puissances de dix', sub: 'Exposants, écriture scientifique', gen: SP.p10 },
  };
})();
