/* =========================================================
   Appli de révision — moteur, gamification, sauvegarde
   ========================================================= */
const CFG = {
  url: 'https://mqxotaaqhonxbficrkgc.supabase.co',
  key: 'sb_publishable_E9x0n75JMUYa8OwjL4ncpw_ZfDZ74ad',
};
const $app = document.getElementById('app');
const LS = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem(k); } catch (e) {} },
};
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const stripTags = (h) => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent || ''; };
const todayStr = () => { const d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const dayDiff = (a, b) => Math.round((new Date(b + 'T12:00') - new Date(a + 'T12:00')) / 86400000);
const weekId = () => { const d = new Date(); const m = new Date(d); m.setDate(d.getDate() - ((d.getDay() + 6) % 7)); return m.toISOString().slice(0, 10); };

/* ---------- API ---------- */
async function rpc(fn, args) {
  const r = await fetch(`${CFG.url}/rest/v1/rpc/${fn}`, {
    method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}
const APP_NAME = 'Révisions physique';
const APP_TAG = 'La physique de 3e, une séance après l’autre.';
const MAIL_FN = `${CFG.url}/functions/v1/rv-mail`;
async function mailFn(body) {
  const r = await fetch(MAIL_FN, { method: 'POST', headers: { apikey: CFG.key, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  return r.json();
}
/* Profils enregistrés sur cet appareil (un parent, un ou plusieurs enfants) */
let ACCTS = LS.get('rv_accts', null);
if (!ACCTS) {
  ACCTS = [];
  const t = LS.get('rv_token', null), r = LS.get('rv_role', null);
  if (t) {
    ACCTS.push({ token: t, role: r, name: r === 'parent' ? 'Espace parent' : 'Élève', pin: false });
    const k = t.slice(0, 8);
    if (LS.get('rv_state', null)) { LS.set('rv_state_' + k, LS.get('rv_state', null)); LS.del('rv_state'); }
    if (LS.get('rv_queue', null)) { LS.set('rv_queue_' + k, LS.get('rv_queue', null)); LS.del('rv_queue'); }
  }
  LS.set('rv_accts', ACCTS);
}
let token = LS.get('rv_token', null);
let role = LS.get('rv_role', null);
if (token && !ACCTS.find((a) => a.token === token)) { token = null; role = null; }
const kState = () => 'rv_state_' + (token || '').slice(0, 8);
const kQueue = () => 'rv_queue_' + (token || '').slice(0, 8);
const kAct = () => 'rv_act_' + (token || '').slice(0, 8);
const curAcct = () => ACCTS.find((a) => a.token === token) || {};
function saveAccts() { LS.set('rv_accts', ACCTS); }
function useAcct(a) {
  token = a.token; role = a.role; LS.set('rv_token', token); LS.set('rv_role', role);
  queue = LS.get(kQueue(), []); S = null; PLAN = [];
}
function addAcct(a) {
  ACCTS = ACCTS.filter((x) => x.token !== a.token);
  ACCTS.push(a); saveAccts(); useAcct(a); UNLOCKED = true; boot();
}
let UNLOCKED = false; // sur un appareil à plusieurs profils, choix du profil (et code de l'enfant) à chaque ouverture
function deviceLabel() {
  const u = navigator.userAgent || '';
  if (/iPad/.test(u) || (/Macintosh/.test(u) && navigator.maxTouchPoints > 1)) return 'iPad';
  if (/iPhone/.test(u)) return 'iPhone';
  if (/Android/.test(u)) return /Mobile/.test(u) ? 'Téléphone Android' : 'Tablette Android';
  if (/CrOS/.test(u)) return 'Chromebook';
  if (/Macintosh/.test(u)) return 'Mac';
  if (/Windows/.test(u)) return 'PC Windows';
  if (/Linux/.test(u)) return 'Ordinateur Linux';
  return 'Appareil';
}
/* E-mail au parent quand l'enfant commence une séance (après 30 min sans activité) */
function touchAct() { if (token && role === 'student') LS.set(kAct(), Date.now()); }
function notifySession() {
  if (PREVIEW || role !== 'student' || !token) return;
  const last = LS.get(kAct(), 0);
  touchAct();
  if (Date.now() - last < 30 * 60000) return;
  mailFn({ action: 'session', token }).catch(() => {});
}
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S && !PREVIEW) notifySession(); });
let S = null; // état élève
let PREVIEW = false; // le parent regarde l'appli comme l'élève (rien n'est enregistré)
let saveTimer = null;

function defaultState() {
  const mastery = {}; SKILLS.forEach((s) => (mastery[s.id] = 0));
  return { v: 1, pseudo: null, xp: 0, mastery, diagDone: false, diag: null, streak: { count: 0, last: null, jokers: 1, jokerWeek: null },
    cards: [], boss: { best: null, history: [] }, sessions: 0, timeMs: 0, seenFiche: {}, large: false, batDone: 0, cours: {},
    review: [], okDays: {}, lastPrac: {}, decayDay: null, onboard: 0, diagParts: [], copieSeen: [], redacLv: {} };
}
const addDays = (d, n) => { const x = new Date(d + 'T12:00'); x.setDate(x.getDate() + n); return x.getFullYear() + '-' + String(x.getMonth() + 1).padStart(2, '0') + '-' + String(x.getDate()).padStart(2, '0'); };

/* ---------- Contrôles et copies (saisis dans l'espace parent) ---------- */
let PLAN = [];
function exams() { const t = todayStr(); return PLAN.filter((p) => p.kind === 'exam' && p.day && p.day >= t).sort((a, b) => a.day < b.day ? -1 : 1); }
function nextExam() { const e = exams()[0]; return e ? Object.assign({ days: dayDiff(todayStr(), e.day) }, e) : null; }
function examSkills(within) { return [...new Set(exams().filter((e) => dayDiff(todayStr(), e.day) <= (within || 14)).flatMap((e) => e.skills || []))]; }

/* ---------- Compétences actives : celles des leçons « en avance » se débloquent avec la leçon ---------- */
function skillActive(id) {
  const s = SKILLS.find((x) => x.id === id);
  if (!s || !s.lesson) return true;
  return !!(S.cours && S.cours[s.lesson] && S.cours[s.lesson].done) || examSkills().includes(id);
}
const activeSkills = () => SKILLS.filter((s) => skillActive(s.id)).map((s) => s.id);

/* ---------- Révision espacée : chaque erreur revient à J+1, J+3, J+7, J+21 ---------- */
const RV_INT = [1, 3, 7, 21];
function addReview(skill, level, code, opt) {
  opt = opt || {};
  S.review = S.review || [];
  const key = (opt.redac ? 'r' : '') + skill + '|' + (code || 'autre');
  const due = opt.today ? todayStr() : addDays(todayStr(), 1);
  const ex = S.review.find((r) => r.key === key);
  if (ex) { ex.step = 0; ex.due = due; ex.level = Math.min(ex.level, level || 1); if (opt.src === 'copie') { ex.src = 'copie'; ex.label = opt.label; } return; }
  S.review.push({ id: uid(), key, skill, level: Math.max(1, Math.min(3, level || 1)), code: code || 'autre', redac: !!opt.redac, src: opt.src || 'seance', label: opt.label || '', due, step: 0 });
  if (S.review.length > 40) S.review.shift();
}
function dueReviews(skills) {
  const t = todayStr();
  return (S.review || []).filter((r) => r.due <= t && skillActive(r.skill) && (!skills || skills.includes(r.skill)))
    .sort((a, b) => (a.src === 'copie' ? -1 : 0) - (b.src === 'copie' ? -1 : 0) || (a.due < b.due ? -1 : 1));
}
function reviewResult(id, ok) {
  const r = (S.review || []).find((x) => x.id === id); if (!r) return;
  if (ok) { r.step++; if (r.step >= RV_INT.length) S.review = S.review.filter((x) => x.id !== id); else r.due = addDays(todayStr(), RV_INT[r.step]); }
  else { r.step = 0; r.due = addDays(todayStr(), 1); }
}
function itemFromReview(r) {
  const it = r.redac ? genRedac(r.skill, r.level) : generate(r.skill, r.level);
  it.reviewId = r.id; it.fromCopie = r.src === 'copie'; it.copieLabel = r.label;
  return it;
}
function saveState() {
  if (PREVIEW) return;
  LS.set(kState(), S);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { const r = await rpc('rv_save_state', { p_token: token, p_state: S }); if (r.error === 'auth') logout(true); } catch (e) { /* hors ligne : on réessaiera */ }
  }, 700);
}
let queue = token ? LS.get(kQueue(), []) : [];
async function logAttempt(a) {
  if (PREVIEW) return;
  queue.push(Object.assign({ ts: new Date().toISOString() }, a));
  LS.set(kQueue(), queue); touchAct();
  flush();
}
let flushing = false;
async function flush() {
  if (flushing || !queue.length || !token) return;
  flushing = true;
  try {
    const batch = queue.slice(0, 40);
    const r = await rpc('rv_log', { p_token: token, p_items: batch });
    if (r.ok) { queue = queue.slice(batch.length); LS.set(kQueue(), queue); }
  } catch (e) {} finally { flushing = false; }
}
window.addEventListener('online', flush);

function toast(msg) {
  const t = document.getElementById('toast');
  t.innerHTML = msg; t.classList.add('show');
  clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- Gamification ---------- */
function levelInfo(xp) {
  let lvl = 1, need = 100, rest = xp;
  while (rest >= need) { rest -= need; lvl++; need = 100 + 25 * (lvl - 1); }
  return { lvl, rest, need };
}
function medalOf(m) { return m >= 90 ? 'or' : m >= 70 ? 'argent' : m >= 40 ? 'bronze' : 'none'; }
const MEDAL_TXT = { none: 'à débloquer', bronze: 'Bronze', argent: 'Argent', or: 'Or' };
function medalHtml(m) { const k = medalOf(m); return `<span class="medal m-${k}">${k === 'none' ? '—' : (k === 'or' ? '🥇 ' : k === 'argent' ? '🥈 ' : '🥉 ') + MEDAL_TXT[k]}</span>`; }
function levelFor(m) { return m < 35 ? 1 : m < 65 ? 2 : 3; }
function addXP(n) { S.xp += n; }
function setMastery(skill, val) {
  const before = medalOf(S.mastery[skill]);
  S.mastery[skill] = Math.max(0, Math.min(100, Math.round(val)));
  const after = medalOf(S.mastery[skill]);
  const order = ['none', 'bronze', 'argent', 'or'];
  if (order.indexOf(after) > order.indexOf(before)) {
    const sk = SKILLS.find((s) => s.id === skill);
    if (after !== 'none' && !S.cards.includes(skill)) { S.cards.push(skill); }
    toast(`${after === 'or' ? '🥇' : after === 'argent' ? '🥈' : '🥉'} Médaille ${MEDAL_TXT[after]} : ${sk.name} !`);
  }
}
/* Maîtrise exigeante : une médaille se gagne sur plusieurs jours.
   Bronze (40) : réussites nettes sur 2 jours différents • Argent (70) : 3 jours • Or (90) : 4 jours. */
function dayCap(skill) { const n = ((S.okDays || {})[skill] || []).length; return n < 2 ? 39 : n < 3 ? 69 : n < 4 ? 89 : 100; }
function markOkDay(skill) {
  S.okDays = S.okDays || {};
  const d = S.okDays[skill] = S.okDays[skill] || [], t = todayStr();
  if (!d.includes(t)) { d.push(t); if (d.length > 10) d.shift(); }
}
function updateMasteryAfter(item, correct, cleanFirstTry, conf) {
  const skill = item.skill, m = S.mastery[skill] || 0;
  S.lastPrac = S.lastPrac || {}; S.lastPrac[skill] = todayStr();
  const cap = item.level === 1 ? 55 : item.level === 2 ? 82 : 100;
  const mult = item.level === 1 ? 0.8 : item.level === 2 ? 1 : 1.2;
  if (!correct) return setMastery(skill, m - 6);
  let gain = 2;
  if (cleanFirstTry && conf !== 'hasard') { markOkDay(skill); gain = 8 * mult * (conf === 'hesite' ? 0.6 : 1); }
  const nm = Math.min(Math.max(cap, m), m + gain, Math.max(dayCap(skill), m));
  setMastery(skill, Math.max(m, nm));
}
/* Oubli : sans pratique depuis plus de 5 jours, la maîtrise baisse d'1 point par jour (jamais sous 20). */
function applyDecay() {
  const t = todayStr();
  if (!S.decayDay) { S.decayDay = t; return; }
  const elapsed = dayDiff(S.decayDay, t);
  if (elapsed <= 0) return;
  Object.keys(S.lastPrac || {}).forEach((k) => {
    const gap = dayDiff(S.lastPrac[k], t);
    if (gap > 5 && S.mastery[k] > 20) S.mastery[k] = Math.max(20, S.mastery[k] - Math.min(elapsed, gap - 5));
  });
  S.decayDay = t;
}
function touchStreak() {
  const t = todayStr(), st = S.streak;
  if (st.jokerWeek !== weekId()) { st.jokers = 1; st.jokerWeek = weekId(); }
  if (st.last === t) return null;
  let msg = null;
  if (!st.last) st.count = 1;
  else {
    const gap = dayDiff(st.last, t);
    if (gap === 1) st.count++;
    else if (gap === 2 && st.jokers > 0) { st.jokers--; st.count++; msg = '🃏 Tu as raté un jour, mais ton joker de la semaine a protégé ta série !'; }
    else st.count = 1;
  }
  st.last = t;
  return msg;
}
const BOSS_NEED = 5;
const bronzeCount = () => SKILLS.filter((s) => !s.lesson && S.mastery[s.id] >= 40).length;
function bossUnlocked() { const e = nextExam(); return bronzeCount() >= BOSS_NEED || (e && e.days <= 7); }

/* ---------- Choix adaptatif de l'exercice suivant ---------- */
function chooseNext(run) {
  const recent = run.results.slice(-2).map((r) => r.skill);
  const pool = run.only && run.only.length ? run.only : activeSkills();
  const sorted = pool.slice().sort((a, b) => S.mastery[a] - S.mastery[b]);
  let skill; const r = Math.random();
  const notRepeated = (id) => !(recent.length === 2 && recent[0] === id && recent[1] === id);
  if (r < 0.6) skill = sorted.filter(notRepeated).slice(0, 3)[Math.floor(Math.random() * 3)] || sorted[0];
  else if (r < 0.88) skill = pick(sorted.filter(notRepeated).slice(2, 6));
  else skill = pick(sorted.filter(notRepeated).slice(4));
  if (!skill) skill = pick(sorted.filter(notRepeated)) || sorted[0];
  let level = levelFor(S.mastery[skill]);
  // Viser ~75 % de réussite sur la séance
  const last = run.results.slice(-4);
  if (last.length >= 4 && last.every((x) => x.correct && x.clean)) level++;
  const last2 = run.results.slice(-2);
  if (last2.length === 2 && last2.every((x) => !x.correct)) level--;
  return generate(skill, level);
}

/* ---------- Écrans ---------- */
function render(html) {
  $app.innerHTML = (PREVIEW ? `<div class="preview-bar"><span>👀 Aperçu de l’appli de ${esc((S && S.pseudo) || 'l’élève')} : rien n’est enregistré</span><button id="pvexit">Revenir</button></div>` : '') + html;
  window.scrollTo(0, 0);
  const pv = document.getElementById('pvexit'); if (pv) pv.onclick = exitPreview;
}
function exitPreview() { stopTimer(); PREVIEW = false; RUN = null; S = null; PLAN = []; screenParent(); }

/* ---------- Accueil : élève ou parent ---------- */
function brandHead(sub) {
  return `<div class="brand"><div class="logo">⚡</div><h1 class="center">${APP_NAME}</h1>${sub ? `<p class="center muted">${sub}</p>` : ''}</div>`;
}
const legal = () => `<p class="center small muted legal"><a href="confidentialite.html">Confidentialité et mentions légales</a></p>`;
function screenLanding(msg) {
  render(`
    ${brandHead(APP_TAG)}
    ${msg ? `<div class="tip warn">${msg}</div>` : ''}
    <div class="stack" style="margin:18px 0">
      <button class="btn big" id="lStu">🎒 Je suis élève</button>
      <button class="btn big ghost" id="lPar">👪 Je suis parent</button>
    </div>
    <div class="card stack how">
      <h3>Comment ça marche ?</h3>
      <div class="howstep"><span>1</span><p><b>Le parent crée son espace</b> avec son adresse e-mail. Pas de mot de passe : il reçoit un lien.</p></div>
      <div class="howstep"><span>2</span><p><b>Il ajoute son enfant</b> et lui envoie son lien d’accès par message. L’enfant l’ouvre une fois, c’est tout.</p></div>
      <div class="howstep"><span>3</span><p><b>L’enfant révise 10 minutes par jour</b> : cours, exercices, contrôles blancs. Le parent suit ses progrès et reçoit un e-mail à chaque séance s’il le souhaite.</p></div>
    </div>
    ${ACCTS.length ? '<div class="center"><button class="link" id="lBack">← Revenir aux profils de cet appareil</button></div>' : ''}
    ${legal()}`);
  document.getElementById('lStu').onclick = () => screenStudentJoin();
  document.getElementById('lPar').onclick = () => screenParentLogin();
  const bk = document.getElementById('lBack'); if (bk) bk.onclick = screenPicker;
}
function screenStudentJoin(err) {
  render(`
    ${brandHead('')}
    <div class="card stack">
      <h2>Pour commencer</h2>
      <p>Demande à ton parent ton <b>lien d’accès</b>. Ouvre-le une seule fois sur cet appareil : ensuite l’appli s’ouvrira directement sur ton profil.</p>
    </div>
    <div class="card stack">
      <h3>Sur un ordinateur ?</h3>
      <p class="small muted" style="margin:0">Tape le code de 6 lettres que ton parent t’affiche (il est valable 10 minutes).</p>
      <div class="answer"><input id="jcode" maxlength="7" autocomplete="off" autocapitalize="characters" placeholder="Ex. : KPRTWZ" style="text-transform:uppercase;letter-spacing:4px;font-weight:800"></div>
      <p class="small" id="jmsg" style="color:var(--bad);font-weight:700;margin:0;min-height:1.2em">${err || ''}</p>
      <button class="btn" id="jgo">Valider</button>
    </div>
    <div class="center stack" style="gap:6px">
      <button class="link" id="jold">J’ai un ancien code à 6 chiffres</button>
      <button class="link" id="jback">← Retour</button>
    </div>`);
  const go = async () => {
    const c = document.getElementById('jcode').value.replace(/\s/g, '').toUpperCase();
    const m = document.getElementById('jmsg');
    if (c.length !== 6) { m.textContent = 'Le code fait 6 lettres.'; return; }
    m.style.color = 'var(--muted)'; m.textContent = 'Vérification…';
    try {
      const r = await rpc('rv_join_code', { p_code: c, p_label: deviceLabel() });
      if (r.token) return addAcct({ token: r.token, role: 'student', name: r.name, pin: !!r.pin });
      m.style.color = 'var(--bad)';
      m.textContent = r.error === 'locked' ? 'Trop d’essais. Réessaie dans 15 minutes.' : 'Code inconnu ou expiré. Demande un nouveau code à ton parent.';
    } catch (e) { m.style.color = 'var(--bad)'; m.textContent = 'Pas de connexion internet.'; }
  };
  document.getElementById('jgo').onclick = go;
  document.getElementById('jcode').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  document.getElementById('jold').onclick = () => screenLogin();
  document.getElementById('jback').onclick = () => screenLanding();
}
function screenParentLogin(st) {
  st = st || {};
  render(`
    ${brandHead('')}
    <div class="card stack">
      <h2>Espace parent</h2>
      <p class="small muted" style="margin:0">Pas de mot de passe : tu reçois un lien de connexion par e-mail.</p>
      <label class="small" for="pmail"><b>Ton adresse e-mail</b></label>
      <div class="answer"><input id="pmail" type="email" inputmode="email" autocomplete="email" maxlength="160" placeholder="prenom@exemple.fr" value="${esc(st.email || '')}"></div>
      <div id="pinv" ${st.invite ? '' : 'hidden'} class="stack">
        <div class="tip">L’appli est ouverte <b>sur invitation</b> pour l’instant. Tape le code reçu de la personne qui t’a invité.</div>
        <label class="small" for="pcode"><b>Code d’invitation</b></label>
        <div class="answer"><input id="pcode" maxlength="12" autocomplete="off" autocapitalize="characters" style="text-transform:uppercase;letter-spacing:2px" value="${esc(st.code || '')}"></div>
        <label class="ck consent"><input type="checkbox" id="pok"> <span>Je suis le parent ou le responsable légal de l’enfant. J’accepte que ses réponses et ses progrès soient enregistrés pour le suivi de ses révisions, comme expliqué dans la <a href="confidentialite.html" target="_blank">politique de confidentialité</a>.</span></label>
      </div>
      <p class="small" id="pmsg" style="color:var(--bad);font-weight:700;margin:0;min-height:1.2em">${st.err || ''}</p>
      <button class="btn" id="pgo">Recevoir mon lien</button>
    </div>
    <div class="center"><button class="link" id="pback">← Retour</button></div>
    ${legal()}`);
  const msg = (t, ok) => { const m = document.getElementById('pmsg'); m.style.color = ok ? 'var(--muted)' : 'var(--bad)'; m.textContent = t; };
  const go = async () => {
    const email = document.getElementById('pmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return msg('Vérifie ton adresse e-mail.');
    const inv = !document.getElementById('pinv').hidden;
    const code = inv ? document.getElementById('pcode').value.trim() : '';
    const consent = inv ? document.getElementById('pok').checked : false;
    if (inv && !code) return msg('Tape ton code d’invitation.');
    if (inv && !consent) return msg('Coche la case pour accepter.');
    const b = document.getElementById('pgo'); b.disabled = true; msg('Envoi en cours…', true);
    try {
      const r = await mailFn({ action: 'magic', email, invite: code || null, consent });
      b.disabled = false;
      if (r.ok) return screenMailSent(email);
      if (r.error === 'need_invite') { document.getElementById('pinv').hidden = false; return msg('Première visite ? Il faut un code d’invitation.', true); }
      msg({ email: 'Vérifie ton adresse e-mail.', bad_invite: 'Ce code d’invitation n’est pas valable (déjà utilisé ou expiré).', consent: 'Coche la case pour accepter.',
        wait: 'Trop de demandes. Réessaie dans une heure ou regarde ta boîte mail.' }[r.error] || 'Impossible d’envoyer l’e-mail pour l’instant. Réessaie plus tard.');
    } catch (e) { b.disabled = false; msg('Pas de connexion internet.'); }
  };
  document.getElementById('pgo').onclick = go;
  document.getElementById('pmail').onkeydown = (e) => { if (e.key === 'Enter') go(); };
  document.getElementById('pback').onclick = () => screenLanding();
}
function screenMailSent(email) {
  render(`
    ${brandHead('')}
    <div class="card stack center">
      <div style="font-size:48px">📬</div>
      <h2>Regarde ta boîte mail</h2>
      <p>Un e-mail vient de partir vers <b>${esc(email)}</b>. Il contient un <b>code à 6 chiffres</b> : tape-le ici.</p>
      <div class="answer"><input id="mcode" maxlength="7" inputmode="numeric" autocomplete="one-time-code" placeholder="123456" style="text-align:center;font-size:24px;letter-spacing:6px"></div>
      <p class="small" id="mmsg" style="min-height:1.3em;margin:0"></p>
      <button class="btn" id="mgo">Me connecter</button>
      <p class="small muted">${isStandalone() ? 'Utilise le code plutôt que le bouton de l’e-mail : le bouton ouvre le navigateur, pas cette appli.' : 'Tu peux aussi toucher le bouton de l’e-mail sur cet appareil.'} Le code fonctionne 30 minutes. Rien reçu après 2 minutes ? Regarde dans les courriers indésirables.</p>
      <button class="btn ghost" id="mback">Changer d’adresse ou renvoyer</button>
    </div>`);
  const inp = document.getElementById('mcode'), m = document.getElementById('mmsg'), b = document.getElementById('mgo');
  const go = async () => {
    const c = inp.value.replace(/\D/g, '');
    if (c.length !== 6) { m.style.color = 'var(--bad)'; m.textContent = 'Le code fait 6 chiffres.'; return; }
    b.disabled = true; m.style.color = 'var(--muted)'; m.textContent = 'Vérification…';
    try {
      const r = await rpc('rv_magic_code', { p_email: email, p_code: c, p_label: deviceLabel() });
      if (r.token) return addAcct({ token: r.token, role: 'parent', name: 'Espace parent', pin: false });
      b.disabled = false; m.style.color = 'var(--bad)';
      m.textContent = { bad_code: 'Code incorrect, vérifie et réessaie.', locked: 'Trop d’essais. Demande un nouvel e-mail ci-dessous.', no_code: 'Ce code a expiré ou a déjà servi. Demande un nouvel e-mail ci-dessous.', bad_invite: 'Ce code d’invitation n’est plus valable.' }[r.error] || 'Connexion impossible. Demande un nouvel e-mail.';
    } catch (e) { b.disabled = false; m.style.color = 'var(--bad)'; m.textContent = 'Pas de connexion internet.'; }
  };
  b.onclick = go;
  inp.oninput = () => { if (inp.value.replace(/\D/g, '').length === 6) go(); };
  inp.onkeydown = (e) => { if (e.key === 'Enter') go(); };
  setTimeout(() => inp.focus(), 50);
  document.getElementById('mback').onclick = () => screenParentLogin({ email });
}
/* Liens reçus : #m= (connexion du parent) ou #j= (appareil de l'enfant) */
async function handleLink(h) {
  render('<p class="center muted" style="margin-top:40px">Connexion…</p>');
  const [k, v] = [h.slice(1, 2), h.slice(3)];
  try {
    if (k === 'm') {
      const r = await rpc('rv_magic_use', { p_token: v, p_label: deviceLabel() });
      if (r.token) return addAcct({ token: r.token, role: 'parent', name: 'Espace parent', pin: false });
      return screenParentLogin({ err: { old_link: 'Ce lien a expiré. Demande-en un nouveau ci-dessous.', used_link: 'Ce lien a déjà servi. Demande-en un nouveau ci-dessous.' }[r.error] || 'Ce lien ne fonctionne pas. Demande-en un nouveau ci-dessous.' });
    }
    const r = await rpc('rv_join', { p_secret: v, p_label: deviceLabel() });
    if (r.token) {
      const dup = ACCTS.find((a) => a.role === 'student' && a.name === r.name);
      if (dup) ACCTS = ACCTS.filter((a) => a !== dup);
      return addAcct({ token: r.token, role: 'student', name: r.name, pin: !!r.pin });
    }
    return screenStudentJoin('Ce lien ne fonctionne plus. Demande un nouveau lien à ton parent.');
  } catch (e) { render('<p class="center" style="margin-top:40px">Pas de connexion internet.</p><button class="btn" id="rt">Réessayer</button>'); document.getElementById('rt').onclick = () => handleLink(h); }
}
/* Plusieurs profils sur le même appareil */
function screenPicker() {
  render(`
    ${brandHead('Qui se connecte ?')}
    <div class="stack" style="margin-top:16px">${ACCTS.map((a, i) => `
      <button class="pick" data-i="${i}"><span class="avatar">${a.role === 'parent' ? '👪' : esc((a.name || '?')[0].toUpperCase())}</span><b>${esc(a.role === 'parent' ? 'Espace parent' : a.name)}</b>${a.role !== 'parent' && a.pin ? '<span class="small muted">🔒</span>' : ''}</button>`).join('')}
    </div>
    <div class="center" style="margin-top:14px"><button class="link" id="padd">+ Ajouter un profil sur cet appareil</button></div>`);
  $app.querySelectorAll('.pick').forEach((b) => b.onclick = () => {
    const a = ACCTS[+b.dataset.i];
    if (a.role !== 'parent' && a.pin) return screenUnlock(a);
    useAcct(a); UNLOCKED = true; boot();
  });
  document.getElementById('padd').onclick = () => screenLanding();
}
function screenUnlock(a, err) {
  let pin = '';
  render(`
    <div class="logo">${esc((a.name || '?')[0].toUpperCase())}</div>
    <h1 class="center">${esc(a.name)}</h1>
    <p class="center muted">Tape ton code à 4 chiffres</p>
    <div class="pin-dots" id="dots">${'<span></span>'.repeat(4)}</div>
    <p class="center" id="pinmsg" style="min-height:1.5em;color:var(--bad);font-weight:700">${err || ''}</p>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-n="${n}">${n}</button>`).join('')}<span></span><button data-n="0">0</button><button data-n="del" aria-label="Effacer">⌫</button></div>
    <div class="center"><button class="link" id="ub">← Changer de profil</button></div>`);
  document.getElementById('ub').onclick = screenPicker;
  const dots = () => document.querySelectorAll('#dots span').forEach((d, i) => d.classList.toggle('on', i < pin.length));
  $app.querySelectorAll('.pad button').forEach((b) => b.onclick = async () => {
    const n = b.dataset.n;
    if (n === 'del') pin = pin.slice(0, -1); else if (pin.length < 4) pin += n;
    dots();
    if (pin.length === 4) {
      try {
        const r = await rpc('rv_unlock', { p_token: a.token, p_pin: pin });
        if (r.ok) { useAcct(a); UNLOCKED = true; return boot(); }
        if (r.error === 'auth') { ACCTS = ACCTS.filter((x) => x !== a); saveAccts(); return ACCTS.length ? screenPicker() : screenLanding('Ce profil n’est plus actif sur cet appareil.'); }
        pin = ''; dots();
        document.getElementById('pinmsg').textContent = r.error === 'locked' ? 'Trop d’essais. Réessaie dans 15 minutes.' : 'Code incorrect, réessaie.';
      } catch (e) { pin = ''; dots(); document.getElementById('pinmsg').textContent = 'Pas de connexion internet.'; }
    }
  });
}
/* Ancien code à 6 chiffres (profils créés avant les familles) */
function screenLogin(err) {
  let pin = '';
  render(`
    <div class="logo">⚡</div>
    <h1 class="center">${APP_NAME}</h1>
    <p class="center muted">Tape ton code à 6 chiffres</p>
    <div class="pin-dots" id="dots">${'<span></span>'.repeat(6)}</div>
    <p class="center" id="pinmsg" style="min-height:1.5em;color:var(--bad);font-weight:700">${err || ''}</p>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-n="${n}">${n}</button>`).join('')}<span></span><button data-n="0">0</button><button data-n="del" aria-label="Effacer">⌫</button></div>
    <div class="center"><button class="link" id="lb">← Retour</button></div>`);
  document.getElementById('lb').onclick = () => screenLanding();
  const dots = () => document.querySelectorAll('#dots span').forEach((d, i) => d.classList.toggle('on', i < pin.length));
  $app.querySelectorAll('.pad button').forEach((b) => b.onclick = async () => {
    const n = b.dataset.n;
    if (n === 'del') pin = pin.slice(0, -1); else if (pin.length < 6) pin += n;
    dots();
    if (pin.length === 6) {
      document.getElementById('pinmsg').textContent = 'Vérification…';
      try {
        const r = await rpc('rv_login', { p_pin: pin });
        if (r.token) return addAcct({ token: r.token, role: r.role, name: r.role === 'parent' ? 'Espace parent' : 'Élève', pin: false });
        pin = ''; dots();
        document.getElementById('dots').classList.add('shake'); setTimeout(() => document.getElementById('dots').classList.remove('shake'), 400);
        document.getElementById('pinmsg').textContent = r.error === 'locked' ? 'Trop d’essais. Réessaie dans 15 minutes.' : 'Code incorrect, réessaie.';
      } catch (e) { pin = ''; dots(); document.getElementById('pinmsg').textContent = 'Pas de connexion internet.'; }
    }
  });
}

/* Retirer le profil courant de cet appareil */
function logout(expired) {
  LS.del(kState()); LS.del(kQueue()); LS.del(kAct());
  ACCTS = ACCTS.filter((a) => a.token !== token); saveAccts();
  LS.del('rv_token'); LS.del('rv_role'); token = null; role = null; S = null; queue = [];
  if (ACCTS.length) return screenPicker();
  screenLanding(expired ? 'Ta connexion a expiré : reconnecte-toi.' : '');
}
function switchProfile() { stopTimer(); LS.del('rv_token'); LS.del('rv_role'); token = null; role = null; S = null; UNLOCKED = false; screenPicker(); }

function screenPseudo() {
  render(`
    <div class="logo">👋</div>
    <h1 class="center">Bienvenue !</h1>
    <p class="center muted">Comment veux-tu qu’on t’appelle ?</p>
    <div class="card stack">
      <div class="answer"><input id="ps" maxlength="20" placeholder="Ton prénom ou un pseudo" autocomplete="off" value="${esc(curAcct().role === 'student' && curAcct().name !== 'Élève' ? curAcct().name : '')}"></div>
      <button class="btn" id="go">C’est moi</button>
    </div>`);
  const go = () => { const v = document.getElementById('ps').value.trim(); if (!v) return; S.pseudo = v.slice(0, 20); saveState(); route(); };
  document.getElementById('go').onclick = go;
  document.getElementById('ps').onkeydown = (e) => { if (e.key === 'Enter') go(); };
}

/* ---------- Premier contact en douceur : mini-leçon → 5 questions guidées → évaluation en 3 blocs ---------- */
function screenWelcome() {
  render(`
    <div class="top"><div class="avatar">${esc(S.pseudo[0].toUpperCase())}</div><div class="grow"><h2>Salut ${esc(S.pseudo)} !</h2></div></div>
    <div class="card hero stack">
      <h2>On commence en douceur</h2>
      <p class="muted">Trois petites étapes pour démarrer :</p>
      <ol class="onb">
        <li><b>Une mini-leçon</b> sur la vitesse (3 minutes)</li>
        <li><b>5 questions faciles</b>, avec des indices si tu bloques</li>
        <li><b>Un petit bilan</b> en 3 blocs de 5 questions, un par jour</li>
      </ol>
      <p class="muted small">Prends ta calculatrice. Rien n’est noté.</p>
      <button class="btn" id="go">Étape 1 : la mini-leçon</button>
    </div>`);
  document.getElementById('go').onclick = screenOnbLesson;
}
function screenOnbLesson() {
  const sec = COURS.find((c) => c.id === 'C2').sections[0];
  render(`
    <span class="chip">Étape 1 sur 3 • Mini-leçon</span>
    <div class="card lessonc pop" style="margin-top:10px"><h2>${sec.title}</h2>${sec.html}<div class="retenir"><b>📌 À retenir</b><br>${sec.retenir}</div></div>
    <button class="btn" id="go">J’ai lu, étape 2 : 5 questions</button>`);
  document.getElementById('go').onclick = () => {
    S.onboard = Math.max(S.onboard || 0, 1); saveState();
    startRun('warmup', null, [['V4', 1], ['V2', 1], ['V4', 1], ['V3', 1], ['V5', 1]].map(([s, l]) => generate(s, l)));
  };
}
function nextDiagBlock() { return (S.diagParts || []).filter(Boolean).length; }
function diagBlockReady() {
  const parts = (S.diagParts || []).filter(Boolean), last = parts[parts.length - 1];
  return !last || last.date < todayStr() || role === 'test';
}
function screenDiagIntro() {
  const b = nextDiagBlock();
  render(`
    <button class="link" id="back">← Retour</button>
    <div class="card hero stack">
      <span class="chip">Petit bilan • bloc ${b + 1} sur 3</span>
      <h2>5 questions, sans indice</h2>
      <p class="muted">Ce n’est pas une note : ça sert à savoir par où commencer. ${b === 0 ? 'On commence par les plus faciles.' : 'Un peu plus difficile que le bloc précédent.'}</p>
      <p class="muted">• Calculatrice à côté<br>• Environ 5 minutes<br>• Tu peux répondre « je ne sais pas », c’est utile aussi</p>
      <button class="btn" id="go">Commencer le bloc ${b + 1}</button>
    </div>`);
  document.getElementById('back').onclick = screenHome;
  document.getElementById('go').onclick = () => startRun('diag');
}

/* ---------- Accueil : une seule « mission du jour », puis les autres activités ---------- */
const WARM_PRESET = () => [['V4', 1], ['V2', 1], ['V4', 1], ['V3', 1], ['V5', 1]].map(([s, l]) => generate(s, l));
const examWhen = (e) => e.days === 0 ? 'aujourd’hui' : e.days === 1 ? 'demain' : `dans ${e.days} jours`;
function mission() {
  const b = nextDiagBlock(), e = nextExam(), due = dueReviews().length;
  if ((S.onboard || 0) < 2) return S.onboard
    ? { chip: 'Pour bien démarrer • étape 2 sur 3', title: '5 questions faciles', sub: 'Avec des indices si tu bloques. Environ 5 minutes.', btn: '▶ Faire les 5 questions', go: () => startRun('warmup', null, WARM_PRESET()) }
    : { chip: 'Pour bien démarrer • étape 1 sur 3', title: 'Une mini-leçon sur la vitesse', sub: 'Environ 3 minutes. Ensuite, 5 questions faciles.', btn: '▶ Lire la mini-leçon', go: screenOnbLesson };
  if (!S.diagDone && diagBlockReady()) return { chip: `Petit bilan • bloc ${b + 1} sur 3`, title: '5 questions sans indice', sub: 'Environ 5 minutes. Ce n’est pas une note : ça sert à savoir par où commencer.', btn: `▶ Faire le bloc ${b + 1}`, go: screenDiagIntro };
  if (e && e.days === 0) return { chip: '📅 Contrôle aujourd’hui', title: 'Relis tes cartes', sub: 'Les formules et les pièges, tranquillement. Pas de nouvel exercice difficile aujourd’hui : tu es prête.', btn: '🃏 Relire mes cartes', go: screenCards, noDone: true };
  if (e && e.days <= 2) return { chip: `📅 Contrôle ${examWhen(e)}`, title: 'Le contrôle blanc', sub: '8 questions, 20 minutes, sans indice, sur ce qui tombe au contrôle. Ensuite, relis la correction.', btn: '▶ Commencer le contrôle blanc', go: () => startRun('boss', null, null, true) };
  if (e && e.days <= 7) { const r = Math.min(dueReviews(e.skills && e.skills.length ? e.skills : null).length, 3);
    return { chip: `📅 Contrôle ${examWhen(e)}`, title: 'Spécial contrôle', sub: `Environ 10 min • ${r ? `${r} révision${r > 1 ? 's' : ''} + ${8 - r} exercices` : '8 exercices'} sur ce qui tombe au contrôle.`, btn: '▶ C’est parti', go: () => startRun('prep', null, null, true) }; }
  if (due) { const r = Math.min(due, 4);
    return { chip: 'Ta mission du jour', title: 'Séance du jour', sub: `Environ 12 min • ${r} révision${r > 1 ? 's' : ''} + ${10 - r} exercices`, btn: '▶ C’est parti', go: () => startRun('train', null, null, true) }; }
  const L = COURS.find((c) => !c.ahead && !coursProg(c.id).done);
  if (L) { const p = coursProg(L.id), first = Math.max(0, L.sections.findIndex((_, i) => !p.seen.includes(i)));
    return { chip: 'Ta mission du jour', title: `Leçon : ${L.title}`, sub: `${p.seen.length ? 'Tu l’as commencée, ' : ''}environ ${lessonMinutes(L, first)} min${p.seen.length ? ' pour la finir' : ''}.`, btn: p.seen.length ? '▶ Continuer la leçon' : '▶ Lire la leçon', go: () => { MISSION_LESSON = L.id; screenLesson(L.id, first); } }; }
  return { chip: 'Ta mission du jour', title: 'Séance du jour', sub: 'Environ 12 min • 10 exercices choisis pour toi', btn: '▶ C’est parti', go: () => startRun('train', null, null, true) };
}
let MISSION_LESSON = null;
function missionDone() { S.missionDay = todayStr(); }
function missionCard() {
  const m = mission(), e = nextExam();
  const examLine = e && e.days <= 7 && !/Contrôle/.test(m.chip) ? `<p class="small" style="margin:0">📅 Contrôle ${examWhen(e)} : ${esc(e.label || 'physique')}</p>` : '';
  const waitDiag = !S.diagDone && (S.onboard || 0) >= 2 && !diagBlockReady() ? `<p class="small muted" style="margin:0">Bloc ${nextDiagBlock() + 1} du bilan : demain.</p>` : '';
  if (S.missionDay === todayStr() && !m.noDone) return { html: `<div class="card done stack">
      <span class="chip ok">✅ Mission du jour accomplie</span>
      <h2>Bravo ${esc(S.pseudo)} !</h2>
      <p class="muted">Reviens demain pour garder ta série 🔥 ${S.streak.count} jour${S.streak.count > 1 ? 's' : ''}.</p>${examLine}${waitDiag}
      <button class="btn ghost" id="mgo">Encore un peu ? Une séance de plus</button></div>`, go: () => startRun('train') };
  return { html: `<div class="card hero stack">
      <span class="chip">${m.chip}</span>
      <h2>${esc(m.title)}</h2>
      <p class="muted">${m.sub}</p>${examLine.replace('class="small"', 'class="small muted"')}${waitDiag.replace('muted', '')}
      <button class="btn" id="mgo">${m.btn}</button></div>`, go: m.go };
}
/* Installer l'appli sur l'écran d'accueil du téléphone */
let installEvt = null;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; });
const isStandalone = () => window.matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
function installHow() {
  return isIOS() ? 'Dans Safari, touche le bouton <b>Partager</b> (le carré avec une flèche ⬆️), puis <b>« Sur l’écran d’accueil »</b>.'
    : 'Dans Chrome, touche le menu <b>⋮</b> en haut à droite, puis <b>« Installer l’application »</b> ou <b>« Ajouter à l’écran d’accueil »</b>.';
}
function installCard() {
  if (PREVIEW || isStandalone() || LS.get('rv_install_hide', false)) return '';
  return `<div class="card install stack"><div class="row"><span class="appic">⚡</span><div class="grow"><b>Mets l’appli sur ton téléphone</b><br><span class="small muted">Une icône sur ton écran d’accueil, comme une vraie appli.</span></div></div>
    ${installEvt ? '<button class="btn" id="inst">Installer l’appli</button>' : `<p class="small" style="margin:0">${installHow()}</p>`}
    <button class="link" id="instno" style="padding:0">${installEvt ? 'Plus tard' : 'C’est fait / plus tard'}</button></div>`;
}
function bindInstall() {
  const hide = () => { LS.set('rv_install_hide', true); screenHome(); };
  const i = document.getElementById('inst'); if (i) i.onclick = async () => { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; hide(); };
  const n = document.getElementById('instno'); if (n) n.onclick = hide;
}
function openSettings() {
  if (document.getElementById('qmodal')) return;
  document.body.insertAdjacentHTML('beforeend', `<div class="modal sheet-bg" id="qmodal" role="dialog" aria-modal="true"><div class="card sheet stack pop">
    <h2>Réglages</h2>
    <button class="btn ghost" id="sAa">${S.large ? '🔤 Texte normal' : '🔠 Texte plus grand'}</button>
    ${isStandalone() ? '' : '<button class="btn ghost" id="sInst">📲 Mettre l’appli sur mon téléphone</button><p class="small muted" id="sHow" hidden></p>'}
    ${PREVIEW ? '' : `${ACCTS.length > 1 ? '<button class="btn ghost" id="sSw">👥 Changer de profil</button>' : ''}<button class="btn ghost" id="sAdd">➕ Ajouter un profil sur cet appareil</button>`}
    <button class="btn ghost" id="sOut">${PREVIEW ? '↩ Revenir au tableau de bord' : '🚪 Retirer mon profil de cet appareil'}</button>
    <button class="link" id="sClose">Fermer</button></div></div>`);
  const close = () => { const m = document.getElementById('qmodal'); if (m) m.remove(); };
  document.getElementById('qmodal').onclick = (e) => { if (e.target.id === 'qmodal') close(); };
  document.getElementById('sClose').onclick = close;
  document.getElementById('sAa').onclick = () => { S.large = !S.large; document.body.classList.toggle('large', S.large); saveState(); close(); screenHome(); };
  const si = document.getElementById('sInst');
  if (si) si.onclick = async () => { if (installEvt) { installEvt.prompt(); installEvt = null; close(); return; } const h = document.getElementById('sHow'); h.innerHTML = installHow(); h.hidden = false; };
  const sw = document.getElementById('sSw'); if (sw) sw.onclick = () => { close(); switchProfile(); };
  const sa = document.getElementById('sAdd'); if (sa) sa.onclick = () => { close(); stopTimer(); screenLanding(); };
  document.getElementById('sOut').onclick = () => { if (PREVIEW) { close(); return exitPreview(); } if (!confirm('Retirer ton profil de cet appareil ? Tes progrès restent enregistrés ; il faudra un nouveau lien de ton parent pour revenir.')) return; close(); logout(); };
}
const activeCards = () => S.cards.filter((k) => skillActive(k)).length;
function screenHome() {
  const L = levelInfo(S.xp);
  const unlocked = bossUnlocked(), nb = bronzeCount();
  const M = missionCard();
  const act = SKILLS.filter((s) => skillActive(s.id)), locked = SKILLS.filter((s) => !skillActive(s.id));
  const coursDone = COURS.filter((c) => coursProg(c.id).done).length;
  render(`
    <div class="top">
      <div class="avatar">${esc(S.pseudo[0].toUpperCase())}</div>
      <div class="grow">
        <div class="row between"><b>${esc(S.pseudo)}</b><span class="small"><b>Niveau ${L.lvl}</b> • 🔥 ${S.streak.count} jour${S.streak.count > 1 ? 's' : ''}</span></div>
        <div class="xpbar" title="${L.rest} / ${L.need} XP"><i style="width:${Math.round(L.rest / L.need * 100)}%"></i></div>
      </div>
      <button class="gear" id="set" aria-label="Réglages">⚙️</button>
    </div>
    ${installCard()}
    ${M.html}
    <h3 style="margin:18px 4px 10px">Autres activités</h3>
    <div class="acts">
      <button class="act" id="redac"><span class="ic">✍️</span><b>Rédiger</b><span class="small muted">Comme sur ta copie</span></button>
      <button class="act" id="cours"><span class="ic">📚</span><b>Mes cours</b><span class="small muted">${coursDone}/${COURS.length} lus</span></button>
      <button class="act ${unlocked ? '' : 'off'}" id="boss"><span class="ic">👾</span><b>Contrôle blanc</b><span class="small muted">${unlocked ? (S.boss.best != null ? `Record ${fr(S.boss.best, 1)}/20` : '8 questions, 20 min') : `🔒 ${nb}/${BOSS_NEED} bronzes`}</span></button>
      <button class="act" id="bat"><span class="ic">🕵️</span><b>Bats ta note</b><span class="small muted">Chasse à l’erreur</span></button>
    </div>
    <h3 style="margin:18px 4px 6px">Mes compétences</h3>
    <p class="small muted" style="margin:0 4px 10px">Une médaille se gagne en réussissant sur plusieurs jours : bronze en 2 jours, argent en 3, or en 4.</p>
    <div class="skills">${act.map((s) => `
      <button class="skill" data-s="${s.id}">
        <div class="row between"><span class="ic">${s.icon}</span>${medalHtml(S.mastery[s.id])}</div>
        <div class="nm">${s.name}</div>
        <div class="bar"><i style="width:${S.mastery[s.id]}%"></i></div>
      </button>`).join('')}</div>
    ${locked.length ? `<details class="soon"><summary>🔒 Bientôt (${locked.length}) <span class="small muted">: s’ouvrent avec les leçons d’avance</span></summary>
      <div class="skills" style="margin-top:10px">${locked.map((s) => `
      <button class="skill locked" data-l="${s.lesson}">
        <div class="row between"><span class="ic">${s.icon}</span><span class="small muted">🔒</span></div>
        <div class="nm">${s.name}</div>
        <div class="small muted">Après la leçon « ${COURS.find((c) => c.id === s.lesson).title} »</div>
      </button>`).join('')}</div></details>` : ''}
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="cards">🃏 Mes cartes formules (${activeCards()}/${act.length})</button></div>`);
  const on = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
  on('mgo', M.go);
  on('set', openSettings);
  on('redac', () => startRun('redac'));
  on('cours', screenCours);
  on('bat', () => startRun('bat'));
  on('boss', () => unlocked ? startRun('boss') : toast(`Le contrôle blanc s’ouvre avec ${BOSS_NEED} médailles bronze (tu en as ${nb}), ou une semaine avant un contrôle.`));
  on('cards', screenCards);
  bindInstall();
  $app.querySelectorAll('.skill[data-s]').forEach((el) => el.onclick = () => screenSkill(el.dataset.s));
  $app.querySelectorAll('.skill[data-l]').forEach((el) => el.onclick = () => screenLesson(el.dataset.l, 0));
}

