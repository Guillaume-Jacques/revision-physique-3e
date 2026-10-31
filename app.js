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
const APP_NAME = 'Révisions physique-chimie';
const APP_TAG = 'La physique-chimie de 3e, une séance après l’autre.';
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
const GEN = () => PREVIEW ? PREVIEW_G : curAcct().g; // genre de l'élève : 'f', 'm' ou null
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

/* ---------- Deux matières : physique et chimie ---------- */
const SUBJ = { physique: { name: 'Physique', icon: '⚡' }, chimie: { name: 'Chimie', icon: '⚗️' } };
const subjOf = (id) => (SKILLS.find((s) => s.id === id) || {}).subj || 'physique';
const coursSubj = (c) => c.subj || 'physique';
/* Matière d'un contrôle : d'après ses compétences ('mix' si les deux ou aucune précisée) */
function examSubj(e) {
  const ks = (e && e.skills) || [];
  if (!ks.length) return 'mix';
  const s = [...new Set(ks.map(subjOf))];
  return s.length === 1 ? s[0] : 'mix';
}
const subjSwitch = (sj) => `<div class="subjs sticky" role="tablist" aria-label="Matière">${Object.entries(SUBJ).map(([k, v]) => `<button role="tab" class="subj ${sj === k ? 'on' : ''}" data-sj="${k}" aria-selected="${sj === k}">${v.icon} ${v.name}</button>`).join('')}</div>`;
const subjLabel = (k) => k === 'mix' ? 'physique-chimie' : SUBJ[k].name.toLowerCase();

