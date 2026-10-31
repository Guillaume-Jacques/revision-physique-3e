/* Adapter l'appli à la classe de chaque enfant (31/10) — fichier autonome, chargé APRÈS app.js, rythme.js,
   equipes.js, boost.js et copies.js, et AVANT aide.js (pour que la bulle d'aide reprenne les nouvelles questions).
   - Le parent indique, chapitre par chapitre, où en est la classe de son enfant : pas encore vu / en cours / déjà vu
     (Réglages › « 📚 Où en est la classe de … »). Stocké dans rv_plan : kind 'reglage', label 'chap',
     skills = ['C1:v', 'C6:c', …] (c = en cours, v = déjà vu, n = pas encore vu).
   - Effets côté élève (rien ne change tant que le parent n'a rien renseigné) :
     · mission du jour : la leçon du chapitre en cours passe en premier ; les chapitres « pas encore vus » ne sont pas proposés ;
     · séances : environ un exercice sur deux porte sur le chapitre en cours ;
     · compétences d'un chapitre « pas encore vu » mises de côté (sauf leçon lue ou contrôle saisi dessus),
       celles d'un chapitre « en cours » ou « déjà vu » ouvertes même si la leçon n'est pas finie.
   - « Comment ça marche » (accueil et espace parent) explique comment l'appli s'adapte à chaque enfant. */
