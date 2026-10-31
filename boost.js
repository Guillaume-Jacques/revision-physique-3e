/* Plus d'exercices (31/10) — fichier autonome, chargé APRÈS app.js, rythme.js et equipes.js.
   1. Exercice jumeau : après une erreur, le même type d'exercice revient tout de suite avec d'autres nombres (3 par séance au plus).
   2. Sprints de 60 secondes : conversions, formules, puissances de dix (pavé numérique intégré, record personnel).
   3. Objectif de la semaine fixé par le parent (nombre de missions + récompense), barre de progression côté élève.
   4. Défis entre amis d'une même équipe : les mêmes 5 questions (tirées avec la même graine), scores comparés.
   5. Rappels sur le téléphone de l'enfant (notifications) : vers 17 h quand des révisions attendent et que rien n'a été fait.
      L'enfant les active une fois sur son téléphone ; seul le parent peut les couper (Réglages). */
(function () {
  if (typeof screenHome !== 'function' || typeof drawParent !== 'function') return;
  const VAPID = 'BPadrDsR8VD0sMo__FZL4g7j-SahQvUtuM9NIPAbM0kl6G6sW7W4VB7xcg_vQ4DsK0KOkvjBgJWdIqv6eeWo3gI';
  const PUSH_FN = `${CFG.url}/functions/v1/rv-push`;
  const kTok = (k) => k + '_' + (token || '').slice(0, 8);
  const isStudent = () => !PREVIEW && (role === 'student' || role === 'test');
  const onId = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
  const pushFn = (body) => fetch(PUSH_FN, { method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then((r) => r.json());
  const monday = (d) => { const x = d ? new Date(d + 'T12:00') : new Date(); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };

  document.head.insertAdjacentHTML('beforeend', `<style>
    .acts #sprint { order: 7; } .acts #duelAct { order: 8; } .acts .solo { grid-column: 1 / -1; }
    .goal { display: flex; gap: 6px; margin: 4px 0 2px; } .goal i { flex: 1; height: 10px; border-radius: 99px; background: var(--line); } .goal i.on { background: var(--good); }
    .spq { font-size: 1.7em; font-weight: 900; text-align: center; margin: 14px 0 8px; min-height: 2.2em; }
    .spin { font-size: 1.8em; font-weight: 900; text-align: center; border: 2px solid var(--line); border-radius: 14px; padding: 8px; min-height: 1.6em; background: var(--card); }
    .spin.good { border-color: var(--good); background: #e9f9ee; } .spin.bad { border-color: #d33; background: #fdecec; }
    .pad { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px; }
    .pad button { font-size: 1.45em; font-weight: 800; min-height: 54px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); color: var(--ink); }
    .pad button.okk { background: var(--accent); color: #fff; border: 0; grid-column: span 2; }
    .sptop { display: flex; justify-content: space-between; align-items: center; font-weight: 800; }
    .sptime { font-size: 1.3em; font-variant-numeric: tabular-nums; } .sptime.low { color: #d33; }
    .spch { display: grid; gap: 8px; margin-top: 8px; } .spch button { font-size: 1.15em; font-weight: 800; padding: 14px; border-radius: 14px; border: 1px solid var(--line); background: var(--card); color: var(--ink); }
    .spch button.good { border-color: var(--good); background: #e9f9ee; } .spch button.bad { border-color: #d33; background: #fdecec; }
    .vs { display: grid; grid-template-columns: 1fr auto 1fr; align-items: center; text-align: center; gap: 8px; }
    .vs b { font-size: 2em; } .devl { margin: 0; padding-left: 18px; }
  </style>`);

  /* =========================================================
     1. Exercice jumeau
     ========================================================= */
  const TWIN_MODES = ['train', 'focus', 'prep', 'review', 'redac', 'redo'];
  const shape = (q) => stripTags(q || '').replace(/[\d,.\s]+/g, '#').slice(0, 40);
  function makeTwin(it) {
    if (!GENERATORS[it.skill]) return null;
    let best = null;
    for (let i = 0; i < 25; i++) {
      const t = it.type === 'steps' ? (typeof genRedac === 'function' ? genRedac(it.skill, it.level) : null) : generate(it.skill, it.level);
      if (!t || t.q === it.q) continue;
      if (!best) best = t;
      if (t.type === it.type && shape(t.q) === shape(it.q)) return t;
    }
    return best;
  }
  const baseFinishItem = finishItem;
  finishItem = function () {
    const before = RUN && RUN.results.length;
    const r = baseFinishItem.apply(this, arguments);
    try {
      if (!RUN || RUN.results.length === before || !TWIN_MODES.includes(RUN.mode)) return r;
      const last = RUN.results[RUN.results.length - 1], it = last.item;
      RUN.twins = RUN.twins || 0;
      if (last.clean || it.twin || RUN.twins >= 3 || RUN.twinQ) return r;
      const t = makeTwin(it); if (!t) return r;
      t.twin = true; RUN.twinQ = t; RUN.twins++; RUN.total++;
      const fb = document.getElementById('fb');
      if (fb) fb.insertAdjacentHTML('beforeend', `<div class="fb hint small">🔁 Juste après : <b>le même type d’exercice avec d’autres nombres</b>, pour fixer la méthode tout de suite.</div>`);
      const nb = document.getElementById('next'); if (nb) nb.textContent = 'Essayer le même avec d’autres nombres →';
    } catch (e) {}
    return r;
  };
  const baseNextItem = nextItem;
  nextItem = function () {
    if (RUN && RUN.twinQ && RUN.idx < RUN.total) {
      const it = RUN.twinQ; RUN.twinQ = null;
      RUN.cur = { item: it, tries: 0, hints: 0, firstErr: null, t0: Date.now(), done: false, answers: [], conf: null, sel: null };
      return screenItem();
    }
    return baseNextItem.apply(this, arguments);
  };
  const baseHeader = headerHtml;
  headerHtml = function () {
    const h = baseHeader.apply(this, arguments);
    if (!RUN || !RUN.cur || !RUN.cur.item.twin) return h;
    return h.replace('<span class="small muted">', '<span class="chip warn">🔁 Même type, autres nombres</span><span class="small muted">');
  };

  /* =========================================================
     2. Sprints de 60 secondes
     ========================================================= */
  const SPRINT_S = 60;
  function screenSprints() {
    stopTimer();
    const sj = S.subj || 'physique', S2 = S.sprint || {};
    const keys = Object.keys(SPRINTS).sort((a, b) => (SPRINTS[a].subj === sj ? -1 : 0) - (SPRINTS[b].subj === sj ? -1 : 0));
    render(`<button class="link" id="back">← Accueil</button>
      <h1 style="margin-top:10px">⚡ Sprints de 60 secondes</h1>
      <p class="muted small">Un maximum de bonnes réponses en une minute. Ce sont les automatismes qui font gagner du temps (et des points) au contrôle.</p>
      ${keys.map((k) => { const sp = SPRINTS[k], rec = S2[k] && S2[k].best; return `<button class="lesson" data-sp="${k}"><span class="lic">${sp.icon}</span>
        <span class="grow"><b>${sp.name}</b>${sp.subj === 'chimie' ? ' <span class="pill tiny">⚗️ chimie</span>' : ''}<br><span class="small muted">${sp.sub}</span><br><span class="small">${rec != null ? `🏅 Record : <b>${rec}</b> bonne${rec > 1 ? 's' : ''} réponse${rec > 1 ? 's' : ''}` : 'Pas encore de record'}</span></span><span>›</span></button>`; }).join('')}`);
    onId('back', screenHome);
    $app.querySelectorAll('[data-sp]').forEach((b) => b.onclick = () => playSprint(b.dataset.sp));
  }
  let SPT = null;
  function playSprint(key) {
    const sp = SPRINTS[key];
    const st = { key, ok: 0, n: 0, miss: [], end: Date.now() + SPRINT_S * 1000, cur: null, buf: '', lock: false, t0: Date.now() };
    const next = () => { st.cur = sp.gen(); st.buf = ''; st.lock = false; draw(); };
    const draw = () => {
      const c = st.cur;
      render(`<div class="row" style="margin-bottom:10px"><button class="quitbtn" id="spq">✕ Arrêter</button><span class="grow"></span></div>
        <div class="sptop"><span>${sp.icon} ${sp.name}</span><span class="sptime" id="spt"></span><span>✅ ${st.ok}</span></div>
        <div class="card" style="margin-top:10px">
          <div class="spq">${c.q}</div>
          ${c.choices ? `<div class="spch">${c.choices.map((x, i) => `<button data-i="${i}">${esc(x[0])}</button>`).join('')}</div>`
            : `<div class="spin" id="spin">${esc(st.buf) || '&nbsp;'}</div>
               <div class="pad">${['7', '8', '9', '4', '5', '6', '1', '2', '3', c.neg ? '−' : ',', '0', '⌫'].map((k) => `<button data-k="${k}">${k}</button>`).join('')}
               ${c.neg ? '<button data-k=",">,</button>' : '<span></span>'}<button class="okk" data-k="ok">OK</button></div>`}
        </div>`);
      onId('spq', () => finish(true));
      tick();
      $app.querySelectorAll('.spch button').forEach((b) => b.onclick = () => answer(+b.dataset.i, b));
      $app.querySelectorAll('.pad button').forEach((b) => b.onclick = () => key2(b.dataset.k));
    };
    const key2 = (k) => {
      if (st.lock) return;
      if (k === 'ok') return answer(null);
      if (k === '⌫') st.buf = st.buf.slice(0, -1);
      else if (k === '−') st.buf = st.buf.startsWith('−') ? st.buf.slice(1) : '−' + st.buf;
      else if (k === ',') { if (!st.buf.includes(',')) st.buf += st.buf.replace('−', '') ? ',' : '0,'; }
      else if (st.buf.replace(/[−,]/g, '').length < 9) st.buf += k;
      const el = document.getElementById('spin'); if (el) el.innerHTML = esc(st.buf) || '&nbsp;';
    };
    const answer = (i, btn) => {
      if (st.lock) return;
      const c = st.cur; let good, shown;
      if (c.choices) { good = !!c.choices[i][1]; shown = c.choices.find((x) => x[1])[0]; }
      else {
        if (!st.buf) return;
        const x = parseNum(st.buf.replace('−', '-'));
        if (x === null) return;
        good = Math.abs(x - c.ans) <= (Number.isInteger(c.ans) ? 1e-9 : Math.max(0.006, Math.abs(c.ans) * 0.005));
        shown = fr(c.ans, 4);
      }
      st.n++; st.lock = true;
      if (good) st.ok++; else st.miss.push({ q: stripTags(c.q).replace('?', '…'), a: shown, you: c.choices ? c.choices[i][0] : st.buf });
      if (c.choices) { btn.classList.add(good ? 'good' : 'bad'); if (!good) $app.querySelectorAll('.spch button').forEach((b) => { if (c.choices[+b.dataset.i][1]) b.classList.add('good'); }); }
      else { const el = document.getElementById('spin'); el.classList.add(good ? 'good' : 'bad'); if (!good) el.innerHTML = `${esc(st.buf)} → <b>${esc(shown)}</b>`; }
      setTimeout(() => { if (SPT === st) next(); }, good ? 250 : 1100);
    };
    const tick = () => {
      const left = Math.max(0, st.end - Date.now()), el = document.getElementById('spt');
      if (el) { el.textContent = '⏱ ' + Math.ceil(left / 1000) + ' s'; el.classList.toggle('low', left < 10000); }
      if (left <= 0) finish(false);
    };
    const finish = (quit) => {
      if (SPT !== st) return;
      SPT = null; clearInterval(st.h);
      if (quit && st.n < 3) return screenSprints();
      S.sprint = S.sprint || {};
      const rec = S.sprint[key] = S.sprint[key] || { best: null, hist: [] };
      const isRec = !quit && (rec.best == null || st.ok > rec.best);
      if (!quit) { if (isRec) rec.best = st.ok; rec.hist.push({ d: todayStr(), ok: st.ok, n: st.n }); if (rec.hist.length > 20) rec.hist.shift(); }
      addXP(2 * st.ok); const sm = touchStreak(); S.timeMs += Date.now() - st.t0;
      saveState();
      if (st.n) logAttempt({ mode: 'sprint', skill: { conv: 'O1', formule: 'O2', p10: 'K3' }[key] || 'O1', item_id: 'sprint-' + key, level: 1, correct: st.ok / st.n >= 0.8, tries: 1, hints: 0,
        error_code: null, answer: `${st.ok} justes sur ${st.n}`, question: `Sprint 60 s : ${sp.name}`, ms: Date.now() - st.t0, conf: null });
      render(`<div class="card hero center stack pop"><div style="font-size:48px">${isRec ? '🏅' : '⚡'}</div>
          <h2>${quit ? 'Sprint arrêté' : isRec ? 'Nouveau record !' : 'Temps écoulé !'}</h2>
          <div class="big-num">${st.ok}</div><p class="muted">bonne${st.ok > 1 ? 's' : ''} réponse${st.ok > 1 ? 's' : ''} sur ${st.n}${rec.best != null && !isRec ? ` • record : ${rec.best}` : ''}</p>
          <p><b>+${2 * st.ok} XP</b></p>${sm ? `<p>${sm}</p>` : ''}</div>
        ${st.miss.length ? `<div class="card"><h3>À retenir</h3><ul class="fiche">${st.miss.slice(0, 8).map((m) => `<li>${esc(m.q)} <b>${esc(m.a)}</b> <span class="small muted">(tu as mis ${esc(m.you)})</span></li>`).join('')}</ul></div>` : ''}
        <div class="stack"><button class="btn" id="spa">↻ Rejouer</button><button class="btn ghost" id="spo">Autres sprints</button><button class="btn ghost" id="sph">Retour à l’accueil</button></div>`);
      onId('spa', () => playSprint(key)); onId('spo', screenSprints); onId('sph', screenHome);
    };
    SPT = st; st.h = setInterval(() => { if (SPT !== st) return clearInterval(st.h); tick(); }, 250);
    next();
  }

  /* =========================================================
     3. Objectif de la semaine (fixé par le parent)
     ========================================================= */
  const contractOf = (plan) => {
    const r = (plan || []).filter((p) => p.kind === 'reglage' && p.label === 'contrat').sort((a, b) => a.created_at < b.created_at ? 1 : -1)[0];
    const days = r ? parseInt(r.error_code, 10) || 0 : 0;
    return days ? { days, reward: (r.skills || [])[0] || '' } : null;
  };
  const weekDone = (s) => (s.missionDays || []).filter((d) => d >= monday()).length;
  const baseMissionDone = missionDone;
  missionDone = function () {
    baseMissionDone.apply(this, arguments);
    const t = todayStr();
    S.missionDays = (S.missionDays || []).filter((d) => d >= addDays(t, -30));
    if (!S.missionDays.includes(t)) S.missionDays.push(t);
    const c = contractOf(PLAN);
    if (c && weekDone(S) >= c.days && S.goalWeek !== monday()) { S.goalWeek = monday(); setTimeout(() => toast(`🎉 Objectif de la semaine atteint !${c.reward ? ' 🎁 ' + esc(c.reward) : ''}`), 600); }
  };
  function goalCardHtml() {
    const c = contractOf(PLAN); if (!c) return '';
    const n = Math.min(weekDone(S), c.days), done = n >= c.days;
    return `<div class="card stack" id="goalc"><div class="row between"><b>🎯 Objectif de la semaine</b><span class="small"><b>${n}/${c.days}</b> missions</span></div>
      <div class="goal">${Array.from({ length: c.days }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <span class="small ${done ? '' : 'muted'}">${done ? `🎉 Objectif atteint ! ${c.reward ? `Montre-le à ton parent : 🎁 <b>${esc(c.reward)}</b>` : 'Bravo !'}` : `${c.reward ? `🎁 Récompense : <b>${esc(c.reward)}</b> • ` : ''}encore ${c.days - n} mission${c.days - n > 1 ? 's' : ''} d’ici dimanche`}</span></div>`;
  }

  /* =========================================================
     4. Défis entre amis
     ========================================================= */
  let DU = null;
  const DUEL_SKILLS = () => SKILLS.filter((s) => !s.lesson && GENERATORS[s.id]).map((s) => s.id);
  function seeded(seed, fn) {
    let a = seed >>> 0; const rnd0 = Math.random;
    Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const keep = typeof RECENT_Q !== 'undefined' ? RECENT_Q.splice(0) : null;
    try { return fn(); } finally { Math.random = rnd0; if (keep) { RECENT_Q.splice(0); keep.forEach((x) => RECENT_Q.push(x)); } }
  }
  const duelItems = (seed, skills) => seeded(seed, () => skills.map((k) => generate(k, 2)));
  async function loadDuels() {
    if (!isStudent() || role !== 'student') return null;
    try { const r = await rpc('rv_duel_mine', { p_token: token }); if (!r.error) { DU = r; LS.set(kTok('rv_duels'), r); } } catch (e) {}
    return DU;
  }
  const duTxt = (ms) => ms ? `${Math.round(ms / 1000)} s` : '';
  const verdict = (d) => d.my > d.their || (d.my === d.their && (d.my_ms || 0) <= (d.their_ms || 0)) ? (d.my === d.their && d.my_ms === d.their_ms ? 'egal' : 'win') : 'lose';
  function duelHomeHtml() {
    const d = DU || LS.get(kTok('rv_duels'), null); if (!d || !d.allowed) return '';
    const seen = LS.get(kTok('rv_duel_seen'), []);
    const inbox = (d.duels || []).filter((x) => !x.mine && x.my == null);
    const res = (d.duels || []).filter((x) => x.mine && x.their != null && !seen.includes(x.id));
    if (inbox.length) return `<button class="card stack tcard" id="duin" style="border:2px solid var(--accent)"><div class="tline"><span class="tic">⚔️</span><div class="grow"><b>${esc(inbox[0].other)} te lance un défi !</b><br><span class="small muted">5 questions, sans indice${inbox.length > 1 ? ` • +${inbox.length - 1} autre${inbox.length > 2 ? 's' : ''} défi${inbox.length > 2 ? 's' : ''}` : ''}</span></div><span>›</span></div></button>`;
    if (res.length) { const x = res[0], v = verdict(x);
      return `<button class="card stack tcard" id="duin"><div class="tline"><span class="tic">${v === 'win' ? '🏆' : v === 'egal' ? '🤝' : '⚔️'}</span><div class="grow"><b>Défi contre ${esc(x.other)} : ${x.my} – ${x.their}</b><br><span class="small muted">${v === 'win' ? 'Tu as gagné !' : v === 'egal' ? 'Égalité parfaite !' : 'Revanche ?'}</span></div><span>›</span></div></button>`; }
    return '';
  }
  async function screenDuels() {
    stopTimer();
    const draw = () => {
      const d = DU || LS.get(kTok('rv_duels'), { allowed: false, mates: [], duels: [] });
      const seen = LS.get(kTok('rv_duel_seen'), []);
      const fin = (d.duels || []).filter((x) => x.my != null && x.their != null);
      LS.set(kTok('rv_duel_seen'), [...new Set(seen.concat(fin.map((x) => x.id)))].slice(-60));
      const inbox = (d.duels || []).filter((x) => !x.mine && x.my == null), wait = (d.duels || []).filter((x) => x.mine && x.their == null);
      render(`<div class="row between" style="margin:4px 4px 14px"><button class="link" id="dback">← Accueil</button><b>⚔️ Défis</b><span style="width:60px"></span></div>
        ${!d.allowed ? `<div class="card stack"><h2>Défie tes amis</h2><p style="margin:0">Les défis se lancent entre membres d’une même équipe. Demande à ton parent d’autoriser les équipes (Réglages › Équipes entre amis).</p></div>` : ''}
        ${inbox.map((x) => `<div class="card stack" style="border:2px solid var(--accent)"><b>${esc(x.other)} te défie</b><span class="small muted">5 questions, sans indice. Le temps compte en cas d’égalité.</span><button class="btn" data-play="${x.id}">▶ Relever le défi</button></div>`).join('')}
        ${d.allowed ? `<div class="card stack"><h2 style="margin:0">Lancer un défi</h2>
          ${(d.mates || []).length ? `<p class="small muted" style="margin:0">Tu joues d’abord 5 questions ; ton ami reçoit ensuite les mêmes.</p>${d.mates.map((m) => `<div class="row between"><span>${esc(m.name)}</span><button class="btn ghost" style="width:auto;min-height:40px;padding:6px 14px" data-mate="${m.id}" data-n="${esc(m.name)}">⚔️ Défier</button></div>`).join('')}`
            : '<p class="small" style="margin:0">Il faut d’abord être dans une équipe avec au moins un ami (🏆 sur l’accueil).</p>'}</div>` : ''}
        ${wait.length ? `<div class="card stack"><h3 style="margin:0">En attente</h3>${wait.map((x) => `<div class="row between small"><span>${esc(x.other)}</span><span>toi : <b>${x.my}/5</b> • son tour</span></div>`).join('')}</div>` : ''}
        ${fin.length ? `<div class="card stack"><h3 style="margin:0">Derniers résultats</h3>${fin.slice(0, 10).map((x) => { const v = verdict(x); return `<div class="row between small"><span>${v === 'win' ? '🏆' : v === 'egal' ? '🤝' : '•'} ${esc(x.other)}</span><span><b>${x.my} – ${x.their}</b> <span class="muted">(${duTxt(x.my_ms)} / ${duTxt(x.their_ms)})</span></span></div>`; }).join('')}</div>` : ''}`);
      onId('dback', () => route());
      $app.querySelectorAll('[data-mate]').forEach((b) => b.onclick = () => startDuel({ to: b.dataset.mate, name: b.dataset.n }));
      $app.querySelectorAll('[data-play]').forEach((b) => b.onclick = () => { const x = (d.duels || []).find((y) => y.id === b.dataset.play); if (x) startDuel({ duel: x }); });
    };
    draw(); await loadDuels(); if ($app.querySelector('#dback')) draw();
  }
  let DUEL_CTX = null;
  function startDuel(ctx) {
    let seed, skills;
    if (ctx.duel) { seed = ctx.duel.seed; skills = ctx.duel.skills; }
    else { seed = Math.floor(Math.random() * 2e9); skills = seeded(seed, () => shuffle(DUEL_SKILLS()).slice(0, 5)); }
    DUEL_CTX = Object.assign({ seed, skills }, ctx);
    startRun('duel', null, duelItems(seed, skills));
  }
  if (typeof RUN_LABEL !== 'undefined') RUN_LABEL.duel = 'Défi';
  const baseFinishRun = finishRun;
  finishRun = function () {
    if (!RUN || RUN.mode !== 'duel') return baseFinishRun.apply(this, arguments);
    stopTimer();
    const run = RUN, ctx = DUEL_CTX || {}, score = run.results.filter((r) => r.correct).length, ms = Date.now() - run.started;
    const sm = touchStreak(); S.sessions++; addXP(5 * score + 10); saveState(); flush();
    const show = (other, their, theirMs, pending) => {
      const v = pending ? null : verdict({ my: score, their, my_ms: ms, their_ms: theirMs });
      render(`<div class="card hero center stack pop"><div style="font-size:44px">${pending ? '⚔️' : v === 'win' ? '🏆' : v === 'egal' ? '🤝' : '💪'}</div>
          <h2>${pending ? 'Défi envoyé !' : v === 'win' ? 'Tu as gagné le défi !' : v === 'egal' ? 'Égalité parfaite !' : 'Défi perdu… revanche ?'}</h2>
          <div class="vs"><div><span class="small">Toi</span><br><b>${score}</b><br><span class="small muted">${duTxt(ms)}</span></div><span class="muted">–</span>
            <div><span class="small">${esc(other || '')}</span><br><b>${pending ? '?' : their}</b><br><span class="small muted">${pending ? 'à son tour' : duTxt(theirMs)}</span></div></div>
          ${pending ? `<p class="small muted">${esc(other || 'Ton ami')} recevra les mêmes 5 questions. Le résultat s’affichera sur ton accueil.</p>` : ''}
          <p><b>+${5 * score + 10} XP</b></p>${sm ? `<p>${sm}</p>` : ''}</div>
        <div class="stack"><button class="btn" id="drev">📝 ${run.results.some((r) => !r.correct) ? 'Revoir mes erreurs' : 'Revoir le défi'}</button>
          <button class="btn ghost" id="dmore">⚔️ Autres défis</button><button class="btn ghost" id="dhome">Retour à l’accueil</button></div>`);
      onId('drev', () => screenReview(run)); onId('dmore', screenDuels); onId('dhome', screenHome);
    };
    RUN = null;
    if (ctx.duel) {
      rpc('rv_duel_score', { p_token: token, p_duel: ctx.duel.id, p_score: score, p_ms: ms })
        .then((r) => { if (r.error) return toast('Ce défi n’est plus disponible.'), show(ctx.duel.other, null, null, true); loadDuels(); show(ctx.duel.other, r.their, r.their_ms, false); })
        .catch(() => { toast('Pas de connexion internet : le score n’a pas été envoyé.'); show(ctx.duel.other, null, null, true); });
    } else {
      rpc('rv_duel_create', { p_token: token, p_to: ctx.to, p_seed: ctx.seed, p_skills: ctx.skills, p_score: score, p_ms: ms })
        .then((r) => {
          if (r.error) toast(r.error === 'pending' ? 'Tu as déjà 3 défis en attente avec cet ami.' : r.error === 'many' ? 'Maximum 10 défis par jour.' : 'Impossible d’envoyer le défi.');
          else { pushFn({ action: 'duel', token, duel: r.id }).catch(() => {}); loadDuels(); }
          show(ctx.name, null, null, true);
        })
        .catch(() => { toast('Pas de connexion internet : le défi n’a pas été envoyé.'); show(ctx.name, null, null, true); });
    }
    DUEL_CTX = null;
  };

  /* =========================================================
     5. Rappels : abonnement sur le téléphone de l'élève
     ========================================================= */
  const b64 = (s) => { const p = '='.repeat((4 - s.length % 4) % 4), r = atob((s + p).replace(/-/g, '+').replace(/_/g, '/')); return Uint8Array.from([...r].map((c) => c.charCodeAt(0))); };
  const pushSupported = () => 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
  const pushState = () => (isIOS() && !isStandalone()) ? 'noinstall' : !pushSupported() ? 'unsupported' : Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default';
  async function report(status, sub) {
    try {
      const key = kTok('rv_push_rep'), sig = status + '|' + (sub ? sub.endpoint : '') + '|' + todayStr(), last = LS.get(key, {});
      if (last.sig === sig) return last;
      const r = await rpc('rv_push_sub', { p_token: token, p_status: status, p_sub: sub ? sub.toJSON() : null });
      if (!r.error) { const v = { sig, push_ok: r.push_ok }; LS.set(key, v); return v; }
    } catch (e) {}
    return null;
  }
  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64(VAPID) });
    return sub;
  }
  async function syncPush() {
    if (!isStudent()) return;
    const st = pushState();
    if (st === 'granted') { try { await report('ok', await subscribe()); } catch (e) {} }
    else await report(st === 'default' ? 'default' : st, null);
    placePushCard();
  }
  function pushCardHtml() {
    const st = pushState(), rep = LS.get(kTok('rv_push_rep'), {});
    if (rep.push_ok === false || st !== 'default' || LS.get(kTok('rv_push_later'), '') === todayStr()) return '';
    return `<div class="card stack" id="pushc"><div class="row"><span class="appic">🔔</span><div class="grow"><b>Active tes rappels</b><br><span class="small muted">Un petit rappel vers 17 h, seulement les jours où des exercices t’attendent et que tu n’as pas encore révisé.</span></div></div>
      <button class="btn" id="pushon">Activer les rappels</button><button class="link" id="pushno" style="padding:0">Plus tard</button></div>`;
  }
  function placePushCard() {
    const old = document.getElementById('pushc'); if (old) old.remove();
    const mgo = document.getElementById('mgo'), anchor = mgo && mgo.closest('.card'); if (!anchor || !isStudent()) return;
    const h = pushCardHtml(); if (!h) return;
    anchor.insertAdjacentHTML('afterend', h);
    onId('pushno', () => { LS.set(kTok('rv_push_later'), todayStr()); placePushCard(); });
    onId('pushon', async () => {
      try {
        const p = await Notification.requestPermission();
        if (p === 'granted') { await report('ok', await subscribe()); toast('🔔 Rappels activés !'); }
        else { await report(p === 'denied' ? 'denied' : 'default', null); toast('Rappels non activés. Tu peux les autoriser plus tard dans les réglages du téléphone.'); }
      } catch (e) { toast('Impossible d’activer les rappels sur ce téléphone.'); }
      placePushCard();
    });
  }

  /* =========================================================
     Accueil de l'élève
     ========================================================= */
  const baseHome = screenHome;
  screenHome = function () {
    baseHome.apply(this, arguments);
    try {
      const acts = $app.querySelector('.acts');
      if (acts) {
        const d = DU || LS.get(kTok('rv_duels'), null), canDuel = role === 'student' && !PREVIEW && d && d.allowed;
        acts.insertAdjacentHTML('beforeend', `<button class="act ${canDuel ? '' : 'solo'}" id="sprint"><span class="ic">⚡</span><b>Sprint 60 s</b><span class="small muted">Conversions, formules, 10ⁿ</span></button>`
          + (canDuel ? `<button class="act" id="duelAct"><span class="ic">⚔️</span><b>Défier un ami</b><span class="small muted">Les mêmes 5 questions</span></button>` : ''));
        onId('sprint', screenSprints); onId('duelAct', screenDuels);
      }
      const mgo = document.getElementById('mgo'), anchor = mgo && mgo.closest('.card');
      if (anchor) {
        const g = goalCardHtml(); if (g) anchor.insertAdjacentHTML('afterend', g);
        const du = duelHomeHtml(); if (du) { anchor.insertAdjacentHTML('afterend', du); onId('duin', screenDuels); }
      }
      placePushCard();
    } catch (e) {}
    if (!PREVIEW && role === 'student' && (!DU || Date.now() - (DU._at || 0) > 60000)) {
      const prev = JSON.stringify(LS.get(kTok('rv_duels'), null));
      loadDuels().then((r) => { if (r) { r._at = Date.now(); if (JSON.stringify(LS.get(kTok('rv_duels'), null)) !== prev && document.getElementById('mgo') && !RUN) screenHome(); } });
    }
  };
  // abonnement aux rappels : à chaque ouverture de l'appli (une fois par jour au serveur)
  setTimeout(syncPush, 1500);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') syncPush(); });

  /* =========================================================
     Espace parent : rappels, objectif de la semaine
     ========================================================= */
  let PP = null;
  const ppChild = (id) => PP && (PP.children || []).find((c) => c.id === id);
  const devTxt = (d) => ({ ok: 'rappels activés ✓', denied: 'rappels refusés dans les réglages du téléphone', default: 'pas encore activés', unsupported: 'ce navigateur ne gère pas les rappels', noinstall: 'appli pas encore installée sur l’écran d’accueil (nécessaire sur iPhone)' }[d.status] || d.status);
  function parentCardsHtml(st) {
    if (!st) return '';
    const name = esc(childName(st)), c = contractOf(childPlan(st)), p = ppChild(st.id), devs = (p && p.devices) || [];
    const anyOk = devs.some((d) => d.status === 'ok');
    return `<div class="card stack" id="pgoal"><h2>🎯 Objectif de la semaine</h2>
        <p class="small muted" style="margin:0">Un nombre de missions du jour à accomplir d’ici dimanche, et une récompense si tu veux. ${name} voit sa progression sur son accueil.</p>
        <label class="small"><b>Missions par semaine</b></label>
        <select class="field" id="gdays">${[0, 3, 4, 5, 6, 7].map((n) => `<option value="${n}" ${(c ? c.days : 0) === n ? 'selected' : ''}>${n ? n + ' jours sur 7' : 'Pas d’objectif'}</option>`).join('')}</select>
        <label class="small"><b>Récompense</b> <span class="muted">(facultatif)</span></label>
        <input class="field" id="greward" maxlength="80" placeholder="Ex. : une sortie cinéma" value="${esc(c ? c.reward : '')}">
        <button class="btn ghost" id="gsave">Enregistrer l’objectif</button></div>
      <div class="card stack" id="ppush"><h2>🔔 Rappels sur le téléphone de ${name}</h2>
        <p class="small muted" style="margin:0">Vers 17 h, seulement les jours où des exercices attendent dans « À revoir » et où ${name} n’a pas encore révisé. Au plus un rappel par jour. ${name} les active une fois sur son téléphone ; seul un parent peut les couper.</p>
        ${PP ? `<label class="ck"><input type="checkbox" id="pushok" ${p && p.push_ok === false ? '' : 'checked'}> Envoyer les rappels à ${name}</label>
        ${devs.length ? `<ul class="small devl">${devs.map((d) => `<li><b>${esc(d.label || 'Appareil')}</b> : ${devTxt(d)}</li>`).join('')}</ul>` : `<p class="small" style="margin:0">${name} n’a pas encore ouvert la nouvelle version de l’appli. Une carte « Active tes rappels » apparaîtra sur son accueil.</p>`}
        ${p && p.last ? `<p class="small muted" style="margin:0">Dernier rappel : ${new Date(p.last + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>` : ''}
        ${anyOk ? '<button class="btn ghost" id="pushtest">Envoyer un rappel test</button>' : ''}` : '<p class="small muted" style="margin:0">Chargement…</p>'}
      </div>`;
  }
  function suiviGoalHtml(st) {
    const c = contractOf(childPlan(st)); if (!c) return '';
    const n = Math.min(weekDone(childState(st)), c.days);
    return `<div class="card stack"><div class="row between"><b>🎯 Objectif de la semaine</b><span class="small"><b>${n}/${c.days}</b> missions</span></div>
      <div class="goal">${Array.from({ length: c.days }, (_, i) => `<i class="${i < n ? 'on' : ''}"></i>`).join('')}</div>
      <span class="small muted">${n >= c.days ? '🎉 Objectif atteint' + (c.reward ? ` : 🎁 ${esc(c.reward)}` : '') : c.reward ? `🎁 ${esc(c.reward)}` : ''}</span></div>`;
  }
  const baseReg = tabReglages, baseSuivi = tabSuivi;
  tabReglages = function (st) {
    const h = baseReg.apply(this, arguments), slot = '<div id="bslot"></div>';
    const i = h.indexOf('<div id="tslot"></div>');
    return i >= 0 ? h.slice(0, i) + slot + h.slice(i) : h + slot;
  };
  tabSuivi = function (st) {
    const h = baseSuivi.apply(this, arguments);
    try { return st ? h.replace('<div id="tslot"></div>', suiviGoalHtml(st) + '<div id="tslot"></div>') + (h.includes('tslot') ? '' : suiviGoalHtml(st)) : h; } catch (e) { return h; }
  };
  function fillParent() {
    const slot = document.getElementById('bslot'); if (!slot || role !== 'parent' || !DASH) return;
    const st = curChild(); slot.innerHTML = parentCardsHtml(st); if (!st) return;
    const $ = (id) => document.getElementById(id);
    onId('gsave', async () => {
      const days = +$('gdays').value, rw = $('greward').value.trim().slice(0, 80);
      try {
        const r = await rpc('rv_plan_add', { p_token: token, p_kind: 'reglage', p_day: null, p_label: 'contrat', p_skills: rw ? [rw] : [], p_level: 2, p_error_code: String(days), p_child: st.id });
        if (r.error) return toast('Impossible pour l’instant.');
        DASH.plan = (DASH.plan || []).filter((x) => !(x.kind === 'reglage' && x.label === 'contrat' && x.student === st.id));
        DASH.plan.push({ id: r.id, kind: 'reglage', label: 'contrat', error_code: String(days), skills: rw ? [rw] : [], student: st.id, created_at: new Date().toISOString() });
        toast(days ? 'Objectif enregistré ✓' : 'Objectif retiré'); drawParent();
      } catch (e) { toast('Pas de connexion internet.'); }
    });
    if ($('pushok')) $('pushok').onchange = async (e) => {
      const v = e.target.checked;
      try { const r = await rpc('rv_push_set', { p_token: token, p_child: st.id, p_ok: v }); if (r.error) throw 0; const c = ppChild(st.id); if (c) c.push_ok = v; toast(v ? 'Rappels activés ✓' : 'Rappels coupés'); }
      catch (err) { e.target.checked = !v; toast('Impossible pour l’instant.'); }
    };
    onId('pushtest', async () => {
      try { const r = await pushFn({ action: 'test', token, child: st.id }); toast(r.sent ? '🔔 Rappel test envoyé : il doit arriver sur le téléphone dans la minute.' : 'Aucun téléphone n’a pu être joint. Demande à ' + esc(childName(st)) + ' d’ouvrir l’appli une fois.'); loadPP().then(fillParent); }
      catch (e) { toast('Pas de connexion internet.'); }
    });
  }
  async function loadPP() { try { const r = await rpc('rv_push_parent', { p_token: token }); if (!r.error) { PP = r; PP._at = Date.now(); } } catch (e) {} return PP; }
  const baseDraw = drawParent;
  drawParent = function () {
    baseDraw.apply(this, arguments);
    if (!document.getElementById('bslot')) return;
    fillParent();
    if (!PP || Date.now() - (PP._at || 0) > 60000) loadPP().then(() => fillParent());
  };

  if (typeof KPI_HELP !== 'undefined') KPI_HELP.push(['Sprints 60 s', (s) => { const k = Object.keys(s.sprint || {}); return k.length ? k.map((x) => `${(SPRINTS[x] || {}).name || x} : record ${s.sprint[x].best}`).join(' • ') : 'pas encore'; }, 'Une minute pour enchaîner un maximum de conversions, de formules ou de puissances de dix.']);

  /* Si l'accueil était déjà affiché avant ce fichier, on le redessine */
  if (typeof S !== 'undefined' && S && S.pseudo && !RUN && $app.querySelector('.acts')) screenHome();
})();