function ficheHtml(id) {
  const f = FICHES[id];
  return `<h2>${f.title}</h2><ul class="fiche">${f.points.map((p) => `<li>${p}</li>`).join('')}</ul>
    <div class="formula">${f.formula}</div><div class="piege">⚠️ Piège : ${f.piege}</div>`;
}
function screenSkill(id) {
  const s = SKILLS.find((x) => x.id === id);
  render(`
    <button class="link" id="back">← Retour</button>
    <div class="card stack">${ficheHtml(id)}</div>
    <div class="card"><div class="row between"><b>Ma maîtrise</b>${medalHtml(S.mastery[id])}</div><div class="bar" style="margin-top:8px"><i style="width:${S.mastery[id]}%"></i></div></div>
    <div class="stack"><button class="btn" id="go">S’entraîner sur « ${s.short} » (5 exercices)</button>
    ${lessonOf(id) ? `<button class="btn ghost" id="lc">📖 Lire le cours complet</button>` : ''}</div>`);
  document.getElementById('back').onclick = screenHome;
  const lc = document.getElementById('lc'); if (lc) lc.onclick = () => screenLesson(lessonOf(id).id, 0);
  document.getElementById('go').onclick = () => startRun('focus', id);
}

function screenCards() {
  render(`
    <button class="link" id="back">← Retour</button>
    <h2>Mes cartes formules</h2>
    <p class="muted small">Une carte se débloque à chaque médaille bronze.</p>
    <div class="cards">${SKILLS.filter((s) => skillActive(s.id)).map((s) => S.cards.includes(s.id)
      ? `<div class="fcard pop"><h3>${s.icon} ${CARDS[s.id].title}</h3><div>${CARDS[s.id].body}</div></div>`
      : `<div class="fcard locked"><div>🔒<br>${s.short}</div></div>`).join('')}</div>`);
  document.getElementById('back').onclick = screenHome;
}

