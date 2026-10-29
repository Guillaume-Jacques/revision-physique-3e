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
    cards: [], boss: { best: null, history: [] }, sessions: 0, timeMs: 0, seenFiche: {}, large: false, batDone: 0, cours: {} };
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
function updateMasteryAfter(item, correct, cleanFirstTry) {
  const m = S.mastery[item.skill];
  const cap = item.level === 1 ? 55 : item.level === 2 ? 82 : 100;
  const mult = item.level === 1 ? 0.8 : item.level === 2 ? 1 : 1.2;
  let nm = m;
  if (correct && cleanFirstTry) nm = Math.min(cap, m + 13 * mult) >= m ? Math.min(cap, m + 13 * mult) : m;
  else if (correct) nm = Math.min(cap, m + 4) >= m ? Math.min(cap, m + 4) : m;
  else nm = m - 8;
  setMastery(item.skill, nm);
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
function bossUnlocked() { return SKILLS.filter((s) => S.mastery[s.id] >= 40).length >= 6; }

/* ---------- Choix adaptatif de l'exercice suivant ---------- */
function chooseNext(run) {
  const recent = run.results.slice(-2).map((r) => r.skill);
  const sorted = SKILLS.map((s) => s.id).sort((a, b) => S.mastery[a] - S.mastery[b]);
  let skill; const r = Math.random();
  const notRepeated = (id) => !(recent.length === 2 && recent[0] === id && recent[1] === id);
  if (r < 0.6) skill = sorted.filter(notRepeated).slice(0, 3)[Math.floor(Math.random() * 3)] || sorted[0];
  else if (r < 0.88) skill = pick(sorted.filter(notRepeated).slice(2, 6));
  else skill = pick(sorted.filter(notRepeated).slice(4));
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

function screenDiagIntro() {
  render(`
    <div class="top"><div class="avatar">${esc(S.pseudo[0].toUpperCase())}</div><div class="grow"><h2>Salut ${esc(S.pseudo)} !</h2></div></div>
    <div class="card hero stack">
      <h2>On fait connaissance ?</h2>
      <p class="muted">15 petites questions sur ton chapitre « Notion de vitesse » et « Distance d’arrêt ». Ce n’est pas une note : ça sert juste à savoir par où commencer.</p>
      <p class="muted">• Prends ta calculatrice<br>• Environ 15 minutes<br>• Tu peux répondre « je ne sais pas », c’est utile aussi</p>
      <button class="btn" id="go">Commencer</button>
    </div>`);
  document.getElementById('go').onclick = () => startRun('diag');
}

function screenHome() {
  const L = levelInfo(S.xp);
  const unlocked = bossUnlocked();
  const nb = SKILLS.filter((s) => S.mastery[s.id] >= 40).length;
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
    <div class="card hero stack">
      <h2>Séance du jour</h2>
      <p class="muted">10 exercices choisis pour toi, environ 12 minutes.</p>
      <button class="btn" id="train">▶ C’est parti</button>
    </div>
    ${coursHomeCard()}
    <div class="card">
      <div class="row between"><h3>👾 Boss : contrôle blanc</h3>${S.boss.best != null ? `<span class="pill">Record ${fr(S.boss.best, 1)}/20</span>` : ''}</div>
      ${unlocked ? '<p class="muted small">8 questions, 20 minutes, sans indice. Comme un vrai contrôle.</p><button class="btn ghost" id="boss">Affronter le boss</button>'
        : `<p class="muted small">Débloqué avec 6 médailles bronze. Tu en as ${nb}/6.</p><div class="bar"><i style="width:${nb / 6 * 100}%"></i></div>`}
    </div>
    <div class="card">
      <div class="row between"><h3>🕵️ Bats ta note</h3><span class="small muted">Chasse à l’erreur</span></div>
      <p class="muted small">Retrouve les erreurs glissées dans des calculs du cahier. Les repérer, c’est ne plus les faire.</p>
      <button class="btn ghost" id="bat">Mener l’enquête</button>
    </div>
    <h3 style="margin:18px 4px 10px">Mes compétences</h3>
    <div class="skills">${SKILLS.map((s) => `
      <button class="skill" data-s="${s.id}">
        <div class="row between"><span class="ic">${s.icon}</span>${medalHtml(S.mastery[s.id])}</div>
        <div class="nm">${s.name}</div>
        <div class="bar"><i style="width:${S.mastery[s.id]}%"></i></div>
      </button>`).join('')}</div>
    <div class="row" style="margin-top:14px"><button class="btn ghost" id="cards">🃏 Mes cartes formules (${S.cards.length}/8)</button></div>
    <div class="center" style="margin-top:18px">
      <button class="link" id="aa">${S.large ? 'Texte normal' : 'Texte plus grand'}</button>
      <button class="link" id="out">Se déconnecter</button>
    </div>`);
  document.getElementById('train').onclick = () => startRun('train');
  document.getElementById('cours').onclick = screenCours;
  document.getElementById('bat').onclick = () => startRun('bat');
  const b = document.getElementById('boss'); if (b) b.onclick = () => startRun('boss');
  document.getElementById('cards').onclick = screenCards;
  document.getElementById('aa').onclick = () => { S.large = !S.large; document.body.classList.toggle('large', S.large); saveState(); screenHome(); };
  document.getElementById('out').onclick = () => logout();
  $app.querySelectorAll('.skill').forEach((el) => el.onclick = () => screenSkill(el.dataset.s));
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
    <p class="muted small">Thème 1 — Mouvement et interactions, dans l’ordre de ton cahier.</p>
    ${COURS.map((c) => {
      const p = coursProg(c.id), n = c.sections.length, seen = p.seen.length;
      const head = c.chap !== lastChap ? `<h3 style="margin:16px 4px 8px">${c.chap}</h3>` : ''; lastChap = c.chap;
      return `${head}<button class="lesson" data-c="${c.id}">
        <span class="lic">${c.icon}</span>
        <span class="grow"><b>${c.title}</b><br><span class="small muted">${n} parties${c.exos.length ? ` • ${c.exos.length} exercices corrigés` : ''}</span>
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
function screenLesson(id, i) {
  const c = COURS.find((x) => x.id === id), sec = c.sections[i], n = c.sections.length, p = coursProg(id);
  const isLast = i === n - 1;
  render(`
    <div class="row" style="margin-bottom:10px"><button class="quitbtn" id="back">✕ Fermer</button>
      <div class="progress"><i style="width:${Math.round((i + 1) / n * 100)}%"></i></div><span class="small muted">${i + 1}/${n}</span></div>
    <span class="chip">${c.icon} ${c.title}</span>
    ${i === 0 ? `<p class="small muted" style="margin-top:8px">📓 Dans ton cahier : ${c.cahier}</p>` : ''}
    <div class="card lessonc pop" style="margin-top:10px">
      <h2>${sec.title}</h2>
      ${sec.html}
      <div class="retenir"><b>📌 À retenir</b><br>${sec.retenir}</div>
    </div>
    ${(sec.quiz || []).map((q, k) => `
      <div class="card"><span class="chip">✋ Vérifie que tu as compris</span>
        <div class="question">${q.q}</div>
        <div class="choices" data-q="${k}">${shuffle(q.choices.map((ch, j) => j)).map((j) => `<button class="choice" data-j="${j}">${q.choices[j].t}</button>`).join('')}</div>
        <div class="qfb" id="qfb${k}"></div>
      </div>`).join('')}
    <div class="actions">${i > 0 ? '<button class="btn ghost" id="prev">← Avant</button>' : '<span></span>'}
      <button class="btn" id="next">${isLast ? 'Terminer la leçon ✓' : 'Suite →'}</button></div>`);
  if (!p.seen.includes(i)) { p.seen.push(i); saveState(); }
  document.getElementById('back').onclick = screenCours;
  const pv = document.getElementById('prev'); if (pv) pv.onclick = () => screenLesson(id, i - 1);
  document.getElementById('next').onclick = () => isLast ? finishLesson(id) : screenLesson(id, i + 1);
  $app.querySelectorAll('.choices[data-q]').forEach((box) => {
    const q = sec.quiz[+box.dataset.q]; let tries = 0, over = false;
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
      }
      if (ch.ok || tries === 1) logAttempt({ mode: 'cours', skill: c.skills[0], item_id: `${id}-s${i}-q${box.dataset.q}`, level: 1, correct: !!ch.ok, tries, hints: 0, error_code: ch.ok ? null : 'notion', answer: stripTags(ch.t).slice(0, 60), question: stripTags(q.q).slice(0, 400), ms: 0 });
      saveState();
    });
  });
}
function finishLesson(id) {
  const c = COURS.find((x) => x.id === id), p = coursProg(id);
  const first = !p.done;
  if (first) { p.done = true; addXP(20); }
  saveState(); flush();
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">📗</div>
      <h2>Leçon terminée !</h2>
      <p class="muted">${c.title}${first ? ' • +20 XP' : ''}</p>
    </div>
    <div class="card"><h3>📌 L’essentiel</h3><ul class="fiche">${c.sections.map((s) => `<li>${s.retenir}</li>`).join('')}</ul></div>
    <div class="stack">
      ${c.exos.length ? `<button class="btn" id="exos">✏️ Les exercices du cahier, corrigés (${c.exos.length})</button>` : ''}
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
    <span class="chip">✏️ Exercice du cahier corrigé</span>
    <div class="card pop" style="margin-top:10px">
      <h2>${e.title}</h2>
      <div class="question">${e.enonce}</div>
      <p class="small muted">Essaie d’abord sur ton cahier, puis révèle la correction étape par étape.</p>
      <ol class="steps" id="steps"></ol>
      <div id="end"></div>
      <button class="btn ghost" id="reveal">Voir l’étape 1</button>
    </div>
    <div class="actions">${k > 0 ? '<button class="btn ghost" id="prev">← Avant</button>' : '<span></span>'}
      <button class="btn" id="next">${k === n - 1 ? 'Terminer ✓' : 'Exercice suivant →'}</button></div>`);
  const btn = document.getElementById('reveal');
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
function startRun(mode, skill, preset) {
  RUN = { mode, skill, idx: 0, results: [], xp0: S.xp, medals0: SKILLS.map((s) => medalOf(S.mastery[s.id])), started: Date.now() };
  if (preset) { RUN.items = preset; RUN.total = preset.length; }
  else if (mode === 'diag') { RUN.items = buildDiagnostic(); RUN.total = RUN.items.length; }
  else if (mode === 'boss') {
    RUN.items = shuffle(['V1', 'V2', 'V3', 'V4', 'V5', 'V6', 'V7', 'V8']).map((s) => generate(s, s === 'V1' || s === 'V6' ? 2 : pick([2, 3])));
    RUN.total = 8; RUN.deadline = Date.now() + 20 * 60 * 1000;
  } else if (mode === 'bat') {
    RUN.items = shuffle(V8_QCM.filter((b) => b.bat)).slice(0, 5).map((b) => qcm({ skill: 'V8', level: b.level, bat: true, q: b.q, choices: b.choices, hints: [FICHES.V8.points[0]], sol: [] }));
    RUN.total = RUN.items.length;
  } else if (mode === 'focus') { RUN.total = 5; }
  else { RUN.total = 10; }
  nextItem();
}
function nextItem() {
  if (RUN.idx >= RUN.total) return finishRun();
  let item;
  if (RUN.items) item = RUN.items[RUN.idx];
  else if (RUN.mode === 'focus') {
    const last = RUN.results.slice(-2);
    let lv = levelFor(S.mastery[RUN.skill]);
    if (last.length === 2 && last.every((x) => x.correct && x.clean)) lv++;
    if (last.length === 2 && last.every((x) => !x.correct)) lv--;
    item = generate(RUN.skill, lv);
  } else item = chooseNext(RUN);
  RUN.cur = { item, tries: 0, hints: 0, firstErr: null, t0: Date.now(), done: false, answers: [] };
  if ((RUN.mode === 'train' || RUN.mode === 'focus') && !S.seenFiche[item.skill]) return screenFicheFirst(item.skill);
  screenItem();
}
function askQuit() {
  if (document.getElementById('qmodal')) return;
  const test = RUN && (RUN.mode === 'diag' || RUN.mode === 'boss');
  const msg = RUN && RUN.mode === 'diag' ? 'L’évaluation reprendra depuis le début la prochaine fois.'
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
function headerHtml() {
  const it = RUN.cur.item, sk = SKILLS.find((s) => s.id === it.skill);
  const pct = Math.round(RUN.idx / RUN.total * 100);
  const label = { diag: 'Évaluation', train: 'Séance', boss: 'Boss', bat: 'Enquête', focus: 'Entraînement', redo: 'Rattrapage' }[RUN.mode];
  return `<div class="row" style="margin-bottom:10px"><button class="quitbtn" id="quit">✕ Quitter</button><div class="progress"><i style="width:${pct}%"></i></div>
      <span class="small muted">${RUN.idx + 1}/${RUN.total}</span>${RUN.mode === 'boss' ? '<span class="pill timer" id="timer"></span>' : ''}</div>
    <div class="row between"><span class="chip">${sk.icon} ${sk.name}</span><span class="small muted">${label} <span class="dots">${[1, 2, 3].map((l) => `<i class="${l <= it.level ? 'on' : ''}"></i>`).join('')}</span></span></div>`;
}
const isTest = () => RUN.mode === 'diag' || RUN.mode === 'boss';
function screenItem() {
  const it = RUN.cur.item;
  let body = '';
  if (it.type === 'num') {
    body = `<div class="answer"><input id="ans" inputmode="decimal" autocomplete="off" placeholder="Ta réponse"><span class="unit">${esc(it.unit)}</span></div>`;
  } else {
    body = `<div class="choices">${it.choices.map((c, i) => `<button class="choice" data-i="${i}">${c.t}</button>`).join('')}</div>`;
  }
  const btns = it.type === 'num'
    ? (isTest() ? `<div class="actions"><button class="btn ghost" id="nsp">Je ne sais pas</button><button class="btn" id="ok">Valider</button></div>`
                : `<div class="actions"><button class="btn ghost" id="hint">💡 Indice</button><button class="btn" id="ok">Valider</button></div>`)
    : (isTest() ? `<div class="actions one"><button class="btn ghost" id="nsp">Je ne sais pas</button></div>`
                : `<div class="actions one"><button class="btn ghost" id="hint">💡 Indice</button></div>`);
  render(`${headerHtml()}
    <div class="card pop">
      <div class="question">${it.q}</div>
      ${it.round ? `<div class="round">${it.round}</div>` : ''}
      ${body}
      <div id="fb"></div>
      <div id="btns">${btns}</div>
    </div>`);
  document.getElementById('quit').onclick = askQuit;
  if (it.type === 'num') {
    const inp = document.getElementById('ans'); inp.focus({ preventScroll: true });
    inp.onkeydown = (e) => { if (e.key === 'Enter') checkNum(); };
    document.getElementById('ok').onclick = checkNum;
  } else {
    $app.querySelectorAll('.choice').forEach((b) => b.onclick = () => checkQcm(+b.dataset.i, b));
  }
  const h = document.getElementById('hint'); if (h) h.onclick = showHint;
  const n = document.getElementById('nsp'); if (n) n.onclick = () => finishItem(false, 'nsp', '—');
  if (RUN.mode === 'boss') startTimer();
}
let timerH = null;
function startTimer() {
  stopTimer();
  const tick = () => {
    const left = Math.max(0, RUN.deadline - Date.now());
    const el = document.getElementById('timer');
    if (el) el.textContent = '⏱ ' + Math.floor(left / 60000) + ':' + String(Math.floor(left / 1000) % 60).padStart(2, '0');
    if (left <= 0) { stopTimer(); while (RUN.idx < RUN.total) { const it = RUN.items[RUN.idx]; RUN.results.push({ skill: it.skill, correct: false, clean: false, item: it, answer: '—' }); RUN.idx++; } finishRun(); }
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
function checkNum() {
  const c = RUN.cur, it = c.item;
  if (c.done) return;
  const raw = document.getElementById('ans').value;
  const x = parseNum(raw);
  if (x === null) { fb('hint', 'Écris un nombre, par exemple 3,25'); return; }
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
  if (ch.ok) { btn.classList.add('right'); return finishItem(true, null, stripTags(ch.t)); }
  if (isTest()) return finishItem(false, ch.code || 'notion', stripTags(ch.t));
  btn.classList.add('wrong');
  wrongAttempt({ code: ch.code || 'notion', msg: ch.msg || 'Ce n’est pas ça.' }, stripTags(ch.t), true);
}
function wrongAttempt(err, raw, isQcm) {
  const c = RUN.cur, it = c.item;
  c.tries++; c.answers.push(raw);
  if (!c.firstErr) c.firstErr = err.code;
  const maxTries = isQcm ? Math.min(2, it.choices.length - 1) : 3;
  if (c.tries >= maxTries) return finishItem(false, c.firstErr, raw, err.msg);
  let html = `<b>Pas encore.</b> ${err.msg}`;
  fb('bad', html);
  if (c.hints < it.hints.length) { fb('hint', '💡 ' + it.hints[c.hints], true); c.hints++; }
  if (!isQcm) { const inp = document.getElementById('ans'); inp.select(); }
}
function finishItem(correct, errCode, raw, lastMsg) {
  const c = RUN.cur, it = c.item;
  if (c.done) return; c.done = true;
  const ms = Math.min(Date.now() - c.t0, 300000);
  S.timeMs += ms;
  const clean = correct && c.tries === 0 && c.hints === 0;
  const code = correct ? (c.firstErr || null) : (errCode || c.firstErr || 'autre');
  RUN.results.push({ skill: it.skill, level: it.level, correct, clean, code, item: it, answer: raw, tries: c.answers.concat(c.answers[c.answers.length - 1] === raw ? [] : [raw]), hintsUsed: c.hints });
  logAttempt({ mode: RUN.mode, skill: it.skill, item_id: it.id, level: it.level, correct, tries: c.tries + 1, hints: c.hints, error_code: code, answer: String(raw).slice(0, 60), question: stripTags(it.q).slice(0, 400), ms });

  if (RUN.mode === 'diag') { addXP(5); saveState(); RUN.idx++; return nextItem(); }
  if (RUN.mode === 'boss') { RUN.idx++; return nextItem(); }

  let gained = correct ? (clean ? 15 : 10) : 2;
  if (RUN.mode === 'bat' && correct) gained += 5;
  addXP(gained);
  updateMasteryAfter(it, correct, clean);
  saveState();

  const fbEl = document.getElementById('fb');
  if (correct) {
    const cheers = ['Bravo !', 'Exact !', 'Bien joué !', 'Parfait !', 'Yes !', 'Top !'];
    fbEl.innerHTML = `<div class="fb good pop"><b>${pick(cheers)}</b> +${gained} XP${clean ? ' • du premier coup 🎯' : ''}</div>`
      + (it.sol && it.sol.length && it.type === 'num' ? `<div class="fb sol small"><b>La méthode :</b><ol>${steps(it).map((s) => `<li>${s}</li>`).join('')}</ol></div>`
        : it.type === 'qcm' && it.hints && it.hints[0] ? `<div class="fb sol small"><b>📌 À retenir :</b> ${it.hints[0]}</div>` : '');
  } else {
    if (it.type === 'qcm') { const good = $app.querySelectorAll('.choice')[it.choices.findIndex((x) => x.ok)]; if (good) good.classList.add('right'); }
    fbEl.innerHTML = (lastMsg ? `<div class="fb bad">${lastMsg}</div>` : '')
      + `<div class="fb sol"><b>${it.type === 'num' ? `La réponse : ${fr(it.ans)} ${esc(it.unit)}` : 'Retiens bien la bonne réponse en vert.'}</b>${it.type === 'num' && it.sol && it.sol.length ? `<ol>${steps(it).map((s) => `<li>${s}</li>`).join('')}</ol>` : it.hints && it.hints[0] ? `<p style="margin:6px 0 0">📌 ${it.hints[0]}</p>` : ''}</div>
       <div class="small muted">Pas grave : cet exercice reviendra bientôt sous une autre forme. +2 XP pour l’effort.</div>`;
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
  const status = r.clean ? ['st-ok', 'Juste du premier coup'] : r.correct ? ['st-mid', 'Juste après ' + (r.tries.length > 1 ? 'une erreur' : 'un indice')] : ['st-low', 'À revoir'];
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
  startRun('redo', null, missed.map((r) => generate(r.skill, r.level)));
}

function finishRun() {
  stopTimer();
  const res = RUN.results, ok = res.filter((r) => r.correct).length;
  const streakMsg = touchStreak();
  S.sessions++;
  if (RUN.mode === 'diag') return finishDiag(streakMsg);
  if (RUN.mode === 'boss') return finishBoss(streakMsg);
  if (RUN.mode === 'bat') S.batDone = (S.batDone || 0) + 1;
  const bonus = 30; addXP(bonus);
  saveState(); flush();
  const newMedals = SKILLS.filter((s, i) => medalOf(S.mastery[s.id]) !== RUN.medals0[i]);
  const rate = res.length ? ok / res.length : 0;
  const msg = rate >= 0.8 ? 'Excellente séance, tu maîtrises de plus en plus !' : rate >= 0.5 ? 'Belle séance. Les erreurs d’aujourd’hui sont les points de demain.' : 'Séance difficile, et c’est justement là qu’on progresse le plus. Les exercices ratés vont revenir, plus guidés.';
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
  document.getElementById('again').onclick = () => startRun(RUN.mode === 'bat' ? 'bat' : RUN.mode === 'focus' ? 'focus' : 'train', RUN.skill);
  document.getElementById('home').onclick = screenHome;
}

function finishDiag(streakMsg) {
  const by = {};
  RUN.results.forEach((r) => { (by[r.skill] = by[r.skill] || []).push(r); });
  const val = { 1: 40, 2: 62, 3: 75 };
  const diag = {};
  SKILLS.forEach((s) => {
    const rs = by[s.id] || [];
    let m = rs.length ? 8 : 15;
    const okLv = rs.filter((r) => r.correct).map((r) => r.level);
    if (okLv.length) m = val[Math.max(...okLv)];
    if (okLv.length && rs.some((r) => !r.correct && r.level <= Math.max(...okLv))) m -= 12;
    if (!rs.length) m = 20;
    diag[s.id] = m;
    S.mastery[s.id] = m;
    if (m >= 40 && !S.cards.includes(s.id)) S.cards.push(s.id);
  });
  S.diagDone = true;
  S.diag = { date: todayStr(), score: RUN.results.filter((r) => r.correct).length, total: RUN.results.length, skills: diag };
  addXP(20);
  saveState(); flush();
  const st = (m) => m >= 60 ? '<span class="status st-ok">Acquis</span>' : m >= 35 ? '<span class="status st-mid">En cours</span>' : '<span class="status st-low">À travailler</span>';
  const weakest = SKILLS.slice().sort((a, b) => diag[a.id] - diag[b.id]).slice(0, 2);
  render(`
    <div class="card hero center stack pop">
      <div style="font-size:48px">🧭</div>
      <h2>Merci ${esc(S.pseudo)} !</h2>
      <p class="muted">Voilà ton point de départ. Pas de note : juste une carte pour savoir où aller.</p>
    </div>
    <div class="card"><table>${SKILLS.map((s) => `<tr><td>${s.icon} ${s.name}</td><td style="text-align:right">${st(diag[s.id])}</td></tr>`).join('')}</table></div>
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
  render(`
    <div class="row between" style="margin-bottom:12px"><h1>Tableau de bord</h1><button class="btn small ghost" id="ref">Actualiser</button></div>
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
        </div>
        <div><b class="small">Activité sur 14 jours</b><div class="days" style="margin-top:6px">${last14.map((n) => `<i style="height:${Math.round(n / maxN * 100)}%" title="${n}"></i>`).join('')}</div></div>
        <div>
          <b>Maîtrise par compétence</b>${s.diagDone ? `<span class="small muted"> (évaluation de départ : ${s.diag.score}/${s.diag.total} le ${s.diag.date.split('-').reverse().join('/')})</span>` : '<span class="small muted"> (évaluation de départ pas encore faite)</span>'}
          <table style="margin-top:6px">${SKILLS.map((k) => `<tr><td>${k.icon} ${k.name}</td><td style="width:35%"><div class="bar"><i style="width:${s.mastery[k.id]}%"></i></div></td><td style="text-align:right">${s.mastery[k.id]}${s.diag && s.diag.skills ? `<span class="small muted"> (départ ${s.diag.skills[k.id]})</span>` : ''}</td></tr>`).join('')}</table>
        </div>
        <div><b>Cours lus</b> : ${COURS.map((c) => { const p = (s.cours || {})[c.id] || {}; return `${c.title} ${p.done ? '✅' : (p.seen || []).length ? `(${(p.seen || []).length}/${c.sections.length})` : '—'}`; }).join(' • ')}</div>
        <div><b>Boss (contrôle blanc)</b> : ${s.boss.best != null ? `record ${fr(s.boss.best, 1)}/20 • ${s.boss.history.length} essai(s)` : 'pas encore tenté'}</div>
        <div>
          <b>Erreurs les plus fréquentes (30 j)</b>
          ${(st.errors || []).filter((e) => e.code !== 'nsp').length ? `<table style="margin-top:6px">${(st.errors || []).slice(0, 6).map((e) => `<tr><td>${esc(ERR_LABELS[e.code] || e.code)}</td><td style="text-align:right"><b>${e.n}</b></td></tr>`).join('')}</table>` : '<p class="small muted">Rien à signaler pour l’instant.</p>'}
        </div>
        <details><summary><b>Derniers exercices</b></summary>
          <table style="margin-top:6px">${(st.recent || []).map((r) => `<tr><td>${r.correct ? '✅' : '❌'}</td><td><span class="small muted">${fmtDate(r.ts)} • ${esc(r.mode)}</span><br>${esc((r.question || '').slice(0, 140))}<br><span class="small">Réponse : <b>${esc(r.answer)}</b>${r.error_code ? ` • ${esc(ERR_LABELS[r.error_code] || r.error_code)}` : ''}${r.hints ? ` • ${r.hints} indice(s)` : ''}</span></td></tr>`).join('')}</table>
        </details>
      </div>`; }).join('') || '<p>Aucun profil élève.</p>'}
    <div class="center"><button class="link" id="out">Se déconnecter</button></div>`);
  document.getElementById('ref').onclick = screenParent;
  document.getElementById('out').onclick = () => logout();
}

/* ---------- Démarrage ---------- */
function route() {
  if (!S.pseudo) return screenPseudo();
  if (!S.diagDone) return screenDiagIntro();
  screenHome();
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
  } catch (e) {
    if (!cached) { render('<p class="center" style="margin-top:40px">Pas de connexion internet.</p><button class="btn" onclick="boot()">Réessayer</button>'); return; }
    S = Object.assign(defaultState(), cached);
  }
  document.body.classList.toggle('large', !!S.large);
  saveState(); flush();
  route();
}
boot();