(function () {
  if (typeof mission !== 'function' || typeof chooseNext !== 'function' || typeof skillActive !== 'function') return;
  const LBL = 'chap';
  const OPTS = [['', 'Je ne sais pas'], ['n', '⏳ Pas encore vu'], ['c', '📖 En cours en classe'], ['v', '✅ Déjà vu en classe']];
  const newest = (a, b) => (a.created_at < b.created_at ? 1 : -1);
  const rowOf = (plan, stId) => (plan || []).filter((p) => p.kind === 'reglage' && p.label === LBL && (!stId || p.student === stId)).sort(newest)[0];
  const parse = (row) => { const m = {}; ((row && row.skills) || []).forEach((x) => { const [k, v] = String(x).split(':'); if (k && /^[ncv]$/.test(v)) m[k] = v; }); return m; };
  const pick = (row, st) => {
    const at = row ? new Date(row.created_at).getTime() : 0;
    if (st && st.chap && Object.keys(st.chap).length && (st.chapAt || 0) > at) return Object.assign({}, st.chap);
    return parse(row);
  };
  const myChap = () => (typeof PLAN !== 'undefined' && S ? pick(rowOf(PLAN), S) : {});
  const childChap = (st) => pick(rowOf(childPlan(st), st.id), childState(st));
  const lessonOfSkill = (id) => { const s = SKILLS.find((x) => x.id === id); if (s && s.lesson) return s.lesson; const c = COURS.find((x) => (x.skills || []).includes(id)); return c ? c.id : null; };
  const lessonDone = (L) => !!(S && S.cours && S.cours[L] && S.cours[L].done);

  /* ---------- Compétences ouvertes selon le chapitre de la classe ---------- */
  const baseActive = skillActive;
  const adapted = (id, m) => {
    const L = lessonOfSkill(id), st = L && m[L];
    if (st === 'n') return lessonDone(L) || examSkills().includes(id);
    if (st === 'c' || st === 'v') return true;
    return baseActive(id);
  };
  skillActive = function (id) {
    const m = myChap();
    if (!Object.keys(m).length || !S) return baseActive(id);
    // Garde-fou : si plus rien ne serait ouvert, on garde le fonctionnement habituel
    if (!SKILLS.some((k) => adapted(k.id, m))) return baseActive(id);
    return adapted(id, m);
  };

  /* ---------- Mission du jour : la leçon du chapitre en cours d'abord ---------- */
  const baseMission = mission;
  mission = function () {
    const m = myChap();
    if (!Object.keys(m).length) return baseMission.apply(this, arguments);
    const order = COURS.slice(), flags = COURS.map((c) => [c, Object.prototype.hasOwnProperty.call(c, 'ahead'), c.ahead]);
    const rank = (c) => (m[c.id] === 'c' ? 0 : m[c.id] === 'v' ? 1 : 2);
    COURS.forEach((c) => { if (m[c.id] === 'n') c.ahead = true; else if (m[c.id]) c.ahead = false; });
    COURS.sort((a, b) => rank(a) - rank(b));
    let r;
    try { r = baseMission.apply(this, arguments); }
    finally {
      COURS.length = 0; order.forEach((c) => COURS.push(c));
      flags.forEach(([c, had, v]) => { if (had) c.ahead = v; else delete c.ahead; });
    }
    if (r && /^Leçon : /.test(r.title || '')) {
      const L = COURS.find((c) => r.title === 'Leçon : ' + c.title);
      if (L && m[L.id] === 'c') r.sub += ' C’est le chapitre que vous faites en classe.';
    }
    return r;
  };

  /* ---------- Séances : le chapitre en cours revient plus souvent ---------- */
  const baseChoose = chooseNext;
  chooseNext = function (run) {
    const m = myChap();
    if (Object.keys(m).length && !(run.only && run.only.length)) {
      const cur = activeSkills().filter((k) => GENERATORS[k] && m[lessonOfSkill(k)] === 'c');
      if (cur.length && Math.random() < 0.5) return baseChoose(Object.assign({}, run, { only: cur }));
    }
    return baseChoose(run);
  };

  /* ---------- Espace parent : réglage « Où en est la classe » ---------- */
  function chapCard(st) {
    const m = childChap(st), name = childName(st), set = Object.keys(m).length;
    const cur = COURS.filter((c) => m[c.id] === 'c').map((c) => c.title);
    const groups = Object.keys(SUBJ).map((sj) => {
      const L = COURS.filter((c) => coursSubj(c) === sj);
      if (!L.length) return '';
      return `<b class="small">${SUBJ[sj].icon} ${SUBJ[sj].name}</b>${L.map((c) => `<label class="small" style="display:block">${c.icon} ${esc(c.title)}
        <select class="field" data-chap="${c.id}" style="margin-top:4px">${OPTS.map(([v, t]) => `<option value="${v}" ${(m[c.id] || '') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`).join('')}`;
    }).join('');
    return `<details class="card stack" id="chapcard" ${PV.chapOpen ? 'open' : ''}><summary><b>📚 Où en est la classe de ${esc(name)} ?</b> <span class="small muted">${set ? (cur.length ? 'En cours : ' + esc(cur.join(', ')) : 'renseigné') : 'pas encore renseigné'}</span></summary>
      <div class="stack" style="margin-top:8px">
        <p class="small" style="margin:0">Chaque professeur avance à son rythme. Indique ce que la classe a déjà fait et ce qu’elle fait en ce moment : l’appli de ${esc(name)} propose d’abord la leçon du chapitre en cours, fait travailler ce chapitre en priorité et attend pour les chapitres pas encore vus.</p>
        ${groups}
        <button class="btn" id="chapsave" data-st="${st.id}">Enregistrer</button>
        <p class="small muted" style="margin:0">À mettre à jour à chaque nouveau chapitre (un coup d’œil au cahier suffit). « Je ne sais pas » laisse l’appli choisir. ${esc(name)} peut aussi le faire depuis son appli (⚙️ › « 📚 Où en est ma classe ») : c’est le dernier choix enregistré qui compte.</p>
      </div></details>`;
  }
  if (typeof calcCard === 'function') { const baseCalc = calcCard; calcCard = function (st) { return chapCard(st) + baseCalc.apply(this, arguments); }; }

  if (typeof tabSuivi === 'function') {
    const baseSuivi = tabSuivi;
    tabSuivi = function (st) {
      const html = baseSuivi.apply(this, arguments);
      if (!st || Object.keys(childChap(st)).length) return html;
      const nudge = `<div class="card stack"><b>📚 Où en est la classe de ${esc(childName(st))} ?</b>
        <p class="small" style="margin:0">Dis à l’appli quel chapitre le professeur fait en ce moment : les leçons et les exercices suivront le rythme de sa classe. 1 minute.</p>
        <button class="btn ghost" id="chapgo">Renseigner</button></div>`;
      return html.replace(/(<div class="ptitle">[\s\S]*?<\/div>)/, '$1' + nudge);
    };
  }

  const baseDraw = drawParent;
  drawParent = function () {
    baseDraw.apply(this, arguments);
    const go = document.getElementById('chapgo');
    if (go) go.onclick = () => { PV.tab = 'reglages'; PV.chapOpen = true; savePV(); drawParent(); const c = document.getElementById('chapcard'); if (c) c.scrollIntoView({ block: 'start' }); };
    const card = document.getElementById('chapcard');
    if (card) card.addEventListener('toggle', () => { PV.chapOpen = card.open; savePV(); });
    const b = document.getElementById('chapsave');
    if (!b) return;
    b.onclick = async () => {
      const st = (DASH.students || []).find((x) => x.id === b.dataset.st); if (!st) return;
      const vals = [...$app.querySelectorAll('[data-chap]')].filter((x) => x.value).map((x) => x.dataset.chap + ':' + x.value);
      b.disabled = true;
      try {
        const r = await rpc('rv_plan_add', { p_token: token, p_kind: 'reglage', p_day: null, p_label: LBL, p_skills: vals, p_level: 2, p_error_code: null, p_child: st.id });
        if (r.error) { b.disabled = false; return toast(r.error === 'auth' ? 'Reconnecte-toi.' : 'Erreur : ' + r.error); }
        DASH.plan = (DASH.plan || []).filter((x) => !(x.kind === 'reglage' && x.label === LBL && x.student === st.id));
        DASH.plan.push({ id: r.id, kind: 'reglage', label: LBL, skills: vals, level: 2, day: null, error_code: null, student: st.id, created_at: new Date().toISOString() });
        PV.chapOpen = false; savePV();
        toast(`Enregistré ✓ L’appli de ${childName(st)} suit sa classe dès sa prochaine séance.`);
        drawParent();
      } catch (e) { b.disabled = false; toast('Impossible pour l’instant (pas de connexion ?).'); }
    };
  };


  /* ---------- Côté élève : « Où en est ma classe », badges dans Mes cours, rappel sur l'accueil ---------- */
  const CH_OPTS = [['', 'Je ne sais pas'], ['n', '⏳ Pas encore vu'], ['c', '📖 On le fait en ce moment'], ['v', '✅ Déjà vu en classe']];
  function openChap() {
    if (document.getElementById('chmodal')) return;
    const m = myChap();
    const groups = Object.keys(SUBJ).map((sj) => {
      const L = COURS.filter((c) => coursSubj(c) === sj); if (!L.length) return '';
      return `<b class="small">${SUBJ[sj].icon} ${SUBJ[sj].name}</b>${L.map((c) => `<label class="small" style="display:block">${c.icon} ${esc(c.title)}
        <select class="field" data-mych="${c.id}" style="margin-top:4px">${CH_OPTS.map(([v, t]) => `<option value="${v}" ${(m[c.id] || '') === v ? 'selected' : ''}>${t}</option>`).join('')}</select></label>`).join('')}`;
    }).join('');
    document.body.insertAdjacentHTML('beforeend', `<div class="modal sheet-bg" id="chmodal" role="dialog" aria-modal="true"><div class="card sheet stack pop" style="max-height:85vh;overflow:auto">
      <h2>📚 Où en est ma classe ?</h2>
      <p class="small" style="margin:0">Regarde ton cahier : qu’est-ce que ton prof fait en ce moment ? L’appli te proposera d’abord cette leçon et plus d’exercices dessus, et attendra pour ce que tu n’as pas encore vu.</p>
      ${groups}
      <button class="btn" id="chsave">${PREVIEW ? 'Fermer' : 'Enregistrer'}</button>
      <button class="link" id="chclose">Annuler</button></div></div>`);
    const close = () => { const x = document.getElementById('chmodal'); if (x) x.remove(); };
    document.getElementById('chmodal').onclick = (e) => { if (e.target.id === 'chmodal') close(); };
    document.getElementById('chclose').onclick = close;
    document.getElementById('chsave').onclick = () => {
      if (PREVIEW) return close();
      const v = {}; document.querySelectorAll('[data-mych]').forEach((x) => { if (x.value) v[x.dataset.mych] = x.value; });
      S.chap = v; S.chapAt = Date.now(); saveState(); close();
      toast('C’est noté ✓ Ton appli suit ta classe.'); screenHome();
    };
  }
  const baseSettings = openSettings;
  openSettings = function () {
    baseSettings.apply(this, arguments);
    const sc = document.getElementById('sCalc');
    if (sc && !document.getElementById('sChap')) {
      sc.insertAdjacentHTML('afterend', '<button class="btn ghost" id="sChap">📚 Où en est ma classe</button>');
      document.getElementById('sChap').onclick = () => { const q = document.getElementById('qmodal'); if (q) q.remove(); openChap(); };
    }
  };

  const BADGE = { c: '<span class="pill tiny">📖 en classe en ce moment</span>', v: '<span class="pill tiny">✅ vu en classe</span>', n: '<span class="pill tiny">⏳ pas encore en classe</span>' };
  const baseCours = screenCours;
  screenCours = function () {
    baseCours.apply(this, arguments);
    const m = myChap();
    const intro = $app.querySelector('p.muted.small');
    if (!Object.keys(m).length) {
      if (intro && !PREVIEW) intro.insertAdjacentHTML('afterend', '<button class="link" id="chcours" style="padding:0">📚 Dis à l’appli où en est ta classe</button>');
    } else {
      $app.querySelectorAll('.lesson[data-c]').forEach((b) => {
        const st = m[b.dataset.c]; if (!st) return;
        const t = b.querySelector('.grow b'); if (!t) return;
        const ahead = b.querySelector('.pill.tiny'); if (ahead && st !== 'n') ahead.remove();
        t.insertAdjacentHTML('afterend', ' ' + BADGE[st]);
      });
      if (intro) intro.insertAdjacentHTML('afterend', '<button class="link" id="chcours" style="padding:0">📚 Modifier où en est ma classe</button>');
    }
    const l = document.getElementById('chcours'); if (l) l.onclick = openChap;
  };

  const baseHome = screenHome;
  screenHome = function () {
    baseHome.apply(this, arguments);
    if (PREVIEW || !S || !S.diagDone || Object.keys(myChap()).length || (S.chapLater && Date.now() < S.chapLater)) return;
    const hero = $app.querySelector('.card.hero, .card.done');
    if (!hero || document.getElementById('chask')) return;
    hero.insertAdjacentHTML('afterend', `<div class="card stack" id="chask"><b>📚 Qu’est-ce que tu fais en classe en ce moment ?</b>
      <p class="small" style="margin:0">Dis-le à l’appli : elle suivra le rythme de ta classe. 1 minute avec ton cahier.</p>
      <div class="actions"><button class="btn ghost" id="chlater">Plus tard</button><button class="btn" id="chnow">Je le dis</button></div></div>`);
    document.getElementById('chnow').onclick = openChap;
    document.getElementById('chlater').onclick = () => { S.chapLater = Date.now() + 3 * 864e5; saveState(); const c = document.getElementById('chask'); if (c) c.remove(); };
  };

  /* ---------- « Comment ça marche » ---------- */
  if (typeof HELP_QA !== 'undefined' && Array.isArray(HELP_QA)) {
    HELP_QA.unshift(
      ['L’appli est-elle la même pour tous les enfants ?', 'C’est la même appli, mais <b>chaque enfant a son propre parcours</b>. Elle s’adapte à :<br>• <b>ses réponses</b> : ce qu’il rate revient le lendemain, puis 3, 7 et 21 jours plus tard, et un exercice « jumeau » suit chaque erreur ;<br>• <b>ses contrôles</b> : saisis la date dans <b>Contrôles</b>, l’appli lance un programme spécial la semaine d’avant et un contrôle blanc la veille ;<br>• <b>ses copies corrigées</b> : prends-les en photo dans <b>Contrôles</b>, ses vraies erreurs deviennent des exercices ciblés ;<br>• <b>le chapitre de sa classe</b> : indique-le dans <b>Réglages › « 📚 Où en est la classe »</b> (ton enfant peut aussi le faire dans son appli, menu ⚙️).'],
      ['Le professeur n’avance pas dans le même ordre que l’appli ?', 'Dans <b>Réglages › « 📚 Où en est la classe de … »</b>, indique pour chaque chapitre : <b>pas encore vu</b>, <b>en cours</b> ou <b>déjà vu</b>. L’appli propose alors d’abord la leçon du chapitre en cours, fait travailler ce chapitre en priorité et attend pour les chapitres pas encore vus (sauf si tu saisis un contrôle dessus). Mets-le à jour à chaque nouveau chapitre.'],
    );
  }
  if (typeof helpCard === 'function') { const baseHelp = helpCard; helpCard = function () { return baseHelp.apply(this, arguments).replace('connexion, code, appareils', 'adaptation à l’enfant, connexion, appareils'); }; }

  if (typeof screenLanding === 'function') {
    const baseLanding = screenLanding;
    screenLanding = function () {
      baseLanding.apply(this, arguments);
      const how = document.querySelector('.how');
      if (how && !how.querySelector('[data-adapt]')) how.insertAdjacentHTML('beforeend', '<div class="howstep" data-adapt><span>4</span><p><b>L’appli s’adapte à chaque enfant</b> : à ses erreurs, à ses contrôles et à ses copies corrigées, et au chapitre que fait sa classe.</p></div>');
    };
    if (document.querySelector('.how') && !document.querySelector('[data-adapt]')) screenLanding();
  }
})();