/* ---------- Cours ---------- */
const lessonOf = (skill) => COURS.find((c) => c.skills.includes(skill));
function coursProg(id) { S.cours = S.cours || {}; return (S.cours[id] = S.cours[id] || { seen: [], exos: [], done: false }); }
function coursHomeCard() {
  const done = COURS.filter((c) => coursProg(c.id).done).length;
  const next = COURS.find((c) => !coursProg(c.id).done);
  return `<div class="card">
      <div class="row between"><h3>📚 Mes cours</h3><span class="pill">${done}/${COURS.length} lus</span></div>
      <p class="muted small">Les leçons de ton cahier expliquées pas à pas, avec des mini-quiz et les exercices du prof corrigés.${next ? ` Prochaine : <b>${next.title}</b>.` : ''}</p>
      <button class="btn ghost" id="cours">Ouvrir mes cours</button>
    </div>`;
}
function screenCours() {
  let lastChap = '';
  render(`
    <button class="link" id="back">← Retour</button>
    <h1>Mes cours</h1>
    <p class="muted small">Dans l’ordre de ton cahier, puis deux leçons d’avance pour être prête quand le prof les commencera.</p>
    ${COURS.map((c) => {
      const p = coursProg(c.id), n = c.sections.length, seen = p.seen.length;
      const head = c.chap !== lastChap ? `<h3 style="margin:16px 4px 8px">${c.chap}</h3>` : ''; lastChap = c.chap;
      return `${head}<button class="lesson" data-c="${c.id}">
        <span class="lic">${c.icon}</span>
        <span class="grow"><b>${c.title}</b>${c.ahead ? ' <span class="pill tiny">🚀 en avance</span>' : ''}<br><span class="small muted">${n} parties${c.exos.length ? ` • ${c.exos.length} exercices corrigés` : ''}</span>
          <span class="bar" style="display:block;margin-top:6px"><i style="width:${Math.round(seen / n * 100)}%"></i></span></span>
        <span>${p.done ? '✅' : '›'}</span>
      </button>`;
    }).join('')}`);
  document.getElementById('back').onclick = screenHome;
  $app.querySelectorAll('.lesson').forEach((b) => b.onclick = () => {
    const c = COURS.find((x) => x.id === b.dataset.c), p = coursProg(c.id);
    const first = c.sections.findIndex((_, i) => !p.seen.includes(i));
    screenLesson(c.id, p.done || first < 0 ? 0 : first);
  });
}
/* Découpe une partie de leçon en petits écrans (60 mots maximum, une idée par écran).
   Une phrase qui se termine par « : » reste avec ce qui suit. */
