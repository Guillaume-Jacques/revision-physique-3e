/* Historique des exercices côté élève : onglet « Mes exercices »
   - garde sur l'appareil les 30 derniers jours d'exercices avec leur correction complète ;
   - complète avec les exercices enregistrés sur le serveur (autres appareils, exercices plus anciens) si la fonction rv_history existe ;
   - chaque exercice : énoncé, réponse donnée, bonne réponse, correction pas à pas, bouton « un exercice du même type ». */
(function () {
  const DAYS = 30, MAX = 400;
  const kHist = () => 'rv_hist_' + (token || '').slice(0, 8);
  const cut = (s, n) => (s == null ? s : String(s).slice(0, n));
  const skillOf = (id) => SKILLS.find((k) => k.id === id);

  function readLocal() {
    const lim = Date.now() - DAYS * 864e5;
    return (LS.get(kHist(), []) || []).filter((h) => h && Date.parse(h.ts) > lim);
  }
  function pushLocal(h) {
    if (PREVIEW || !token) return;
    try {
      const l = readLocal(); l.unshift(h);
      LS.set(kHist(), l.slice(0, MAX));
    } catch (e) { try { LS.set(kHist(), readLocal().slice(0, 150)); } catch (e2) {} }
  }

  /* Correction complète d'un exercice, à partir de l'exercice tel qu'il a été posé */
  function detailOfRun(r) {
    const it = r.item; if (!it) return null;
    if (it.type === 'steps') return { t: 'steps', q: cut(it.q, 3000), sol: (it.sol || []).map((x) => cut(x, 800)) };
    let good = null, why = [];
    try { good = it.type === 'num' ? `${fr(it.ans)} ${esc(it.unit || '')}`.trim() : ((it.choices || []).find((c) => c.ok) || {}).t || null; } catch (e) {}
    const wrong = (r.correct ? (r.tries || []).slice(0, -1) : (r.tries || [])).filter((a, k, arr) => a && a !== '—' && arr.indexOf(a) === k);
    if (it.type === 'qcm') why = wrong.map((a) => ((it.choices || []).find((c) => stripTags(c.t) === a) || {}).msg).filter(Boolean);
    let st = []; try { st = steps(it); } catch (e) {}
    const hint = it.type === 'qcm' && it.hints && it.hints[0] ? it.hints[0] : null;
    if (hint) st = st.filter((x) => stripTags(x) !== stripTags(hint));
    return { t: it.type || 'num', q: cut(it.q, 3000), good: cut(good, 600), wrong: wrong.map((a) => cut(a, 60)), why: why.map((m) => cut(m, 600)), st: st.map((x) => cut(x, 800)), hint: hint ? cut(hint, 600) : null };
  }
  /* Correction d'un exercice de cours, retrouvée dans la leçon */
  function detailOfCours(a) {
    const m = /^([^-]+)-(?:e(\d+)|s(\d+)-q(\d+))$/.exec(a.item_id || ''); if (!m) return null;
    const c = (typeof COURS !== 'undefined' ? COURS : []).find((x) => x.id === m[1]); if (!c) return null;
    if (m[2] != null) {
      const e = c.exos[+m[2]]; if (!e) return null;
      return { t: 'cours', q: cut(e.enonce, 3000), good: e.ans != null ? cut(`${fr(e.ans)} ${esc(e.unit || '')}`.trim(), 200) : null, st: (e.steps || []).map((x) => cut(x, 800)), wrong: a.correct ? [] : [a.answer] };
    }
    const sec = c.sections[+m[3]], q = sec && (sec.quiz || [])[+m[4]]; if (!q) return null;
    const ok = (q.choices || []).find((x) => x.ok), bad = (q.choices || []).find((x) => stripTags(x.t) === a.answer);
    return { t: 'qcm', q: cut(q.q, 3000), good: ok ? cut(ok.t, 600) : null, why: !a.correct && bad && bad.msg ? [cut(bad.msg, 600)] : [], wrong: a.correct ? [] : [a.answer] };
  }

  /* On capte chaque exercice au moment où il est enregistré */
  const baseLog = logAttempt;
  logAttempt = function (a) {
    try {
      let d = null;
      if (a.mode === 'cours') d = detailOfCours(a);
      else if (a.mode !== 'sprint' && typeof RUN !== 'undefined' && RUN && RUN.results && RUN.results.length) {
        const r = RUN.results[RUN.results.length - 1];
        if (r.item && r.item.id === a.item_id) { d = detailOfRun(r); a.clean = !!r.clean; }
      }
      if (d) a.detail = d;
      if (a.mode !== 'sprint') pushLocal(Object.assign({ ts: new Date().toISOString() }, a));
    } catch (e) {}
    return baseLog.apply(this, arguments);
  };

  /* ---------- Chargement ---------- */
  let SRV = null, SRV_AT = 0, SRV_KEY = '';
  async function loadServer() {
    const child = PREVIEW && window.RV_PV ? window.RV_PV.child : null, key = (token || '') + (child || '');
    if (SRV && SRV_KEY === key && Date.now() - SRV_AT < 30000) return SRV;
    try {
      const r = await rpc('rv_history', { p_token: token, p_child: child, p_days: DAYS });
      SRV = r && !r.error ? (r.items || []) : [];
    } catch (e) { SRV = []; }
    SRV_AT = Date.now(); SRV_KEY = key;
    return SRV;
  }
  function merged(srv) {
    const loc = PREVIEW ? [] : readLocal();
    const seen = new Set(loc.map((h) => h.item_id + '|' + Math.round(Date.parse(h.ts) / 60000)));
    const out = loc.slice();
    (srv || []).forEach((h) => {
      const k = h.item_id + '|' + Math.round(Date.parse(h.ts) / 60000), k2 = h.item_id + '|' + (Math.round(Date.parse(h.ts) / 60000) - 1);
      if (seen.has(k) || seen.has(k2)) return;
      if (!h.detail && h.mode === 'cours') { try { h.detail = detailOfCours(h); } catch (e) {} }
      out.push(h);
    });
    return out.sort((a, b) => Date.parse(b.ts) - Date.parse(a.ts));
  }

  /* ---------- Affichage ---------- */
  const isErr = (h) => !h.correct || (h.clean === false) || h.error_code === 'hasard';
  function dayLabel(d) {
    const t = todayStr ? todayStr() : new Date().toISOString().slice(0, 10);
    const y = new Date(Date.now() - 864e5); const ys = `${y.getFullYear()}-${String(y.getMonth() + 1).padStart(2, '0')}-${String(y.getDate()).padStart(2, '0')}`;
    if (d === t) return 'Aujourd’hui'; if (d === ys) return 'Hier';
    const s = new Date(d + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    return s.charAt(0).toUpperCase() + s.slice(1);
  }
  const localDay = (ts) => { const x = new Date(ts); return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`; };
  const MODE_TXT = { cours: 'Exercice de cours', redac: 'Rédaction', boss: 'Contrôle blanc', ctrl: 'Contrôle type', bat: 'Bats ta note', diag: 'Bilan', redo: 'Exercice refait' };

  function card(h, i) {
    const sk = skillOf(h.skill) || { icon: '📝', short: h.skill || '' }, d = h.detail;
    const st = !h.correct ? ['st-low', 'À revoir'] : h.error_code === 'hasard' ? ['st-mid', 'Juste, mais au hasard'] : h.clean === false || (h.tries > 1) ? ['st-mid', 'Juste après une erreur'] : ['st-ok', 'Juste du premier coup'];
    const err = !h.correct && h.error_code && h.error_code !== 'nsp' && ERR_LABELS[h.error_code] ? `<p class="small" style="margin:6px 0 0">🔎 L’erreur repérée : <b>${esc(ERR_LABELS[h.error_code])}</b></p>` : '';
    const heure = new Date(h.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    let body;
    if (d && d.t === 'steps') {
      body = `<div class="question small" style="font-size:.95em">${d.q}</div>${err}
        <div class="fb sol small"><b>La copie complète :</b><ol>${(d.sol || []).map((x) => `<li>${x}</li>`).join('')}</ol></div>`;
    } else if (d) {
      const wrong = (d.wrong || []).filter((a) => a && a !== '—');
      const why = (d.why || []).map((m) => `<p class="small" style="margin:6px 0 0">❓ ${m}</p>`).join('') + (d.hint ? `<p class="small" style="margin:6px 0 0">📌 ${d.hint}</p>` : '');
      const stp = (d.st || []).length ? `<b class="small">${d.t === 'num' ? 'Le calcul' : 'La correction'}, étape par étape :</b><ol class="small">${d.st.map((x) => `<li>${x}</li>`).join('')}</ol>` : '';
      body = `<div class="question small" style="font-size:.95em">${d.q}</div>
        ${wrong.length ? `<p class="small">Tu avais répondu : ${wrong.map((a) => `<s>${esc(a)}</s>`).join(', ')}</p>` : h.correct ? `<p class="small">Ta réponse : <b>${esc(h.answer || '')}</b></p>` : ''}
        ${err}
        <div class="fb sol small">${d.good ? `<b>Bonne réponse : ${d.good}</b>` : ''}${why || stp ? `<div style="margin-top:6px">${why}${stp}</div>` : ''}</div>`;
    } else {
      body = `<div class="question small" style="font-size:.95em">${esc(h.question || '')}</div>
        <p class="small">Ta réponse : <b>${esc(h.answer || '—')}</b></p>${err}
        <p class="small muted">La correction détaillée de cet exercice n’a pas été gardée. Fais-en un du même type : tu auras la correction pas à pas.</p>`;
    }
    const canRedo = h.mode === 'cours' ? !!/^[^-]+-(e\d+|s\d+-q\d+)$/.test(h.item_id || '') : !!(SKILLS.find((k) => k.id === h.skill) && GENERATORS[h.skill]);
    return `<details class="card rev" ${isErr(h) && !h.correct ? 'open' : ''}>
      <summary><span class="chip">${sk.icon} ${esc(sk.short || sk.name || '')}</span> <span class="status ${st[0]}">${st[1]}</span>
        <span class="small muted" style="display:block;margin-top:4px">${heure}${MODE_TXT[h.mode] ? ' • ' + MODE_TXT[h.mode] : ''}</span></summary>
      ${body}
      ${canRedo && !PREVIEW ? `<button class="btn ghost" style="margin-top:10px" data-redo="${i}">${h.mode === 'cours' ? '📚 Revoir cet exercice dans le cours' : '🔁 Un exercice du même type'}</button>` : ''}
    </details>`;
  }

  let FILTER = 'tous';
  async function screenHisto() {
    if (typeof stopTimer === 'function') stopTimer();
    render(`<h1>Mes exercices</h1><p class="muted small">Chargement…</p>`);
    addHistoBar();
    const list = merged(await loadServer());
    draw(list);
  }
  function draw(list) {
    const sj = (S && S.subj) || 'physique';
    const subjOk = (h) => FILTER === 'tous' || FILTER === 'erreurs' || (typeof subjOf === 'function' ? subjOf(h.skill) === FILTER : true);
    const errOk = (h) => FILTER !== 'erreurs' || !h.correct;
    const shown = list.filter((h) => subjOk(h) && errOk(h));
    const days = {}; shown.forEach((h, i) => { const d = localDay(h.ts); (days[d] = days[d] || []).push(Object.assign({ _i: i }, h)); });
    const nErr = list.filter((h) => !h.correct).length;
    const chips = [['tous', 'Tous'], ['erreurs', `À revoir${nErr ? ' (' + nErr + ')' : ''}`], ['physique', '⚡ Physique'], ['chimie', '⚗️ Chimie']];
    const dayHtml = Object.keys(days).sort().reverse().map((d, di) => {
      const items = days[d], errs = items.filter((h) => !h.correct), oks = items.filter((h) => h.correct);
      return `<details class="hday" ${di === 0 ? 'open' : ''}><summary><h3 style="display:inline">${dayLabel(d)}</h3>
          <span class="small muted"> • ${items.length} exercice${items.length > 1 ? 's' : ''}${errs.length ? ` • <b style="color:var(--bad,#c0392b)">${errs.length} à revoir</b>` : ' • tout juste 👏'}</span></summary>
        ${errs.map((h) => card(h, h._i)).join('')}
        ${oks.length ? (errs.length ? `<details class="okfold"><summary class="small muted" style="margin:8px 0">✓ ${oks.length} exercice${oks.length > 1 ? 's' : ''} réussi${oks.length > 1 ? 's' : ''} — toucher pour voir</summary>${oks.map((h) => card(h, h._i)).join('')}</details>` : oks.map((h) => card(h, h._i)).join('')) : ''}
      </details>`;
    }).join('');
    render(`
      <h1>Mes exercices</h1>
      <p class="muted small">Tes exercices des ${DAYS} derniers jours, avec la correction. Les erreurs sont en premier.</p>
      <div class="row" style="flex-wrap:wrap;gap:6px;margin:8px 0 12px">${chips.map(([k, l]) => `<button class="chipbtn ${FILTER === k ? 'on' : ''}" data-f="${k}">${l}</button>`).join('')}</div>
      ${dayHtml || `<div class="card center"><div style="font-size:40px">📭</div><p>${list.length ? 'Rien dans ce filtre.' : 'Pas encore d’exercice ici. Fais ta mission du jour : tes exercices et leurs corrections apparaîtront dans cet onglet.'}</p></div>`}`);
    addHistoBar();
    $app.querySelectorAll('[data-f]').forEach((b) => b.onclick = () => { FILTER = b.dataset.f; draw(list); });
    $app.querySelectorAll('[data-redo]').forEach((b) => b.onclick = (ev) => { ev.preventDefault(); redo(shown.find((h, i) => i === +b.dataset.redo) || list[+b.dataset.redo]); });
  }
  function redo(h) {
    if (!h) return;
    if (h.mode === 'cours') {
      const m = /^([^-]+)-(?:e(\d+)|s(\d+)-q(\d+))$/.exec(h.item_id);
      if (m && m[2] != null) return screenExo(m[1], +m[2]);
      if (m) return screenLesson(m[1], +m[3]);
      return;
    }
    let it;
    try { it = h.detail && h.detail.t === 'steps' && typeof genRedac === 'function' ? genRedac(h.skill, h.level || 1) : generate(h.skill, h.level || 1); } catch (e) { it = null; }
    if (!it) return toast('Cet exercice ne peut pas être refait pour l’instant.');
    startRun('redo', null, [it]);
  }

  /* ---------- Barre d'onglets élève (définie dans copies.js, 4e onglet « Exercices ») ---------- */
  function addHistoBar() { try { if (window.rvAddKidBar) window.rvAddKidBar('histo'); } catch (e) {} }

  // Fin de séance : lien vers l'historique
  window.screenHisto = screenHisto;
})();
