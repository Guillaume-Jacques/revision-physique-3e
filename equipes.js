/* Équipes entre amis et classement de la semaine (30/10) — fichier autonome, chargé APRÈS app.js et rythme.js.
   - Le parent autorise les équipes une fois (Réglages) et saisit l'initiale du nom de son enfant (« Louise J. »).
   - L'élève crée une équipe (code de 6 lettres + QR code + lien #t=CODE) ou en rejoint une avec un code.
   - Un enfant sans appli : le lien #t=CODE ouvre une page « Demande à un parent de t'inscrire » ; le code est gardé
     sur l'appareil et proposé au parent dans ses Réglages (« Inscrire … dans l'équipe »).
   - Points d'effort de la semaine, calculés sur le serveur (rv_team_points) : 10 par exercice réussi du premier coup,
     5 sinon, 0 au hasard ; 150 au plus par jour ; +20 par jour avec au moins 5 exercices. Remise à zéro le lundi. */
(function () {
  if (typeof screenHome !== 'function' || typeof drawParent !== 'function') return;
  const PEND = 'rv_team_pending';
  const kTeam = () => 'rv_team_' + (token || '').slice(0, 8);
  const QR_SRC = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  const teamUrl = (code) => `${location.origin}${location.pathname}#t=${code}`;
  const rankTxt = (i, g) => i === 0 ? gw(g, '1re', '1er', '1er') : (i + 1) + 'e';
  const ERR = { off: 'Ton parent doit d’abord autoriser les équipes dans ses Réglages.', code: 'Ce code ne correspond à aucune équipe.', full: 'Cette équipe est complète (8 élèves).', many: 'Tu es déjà dans 5 équipes, c’est le maximum.', child: 'Profil introuvable.' };

  document.head.insertAdjacentHTML('beforeend', `<style>
    .tcard { cursor: pointer; text-align: left; width: 100%; }
    .tcard .tline { display: flex; align-items: center; gap: 10px; }
    .tcard .tic { font-size: 28px; }
    .tboard { width: 100%; border-collapse: collapse; }
    .tboard td { padding: 9px 4px; border-top: 1px solid var(--line); }
    .tboard tr:first-child td { border-top: 0; }
    .tboard tr.me td { background: var(--accent-soft); font-weight: 800; }
    .tboard tr.me td:first-child { border-radius: 10px 0 0 10px; } .tboard tr.me td:last-child { border-radius: 0 10px 10px 0; }
    .tboard .rk { width: 38px; text-align: center; font-weight: 800; }
    .tboard .pt { text-align: right; white-space: nowrap; font-weight: 800; }
    .tcode { font-size: 30px; font-weight: 900; letter-spacing: 6px; text-align: center; color: var(--accent); }
    .tqr { display: flex; justify-content: center; padding: 12px; background: #fff; border-radius: 14px; }
    .tqr img, .tqr canvas { width: 200px; height: 200px; }
    .tbadge { font-size: 12px; font-weight: 800; background: #e9f9ee; color: #1d7a3a; border-radius: 999px; padding: 2px 8px; margin-left: 6px; white-space: nowrap; }
  </style>`);

  /* ---------- Lien d'invitation #t=CODE ---------- */
  const m = /^#t=([A-Za-z]{6})$/.exec(location.hash);
  if (m) {
    LS.set(PEND, m[1].toUpperCase());
    history.replaceState(null, '', location.pathname);
    if (!ACCTS.length) screenInvited();
    else if (ACCTS.every((a) => a.role === 'parent')) { PV.tab = 'reglages'; savePV(); }
  }
  function screenInvited() {
    const code = LS.get(PEND, '');
    render(`${brandHead('')}
      <div class="card stack">
        <span class="chip">🏆 Invitation</span>
        <h2>Un ami t’invite dans son équipe</h2>
        <p style="margin:0">Pour la rejoindre, il te faut l’appli. <b>Demande à un parent</b> de t’inscrire : il touche le bouton ci-dessous, entre son adresse e-mail et ajoute ton prénom. Le code de l’équipe est gardé sur ce téléphone.</p>
        <div class="tcode">${esc(code)}</div>
        <button class="btn" id="tipar">Je suis parent : inscrire mon enfant</button>
        <button class="btn ghost" id="tistu">J’ai déjà l’appli sur un autre appareil</button>
      </div>
      <p class="small muted center">Tu as déjà l’appli ailleurs ? Ouvre-la, touche 🏆 puis « J’ai un code » et tape <b>${esc(code)}</b>.</p>`);
    document.getElementById('tipar').onclick = () => screenParentLogin();
    document.getElementById('tistu').onclick = () => screenStudentJoin();
  }

  /* ---------- Élève : carte sur l'accueil ---------- */
  let TM = null;
  async function loadTeams() {
    if (PREVIEW || !token || role !== 'student') return null;
    try { const r = await rpc('rv_team_mine', { p_token: token }); if (!r.error) { TM = r; LS.set(kTeam(), r); } } catch (e) {}
    return TM;
  }
  function homeCardHtml() {
    const t = TM || LS.get(kTeam(), null), pend = LS.get(PEND, '');
    if (pend) return `<button class="card stack tcard" id="tgo" style="border:2px solid var(--accent)"><div class="tline"><span class="tic">🏆</span><div class="grow"><b>Invitation dans une équipe</b><br><span class="small muted">Code ${esc(pend)} • touche pour la rejoindre</span></div><span>›</span></div></button>`;
    if (!t) return '';
    const teams = t.teams || [];
    if (!teams.length) return `<button class="card stack tcard" id="tgo"><div class="tline"><span class="tic">🏆</span><div class="grow"><b>Défie tes amis</b><br><span class="small muted">${t.allowed ? 'Crée une équipe ou rejoins-en une avec un code.' : 'Un classement de la semaine entre amis.'}</span></div><span>›</span></div></button>`;
    const tm = teams[0], b = tm.board || [], i = b.findIndex((x) => x.me), me = b[i] || { pts: 0 };
    return `<button class="card stack tcard" id="tgo"><div class="tline"><span class="tic">🏆</span><div class="grow"><b>${esc(tm.name)}</b><br><span class="small muted">${b.length > 1 ? `Tu es <b>${rankTxt(i, GEN())}</b> sur ${b.length}` : 'Invite tes amis pour lancer le classement'} • ${me.pts} pts cette semaine${teams.length > 1 ? ` • +${teams.length - 1} équipe${teams.length > 2 ? 's' : ''}` : ''}</span></div><span>›</span></div></button>`;
  }
  function placeHomeCard() {
    if (PREVIEW || role !== 'student') return;
    const old = document.getElementById('tgo'); if (old) old.remove();
    const html = homeCardHtml(); if (!html) return;
    const mgo = document.getElementById('mgo'), anchor = mgo && mgo.closest('.card');
    if (!anchor) return;
    anchor.insertAdjacentHTML('afterend', html);
    document.getElementById('tgo').onclick = screenTeams;
  }
  const baseHome = screenHome;
  screenHome = function () {
    baseHome.apply(this, arguments);
    placeHomeCard();
    if (!PREVIEW && role === 'student') loadTeams().then(() => { if (document.getElementById('mgo')) placeHomeCard(); });
  };

  /* ---------- Élève : écran des équipes ---------- */
  function boardHtml(b, g) {
    if (!b || !b.length) return '';
    const best = b.length > 1 ? b.reduce((m, x) => (x.pts - x.prev > (m ? m.pts - m.prev : 0) ? x : m), null) : null;
    const medal = ['🥇', '🥈', '🥉'];
    return `<table class="tboard">${b.map((x, i) => `<tr class="${x.me ? 'me' : ''}"><td class="rk">${x.pts > 0 && medal[i] ? medal[i] : rankTxt(i, g)}</td><td>${esc(x.name)}${x.me ? ' (toi)' : ''}${best === x ? '<span class="tbadge">📈 Plus forte progression</span>' : ''}</td><td class="pt">${x.pts} pts</td></tr>`).join('')}</table>`;
  }
  async function screenTeams() {
    stopTimer();
    const draw = () => {
      const t = TM || LS.get(kTeam(), { allowed: false, teams: [] }), teams = t.teams || [], pend = LS.get(PEND, '');
      render(`<div class="row between" style="margin:4px 4px 14px"><button class="link" id="tback">← Accueil</button><b>🏆 Mes équipes</b><span style="width:60px"></span></div>
        ${pend ? `<div class="card stack" style="border:2px solid var(--accent)"><h3>Rejoindre l’équipe ${esc(pend)} ?</h3>
          ${t.allowed ? '<button class="btn" id="tpj">Rejoindre</button>' : `<p class="small" style="margin:0">${ERR.off} Montre-lui ce code : il pourra aussi t’inscrire lui-même.</p>`}
          <button class="link" id="tpx">Plus tard</button></div>` : ''}
        ${!t.allowed ? `<div class="card stack"><h2>Défie tes amis</h2>
          <p style="margin:0">Crée une équipe avec tes amis et comparez vos points chaque semaine. Pour l’instant, les équipes ne sont pas activées sur ton compte.</p>
          <p class="small muted" style="margin:0">Demande à ton parent : dans son espace, <b>Réglages › Équipes entre amis</b>.</p></div>` : ''}
        ${teams.map((tm) => `<div class="card stack">
          <div class="row between"><h2 style="margin:0">${esc(tm.name)}</h2><button class="more" data-tleave="${tm.id}" data-tn="${esc(tm.name)}" aria-label="Options">⋯</button></div>
          <p class="small muted" style="margin:0">Classement de la semaine • remise à zéro lundi</p>
          ${boardHtml(tm.board, GEN())}
          ${(tm.board || []).length < 8 ? `<button class="btn ghost" data-tinv="${tm.code}" data-tn="${esc(tm.name)}">➕ Inviter un ami</button>` : '<p class="small muted" style="margin:0">Équipe complète (8 élèves).</p>'}
        </div>`).join('')}
        ${t.allowed ? `<div class="card stack">
          ${teams.length ? '' : '<h2>Défie tes amis</h2><p style="margin:0">Crée ton équipe et invite tes amis, ou rejoins la leur avec leur code.</p>'}
          <button class="btn ${teams.length ? 'ghost' : ''}" id="tnew">Créer une équipe</button>
          <button class="btn ghost" id="tjoin">J’ai un code</button></div>` : ''}
        <details class="card"><summary><b>Comment gagner des points ?</b></summary><div class="stack small" style="margin-top:8px">
          <p style="margin:0">✅ Exercice réussi du premier coup : <b>10 pts</b>. Réussi après une erreur ou avec un indice : <b>5 pts</b>.</p>
          <p style="margin:0">🎲 Réponse « au hasard » : 0 pt, même si elle est juste.</p>
          <p style="margin:0">📅 Chaque jour où tu fais au moins 5 exercices : <b>+20 pts</b>. Au plus 170 pts par jour : réviser un peu chaque jour rapporte plus qu’une grosse séance.</p>
          <p style="margin:0">📈 Le badge « Plus forte progression » va à celui qui a gagné le plus de points de plus que la semaine d’avant.</p>
          <p class="muted" style="margin:0">Les autres voient seulement ton prénom, l’initiale de ton nom et tes points.</p></div></details>`);
      const on = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
      on('tback', () => route());
      on('tpx', () => { LS.del(PEND); draw(); });
      on('tpj', () => join(pend));
      on('tnew', create);
      on('tjoin', async () => { const c = await ask({ title: 'Code de l’équipe', text: 'Les 6 lettres que ton ami t’a données.', input: 'Ex. : KPRTWZ', ok: 'Rejoindre' }); if (c) join(c); });
      $app.querySelectorAll('[data-tinv]').forEach((b) => b.onclick = () => invite(b.dataset.tinv, b.dataset.tn));
      $app.querySelectorAll('[data-tleave]').forEach((b) => b.onclick = async () => {
        if (!await ask({ title: `Quitter « ${b.dataset.tn} » ?`, text: 'Tes points restent à toi. Tu pourras revenir avec le code de l’équipe.', ok: 'Quitter l’équipe', danger: true })) return;
        try { await rpc('rv_team_leave', { p_token: token, p_team: b.dataset.tleave }); } catch (e) { return toast('Pas de connexion internet.'); }
        await loadTeams(); draw();
      });
    };
    const join = async (c) => {
      try {
        const r = await rpc('rv_team_join', { p_token: token, p_code: c });
        if (r.error) return toast(ERR[r.error] || 'Impossible pour l’instant.');
        LS.del(PEND); toast(r.already ? `Tu es déjà dans « ${esc(r.name)} ».` : `Bienvenue dans « ${esc(r.name)} » ! 🎉`);
        await loadTeams(); draw();
      } catch (e) { toast('Pas de connexion internet.'); }
    };
    const create = async () => {
      const n = await ask({ title: 'Nom de ton équipe', text: 'Par exemple : Les atomes crochus. Tu pourras inviter jusqu’à 7 amis.', input: 'Nom de l’équipe', ok: 'Créer' });
      if (n == null) return;
      try {
        const r = await rpc('rv_team_create', { p_token: token, p_name: n });
        if (r.error) return toast(r.error === 'many' ? 'Tu as déjà créé 3 équipes.' : ERR[r.error] || 'Impossible pour l’instant.');
        await loadTeams(); draw(); invite(r.code, n || 'ton équipe');
      } catch (e) { toast('Pas de connexion internet.'); }
    };
    draw();
    await loadTeams(); draw();
  }

  /* ---------- Invitation : code, QR code, lien ---------- */
  let qrLoading = null;
  const loadQR = () => qrLoading || (qrLoading = new Promise((res, rej) => { const s = document.createElement('script'); s.src = QR_SRC; s.onload = res; s.onerror = rej; document.head.appendChild(s); }));
  async function invite(code, name) {
    const p = ask({ title: 'Inviter un ami', html: `<p class="small" style="margin:0">Montre ce QR code à ton ami : il le scanne avec l’appareil photo de son téléphone. Ou donne-lui le code :</p>
      <div class="tcode">${esc(code)}</div><div class="tqr" id="tqr"></div>
      <p class="small muted" style="margin:0">S’il n’a pas encore l’appli, un de ses parents l’inscrira en quelques minutes.</p>`, ok: '📤 Envoyer le lien', cancel: 'Fermer' });
    loadQR().then(() => { const el = document.getElementById('tqr'); if (el && window.QRCode) new QRCode(el, { text: teamUrl(code), width: 400, height: 400, correctLevel: QRCode.CorrectLevel.M }); }).catch(() => { const el = document.getElementById('tqr'); if (el) el.remove(); });
    if (await p) shareText(APP_NAME, `Rejoins mon équipe « ${name} » pour réviser la physique-chimie ! Code : ${code}.`, teamUrl(code));
  }

  /* ---------- Parent : Réglages et Suivi ---------- */
  let TP = null;
  const tpChild = (id) => TP && (TP.children || []).find((c) => c.id === id);
  function parentSuiviHtml(st) {
    const c = tpChild(st.id); if (!c || !(c.teams || []).length) return '';
    return `<div class="card stack"><h3>🏆 Équipes de ${esc(childName(st))}</h3><p class="small muted" style="margin:0">Classement de la semaine (points d’effort, remise à zéro le lundi)</p>
      ${c.teams.map((tm) => `<b class="small">${esc(tm.name)}</b>${boardHtml(tm.board, st.gender).replace('(toi)', '')}`).join('')}</div>`;
  }
  function parentReglagesHtml(st) {
    const pend = LS.get(PEND, ''), name = st ? esc(childName(st)) : '';
    if (!TP) return '';
    const c = st && tpChild(st.id), g = st && st.gender;
    return `<div class="card stack" ${pend ? 'style="border:2px solid var(--accent)"' : ''}>
      <h2>🏆 Équipes entre amis</h2>
      ${pend && st ? `<div class="stack"><b>Invitation reçue : équipe ${esc(pend)}</b><button class="btn" id="tpjc">Inscrire ${name} dans cette équipe</button><button class="link" id="tpx">Ignorer</button></div>` : ''}
      ${pend && !st ? `<p style="margin:0"><b>Invitation reçue : équipe ${esc(pend)}.</b> Ajoute d’abord ton enfant (onglet Suivi), puis reviens ici pour l’inscrire dans l’équipe.</p>` : ''}
      <p class="small muted" style="margin:0">Ton enfant crée une équipe ou rejoint celle d’un ami avec un code, et ils comparent leurs points de la semaine. Pas de messagerie ni de photo : les autres voient seulement le prénom, l’initiale du nom et les points.</p>
      <label class="ck"><input type="checkbox" id="tallow" ${TP.allowed ? 'checked' : ''}> Autoriser les équipes pour ${(DASH.students || []).length > 1 ? 'mes enfants' : 'mon enfant'}</label>
      ${st && TP.allowed ? `
        <label class="small"><b>Initiale du nom de ${name}</b> <span class="muted">(affichée « ${name} ${esc((c && c.initial) || 'J')}. »)</span></label>
        <div class="row" style="gap:8px"><input class="field" id="tini" maxlength="1" value="${esc((c && c.initial) || '')}" placeholder="Ex. : J" style="width:70px;text-align:center;text-transform:uppercase;font-weight:800"><button class="btn ghost" id="tinis" style="width:auto">Enregistrer</button></div>
        ${c && c.teams.length ? `<b class="small">Équipes de ${name}</b><table>${c.teams.map((tm) => `<tr><td>${esc(tm.name)}<br><span class="small muted">${(tm.board || []).length} membre${(tm.board || []).length > 1 ? 's' : ''} • code ${esc(tm.code)}</span></td><td class="tact"><button class="btn ghost" style="width:auto;min-height:40px;padding:6px 12px" data-tkick="${tm.id}" data-tn="${esc(tm.name)}">Retirer</button></td></tr>`).join('')}</table>`
          : `<p class="small muted" style="margin:0">${name} n’est dans aucune équipe pour l’instant.</p>`}
        <button class="link" id="tcode">Inscrire ${name} avec un code d’équipe</button>` : ''}
    </div>`;
  }
  async function loadParentTeams() {
    try { const r = await rpc('rv_team_parent', { p_token: token }); if (!r.error) TP = r; } catch (e) {}
    return TP;
  }
  function fillParent() {
    if (role !== 'parent' || !DASH) return;
    const st = curChild(), tab = PV.tab;
    const slot = document.getElementById('tslot');
    if (!slot) return;
    slot.innerHTML = tab === 'reglages' ? parentReglagesHtml(st) : st ? parentSuiviHtml(st) : '';
    bindParentTeams(st);
  }
  function bindParentTeams(st) {
    const $ = (id) => document.getElementById(id);
    const call = async (fn, args, ok) => {
      try {
        const r = await rpc(fn, Object.assign({ p_token: token }, args));
        if (r.error) { toast(ERR[r.error] || 'Impossible pour l’instant.'); return null; }
        if (ok) toast(ok); return r;
      } catch (e) { toast('Pas de connexion internet.'); return null; }
    };
    const refresh = async () => { await loadParentTeams(); fillParent(); };
    if ($('tallow')) $('tallow').onchange = async (e) => {
      const v = e.target.checked;
      if (!v && (TP.children || []).some((c) => c.teams.length)) {
        if (!await ask({ title: 'Désactiver les équipes ?', text: 'Tes enfants seront retirés de toutes leurs équipes. Leurs points d’exercices restent dans leur suivi.', ok: 'Désactiver', danger: true })) { e.target.checked = true; return; }
      }
      if (await call('rv_team_allow', { p_ok: v }, v ? 'Équipes autorisées ✓' : 'Équipes désactivées')) refresh(); else e.target.checked = !v;
    };
    if (!st) return;
    if ($('tinis')) $('tinis').onclick = async () => { if (await call('rv_team_initial', { p_child: st.id, p_initial: $('tini').value }, 'Initiale enregistrée ✓')) refresh(); };
    const joinChild = async (code) => {
      const r = await call('rv_team_join_child', { p_child: st.id, p_code: code });
      if (r) { LS.del(PEND); toast(r.already ? `${esc(childName(st))} est déjà dans « ${esc(r.name)} ».` : `${esc(childName(st))} a rejoint « ${esc(r.name)} » ✓`); refresh(); }
    };
    if ($('tpjc')) $('tpjc').onclick = () => joinChild(LS.get(PEND, ''));
    if ($('tpx')) $('tpx').onclick = () => { LS.del(PEND); fillParent(); };
    if ($('tcode')) $('tcode').onclick = async () => { const c = await ask({ title: 'Code de l’équipe', text: `Les 6 lettres de l’équipe que ${esc(childName(st))} doit rejoindre.`, input: 'Ex. : KPRTWZ', ok: 'Inscrire' }); if (c) joinChild(c); };
    document.querySelectorAll('[data-tkick]').forEach((b) => b.onclick = async () => {
      if (!await ask({ title: `Retirer ${esc(childName(st))} de « ${b.dataset.tn} » ?`, ok: 'Retirer', danger: true })) return;
      if (await call('rv_team_kick', { p_child: st.id, p_team: b.dataset.tkick }, 'Retiré de l’équipe')) refresh();
    });
  }
  const baseSuivi = tabSuivi, baseReg = tabReglages;
  tabSuivi = function (st) { return baseSuivi.apply(this, arguments) + '<div id="tslot"></div>'; };
  tabReglages = function (st) {
    const h = baseReg.apply(this, arguments), slot = '<div id="tslot"></div>';
    const i = h.indexOf('<div class="card stack">\n    <h2>✉️');
    return i > 0 ? h.slice(0, i) + slot + h.slice(i) : h + slot;
  };
  const baseDraw = drawParent;
  drawParent = function () {
    baseDraw.apply(this, arguments);
    if (!document.getElementById('tslot')) return;
    fillParent();
    if (!TP || Date.now() - (TP._at || 0) > 60000) loadParentTeams().then((r) => { if (r) { r._at = Date.now(); fillParent(); } });
  };
})();