function chunkLesson(html) {
  const d = document.createElement('div'); d.innerHTML = html;
  // un paragraphe trop long est coupé entre deux phrases
  [...d.children].forEach((k) => {
    if (k.tagName !== 'P') return;
    const parts = k.innerHTML.split(/(?<=[.!?»])\s+(?=[A-ZÀÂÉÈÊÎÔÛ«<])/);
    if (parts.length < 2 || (k.textContent || '').split(/\s+/).length <= 60) return;
    const half = []; let acc = [], aw = 0;
    parts.forEach((pt) => { const pw = pt.replace(/<[^>]+>/g, '').split(/\s+/).length; if (acc.length && aw + pw > 45) { half.push(acc.join(' ')); acc = []; aw = 0; } acc.push(pt); aw += pw; });
    if (acc.length) half.push(acc.join(' '));
    half.forEach((h) => { const np = document.createElement('p'); np.innerHTML = h; k.before(np); });
    k.remove();
  });
  // une liste trop longue est coupée en deux listes
  [...d.children].forEach((k) => {
    if (!/^(UL|OL)$/.test(k.tagName) || k.children.length < 2 || (k.textContent || '').trim().split(/\s+/).length <= 45) return;
    const items = [...k.children], cut = Math.ceil(items.length / 2);
    const k2 = k.cloneNode(false); items.slice(cut).forEach((li) => k2.appendChild(li));
    if (k.tagName === 'OL') k2.setAttribute('start', (+(k.getAttribute('start') || 1)) + cut);
    k.after(k2);
  });
  const out = []; let cur = [], w = 0, colon = false;
  [...d.children].forEach((k) => {
    const visual = /^(svg|table)$/i.test(k.tagName) || k.classList.contains('svg') || k.classList.contains('tbl');
    const kw = visual ? 15 : (k.textContent || '').trim().split(/\s+/).filter(Boolean).length;
    if (cur.length && w + kw > 60 && !colon) { out.push(cur.join('')); cur = []; w = 0; }
    cur.push(k.outerHTML); w += kw;
    colon = /:\s*$/.test((k.textContent || '').trim()) && !visual;
  });
  if (cur.length) out.push(cur.join(''));
  return out.length ? out : [html];
}
function lessonMinutes(c, from) {
  const w = c.sections.slice(from || 0).reduce((n, x) => n + stripTags(x.html + ' ' + x.retenir).split(/\s+/).length, 0);
  return Math.max(2, Math.round(w / 110));
}
function screenLesson(id, i) {
  const c = COURS.find((x) => x.id === id), sec = c.sections[i], n = c.sections.length, p = coursProg(id);
  const isLast = i === n - 1;
  const chunks = chunkLesson(sec.html), nc = chunks.length, quiz = sec.quiz || [];
  const qAt = (k) => Math.min(nc - 1, 2 * k + 1); // une question tous les 2 écrans
  const already = p.seen.includes(i);
  const video = (c.videos || {})[i];
  const groups = chunks.map((h, g) => `
    <div class="grp" data-g="${g}" ${g > 0 && !already ? 'hidden' : ''}>
      <div class="card lessonc ${g === 0 ? '' : 'cont'} pop" style="margin-top:10px">${g === 0 ? `<h2>${sec.title}</h2>` : ''}${h}
        ${g === nc - 1 ? `<div class="retenir"><b>📌 À retenir</b><br>${sec.retenir}</div>${video ? `<div class="videos">${(Array.isArray(video) ? video : [['Voir la vidéo de ce point', video]]).map(([t, id]) => `<a class="vid" href="${/^https?:/.test(id) ? esc(id) : 'https://www.youtube.com/watch?v=' + esc(id)}" target="_blank" rel="noopener"><span class="play">▶</span><span><b>Vidéo</b><br><span class="small">${esc(t)}</span></span></a>`).join('')}</div>` : ''}` : ''}
      </div>
      ${quiz.map((q, k) => qAt(k) !== g ? '' : `
      <div class="card"><span class="chip">✋ Vérifie que tu as compris</span>
        <div class="question">${q.q}</div>
        <div class="choices" data-q="${k}">${shuffle(q.choices.map((ch, j) => j)).map((j) => `<button class="choice" data-j="${j}">${q.choices[j].t}</button>`).join('')}</div>
        <div class="qfb" id="qfb${k}"></div>
      </div>`).join('')}
    </div>`).join('');
  render(`
    <div class="row" style="margin-bottom:10px"><button class="quitbtn" id="back">✕ Fermer</button>
      <div class="progress"><i style="width:${Math.round((i + 1) / n * 100)}%"></i></div><span class="small muted">Partie ${i + 1} sur ${n}</span></div>
    <span class="chip">${c.icon} ${c.title}</span>
    ${i === 0 ? `<p class="small muted" style="margin-top:8px">⏱ Environ ${lessonMinutes(c, 0)} minutes • ${c.ahead ? '🚀 en avance sur la classe : ' : '📓 dans ton cahier : '}${c.cahier}</p>` : ''}
    ${groups}
    <div class="actions">${i > 0 ? '<button class="btn ghost" id="prev">← Avant</button>' : '<span></span>'}
      <button class="btn" id="next"></button></div>`);
  let shown = already ? nc : 1;
  const nextBtn = document.getElementById('next');
  const label = () => { nextBtn.textContent = shown < nc ? 'Continuer ↓' : isLast ? 'Terminer la leçon ✓' : 'Partie suivante →'; };
  label();
  if (!already) { p.seen.push(i); saveState(); }
  document.getElementById('back').onclick = screenCours;
  const pv = document.getElementById('prev'); if (pv) pv.onclick = () => screenLesson(id, i - 1);
  nextBtn.onclick = () => {
    if (shown < nc) {
      const g = $app.querySelector(`.grp[data-g="${shown}"]`); g.hidden = false; shown++; label();
      g.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    isLast ? finishLesson(id) : screenLesson(id, i + 1);
  };
  $app.querySelectorAll('.choices[data-q]').forEach((box) => {
    const q = quiz[+box.dataset.q]; let tries = 0, over = false;
    box.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
      if (over || b.classList.contains('wrong')) return;
      const ch = q.choices[+b.dataset.j], out = document.getElementById('qfb' + box.dataset.q);
      tries++;
      if (ch.ok) {
        over = true; b.classList.add('right');
        out.innerHTML = `<div class="fb good pop"><b>${pick(['Bravo !', 'Exact !', 'Bien vu !'])}</b>${tries === 1 ? ' +3 XP' : ''}</div>`;
        if (tries === 1) addXP(3);
      } else {
        b.classList.add('wrong');
        out.innerHTML = `<div class="fb bad pop">${ch.msg || 'Pas tout à fait.'}</div>`;
        if (tries === 1 && skillActive(c.skills[0])) addReview(c.skills[0], 1, 'notion');
      }
      if (ch.ok || tries === 1) logAttempt({ mode: 'cours', skill: c.skills[0], item_id: `${id}-s${i}-q${box.dataset.q}`, level: 1, correct: !!ch.ok, tries, hints: 0, error_code: ch.ok ? null : 'notion', answer: stripTags(ch.t).slice(0, 60), question: stripTags(q.q).slice(0, 400), ms: 0 });
      saveState();
    });
  });
}
function finishLesson(id) {
  const c = COURS.find((x) => x.id === id), p = coursProg(id);
  const first = !p.done;
  const before = activeSkills();
  if (first) { p.done = true; addXP(20); }
  if (MISSION_LESSON === id) { missionDone(); MISSION_LESSON = null; }
  const unlocked = c.skills.filter((k) => !before.includes(k));
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">📗</div>
      <h2>Leçon terminée !</h2>
      <p class="muted">${c.title}${first ? ' • +20 XP' : ''}</p>
    </div>
    ${unlocked.length ? `<div class="card"><h3>🔓 Nouvelles compétences débloquées</h3><p class="small">${unlocked.map((k) => { const s = SKILLS.find((x) => x.id === k); return `${s.icon} ${s.name}`; }).join('<br>')}</p><p class="small muted">Elles vont maintenant apparaître dans tes séances du jour.</p></div>` : ''}
    <div class="card"><h3>📌 L’essentiel</h3><ul class="fiche">${c.sections.map((s) => `<li>${s.retenir}</li>`).join('')}</ul></div>
    <div class="stack">
      ${c.exos.length ? `<button class="btn" id="exos">✏️ ${c.ahead ? 'Les exercices' : 'Les exercices du cahier'}, corrigés (${c.exos.length})</button>` : ''}
      ${c.skills.map((k) => { const s = SKILLS.find((x) => x.id === k); return `<button class="btn ${c.exos.length ? 'ghost' : ''}" data-k="${k}">${s.icon} S’entraîner : ${s.name}</button>`; }).join('')}
      <button class="btn ghost" id="list">Retour à mes cours</button>
    </div>`);
  const ex = document.getElementById('exos'); if (ex) ex.onclick = () => screenExo(id, 0);
  $app.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => startRun('focus', b.dataset.k));
  document.getElementById('list').onclick = screenCours;
}
function screenExo(id, k) {
  const c = COURS.find((x) => x.id === id), e = c.exos[k], p = coursProg(id), n = c.exos.length;
  let shown = 0;
  render(`
    <div class="row" style="margin-bottom:10px"><button class="quitbtn" id="back">✕ Fermer</button>
      <div class="progress"><i style="width:${Math.round((k + 1) / n * 100)}%"></i></div><span class="small muted">${k + 1}/${n}</span></div>
    <span class="chip">✏️ Exercice corrigé</span>
    <div class="card pop" style="margin-top:10px">
      <h2>${e.title}</h2>
      <div class="question">${e.enonce}</div>
      ${e.ans != null ? `<p class="small muted">Fais le calcul sur ton cahier, tape ta réponse, puis vérifie.</p>
      <div class="answer"><input id="exans" inputmode="decimal" autocomplete="off" placeholder="Ta réponse"><span class="unit">${esc(e.unit || '')}</span></div>
      <button class="btn" id="excheck">Vérifier ma réponse</button><div id="exfb"></div>`
      : `<p class="small muted">Essaie d’abord sur ton cahier, puis révèle la correction étape par étape.</p>`}
      <ol class="steps" id="steps"></ol>
      <div id="end"></div>
      <button class="btn ghost" id="reveal">Voir l’étape 1</button>
    </div>
    <div class="actions">${k > 0 ? '<button class="btn ghost" id="prev">← Avant</button>' : '<span></span>'}
      <button class="btn" id="next">${k === n - 1 ? 'Terminer ✓' : 'Exercice suivant →'}</button></div>`);
  const btn = document.getElementById('reveal');
  const ck = document.getElementById('excheck');
  if (ck) {
    let tries = 0;
    const check = () => {
      const raw = document.getElementById('exans').value, x = parseNum(raw), out = document.getElementById('exfb');
      if (x === null) { out.innerHTML = '<div class="fb hint">Écris un nombre, par exemple 3,25</div>'; return; }
      tries++;
      const tol = e.tol ?? Math.max(Math.abs(e.ans) * 0.01, 0.01), ok = Math.abs(x - e.ans) <= tol;
      if (ok) {
        out.innerHTML = `<div class="fb good pop"><b>Bravo, c’est juste !</b>${tries === 1 ? ' +5 XP' : ''} Regarde quand même la correction pour vérifier ta méthode.</div>`;
        if (tries === 1) addXP(5);
        ck.remove();
      } else {
        const g = genericError(x, e.ans);
        if (tries === 1 && skillActive(c.skills[0])) addReview(c.skills[0], 2, g ? g.code : 'autre');
        out.innerHTML = `<div class="fb bad pop"><b>Pas encore.</b> ${g ? g.msg : 'Vérifie ton calcul.'} ${tries >= 2 ? 'Révèle l’étape 1 pour te débloquer.' : 'Tu peux réessayer.'}</div>`;
      }
      if (ok || tries === 1) logAttempt({ mode: 'cours', skill: c.skills[0], item_id: `${id}-e${k}`, level: 2, correct: ok, tries, hints: shown, error_code: ok ? null : (genericError(x, e.ans) || {}).code || 'autre', answer: String(raw).slice(0, 60), question: stripTags(e.enonce).slice(0, 400), ms: 0 });
      saveState();
    };
    ck.onclick = check;
    document.getElementById('exans').onkeydown = (ev) => { if (ev.key === 'Enter') check(); };
  }
  btn.onclick = () => {
    if (shown < e.steps.length) {
      document.getElementById('steps').insertAdjacentHTML('beforeend', `<li class="pop">${e.steps[shown]}</li>`);
      shown++;
      btn.textContent = shown < e.steps.length ? `Voir l’étape ${shown + 1}` : 'Voir la réponse rédigée';
    } else {
      document.getElementById('end').innerHTML = `<div class="fb good pop">✍️ ${e.rep}</div>${e.piege ? `<div class="piege pop">⚠️ Piège : ${e.piege}</div>` : ''}`;
      btn.remove();
      if (!p.exos.includes(k)) { p.exos.push(k); addXP(5); saveState(); }
    }
  };
  document.getElementById('back').onclick = screenCours;
  const pv = document.getElementById('prev'); if (pv) pv.onclick = () => screenExo(id, k - 1);
  document.getElementById('next').onclick = () => k === n - 1 ? finishLesson(id) : screenExo(id, k + 1);
}

/* ---------- Déroulé d'une série d'exercices ---------- */
let RUN = null;
const WARM = 'warmup';
function startRun(mode, skill, preset, isMission) {
  RUN = { mode, skill, mission: !!isMission, idx: 0, results: [], xp0: S.xp, medals0: SKILLS.map((s) => medalOf(S.mastery[s.id])), started: Date.now() };
  if (preset) { RUN.items = preset; RUN.total = preset.length; }
  else if (mode === 'diag') { RUN.block = nextDiagBlock(); RUN.items = buildDiagnostic(RUN.block); RUN.total = RUN.items.length; }
  else if (mode === 'boss') {
    const e = nextExam();
    const ex = e && e.days <= 7 ? (e.skills || []).filter((k) => GENERATORS[k]) : [];
    const base = ex.length ? ex : activeSkills();
    let ids = shuffle(base); while (ids.length < 8) ids = ids.concat(shuffle(base)); ids = ids.slice(0, 8);
    RUN.items = ids.map((s) => generate(s, s === 'V1' || s === 'V6' || s === 'E2' || s === 'P2' ? 2 : pick([2, 3])));
    RUN.total = 8; RUN.deadline = Date.now() + 20 * 60 * 1000;
  } else if (mode === 'bat') {
    RUN.items = shuffle(V8_QCM.filter((b) => b.bat)).slice(0, 5).map((b) => qcmFrom('V8', b, { bat: true }));
    RUN.total = RUN.items.length;
  } else if (mode === 'review') {
    RUN.items = dueReviews().slice(0, 8).map(itemFromReview); RUN.total = RUN.items.length;
    if (!RUN.total) { RUN = null; return screenHome(); }
  } else if (mode === 'redac') { RUN.total = 4; }
  else if (mode === 'focus') { RUN.total = 5; }
  else if (mode === 'prep') {
    const e = nextExam(); RUN.only = (e && e.skills && e.skills.length ? e.skills : activeSkills()).filter((k) => GENERATORS[k]);
    RUN.pre = dueReviews(RUN.only).slice(0, 3).map(itemFromReview); RUN.total = 8;
  } else { RUN.pre = dueReviews().slice(0, 4).map(itemFromReview); RUN.total = 10; }
  nextItem();
}
function nextRedac() {
  S.redacLv = S.redacLv || {};
  const done = RUN.results.map((r) => r.skill);
  const pool = REDAC_SKILLS.filter((k) => !done.includes(k));
  const sk = pool.sort((a, b) => S.mastery[a] - S.mastery[b] + (Math.random() - 0.5) * 30)[0] || pick(REDAC_SKILLS);
  return genRedac(sk, S.redacLv[sk] || 1);
}
function nextItem() {
  if (RUN.idx >= RUN.total) return finishRun();
  let item;
  if (RUN.items) item = RUN.items[RUN.idx];
  else if (RUN.pre && RUN.idx < RUN.pre.length) item = RUN.pre[RUN.idx];
  else if (RUN.mode === 'redac') item = nextRedac();
  else if (RUN.mode === 'focus') {
    const last = RUN.results.slice(-2);
    let lv = levelFor(S.mastery[RUN.skill]);
    if (last.length === 2 && last.every((x) => x.correct && x.clean)) lv++;
    if (last.length === 2 && last.every((x) => !x.correct)) lv--;
    item = generate(RUN.skill, lv);
  } else item = chooseNext(RUN);
  RUN.cur = { item, tries: 0, hints: 0, firstErr: null, t0: Date.now(), done: false, answers: [], conf: null, sel: null };
  if ((RUN.mode === 'train' || RUN.mode === 'focus' || RUN.mode === 'prep') && !S.seenFiche[item.skill] && !item.reviewId) return screenFicheFirst(item.skill);
  screenItem();
}
function askQuit() {
  if (document.getElementById('qmodal')) return;
  const test = RUN && (RUN.mode === 'diag' || RUN.mode === 'boss');
  const msg = RUN && RUN.mode === 'diag' ? 'Ce bloc reprendra depuis le début la prochaine fois.'
    : RUN && RUN.mode === 'boss' ? 'Ce contrôle blanc ne sera pas noté. Tu pourras le retenter quand tu veux.'
    : 'Tout ce que tu as fait est déjà enregistré (XP, médailles, progrès).';
  document.body.insertAdjacentHTML('beforeend', `<div class="modal" id="qmodal" role="dialog" aria-modal="true"><div class="card stack pop">
    <h2>Quitter ${test ? 'maintenant' : 'la séance'} ?</h2><p class="muted">${msg}</p>
    <div class="actions"><button class="btn ghost" id="qno">Continuer</button><button class="btn" id="qyes">Quitter</button></div></div></div>`);
  const close = () => { const m = document.getElementById('qmodal'); if (m) m.remove(); };
  document.getElementById('qno').onclick = close;
  document.getElementById('qmodal').onclick = (e) => { if (e.target.id === 'qmodal') close(); };
  document.getElementById('qyes').onclick = () => { close(); stopTimer(); saveState(); flush(); RUN = null; route(); };
}
function screenFicheFirst(id) {
  render(`<div class="row" style="margin-bottom:10px"><button class="quitbtn" id="quit">✕ Quitter</button></div>
    <div class="card stack pop"><span class="chip">📘 Nouvelle fiche</span>${ficheHtml(id)}<button class="btn" id="go">J’ai lu, on s’entraîne</button></div>`);
  document.getElementById('quit').onclick = askQuit;
  document.getElementById('go').onclick = () => { S.seenFiche[id] = true; saveState(); RUN.cur.t0 = Date.now(); screenItem(); };
}
const RUN_LABEL = { diag: 'Bilan', train: 'Séance', boss: 'Boss', bat: 'Enquête', focus: 'Entraînement', redo: 'Rattrapage', warmup: 'Échauffement', review: 'À revoir', prep: 'Spécial contrôle', redac: 'Rédaction' };
function headerHtml() {
  const it = RUN.cur.item, sk = SKILLS.find((s) => s.id === it.skill);
  const pct = Math.round(RUN.idx / RUN.total * 100);
  const tag = it.fromCopie ? '<span class="chip warn">📝 De ton contrôle</span>' : it.reviewId ? '<span class="chip warn">🔁 À revoir</span>' : '';
  return `<div class="row" style="margin-bottom:10px"><button class="quitbtn" id="quit">✕ Quitter</button><div class="progress"><i style="width:${pct}%"></i></div>
      <span class="small muted">${RUN.idx + 1}/${RUN.total}</span>${RUN.mode === 'boss' ? '<span class="pill timer" id="timer"></span>' : ''}</div>
    <div class="row between wrap"><span class="chip">${sk.icon} ${sk.name}</span>${tag}<span class="small muted">${RUN_LABEL[RUN.mode] || ''}</span></div>`;
}
const isTest = () => RUN.mode === 'diag' || RUN.mode === 'boss';
/* Indice de confiance : demandé une fois, après « Valider » (« sûre / j'hésite / au hasard ») */
function askConf(cb) {
  if (document.getElementById('csheet')) return;
  if (document.activeElement) document.activeElement.blur();
  document.body.insertAdjacentHTML('beforeend', `<div class="modal sheet-bg" id="csheet" role="dialog" aria-modal="true"><div class="card sheet stack pop">
    <b>Tu réponds en étant…</b>
    <div class="conf"><button class="btn ghost" data-c="sure">✅<br>sûre</button><button class="btn ghost" data-c="hesite">🤔<br>j’hésite</button><button class="btn ghost" data-c="hasard">🎲<br>au hasard</button></div>
    <button class="link" id="cback">Changer ma réponse</button></div></div>`);
  const close = () => { const m = document.getElementById('csheet'); if (m) m.remove(); };
  document.getElementById('cback').onclick = close;
  document.getElementById('csheet').onclick = (e) => { if (e.target.id === 'csheet') close(); };
  document.querySelectorAll('#csheet [data-c]').forEach((b) => b.onclick = () => { close(); cb(b.dataset.c); });
}
function validate() {
  const c = RUN.cur, it = c.item;
  if (c.done) return;
  if (it.type === 'num') { if (parseNum(document.getElementById('ans').value) === null) return fb('hint', 'Écris un nombre, par exemple 3,25'); }
  else if (c.sel == null) return toast('Touche d’abord une réponse.');
  const go = () => it.type === 'num' ? checkNum() : checkQcm(c.sel, $app.querySelectorAll('.choice')[c.sel]);
  if (c.conf) return go();
  askConf((v) => { c.conf = v; go(); });
}
function screenItem() {
  const it = RUN.cur.item;
  if (it.type === 'steps') return screenSteps();
  let body = '';
  if (it.type === 'num') {
    body = `<div class="answer"><input id="ans" inputmode="decimal" enterkeyhint="done" autocomplete="off" placeholder="Ta réponse"><span class="unit">${esc(it.unit)}</span></div>`;
  } else {
    body = `<div class="choices">${it.choices.map((c, i) => `<button class="choice" data-i="${i}">${c.t}</button>`).join('')}</div>`;
  }
  const side = isTest() ? '<button class="btn ghost" id="nsp">Je ne sais pas</button>' : '<button class="btn ghost" id="hint">💡 Indice</button>';
  const btns = `<div id="okrow"><div class="actions one"><button class="btn" id="ok" ${it.type === 'qcm' ? 'disabled' : ''}>Valider</button></div></div><div class="actions one" style="margin-top:8px">${side}</div>`;
  render(`${headerHtml()}
    <div class="card pop">
      <div class="question">${it.q}</div>
      ${it.round ? `<div class="round">${it.round}</div>` : ''}
      ${body}
      <div id="fb"></div>
      <div id="btns">${btns}</div>
    </div>`);
  document.getElementById('quit').onclick = askQuit;
  document.getElementById('ok').onclick = validate;
  if (it.type === 'num') {
    const inp = document.getElementById('ans'); inp.focus({ preventScroll: true });
    inp.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); validate(); } };
  } else {
    $app.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
      if (RUN.cur.done || b.classList.contains('wrong')) return;
      if (RUN.cur.conf) return checkQcm(+b.dataset.i, b); // après une première erreur : on retente directement
      $app.querySelectorAll('.choice').forEach((x) => x.classList.remove('sel'));
      b.classList.add('sel'); RUN.cur.sel = +b.dataset.i;
      document.getElementById('ok').disabled = false;
    });
  }
  const h = document.getElementById('hint'); if (h) h.onclick = showHint;
  const n = document.getElementById('nsp'); if (n) n.onclick = () => { RUN.cur.conf = RUN.cur.conf || 'nsp'; finishItem(false, 'nsp', '—'); };
  if (RUN.mode === 'boss') startTimer();
}
let timerH = null;
function startTimer() {
  stopTimer();
  const tick = () => {
    const left = Math.max(0, RUN.deadline - Date.now());
    const el = document.getElementById('timer');
    if (el) el.textContent = '⏱ ' + Math.floor(left / 60000) + ':' + String(Math.floor(left / 1000) % 60).padStart(2, '0');
    if (left <= 0) { stopTimer(); while (RUN.idx < RUN.total) { const it = RUN.items[RUN.idx]; RUN.results.push({ skill: it.skill, level: it.level, correct: false, clean: false, item: it, answer: '—', tries: ['—'] }); RUN.idx++; } finishRun(); }
  };
  tick(); timerH = setInterval(tick, 1000);
}
function stopTimer() { clearInterval(timerH); timerH = null; }

function fb(cls, html, append) {
  const el = document.getElementById('fb');
  const d = `<div class="fb ${cls} pop">${html}</div>`;
  el.innerHTML = append ? el.innerHTML + d : d;
}
function showHint() {
  const c = RUN.cur, it = c.item;
  if (c.hints >= it.hints.length) { fb('hint', '💡 ' + it.hints[it.hints.length - 1]); return; }
  fb('hint', '💡 ' + it.hints[c.hints]);
  c.hints++;
}
function parseNum(s) {
  const t = String(s).replace(/\s/g, '').replace(',', '.').replace(/[^0-9.\-]/g, '');
  if (!t || isNaN(+t)) return null;
  return +t;
}
const near = (x, v, tol) => Math.abs(x - v) <= tol;
function genericError(x, ans) {
  if (!ans) return null;
  const ratio = x / ans;
  const is = (r) => Math.abs(ratio - r) / r < 0.015;
  if (is(3.6) || is(1 / 3.6)) return { code: 'conv36', msg: 'Ta réponse est 3,6 fois trop grande ou trop petite : vérifie le sens de la conversion km/h ↔ m/s.' };
  if (is(60) || is(1 / 60) || is(3600) || is(1 / 3600)) return { code: 'conv60', msg: 'Il y a un facteur 60 d’écart : vérifie la conversion entre heures, minutes et secondes.' };
  if (is(10) || is(0.1) || is(100) || is(0.01) || is(1000) || is(0.001)) return { code: 'p10', msg: 'Le bon chiffre, mais la virgule n’est pas au bon endroit : vérifie les unités.' };
  return null;
}
function afterFirstTry() { // après une première erreur en QCM : on retouche directement une autre réponse
  const ok = document.getElementById('okrow'); if (ok && RUN.cur.item.type === 'qcm') ok.hidden = true;
}
function checkNum() {
  const c = RUN.cur, it = c.item;
  if (c.done) return;
  const raw = document.getElementById('ans').value;
  const x = parseNum(raw);
  if (x === null) { fb('hint', 'Écris un nombre, par exemple 3,25'); c.conf = c.tries ? c.conf : null; return; }
  const tol = it.tol ?? Math.max(Math.abs(it.ans) * 0.01, 0.01);
  if (near(x, it.ans, tol)) return finishItem(true, null, raw);
  let err = (it.errs || []).find((e) => near(x, e.v, e.tol ?? Math.max(Math.abs(e.v) * 0.01, 0.01)));
  if (!err) err = genericError(x, it.ans) || { code: 'autre', msg: 'Ce n’est pas encore ça.' };
  if (isTest()) return finishItem(false, err.code, raw);
  wrongAttempt(err, raw);
}
function checkQcm(i, btn) {
  const c = RUN.cur, it = c.item, ch = it.choices[i];
  if (c.done || btn.classList.contains('wrong')) return;
  $app.querySelectorAll('.choice').forEach((x) => x.classList.remove('sel'));
  if (ch.ok) { btn.classList.add('right'); return finishItem(true, null, stripTags(ch.t)); }
  if (isTest()) return finishItem(false, ch.code || 'notion', stripTags(ch.t));
  btn.classList.add('wrong');
  wrongAttempt({ code: ch.code || 'notion', msg: ch.msg || 'Ce n’est pas ça.' }, stripTags(ch.t), true);
}
function wrongAttempt(err, raw, isQcm) {
  const c = RUN.cur, it = c.item;
  c.tries++; c.answers.push(raw);
  if (!c.firstErr) c.firstErr = err.code;
  afterFirstTry();
  const maxTries = isQcm ? Math.min(2, it.choices.length - 1) : 3;
  if (c.tries >= maxTries) return finishItem(false, c.firstErr, raw, err.msg);
  let html = `<b>Pas encore.</b> ${err.msg}`;
  if (c.tries === 1 && c.conf === 'sure') html += '<br><span class="small">Tu étais sûre de toi : c’est justement l’erreur à bien comprendre.</span>';
  fb('bad', html);
  if (c.hints < it.hints.length) { fb('hint', '💡 ' + it.hints[c.hints], true); c.hints++; }
  if (!isQcm) { const inp = document.getElementById('ans'); inp.select(); }
}

/* ---------- Mode rédaction : un problème en étapes ---------- */
function screenSteps() {
  const c = RUN.cur, it = c.item;
  c.si = c.si ?? it.steps.findIndex((s) => !s.given); c.fails = c.fails || 0; c.reveals = c.reveals || 0; c.stepTry = 0; c.unitSel = null;
  const done = (s, k) => `<div class="step ${s.given ? 'given' : s.res === 'ok' ? 'ok' : 'ko'}"><span class="small muted">${s.given ? 'Donné' : s.res === 'ok' ? '✓' : 'Corrigé'} • ${s.label}</span><div>${s.show}</div></div>`;
  const cur = it.steps[c.si];
  let active = '';
  if (cur) {
    active = `<div class="step cur pop"><span class="small muted">Étape ${c.si + 1}/${it.steps.length} • ${cur.label}</span><div class="question" style="margin:6px 0">${cur.prompt}</div>`;
    if (cur.kind === 'qcm') active += `<div class="choices">${cur.choices.map((ch, j) => `<button class="choice" data-j="${j}">${ch.t}</button>`).join('')}</div>`;
    else active += `<div class="answer"><input id="sans" inputmode="decimal" autocomplete="off" placeholder="Ton résultat">${cur.units ? '' : `<span class="unit">${esc(cur.unit)}</span>`}</div>
      ${cur.units ? `<p class="small muted" style="margin:8px 0 4px">L’unité :</p><div class="units">${cur.units.map((u) => `<button class="chipbtn" data-u="${esc(u)}">${esc(u)}</button>`).join('')}</div>` : ''}
      <div class="actions" style="margin-top:10px"><button class="btn ghost" id="sdk">Je bloque</button><button class="btn" id="sok">Valider</button></div>`;
    active += `<div id="sfb"></div></div>`;
  }
  const keys = [...it.q.matchAll(/<b>(.*?)<\/b>/g)].map((m) => stripTags(m[1])).filter((x) => /\d/.test(x));
  const firstStep = c.si === it.steps.findIndex((s) => !s.given);
  render(`${headerHtml()}
    <details class="enonce" ${firstStep ? 'open' : ''}><summary><b>📄 L’énoncé</b>${keys.length ? ` <span class="small">${keys.map(esc).join(' • ')}</span>` : ''}</summary><div class="question" style="margin:8px 0 0">${it.q}</div></details>
    <div class="card pop">
      <p class="small muted">${it.level === 1 ? 'Le début est fait pour toi : lis-le, puis termine.' : it.level === 2 ? 'La formule est donnée : à toi la suite.' : 'Tout est à toi, comme sur ta copie.'}</p>
      <div class="steps-wrap">${it.steps.slice(0, c.si).map(done).join('')}${active}</div>
      <div id="fb"></div><div id="btns"></div>
    </div>`);
  document.getElementById('quit').onclick = askQuit;
  if (!cur) return;
  const sfb = (cls, h) => { document.getElementById('sfb').innerHTML = `<div class="fb ${cls} pop">${h}</div>`; };
  const advance = (ok, code) => {
    cur.res = ok ? 'ok' : 'ko';
    if (!ok) { c.reveals++; if (!c.firstErr) c.firstErr = code || 'autre'; }
    if (cur.label === 'La phrase réponse') c.phraseOk = ok && c.stepTry === 0;
    c.si++;
    while (it.steps[c.si] && it.steps[c.si].given) c.si++;
    if (c.si >= it.steps.length) {
      const correct = c.reveals === 0, clean = correct && c.fails === 0;
      c.tries = c.fails; c.clean = clean;
      screenSteps();
      return finishItem(correct, correct ? (c.firstErr || null) : c.firstErr, 'rédaction');
    }
    setTimeout(screenSteps, ok ? 350 : 0);
  };
  const miss = (msg, code) => {
    c.fails++; if (!c.firstErr) c.firstErr = code;
    if (c.stepTry === 0) { c.stepTry = 1; sfb('bad', `<b>Pas encore.</b> ${msg}`); return; }
    sfb('bad', `${msg}<br><b>La bonne étape :</b> ${cur.show}`);
    const b = document.createElement('button'); b.className = 'btn'; b.textContent = 'Compris, étape suivante'; b.style.marginTop = '8px';
    b.onclick = () => advance(false, code); document.getElementById('sfb').appendChild(b);
    $app.querySelectorAll('.step.cur button:not(.btn)').forEach((x) => x.disabled = true);
    const sok = document.getElementById('sok'); if (sok) sok.disabled = true;
  };
  if (cur.kind === 'qcm') {
    $app.querySelectorAll('.step.cur .choice').forEach((b) => b.onclick = () => {
      if (b.classList.contains('wrong') || b.disabled) return;
      const ch = cur.choices[+b.dataset.j];
      if (ch.ok) { b.classList.add('right'); return advance(true); }
      b.classList.add('wrong'); miss(ch.msg || 'Ce n’est pas ça.', ch.code || 'question');
    });
  } else {
    $app.querySelectorAll('.units .chipbtn').forEach((b) => b.onclick = () => { $app.querySelectorAll('.units .chipbtn').forEach((x) => x.classList.remove('on')); b.classList.add('on'); c.unitSel = b.dataset.u; });
    const check = () => {
      const x = parseNum(document.getElementById('sans').value);
      if (x === null) return sfb('hint', 'Écris un nombre, par exemple 3,25');
      if (cur.units && !c.unitSel) return sfb('hint', 'Choisis aussi l’unité.');
      const tol = cur.tol ?? Math.max(Math.abs(cur.ans) * 0.01, 0.01);
      const okN = near(x, cur.ans, tol), okU = !cur.units || c.unitSel === cur.unit;
      if (okN && okU) return advance(true);
      if (okN) return miss(`Le nombre est juste, mais pas l’unité. Ici on cherche ${cur.unit === 'm' ? 'une distance en mètres' : cur.unit === 's' || cur.unit === 'min' ? 'une durée' : cur.unit === 'km/h' || cur.unit === 'm/s' ? 'une vitesse' : 'une grandeur en ' + cur.unit}.`, 'unite');
      const e = (cur.errs || []).find((er) => near(x, er.v, Math.max(Math.abs(er.v) * 0.01, 0.01))) || genericError(x, cur.ans) || { code: 'autre', msg: 'Vérifie ton calcul.' };
      miss(e.msg, e.code);
    };
    document.getElementById('sok').onclick = check;
    document.getElementById('sans').onkeydown = (ev) => { if (ev.key === 'Enter') check(); };
    document.getElementById('sdk').onclick = () => { c.stepTry = 1; miss('Pas grave, regarde comment on fait.', 'nsp'); };
    document.getElementById('sans').focus({ preventScroll: true });
  }
}

function finishItem(correct, errCode, raw, lastMsg) {
  const c = RUN.cur, it = c.item;
  if (c.done) return; c.done = true;
  const ms = Math.min(Date.now() - c.t0, 300000);
  S.timeMs += ms;
  const clean = it.type === 'steps' ? !!c.clean : correct && c.tries === 0 && c.hints === 0;
  const conf = c.conf || null;
  const lucky = correct && conf === 'hasard';
  const code = correct ? (lucky ? 'hasard' : c.firstErr || null) : (errCode || c.firstErr || 'autre');
  RUN.results.push({ skill: it.skill, level: it.level, correct, clean, code, conf, item: it, answer: raw, tries: (c.answers || []).concat((c.answers || [])[(c.answers || []).length - 1] === raw ? [] : [raw]), hintsUsed: c.hints });
  logAttempt({ mode: RUN.mode, skill: it.skill, item_id: it.id, level: it.level, correct, tries: c.tries + 1, hints: c.hints, error_code: code, answer: String(raw).slice(0, 60), question: stripTags(it.q).slice(0, 400), ms, conf });

  // Révision espacée
  if (it.reviewId) reviewResult(it.reviewId, clean && !lucky);
  else if (!clean || lucky) addReview(it.skill, it.level, code || 'autre', { redac: it.type === 'steps' });

  if (RUN.mode === 'diag') { addXP(5); saveState(); RUN.idx++; return nextItem(); }
  if (RUN.mode === 'boss') { RUN.idx++; return nextItem(); }

  let gained = correct ? (lucky ? 5 : clean ? 15 : 10) : 2;
  if (RUN.mode === 'bat' && correct) gained += 5;
  if (it.type === 'steps' && correct) gained += 5;
  addXP(gained);
  updateMasteryAfter(it, correct, clean, conf);
  if (it.type === 'steps') {
    S.redacLv = S.redacLv || {};
    const lv = S.redacLv[it.skill] || 1;
    S.redacLv[it.skill] = clean ? Math.min(3, lv + 1) : !correct ? Math.max(1, lv - 1) : lv;
    if (c.phraseOk && it.skill !== 'V8') updateMasteryAfter({ skill: 'V8', level: it.level }, true, true, 'sure');
  }
  saveState();

  const fbEl = document.getElementById('fb');
  const method = it.type === 'steps' ? `<div class="fb sol small"><b>Ta copie, rédigée en entier :</b><ol>${it.sol.map((s) => `<li>${s}</li>`).join('')}</ol></div>`
    : it.sol && it.sol.length && it.type === 'num' ? `<div class="fb sol small"><b>La méthode :</b><ol>${steps(it).map((s) => `<li>${s}</li>`).join('')}</ol></div>`
    : it.type === 'qcm' && (it.why || it.hints[0]) ? `<div class="fb sol small"><b>📌 Pourquoi :</b> ${it.why || it.hints[0]}</div>` : '';
  if (correct) {
    const cheers = ['Bravo !', 'Exact !', 'Bien joué !', 'Parfait !', 'Yes !', 'Top !'];
    fbEl.innerHTML = `<div class="fb good pop"><b>${pick(cheers)}</b> +${gained} XP${clean && !lucky ? ' • du premier coup 🎯' : ''}${lucky ? '<br><span class="small">Juste, mais au hasard : cet exercice reviendra demain pour vérifier que tu as compris.</span>' : conf === 'hesite' && clean ? '<br><span class="small">Tu hésitais, et c’était juste : fais-toi confiance !</span>' : ''}${it.reviewId && clean && !lucky ? '<br><span class="small">🔁 Révision réussie : on le reverra plus tard pour être sûr que ça reste.</span>' : ''}</div>` + method;
  } else {
    if (it.type === 'qcm') { const good = $app.querySelectorAll('.choice')[it.choices.findIndex((x) => x.ok)]; if (good) good.classList.add('right'); }
    fbEl.innerHTML = (lastMsg ? `<div class="fb bad">${lastMsg}</div>` : '')
      + (it.type === 'steps' ? method : `<div class="fb sol"><b>${it.type === 'num' ? `La réponse : ${fr(it.ans)} ${esc(it.unit)}` : 'Retiens bien la bonne réponse en vert.'}</b>${it.type === 'num' && it.sol && it.sol.length ? `<ol>${steps(it).map((s) => `<li>${s}</li>`).join('')}</ol>` : it.hints && it.hints[0] ? `<p style="margin:6px 0 0">📌 ${it.hints[0]}</p>` : ''}</div>`)
      + `<div class="small muted">Pas grave : cet exercice reviendra demain sous une autre forme. +2 XP pour l’effort.</div>`;
  }
  document.getElementById('btns').innerHTML = `<div class="actions one"><button class="btn ${correct ? 'good' : ''}" id="next">Continuer</button></div>`;
  const nb = document.getElementById('next'); nb.focus({ preventScroll: true });
  nb.onclick = () => { RUN.idx++; nextItem(); };
}

function steps(it) {
  const st = (it.sol || []).slice();
  if (it.type === 'num' && st.length < 2 && it.hints && it.hints[0] && !st.some((x) => stripTags(x) === stripTags(it.hints[0]))) st.unshift(it.hints[0]);
  return st;
}
function reviewCard(r, i) {
  const it = r.item, sk = SKILLS.find((x) => x.id === r.skill);
  const status = r.clean && r.conf === 'hasard' ? ['st-mid', 'Juste, mais au hasard'] : r.clean ? ['st-ok', 'Juste du premier coup'] : r.correct ? ['st-mid', 'Juste après ' + (r.tries.length > 1 ? 'une erreur' : 'un indice')] : ['st-low', 'À revoir'];
  if (it.type === 'steps') {
    return `<details class="card rev" ${r.clean ? '' : 'open'}>
    <summary><span class="chip">${sk.icon} ${i + 1}. Rédaction</span> <span class="status ${status[0]}">${status[1]}</span></summary>
    <div class="question small" style="font-size:.95em">${it.q}</div>
    ${r.code && !r.clean && ERR_LABELS[r.code] ? `<p class="small">🔎 L’erreur repérée : <b>${esc(ERR_LABELS[r.code])}</b></p>` : ''}
    <div class="fb sol small"><b>La copie complète :</b><ol>${it.sol.map((x) => `<li>${x}</li>`).join('')}</ol></div></details>`;
  }
  const good = it.type === 'num' ? `${fr(it.ans)} ${esc(it.unit)}` : it.choices.find((c) => c.ok).t;
  const wrong = (r.correct ? r.tries.slice(0, -1) : r.tries).filter((a, k, arr) => a && a !== '—' && arr.indexOf(a) === k);
  let why = '';
  if (it.type === 'qcm') {
    const msgs = wrong.map((a) => (it.choices.find((c) => stripTags(c.t) === a) || {}).msg).filter(Boolean);
    why = msgs.map((m) => `<p class="small" style="margin:6px 0 0">❓ ${m}</p>`).join('') + (it.hints && it.hints[0] ? `<p class="small" style="margin:6px 0 0">📌 ${it.hints[0]}</p>` : '');
  } else if (steps(it).length) {
    why = `<b class="small">Le calcul, étape par étape :</b><ol class="small">${steps(it).map((x) => `<li>${x}</li>`).join('')}</ol>`;
    if (r.code && r.code !== 'nsp' && ERR_LABELS[r.code] && !r.clean) why = `<p class="small" style="margin:0 0 6px">🔎 L’erreur repérée : <b>${esc(ERR_LABELS[r.code])}</b></p>` + why;
  }
  return `<details class="card rev" ${r.clean ? '' : 'open'}>
    <summary><span class="chip">${sk.icon} ${i + 1}. ${sk.short}</span> <span class="status ${status[0]}">${status[1]}</span></summary>
    <div class="question small" style="font-size:.95em">${it.q}</div>
    ${wrong.length ? `<p class="small">Tu avais répondu : ${wrong.map((a) => `<s>${esc(a)}</s>`).join(', ')}</p>` : ''}
    <div class="fb sol small"><b>Bonne réponse : ${good}</b>${why ? `<div style="margin-top:6px">${why}</div>` : ''}</div>
  </details>`;
}
function screenReview(run) {
  const res = run.results, nOk = res.filter((r) => r.clean).length;
  render(`
    <button class="quitbtn" id="back">← Retour</button>
    <h1 style="margin-top:12px">Revoir ma séance</h1>
    <p class="muted small">${nOk} exercice${nOk > 1 ? 's' : ''} juste${nOk > 1 ? 's' : ''} du premier coup sur ${res.length}. Les exercices à revoir sont ouverts ; touche les autres pour les déplier.</p>
    ${res.map(reviewCard).join('')}
    <div class="stack">
      ${res.some((r) => !r.clean) ? `<button class="btn" id="redo">🔁 Refaire les exercices ratés, avec d’autres nombres</button>` : ''}
      <button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
  document.getElementById('back').onclick = screenHome;
  document.getElementById('home').onclick = screenHome;
  const rd = document.getElementById('redo'); if (rd) rd.onclick = () => startRedo(run);
}
function startRedo(run) {
  const missed = run.results.filter((r) => !r.clean);
  startRun('redo', null, missed.map((r) => r.item.type === 'steps' ? genRedac(r.skill, r.level) : generate(r.skill, r.level)));
}