/* ---------- Saisie des réponses : nombre simple, nombre négatif (±) ou écriture scientifique (… × 10ⁿ) ---------- */
function ansField(id, o, ph) {
  const pm = (t) => `<button type="button" class="pm" data-pm="${t}" aria-label="Changer le signe">±</button>`;
  const unit = o.units ? '' : o.unit ? `<span class="unit">${esc(o.unit)}</span>` : '';
  if (o.sci) return `<div class="answer sci"><input id="${id}" inputmode="decimal" enterkeyhint="done" autocomplete="off" placeholder="2,67"><span class="x10">× 10</span><span class="expw">${pm(id + 'x')}<input id="${id}x" class="exp" inputmode="numeric" enterkeyhint="done" autocomplete="off" placeholder="−26"></span>${unit}</div>
    <p class="small muted" style="margin:6px 0 0">Écris le nombre avant « × 10 », puis l’exposant en haut (touche ± pour le signe moins). <button type="button" class="link calc-help" style="padding:0">🧮 Ma calculatrice</button></p>`;
  return `<div class="answer"><input id="${id}" inputmode="decimal" enterkeyhint="done" autocomplete="off" placeholder="${ph || 'Ta réponse'}">${o.neg ? pm(id) : ''}${unit}</div>`;
}
function bindAns() {
  document.querySelectorAll('[data-pm]').forEach((b) => b.onclick = () => {
    const i = document.getElementById(b.dataset.pm); const v = i.value.trim();
    i.value = /^[-−]/.test(v) ? v.replace(/^[-−]\s*/, '') : '-' + v; i.focus();
  });
  document.querySelectorAll('.calc-help').forEach((b) => b.onclick = () => openCalc());
}
function readAns(id, sci) {
  const el = document.getElementById(id); if (!el) return null;
  const m = parseNum(el.value); if (m === null) return null;
  if (!sci) return m;
  const t = (document.getElementById(id + 'x').value || '').replace(/\s/g, '').replace(/[−–]/g, '-');
  if (t === '' || t === '-') return m;
  if (!/^-?\d{1,3}$/.test(t)) return null;
  return m * Math.pow(10, +t);
}
function rawAns(id, sci) {
  const el = document.getElementById(id); if (!el) return '';
  if (!sci) return el.value;
  const x = (document.getElementById(id + 'x').value || '').trim();
  return x ? `${el.value} × 10^${x}` : el.value;
}
const tolOf = (o, v) => o.tol ?? (o.sci ? Math.abs(v) * 0.015 : Math.max(Math.abs(v) * 0.01, 0.01));
const fmtAns = (o) => o.sci ? sciTxt(o.ans) : fr(o.ans);
/* Écart d'une puissance de dix exacte : bon début, mauvais exposant */
function sciError(x, ans) {
  if (!x || !ans) return null;
  const k = Math.log10(Math.abs(x / ans));
  if (Math.abs(k - Math.round(k)) > 0.01 || Math.round(k) === 0) return null;
  const ea = Math.floor(Math.log10(Math.abs(ans)) + 1e-9), ex = Math.floor(Math.log10(Math.abs(x)) + 1e-9);
  if (ea !== 0 && ex === -ea) return { code: 'expSigne', msg: 'Le début est bon, mais le signe de l’exposant est inversé. Une très petite valeur a un exposant négatif.' };
  return { code: 'saisie', msg: `Le début est bon, mais la puissance de dix est fausse (10${supN(ex)} au lieu de 10${supN(ea)}). Vérifie l’exposant et ta saisie à la calculatrice.` };
}

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
  let pool = run.only && run.only.length ? run.only : activeSkills();
  // Physique et chimie : on alterne (50/50) ; une semaine avant un contrôle, sa matière passe à 80 %
  const subs = [...new Set(pool.map(subjOf))];
  if (subs.length > 1) {
    const e = nextExam(), es = e && e.days <= 7 ? examSubj(e) : 'mix', last = run.results[run.results.length - 1];
    const want = es !== 'mix' ? (Math.random() < 0.8 ? es : subs.find((x) => x !== es)) : last ? subs.find((x) => x !== subjOf(last.skill)) : pick(subs);
    const f = pool.filter((k) => subjOf(k) === want); if (f.length) pool = f;
  }
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
function exitPreview() { stopTimer(); PREVIEW = false; PREVIEW_G = null; RUN = null; S = null; PLAN = []; screenParent(true); }

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
      <div class="howstep"><span>1</span><p><b>Le parent crée son espace</b> avec son adresse e-mail. Pas de mot de passe : il reçoit un code par e-mail.</p></div>
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
      <h3>Pas encore inscrit(e) ?</h3>
      <p class="small" style="margin:0">C’est un <b>parent</b> qui t’inscrit : il entre son adresse e-mail, ajoute ton prénom et t’envoie ton lien. Ça prend une minute.</p>
      <button class="btn ghost" id="jsend">📲 Envoyer l’appli à mon parent</button>
      <button class="link" id="jpar" style="padding:0">Mon parent est à côté de moi : il s’inscrit ici</button>
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
  document.getElementById('jsend').onclick = () => shareToParent();
  document.getElementById('jpar').onclick = () => screenParentLogin();
  document.getElementById('jback').onclick = () => screenLanding();
}
/* Partage de l'appli entre élèves : le lien #ami ouvre une page qui renvoie vers un parent */
const appUrl = () => `${location.origin}${location.pathname}`;
function shareToParent() {
  shareText(APP_NAME, `Bonjour, je voudrais utiliser ${APP_NAME} pour réviser la physique-chimie. C’est toi qui dois m’inscrire : ouvre le lien, touche « Je suis parent », entre ton adresse e-mail puis ajoute mon prénom. Ensuite tu m’envoies mon lien d’accès.`, appUrl());
}
function shareToFriend() {
  shareText(APP_NAME, `J’utilise ${APP_NAME} pour réviser la physique-chimie de 3e : cours, exercices et contrôles types. Pour l’avoir, ouvre ce lien et montre-le à un de tes parents : c’est lui qui t’inscrit, en une minute.`, appUrl() + '#ami');
}
function screenFriend() {
  render(`${brandHead('')}
    <div class="card stack">
      <span class="chip">👋 Un ami te recommande l’appli</span>
      <h2>Réviser la physique-chimie de 3e</h2>
      <p style="margin:0">Des cours courts, des exercices corrigés et des contrôles types, environ 15 minutes par jour.</p>
      <p style="margin:0"><b>Pour t’inscrire, il faut un parent</b> : il entre son adresse e-mail, ajoute ton prénom et t’envoie ton lien d’accès.</p>
      <button class="btn" id="fpar">Je suis parent : inscrire mon enfant</button>
      <button class="btn ghost" id="fsend">📲 Envoyer l’appli à mon parent</button>
    </div>
    <div class="center"><button class="link" id="fmore">Découvrir comment ça marche</button></div>
    ${legal()}`);
  document.getElementById('fpar').onclick = () => screenParentLogin();
  document.getElementById('fsend').onclick = () => shareToParent();
  document.getElementById('fmore').onclick = () => screenLanding();
}
function screenParentLogin(st) {
  st = st || {};
  render(`
    ${brandHead('')}
    <div class="card stack">
      <h2>Espace parent</h2>
      <p class="small muted" style="margin:0">Pas de mot de passe : tu reçois un code de connexion par e-mail.</p>
      <label class="small" for="pmail"><b>Ton adresse e-mail</b></label>
      <div class="answer"><input id="pmail" type="email" inputmode="email" autocomplete="email" maxlength="160" placeholder="prenom@exemple.fr" value="${esc(st.email || '')}"></div>
      <div id="pinv" ${st.invite ? '' : 'hidden'} class="stack">
        <div class="tip">Bienvenue ! C’est ta première connexion : coche la case ci-dessous pour créer ton espace parent.</div>
        <label class="ck consent"><input type="checkbox" id="pok"> <span>Je certifie être <b>majeur(e)</b> et <b>parent ou responsable légal</b> de l’enfant. J’accepte que ses réponses et ses progrès soient enregistrés pour le suivi de ses révisions, comme expliqué dans la <a href="confidentialite.html" target="_blank">politique de confidentialité</a>.</span></label>
      </div>
      <p class="small" id="pmsg" style="color:var(--bad);font-weight:700;margin:0;min-height:1.2em">${st.err || ''}</p>
      <button class="btn" id="pgo">Recevoir mon code</button>
    </div>
    <div class="center"><button class="link" id="pback">← Retour</button></div>
    ${legal()}`);
  const msg = (t, ok) => { const m = document.getElementById('pmsg'); m.style.color = ok ? 'var(--muted)' : 'var(--bad)'; m.textContent = t; };
  const go = async () => {
    const email = document.getElementById('pmail').value.trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return msg('Vérifie ton adresse e-mail.');
    const inv = !document.getElementById('pinv').hidden;
    const consent = inv ? document.getElementById('pok').checked : false;
    if (inv && !consent) return msg('Coche la case pour créer ton espace.');
    const b = document.getElementById('pgo'); b.disabled = true; msg('Envoi en cours…', true);
    try {
      const r = await mailFn({ action: 'magic', email, invite: null, consent });
      b.disabled = false;
      if (r.ok) return screenMailSent(email);
      if (r.error === 'need_consent' || r.error === 'need_invite') { document.getElementById('pinv').hidden = false; return msg('Première visite ? Coche la case puis touche « Recevoir mon code ».', true); }
      msg({ email: 'Vérifie ton adresse e-mail.', bad_invite: 'Ce code d’invitation n’est pas valable (déjà utilisé ou expiré).', consent: 'Coche la case pour créer ton espace.',
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
    <div class="center" style="margin-top:14px"><button class="link" id="padd">+ Se connecter avec un autre compte (parent ou élève)</button></div>`);
  $app.querySelectorAll('.pick').forEach((b) => b.onclick = () => {
    const a = ACCTS[+b.dataset.i];
    if (a.role !== 'parent' && a.pin) {
      // Le code a peut-être été supprimé par le parent : on vérifie avant de le demander
      return rpc('rv_unlock', { p_token: a.token, p_pin: '' }).then((r) => {
        if (r && r.ok) { a.pin = false; saveAccts(); useAcct(a); UNLOCKED = true; return boot(); }
        screenUnlock(a);
      }).catch(() => screenUnlock(a));
    }
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
    <div class="center stack" style="gap:6px"><button class="link" id="uf">Code oublié ?</button><button class="link" id="ub">← Changer de profil</button></div>`);
  document.getElementById('ub').onclick = screenPicker;
  document.getElementById('uf').onclick = () => ask({ title: 'Code oublié ?', text: `Un parent peut en choisir un nouveau : Espace parent › Réglages › « Autres réglages de ${a.name} » › Code à 4 chiffres.`, ok: ACCTS.some((x) => x.role === 'parent') ? 'Ouvrir l’espace parent' : 'Compris' }).then((y) => { const par = ACCTS.find((x) => x.role === 'parent'); if (y && par) { useAcct(par); UNLOCKED = true; PV.tab = 'reglages'; savePV(); boot(); } });
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
  const examLine = e && e.days <= 7 && !/Contrôle/.test(m.chip) ? `<p class="small" style="margin:0">📅 Contrôle ${examWhen(e)} : ${esc(e.label || 'physique-chimie')}</p>` : '';
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
    <button class="btn ghost" id="sCalc">🧮 Ma calculatrice${calcOf(S.calc) ? ' : ' + esc(calcOf(S.calc).name) : ''}</button>
    ${PREVIEW ? '' : '<button class="btn ghost" id="sFr">📣 Faire découvrir l’appli à un ami</button>'}
    ${isStandalone() ? '' : '<button class="btn ghost" id="sInst">📲 Mettre l’appli sur mon téléphone</button><p class="small muted" id="sHow" hidden></p>'}
    ${PREVIEW ? '' : `${ACCTS.length > 1 ? '<button class="btn ghost" id="sSw">👥 Changer de profil</button>' : ''}<button class="btn ghost" id="sAdd">👪 Se connecter en parent (ou avec un autre compte)</button>`}
    <button class="btn ghost" id="sOut">${PREVIEW ? '↩ Revenir au tableau de bord' : '🚪 Me déconnecter de cet appareil'}</button>
    <button class="link" id="sClose">Fermer</button></div></div>`);
  const close = () => { const m = document.getElementById('qmodal'); if (m) m.remove(); };
  document.getElementById('qmodal').onclick = (e) => { if (e.target.id === 'qmodal') close(); };
  document.getElementById('sClose').onclick = close;
  document.getElementById('sCalc').onclick = () => { close(); openCalc(); };
  document.getElementById('sAa').onclick = () => { S.large = !S.large; document.body.classList.toggle('large', S.large); saveState(); close(); screenHome(); };
  const sf = document.getElementById('sFr'); if (sf) sf.onclick = () => { close(); shareToFriend(); };
  const si = document.getElementById('sInst');
  if (si) si.onclick = async () => { if (installEvt) { installEvt.prompt(); installEvt = null; close(); return; } const h = document.getElementById('sHow'); h.innerHTML = installHow(); h.hidden = false; };
  const sw = document.getElementById('sSw'); if (sw) sw.onclick = () => { close(); switchProfile(); };
  const sa = document.getElementById('sAdd'); if (sa) sa.onclick = () => { close(); stopTimer(); screenLanding(); };
  document.getElementById('sOut').onclick = async () => { if (PREVIEW) { close(); return exitPreview(); } close(); if (!await ask({ title: 'Retirer ton profil de cet appareil ?', text: 'Tes progrès restent enregistrés ; il faudra un nouveau lien de ton parent pour revenir.', ok: 'Retirer', danger: true })) return; logout(); };
}
const activeCards = () => S.cards.filter((k) => skillActive(k)).length;
function screenHome() {
  const L = levelInfo(S.xp);
  const unlocked = bossUnlocked(), nb = bronzeCount();
  const M = missionCard();
  const sj = S.subj || 'physique', inSj = (s) => (s.subj || 'physique') === sj;
  const act = SKILLS.filter((s) => skillActive(s.id) && inSj(s)), locked = SKILLS.filter((s) => !skillActive(s.id) && inSj(s));
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
    ${subjSwitch(sj)}
    ${installCard()}
    ${M.html}
    <h3 style="margin:14px 4px 10px">Autres activités en ${SUBJ[sj].name.toLowerCase()}</h3>
    <div class="acts subj-${sj}">
      <button class="act" id="redac"><span class="ic">✍️</span><b>Rédiger</b><span class="small muted">Comme sur ta copie</span></button>
      ${sj === 'chimie' ? '<button class="act" id="calc"><span class="ic">🧮</span><b>Ma calculatrice</b><span class="small muted">' + (calcOf(S.calc) ? esc(calcOf(S.calc).name) : 'Choisis ton modèle') + '</span></button>' : ''}
      <button class="act" id="cours"><span class="ic">📚</span><b>Mes cours</b><span class="small muted">${COURS.filter((c) => coursSubj(c) === sj && coursProg(c.id).done).length}/${COURS.filter((c) => coursSubj(c) === sj).length} lus en ${SUBJ[sj].name.toLowerCase()}</span></button>
      <button class="act ${unlocked ? '' : 'off'}" id="boss"><span class="ic">👾</span><b>Contrôle blanc</b><span class="small muted">${unlocked ? (S.boss.best != null ? `Record ${fr(S.boss.best, 1)}/20` : '8 questions, 20 min') : `🔒 ${nb}/${BOSS_NEED} bronzes`}</span></button>
      <button class="act" id="bat"><span class="ic">🕵️</span><b>Bats ta note</b><span class="small muted">Chasse à l’erreur</span></button>
    </div>
    <h3 style="margin:18px 4px 6px">Mes compétences en ${SUBJ[sj].name.toLowerCase()}</h3>
    <p class="small muted" style="margin:0 4px 10px">Une médaille se gagne en réussissant sur plusieurs jours : bronze en 2 jours, argent en 3, or en 4.</p>
    <div class="skills">${act.map((s) => `
      <button class="skill" data-s="${s.id}">
        <div class="row between"><span class="ic">${s.icon}</span>${medalHtml(S.mastery[s.id])}</div>
        <div class="nm">${s.name}</div>
        <div class="bar"><i style="width:${S.mastery[s.id]}%"></i></div>
      </button>`).join('')}</div>
    ${locked.length ? `<details class="soon"><summary>🔒 Bientôt (${locked.length}) <span class="small muted">: s’ouvrent à la fin de leur leçon</span></summary>
      <div class="skills" style="margin-top:10px">${locked.map((s) => `
      <button class="skill locked" data-l="${s.lesson}">
        <div class="row between"><span class="ic">${s.icon}</span><span class="small muted">🔒</span></div>
        <div class="nm">${s.name}</div>
        <div class="small muted">Après la leçon « ${COURS.find((c) => c.id === s.lesson).title} »</div>
      </button>`).join('')}</div></details>` : ''}
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="cards">🃏 Mes cartes formules (${activeCards()}/${SKILLS.filter((x) => skillActive(x.id)).length})</button></div>`);
  const on = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
  on('mgo', M.go);
  on('set', openSettings);
  on('redac', () => startRun('redac'));
  on('cours', screenCours);
  on('bat', () => startRun('bat'));
  on('calc', () => openCalc());
  $app.querySelectorAll('[data-sj]').forEach((b) => b.onclick = () => { S.subj = b.dataset.sj; saveState(); screenHome(); });
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
  let lastChap = '', lastSj = '';
  const sjc = S.subj || 'physique', order = COURS.filter((c) => coursSubj(c) === sjc);
  render(`
    <button class="link" id="back">← Retour</button>
    <h1>Mes cours</h1>
    ${subjSwitch(sjc)}
    <p class="muted small">Dans l’ordre de ton cahier, avec quelques leçons d’avance pour être ${gw(GEN(), 'prête', 'prêt', 'prêt(e)')} quand le prof les commencera.</p>
    ${order.map((c) => {
      const p = coursProg(c.id), n = c.sections.length, seen = p.seen.length, sj = coursSubj(c);
      const head = (c.chap !== lastChap ? `<h3 style="margin:12px 4px 8px">${c.chap}</h3>` : ''); lastChap = c.chap;
      return `${head}<button class="lesson" data-c="${c.id}">
        <span class="lic">${c.icon}</span>
        <span class="grow"><b>${c.title}</b>${c.ahead ? ' <span class="pill tiny">🚀 en avance</span>' : ''}<br><span class="small muted">${n} parties${c.exos.length ? ` • ${c.exos.length} exercices corrigés` : ''}</span>
          <span class="bar" style="display:block;margin-top:6px"><i style="width:${Math.round(seen / n * 100)}%"></i></span></span>
        <span>${p.done ? '✅' : '›'}</span>
      </button>`;
    }).join('')}`);
  $app.querySelectorAll('[data-sj]').forEach((b) => b.onclick = () => { S.subj = b.dataset.sj; saveState(); screenCours(); });
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
      ${ansField('exans', { sci: e.sci, unit: e.unit || '' })}
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
      const raw = rawAns('exans', e.sci), x = readAns('exans', e.sci), out = document.getElementById('exfb');
      if (x === null) { out.innerHTML = '<div class="fb hint">Écris un nombre, par exemple 3,25</div>'; return; }
      tries++;
      const tol = tolOf(e, e.ans), ok = Math.abs(x - e.ans) <= tol;
      if (ok) {
        out.innerHTML = `<div class="fb good pop"><b>Bravo, c’est juste !</b>${tries === 1 ? ' +5 XP' : ''} Regarde quand même la correction pour vérifier ta méthode.</div>`;
        if (tries === 1) addXP(5);
        ck.remove();
      } else {
        const g = (e.sci ? sciError(x, e.ans) : null) || genericError(x, e.ans);
        if (tries === 1 && skillActive(c.skills[0])) addReview(c.skills[0], 2, g ? g.code : 'autre');
        out.innerHTML = `<div class="fb bad pop"><b>Pas encore.</b> ${g ? g.msg : 'Vérifie ton calcul.'} ${tries >= 2 ? 'Révèle l’étape 1 pour te débloquer.' : 'Tu peux réessayer.'}</div>`;
      }
      if (ok || tries === 1) logAttempt({ mode: 'cours', skill: c.skills[0], item_id: `${id}-e${k}`, level: 2, correct: ok, tries, hints: shown, error_code: ok ? null : (genericError(x, e.ans) || {}).code || 'autre', answer: String(raw).slice(0, 60), question: stripTags(e.enonce).slice(0, 400), ms: 0 });
      saveState();
    };
    ck.onclick = check;
    bindAns();
    ['exans', 'exansx'].map((k) => document.getElementById(k)).filter(Boolean).forEach((el) => el.onkeydown = (ev) => { if (ev.key === 'Enter') check(); });
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
  if (mode === 'redac' && !preset) RUN.subj = S.subj || 'physique';
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
    RUN.items = (S.subj === 'chimie' && typeof chimBatItems === 'function') ? chimBatItems()
      : shuffle(V8_QCM.filter((b) => b.bat)).slice(0, 5).map((b) => qcmFrom('V8', b, { bat: true }));
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
  const base = REDAC_SKILLS.filter((k) => !RUN.subj || subjOf(k) === RUN.subj);
  const pool = base.filter((k) => !done.includes(k));
  const sk = pool.sort((a, b) => S.mastery[a] - S.mastery[b] + (Math.random() - 0.5) * 30)[0] || pick(base);
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
    <div class="conf"><button class="btn ghost" data-c="sure">✅<br>${gw(GEN(), 'sûre', 'sûr', 'sûr(e)')}</button><button class="btn ghost" data-c="hesite">🤔<br>j’hésite</button><button class="btn ghost" data-c="hasard">🎲<br>au hasard</button></div>
    <button class="link" id="cback">Changer ma réponse</button></div></div>`);
  const close = () => { const m = document.getElementById('csheet'); if (m) m.remove(); };
  document.getElementById('cback').onclick = close;
  document.getElementById('csheet').onclick = (e) => { if (e.target.id === 'csheet') close(); };
  document.querySelectorAll('#csheet [data-c]').forEach((b) => b.onclick = () => { close(); cb(b.dataset.c); });
}
function validate() {
  const c = RUN.cur, it = c.item;
  if (c.done) return;
  if (it.type === 'num') { if (readAns('ans', it.sci) === null) return fb('hint', it.sci ? 'Écris le nombre avant « × 10 », par exemple 2,67, et un exposant entier.' : 'Écris un nombre, par exemple 3,25'); }
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
    body = ansField('ans', it);
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
  bindAns();
  if (it.type === 'num') {
    const inp = document.getElementById('ans'); inp.focus({ preventScroll: true });
    [inp, document.getElementById('ansx')].filter(Boolean).forEach((el) => el.onkeydown = (e) => { if (e.key === 'Enter') { e.preventDefault(); validate(); } });
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
  const e = String(s).replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.').match(/^(-?\d*\.?\d+)[eE](-?\d+)$/);
  if (e) return +(e[1] + 'e' + e[2]);
  const t = String(s).replace(/\s/g, '').replace(/[−–]/g, '-').replace(',', '.').replace(/[^0-9.\-]/g, '');
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
  const raw = rawAns('ans', it.sci);
  const x = readAns('ans', it.sci);
  if (x === null) { fb('hint', 'Écris un nombre, par exemple 3,25'); c.conf = c.tries ? c.conf : null; return; }
  if (near(x, it.ans, tolOf(it, it.ans))) return finishItem(true, null, raw);
  let err = (it.errs || []).find((e) => near(x, e.v, e.tol ?? tolOf(it, e.v)));
  if (!err) err = (it.sci ? sciError(x, it.ans) : null) || genericError(x, it.ans) || { code: 'autre', msg: 'Ce n’est pas encore ça.' };
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
  if (c.tries === 1 && c.conf === 'sure') html += `<br><span class="small">Tu étais ${gw(GEN(), 'sûre', 'sûr', 'sûr(e)')} de toi : c’est justement l’erreur à bien comprendre.</span>`;
  fb('bad', html);
  if (c.hints < it.hints.length) { fb('hint', '💡 ' + it.hints[c.hints], true); c.hints++; }
  if (!isQcm) { const inp = document.getElementById('ans'); if (inp) inp.select(); }
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
    else active += `${ansField('sans', cur, 'Ton résultat')}
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
      const x = readAns('sans', cur.sci);
      if (x === null) return sfb('hint', 'Écris un nombre, par exemple 3,25');
      if (cur.units && !c.unitSel) return sfb('hint', 'Choisis aussi l’unité.');
      const okN = near(x, cur.ans, tolOf(cur, cur.ans)), okU = !cur.units || c.unitSel === cur.unit;
      if (okN && okU) return advance(true);
      if (okN) return miss(`Le nombre est juste, mais pas l’unité. Ici on cherche ${cur.unit === 'm' ? 'une distance en mètres' : cur.unit === 's' || cur.unit === 'min' ? 'une durée' : cur.unit === 'km/h' || cur.unit === 'm/s' ? 'une vitesse' : 'une grandeur en ' + cur.unit}.`, 'unite');
      const e = (cur.errs || []).find((er) => near(x, er.v, tolOf(cur, er.v))) || (cur.sci ? sciError(x, cur.ans) : null) || genericError(x, cur.ans) || { code: 'autre', msg: 'Vérifie ton calcul.' };
      miss(e.msg, e.code);
    };
    document.getElementById('sok').onclick = check;
    bindAns();
    ['sans', 'sansx'].map((k) => document.getElementById(k)).filter(Boolean).forEach((el) => el.onkeydown = (ev) => { if (ev.key === 'Enter') check(); });
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
      + (it.type === 'steps' ? method : `<div class="fb sol"><b>${it.type === 'num' ? `La réponse : ${fmtAns(it)} ${esc(it.unit)}` : 'Retiens bien la bonne réponse en vert.'}</b>${it.type === 'num' && it.sol && it.sol.length ? `<ol>${steps(it).map((s) => `<li>${s}</li>`).join('')}</ol>` : it.hints && it.hints[0] ? `<p style="margin:6px 0 0">📌 ${it.hints[0]}</p>` : ''}</div>`)
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
      ${r.correct ? '' : `<div class="fb sol small"><b>${r.item.type === 'num' ? `Réponse : ${fmtAns(r.item)} ${esc(r.item.unit)}` : 'Réponse : ' + r.item.choices.find((c) => c.ok).t}</b>${r.item.sol && r.item.sol.length ? `<ol>${r.item.sol.map((s) => `<li>${s}</li>`).join('')}</ol>` : ''}</div>`}</div>`).join('')}
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
  notion: 'relisez ensemble la leçon correspondante dans « Mes cours ».',
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
  ['Justes « au hasard » (7 j)', (s, t) => `${t.lucky7 || 0}`, 'Bonnes réponses données « au hasard » : elles reviennent le lendemain pour vérifier.'],
  [(g) => `Faux alors que « ${gw(g, 'sûre', 'sûr', 'sûr(e)')} » (7 j)`, (s, t) => `${t.surewrong7 || 0}`, 'Erreurs faites avec une certitude : ce sont les idées fausses à corriger en priorité.'],
  ['File « À revoir »', (s) => `${(s.review || []).length} exercice(s)`, 'Chaque erreur revient à J+1, J+3, J+7 puis J+21 jusqu’à être réussie.'],
  ['Démarrage', (s) => s.diagDone ? `bilan terminé le ${s.diag.date.split('-').reverse().join('/')} (${s.diag.score}/${s.diag.total})` : `${(s.diagParts || []).filter(Boolean).length}/3 blocs du bilan`, 'Bilan de départ en 3 blocs de 5 questions, un par jour.'],
];
/* Accords : 'f', 'm' ou rien (tournure neutre) */
const gw = (g, f, m, n) => g === 'f' ? f : g === 'm' ? m : n;
const isOpen = (s, k) => !k.lesson || !!((s.cours || {})[k.lesson] || {}).done;
const lastDays = (n) => { const t = todayStr(), out = []; for (let i = n - 1; i >= 0; i--) out.push(addDays(t, -i)); return out; };
function weekCard(s, st) {
  const t = st.totals || {}, days = st.days || [], g = st.gender;
  const d7 = lastDays(7);
  const active = days.filter((d) => d7.includes(d.day) && d.n > 0).length;
  const feu = active >= 4 ? 'g' : active >= 2 ? 'o' : 'r';
  const reg = `<span class="feu ${feu}"></span><b>Régularité :</b> ${active} jour${active > 1 ? 's' : ''} sur 7, ${t.n7 || 0} exercices${t.n7 ? ` (${Math.round(t.ok7 / t.n7 * 100)} % de réussite)` : ''}. ${feu === 'g' ? 'Très bien, c’est le bon rythme.' : feu === 'o' ? 'Objectif : 4 jours par semaine, même 10 minutes.' : `Peu de pratique cette semaine : un petit mot pour ${gw(g, 'l’encourager', 'l’encourager', 'encourager')} à faire la mission du jour.`}`;
  const gains = SKILLS.filter((k) => isOpen(s, k)).map((k) => ({ k, g: s.mastery[k.id] - ((s.diag && s.diag.skills && s.diag.skills[k.id]) ?? 0) })).sort((a, b) => b.g - a.g);
  const best = gains[0];
  const prog = best && best.g > 0 ? `<b>Progrès :</b> ${best.k.icon} ${best.k.name}, ${medalOf(s.mastery[best.k.id]) !== 'none' ? `médaille ${MEDAL_TXT[medalOf(s.mastery[best.k.id])].toLowerCase()}, ` : ''}+${best.g} points depuis ${s.diag ? 'le bilan de départ' : 'le début'}.`
    : '<b>Progrès :</b> pas encore de progrès net mesuré. Les médailles demandent des réussites sur plusieurs jours.';
  const err = (st.errors || []).find((e) => !['nsp', 'hasard'].includes(e.code));
  const att = err ? `<b>À travailler :</b> ${esc(ERR_LABELS[err.code] || err.code)} (${err.n} fois en 30 jours). Ce que tu peux lui dire : ${ERR_ADVICE[err.code] || ERR_ADVICE.autre}`
    : '<b>À travailler :</b> pas d’erreur qui se répète pour l’instant.';
  const e = childExams(st)[0];
  let ex = '';
  if (e && e.days <= 7) {
    const from = addDays(e.day, -7), done = (s.boss.history || []).filter((h) => h.date >= from);
    ex = `<li>📅 <b>Contrôle ${examWhen(e)}</b> (${esc(e.label || 'physique-chimie')}) : ${done.length ? `contrôle blanc fait, ${fr(done[done.length - 1].note, 1)}/20.` : e.days <= 2 ? '<b>contrôle blanc pas encore fait</b>, c’est le moment.' : 'l’appli propose chaque jour un programme spécial.'}</li>`;
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

/* ---------- Fenêtre de confirmation intégrée (remplace confirm / prompt / alert) ---------- */
function ask(o) {
  return new Promise((res) => {
    const old = document.getElementById('ask'); if (old) old.remove();
    if (document.activeElement) document.activeElement.blur();
    const hasIn = o.input != null;
    document.body.insertAdjacentHTML('beforeend', `<div class="modal sheet-bg" id="ask" role="dialog" aria-modal="true"><div class="card sheet stack pop">
      <h3>${o.title}</h3>${o.text ? `<p class="small" style="margin:0">${o.text}</p>` : ''}${o.html || ''}
      ${hasIn ? `<input class="field" id="askin" placeholder="${esc(o.input)}" autocomplete="off" ${o.type ? `type="${o.type}"` : ''}>` : ''}
      ${o.copy ? `<textarea class="field" id="askcp" readonly rows="4">${esc(o.copy)}</textarea>` : ''}
      <button class="btn ${o.danger ? 'bad' : ''}" id="askok">${o.ok || 'Confirmer'}</button>
      ${o.cancel === false ? '' : `<button class="btn ghost" id="askno">${o.cancel || 'Annuler'}</button>`}</div></div>`);
    const m = document.getElementById('ask');
    const done = (v) => { m.remove(); res(v); };
    document.getElementById('askok').onclick = async () => {
      if (o.copy) {
        const ta = document.getElementById('askcp'); ta.select();
        try { await navigator.clipboard.writeText(o.copy); } catch (e) { try { document.execCommand('copy'); } catch (e2) {} }
        toast('Copié ✓'); return done(true);
      }
      done(hasIn ? document.getElementById('askin').value.trim() : true);
    };
    const no = document.getElementById('askno'); if (no) no.onclick = () => done(hasIn ? null : false);
    m.onclick = (e) => { if (e.target.id === 'ask') done(hasIn ? null : false); };
    if (hasIn) setTimeout(() => document.getElementById('askin').focus(), 60);
  });
}

/* ---------- Espace parent : 3 onglets (Suivi, Contrôles, Réglages) et choix de l'enfant ---------- */
let FAM = {}, INVITES = [], DASH = null, DASH_AT = 0, PREVIEW_G = null;
const PV = Object.assign({ tab: 'suivi', child: null }, LS.get('rv_pv', {}));
const savePV = () => LS.set('rv_pv', PV);
const childName = (st) => (st.state && st.state.pseudo) || st.label;
const childPlan = (st) => (DASH.plan || []).filter((p) => !p.student || p.student === st.id);
function childExams(st) {
  const t = todayStr();
  return childPlan(st).filter((p) => p.kind === 'exam' && p.day && p.day >= t).sort((a, b) => a.day < b.day ? -1 : 1)
    .map((e) => Object.assign({ days: dayDiff(t, e.day) }, e));
}
function childState(st) {
  const s = Object.assign(defaultState(), st.state || {});
  s.mastery = Object.assign(defaultState().mastery, s.mastery);
  return s;
}
async function screenParent(useCache) {
  if (!(useCache && DASH)) {
    if (!DASH) render('<p class="center muted" style="margin-top:40px">Chargement…</p>');
    let data;
    try { data = await rpc('rv_dashboard', { p_token: token }); }
    catch (e) { if (DASH) { toast('Pas de connexion internet.'); return drawParent(); } render('<p class="center" style="margin-top:40px">Pas de connexion internet.</p><button class="btn" id="rt">Réessayer</button>'); document.getElementById('rt').onclick = () => screenParent(); return; }
    if (data.error) return logout(true);
    DASH = data; DASH_AT = Date.now();
  }
  FAM = DASH.family || {}; INVITES = DASH.invites || [];
  drawParent();
}
function curChild() {
  const studs = DASH.students || [];
  return studs.find((s) => s.id === PV.child) || studs[0] || null;
}
function drawParent() {
  const studs = DASH.students || [], st = curChild();
  if (st) PV.child = st.id;
  const tab = PV.tab;
  let body;
  if (!st) body = tab === 'reglages' ? tabReglages(null) : tab === 'controles' ? '<div class="card"><p style="margin:0">Ajoute d’abord ton enfant dans l’onglet <b>Suivi</b>.</p></div>' : welcomeCard();
  else body = tab === 'controles' ? tabControles(st) : tab === 'reglages' ? tabReglages(st) : tabSuivi(st);
  if (tab === 'admin' && FAM.admin) body = tabAdmin();
  const y = window.scrollY;
  render(`<div class="pz">
    <div class="phead row between"><div class="row" style="gap:8px"><span class="logo-s">⚡</span><b>${APP_NAME}</b></div><span class="small muted">Espace parent</span></div>
    ${studs.length > 1 ? `<div class="kids" role="tablist">${studs.map((s) => `<button role="tab" class="kid ${s === st ? 'on' : ''}" data-kid="${s.id}">${esc(childName(s))}</button>`).join('')}</div>` : ''}
    ${body}
  </div>
  <nav class="tabbar">${[['suivi', '📊', 'Suivi'], ['controles', '📅', 'Contrôles'], ['reglages', '⚙️', 'Réglages']].concat(FAM.admin ? [['admin', '📈', 'Appli']] : []).map(([k, i, l]) => `<button data-tab="${k}" class="${tab === k ? 'on' : ''}" ${tab === k ? 'aria-current="page"' : ''}><span>${i}</span>${l}</button>`).join('')}</nav>`);
  window.scrollTo(0, PV.keepY ? y : 0); PV.keepY = false;
  $app.querySelectorAll('[data-kid]').forEach((b) => b.onclick = () => { PV.child = b.dataset.kid; savePV(); drawParent(); });
  $app.querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => { PV.tab = b.dataset.tab; savePV(); drawParent(); });
  $app.querySelectorAll('[data-rev]').forEach((b) => b.onclick = () => reviewSheet(st));
  $app.querySelectorAll('[data-psj]').forEach((b) => b.onclick = () => { PV.sj = b.dataset.psj || null; PV.keepY = true; savePV(); drawParent(); });
  bindParent(st);
  if (tab === 'admin' && FAM.admin) loadAdmin();
}
/* Mini tableau de bord de l'appli (administrateur seulement) */
let ADM = null, ADM_AT = 0;
function tabAdmin() {
  return `<div class="ptitle"><h1>L’appli en chiffres</h1></div><div id="admbox">${ADM ? admHtml(ADM) : '<p class="center muted">Chargement…</p>'}</div>`;
}
function admHtml(a) {
  const k = (l, v, d) => `<div class="kpi"><span class="small muted">${l}</span><b>${v}</b><span class="small muted">${d}</span></div>`;
  const d = (t) => t ? new Date(t).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) : '—';
  return `<div class="card stack"><h2>👨‍👩‍👧 Familles</h2><div class="kpis two">
      ${k('Parents inscrits', a.families, `+${a.families_7} cette semaine`)}
      ${k('Parents venus (7 j)', a.parents_seen_7, 'ont ouvert leur espace')}
    </div></div>
    <div class="card stack"><h2>🎒 Élèves</h2><div class="kpis two">
      ${k('Enfants créés', a.children, `${a.children_linked} avec l’appli ouverte`)}
      ${k('Actifs aujourd’hui', a.active_today, 'ont fait au moins 1 exercice')}
      ${k('Actifs (7 j)', a.active_7, `sur ${a.children} enfant${a.children > 1 ? 's' : ''}`)}
      ${k('Exercices (7 j)', a.ex_7, `${a.ex_all} depuis le début`)}
    </div></div>
    <div class="card stack"><h2>📋 Familles inscrites</h2>
      ${(a.list || []).length ? `<table>${a.list.map((f) => `<tr><td><b>${esc(f.email)}</b><br><span class="small muted">inscrit le ${d(f.created)} • ${f.kids} enfant${f.kids > 1 ? 's' : ''}</span></td><td class="tact small">${f.ex7} ex. / 7 j<br><span class="muted">dernier : ${d(f.last_ex)}</span></td></tr>`).join('')}</table>` : '<p class="muted small">Aucune famille pour l’instant.</p>'}
      <p class="small muted" style="margin:0">Visible par toi seul. Le compte « test élève » n’est pas compté.</p>
    </div>`;
}
async function loadAdmin() {
  if (ADM && Date.now() - ADM_AT < 60000) return;
  try {
    const r = await rpc('rv_admin_stats', { p_token: token });
    if (!r || r.error) return;
    ADM = r; ADM_AT = Date.now();
    const box = document.getElementById('admbox'); if (box) box.innerHTML = admHtml(ADM);
  } catch (e) { const box = document.getElementById('admbox'); if (box && !ADM) box.innerHTML = '<p class="center muted">Pas de connexion internet.</p>'; }
}
/* Rechargement automatique au retour sur l'appli (remplace « Actualiser ») */
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState !== 'visible' || role !== 'parent' || PREVIEW || !DASH || Date.now() - DASH_AT < 60000) return;
  if (document.getElementById('ask') || (document.activeElement && /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName))) return;
  PV.keepY = true; screenParent();
});

/* ----- Onglet Suivi ----- */
function pendingCard(st) {
  const name = childName(st);
  return `<div class="card stack pending">
    <h2>⏳ En attente de la première connexion</h2>
    <p style="margin:0">${esc(name)} n’a encore ouvert l’appli sur aucun appareil. Envoie-lui son lien : il suffit de l’ouvrir <b>une fois</b> sur son téléphone, sa tablette ou son ordinateur.</p>
    ${accessButtons(st)}
    <p class="small muted" style="margin:0">Le suivi s’affichera ici dès sa première séance.</p>
  </div>`;
}
function accessButtons(st) {
  const name = childName(st);
  return `<button class="btn" data-share="${st.id}" data-name="${esc(name)}">📲 Envoyer le lien à ${esc(name)}</button>
    <button class="btn ghost" data-code="${st.id}">🔢 Afficher un code (appli installée ou ordinateur)</button>
    <div class="codebox" id="code-${st.id}" hidden></div>
    ${PREVIEW ? '' : ACCTS.some((a) => a.role === 'student' && (a.name === name || a.name === st.label))
      ? `<p class="small muted" style="margin:0">✓ ${esc(name)} est sur cet appareil : « 👥 Changer de profil » en bas de cet écran.</p>
        <button class="btn ghost" data-nothere="${esc(st.label || name)}" data-name="${esc(name)}">➖ Retirer ${esc(name)} de cet appareil</button>`
      : `<button class="btn ghost" data-here="${st.id}" data-name="${esc(name)}">➕ Ajouter ${esc(name)} sur cet appareil</button>`}`;
}
function activityChart(st, sj) {
  const days = st.days || [], list = lastDays(14);
  const row = (d) => { const f = days.find((x) => x.day === d) || {}; const c = f.n_chim || 0, n = f.n || 0; return { p: sj === 'chimie' ? 0 : n - c, c: sj === 'physique' ? 0 : c }; };
  const vals = list.map(row), max = Math.max(1, ...vals.map((v) => v.p + v.c)), L = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
  return `<div class="days2 stk">${list.map((d, i) => { const { p, c } = vals[i], n = p + c, last = i === list.length - 1, h = (x) => Math.round(x / max * 100);
    return `<div class="${last ? 'today' : ''}" title="${d.split('-').reverse().join('/')} : ${n} exercice${n > 1 ? 's' : ''}${c && p ? ` (${p} en physique, ${c} en chimie)` : ''}">${n ? `${c ? `<i class="ch" style="height:${Math.max(4, h(c))}%"></i>` : ''}${p ? `<i class="ph${c ? '' : ' top'}" style="height:${Math.max(4, h(p))}%"></i>` : ''}` : '<i class="zero" style="height:4%"></i>'}<span>${last ? 'auj.' : L[new Date(d + 'T12:00').getDay()]}</span></div>`; }).join('')}</div>
    ${sj ? '' : '<p class="small muted legend" style="margin:6px 0 0"><span class="lg ph"></span> physique <span class="lg ch"></span> chimie</p>'}`;
}
/* Chiffres d'une matière pour le parent */
function subjStats(s, st, sj) {
  const t = st.totals || {}, ch = sj === 'chimie', part = (all, c) => ch ? (c || 0) : Math.max(0, (all || 0) - (c || 0));
  const ks = SKILLS.filter((k) => (k.subj || 'physique') === sj), open = ks.filter((k) => isOpen(s, k));
  const started = open.filter((k) => s.mastery[k.id] > 0 || (s.lastPrac || {})[k.id]);
  const cs = COURS.filter((c) => coursSubj(c) === sj), C = ch ? s.ctrlK : s.ctrl;
  return { n7: part(t.n7, t.n7_chim), ok7: part(t.ok7, t.ok7_chim), n: part(t.n, t.n_chim), ok: part(t.ok, t.ok_chim), ms: part(t.ms, t.ms_chim),
    last: ch ? t.last_chim : (t.last_phys !== undefined ? t.last_phys : t.last), open: open.length, total: ks.length, started: started.length,
    medals: open.filter((k) => medalOf(s.mastery[k.id]) !== 'none').length, cd: cs.filter((c) => ((s.cours || {})[c.id] || {}).done).length, ct: cs.length,
    ctrl: C && C.hist && C.hist.length ? C.hist[C.hist.length - 1] : null };
}
function subjCard(s, st) {
  const P = subjStats(s, st, 'physique'), K = subjStats(s, st, 'chimie');
  const pc = (o) => o.n7 ? `${Math.round(o.ok7 / o.n7 * 100)} %` : '—';
  const day = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }) : 'jamais';
  const rows = [
    ['Exercices (7 j)', (o) => `<b>${o.n7}</b>`],
    ['Réussite (7 j)', (o) => `<b>${pc(o)}</b>`],
    ['Depuis le début', (o) => `${o.n} exercice${o.n > 1 ? 's' : ''} • ${Math.round(o.ms / 60000)} min`],
    ['Compétences travaillées', (o) => `${o.started}/${o.open}${o.open < o.total ? ` <span class="small muted">(+${o.total - o.open} à venir)</span>` : ''}`],
    ['Médailles', (o) => `${o.medals}`],
    ['Cours lus', (o) => `${o.cd}/${o.ct}`],
    ['Contrôle type', (o) => o.ctrl ? `${fr(o.ctrl.note, 1)}/20 <span class="small muted">(aide ${o.ctrl.lv}/3)</span>` : '—'],
    ['Dernière séance', (o) => day(o.last)],
  ];
  return `<div class="card stack"><h3>Physique et chimie</h3>
    <table class="cmp"><tr><th></th><th>${SUBJ.physique.icon} Physique</th><th>${SUBJ.chimie.icon} Chimie</th></tr>
    ${rows.map(([l, f]) => `<tr><td class="small muted">${l}</td><td>${f(P)}</td><td>${f(K)}</td></tr>`).join('')}</table>
    <p class="small muted" style="margin:0">Touche « Physique » ou « Chimie » en haut pour voir le détail d’une seule matière.</p></div>`;
}
function tabSuivi(st) {
  const s = childState(st), t = st.totals || {}, name = childName(st), g = st.gender;
  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais';
  const headTitle = `<div class="ptitle"><h1>${esc(name)}</h1><span class="small muted">Dernière activité : ${fmtDate(t.last)}</span></div>`;
  if (!(st.devices || []).length && !t.n) return headTitle + pendingCard(st);
  const psj = PV.sj && SUBJ[PV.sj] ? PV.sj : null, inS = (k) => !psj || (k.subj || 'physique') === psj;
  const open = SKILLS.filter((k) => isOpen(s, k) && inS(k)), closed = SKILLS.filter(inS).length - open.length;
  const started = open.filter((k) => s.mastery[k.id] > 0 || ((s.lastPrac || {})[k.id])), notYet = open.filter((k) => !started.includes(k));
  const due = (s.review || []).filter((r) => r.due <= todayStr() && (!psj || subjOf(r.skill) === psj)).length;
  const ech = st.errors_chim || [];
  const errs = (psj === 'chimie' ? ech : psj === 'physique' ? (st.errors || []).map((e) => { const c = ech.find((x) => x.code === e.code); return { code: e.code, n: e.n - (c ? c.n : 0) }; }).filter((e) => e.n > 0).sort((a, b) => b.n - a.n) : (st.errors || [])).filter((e) => e.code !== 'nsp');
  const ss = psj ? subjStats(s, st, psj) : null;
  const seg = `<div class="seg3" role="tablist">${[['', 'Les deux'], ['physique', SUBJ.physique.icon + ' Physique'], ['chimie', SUBJ.chimie.icon + ' Chimie']].map(([k, l]) => `<button role="tab" data-psj="${k}" class="${(psj || '') === k ? 'on' : ''}" aria-selected="${(psj || '') === k}">${l}</button>`).join('')}</div>`;
  return `${headTitle}
    ${seg}
    ${psj ? '' : weekCard(s, st) + subjCard(s, st)}
    ${ss ? `<div class="card stack"><h3>${SUBJ[psj].icon} ${SUBJ[psj].name}</h3><div class="kpis two">
      <div class="kpi"><span class="small muted">Exercices (7 j)</span><b>${ss.n7}</b><span class="small muted">${ss.n7 ? Math.round(ss.ok7 / ss.n7 * 100) + ' % de réussite' : 'pas encore cette semaine'}</span></div>
      <div class="kpi"><span class="small muted">Contrôle type</span><b>${ss.ctrl ? fr(ss.ctrl.note, 1) + '/20' : '—'}</b><span class="small muted">${ss.ctrl ? `aide ${ss.ctrl.lv}/3` : 'pas encore tenté'}</span></div></div>
      <p class="small muted" style="margin:0">Depuis le début : ${ss.n} exercice${ss.n > 1 ? 's' : ''}, ${Math.round(ss.ms / 60000)} min • ${ss.medals} médaille${ss.medals > 1 ? 's' : ''} • ${ss.cd}/${ss.ct} cours lus</p></div>` : ''}
    <div class="card stack">
      <div class="kpis two">
        <button class="kpi kbtn" data-rev="${st.id}"><span class="small muted">À revoir aujourd’hui</span><b>${due}</b><span class="small muted">exercice${due > 1 ? 's' : ''} raté${due > 1 ? 's' : ''} qui ${due > 1 ? 'reviennent' : 'revient'}</span><span class="small kmore">Voir la liste ›</span></button>
        <div class="kpi"><span class="small muted">Contrôle blanc</span><b>${s.boss.best != null ? fr(s.boss.best, 1) + '/20' : '—'}</b><span class="small muted">${s.boss.history.length ? `meilleure note, ${s.boss.history.length} essai${s.boss.history.length > 1 ? 's' : ''}` : 'pas encore tenté'}</span></div>
      </div>
      <div><b class="small">Exercices par jour${psj ? ' en ' + SUBJ[psj].name.toLowerCase() : ''}, 14 derniers jours</b>${activityChart(st, psj)}</div>
      <button class="btn ghost" data-pv="${st.id}">👀 Voir son appli, comme ${esc(name)} la voit</button>
    </div>
    <div class="card stack">
      <h3>Maîtrise par compétence</h3>
      ${started.length ? Object.keys(SUBJ).filter((sj) => !psj || sj === psj).map((sj) => { const ks = started.filter((k) => (k.subj || 'physique') === sj); return ks.length ? `<b class="small">${SUBJ[sj].icon} ${SUBJ[sj].name}</b><table class="mt">${ks.map((k) => `<tr><td>${k.icon} ${k.name}</td><td style="text-align:right;white-space:nowrap">${medalOf(s.mastery[k.id]) === 'none' ? '<span class="medal m-none">en cours</span>' : medalHtml(s.mastery[k.id])} ${trend(s, k.id)}</td></tr>`).join('')}</table>` : ''; }).join('') : '<p class="small muted" style="margin:0">Aucune compétence travaillée pour l’instant.</p>'}
      ${notYet.length ? `<details><summary class="small"><b>Pas encore commencées (${notYet.length})</b></summary><p class="small muted" style="margin:6px 0 0">${notYet.map((k) => `${k.icon} ${k.name}`).join(' • ')}</p></details>` : ''}
      <p class="small muted" style="margin:0">▲ ▼ : évolution sur 7 jours. Une petite baisse après quelques jours sans pratique est normale.${closed ? ` ${closed} compétence${closed > 1 ? 's' : ''} s’ouvri${closed > 1 ? 'ront' : 'ra'} à la fin de leur leçon.` : ''}</p>
    </div>
    <div class="card stack">
      <h3>Cours lus</h3>
      <table>${COURS.filter((c) => !psj || coursSubj(c) === psj).map((c) => { const p = (s.cours || {})[c.id] || {}; return `<tr><td>${c.icon} ${c.title} <span class="small muted">(${SUBJ[coursSubj(c)].name.toLowerCase()}${c.ahead ? ', en avance' : ''})</span></td><td style="text-align:right">${p.done ? '✅' : (p.seen || []).length ? `${(p.seen || []).length}/${c.sections.length}` : '—'}</td></tr>`; }).join('')}</table>
    </div>
    <details class="card stack"><summary><b>Plus de détails</b> <span class="small muted">erreurs, derniers exercices, indicateurs</span></summary>
      <h3 style="margin-top:10px">Erreurs les plus fréquentes${psj ? ' en ' + SUBJ[psj].name.toLowerCase() : ''} (30 j)</h3>
      ${errs.length ? `<table>${errs.slice(0, 5).map((e) => `<tr><td>${esc(ERR_LABELS[e.code] || e.code)}</td><td style="text-align:right"><b>${e.n}</b></td></tr>`).join('')}</table>` : '<p class="small muted">Rien à signaler pour l’instant.</p>'}
      <h3>Indicateurs</h3>
      <table>${KPI_HELP.map(([l, f, h]) => `<tr><td><b>${typeof l === 'function' ? l(g) : l}</b> : ${f(s, t)}<br><span class="small muted">${h}</span></td></tr>`).join('')}</table>
      <h3>Derniers exercices${psj ? ' en ' + SUBJ[psj].name.toLowerCase() : ''}</h3>
      ${recentHtml(st, g, psj)}
    </details>`;
}

/* Derniers exercices : un bloc par jour, les erreurs d'abord, les réussites repliées */
function recentHtml(st, g, psj) {
  const rec = (st.recent || []).filter((r) => !psj || subjOf(r.skill) === psj);
  if (!rec.length) return '<p class="small muted" style="margin:0">Aucun exercice pour l’instant.</p>';
  const dayOf = (ts) => new Date(ts).toLocaleDateString('fr-CA', { timeZone: 'Europe/Paris' });
  const days = [...new Set(rec.map((r) => dayOf(r.ts)))];
  const confTxt = (c) => ({ sure: gw(g, 'sûre', 'sûr', 'sûr(e)'), hesite: 'hésitait', hasard: 'au hasard', nsp: 'ne savait pas' }[c] || c);
  const sk = (id) => SKILLS.find((x) => x.id === id) || { icon: '•', name: id };
  const bad = (r) => `<li class="rx"><span class="small muted">${new Date(r.ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • ${sk(r.skill).icon} ${esc(sk(r.skill).name)}</span><br>${esc((r.question || '').slice(0, 160))}<br>
    <span class="small">Sa réponse : <b>${esc(r.answer)}</b>${r.error_code && ERR_LABELS[r.error_code] ? ` • ${esc(ERR_LABELS[r.error_code])}` : ''}${r.conf ? ` • ${esc(confTxt(r.conf))}` : ''}</span></li>`;
  const good = (r) => `<li class="small">${sk(r.skill).icon} ${esc((r.question || '').slice(0, 90))}${(r.question || '').length > 90 ? '…' : ''}${r.conf === 'hasard' ? ' <span class="muted">(au hasard)</span>' : ''}</li>`;
  return days.map((d, i) => {
    const list = rec.filter((r) => dayOf(r.ts) === d), ko = list.filter((r) => !r.correct), ok = list.filter((r) => r.correct);
    const lbl = d === todayStr() ? 'Aujourd’hui' : d === addDays(todayStr(), -1) ? 'Hier' : new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'short' });
    return `<details class="dayg" ${i === 0 ? 'open' : ''}><summary><b>${lbl}</b> <span class="small muted">• ${list.length} exercice${list.length > 1 ? 's' : ''} • ${ok.length} juste${ok.length > 1 ? 's' : ''}${ko.length ? ` • ${ko.length} erreur${ko.length > 1 ? 's' : ''}` : ''}</span></summary>
      ${ko.length ? `<ul class="rxl">${ko.map(bad).join('')}</ul>` : '<p class="small" style="margin:6px 0">✅ Aucune erreur ce jour-là.</p>'}
      ${ok.length ? `<details class="okl"><summary class="small">Voir ${ok.length > 1 ? `les ${ok.length} exercices réussis` : 'l’exercice réussi'}</summary><ul>${ok.map(good).join('')}</ul></details>` : ''}
    </details>`;
  }).join('') + `<p class="small muted" style="margin:6px 0 0">Les ${rec.length} derniers exercices${psj ? ' de ' + SUBJ[psj].name.toLowerCase() : ''}. Les erreurs sont en premier ; les exercices réussis sont repliés.</p>`;
}
/* File « À revoir » expliquée au parent */
function reviewSheet(st) {
  const s = childState(st), name = childName(st), t = todayStr();
  const list = (s.review || []).slice().sort((a, b) => a.due < b.due ? -1 : 1), sk = (id) => SKILLS.find((x) => x.id === id) || { icon: '•', name: id };
  const when = (d) => d <= t ? '<b>aujourd’hui</b>' : d === addDays(t, 1) ? 'demain' : 'le ' + new Date(d + 'T12:00').toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
  const html = list.length ? `<ul class="rvl">${list.map((r) => `<li><b>${sk(r.skill).icon} ${esc(sk(r.skill).name)}</b>${r.redac ? ' <span class="small muted">(à rédiger)</span>' : ''}<br>
      <span class="small">${esc(ERR_LABELS[r.code] || 'Erreur')}${r.src === 'copie' ? ` • 📝 relevée sur une copie${r.label ? ` (${esc(r.label)})` : ''}` : ''}</span><br>
      <span class="small muted">Revient ${when(r.due)} • passage ${Math.min(r.step + 1, 4)} sur 4</span></li>`).join('')}</ul>`
    : '<p class="small" style="margin:0">La file est vide : aucune erreur en attente.</p>';
  ask({ title: `La file « À revoir » de ${esc(name)}`, cancel: false, ok: 'Fermer',
    text: `Chaque exercice raté revient sous une autre forme (d’autres nombres) : le lendemain, puis 3, 7 et 21 jours après. Réussi à chaque passage, il sort de la liste ; raté, il repart du début. ${esc(name)} les retrouve au début de sa séance du jour.`,
    html });
}

/* ----- Onglet Contrôles et copies ----- */
const fmtD = (d) => d ? d.split('-').reverse().join('/') : '';
function tabControles(st) {
  const s = childState(st), name = childName(st);
  const ex = childExams(st), cp = childPlan(st).filter((p) => p.kind === 'copie');
  const fam = (p) => p.student ? '' : ' <span class="small muted">(toute la famille)</span>';
  const skillOpts = Object.keys(SUBJ).map((sj) => `<b class="small" data-sjh="${sj}">${SUBJ[sj].icon} ${SUBJ[sj].name}</b>` + SKILLS.filter((k) => (k.subj || 'physique') === sj).map((k) => `<label class="ck line" data-sjk="${sj}"><input type="checkbox" value="${k.id}"> ${k.icon} ${k.name}${isOpen(s, k) ? '' : ' <span class="small muted">(leçon pas encore lue)</span>'}</label>`).join('')).join('');
  return `<div class="ptitle"><h1>Contrôles de ${esc(name)}</h1></div>
  <div class="card stack">
    <h2>📅 Prochains contrôles</h2>
    ${ex.length ? `<table>${ex.map((e) => `<tr><td><b>${fmtD(e.day)}</b> • ${esc(e.label || 'Contrôle')}${fam(e)}<br><span class="small muted">${examWhen(e)} • ${SUBJ[examSubj(e)] ? SUBJ[examSubj(e)].icon + ' ' + SUBJ[examSubj(e)].name + ' : ' : ''}${examSubj(e) !== 'mix' && SKILLS.filter((k) => (k.subj || 'physique') === examSubj(e)).every((k) => (e.skills || []).includes(k.id)) ? 'toutes les compétences' : (e.skills || []).map((k) => (SKILLS.find((x) => x.id === k) || {}).name).filter(Boolean).join(', ') || 'toutes les compétences'}</span></td><td class="tact"><button class="more" data-del="${e.id}" data-what="le contrôle du ${fmtD(e.day)}" aria-label="Options">⋯</button></td></tr>`).join('')}</table>`
      : `<p class="small muted" style="margin:0">Aucun contrôle saisi. Dès qu’une date est connue, l’appli prépare ${esc(name)} : programme ciblé 7 jours avant, contrôle blanc à J-2.</p>`}
    <details><summary><b>+ Ajouter un contrôle</b></summary>
      <div class="stack" style="margin-top:10px">
        <label class="small" for="exday"><b>Date du contrôle</b></label><input class="field" type="date" id="exday" min="${todayStr()}">
        <label class="small" for="exsubj"><b>Matière</b></label>
        <select class="field" id="exsubj"><option value="physique">⚡ Physique</option><option value="chimie">⚗️ Chimie</option><option value="mix">Les deux</option></select>
        <label class="small" for="exlabel"><b>Titre</b> <span class="muted">(facultatif)</span></label><input class="field" id="exlabel" maxlength="120" placeholder="Ex. : vitesse et distance d’arrêt, ou l’atome">
        <details><summary class="small"><b>Préciser les compétences</b> <span class="muted">(facultatif, sinon toutes celles de la matière)</span></summary><div class="cks col" id="exsk" style="margin-top:8px">${skillOpts}</div></details>
        <button class="btn" id="exadd">Enregistrer le contrôle</button></div>
    </details>
  </div>
  <div class="card stack">
    <h2>📝 Erreurs relevées sur les copies</h2>
    ${FAM.admin ? '<div class="tip">📸 <b>Le plus simple :</b> envoie la photo de la copie corrigée : l’application relève les erreurs pour toi.</div>' : ''}
    <p class="small muted" style="margin:0">Chaque erreur saisie revient dans « À revoir » dès la prochaine connexion, puis à J+1, J+3, J+7 et J+21.</p>
    ${cp.length ? `<table>${cp.slice(-8).reverse().map((e) => `<tr><td>${esc(e.label || '')}${fam(e)}<br><span class="small muted">${esc(ERR_LABELS[e.error_code] || e.error_code || '')}</span></td><td class="tact"><button class="more" data-del="${e.id}" data-what="l’erreur « ${esc(e.label || '')} »" aria-label="Options">⋯</button></td></tr>`).join('')}</table>` : ''}
    <details><summary><b>+ Ajouter une erreur à la main</b></summary>
      <div class="stack" style="margin-top:10px">
        <label class="small" for="cplabel"><b>Exercice</b> <span class="muted">(facultatif)</span></label><input class="field" id="cplabel" maxlength="120" placeholder="Ex. : contrôle du 12/11, exercice 3">
        <label class="small" for="cptype"><b>Ce qui n’allait pas</b></label>
        <select class="field" id="cptype">${COPY_TYPES.map(([t], i) => `<option value="${i}">${esc(t)}</option>`).join('')}</select>
        <button class="btn" id="cpadd">Enregistrer l’erreur</button></div>
    </details>
  </div>`;
}

/* ----- Onglet Réglages ----- */
const genderField = (name, val) => `<div class="seg">${[['f', 'Fille'], ['m', 'Garçon'], ['', 'Ne pas préciser']].map(([v, l]) => `<label><input type="radio" name="${name}" value="${v}" ${(val || '') === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}</div>`;
function addChildForm(first) {
  return `<div class="stack" style="margin-top:8px">
    <label class="small" for="cname"><b>Prénom de ${first ? 'ton enfant' : 'l’enfant'}</b></label>
    <input class="field" id="cname" maxlength="30" placeholder="Prénom ou surnom" autocomplete="off">
    <span class="small"><b>C’est…</b> <span class="muted">(pour accorder les textes de l’appli)</span></span>
    ${genderField('cgender', '')}
    <label class="small" for="cpin"><b>Code à 4 chiffres</b> <span class="muted">(facultatif)</span></label>
    <input class="field" id="cpin" maxlength="4" inputmode="numeric" pattern="[0-9]*" placeholder="Ex. : 2580" autocomplete="off">
    <p class="small muted" style="margin:0">Sur son propre téléphone, ton enfant ouvre l’appli sans rien taper. Ce code ne sert que si plusieurs profils sont enregistrés sur le même appareil (tablette familiale…).</p>
    <button class="btn" id="cadd">Ajouter</button></div>`;
}
const HELP_QA = [
  ['Comment mon enfant se connecte-t-il ?', 'Tu lui envoies son lien personnel (Réglages › « 📲 Envoyer le lien »). Il l’ouvre <b>une seule fois</b> sur son téléphone, sa tablette ou son ordinateur. Cet appareil est alors reconnu : la fois suivante, l’appli s’ouvre directement sur son espace, sans mot de passe à retenir.'],
  ['À quoi sert le code à 4 chiffres ?', 'Il ne sert que lorsque <b>plusieurs profils sont enregistrés sur le même appareil</b> : une tablette familiale, un ordinateur partagé, ou ton propre téléphone sur lequel tu as aussi ton espace parent. L’appli demande alors « Qui se connecte ? » et le profil protégé (🔒) n’ouvre qu’avec son code. Cela évite qu’un frère, une sœur ou un parent réponde à sa place.'],
  ['Faut-il mettre un code ?', 'Non, c’est facultatif. Si ton enfant révise uniquement sur son propre téléphone, laisse le champ vide. Tu peux ajouter ou changer le code plus tard dans Réglages › « Autres réglages ».'],
  ['L’appli est installée sur l’écran d’accueil : pourquoi le lien ne suffit pas ?', 'Sur un téléphone, l’appli installée garde sa propre mémoire, séparée du navigateur. Un lien touché dans un e-mail ou WhatsApp s’ouvre dans le navigateur, pas dans l’appli. Dans l’appli installée, on se connecte donc avec un <b>code</b> : pour toi, le code à 6 chiffres de l’e-mail de connexion ; pour ton enfant, le bouton « 🔢 Afficher un code ». Ensuite, l’appli s’ouvre directement.'],
  ['Et sur un ordinateur ?', 'Même principe : touche « 🔢 Afficher un code », puis ton enfant le tape une fois sur l’ordinateur, qui est ensuite reconnu.'],
  ['Un appareil a été perdu ou prêté ?', 'Dans Réglages, touche « Retirer » à côté de l’appareil : il ne pourra plus ouvrir l’appli. En cas de doute, « Créer un nouveau lien » désactive l’ancien lien.'],
  ['Puis-je voir ce que fait mon enfant ?', 'Oui : dans Suivi, « 👀 Voir son appli » t’ouvre son appli telle qu’il la voit, sans rien enregistrer. Tu reçois aussi les e-mails choisis dans Réglages › « ✉️ E-mails ».'],
  ['Les contrôles valent-ils pour tous mes enfants ?', 'Non : chaque contrôle et chaque erreur de copie est rattaché à l’enfant choisi en haut de l’écran. Change d’enfant avant de saisir.'],
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
function accessCard(st) {
  const dev = st.devices || [], name = childName(st);
  return `<div class="card stack access">
    <h2>📱 Accès de ${esc(name)}</h2>
    ${accessButtons(st)}
    ${dev.length ? `<table>${dev.map((d) => `<tr><td>${esc(d.label || 'Appareil')}<br><span class="small muted">Dernière utilisation : ${fmtDay(d.last)}</span></td><td class="tact"><button class="link" data-dev="${d.id}" data-what="${esc(d.label || 'cet appareil')}">Retirer</button></td></tr>`).join('')}</table>` : '<p class="small muted" style="margin:0">Aucun appareil pour l’instant.</p>'}
    <details><summary class="small"><b>Autres réglages de ${esc(name)}</b></summary><div class="stack" style="margin-top:10px">
      <span class="small"><b>C’est…</b> <span class="muted">(accord des textes)</span></span>
      ${genderField('g-' + st.id, st.gender)}
      <span class="small"><b>Code à 4 chiffres</b> <span class="muted">: ${st.has_pin ? 'activé' : 'aucun'} (demandé seulement si plusieurs profils partagent un appareil)</span></span>
      <input class="field" data-pinin="${st.id}" maxlength="4" inputmode="numeric" placeholder="Nouveau code" autocomplete="off">
      <button class="btn ghost" data-pinset="${st.id}">Enregistrer le code</button>
      <button class="btn ghost" data-renew="${st.id}" data-name="${esc(name)}">🔄 Créer un nouveau lien (l’ancien ne marchera plus)</button>
      <button class="link danger" data-cdel="${st.id}" data-name="${esc(name)}" data-n="${(st.totals || {}).n || 0}" data-last="${(st.totals || {}).last || ''}" data-ndev="${dev.length}">Supprimer le profil de ${esc(name)} et ses données</button>
    </div></details>
  </div>`;
}
function calcCard(st) {
  const s = childState(st), name = childName(st);
  const row = childPlan(st).filter((p) => p.kind === 'reglage' && p.label === 'calc' && p.student === st.id).sort((a, b) => a.created_at < b.created_at ? 1 : -1)[0];
  const curId = row && (!s.calcAt || new Date(row.created_at).getTime() >= s.calcAt) ? row.error_code : s.calc;
  return `<details class="card stack"><summary><b>🧮 Calculatrice de ${esc(name)}</b> <span class="small muted">${calcOf(curId) ? esc(calcOf(curId).name) : 'pas encore choisie'}</span></summary>
    <div class="stack" style="margin-top:8px">
    <p class="small muted" style="margin:0">En chimie, l’appli explique comment taper les puissances de dix (1,67 × 10⁻²⁷) sur ce modèle. ${esc(name)} peut aussi la choisir dans son menu ⚙️.</p>
    <select class="field" id="calcsel">${CALCS.map((c) => `<option value="${c.id}" ${c.id === curId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select>
    <button class="btn" id="calcsave">Enregistrer la calculatrice</button></div></details>`;
}
function tabReglages(st) {
  const studs = DASH.students || [], n = FAM.notify || 'each';
  const opt = (v, t, d) => `<label class="radio"><input type="radio" name="notify" value="${v}" ${n === v ? 'checked' : ''}><span><b>${t}</b><br><span class="small muted">${d}</span></span></label>`;
  return `<div class="ptitle"><h1>Réglages</h1></div>
  ${st ? accessCard(st) + calcCard(st) : ''}
  <div class="card stack">
    <h2>✉️ E-mails</h2>
    <p class="small muted" style="margin:0">Envoyés à ${esc(FAM.email || '')}</p>
    ${opt('each', 'À chaque séance', 'Un e-mail quand ton enfant commence à réviser (30 min d’écart au minimum).')}
    ${opt('evening', 'Récap du soir', 'Un seul e-mail vers 21 h, seulement les jours de révision.')}
    ${opt('off', 'Aucun', 'Tu consultes le tableau de bord quand tu veux.')}
    <label class="ck"><input type="checkbox" id="fweek" ${FAM.weekly ? 'checked' : ''}> Bilan de la semaine le dimanche soir</label>
  </div>
  ${studs.length ? `<details class="card stack"><summary><b>➕ Ajouter un autre enfant</b></summary>${addChildForm(false)}</details>` : ''}
  <div class="card stack">
    <h2>📣 Faire connaître l’appli à d’autres parents</h2>
    <p class="small muted" style="margin:0">Envoie le lien par WhatsApp, SMS ou e-mail. L’autre parent touche « Je suis parent » et crée son espace avec son adresse e-mail. C’est gratuit, sans code d’invitation.</p>
    <button class="btn" id="invadd">Partager l’appli</button>
  </div>
  ${FAM.admin ? '' : `<details class="card stack"><summary><b>Mon compte</b></summary><div class="stack" style="margin-top:8px">
    <p class="small muted" style="margin:0">Supprimer ton compte efface définitivement ton espace, les profils de tes enfants et toutes leurs réponses.</p>
    <button class="btn ghost danger" id="fdel">Supprimer mon compte</button></div></details>`}
  ${helpCard()}
  <div class="center stack" style="gap:6px">
    ${ACCTS.length > 1 ? '<button class="btn ghost" id="psw">👥 Changer de profil</button>' : ''}
    <button class="link" id="out">Me déconnecter de cet appareil</button>
  </div>
  ${legal()}`;
}
const childUrl = (sec) => `${location.origin}${location.pathname}#j=${sec}`;
const fmtDay = (d) => new Date(d).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
async function shareText(title, text, url) {
  if (navigator.share) { try { await navigator.share({ title, text, url }); return; } catch (e) { if (e && e.name === 'AbortError') return; } }
  const full = `${text} ${url}`;
  try { await navigator.clipboard.writeText(full); toast('Message copié : colle-le dans WhatsApp ou un SMS.'); }
  catch (e) { ask({ title: 'Copie ce message', text: 'Puis colle-le dans WhatsApp ou un SMS.', copy: full, ok: 'Copier', cancel: 'Fermer' }); }
}
function inviteShare(code) {
  shareText(APP_NAME, `Je t’invite à essayer ${APP_NAME}, une appli pour aider nos enfants à réviser la physique-chimie de 3e. Touche « Je suis parent », entre ton adresse e-mail et tape le code que tu reçois par e-mail.`, `${location.origin}${location.pathname}`);
}
function bindParent(st) {
  const $ = (id) => document.getElementById(id);
  const call = async (fn, args, ok) => {
    try {
      const r = await rpc(fn, Object.assign({ p_token: token }, args));
      if (r.error) { toast(r.error === 'auth' ? 'Reconnecte-toi.' : 'Impossible pour l’instant.'); return null; }
      if (ok) toast(ok); return r;
    } catch (e) { toast('Pas de connexion internet.'); return null; }
  };
  const reload = () => { PV.keepY = true; return screenParent(); };
  // Ajout d'un enfant
  if ($('cadd')) $('cadd').onclick = async () => {
    const name = $('cname').value.trim(), pin = $('cpin').value.trim();
    const g = (document.querySelector('input[name="cgender"]:checked') || {}).value || null;
    if (!name) return toast('Écris le prénom de ton enfant.');
    if (pin && !/^\d{4}$/.test(pin)) return toast('Le code doit faire 4 chiffres.');
    const r = await call('rv_child_add', { p_name: name, p_pin: pin || null, p_gender: g }, `Profil de ${name} créé ✓`);
    if (r) { PV.child = r.id; PV.tab = 'suivi'; savePV(); screenParent(); }
  };
  // Accès
  $app.querySelectorAll('[data-share]').forEach((b) => b.onclick = async () => {
    const r = await call('rv_child_link', { p_child: b.dataset.share, p_renew: false }); if (!r) return;
    shareText(APP_NAME, `${b.dataset.name}, voici ton lien pour réviser la physique-chimie. Ouvre-le une fois sur ton téléphone (ou ta tablette) : ensuite l’appli s’ouvrira directement.`, childUrl(r.secret));
  });
  $app.querySelectorAll('[data-code]').forEach((b) => b.onclick = async () => {
    const r = await call('rv_child_code', { p_child: b.dataset.code }); if (!r) return;
    const box = $('code-' + b.dataset.code);
    box.hidden = false;
    box.innerHTML = `<p class="small" style="margin:0">Dans l’appli installée sur son écran d’accueil (ou sur l’ordinateur, à l’adresse <b>${esc(location.host)}</b>), choisir « Je suis élève » puis taper :</p><div class="bigcode">${r.code}</div><p class="small muted" style="margin:0">Valable ${r.minutes} minutes, une seule fois.</p>`;
  });
  $app.querySelectorAll('[data-here]').forEach((b) => b.onclick = async () => {
    const nm = b.dataset.name;
    if (!await ask({ title: `Ajouter ${nm} sur cet appareil ?`, text: `À chaque ouverture, l’appli demandera « Qui se connecte ? » : ton espace parent ou celui de ${nm}. Pour passer de l’un à l’autre : « 👥 Changer de profil ».`, ok: 'Ajouter' })) return;
    const c = await call('rv_child_code', { p_child: b.dataset.here }); if (!c) return;
    try {
      const r = await rpc('rv_join_code', { p_code: c.code, p_label: deviceLabel() });
      if (!r.token) return toast('Impossible pour le moment, réessaie.');
      ACCTS = ACCTS.filter((a) => a.token !== r.token && !(a.role === 'student' && a.name === r.name));
      ACCTS.push({ token: r.token, role: 'student', name: r.name, pin: !!r.pin }); saveAccts();
      toast(`${nm} est ajouté${(DASH.students || []).find((x) => x.id === b.dataset.here)?.gender === 'f' ? 'e' : ''} sur cet appareil ✓`);
      reload();
    } catch (e) { toast('Pas de connexion internet.'); }
  });
  $app.querySelectorAll('[data-nothere]').forEach((b) => b.onclick = async () => {
    const nm = b.dataset.name, lab = b.dataset.nothere;
    if (!await ask({ title: `Retirer ${nm} de cet appareil ?`, text: `Son profil disparaît seulement de ce téléphone. Ses progrès sont conservés et son propre téléphone continue de marcher. Tu pourras la rajouter d’un toucher.`, ok: 'Retirer' })) return;
    ACCTS.filter((a) => a.role === 'student' && (a.name === lab || a.name === nm)).forEach((a) => { const k = a.token.slice(0, 8); ['rv_state_', 'rv_queue_', 'rv_act_', 'rv_plan_'].forEach((p) => LS.del(p + k)); });
    ACCTS = ACCTS.filter((a) => !(a.role === 'student' && (a.name === lab || a.name === nm))); saveAccts();
    toast(`${nm} est retiré${(DASH.students || []).find((x) => (x.label === lab))?.gender === 'f' ? 'e' : ''} de cet appareil ✓`);
    reload();
  });
  $app.querySelectorAll('[data-dev]').forEach((b) => b.onclick = async () => {
    if (!await ask({ title: `Retirer « ${b.dataset.what} » ?`, text: 'Cet appareil ne pourra plus ouvrir l’appli. Il faudra renvoyer le lien pour l’utiliser à nouveau.', ok: 'Retirer', danger: true })) return;
    if (await call('rv_device_del', { p_device: +b.dataset.dev }, 'Appareil retiré')) reload();
  });
  $app.querySelectorAll('[data-pinset]').forEach((b) => b.onclick = async () => {
    const v = document.querySelector(`[data-pinin="${b.dataset.pinset}"]`).value.trim();
    if (!/^\d{4}$/.test(v)) return toast('Le code doit faire 4 chiffres.');
    if (await call('rv_child_set', { p_child: b.dataset.pinset, p_name: null, p_pin: v }, 'Code enregistré ✓')) reload();
  });
  if (st) $app.querySelectorAll(`input[name="g-${st.id}"]`).forEach((i) => i.onchange = async () => {
    if (await call('rv_child_set', { p_child: st.id, p_name: null, p_pin: null, p_gender: i.value || 'x' }, 'Enregistré ✓')) { st.gender = i.value || null; }
  });
  $app.querySelectorAll('[data-renew]').forEach((b) => b.onclick = async () => {
    if (!await ask({ title: 'Créer un nouveau lien ?', text: 'L’ancien lien ne fonctionnera plus. Les appareils déjà associés restent connectés (tu peux les retirer un par un).', ok: 'Créer le nouveau lien' })) return;
    const r = await call('rv_child_link', { p_child: b.dataset.renew, p_renew: true }, 'Nouveau lien créé'); if (!r) return;
    shareText(APP_NAME, `${b.dataset.name}, voici ton nouveau lien pour réviser la physique-chimie :`, childUrl(r.secret));
  });
  $app.querySelectorAll('[data-cdel]').forEach((b) => b.onclick = async () => {
    const nm = b.dataset.name, n = +b.dataset.n || 0, nd = +b.dataset.ndev || 0;
    const lost = n ? `<b>${n} exercice${n > 1 ? 's' : ''}</b> (dernier le ${fmtDay(b.dataset.last)}), ses médailles, ses contrôles et ses erreurs de copie` : 'ce profil (aucun exercice fait pour l’instant), ses contrôles et ses erreurs de copie';
    const txt = `Seront effacés définitivement : ${lost}.${nd ? ` ${nd} appareil${nd > 1 ? 's seront déconnectés' : ' sera déconnecté'}.` : ''} Rien ne pourra être récupéré.`;
    let conf = null;
    if (n) {
      conf = await ask({ title: `Supprimer le profil de ${esc(nm)} ?`, text: txt + `<br><br>Pour confirmer, tape son prénom : <b>${esc(nm)}</b>`, input: 'Prénom', ok: 'Supprimer définitivement', danger: true });
      if (!conf) return;
      const norm = (x) => String(x).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      if (norm(conf) !== norm(nm)) { toast('Le prénom ne correspond pas : rien n’a été supprimé.'); return; }
    } else if (!await ask({ title: `Supprimer le profil de ${esc(nm)} ?`, text: txt, ok: 'Supprimer définitivement', danger: true })) return;
    const r = await call('rv_child_del', { p_child: b.dataset.cdel, p_confirm: conf }, null);
    if (r) { toast(r.ok ? 'Profil supprimé' : 'Ce profil n’existe plus.'); PV.child = null; savePV(); screenParent(); }
  });
  // E-mails, invitations, compte
  $app.querySelectorAll('input[name="notify"]').forEach((i) => i.onchange = () => { FAM.notify = i.value; DASH.family.notify = i.value; call('rv_family_set', { p_notify: i.value, p_weekly: null }, 'Réglage enregistré ✓'); });
  if ($('fweek')) $('fweek').onchange = () => { FAM.weekly = $('fweek').checked; DASH.family.weekly = FAM.weekly; call('rv_family_set', { p_notify: null, p_weekly: FAM.weekly }, 'Réglage enregistré ✓'); };
  if ($('invadd')) $('invadd').onclick = async () => {
    inviteShare();
  };
  $app.querySelectorAll('[data-inv]').forEach((b) => b.onclick = () => inviteShare(b.dataset.inv));
  if ($('fdel')) $('fdel').onclick = async () => {
    const v = await ask({ title: 'Supprimer ton compte ?', text: `Tout sera effacé définitivement. Pour confirmer, tape ton adresse e-mail (${esc(FAM.email)}).`, input: 'Ton adresse e-mail', type: 'email', ok: 'Supprimer mon compte', danger: true });
    if (v == null) return;
    try {
      const r = await rpc('rv_family_delete', { p_token: token, p_confirm: v });
      if (r.ok) { await ask({ title: 'Compte supprimé', text: 'Ton compte et toutes les données associées ont été supprimés.', ok: 'OK', cancel: false }); return logout(); }
      toast(r.error === 'confirm' ? 'L’adresse ne correspond pas : rien n’a été supprimé.' : 'Impossible pour l’instant.');
    } catch (e) { toast('Pas de connexion internet.'); }
  };
  if ($('out')) $('out').onclick = async () => { if (await ask({ title: 'Te déconnecter de cet appareil ?', text: 'Tu pourras revenir avec un nouveau code reçu par e-mail.', ok: 'Me déconnecter' })) { DASH = null; logout(); } };
  if ($('psw')) $('psw').onclick = () => { DASH = null; switchProfile(); };
  // Aperçu de l'appli de l'enfant
  $app.querySelectorAll('[data-pv]').forEach((b) => b.onclick = () => {
    const c = (DASH.students || []).find((x) => x.id === b.dataset.pv);
    S = Object.assign(defaultState(), JSON.parse(JSON.stringify(c.state || {})));
    S.mastery = Object.assign(defaultState().mastery, S.mastery);
    if (!S.pseudo) S.pseudo = c.label || 'Élève';
    PLAN = childPlan(c); PREVIEW_G = c.gender || null;
    PREVIEW = true; document.body.classList.toggle('large', false);
    route();
  });
  // Contrôles et copies (rattachés à l'enfant choisi)
  const add = async (args) => {
    try {
      const r = await rpc('rv_plan_add', Object.assign({ p_token: token, p_day: null, p_label: null, p_skills: [], p_level: 2, p_error_code: null, p_child: st.id }, args));
      if (r.error) return toast(r.error === 'auth' ? 'Reconnecte-toi.' : 'Erreur : ' + r.error);
      toast('Enregistré ✓'); reload();
    } catch (e) { toast('Impossible pour l’instant (pas de connexion ?).'); }
  };
  if ($('exadd')) $('exadd').onclick = () => {
    const day = $('exday').value;
    if (!day) return toast('Choisis la date du contrôle.');
    const sj = $('exsubj').value, picked = [...document.querySelectorAll('#exsk input:checked')].map((x) => x.value);
    const skills = picked.length ? picked : sj === 'mix' ? [] : SKILLS.filter((k) => (k.subj || 'physique') === sj).map((k) => k.id);
    add({ p_kind: 'exam', p_day: day, p_label: $('exlabel').value.trim() || `Contrôle de ${subjLabel(sj)}`, p_skills: skills });
  };
  if ($('calcsave')) $('calcsave').onclick = () => add({ p_kind: 'reglage', p_label: 'calc', p_error_code: $('calcsel').value });
  if ($('exsubj')) {
    const f = () => { const v = $('exsubj').value; $app.querySelectorAll('[data-sjk],[data-sjh]').forEach((el) => { el.style.display = v !== 'mix' && (el.dataset.sjk || el.dataset.sjh) !== v ? 'none' : ''; }); };
    $('exsubj').onchange = f; f();
  }
  if ($('cpadd')) $('cpadd').onclick = () => {
    const [txt, skill, code] = COPY_TYPES[+$('cptype').value];
    add({ p_kind: 'copie', p_label: $('cplabel').value.trim() || txt, p_skills: [skill], p_level: 2, p_error_code: code });
  };
  $app.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
    if (!await ask({ title: `Supprimer ${b.dataset.what} ?`, ok: 'Supprimer', danger: true })) return;
    try { await rpc('rv_plan_del', { p_token: token, p_id: b.dataset.del }); toast('Supprimé'); reload(); } catch (e) { toast('Impossible pour l’instant.'); }
  });
}

/* ---------- Démarrage ---------- */
function route() {
  if (!S.pseudo) return screenPseudo();
  if (!S.onboard && !S.diagDone) return screenWelcome();
  screenHome();
}
/* Erreurs relevées sur les copies (saisies par le parent ou par l’application) → file « À revoir », dès aujourd’hui */
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
  if (h === '#ami') { history.replaceState(null, '', location.pathname); if (!ACCTS.length) return screenFriend(); }
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
    if ('gender' in r && curAcct().g !== r.gender) { curAcct().g = r.gender; saveAccts(); }
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
  applyReglages();
  saveState(); flush();
  notifySession();
  route();
}
boot();
