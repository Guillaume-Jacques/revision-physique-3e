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
let token = LS.get('rv_token', null);
let role = LS.get('rv_role', null);
let S = null; // état élève
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
  LS.set('rv_state', S);
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    try { const r = await rpc('rv_save_state', { p_token: token, p_state: S }); if (r.error === 'auth') logout(true); } catch (e) { /* hors ligne : on réessaiera */ }
  }, 700);
}
let queue = LS.get('rv_queue', []);
async function logAttempt(a) {
  queue.push(Object.assign({ ts: new Date().toISOString() }, a));
  LS.set('rv_queue', queue);
  flush();
}
let flushing = false;
async function flush() {
  if (flushing || !queue.length || !token) return;
  flushing = true;
  try {
    const batch = queue.slice(0, 40);
    const r = await rpc('rv_log', { p_token: token, p_items: batch });
    if (r.ok) { queue = queue.slice(batch.length); LS.set('rv_queue', queue); }
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
    else if (gap === 2 && st.jokers > 0) { st.jokers--; st.count++; msg = '🃏 Ton joker a sauvé ta série !'; }
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
function render(html) { $app.innerHTML = html; window.scrollTo(0, 0); }

function screenLogin(err) {
  let pin = '';
  render(`
    <div class="logo">⚡</div>
    <h1 class="center">Révisions physique</h1>
    <p class="center muted">Tape ton code à 6 chiffres</p>
    <div class="pin-dots" id="dots">${'<span></span>'.repeat(6)}</div>
    <p class="center" id="pinmsg" style="min-height:1.5em;color:var(--bad);font-weight:700">${err || ''}</p>
    <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button data-n="${n}">${n}</button>`).join('')}<span></span><button data-n="0">0</button><button data-n="del" aria-label="Effacer">⌫</button></div>`);
  const dots = () => document.querySelectorAll('#dots span').forEach((d, i) => d.classList.toggle('on', i < pin.length));
  $app.querySelectorAll('.pad button').forEach((b) => b.onclick = async () => {
    const n = b.dataset.n;
    if (n === 'del') pin = pin.slice(0, -1); else if (pin.length < 6) pin += n;
    dots();
    if (pin.length === 6) {
      document.getElementById('pinmsg').textContent = 'Vérification…';
      try {
        const r = await rpc('rv_login', { p_pin: pin });
        if (r.token) { token = r.token; role = r.role; LS.set('rv_token', token); LS.set('rv_role', role); boot(); }
        else {
          pin = ''; dots();
          document.getElementById('dots').classList.add('shake'); setTimeout(() => document.getElementById('dots').classList.remove('shake'), 400);
          document.getElementById('pinmsg').textContent = r.error === 'locked' ? 'Trop d’essais. Réessaie dans 15 minutes.' : 'Code incorrect, réessaie.';
        }
      } catch (e) { pin = ''; dots(); document.getElementById('pinmsg').textContent = 'Pas de connexion internet.'; }
    }
  });
}

function logout(expired) {
  LS.del('rv_token'); LS.del('rv_role'); LS.del('rv_state'); token = null; role = null; S = null;
  screenLogin(expired ? 'Reconnecte-toi avec ton code.' : '');
}

function screenPseudo() {
  render(`
    <div class="logo">👋</div>
    <h1 class="center">Bienvenue !</h1>
    <p class="center muted">Comment veux-tu qu’on t’appelle ?</p>
    <div class="card stack">
      <div class="answer"><input id="ps" maxlength="20" placeholder="Ton prénom ou un pseudo" autocomplete="off"></div>
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

function homeTopCards() {
  let h = '';
  if ((S.onboard || 0) < 2) {
    h += `<div class="card hero stack"><span class="chip">Pour bien démarrer</span><h2>Étape ${S.onboard ? 2 : 1} sur 3</h2>
      <p class="muted">${S.onboard ? '5 questions faciles, avec des indices.' : 'Une mini-leçon de 3 minutes sur la vitesse.'}</p>
      <button class="btn" id="onb">${S.onboard ? 'Faire les 5 questions' : 'Lire la mini-leçon'}</button></div>`;
  } else if (!S.diagDone) {
    const b = nextDiagBlock(), ok = diagBlockReady();
    h += `<div class="card hero stack"><span class="chip">Petit bilan • bloc ${b + 1} sur 3</span>
      ${ok ? `<p class="muted">5 questions sans indice, environ 5 minutes.</p><button class="btn" id="diag">Faire le bloc ${b + 1}</button>`
           : `<p class="muted">Bloc ${b} fait aujourd’hui, bravo ! Le bloc ${b + 1} t’attend demain. En attendant, tu peux t’entraîner ou lire un cours.</p>`}</div>`;
  }
  const e = nextExam();
  if (e && e.days <= 7) {
    const when = e.days === 0 ? 'aujourd’hui' : e.days === 1 ? 'demain' : `dans ${e.days} jours`;
    h += `<div class="card exam stack"><div class="row between"><h3>📅 Contrôle ${when}</h3><span class="pill">${esc(e.day.split('-').reverse().slice(0, 2).join('/'))}</span></div>
      <p class="muted small">${esc(e.label || 'Contrôle de physique')}${(e.skills || []).length ? ' • ' + e.skills.map((k) => (SKILLS.find((s) => s.id === k) || {}).short).filter(Boolean).join(', ') : ''}</p>
      ${e.days <= 2 && e.days >= 1 ? '<p class="small"><b>Conseil du jour :</b> fais le contrôle blanc, puis relis la correction.</p><button class="btn" id="bossx">👾 Contrôle blanc</button>'
        : e.days === 0 ? '<p class="small">Relis tes cartes formules et les pièges. Pas de nouvel exercice difficile aujourd’hui : tu es prête.</p><button class="btn ghost" id="cardsx">🃏 Mes cartes formules</button>'
        : '<button class="btn" id="prep">🎯 Programme du jour : 8 exercices sur ce contrôle</button>'}</div>`;
  }
  const due = dueReviews().length;
  if (due) h += `<div class="card rv stack"><div class="row between"><h3>🔁 À revoir aujourd’hui</h3><span class="pill">${due}</span></div>
      <p class="muted small">Des exercices que tu avais ratés reviennent pour que tu ne les oublies pas.${dueReviews().some((r) => r.src === 'copie') ? ' Certains viennent de ton contrôle.' : ''}</p>
      <button class="btn" id="rev">Revoir maintenant (${Math.min(due, 8)})</button></div>`;
  return h;
}
function screenHome() {
  const L = levelInfo(S.xp);
  const unlocked = bossUnlocked();
  const nb = bronzeCount();
  render(`
    <div class="top">
      <div class="avatar">${esc(S.pseudo[0].toUpperCase())}</div>
      <div class="grow">
        <div class="row between"><b>${esc(S.pseudo)}</b><span class="small muted">Niveau ${L.lvl}</span></div>
        <div class="xpbar"><i style="width:${Math.round(L.rest / L.need * 100)}%"></i></div>
        <div class="small muted">${L.rest} / ${L.need} XP</div>
      </div>
    </div>
    <div class="row wrap" style="margin-bottom:14px">
      <span class="pill">🔥 ${S.streak.count} jour${S.streak.count > 1 ? 's' : ''}</span>
      <span class="pill">🃏 ${S.streak.jokerWeek === weekId() ? S.streak.jokers : 1} joker</span>
      <span class="pill">⭐ ${S.xp} XP</span>
    </div>
    ${homeTopCards()}
    <div class="card hero stack">
      <h2>Séance du jour</h2>
      <p class="muted">10 exercices choisis pour toi${dueReviews().length ? ', en commençant par ceux à revoir' : ''}, environ 12 minutes.</p>
      <button class="btn" id="train">▶ C’est parti</button>
    </div>
    <div class="card">
      <div class="row between"><h3>✍️ Rédige comme sur ta copie</h3><span class="small muted">4 problèmes</span></div>
      <p class="muted small">Formule, conversion, calcul, unité, phrase réponse : on s’entraîne à tout écrire, avec de l’aide au début.</p>
      <button class="btn ghost" id="redac">Rédiger</button>
    </div>
    ${coursHomeCard()}
    <div class="card">
      <div class="row between"><h3>👾 Boss : contrôle blanc</h3>${S.boss.best != null ? `<span class="pill">Record ${fr(S.boss.best, 1)}/20</span>` : ''}</div>
      ${unlocked ? '<p class="muted small">8 questions, 20 minutes, sans indice. Comme un vrai contrôle.</p><button class="btn ghost" id="boss">Affronter le boss</button>'
        : `<p class="muted small">Débloqué avec ${BOSS_NEED} médailles bronze (ou une semaine avant un contrôle). Tu en as ${nb}/${BOSS_NEED}.</p><div class="bar"><i style="width:${Math.min(100, nb / BOSS_NEED * 100)}%"></i></div>`}
    </div>
    <div class="card">
      <div class="row between"><h3>🕵️ Bats ta note</h3><span class="small muted">Chasse à l’erreur</span></div>
      <p class="muted small">Retrouve les erreurs glissées dans des calculs du cahier. Les repérer, c’est ne plus les faire.</p>
      <button class="btn ghost" id="bat">Mener l’enquête</button>
    </div>
    <h3 style="margin:18px 4px 10px">Mes compétences</h3>
    <p class="small muted" style="margin:-4px 4px 10px">Une médaille se gagne en réussissant sur plusieurs jours : bronze en 2 jours, argent en 3, or en 4.</p>
    <div class="skills">${SKILLS.map((s) => skillActive(s.id) ? `
      <button class="skill" data-s="${s.id}">
        <div class="row between"><span class="ic">${s.icon}</span>${medalHtml(S.mastery[s.id])}</div>
        <div class="nm">${s.name}</div>
        <div class="bar"><i style="width:${S.mastery[s.id]}%"></i></div>
      </button>` : `
      <button class="skill locked" data-l="${s.lesson}">
        <div class="row between"><span class="ic">${s.icon}</span><span class="small muted">🔒</span></div>
        <div class="nm">${s.name}</div>
        <div class="small muted">Après la leçon « ${COURS.find((c) => c.id === s.lesson).title} »</div>
      </button>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="cards">🃏 Mes cartes formules (${S.cards.length}/${SKILLS.length})</button></div>
    <div class="center" style="margin-top:18px">
      <button class="link" id="aa">${S.large ? 'Texte normal' : 'Texte plus grand'}</button>
      <button class="link" id="out">Se déconnecter</button>
    </div>`);
  const on = (id, f) => { const el = document.getElementById(id); if (el) el.onclick = f; };
  on('train', () => startRun('train'));
  on('redac', () => startRun('redac'));
  on('cours', screenCours);
  on('bat', () => startRun('bat'));
  on('boss', () => startRun('boss'));
  on('bossx', () => startRun('boss'));
  on('cards', screenCards);
  on('cardsx', screenCards);
  on('prep', () => startRun('prep'));
  on('rev', () => startRun('review'));
  on('onb', () => S.onboard ? startRun('warmup', null, [['V4', 1], ['V2', 1], ['V4', 1], ['V3', 1], ['V5', 1]].map(([s, l]) => generate(s, l))) : screenOnbLesson());
  on('diag', screenDiagIntro);
  on('aa', () => { S.large = !S.large; document.body.classList.toggle('large', S.large); saveState(); screenHome(); });
  on('out', () => logout());
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
    <div class="cards">${SKILLS.map((s) => S.cards.includes(s.id)
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
        ${g === nc - 1 ? `<div class="retenir"><b>📌 À retenir</b><br>${sec.retenir}</div>${video ? `<p class="small" style="margin-top:10px">🎬 <a href="${esc(video)}" target="_blank" rel="noopener">Voir la vidéo de ce point</a></p>` : ''}` : ''}
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
      <div class="progress"><i style="width:${Math.round((i + 1) / n * 100)}%"></i></div><span class="small muted">${i + 1}/${n}</span></div>
    <span class="chip">${c.icon} ${c.title}</span>
    ${i === 0 ? `<p class="small muted" style="margin-top:8px">${c.ahead ? '🚀 En avance sur la classe : ' : '📓 Dans ton cahier : '}${c.cahier}</p>` : ''}
    ${groups}
    <div class="actions">${i > 0 ? '<button class="btn ghost" id="prev">← Avant</button>' : '<span></span>'}
      <button class="btn" id="next"></button></div>`);
  let shown = already ? nc : 1;
  const nextBtn = document.getElementById('next');
  const label = () => { nextBtn.textContent = shown < nc ? `Suite (${shown}/${nc}) ↓` : isLast ? 'Terminer la leçon ✓' : 'Partie suivante →'; };
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
function startRun(mode, skill, preset) {
  RUN = { mode, skill, idx: 0, results: [], xp0: S.xp, medals0: SKILLS.map((s) => medalOf(S.mastery[s.id])), started: Date.now() };
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
    <div class="row between wrap"><span class="chip">${sk.icon} ${sk.name}</span>${tag}<span class="small muted">${RUN_LABEL[RUN.mode] || ''} <span class="dots">${[1, 2, 3].map((l) => `<i class="${l <= it.level ? 'on' : ''}"></i>`).join('')}</span></span></div>`;
}
const isTest = () => RUN.mode === 'diag' || RUN.mode === 'boss';
/* Indice de confiance : demandé à la première réponse (« sûre / j'hésite / au hasard ») */
const confBar = (hidden) => `<div id="confbar" ${hidden ? 'hidden' : ''}><p class="small muted" style="margin:10px 0 6px">Je valide en étant…</p>
  <div class="conf"><button class="btn small ghost" data-c="sure">✅ sûre</button><button class="btn small ghost" data-c="hesite">🤔 j’hésite</button><button class="btn small ghost" data-c="hasard">🎲 au hasard</button></div></div>`;
function screenItem() {
  const it = RUN.cur.item;
  if (it.type === 'steps') return screenSteps();
  let body = '';
  if (it.type === 'num') {
    body = `<div class="answer"><input id="ans" inputmode="decimal" autocomplete="off" placeholder="Ta réponse"><span class="unit">${esc(it.unit)}</span></div>`;
  } else {
    body = `<div class="choices">${it.choices.map((c, i) => `<button class="choice" data-i="${i}">${c.t}</button>`).join('')}</div>`;
  }
  const side = isTest() ? '<button class="btn ghost" id="nsp">Je ne sais pas</button>' : '<button class="btn ghost" id="hint">💡 Indice</button>';
  const btns = `${confBar(it.type === 'qcm')}<div id="okrow" hidden><div class="actions one"><button class="btn" id="ok">Valider</button></div></div><div class="actions one" style="margin-top:8px">${side}</div>`;
  render(`${headerHtml()}
    <div class="card pop">
      <div class="question">${it.q}</div>
      ${it.round ? `<div class="round">${it.round}</div>` : ''}
      ${body}
      <div id="fb"></div>
      <div id="btns">${btns}</div>
    </div>`);
  document.getElementById('quit').onclick = askQuit;
  $app.querySelectorAll('#confbar [data-c]').forEach((b) => b.onclick = () => {
    RUN.cur.conf = b.dataset.c;
    if (it.type === 'num') checkNum();
    else if (RUN.cur.sel != null) checkQcm(RUN.cur.sel, $app.querySelectorAll('.choice')[RUN.cur.sel]);
  });
  if (it.type === 'num') {
    const inp = document.getElementById('ans'); inp.focus({ preventScroll: true });
    inp.onkeydown = (e) => { if (e.key !== 'Enter') return; if (RUN.cur.conf) checkNum(); else toast('Choisis : sûre, j’hésite ou au hasard'); };
    document.getElementById('ok').onclick = checkNum;
  } else {
    $app.querySelectorAll('.choice').forEach((b) => b.onclick = () => {
      if (RUN.cur.done || b.classList.contains('wrong')) return;
      if (!RUN.cur.conf) { // première réponse : on choisit, puis on dit si on est sûre
        $app.querySelectorAll('.choice').forEach((x) => x.classList.remove('sel'));
        b.classList.add('sel'); RUN.cur.sel = +b.dataset.i;
        document.getElementById('confbar').hidden = false;
        return;
      }
      checkQcm(+b.dataset.i, b);
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
function afterFirstTry() { // après une première erreur : plus de question de confiance, un simple bouton
  const cb = document.getElementById('confbar'); if (cb) cb.hidden = true;
  const ok = document.getElementById('okrow'); if (ok && RUN.cur.item.type === 'num') ok.hidden = false;
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
      <div class="actions" style="margin-top:10px"><button class="btn ghost" id="sdk">Je ne sais pas</button><button class="btn" id="sok">Valider</button></div>`;
    active += `<div id="sfb"></div></div>`;
  }
  render(`${headerHtml()}
    <div class="card pop">
      <div class="question">${it.q}</div>
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
  const cb = document.getElementById('confbar'); if (cb) cb.remove();
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
      <button class="btn" id="review">📝 Revoir ma séance, exercice par exercice</button>
      ${res.some((r) => !r.clean) ? `<button class="btn ghost" id="redo">🔁 Refaire les exercices ratés (${res.filter((r) => !r.clean).length}), avec d’autres nombres</button>` : ''}
      <button class="btn ghost" id="again">Encore une séance</button><button class="btn ghost" id="home">Retour à l’accueil</button></div>`);
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
async function screenParent() {
  render('<p class="center muted" style="margin-top:40px">Chargement…</p>');
  let data;
  try { data = await rpc('rv_dashboard', { p_token: token }); } catch (e) { render('<p class="center">Pas de connexion.</p><button class="btn" onclick="screenParent()">Réessayer</button>'); return; }
  if (data.error) return logout(true);
  const fmtDate = (d) => d ? new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'jamais';
  const studs = data.students || [];
  PLAN = data.plan || [];
  const planOk = Array.isArray(data.plan);
  render(`
    <div class="row between" style="margin-bottom:12px"><h1>Tableau de bord</h1><button class="btn small ghost" id="ref">Actualiser</button></div>
    ${planCard(planOk)}
    ${studs.map((st) => {
      const s = Object.assign(defaultState(), st.state || {});
      const t = st.totals || {};
      const name = s.pseudo || st.label;
      const days = st.days || [];
      const maxN = Math.max(1, ...days.map((d) => d.n));
      const last14 = []; for (let i = 13; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); const f = days.find((x) => x.day === k); last14.push(f ? f.n : 0); }
      return `
      <div class="card stack">
        <div class="row between"><h2>${esc(name)}</h2><span class="small muted">Dernière activité : ${fmtDate(t.last)}</span></div>
        <div class="kpis">
          <div class="kpi"><span class="small muted">Exercices</span><b>${t.n || 0}</b><span class="small muted">dont ${t.n7 || 0} sur 7 j</span></div>
          <div class="kpi"><span class="small muted">Réussite 7 j</span><b>${t.n7 ? Math.round(t.ok7 / t.n7 * 100) + ' %' : '—'}</b><span class="small muted">global ${t.n ? Math.round(t.ok / t.n * 100) : 0} %</span></div>
          <div class="kpi"><span class="small muted">Temps total</span><b>${Math.round((t.ms || 0) / 60000)} min</b><span class="small muted">${s.sessions} séance${s.sessions > 1 ? 's' : ''}</span></div>
          <div class="kpi"><span class="small muted">Série</span><b>🔥 ${s.streak.count}</b><span class="small muted">niveau ${levelInfo(s.xp).lvl} • ${s.xp} XP</span></div>
          <div class="kpi"><span class="small muted">À revoir</span><b>${(s.review || []).filter((r) => r.due <= todayStr()).length}</b><span class="small muted">${(s.review || []).length} en file d’attente</span></div>
          <div class="kpi"><span class="small muted">Rédaction 7 j</span><b>${t.redac7 ? Math.round(t.redacok7 / t.redac7 * 100) + ' %' : '—'}</b><span class="small muted">${t.redac7 || 0} problème(s)</span></div>
          <div class="kpi"><span class="small muted">Justes au hasard (7 j)</span><b>${t.lucky7 || 0}</b><span class="small muted">faux alors que « sûre » : ${t.surewrong7 || 0}</span></div>
          <div class="kpi"><span class="small muted">Démarrage</span><b>${s.diagDone ? '✅' : `${(s.diagParts || []).filter(Boolean).length}/3`}</b><span class="small muted">${s.diagDone ? 'bilan terminé' : (s.onboard || 0) < 2 ? 'étapes d’accueil en cours' : 'blocs du bilan faits'}</span></div>
        </div>
        <div><b class="small">Activité sur 14 jours</b><div class="days" style="margin-top:6px">${last14.map((n) => `<i style="height:${Math.round(n / maxN * 100)}%" title="${n}"></i>`).join('')}</div></div>
        <div>
          <b>Maîtrise par compétence</b>${s.diagDone ? `<span class="small muted"> (évaluation de départ : ${s.diag.score}/${s.diag.total} le ${s.diag.date.split('-').reverse().join('/')})</span>` : '<span class="small muted"> (évaluation de départ pas encore faite)</span>'}
          <table style="margin-top:6px">${SKILLS.map((k) => `<tr><td>${k.icon} ${k.name}${k.lesson && !((s.cours || {})[k.lesson] || {}).done ? ' <span class="small muted">🔒</span>' : ''}</td><td style="width:35%"><div class="bar"><i style="width:${s.mastery[k.id]}%"></i></div></td><td style="text-align:right">${s.mastery[k.id]}${s.diag && s.diag.skills && s.diag.skills[k.id] != null ? `<span class="small muted"> (départ ${s.diag.skills[k.id]})</span>` : ''}</td></tr>`).join('')}</table>
        </div>
        <div><b>Cours lus</b> : ${COURS.map((c) => { const p = (s.cours || {})[c.id] || {}; return `${c.title} ${p.done ? '✅' : (p.seen || []).length ? `(${(p.seen || []).length}/${c.sections.length})` : '—'}`; }).join(' • ')}</div>
        <div><b>Boss (contrôle blanc)</b> : ${s.boss.best != null ? `record ${fr(s.boss.best, 1)}/20 • ${s.boss.history.length} essai(s)` : 'pas encore tenté'}</div>
        <div>
          <b>Erreurs les plus fréquentes (30 j)</b>
          ${(st.errors || []).filter((e) => e.code !== 'nsp').length ? `<table style="margin-top:6px">${(st.errors || []).slice(0, 6).map((e) => `<tr><td>${esc(ERR_LABELS[e.code] || e.code)}</td><td style="text-align:right"><b>${e.n}</b></td></tr>`).join('')}</table>` : '<p class="small muted">Rien à signaler pour l’instant.</p>'}
        </div>
        <details><summary><b>Derniers exercices</b></summary>
          <table style="margin-top:6px">${(st.recent || []).map((r) => `<tr><td>${r.correct ? '✅' : '❌'}</td><td><span class="small muted">${fmtDate(r.ts)} • ${esc(r.mode)}</span><br>${esc((r.question || '').slice(0, 140))}<br><span class="small">Réponse : <b>${esc(r.answer)}</b>${r.conf ? ` • ${esc({ sure: 'sûre', hesite: 'hésitait', hasard: 'au hasard', nsp: 'ne sait pas' }[r.conf] || r.conf)}` : ''}${r.error_code ? ` • ${esc(ERR_LABELS[r.error_code] || r.error_code)}` : ''}${r.hints ? ` • ${r.hints} indice(s)` : ''}</span></td></tr>`).join('')}</table>
        </details>
      </div>`; }).join('') || '<p>Aucun profil élève.</p>'}
    <div class="center"><button class="link" id="out">Se déconnecter</button></div>`);
  document.getElementById('ref').onclick = screenParent;
  document.getElementById('out').onclick = () => logout();
  bindPlanCard();
}
function planCard(ok) {
  const fmt = (d) => d ? d.split('-').reverse().join('/') : '';
  const skillOpts = SKILLS.map((k) => `<label class="ck"><input type="checkbox" value="${k.id}"> ${k.icon} ${k.short}</label>`).join('');
  const ex = exams(), cp = PLAN.filter((p) => p.kind === 'copie');
  return `<div class="card stack">
    <h2>📅 Contrôles à venir</h2>
    ${!ok ? '<p class="small" style="color:var(--bad)">La mise à jour du serveur n’est pas encore faite : cette partie sera active juste après.</p>' : ''}
    ${ex.length ? `<table>${ex.map((e) => `<tr><td><b>${fmt(e.day)}</b> • ${esc(e.label || 'Contrôle')}<br><span class="small muted">${(e.skills || []).map((k) => (SKILLS.find((s) => s.id === k) || {}).short).join(', ') || 'toutes les compétences'}</span></td><td style="text-align:right"><button class="link" data-del="${e.id}">Supprimer</button></td></tr>`).join('')}</table>` : '<p class="small muted">Aucun contrôle saisi. Dès qu’une date est connue, l’appli prépare l’élève : programme ciblé 7 jours avant, contrôle blanc à J-2.</p>'}
    <details><summary><b>+ Ajouter un contrôle</b></summary>
      <div class="stack" style="margin-top:8px">
        <input type="date" id="exday"><input id="exlabel" maxlength="120" placeholder="Ex. : Contrôle vitesse et distance d’arrêt">
        <p class="small muted" style="margin:0">Compétences évaluées (laisser vide = toutes) :</p><div class="cks" id="exsk">${skillOpts}</div>
        <button class="btn" id="exadd">Enregistrer le contrôle</button></div>
    </details>
    <h2 style="margin-top:8px">📝 Erreurs relevées sur les copies</h2>
    <p class="small muted" style="margin:0">Chaque erreur saisie part dans « À revoir » dès la prochaine connexion de l’élève (J0, puis J+1, J+3, J+7, J+21). Tu peux aussi envoyer la photo de la copie à Claude, qui les saisit pour toi.</p>
    ${cp.length ? `<table>${cp.slice(-8).reverse().map((e) => `<tr><td>${esc(e.label || '')}<br><span class="small muted">${(e.skills || []).map((k) => (SKILLS.find((s) => s.id === k) || {}).short).join(', ')} • ${esc(ERR_LABELS[e.error_code] || e.error_code || '')}</span></td><td style="text-align:right"><button class="link" data-del="${e.id}">Supprimer</button></td></tr>`).join('')}</table>` : ''}
    <details><summary><b>+ Ajouter une erreur de copie</b></summary>
      <div class="stack" style="margin-top:8px">
        <input id="cplabel" maxlength="120" placeholder="Ex. : Contrôle du 12/11, exercice 3">
        <select id="cpskill">${SKILLS.map((k) => `<option value="${k.id}">${k.icon} ${k.name}</option>`).join('')}</select>
        <select id="cperr">${Object.entries(ERR_LABELS).filter(([k]) => !['nsp', 'hasard', 'copie'].includes(k)).map(([k, v]) => `<option value="${k}">${esc(v)}</option>`).join('')}</select>
        <select id="cplv"><option value="1">Niveau facile</option><option value="2" selected>Niveau moyen</option><option value="3">Niveau difficile</option></select>
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
    } catch (e) { toast('Impossible pour l’instant (mise à jour du serveur en attente ou pas de connexion).'); }
  };
  const ea = document.getElementById('exadd');
  if (ea) ea.onclick = () => {
    const day = document.getElementById('exday').value;
    if (!day) return toast('Choisis la date du contrôle.');
    add({ p_kind: 'exam', p_day: day, p_label: document.getElementById('exlabel').value.trim() || 'Contrôle de physique',
      p_skills: [...document.querySelectorAll('#exsk input:checked')].map((x) => x.value) });
  };
  const ca = document.getElementById('cpadd');
  if (ca) ca.onclick = () => add({ p_kind: 'copie', p_label: document.getElementById('cplabel').value.trim() || 'Erreur de contrôle',
    p_skills: [document.getElementById('cpskill').value], p_level: +document.getElementById('cplv').value, p_error_code: document.getElementById('cperr').value });
  $app.querySelectorAll('[data-del]').forEach((b) => b.onclick = async () => {
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
  if (!token) return screenLogin();
  if (role === 'parent') return screenParent();
  const cached = LS.get('rv_state', null);
  try {
    const r = await rpc('rv_get_state', { p_token: token });
    if (r.error) return logout(true);
    S = Object.assign(defaultState(), cached || {}, r.state || {});
    // garder la version la plus avancée si le cache local est en avance (hors ligne)
    if (cached && (cached.xp || 0) > (r.state.xp || 0)) S = Object.assign(defaultState(), cached);
    S.mastery = Object.assign(defaultState().mastery, S.mastery);
    PLAN = r.plan || [];
    LS.set('rv_plan', PLAN);
  } catch (e) {
    PLAN = LS.get('rv_plan', []);
    if (!cached) { render('<p class="center" style="margin-top:40px">Pas de connexion internet.</p><button class="btn" onclick="boot()">Réessayer</button>'); return; }
    S = Object.assign(defaultState(), cached);
  }
  document.body.classList.toggle('large', !!S.large);
  if (S.diagDone && !S.onboard) S.onboard = 2;
  applyDecay();
  mergeCopies();
  saveState(); flush();
  route();
}
boot();