function finishRun() {
  stopTimer();
  const res = RUN.results, ok = res.filter((r) => r.correct).length;
  const streakMsg = touchStreak();
  S.sessions++;
  if (RUN.mission || RUN.mode === 'diag' || RUN.mode === WARM) missionDone();
  if (RUN.mode === 'diag') return finishDiagBlock(streakMsg);
  if (RUN.mode === WARM) return finishWarmup(streakMsg);
  if (RUN.mode === 'boss') return finishBoss(streakMsg);
  if (RUN.mode === 'bat') S.batDone = (S.batDone || 0) + 1;
  const bonus = 30; addXP(bonus);
  saveState(); flush();
  const newMedals = SKILLS.filter((s, i) => medalOf(S.mastery[s.id]) !== RUN.medals0[i]);
  const rate = res.length ? ok / res.length : 0;
  const msg = rate >= 0.8 ? 'Excellente séance, tu maîtrises de plus en plus !' : rate >= 0.5 ? 'Belle séance. Les erreurs d’aujourd’hui sont les points de demain : elles reviennent demain dans « À revoir ».' : 'Séance difficile, et c’est justement là qu’on progresse le plus. Les exercices ratés reviendront demain, puis dans 3 jours, puis dans une semaine.';
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${rate >= 0.8 ? '🏆' : rate >= 0.5 ? '💪' : '🌱'}</div>
      <h2>Séance terminée !</h2>
      <div class="big-num">${ok}/${res.length}</div>
      <p class="muted">${msg}</p>
      <p><b>+${S.xp - RUN.xp0} XP</b> • 🔥 Série : ${S.streak.count} jour${S.streak.count > 1 ? 's' : ''}</p>
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    ${newMedals.length ? `<div class="card"><h3>Nouvelles médailles</h3>${newMedals.map((s) => `<div class="row between" style="margin:6px 0"><span>${s.icon} ${s.name}</span>${medalHtml(S.mastery[s.id])}</div>`).join('')}</div>` : ''}
    <div class="stack">
      <button class="btn" id="review">📝 ${res.some((r) => !r.clean) ? 'Revoir mes erreurs' : 'Revoir ma séance'}</button>
      <button class="btn ghost" id="home">Retour à l’accueil</button></div>
    <div class="center" style="margin-top:8px">
      ${res.some((r) => !r.clean) ? `<button class="link" id="redo">Refaire les ratés (${res.filter((r) => !r.clean).length}) avec d’autres nombres</button><br>` : ''}
      <button class="link" id="again">Encore une séance</button></div>`);
  const done = RUN;
  document.getElementById('review').onclick = () => screenReview(done);
  const rd = document.getElementById('redo'); if (rd) rd.onclick = () => startRedo(done);
  document.getElementById('again').onclick = () => startRun(['bat', 'focus', 'redac', 'prep'].includes(done.mode) ? done.mode : 'train', done.skill);
  document.getElementById('home').onclick = screenHome;
}

function finishWarmup(streakMsg) {
  const ok = RUN.results.filter((r) => r.correct).length;
  S.onboard = 2; addXP(20); saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">🌟</div>
      <h2>Bien joué !</h2>
      <div class="big-num">${ok}/${RUN.results.length}</div>
      <p class="muted">Étape 2 réussie. Dernière étape : un petit bilan en 3 blocs de 5 questions, un bloc par jour. Tu peux faire le premier maintenant ou plus tard.</p>
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <div class="stack"><button class="btn" id="d1">Faire le bloc 1 maintenant</button><button class="btn ghost" id="home">Découvrir mon espace</button></div>`);
  document.getElementById('d1').onclick = screenDiagIntro;
  document.getElementById('home').onclick = screenHome;
}
function finishDiagBlock(streakMsg) {
  const b = RUN.block || 0;
  S.diagParts = S.diagParts || [];
  S.diagParts[b] = { date: todayStr(), res: RUN.results.map((r) => ({ skill: r.skill, level: r.level, correct: r.correct })) };
  saveState(); flush();
  if (b < 2) {
    const ok = RUN.results.filter((r) => r.correct).length;
    render(`
      <div class="card hero center stack pop">
        <div style="font-size:48px">${b === 0 ? '🥾' : '🧗'}</div>
        <h2>Bloc ${b + 1} sur 3 terminé</h2>
        <p class="muted">${ok} réponse${ok > 1 ? 's' : ''} juste${ok > 1 ? 's' : ''} sur ${RUN.results.length}. Le bloc ${b + 2} t’attend ${role === 'test' ? 'quand tu veux (profil test)' : 'demain'}.</p>
        ${streakMsg ? `<p>${streakMsg}</p>` : ''}
      </div>
      <div class="card small">Les questions ratées reviendront demain dans « À revoir », avec des indices cette fois.</div>
      <button class="btn" id="home">Retour à l’accueil</button>`);
    document.getElementById('home').onclick = screenHome;
    return;
  }
  finishDiag(streakMsg, S.diagParts.flatMap((p) => (p && p.res) || []));
}
function finishDiag(streakMsg, results) {
  const by = {};
  results.forEach((r) => { (by[r.skill] = by[r.skill] || []).push(r); if (r.correct) markOkDay(r.skill); });
  const val = { 1: 40, 2: 62, 3: 75 };
  const diag = {};
  SKILLS.filter((s) => !s.lesson).forEach((s) => {
    const rs = by[s.id] || [];
    let m = rs.length ? 8 : 15;
    const okLv = rs.filter((r) => r.correct).map((r) => r.level);
    if (okLv.length) m = val[Math.max(...okLv)];
    if (okLv.length && rs.some((r) => !r.correct && r.level <= Math.max(...okLv))) m -= 12;
    if (!rs.length) m = 20;
    diag[s.id] = m;
    S.mastery[s.id] = Math.max(S.mastery[s.id] || 0, Math.min(m, dayCap(s.id)));
  });
  S.diagDone = true;
  S.diag = { date: todayStr(), score: results.filter((r) => r.correct).length, total: results.length, skills: diag };
  addXP(20);
  saveState(); flush();
  const st = (m) => m >= 60 ? '<span class="status st-ok">Acquis</span>' : m >= 35 ? '<span class="status st-mid">En cours</span>' : '<span class="status st-low">À travailler</span>';
  const weakest = SKILLS.filter((s) => !s.lesson).sort((a, b) => diag[a.id] - diag[b.id]).slice(0, 2);
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">🧭</div>
      <h2>Merci ${esc(S.pseudo)} !</h2>
      <p class="muted">Voilà ton point de départ. Pas de note : juste une carte pour savoir où aller.</p>
    </div>
    <div class="card"><table>${SKILLS.filter((s) => !s.lesson).map((s) => `<tr><td>${s.icon} ${s.name}</td><td style="text-align:right">${st(diag[s.id])}</td></tr>`).join('')}</table></div>
    <div class="card"><b>On va commencer par :</b> ${weakest.map((s) => s.name).join(' et ')}. Les séances du jour vont s’en occuper en priorité.</div>
    ${streakMsg ? `<p class="center">${streakMsg}</p>` : ''}
    <button class="btn" id="home">Découvrir mon espace</button>`);
  document.getElementById('home').onclick = screenHome;
}

function finishBoss(streakMsg) {
  const res = RUN.results, ok = res.filter((r) => r.correct).length;
  const note = Math.round(ok / RUN.total * 20 * 2) / 2;
  const prev = S.boss.best;
  S.boss.history.push({ date: todayStr(), note });
  if (prev == null || note > prev) S.boss.best = note;
  addXP(ok * 10 + 30);
  res.forEach((r) => updateMasteryAfter(r.item, r.correct, r.correct));
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">${note >= 14 ? '👑' : note >= 10 ? '⚔️' : '🛡️'}</div>
      <h2>Boss ${note >= 10 ? 'vaincu' : 'pas encore vaincu'} !</h2>
      <div class="big-num">${fr(note, 1)}/20</div>
      <p class="muted">${prev != null && note > prev ? `Nouveau record ! (avant : ${fr(prev, 1)})` : prev != null ? `Ton record : ${fr(Math.max(prev, note), 1)}/20` : 'Premier essai enregistré.'}</p>
      ${streakMsg ? `<p>${streakMsg}</p>` : ''}
    </div>
    <h3 style="margin:8px 4px">La correction</h3>
    ${res.map((r, i) => `<div class="card"><div class="row between"><span class="chip">${SKILLS.find((s) => s.id === r.skill).icon} Q${i + 1}</span>${r.correct ? '<span class="status st-ok">Juste</span>' : '<span class="status st-low">À revoir</span>'}</div>
      <p class="small" style="margin-top:8px">${r.item.q}</p>
      ${r.correct ? '' : `<div class="fb sol small"><b>${r.item.type === 'num' ? `Réponse : ${fr(r.item.ans)} ${esc(r.item.unit)}` : 'Réponse : ' + r.item.choices.find((c) => c.ok).t}</b>${r.item.sol && r.item.sol.length ? `<ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol>` : ''}</div>`}</div>`).join('')}
    <button class="btn" id="home">Retour à l’accueil</button>`);
  document.getElementById('home').onclick = screenHome;
}

