/* Rythme des séances (30/10) — fichier autonome, chargé APRÈS app.js.
   - Mission du jour : environ 15 min (12 exercices, dont jusqu'à 4 révisions).
   - Séance longue : une fois par semaine, environ 25 min (18 exercices, dont jusqu'à 6 révisions
     et 3 problèmes à rédiger). Proposée le mercredi, sinon le samedi ou le dimanche.
   - Semaine d'un contrôle : « Spécial contrôle » environ 15 min (12 exercices), contrôle blanc de 20 min à J-2/J-1.
   Rien ici n'est propre à la physique : le même rythme vaudra pour la chimie. */
(function () {
  if (typeof mission !== 'function' || typeof startRun !== 'function') return;
  const LONG_DAYS = [3, 6, 0]; // mercredi, samedi, dimanche
  const DAILY = 12, DAILY_REV = 4, PREP = 12, LONG = 18, LONG_REV = 6, LONG_REDAC = 3;
  let PENDING_LONG = false;

  const longDue = () => {
    if (typeof S === 'undefined' || !S || (S.onboard || 0) < 2 || !S.diagDone) return false;
    if (S.longWeek === weekId()) return false;
    const e = nextExam(); if (e && e.days <= 7) return false; // la semaine d'un contrôle a son propre programme
    return LONG_DAYS.includes(new Date().getDay());
  };
  const mix = (r, n) => r ? `${r} révision${r > 1 ? 's' : ''} + ${n - r} exercices` : `${n} exercices choisis pour toi`;

  /* Mission du jour : durées et nombre d'exercices, séance longue de la semaine */
  const baseMission = mission;
  mission = function () {
    const m = baseMission();
    if (m.chip === 'Ta mission du jour' && longDue()) {
      const r = Math.min(dueReviews().length, LONG_REV);
      return { chip: '⭐ Séance longue de la semaine', title: 'La grande séance', sub: `Environ 25 min • ${mix(r, LONG)}, dont ${LONG_REDAC} problèmes à rédiger comme sur ta copie. Une seule fois par semaine.`, btn: '▶ C’est parti', go: () => { PENDING_LONG = true; startRun('train', null, null, true); } };
    }
    if (m.title === 'Séance du jour') m.sub = `Environ 15 min • ${mix(Math.min(dueReviews().length, DAILY_REV), DAILY)}`;
    else if (m.title === 'Spécial contrôle') {
      const e = nextExam(), r = Math.min(dueReviews(e && e.skills && e.skills.length ? e.skills : null).length, 3);
      m.sub = `Environ 15 min • ${r ? mix(r, PREP) : PREP + ' exercices'} sur ce qui tombe au contrôle.`;
    }
    return m;
  };

  /* Longueur des séries : réglée au premier exercice */
  const baseNext = nextItem;
  nextItem = function () {
    if (RUN && !RUN._rythme) {
      RUN._rythme = true;
      if (RUN.mode === 'train' && PENDING_LONG) {
        RUN.long = true;
        RUN.pre = dueReviews().slice(0, LONG_REV).map(itemFromReview);
        RUN.total = LONG;
      } else if (RUN.mode === 'train' && RUN.mission && !RUN.items) RUN.total = DAILY;
      else if (RUN.mode === 'prep' && !RUN.items) RUN.total = PREP;
      PENDING_LONG = false;
    }
    if (RUN && RUN.long && typeof genRedac === 'function' && typeof REDAC_SKILLS !== 'undefined' && RUN.idx >= RUN.total - LONG_REDAC && RUN.idx < RUN.total) {
      const done = RUN.results.map((x) => x.skill);
      const pool = REDAC_SKILLS.filter((k) => !done.includes(k) && (typeof activeSkills !== 'function' || activeSkills().includes(k)));
      const sk = (pool.length ? pool : REDAC_SKILLS).sort((a, b) => (S.mastery[a] || 0) - (S.mastery[b] || 0) + (Math.random() - 0.5) * 30)[0];
      S.redacLv = S.redacLv || {};
      RUN.cur = { item: genRedac(sk, S.redacLv[sk] || 1), tries: 0, hints: 0, firstErr: null, t0: Date.now(), done: false, answers: [], conf: null, sel: null };
      return screenItem();
    }
    return baseNext();
  };

  /* Séance longue terminée : notée pour la semaine */
  const baseFinish = finishRun;
  finishRun = function () {
    if (RUN && RUN.long && RUN.results.length >= RUN.total) S.longWeek = weekId();
    return baseFinish();
  };

  /* Suivi côté parent */
  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Séance longue', (s) => s.longWeek === weekId() ? 'faite cette semaine ✅' : s.longWeek ? `dernière : semaine du ${s.longWeek.split('-').reverse().join('/')}` : 'pas encore faite', 'Environ 25 minutes une fois par semaine : proposée le mercredi, sinon le samedi ou le dimanche.']);

  /* Textes qui annonçaient 10 minutes */
  const TXT = [['L’enfant révise 10 minutes par jour', 'L’enfant révise 15 minutes par jour, plus une séance plus longue chaque semaine'], ['même 10 minutes', 'même 15 minutes']];
  const app = document.getElementById('app');
  const fix = () => {
    if (!app || !/10 minutes/.test(app.textContent)) return;
    const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    let n; while ((n = w.nextNode())) TXT.forEach(([a, b]) => { if (n.nodeValue.includes(a)) n.nodeValue = n.nodeValue.replace(a, b); });
  };
  if (app) new MutationObserver(fix).observe(app, { childList: true, subtree: true });
  fix();

  /* Si l'accueil était déjà affiché avant ce fichier, on le redessine */
  if (typeof S !== 'undefined' && S && S.pseudo && !RUN && app && app.querySelector('.acts')) screenHome();
})();
