/* Contrôles et copies en photo (31/10) — fichier autonome, chargé APRÈS app.js et les autres modules.
   Élève : barre d'onglets en bas (Accueil, Mes cours, Contrôles) ; onglet Contrôles = contrôles à venir (qu'il peut saisir),
           « À revoir avant le prochain contrôle », et ses copies en photo avec la correction pas à pas.
   Parent : dans l'onglet Contrôles, carte « Copies » en tête (ajout de photos, vérification et validation de la relecture,
           courbe des notes). Les erreurs validées partent dans la file « À revoir » de l'enfant. */
(function () {
  if (typeof screenHome !== 'function' || typeof drawParent !== 'function') return;
  const FN = `${CFG.url}/functions/v1/rv-copie`;
  const call = (body) => fetch(FN, { method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ token }, body)) }).then((r) => r.json());
  const onId = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
  const kTok = (k) => k + '_' + (token || '').slice(0, 8);
  const isKid = () => role === 'student' || role === 'test';
  const skillById = (id) => SKILLS.find((k) => k.id === id);
  const canTrain = (id) => !!(id && skillById(id) && typeof GENERATORS !== 'undefined' && GENERATORS[id]);
  const fmtNote = (c) => c.note != null ? `${fr(c.note, 2)}/${fr(c.max || c.note_max || 20, 2)}` : '';
  const dayTxt = (c) => fmtD(c.day || (c.created_at || '').slice(0, 10));
  function curChildSafe() { try { return role === 'parent' && DASH ? curChild() : null; } catch (e) { return null; } }

  document.head.insertAdjacentHTML('beforeend', `<style>
    .stab { padding-bottom: 84px; }
    .vh { position: absolute; width: 1px; height: 1px; opacity: 0; overflow: hidden; pointer-events: none; }
    .cpl { display: flex; align-items: center; gap: 10px; width: 100%; text-align: left; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 14px; padding: 10px 12px; margin-bottom: 8px; }
    .cpl .grow { min-width: 0; } .cpl b { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .cpl .nt { font-weight: 900; font-size: 1.05em; white-space: nowrap; }
    .badge { display: inline-block; font-size: .72em; font-weight: 800; padding: 2px 8px; border-radius: 99px; background: var(--line); color: var(--ink); vertical-align: middle; }
    .badge.todo { background: #ffe9b8; } .badge.ok { background: #d9f6e2; } .badge.run { background: var(--accent-soft); color: var(--accent); } .badge.bad { background: #fde3e3; }
    .thumbs { display: grid; grid-template-columns: repeat(auto-fill, minmax(86px, 1fr)); gap: 8px; }
    .thumbs .th { position: relative; aspect-ratio: 3 / 4; border-radius: 10px; overflow: hidden; background: var(--line); border: 1px solid var(--line); }
    .thumbs img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumbs .x { position: absolute; top: 4px; right: 4px; width: 26px; height: 26px; border-radius: 50%; background: rgba(0,0,0,.6); color: #fff; font-size: .9em; line-height: 26px; padding: 0; }
    .thumbs .add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 4px; font-weight: 800; font-size: .8em; color: var(--accent); background: var(--accent-soft); border: 2px dashed var(--accent); }
    .exo { border: 1px solid var(--line); border-radius: 14px; padding: 12px; margin-bottom: 10px; background: var(--card); }
    .exo.juste { border-left: 5px solid #2fb560; } .exo.partiel { border-left: 5px solid #f0a020; } .exo.faux, .exo.non_fait { border-left: 5px solid #e04848; }
    .exo h4 { margin: 0 0 4px; font-size: 1em; } .exo p { margin: 6px 0; }
    .exo ol { margin: 6px 0; padding-left: 22px; } .exo li { margin: 3px 0; }
    .exo .rep { background: #e9f9ee; border-radius: 10px; padding: 8px 10px; font-weight: 800; }
    .exo .cs { background: var(--accent-soft); border-radius: 10px; padding: 8px 10px; }
    .exo label.ck { display: flex; gap: 8px; align-items: center; margin-top: 8px; font-weight: 800; }
    .spinner { width: 34px; height: 34px; border: 4px solid var(--line); border-top-color: var(--accent); border-radius: 50%; animation: cpspin 1s linear infinite; margin: 6px auto; }
    @keyframes cpspin { to { transform: rotate(360deg); } }
    .notes { display: flex; align-items: flex-end; gap: 6px; height: 110px; margin-top: 8px; }
    .notes > div { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 3px; min-width: 0; height: 100%; }
    .notes i { display: block; width: 100%; max-width: 34px; border-radius: 6px 6px 0 0; background: var(--accent); }
    .notes b { font-size: .72em; } .notes span { font-size: .62em; color: var(--muted); }
    .revrow { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-top: 1px solid var(--line); }
    .revrow:first-of-type { border-top: 0; } .revrow .grow { min-width: 0; } .revrow .bar { margin-top: 4px; }
    .revrow .btn { width: auto; min-height: 40px; padding: 8px 14px; font-size: .9em; }
    #cpView { position: fixed; inset: 0; z-index: 50; background: rgba(0,0,0,.92); display: flex; align-items: center; justify-content: center; }
    #cpView img { max-width: 100%; max-height: 100%; object-fit: contain; }
    #cpView button { position: absolute; top: calc(10px + env(safe-area-inset-top)); right: 12px; background: #fff; color: #000; border-radius: 99px; padding: 8px 14px; font-weight: 800; }
  </style>`);

  /* ---------- Données ---------- */
  let COPIES = null, COPIES_AT = 0, POLL = null;
  async function loadCopies(force) {
    if (!force && COPIES && Date.now() - COPIES_AT < 20000) return COPIES;
    try {
      const r = await rpc('rv_copies_list', { p_token: token });
      if (r && !r.error) { COPIES = r.copies || []; COPIES_AT = Date.now(); LS.set(kTok('rv_copies'), COPIES); }
    } catch (e) { if (!COPIES) COPIES = LS.get(kTok('rv_copies'), []); }
    return COPIES || [];
  }
  const copiesOf = (sid) => (COPIES || []).filter((c) => !sid || c.student === sid);
  const ctx = () => ({ skills: SKILLS.map((k) => ({ id: k.id, name: k.name, subj: k.subj || 'physique' })), codes: Object.assign({}, typeof ERR_LABELS !== 'undefined' ? ERR_LABELS : {}) });
  function stopPoll() { if (POLL) { clearTimeout(POLL); POLL = null; } }
  function pollIf(list, redraw) {
    stopPoll();
    if (!list.some((c) => c.status === 'analyse')) return;
    POLL = setTimeout(async () => { POLL = null; await loadCopies(true); redraw(); }, 6000);
  }
  const STATUS = {
    photos: ['badge', 'photos envoyées'], analyse: ['badge run', 'correction en cours…'],
    a_valider: ['badge todo', 'à vérifier'], validee: ['badge ok', 'corrigée'], erreur: ['badge bad', 'à reprendre'],
  };
  const statusFor = (c) => {
    if (isKid() && c.status === 'a_valider') return ['badge run', `vérification par ton parent`];
    if (role === 'parent' && c.status === 'a_valider') return ['badge todo', '👉 à vérifier'];
    return STATUS[c.status] || ['badge', c.status];
  };
  function copyRow(c) {
    const [cls, txt] = statusFor(c);
    return `<button class="cpl" data-cp="${c.id}"><span style="font-size:1.4em">📄</span><span class="grow"><b>${esc(c.label || 'Contrôle')}</b><span class="small muted">${dayTxt(c)} • ${c.n} photo${c.n > 1 ? 's' : ''} • <span class="${cls}">${txt}</span></span></span><span class="nt">${fmtNote(c)}</span><span>›</span></button>`;
  }
  function notesChart(list) {
    const dk = (c) => c.day || (c.created_at || '').slice(0, 10);
    const pts = list.filter((c) => c.note != null).sort((a, b) => dk(a) < dk(b) ? 1 : -1).slice(0, 8).reverse();
    if (pts.length < 2) return '';
    return `<p class="small" style="margin:10px 0 0"><b>Évolution des notes</b></p><div class="notes">${pts.map((c) => {
      const v = Math.max(0, Math.min(1, c.note / (c.max || 20)));
      return `<div><b>${fr(c.note / (c.max || 20) * 20, 1)}</b><i style="height:${Math.max(4, Math.round(v * 80))}px;background:${v >= .5 ? 'var(--good, #2fb560)' : 'var(--accent)'}"></i><span>${dayTxt(c).slice(0, 5)}</span></div>`;
    }).join('')}</div><p class="small muted" style="margin:4px 0 0">Notes ramenées sur 20.</p>`;
  }

  /* ---------- Photo : réduite sur l'appareil avant l'envoi (≈ 300 à 600 Ko) ---------- */
  function shrink(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file), img = new Image();
      img.onload = () => {
        const M = 1800, k = Math.min(1, M / Math.max(img.naturalWidth, img.naturalHeight));
        const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        res(c.toDataURL('image/jpeg', 0.82));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('image')); };
      img.src = url;
    });
  }
  async function sendFiles(c, files, after) {
    files = [...files].slice(0, 8 - (c.n || 0));
    if (!files.length) return toast('8 photos au maximum par copie.');
    for (let i = 0; i < files.length; i++) {
      toast(`Envoi de la photo ${i + 1} sur ${files.length}…`);
      try {
        const data = await shrink(files[i]);
        const r = await call({ action: 'add', id: c.id, data });
        if (r.error) { toast(r.error === 'max' ? '8 photos au maximum.' : r.error === 'locked' ? 'Cette copie est déjà corrigée.' : 'Cette photo n’a pas pu être envoyée.'); break; }
        c.n = r.n;
      } catch (e) { toast('Photo illisible ou pas de connexion.'); break; }
    }
    toast('Photos enregistrées ✓');
    await loadCopies(true); after();
  }
  function pickers() {
    return `<input type="file" accept="image/*" capture="environment" id="cpCam" class="vh">
      <input type="file" accept="image/*" multiple id="cpLib" class="vh">`;
  }

  /* ---------- Correction (affichage commun élève / parent) ---------- */
  function exoHtml(e, i, mode) {
    const icon = { juste: '✅', partiel: '⚠️', faux: '❌', non_fait: '⏭️' }[e.statut] || '•';
    const sk = skillById(e.competence);
    const ok = e.statut === 'juste';
    return `<div class="exo ${esc(e.statut || '')}">
      <h4>${icon} Exercice ${esc(e.num || i + 1)}${e.points ? ` <span class="small muted">(${esc(e.points)})</span>` : ''}</h4>
      ${e.sujet ? `<p class="small muted" style="margin-top:0">${esc(e.sujet)}</p>` : ''}
      ${ok ? (e.conseil ? `<p class="small">${esc(e.conseil)}</p>` : '') : `
        ${e.ecrit ? `<p><b>${mode === 'kid' ? 'Ce que tu as écrit' : 'Sur la copie'} :</b> ${esc(e.ecrit)}</p>` : ''}
        ${e.erreur ? `<p><b>Ce qui n’allait pas :</b> ${esc(e.erreur)}</p>` : ''}
        ${(e.etapes || []).length ? `<p style="margin-bottom:2px"><b>La bonne méthode, pas à pas :</b></p><ol>${e.etapes.map((s) => `<li>${esc(s)}</li>`).join('')}</ol>` : ''}
        ${e.reponse ? `<p class="rep">✔️ ${esc(e.reponse)}</p>` : ''}
        ${e.conseil ? `<p class="cs">💡 ${esc(e.conseil)}</p>` : ''}
        ${e.incertain ? '<p class="small muted">⚠️ Passage difficile à lire sur la photo : à vérifier.</p>' : ''}
        ${sk ? `<p class="small muted" style="margin-bottom:0">${sk.icon} ${esc(sk.name)}</p>` : ''}
        ${mode === 'kid' && canTrain(e.competence) && !PREVIEW ? `<button class="btn ghost" data-train="${e.competence}" style="margin-top:8px">🎯 M’entraîner sur ce point</button>` : ''}
        ${mode === 'check' ? `<label class="ck"><input type="checkbox" data-keep="${i}" ${canTrain(e.competence) ? 'checked' : 'disabled'}> ${canTrain(e.competence) ? 'Envoyer en révision' : '<span class="small muted">Pas encore d’exercices dans l’appli pour ce point</span>'}</label>` : ''}`}
    </div>`;
  }
  function correctionHtml(a, mode) {
    const ex = a.exercices || [];
    const nOk = ex.filter((e) => e.statut === 'juste').length;
    return `${a.resume ? `<div class="card"><p style="margin:0">${esc(a.resume)}</p></div>` : ''}
      ${mode !== 'kid' && a.mot_parent ? `<div class="tip">💡 ${esc(a.mot_parent)}</div>` : ''}
      <h3 style="margin:14px 4px 8px">${ex.length} exercice${ex.length > 1 ? 's' : ''} • ${nOk} réussi${nOk > 1 ? 's' : ''}</h3>
      ${ex.map((e, i) => exoHtml(e, i, mode)).join('')}
      ${(a.points_forts || []).length ? `<div class="card stack"><h3>👍 Ce qui est réussi</h3><ul style="margin:0;padding-left:20px">${a.points_forts.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div>` : ''}
      ${(a.a_retravailler || []).length ? `<div class="card stack"><h3>🎯 À retravailler</h3><ul style="margin:0;padding-left:20px">${a.a_retravailler.map((p) => { const k = skillById(p.competence); return `<li>${k ? `<b>${k.icon} ${esc(k.name)}</b> : ` : ''}${esc(p.pourquoi || '')}</li>`; }).join('')}</ul></div>` : ''}`;
  }

  /* ---------- Écran d'une copie ---------- */
  async function screenCopy(id, back) {
    stopPoll();
    await loadCopies();
    const c = (COPIES || []).find((x) => x.id === id);
    if (!c) { toast('Copie introuvable.'); return back(); }
    const parent = role === 'parent' && !PREVIEW, kid = !parent;
    const who = parent ? childName(curChild()) : 'toi';
    const editable = !['validee', 'analyse'].includes(c.status) && !(kid && c.status === 'a_valider') && !PREVIEW;
    const a = c.analysis || {};
    let body = '';
    if (c.status === 'analyse') body = `<div class="card center stack"><div class="spinner"></div><b>L’application relit la copie…</b><p class="small muted" style="margin:0">Compte 1 à 2 minutes. Tu peux quitter cet écran : ${parent ? 'tu recevras un e-mail quand ce sera prêt' : 'ton parent sera prévenu'}.</p></div>`;
    else if (c.status === 'validee') body = correctionHtml(a, kid ? 'kid' : 'view');
    else if (c.status === 'a_valider') body = parent
      ? `<div class="tip">👀 <b>Vérifie la relecture</b> : décoche une erreur si elle te paraît fausse, puis valide. ${esc(who)} verra ensuite la correction pas à pas, et les erreurs cochées reviendront dans ses révisions.</div>${correctionHtml(a, 'check')}
         <button class="btn" id="cpOk">✅ Valider et envoyer à ${esc(who)}</button>`
      : `<div class="card"><p style="margin:0">🕵️ La correction est prête : ton parent la vérifie. Tu la retrouveras ici, avec les exercices pour t’entraîner.</p></div>`;
    else if (c.status === 'erreur') body = `<div class="card stack"><p style="margin:0">😕 La relecture n’a pas marché${a.lisible === false ? ' : les photos ne ressemblent pas à une copie' : ''}. Reprends les photos bien à plat, avec de la lumière, puis relance.</p>
        ${(a.tries || 0) < 4 && editable ? '<button class="btn" id="cpGo">🔁 Relancer la correction</button>' : ''}</div>`;
    else body = `<div class="card stack"><p style="margin:0">${c.n ? `${c.n} photo${c.n > 1 ? 's' : ''} prête${c.n > 1 ? 's' : ''}. Ajoute toutes les pages, puis lance la correction.` : 'Prends en photo chaque page de la copie corrigée, bien à plat et lisible.'}</p>
        ${c.n && editable ? `<button class="btn" id="cpGo">${kid ? '📨 Envoyer pour correction' : '✨ Lancer la correction'}</button>` : ''}</div>`;
    render(`<div class="${kid ? 'stab' : 'pz'}">
      <button class="link" id="cpBack">← Retour</button>
      <div class="ptitle"><h1>${esc(c.label || 'Contrôle')}</h1><span class="small muted">${dayTxt(c)}</span></div>
      <div class="card stack">
        <div class="row between"><b>${c.note != null ? `Note : ${fmtNote(c)}` : 'Note pas encore saisie'}</b>${!PREVIEW && (parent || c.status !== 'validee') ? '<button class="link" id="cpEdit">Modifier</button>' : ''}</div>
        <div class="thumbs" id="cpThumbs">${Array.from({ length: c.n }, (_, i) => `<div class="th" data-i="${i}"><span class="small muted" style="display:block;padding:8px">…</span></div>`).join('')}
          ${editable && c.n < 8 ? '<button class="th add" id="cpAdd"><span style="font-size:1.6em">📷</span>Ajouter</button>' : ''}</div>
      </div>
      ${body}
      ${parent || (c.by === 'student' && c.status !== 'validee') ? '<button class="link danger" id="cpDel" style="margin-top:8px">Supprimer cette copie</button>' : ''}
      ${pickers()}
    </div>${kid ? kidBar('ctrl') : ''}`);
    bindKidBar();
    const redraw = () => screenCopy(id, back);
    onId('cpBack', () => { stopPoll(); back(); });
    // photos (liens temporaires)
    if (c.n) call({ action: 'photos', id }).then((r) => {
      (r.urls || []).forEach((u, i) => {
        const el = document.querySelector(`#cpThumbs [data-i="${i}"]`); if (!el || !u) return;
        el.innerHTML = `<img src="${u}" alt="Page ${i + 1}">${editable ? `<button class="x" data-rm="${i}" aria-label="Retirer">✕</button>` : ''}`;
        el.querySelector('img').onclick = () => { document.body.insertAdjacentHTML('beforeend', `<div id="cpView"><img src="${u}" alt=""><button>Fermer</button></div>`); document.getElementById('cpView').onclick = () => document.getElementById('cpView').remove(); };
        const x = el.querySelector('[data-rm]'); if (x) x.onclick = async (ev) => { ev.stopPropagation(); if (!await ask({ title: 'Retirer cette photo ?', ok: 'Retirer', danger: true })) return; const r2 = await call({ action: 'del', id, index: i }); if (r2.error) toast('Impossible pour l’instant.'); await loadCopies(true); redraw(); };
      });
    }).catch(() => {});
    onId('cpAdd', () => {
      ask({ title: 'Ajouter une page', cancel: false, ok: 'Fermer',
        html: '<p class="small" style="margin:0">Pose la feuille bien à plat, près d’une fenêtre, et cadre toute la page.</p><label class="btn" for="cpCam">📷 Prendre une photo</label><label class="btn ghost" for="cpLib">🖼️ Choisir dans mes photos</label>' });
    });
    ['cpCam', 'cpLib'].forEach((k) => { const inp = document.getElementById(k); if (inp) inp.onchange = () => { const m = document.getElementById('ask'); if (m) m.remove(); if (inp.files.length) sendFiles(c, inp.files, redraw); }; });
    onId('cpGo', async () => {
      const r = await call({ action: 'analyse', id, ctx: ctx() });
      if (r.error === 'nokey') { toast(kid ? 'Copie envoyée à ton parent ✓' : 'Copie enregistrée. La correction automatique n’est pas encore activée.'); }
      else if (r.error) toast(r.error === 'tries' ? 'Trop d’essais pour cette copie : ajoute l’erreur à la main.' : r.error === 'nophoto' ? 'Ajoute au moins une photo.' : 'Impossible pour l’instant.');
      await loadCopies(true); redraw();
    });
    onId('cpEdit', async () => {
      const v = await ask({ title: 'Titre et note', html: `<label class="small" for="ceL"><b>Titre</b></label><input class="field" id="ceL" maxlength="120" value="${esc(c.label || '')}">
        <label class="small" for="ceN"><b>Note</b></label><div class="row" style="gap:8px"><input class="field" id="ceN" inputmode="decimal" value="${c.note != null ? String(c.note).replace('.', ',') : ''}" placeholder="Ex. : 8,5"><span>/</span><input class="field" id="ceM" inputmode="decimal" value="${fr(c.max || 20, 2)}" style="max-width:90px"></div>`, ok: 'Enregistrer' });
      if (!v) return;
      const num = (s) => { const n = parseFloat(String(s || '').replace(',', '.')); return isNaN(n) ? null : n; };
      await rpc('rv_copy_set', { p_token: token, p_id: id, p_label: (document.getElementById('ceL') || {}).value || c.label, p_note: num((document.getElementById('ceN') || {}).value), p_max: num((document.getElementById('ceM') || {}).value) }).catch(() => {});
      await loadCopies(true); redraw();
    });
    onId('cpOk', async () => {
      const keep = [...document.querySelectorAll('[data-keep]:checked')].map((x) => +x.dataset.keep);
      const items = keep.map((i) => { const e = a.exercices[i]; return { skill: e.competence, code: e.code || 'copie', label: `${c.label || 'Contrôle'} – exo ${e.num || i + 1}${e.sujet ? ' : ' + e.sujet : ''}`.slice(0, 120) }; });
      const r = await rpc('rv_copy_validate', { p_token: token, p_id: id, p_items: items, p_keep: keep }).catch(() => ({ error: 'net' }));
      if (r.error) return toast('Impossible pour l’instant.');
      toast(`Validé ✓ ${r.n} point${r.n > 1 ? 's' : ''} ajouté${r.n > 1 ? 's' : ''} aux révisions`);
      await loadCopies(true); DASH_AT = 0; redraw();
    });
    onId('cpDel', async () => {
      if (!await ask({ title: 'Supprimer cette copie ?', text: 'Les photos sont effacées. Les erreurs déjà envoyées en révision restent.', ok: 'Supprimer', danger: true })) return;
      const r = await call({ action: 'remove', id });
      if (r.error) return toast('Impossible pour l’instant.');
      await loadCopies(true); toast('Supprimée'); back();
    });
    $app.querySelectorAll('[data-train]').forEach((b) => b.onclick = () => { stopPoll(); startRun('focus', b.dataset.train); });
    pollIf([c], redraw);
  }

  /* ---------- Nouvelle copie ---------- */
  async function newCopy(child, back) {
    const t = todayStr();
    const plan = isKid() ? PLAN : childPlan(curChild());
    const past = plan.filter((p) => p.kind === 'exam' && p.day && p.day <= t && dayDiff(p.day, t) <= 45).sort((a, b) => a.day < b.day ? 1 : -1);
    const opts = past.map((p) => `<option value="${p.id}" data-day="${p.day}" data-l="${esc(p.label || 'Contrôle')}">${fmtD(p.day)} • ${esc(p.label || 'Contrôle')}</option>`).join('');
    const v = await ask({ title: '📸 Ajouter une copie corrigée', html: `
      ${past.length ? `<label class="small" for="ncE"><b>Quel contrôle ?</b></label><select class="field" id="ncE">${opts}<option value="">Un autre contrôle</option></select>` : ''}
      <div id="ncOther" ${past.length ? 'hidden' : ''} class="stack">
        <label class="small" for="ncL"><b>Titre</b> <span class="muted">(facultatif)</span></label><input class="field" id="ncL" maxlength="120" placeholder="Ex. : vitesse et distance d’arrêt">
        <label class="small" for="ncD"><b>Date du contrôle</b></label><input class="field" type="date" id="ncD" max="${t}" value="${t}"></div>
      <label class="small" for="ncN"><b>Note</b> <span class="muted">(facultatif, sinon l’application la lira sur la copie)</span></label>
      <div class="row" style="gap:8px"><input class="field" id="ncN" inputmode="decimal" placeholder="Ex. : 8,5"><span>/</span><input class="field" id="ncM" inputmode="decimal" value="20" style="max-width:90px"></div>`,
      ok: 'Continuer : les photos' });
    if (!v) return;
    const num = (s) => { const n = parseFloat(String(s || '').replace(',', '.')); return isNaN(n) ? null : n; };
    // ask() retire la fenêtre : on a lu les champs juste avant (voir hook plus bas)
    const f = LAST_FORM || {};
    let exam = f.exam || null, label = f.label, day = f.day;
    const r = await rpc('rv_copy_create', { p_token: token, p_child: child || null, p_label: label || null, p_day: day || t, p_note: num(f.note), p_max: num(f.max) || 20, p_exam: exam }).catch(() => ({ error: 'net' }));
    if (r.error) return toast(r.error === 'auth' ? (role === 'test' ? 'Pas disponible sur le profil de test.' : 'Reconnecte-toi.') : r.error === 'limit' ? '10 copies par jour au maximum.' : 'Impossible pour l’instant (pas de connexion ?).');
    await loadCopies(true);
    screenCopy(r.id, back);
    setTimeout(() => { const cam = document.getElementById('cpAdd'); if (cam) cam.click(); }, 250);
  }
  // Lecture des champs de la fenêtre « nouvelle copie » au moment où on touche « Continuer »
  let LAST_FORM = null;
  document.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'askok' && document.getElementById('ncN')) {
      const sel = document.getElementById('ncE'), o = sel && sel.selectedOptions[0];
      LAST_FORM = o && o.value ? { exam: o.value, label: o.dataset.l, day: o.dataset.day } : { label: document.getElementById('ncL').value.trim(), day: document.getElementById('ncD').value };
      LAST_FORM.note = document.getElementById('ncN').value; LAST_FORM.max = document.getElementById('ncM').value;
    }
  }, true);
  document.addEventListener('change', (e) => { if (e.target && e.target.id === 'ncE') document.getElementById('ncOther').hidden = !!e.target.value; });

  /* ---------- Élève : barre d'onglets ---------- */
  function kidBar(on) {
    return `<nav class="tabbar">${[['home', '🏠', 'Accueil'], ['cours', '📚', 'Mes cours'], ['ctrl', '📅', 'Contrôles']].map(([k, i, l]) => `<button data-ktab="${k}" class="${on === k ? 'on' : ''}" ${on === k ? 'aria-current="page"' : ''}><span>${i}</span>${l}${k === 'ctrl' && kidBadge() ? ' <i class="badge todo" style="font-style:normal">' + kidBadge() + '</i>' : ''}</button>`).join('')}</nav>`;
  }
  function kidBadge() {
    const e = typeof nextExam === 'function' ? nextExam() : null;
    const fresh = (COPIES || []).filter((c) => c.status === 'validee' && !(S && (S.copiesSeen || []).includes(c.id))).length;
    return fresh || (e && e.days <= 7 ? '!' : '');
  }
  function bindKidBar() {
    $app.querySelectorAll('[data-ktab]').forEach((b) => b.onclick = () => { stopPoll(); const k = b.dataset.ktab; if (k === 'home') screenHome(); else if (k === 'cours') screenCours(); else screenKidCtrl(); });
  }
  function addBar(on) {
    if ($app.querySelector('.tabbar')) return;
    $app.insertAdjacentHTML('beforeend', '<div style="height:84px"></div>' + kidBar(on));
    bindKidBar();
    document.body.classList.add('has-tabbar');
  }
  const baseHome = screenHome;
  screenHome = function () { stopPoll(); baseHome.apply(this, arguments); try { addBar('home'); } catch (e) {} if (!COPIES && (isKid() || PREVIEW)) loadCopies().then(() => { const b = $app.querySelector('[data-ktab="ctrl"]'); if (b && kidBadge()) { $app.querySelector('.tabbar').outerHTML = kidBar('home'); bindKidBar(); } }); };
  const baseCours = screenCours;
  screenCours = function () { stopPoll(); baseCours.apply(this, arguments); try { addBar('cours'); } catch (e) {} };

  /* ---------- Élève : onglet Contrôles ---------- */
  function revRow(id, why) {
    const k = skillById(id); if (!k) return '';
    const m = (S.mastery || {})[id] || 0;
    return `<div class="revrow"><span style="font-size:1.4em">${k.icon}</span><div class="grow"><b>${esc(k.name)}</b>${why ? `<br><span class="small muted">${esc(why)}</span>` : ''}<div class="bar"><i style="width:${m}%"></i></div></div>
      ${canTrain(id) && !PREVIEW ? `<button class="btn ghost" data-train="${id}">S’entraîner</button>` : medalHtml(m)}</div>`;
  }
  async function screenKidCtrl() {
    stopPoll();
    const sid = PREVIEW ? (curChildSafe() || {}).id : null;
    if (!COPIES) render(`<div class="stab"><p class="center muted" style="margin-top:40px">Chargement…</p></div>${kidBar('ctrl')}`);
    await loadCopies();
    const list = PREVIEW ? copiesOf(sid) : copiesOf();
    if (S && !PREVIEW) { S.copiesSeen = [...new Set([...(S.copiesSeen || []), ...list.filter((c) => c.status === 'validee').map((c) => c.id)])]; saveState(); }
    const ex = exams().map((e) => Object.assign({ days: dayDiff(todayStr(), e.day) }, e));
    // À revoir : erreurs des copies corrigées + compétences du prochain contrôle, tant que la médaille argent n'est pas acquise
    const fromCopies = {};
    list.filter((c) => c.status === 'validee' && c.analysis).forEach((c) => {
      (c.analysis.a_retravailler || []).forEach((p) => { if (skillById(p.competence) && !fromCopies[p.competence]) fromCopies[p.competence] = `${c.label || 'Contrôle'} : ${p.pourquoi || ''}`; });
      (c.analysis.exercices || []).forEach((e) => { if (e.statut !== 'juste' && skillById(e.competence) && !fromCopies[e.competence]) fromCopies[e.competence] = `Erreur au contrôle « ${c.label || ''} »`; });
    });
    const toRev = Object.keys(fromCopies).filter((k) => (S.mastery[k] || 0) < 70).sort((a, b) => (S.mastery[a] || 0) - (S.mastery[b] || 0));
    const next = ex[0];
    const nextSk = next ? (next.skills && next.skills.length ? next.skills : SKILLS.map((k) => k.id)).filter((k) => skillById(k) && (!next.skills || !next.skills.length ? skillActive(k) : true)).sort((a, b) => (S.mastery[a] || 0) - (S.mastery[b] || 0)) : [];
    render(`<div class="stab">
      <div class="ptitle"><h1>Mes contrôles</h1></div>
      <div class="card stack">
        <h2>📅 À venir</h2>
        ${ex.length ? ex.map((e) => `<div class="row between" style="gap:8px"><div><b>${fmtD(e.day)}</b> • ${esc(e.label || 'Contrôle')}<br><span class="small muted">${examWhen(e)}</span></div>
          ${!PREVIEW && e.student ? `<button class="more" data-off="${e.id}" aria-label="Retirer">⋯</button>` : ''}</div>`).join('')
          : `<p class="small muted" style="margin:0">Aucun contrôle prévu. Dès que ton prof en annonce un, ajoute-le : l’appli te prépare un programme spécial les 7 jours d’avant.</p>`}
        ${PREVIEW ? '' : `<details><summary><b>+ Ajouter un contrôle annoncé</b></summary><div class="stack" style="margin-top:10px">
          <label class="small" for="kxD"><b>Date</b></label><input class="field" type="date" id="kxD" min="${todayStr()}">
          <label class="small" for="kxS"><b>Matière</b></label><select class="field" id="kxS"><option value="physique">⚡ Physique</option><option value="chimie">⚗️ Chimie</option><option value="mix">Les deux</option></select>
          <label class="small" for="kxL"><b>Sur quoi ?</b> <span class="muted">(ce que le prof a dit)</span></label><input class="field" id="kxL" maxlength="120" placeholder="Ex. : la vitesse, l’atome…">
          <button class="btn" id="kxAdd">Enregistrer</button></div></details>`}
      </div>
      ${next ? `<div class="card stack"><h2>📝 À réviser pour le ${fmtD(next.day)}</h2><p class="small muted" style="margin:0">Du moins maîtrisé au plus maîtrisé.${next.days <= 2 ? ' C’est le moment du <b>contrôle blanc</b> !' : ''}</p>
        ${nextSk.slice(0, 6).map((k) => revRow(k)).join('')}
        ${next.days <= 7 && !PREVIEW ? '<button class="btn" id="kxBoss">👾 Faire un contrôle blanc</button>' : ''}</div>` : ''}
      ${toRev.length ? `<div class="card stack"><h2>🎯 À revoir avant le prochain contrôle</h2><p class="small muted" style="margin:0">Ce qui t’a posé problème sur tes copies. Ça disparaît quand tu as la médaille d’argent.</p>${toRev.map((k) => revRow(k, fromCopies[k])).join('')}</div>` : ''}
      <div class="card stack">
        <h2>📸 Mes copies</h2>
        <p class="small muted" style="margin:0">Ton prof t’a rendu une copie ? Prends-la en photo : l’appli t’explique tes erreurs pas à pas et te fait t’entraîner dessus.</p>
        ${list.map(copyRow).join('')}
        ${PREVIEW ? '' : '<button class="btn" id="kcNew">📷 Ajouter une copie corrigée</button>'}
        ${notesChart(list)}
      </div>
    </div>${kidBar('ctrl')}`);
    bindKidBar();
    onId('kcNew', () => newCopy(null, screenKidCtrl));
    onId('kxBoss', () => startRun('boss'));
    $app.querySelectorAll('[data-cp]').forEach((b) => b.onclick = () => screenCopy(b.dataset.cp, screenKidCtrl));
    $app.querySelectorAll('[data-train]').forEach((b) => b.onclick = () => startRun('focus', b.dataset.train));
    onId('kxAdd', async () => {
      const day = document.getElementById('kxD').value; if (!day) return toast('Choisis la date du contrôle.');
      const sj = document.getElementById('kxS').value;
      const skills = sj === 'mix' ? [] : SKILLS.filter((k) => (k.subj || 'physique') === sj).map((k) => k.id);
      const label = document.getElementById('kxL').value.trim() || `Contrôle de ${subjLabel(sj)}`;
      const r = await rpc('rv_exam_add_self', { p_token: token, p_day: day, p_label: label, p_skills: skills }).catch(() => ({ error: 'net' }));
      if (r.error) return toast(role === 'test' ? 'Pas disponible sur le profil de test.' : r.error === 'net' ? 'Pas de connexion internet.' : 'Impossible pour l’instant.');
      PLAN.push({ id: r.id, kind: 'exam', day, label, skills, student: true, created_at: new Date().toISOString() });
      LS.set('rv_plan_' + token.slice(0, 8), PLAN);
      toast('Contrôle ajouté ✓ Ton parent le verra aussi.'); screenKidCtrl();
    });
    $app.querySelectorAll('[data-off]').forEach((b) => b.onclick = async () => {
      if (!await ask({ title: 'Retirer ce contrôle ?', ok: 'Retirer', danger: true })) return;
      const r = await rpc('rv_exam_off_self', { p_token: token, p_id: b.dataset.off }).catch(() => ({ error: 1 }));
      if (r.error || !r.ok) return toast('Seul ton parent peut retirer ce contrôle.');
      PLAN = PLAN.filter((p) => p.id !== b.dataset.off); LS.set('rv_plan_' + token.slice(0, 8), PLAN); screenKidCtrl();
    });
    pollIf(list, () => { if (document.getElementById('kcNew') || PREVIEW) screenKidCtrl(); });
  }

  /* ---------- Parent : carte « Copies » en tête de l'onglet Contrôles ---------- */
  function parentCard(st) {
    const list = copiesOf(st.id), name = childName(st);
    const todo = list.filter((c) => c.status === 'a_valider').length;
    return `<div class="card stack">
      <h2>📸 Copies de ${esc(name)} ${todo ? `<span class="badge todo">${todo} à vérifier</span>` : ''}</h2>
      <p class="small muted" style="margin:0">Prends en photo la copie corrigée : l’application relève les erreurs et explique la bonne méthode. Tu vérifies, puis ${esc(name)} retrouve la correction et s’entraîne sur ses erreurs. ${esc(name)} peut aussi ajouter ses copies depuis son appli.</p>
      ${COPIES ? list.map(copyRow).join('') : '<p class="small muted">Chargement…</p>'}
      <button class="btn" id="pcNew">📷 Ajouter une copie corrigée</button>
      ${notesChart(list)}
    </div>`;
  }
  const baseTab = tabControles;
  tabControles = function (st) {
    let h = baseTab.apply(this, arguments);
    h = h.replace(/<div class="tip">📸 <b>Le plus simple :<\/b>[\s\S]*?<\/div>/, '');
    h = h.replace('<h2>📝 Erreurs relevées sur les copies</h2>', '<h2>📝 Erreurs envoyées en révision</h2>');
    return h.replace(/(<div class="ptitle">[\s\S]*?<\/div>)/, `$1<div id="pcSlot">${parentCard(st)}</div>`);
  };
  const backParent = () => { PV.tab = 'controles'; savePV(); screenParent(); };
  function bindParentCopies(st) {
    onId('pcNew', () => newCopy(st.id, backParent));
    $app.querySelectorAll('#pcSlot [data-cp]').forEach((b) => b.onclick = () => screenCopy(b.dataset.cp, backParent));
    pollIf(copiesOf(st.id), () => { if (document.getElementById('pcSlot') && PV.tab === 'controles') drawParent(); });
  }
  const baseDraw = drawParent;
  drawParent = function () {
    baseDraw.apply(this, arguments);
    if (PV.tab !== 'controles' || !document.getElementById('pcSlot')) { stopPoll(); return; }
    const st = curChild(); if (!st) return;
    bindParentCopies(st);
    if (!COPIES || Date.now() - COPIES_AT > 20000) loadCopies(true).then(() => {
      const slot = document.getElementById('pcSlot'); if (!slot || PV.tab !== 'controles') return;
      slot.innerHTML = parentCard(curChild()); bindParentCopies(curChild());
    });
  };

  /* Si un écran était déjà affiché avant ce fichier, on le redessine */
  if (typeof S !== 'undefined' && S && S.pseudo && !RUN && $app.querySelector('.acts')) screenHome();
  else if (role === 'parent' && typeof DASH !== 'undefined' && DASH && $app.querySelector('.tabbar')) drawParent();
})();