/* ---------- Tableau de bord parent ---------- */
/* Ce que le parent peut dire à l'élève, pour chaque erreur fréquente */
const ERR_ADVICE = {
  conv36: 'demande-lui si le résultat en m/s doit être plus petit ou plus grand qu’en km/h (plus petit : on divise par 3,6).',
  sec100: '15 s ne s’écrit pas 0,15 min : refaites ensemble 15 ÷ 60 = 0,25 min.',
  base100: 'rappelle-lui que 1 h = 60 min et 1 min = 60 s, jamais 100.',
  minutes: 'pour une vitesse en km/h, la durée doit être en heures : 30 min = 0,5 h.',
  inverse: 'vitesse = distance ÷ durée : la distance en haut, toujours.',
  formule: 'demande-lui d’écrire la formule avant de calculer, à chaque fois.',
  noconv: 'avant de calculer, une question : « mes unités vont-elles ensemble ? »',
  allerretour: 'pour un écho, le son fait l’aller et le retour : on divise la distance totale par 2.',
  oubli_df: 'distance d’arrêt = distance de réaction + distance de freinage : les deux morceaux.',
  oubli_dr: 'distance d’arrêt = distance de réaction + distance de freinage : les deux morceaux.',
  carre: 'dans df = k × v², la vitesse est au carré : v × v.',
  tr_faux: 'relire l’énoncé et souligner les données avant de calculer.',
  pct_total: 'une augmentation en %, c’est (nouveau − ancien) ÷ ancien × 100.',
  question: 'à la fin, lui faire relire la question : « ai-je répondu à ce qui est demandé ? »',
  notion: 'relire avec elle la leçon correspondante dans « Mes cours ».',
  p10: 'un écart de 10, 100 ou 1 000 vient presque toujours d’une conversion d’unités.',
  conv60: 'heures → minutes : × 60 ; minutes → heures : ÷ 60.',
  arrondi: 'garder tous les chiffres jusqu’au bout, arrondir seulement le résultat final.',
  autre: 'regardez ensemble « Derniers exercices » pour voir où ça coince.',
};
/* Erreurs de copie en mots simples : chacune pointe vers une compétence et un type d'erreur */
const COPY_TYPES = [
  ['Conversion km/h ↔ m/s (le 3,6 dans le mauvais sens)', 'V3', 'conv36'],
  ['Secondes écrites comme des centièmes (15 s → 0,15)', 'V2', 'sec100'],
  ['Conversion heures / minutes / secondes', 'V2', 'conv60'],
  ['Vitesse calculée à l’envers (temps ÷ distance)', 'V4', 'inverse'],
  ['Mauvaise formule pour une distance ou une durée', 'V5', 'formule'],
  ['Écho : oubli de diviser par 2', 'V6', 'allerretour'],
  ['Distance d’arrêt : un morceau oublié (réaction ou freinage)', 'V7', 'oubli_df'],
  ['Arrondi trop tôt ou virgule mal placée', 'V8', 'arrondi'],
  ['N’a pas répondu à la question posée', 'V8', 'question'],
  ['Notion de cours pas comprise (mouvement, référentiel…)', 'V1', 'notion'],
];
const KPI_HELP = [
  ['Temps total', (s, t) => `${Math.round((t.ms || 0) / 60000)} min en ${s.sessions} séance${s.sessions > 1 ? 's' : ''}`, 'Temps passé sur les exercices, depuis le début.'],
  ['Niveau et XP', (s) => `niveau ${levelInfo(s.xp).lvl} • ${s.xp} XP • série 🔥 ${s.streak.count}`, 'Points gagnés en s’entraînant ; la série compte les jours d’affilée.'],
  ['Rédaction (7 j)', (s, t) => t.redac7 ? `${Math.round(t.redacok7 / t.redac7 * 100)} % sur ${t.redac7} problème(s)` : 'pas encore', 'Problèmes rédigés en entier (formule, conversion, calcul, phrase) sans aide.'],
  ['Justes « au hasard » (7 j)', (s, t) => `${t.lucky7 || 0}`, 'Bonnes réponses qu’elle a déclarées au hasard : elles reviennent le lendemain pour vérifier.'],
  ['Faux alors que « sûre » (7 j)', (s, t) => `${t.surewrong7 || 0}`, 'Erreurs faites en se croyant sûre : ce sont les idées fausses à corriger en priorité.'],
  ['File « À revoir »', (s) => `${(s.review || []).length} exercice(s)`, 'Chaque erreur revient à J+1, J+3, J+7 puis J+21 jusqu’à être réussie.'],
  ['Démarrage', (s) => s.diagDone ? `bilan terminé le ${s.diag.date.split('-').reverse().join('/')} (${s.diag.score}/${s.diag.total})` : `${(s.diagParts || []).filter(Boolean).length}/3 blocs du bilan`, 'Bilan de départ en 3 blocs de 5 questions, un par jour.'],
];
const isOpen = (s, k) => !k.lesson || !!((s.cours || {})[k.lesson] || {}).done;
function weekCard(s, st) {
  const t = st.totals || {}, days = st.days || [];
  const d7 = []; for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() - i); d7.push(d.toISOString().slice(0, 10)); }
  const active = days.filter((d) => d7.includes(d.day) && d.n > 0).length;
  const feu = active >= 4 ? 'g' : active >= 2 ? 'o' : 'r';
  const reg = `<span class="feu ${feu}"></span><b>Régularité :</b> ${active} jour${active > 1 ? 's' : ''} sur 7, ${t.n7 || 0} exercices${t.n7 ? ` (${Math.round(t.ok7 / t.n7 * 100)} % de réussite)` : ''}. ${feu === 'g' ? 'Très bien, c’est le bon rythme.' : feu === 'o' ? 'Objectif : 4 jours par semaine, même 10 minutes.' : 'Elle a peu pratiqué : un petit mot pour l’encourager à faire sa mission du jour.'}`;
  const gains = SKILLS.filter((k) => isOpen(s, k)).map((k) => ({ k, g: s.mastery[k.id] - ((s.diag && s.diag.skills && s.diag.skills[k.id]) ?? 0) })).sort((a, b) => b.g - a.g);
  const best = gains[0];
  const prog = best && best.g > 0 ? `<b>Progrès :</b> ${best.k.icon} ${best.k.name}, ${medalOf(s.mastery[best.k.id]) !== 'none' ? `médaille ${MEDAL_TXT[medalOf(s.mastery[best.k.id])].toLowerCase()}, ` : ''}+${best.g} points depuis ${s.diag ? 'le bilan de départ' : 'le début'}.`
    : '<b>Progrès :</b> pas encore de progrès net mesuré. Les médailles demandent des réussites sur plusieurs jours.';
  const err = (st.errors || []).find((e) => !['nsp', 'hasard'].includes(e.code));
  const att = err ? `<b>À travailler :</b> ${esc(ERR_LABELS[err.code] || err.code)} (${err.n} fois en 30 jours). Ce que tu peux lui dire : ${ERR_ADVICE[err.code] || ERR_ADVICE.autre}`
    : '<b>À travailler :</b> pas d’erreur qui se répète pour l’instant.';
  const e = nextExam();
  let ex = '';
  if (e && e.days <= 7) {
    const from = addDays(e.day, -7), done = (s.boss.history || []).filter((h) => h.date >= from);
    ex = `<li>📅 <b>Contrôle ${examWhen(e)}</b> (${esc(e.label || 'physique')}) : ${done.length ? `contrôle blanc fait, ${fr(done[done.length - 1].note, 1)}/20.` : e.days <= 2 ? '<b>contrôle blanc pas encore fait</b>, c’est le moment.' : 'l’appli lui propose chaque jour un programme spécial.'}</li>`;
  }
  return `<div class="card week ${feu} stack"><h2>Cette semaine</h2><ul><li>${reg}</li><li>📈 ${prog}</li><li>🎯 ${att}</li>${ex}</ul></div>`;
}
function trend(s, k) {
  const h = s.mHist || {}, keys = Object.keys(h).sort(), ref = addDays(todayStr(), -7);
  const old = keys.filter((d) => d <= ref).pop() || keys[0];
  if (!old || old === todayStr() || h[old][k] == null) return '';
  const d = s.mastery[k] - h[old][k];
  return d > 0 ? `<span class="up" title="+${d} en 7 jours">▲</span>` : d < 0 ? `<span class="down" title="${d} en 7 jours">▼</span>` : '<span class="eq">=</span>';
}
async function screenParent() {
  render('<p class="center muted" style="margin-top:40px">Chargement…</p>');
  let data;
  try { data = await rpc('rv_dashboard', { p_token: token }); } catch (e) { render('<p class="center">Pas de connexion.</p><button class="btn" onclick="screenParent()">Réessayer</button>'); return; }
  if (data.error) return logout(true);
  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais';
  const studs = data.students || [];
  FAM = data.family || {}; INVITES = data.invites || [];
  PLAN = data.plan || [];
  const planOk = Array.isArray(data.plan);
  render(`
    <div class="row between" style="margin-bottom:12px"><h1>Tableau de bord</h1><button class="btn small ghost" id="ref">Actualiser</button></div>
    ${studs.length ? '' : welcomeCard()}
    ${studs.map((st, si) => {
      const s = Object.assign(defaultState(), st.state || {});
      s.mastery = Object.assign(defaultState().mastery, s.mastery);
      const t = st.totals || {};
      const name = s.pseudo || st.label;
      const days = st.days || [];
      const maxN = Math.max(1, ...days.map((d) => d.n));
      const last14 = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); const f = days.find((x) => x.day === k); last14.push(f ? f.n : 0); }
      const d7 = days.filter((d) => dayDiff(d.day, todayStr()) < 7 && d.n > 0).length;
      const open = SKILLS.filter((k) => isOpen(s, k)), closed = SKILLS.length - open.length;
      return `
      <div class="row between" style="margin:6px 4px 10px"><h2>${esc(name)}</h2><span class="small muted">Dernière activité : ${fmtDate(t.last)}</span></div>
      ${(st.devices || []).length ? weekCard(s, st) : ''}
      ${accessCard(st, s)}
      ${si === 0 ? planCard(planOk) : ''}
      <div class="card stack">
        <div class="kpis">
          <div class="kpi"><span class="small muted">Jours actifs (7 j)</span><b>${d7}/7</b><span class="small muted">${t.n7 || 0} exercices</span></div>
          <div class="kpi"><span class="small muted">Réussite (7 j)</span><b>${t.n7 ? Math.round(t.ok7 / t.n7 * 100) + ' %' : '—'}</b><span class="small muted">depuis le début : ${t.n ? Math.round(t.ok / t.n * 100) : 0} %</span></div>
          <div class="kpi"><span class="small muted">À revoir aujourd’hui</span><b>${(s.review || []).filter((r) => r.due <= todayStr()).length}</b><span class="small muted">exercices ratés qui reviennent</span></div>
          <div class="kpi"><span class="small muted">Contrôle blanc</span><b>${s.boss.best != null ? fr(s.boss.best, 1) + '/20' : '—'}</b><span class="small muted">${s.boss.history.length ? `${s.boss.history.length} essai(s)` : 'pas encore tenté'}</span></div>
        </div>
        <div><b class="small">Activité sur 14 jours</b><div class="days" style="margin-top:6px">${last14.map((n) => `<i style="height:${Math.round(n / maxN * 100)}%" title="${n}"></i>`).join('')}</div></div>
        <details><summary><b>Détails</b> <span class="small muted">(autres indicateurs expliqués)</span></summary>
          <table style="margin-top:6px">${KPI_HELP.map(([l, f, h]) => `<tr><td><b>${l}</b> : ${f(s, t)}<br><span class="small muted">${h}</span></td></tr>`).join('')}</table></details>
        <button class="btn ghost" data-pv="${si}">👀 Voir l’appli comme ${esc(name)}</button>
      </div>
      <div class="card stack">
        <h3>Maîtrise par compétence</h3>
        <table class="mt">${open.map((k) => `<tr><td>${k.icon} ${k.name}</td><td style="text-align:right;white-space:nowrap">${medalHtml(s.mastery[k.id])} ${trend(s, k.id)}</td></tr>`).join('')}</table>
        <p class="small muted" style="margin:0">▲ ▼ = évolution sur 7 jours. Une petite baisse après plusieurs jours sans pratique est normale : c’est l’oubli, qui se rattrape en quelques exercices.${closed ? ` ${closed} compétence${closed > 1 ? 's' : ''} pas encore ouverte${closed > 1 ? 's' : ''} (leçons d’avance).` : ''}</p>
      </div>
      <div class="card stack">
        <h3>Cours lus</h3>
        <table>${COURS.map((c) => { const p = (s.cours || {})[c.id] || {}; return `<tr><td>${c.icon} ${c.title}${c.ahead ? ' <span class="small muted">(en avance)</span>' : ''}</td><td style="text-align:right">${p.done ? '✅' : (p.seen || []).length ? `${(p.seen || []).length}/${c.sections.length}` : '—'}</td></tr>`; }).join('')}</table>
        <h3 style="margin-top:6px">Erreurs les plus fréquentes (30 j)</h3>
        ${(st.errors || []).filter((e) => e.code !== 'nsp').length ? `<table>${(st.errors || []).filter((e) => e.code !== 'nsp').slice(0, 5).map((e) => `<tr><td>${esc(ERR_LABELS[e.code] || e.code)}</td><td style="text-align:right"><b>${e.n}</b></td></tr>`).join('')}</table>` : '<p class="small muted">Rien à signaler pour l’instant.</p>'}
        <details><summary><b>Derniers exercices</b></summary>
          <table style="margin-top:6px">${(st.recent || []).map((r) => `<tr><td>${r.correct ? '✅' : '❌'}</td><td><span class="small muted">${fmtDate(r.ts)} • ${esc(RUN_LABEL[r.mode] || r.mode)}</span><br>${esc((r.question || '').slice(0, 140))}<br><span class="small">Réponse : <b>${esc(r.answer)}</b>${r.conf ? ` • ${esc({ sure: 'sûre', hesite: 'hésitait', hasard: 'au hasard', nsp: 'ne sait pas' }[r.conf] || r.conf)}` : ''}${r.error_code ? ` • ${esc(ERR_LABELS[r.error_code] || r.error_code)}` : ''}${r.hints ? ` • ${r.hints} indice(s)` : ''}</span></td></tr>`).join('')}</table>
        </details>
      </div>`; }).join('')}
    ${familyCard(studs)}
    ${helpCard()}
    <div class="center stack" style="gap:6px">
      ${ACCTS.length > 1 ? '<button class="link" id="psw">👥 Changer de profil</button>' : ''}
      <button class="link" id="out">Me déconnecter de cet appareil</button>
    </div>
    ${legal()}`);
  document.getElementById('ref').onclick = screenParent;
  document.getElementById('out').onclick = () => { if (confirm('Te déconnecter de cet appareil ? Tu pourras revenir avec un nouveau lien reçu par e-mail.')) logout(); };
  const psw = document.getElementById('psw'); if (psw) psw.onclick = switchProfile;
  bindParentExtras(studs);
  $app.querySelectorAll('[data-pv]').forEach((b) => b.onclick = () => {
    const st = studs[+b.dataset.pv];
    S = Object.assign(defaultState(), JSON.parse(JSON.stringify(st.state || {})));
    S.mastery = Object.assign(defaultState().mastery, S.mastery);
    if (!S.pseudo) S.pseudo = st.label || 'Élève';
    PREVIEW = true; document.body.classList.toggle('large', false);
    route();
  });
  bindPlanCard();
}
/* ---------- Espace parent : enfants, appareils, e-mails, invitations ---------- */
let FAM = {}, INVITES = [];
const childUrl = (sec) => `${location.origin}${location.pathname}#j=${sec}`;
const fmtDay = (d) => new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
function addChildForm(first) {
  return `<div class="stack" style="margin-top:8px">
    <label class="small" for="cname"><b>Prénom de ${first ? 'ton enfant' : 'l’enfant'}</b></label>
    <div class="answer"><input id="cname" maxlength="30" placeholder="Prénom ou surnom" autocomplete="off"></div>
    <label class="small" for="cpin"><b>Code à 4 chiffres</b> <span class="muted">(facultatif)</span></label>
    <div class="answer"><input id="cpin" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="Ex. : 2580" autocomplete="off"></div>
    <p class="small muted" style="margin:0">Sur son propre téléphone, ton enfant ouvre l’appli sans rien taper. Ce code ne sert que si plusieurs profils sont enregistrés sur le même appareil (tablette familiale…). Détails dans « ❓ Comment ça marche ».</p>
    <button class="btn" id="cadd">Ajouter</button></div>`;
}
const HELP_QA = [
  ['Comment mon enfant se connecte-t-il ?', 'Tu lui envoies son lien personnel (bouton « 📲 Envoyer le lien », dans « Accès de… »). Il l’ouvre <b>une seule fois</b> sur son téléphone, sa tablette ou son ordinateur. Cet appareil est alors reconnu : la fois suivante, l’appli s’ouvre directement sur son espace, sans mot de passe à retenir.'],
  ['À quoi sert le code à 4 chiffres ?', 'Il ne sert que lorsque <b>plusieurs profils sont enregistrés sur le même appareil</b> : une tablette familiale, un ordinateur partagé, ou ton propre téléphone sur lequel tu as aussi ton espace parent. L’appli demande alors « Qui se connecte ? » et le profil protégé (🔒) n’ouvre qu’avec son code. Cela évite qu’un frère, une sœur ou un parent réponde à sa place et fausse sa progression.'],
  ['Faut-il mettre un code ?', 'Non, c’est facultatif. Si ton enfant révise uniquement sur son propre téléphone, laisse le champ vide : il n’aura jamais rien à taper. Tu peux ajouter ou changer le code plus tard dans « Accès de… » › « Autres réglages ».'],
  ['L’appli est installée sur l’écran d’accueil : pourquoi le lien ne suffit pas ?', 'Sur un téléphone, l’appli installée garde sa propre mémoire, séparée du navigateur. Un lien touché dans un e-mail ou WhatsApp s’ouvre dans le navigateur, pas dans l’appli. Dans l’appli installée, on se connecte donc avec un <b>code</b> : pour toi, le code à 6 chiffres de l’e-mail de connexion ; pour ton enfant, le bouton « 🔢 Afficher un code » de « Accès de… ». Ensuite, l’appli s’ouvre directement.'],
  ['Et sur un ordinateur ?', 'Même principe : touche « 🔢 Afficher un code », puis ton enfant le tape une fois sur l’ordinateur, qui est ensuite reconnu.'],
  ['Un appareil a été perdu ou prêté ?', 'Dans « Accès de… », touche « Retirer » à côté de l’appareil : il ne pourra plus ouvrir l’appli. En cas de doute, « Créer un nouveau lien » désactive l’ancien lien.'],
  ['Puis-je voir ce que fait mon enfant ?', 'Oui : « 👀 Voir l’appli comme… » t’ouvre son appli telle qu’il la voit, sans rien enregistrer. Le tableau de bord résume sa semaine, et tu reçois les e-mails choisis dans la rubrique « ✉️ E-mails ».'],
];
function helpCard() {
  return `<details class="card stack help">
    <summary><b>❓ Comment ça marche</b> <span class="small muted">connexion, code, appareils</span></summary>
    ${HELP_QA.map(([q, a]) => `<details><summary><b>${q}</b></summary><p class="small" style="margin:6px 0 4px">${a}</p></details>`).join('')}
  </details>`;
}
function welcomeCard() {
  return `<div class="card stack">
    <h2>👋 Bienvenue !</h2>
    <p>Première étape : ajoute ton enfant. Tu pourras ensuite lui envoyer son lien d’accès par message.</p>
    ${addChildForm(true)}</div>`;
}
function accessCard(st, s) {
  const dev = st.devices || [], name = s.pseudo || st.label;
  return `<details class="card stack access" ${dev.length ? '' : 'open'}>
    <summary><b>📱 Accès de ${esc(name)}</b> <span class="small muted">${dev.length ? `${dev.length} appareil${dev.length > 1 ? 's' : ''}` : 'aucun appareil pour l’instant'}</span></summary>
    ${dev.length ? '' : `<div class="tip">Envoie-lui son lien : il ou elle l’ouvre <b>une fois</b> sur son téléphone, sa tablette ou son ordinateur, et l’appli s’ouvrira ensuite directement.</div>`}
    <button class="btn" data-share="${st.id}" data-name="${esc(name)}">📲 Envoyer le lien à ${esc(name)}</button>
    <button class="btn ghost" data-code="${st.id}">🔢 Afficher un code (appli installée ou ordinateur)</button>
    <div class="codebox" id="code-${st.id}" hidden></div>
    ${dev.length ? `<table>${dev.map((d) => `<tr><td>${esc(d.label || 'Appareil')}<br><span class="small muted">Dernière utilisation : ${fmtDay(d.last)}</span></td><td style="text-align:right"><button class="link" data-dev="${d.id}" data-what="${esc(d.label || 'cet appareil')}">Retirer</button></td></tr>`).join('')}</table>` : ''}
    <details><summary class="small"><b>Autres réglages</b></summary><div class="stack" style="margin-top:8px">
      <p class="small muted" style="margin:0">Code à 4 chiffres : ${st.has_pin ? 'activé' : 'aucun'} (demandé seulement si plusieurs profils partagent un appareil).</p>
      <div class="row"><div class="answer grow"><input data-pinin="${st.id}" maxlength="4" inputmode="numeric" placeholder="Nouveau code" autocomplete="off"></div><button class="btn small ghost" data-pinset="${st.id}">Enregistrer</button></div>
      <button class="btn small ghost" data-renew="${st.id}" data-name="${esc(name)}">🔄 Créer un nouveau lien (l’ancien ne marchera plus)</button>
      <button class="link danger" data-cdel="${st.id}" data-name="${esc(name)}">Supprimer le profil de ${esc(name)} et ses données</button>
    </div></details>
  </details>`;
}
function familyCard(studs) {
  const n = FAM.notify || 'each';
  const opt = (v, t, d) => `<label class="radio"><input type="radio" name="notify" value="${v}" ${n === v ? 'checked' : ''}><span><b>${t}</b><br><span class="small muted">${d}</span></span></label>`;
  return `<div class="card stack">
    <h2>✉️ E-mails</h2>
    <p class="small muted" style="margin:0">Envoyés à ${esc(FAM.email || '')}</p>
    ${opt('each', 'À chaque séance', 'Un e-mail quand ton enfant commence à réviser (30 min d’écart au minimum).')}
    ${opt('evening', 'Récap du soir', 'Un seul e-mail vers 21 h, seulement les jours où il a révisé.')}
    ${opt('off', 'Aucun', 'Tu consultes le tableau de bord quand tu veux.')}
    <label class="ck"><input type="checkbox" id="fweek" ${FAM.weekly ? 'checked' : ''}> Bilan de la semaine le dimanche soir</label>
  </div>
  ${studs.length ? `<details class="card stack"><summary><b>➕ Ajouter un autre enfant</b></summary>${addChildForm(false)}</details>` : ''}
  ${FAM.admin ? `<div class="card stack">
    <h2>🎟️ Inviter un parent</h2>
    <p class="small muted" style="margin:0">Chaque code permet à une famille de créer son espace (valable 60 jours, une seule fois).</p>
    <div class="row"><div class="answer grow"><input id="invnote" maxlength="60" placeholder="Pour qui ? (ex. : Sophie, maman de Léo)"></div><button class="btn small" id="invadd">Créer</button></div>
    ${INVITES.length ? `<table>${INVITES.slice(0, 12).map((i) => `<tr><td><b class="mono">${esc(i.code)}</b>${i.note ? ` • ${esc(i.note)}` : ''}<br><span class="small muted">${i.used ? '✅ utilisé' : new Date(i.expires) < new Date() ? 'expiré' : 'en attente'}</span></td><td style="text-align:right">${i.used ? '' : `<button class="link" data-inv="${esc(i.code)}">Envoyer</button>`}</td></tr>`).join('')}</table>` : ''}
  </div>` : `<details class="card stack"><summary><b>Mon compte</b></summary><div class="stack" style="margin-top:8px">
    <p class="small muted" style="margin:0">Supprimer ton compte efface définitivement ton espace, les profils de tes enfants et toutes leurs réponses.</p>
    <button class="btn ghost danger" id="fdel">Supprimer mon compte</button></div></details>`}`;
}
async function shareText(title, text, url) {
  if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  const full = `${text} ${url}`;
  try { await navigator.clipboard.writeText(full); toast('Message copié : colle-le dans WhatsApp ou un SMS.'); }
  catch (e) { prompt('Copie ce message :', full); }
}
function bindParentExtras(studs) {
  const call = async (fn, args, ok) => {
    try {
      const r = await rpc(fn, Object.assign({ p_token: token }, args));
      if (r.error) { toast(r.error === 'auth' ? 'Reconnecte-toi.' : 'Impossible pour l’instant.'); return null; }
      if (ok) toast(ok); return r;
    } catch (e) { toast('Pas de connexion internet.'); return null; }
  };
  const ca = document.getElementById('cadd');
  if (ca) ca.onclick = async () => {
    const name = document.getElementById('cname').value.trim(), pin = document.getElementById('cpin').value.trim();
    if (!name) return toast('Écris le prénom de ton enfant.');
    if (pin && !/^\d{4}$/.test(pin)) return toast('Le code doit faire 4 chiffres.');
    if (await call('rv_child_add', { p_name: name, p_pin: pin || null }, `Profil de ${name} créé ✓`)) screenParent();
  };
  $app.querySelectorAll('[data-share]').forEach((b) => b.onclick = async () => {
    const r = await call('rv_child_link', { p_child: b.dataset.share, p_renew: false }); if (!r) return;
    shareText(APP_NAME, `${b.dataset.name}, voici ton lien pour réviser la physique. Ouvre-le une fois sur ton téléphone (ou ta tablette) : ensuite l’appli s’ouvrira directement.`, childUrl(r.secret));
  });
  $app.querySelectorAll('[data-code]').forEach((b) => b.onclick = async () => {
    const r = await call('rv_child_code', { p_child: b.dataset.code }); if (!r) return;
    const box = document.getElementById('code-' + b.dataset.code);
    box.hidden = false;
    box.innerHTML = `<p class="small" style="margin:0">Dans l’appli installée sur son écran d’accueil (ou sur l’ordinateur, à l’adresse <b>${esc(location.host)}</b>), choisir « Je suis élève » puis taper :</p><div class="bigcode">${r.code}</div><p class="small muted" style="margin:0">Valable ${r.minutes} minutes, une seule fois.</p>`;
  });
  $app.querySelectorAll('[data-dev]').forEach((b) => b.onclick = async () => {
    if (!confirm(`Retirer « ${b.dataset.what} » ? Il faudra renvoyer le lien pour l’utiliser à nouveau.`)) return;
    if (await call('rv_device_del', { p_device: +b.dataset.dev }, 'Appareil retiré')) screenParent();
  });
  $app.querySelectorAll('[data-pinset]').forEach((b) => b.onclick = async () => {
    const v = document.querySelector(`[data-pinin="${b.dataset.pinset}"]`).value.trim();
    if (!/^\d{4}$/.test(v)) return toast('Le code doit faire 4 chiffres.');
    if (await call('rv_child_set', { p_child: b.dataset.pinset, p_name: null, p_pin: v }, 'Code enregistré ✓')) screenParent();
  });
  $app.querySelectorAll('[data-renew]').forEach((b) => b.onclick = async () => {
    if (!confirm('Créer un nouveau lien ? L’ancien lien ne fonctionnera plus. Les appareils déjà associés restent connectés (tu peux les retirer un par un).')) return;
    const r = await call('rv_child_link', { p_child: b.dataset.renew, p_renew: true }, 'Nouveau lien créé'); if (!r) return;
    shareText(APP_NAME, `${b.dataset.name}, voici ton nouveau lien pour réviser la physique :`, childUrl(r.secret));
  });
  $app.querySelectorAll('[data-cdel]').forEach((b) => b.onclick = async () => {
    if (!confirm(`Supprimer définitivement le profil de ${b.dataset.name}, ses progrès et toutes ses réponses ?`)) return;
    if (await call('rv_child_del', { p_child: b.dataset.cdel }, 'Profil supprimé')) screenParent();
  });
  $app.querySelectorAll('input[name="notify"]').forEach((i) => i.onchange = () => { FAM.notify = i.value; call('rv_family_set', { p_notify: i.value, p_weekly: null }, 'Réglage enregistré ✓'); });
  const fw = document.getElementById('fweek'); if (fw) fw.onchange = () => { FAM.weekly = fw.checked; call('rv_family_set', { p_notify: null, p_weekly: fw.checked }, 'Réglage enregistré ✓'); };
  const ia = document.getElementById('invadd');
  if (ia) ia.onclick = async () => {
    const r = await call('rv_invite_create', { p_note: document.getElementById('invnote').value.trim() }); if (!r) return;
    await screenParent();
    inviteShare(r.code);
  };
  $app.querySelectorAll('[data-inv]').forEach((b) => b.onclick = () => inviteShare(b.dataset.inv));
  const fd = document.getElementById('fdel');
  if (fd) fd.onclick = async () => {
    const v = prompt(`Pour confirmer la suppression définitive, tape ton adresse e-mail (${FAM.email}) :`);
    if (v == null) return;
    try {
      const r = await rpc('rv_family_delete', { p_token: token, p_confirm: v });
      if (r.ok) { alert('Ton compte et toutes les données associées ont été supprimés.'); return logout(); }
      toast(r.error === 'confirm' ? 'L’adresse ne correspond pas : rien n’a été supprimé.' : 'Impossible pour l’instant.');
    } catch (e) { toast('Pas de connexion internet.'); }
  };
}
function inviteShare(code) {
  shareText(APP_NAME, `Je t’invite à essayer ${APP_NAME}, une appli pour aider nos enfants à réviser la physique de 3e. Crée ton espace parent (« Je suis parent ») avec ton adresse e-mail et ce code d’invitation : ${code}`, `${location.origin}${location.pathname}`);
}
function planCard(ok) {
  const fmt = (d) => d ? d.split('-').reverse().join('/') : '';
  const skillOpts = SKILLS.map((k) => `<label class="ck"><input type="checkbox" value="${k.id}"> ${k.icon} ${k.short}</label>`).join('');
  const ex = exams(), cp = PLAN.filter((p) => p.kind === 'copie');
  return `<div class="card stack">
    <h2>📅 Contrôles à venir</h2>
    ${!ok ? '<p class="small" style="color:var(--bad)">La mise à jour du serveur n’est pas encore faite : cette partie sera active juste après.</p>' : ''}
    ${ex.length ? `<table>${ex.map((e) => `<tr><td><b>${fmt(e.day)}</b> • ${esc(e.label || 'Contrôle')}<br><span class="small muted">${(e.skills || []).map((k) => (SKILLS.find((s) => s.id === k) || {}).short).join(', ') || 'toutes les compétences'}</span></td><td style="text-align:right"><button class="link" data-del="${e.id}" data-what="le contrôle du ${fmt(e.day)}">Supprimer</button></td></tr>`).join('')}</table>` : '<p class="small muted">Aucun contrôle saisi. Dès qu’une date est connue, l’appli prépare l’élève : programme ciblé 7 jours avant, contrôle blanc à J-2.</p>'}
    <details><summary><b>+ Ajouter un contrôle</b></summary>
      <div class="stack" style="margin-top:8px">
        <input type="date" id="exday"><input id="exlabel" maxlength="120" placeholder="Titre, ex. : Contrôle vitesse et distance d’arrêt">
        <details><summary class="small"><b>Préciser les compétences</b> (facultatif, sinon toutes)</summary><div class="cks" id="exsk" style="margin-top:8px">${skillOpts}</div></details>
        <button class="btn" id="exadd">Enregistrer le contrôle</button></div>
    </details>
    <h2 style="margin-top:8px">📝 Erreurs relevées sur les copies</h2>
    ${FAM.admin ? '<div class="tip">📸 <b>Le plus simple :</b> envoie la photo de la copie corrigée à Claude, qui relève les erreurs pour toi.</div>' : ''}
    <p class="small muted" style="margin:0">Chaque erreur saisie revient dans « À revoir » dès la prochaine connexion, puis à J+1, J+3, J+7 et J+21.</p>
    ${cp.length ? `<table>${cp.slice(-8).reverse().map((e) => `<tr><td>${esc(e.label || '')}<br><span class="small muted">${esc(ERR_LABELS[e.error_code] || e.error_code || '')}</span></td><td style="text-align:right"><button class="link" data-del="${e.id}" data-what="l’erreur « ${esc(e.label || '')} »">Supprimer</button></td></tr>`).join('')}</table>` : ''}
    <details><summary><b>+ Ajouter une erreur à la main</b></summary>
      <div class="stack" style="margin-top:8px">
        <input id="cplabel" maxlength="120" placeholder="Exercice, ex. : contrôle du 12/11, exercice 3">
        <label class="small muted" for="cptype" style="margin:0">Ce qui n’allait pas :</label>
        <select id="cptype">${COPY_TYPES.map(([t], i) => `<option value="${i}">${esc(t)}</option>`).join('')}</select>
        <button class="btn" id="cpadd">Enregistrer l’erreur</button></div>
    </details>
  </div>`;
}
function bindPlanCard() {
  const add = async (args) => {
    try {
      const r = await rpc('rv_plan_add', Object.assign({ p_token: token, p_day: null, p_label: null, p_skills: [], p_level: 2, p_error_code: null }, args));
      if (r.error) return toast(r.error === 'auth' ? 'Reconnecte-toi.' : 'Erreur : ' + r.error);
      toast('Enregistré ✓'); screenParent();
    } catch (e) { toast('Impossible pour l’instant (pas de connexion ?).'); }
  };
  const ea = document.getElementById('exadd');
  if (ea) ea.onclick = () => {
    const day = document.getElementById('exday').value;
    if (!day) return toast('Choisis la date du contrôle.');
    add({ p_kind: 'exam', p_day: day, p_label: document.getElementById('exlabel').value.trim() || 'Contrôle de physique',
      p_skills: [...document.querySelectorAll('#exsk input:checked')].map((x) => x.value) });
  };
  const ca = document.getElementById('cpadd');
  if (ca) ca.onclick = () => {
    const [txt, skill, code] = COPY_TYPES[+document.getElementById('cptype').value];
    add({ p_kind: 'copie', p_label: document.getElementById('cplabel').value.trim() || txt, p_skills: [skill], p_level: 2, p_error_code: code });
  };
  $app.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
    if (!confirm(`Supprimer ${b.dataset.what || 'cet élément'} ?`)) return;
    try { await rpc('rv_plan_del', { p_token: token, p_id: b.dataset.del }); toast('Supprimé'); screenParent(); } catch (e) { toast('Impossible pour l’instant.'); }
  });
}

/* ---------- Démarrage ---------- */
function route() {
  if (!S.pseudo) return screenPseudo();
  if (!S.onboard && !S.diagDone) return screenWelcome();
  screenHome();
}
/* Erreurs relevées sur les copies (saisies par le parent ou par Claude) → file « À revoir », dès aujourd’hui */
function mergeCopies() {
  S.copieSeen = S.copieSeen || [];
  PLAN.filter((p) => p.kind === 'copie' && !S.copieSeen.includes(p.id)).forEach((p) => {
    (p.skills || []).filter((k) => GENERATORS[k]).forEach((k) => addReview(k, p.level || 2, p.error_code || 'copie', { src: 'copie', label: p.label, today: true }));
    S.copieSeen.push(p.id);
  });
}
async function boot() {
  const h = location.hash;
  if (/^#[mj]=[0-9a-f-]{36}$/i.test(h)) { history.replaceState(null, '', location.pathname); return handleLink(h); }
  if (!ACCTS.length) return screenLanding();
  if (!token || (ACCTS.length > 1 && !UNLOCKED)) {
    if (ACCTS.length === 1) useAcct(ACCTS[0]); else return screenPicker();
  }
  if (role === 'parent') return screenParent();
  const cached = LS.get(kState(), null);
  try {
    const r = await rpc('rv_get_state', { p_token: token });
    if (r.error) return logout(true);
    if (r.name && curAcct().name !== r.name) { curAcct().name = r.name; saveAccts(); }
    S = Object.assign(defaultState(), cached || {}, r.state || {});
    // garder la version la plus avancée si le cache local est en avance (hors ligne)
    if (cached && (cached.xp || 0) > (r.state.xp || 0)) S = Object.assign(defaultState(), cached);
    S.mastery = Object.assign(defaultState().mastery, S.mastery);
    PLAN = r.plan || [];
    LS.set('rv_plan_' + token.slice(0, 8), PLAN);
  } catch (e) {
    PLAN = LS.get('rv_plan_' + token.slice(0, 8), []);
    if (!cached) { render('<p class="center" style="margin-top:40px">Pas de connexion internet.</p><button class="btn" onclick="boot()">Réessayer</button>'); return; }
    S = Object.assign(defaultState(), cached);
  }
  document.body.classList.toggle('large', !!S.large);
  if (S.diagDone && !S.onboard) S.onboard = 2;
  applyDecay();
  S.mHist = S.mHist || {}; S.mHist[todayStr()] = Object.assign({}, S.mastery); // photo du jour pour les flèches ▲ ▼ du parent
  Object.keys(S.mHist).sort().slice(0, -15).forEach((k) => delete S.mHist[k]);
  mergeCopies();
  saveState(); flush();
  notifySession();
  route();
}
boot();
