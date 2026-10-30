/* =========================================================
   Bulle d'aide « ? » (en bas à droite, sur tous les écrans)
   Deux onglets : « Parcourir l'aide » (articles filtrables) et
   « Poser ma question » (réponses suggérées, puis envoi par e-mail).
   Fichier autonome, chargé en dernier.
   ========================================================= */
(function () {
  const AIDE = {
    eleve: [
      ['Premiers pas', [
        ['Par où commencer ?', 'Ouvre l’appli et touche la carte <b>« Mission du jour »</b> en haut de l’accueil : c’est toujours la bonne chose à faire. L’appli choisit pour toi la leçon, les exercices ou les révisions du jour. Quand elle devient verte, ta mission est faite.'],
        ['Combien de temps par jour ?', 'Environ <b>15 minutes</b> (12 exercices). Une fois par semaine, souvent le mercredi ou le week-end, une <b>grande séance</b> d’environ 25 minutes est proposée. Mieux vaut 15 minutes chaque jour qu’une heure le dimanche.'],
        ['Physique ou chimie ?', 'Le sélecteur <b>⚡ Physique / ⚗️ Chimie</b> en haut de l’accueil change les activités, les compétences et les cours affichés. La mission du jour, elle, mélange les deux matières toute seule.'],
        ['C’est quoi une compétence verrouillée 🔒 ?', 'Une notion que tu n’as pas encore vue. Elle s’ouvre dès que tu as fini sa <b>leçon</b> dans « Mes cours » (ou quand un contrôle l’annonce).'],
      ]],
      ['Répondre aux exercices', [
        ['Comment écrire ma réponse ?', 'Écris seulement le <b>nombre</b>, avec une virgule ou un point (12,5 ou 12.5). L’unité est déjà indiquée à côté. Arrondis seulement à la fin : garde tous les chiffres pendant le calcul.'],
        ['Comment écrire 2,67 × 10⁻²⁶ ?', 'Dans le premier champ, tape <b>2,67</b>. Dans le petit champ en haut, tape l’exposant <b>26</b> puis touche <b>±</b> pour le rendre négatif (l’iPhone n’a pas de touche moins). Le bouton « 🧮 Ma calculatrice » montre comment faire le calcul sur ton modèle.'],
        ['En QCM, comment ça marche ?', 'Touche une réponse, puis <b>Valider</b>. Si tu t’es trompé, tu peux en toucher une autre directement.'],
        ['Pourquoi on me demande si je suis sûr ?', 'Après « Valider », tu indiques <b>sûr / j’hésite / au hasard</b>. Sois honnête : une réponse juste « au hasard » ne te fait presque pas progresser, et l’exercice reviendra pour vérifier. Ça permet à l’appli de savoir ce que tu sais vraiment.'],
        ['Ma réponse est juste mais comptée fausse', 'Vérifie : l’<b>unité</b> attendue (m ou km, s ou h ?), l’<b>arrondi</b> (arrondir trop tôt fausse le résultat) et la <b>virgule</b>. L’appli te dit souvent d’où vient l’écart (facteur 3,6, facteur 60, virgule…). Si tu es sûr qu’il y a une erreur, envoie-la avec « Poser ma question ».'],
        ['Je bloque sur un exercice', 'Touche <b>« 💡 Indice »</b> ou, en rédaction, <b>« Je bloque »</b> : l’aide arrive étape par étape. Tu peux aussi relire la fiche de la compétence. Un exercice raté revient plus tard dans « À revoir » : c’est normal, c’est fait pour ça.'],
      ]],
      ['Progresser', [
        ['Comment gagner une médaille ?', 'En réussissant une compétence <b>sur plusieurs jours</b> : bronze en 2 jours, argent en 3, or en 4. Réussir 20 exercices le même jour ne suffit pas : c’est la régularité qui compte. Une compétence oubliée plusieurs jours baisse un peu.'],
        ['C’est quoi « À revoir » ?', 'Chaque exercice raté revient <b>le lendemain</b>, puis 3 jours, 7 jours et 21 jours plus tard. Si tu le rates à nouveau, il revient le lendemain. Les révisions du jour passent en premier dans ta séance.'],
        ['Ma série et le joker 🃏', 'La série compte les jours d’affilée où tu révises. Tu as <b>un joker par semaine</b> : si tu rates un jour, il protège ta série automatiquement.'],
        ['Contrôle blanc, contrôle type, sujets du brevet', '<b>Contrôle blanc</b> : 8 questions en 20 minutes, ouvert après quelques médailles de bronze ou une semaine avant un contrôle. <b>Contrôle type</b> : un sujet comme celui de ta classe, noté sur 20. <b>Sujets type Brevet</b> : des sujets inspirés du brevet, avec seulement les questions des notions que tu as déjà vues.'],
        ['« Rédiger » et « Bats ta note »', '<b>Rédiger</b> t’entraîne à écrire une réponse complète comme sur ta copie : données, formule, conversion, calcul, phrase. <b>Bats ta note</b> te montre des copies avec des erreurs : à toi de les trouver.'],
        ['Les équipes entre amis 🏆', 'Avec l’accord d’un parent, tu peux créer une équipe ou en rejoindre une avec un code de 6 lettres. Chaque exercice réussi rapporte des points ; le classement repart à zéro chaque lundi.'],
      ]],
      ['Mon appli', [
        ['Mettre l’appli sur mon téléphone', 'Touche ⚙️ puis <b>« 📲 Mettre l’appli sur mon téléphone »</b> et suis les étapes. Ensuite l’appli s’ouvre comme les autres, depuis l’écran d’accueil.'],
        ['Écrire plus gros', 'Touche ⚙️ puis <b>« 🔠 Texte plus grand »</b>.'],
        ['Où sont mes cours ?', 'Dans <b>« 📚 Mes cours »</b> sur l’accueil. Chaque leçon est découpée en petites parties avec des questions, des exercices corrigés et parfois une vidéo.'],
        ['Plusieurs profils sur le même appareil', 'Touche ⚙️ puis <b>« Changer de profil »</b>. Si un profil a un code à 4 chiffres, il est demandé à l’ouverture.'],
      ]],
    ],
    parent: [
      ['Premiers pas', [
        ['Par où commencer ?', 'Dans <b>Réglages</b>, ajoute ton enfant (prénom, fille ou garçon), puis touche <b>« 📲 Envoyer le lien »</b> pour lui envoyer son accès par message. Il l’ouvre une fois : c’est tout. Tu suis ensuite ses progrès dans <b>Suivi</b>.'],
        ['Combien de temps doit-il réviser ?', 'Environ <b>15 minutes par jour</b>, plus une séance plus longue une fois par semaine. L’objectif est d’au moins <b>4 jours par semaine</b> : la régularité compte plus que la durée.'],
      ]],
      ['Connexion et appareils', HELP_QA_SAFE()],
      ['Suivre mon enfant', [
        ['Que veulent dire les indicateurs ?', '<b>À revoir aujourd’hui</b> : les exercices ratés qui reviennent ce jour-là (touche-le pour voir le détail). <b>Contrôle blanc</b> : sa meilleure note. Le graphique montre les exercices des 14 derniers jours, en violet la physique, en vert la chimie.'],
        ['Comment sont gagnées les médailles ?', 'Une compétence est réussie sur plusieurs jours : bronze en 2 jours, argent en 3, or en 4. Une réponse donnée « au hasard » ne compte presque pas. C’est volontairement exigeant, pour mesurer ce qui est vraiment acquis.'],
        ['Voir l’appli comme mon enfant', 'Dans Suivi, touche <b>« 👀 Voir son appli »</b> : tu vois son accueil et ses exercices tels quels, sans rien enregistrer.'],
        ['Physique et chimie séparément', 'En haut de Suivi, le filtre <b>Les deux / ⚡ Physique / ⚗️ Chimie</b> limite tous les chiffres à une matière.'],
      ]],
      ['Contrôles et copies', [
        ['Pourquoi saisir la date d’un contrôle ?', 'L’appli prépare ton enfant automatiquement : <b>programme spécial de J-7 à J-3</b>, contrôle blanc à J-2 et J-1, relecture des cartes le jour J. Onglet <b>Contrôles</b> : date, titre, matière et notions.'],
        ['À quoi servent les erreurs de copie ?', 'Quand une copie corrigée revient, note les erreurs commises (unités, arrondi, formule…) dans <b>Contrôles</b>. Des exercices ciblés sur ces erreurs reviennent dès la séance suivante.'],
      ]],
      ['E-mails et compte', [
        ['Quels e-mails vais-je recevoir ?', 'Au choix dans <b>Réglages › ✉️ E-mails</b> : un e-mail à chaque séance, un récapitulatif le soir à 21 h, ou rien ; et un bilan le dimanche à 18 h.'],
        ['Les équipes entre amis', 'Dans Réglages, coche <b>« Autoriser »</b> une fois : ton enfant peut alors rejoindre ou créer des équipes. Seuls son prénom et l’initiale de son nom sont affichés. Tu peux le retirer d’une équipe à tout moment.'],
        ['Mes données et supprimer mon compte', 'Les données servent uniquement au suivi des révisions. Tu peux supprimer le profil d’un enfant (Réglages › Autres réglages) ou tout ton compte (Réglages › Mon compte). Détails sur la page <a href="confidentialite.html">Confidentialité</a>.'],
      ]],
    ],
    visiteur: [
      ['Découvrir l’appli', [
        ['À quoi sert cette appli ?', 'À réviser la <b>physique-chimie de 3e</b> 15 minutes par jour : des leçons courtes, des exercices qui reviennent au bon moment, des contrôles blancs et des sujets type brevet. Le parent suit les progrès depuis son espace.'],
        ['Comment créer un compte ?', 'Un <b>parent</b> touche « 👪 Je suis parent » et donne son adresse e-mail : il reçoit un code, sans mot de passe. Il ajoute ensuite son enfant et lui envoie son lien d’accès.'],
        ['Je suis élève, comment entrer ?', 'Demande à ton parent ton <b>lien d’accès</b> et ouvre-le une fois sur ton téléphone. Sur un ordinateur, tape le code de 6 lettres qu’il t’affiche.'],
        ['Mes données sont-elles protégées ?', 'Le compte parent est réservé aux adultes. Les données servent seulement au suivi des révisions et peuvent être supprimées à tout moment. Voir la page <a href="confidentialite.html">Confidentialité</a>.'],
      ]],
    ],
  };
  function HELP_QA_SAFE() { try { return HELP_QA.map(([q, a]) => [q, a]); } catch (e) { return []; } }

  const norm = (s) => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/<[^>]+>/g, ' ');
  const STOP = new Set('le la les un une des de du et ou a au aux en dans sur pour par que qui quoi est sont je tu il on mon ma mes ton ta tes son sa ses ce cette comment pourquoi quand faire fait peut peux veux ne pas plus avec me te se y'.split(' '));
  const words = (s) => norm(s).split(/[^a-z0-9]+/).filter((w) => w.length > 2 && !STOP.has(w));

  const who = () => (typeof PREVIEW !== 'undefined' && PREVIEW) ? 'eleve' : !token ? 'visiteur' : role === 'parent' ? 'parent' : 'eleve';
  let tab = 'browse', filter = '', draft = '', mail = '', sent = false, openQ = null;

  const css = document.createElement('style');
  css.textContent = `
  #aideBtn { position: fixed; right: 16px; bottom: calc(16px + env(safe-area-inset-bottom)); z-index: 15; width: 52px; height: 52px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 26px; font-weight: 900; line-height: 1; display: grid; place-items: center; box-shadow: 0 6px 18px rgba(28,24,56,.28); transition: transform .15s, bottom .2s; }
  #aideBtn:active { transform: scale(.94); }
  #aideBtn svg { width: 28px; height: 28px; }
  body.has-tabbar #aideBtn { bottom: calc(82px + env(safe-area-inset-bottom)); }
  body.has-tabbar #aidePanel { bottom: calc(146px + env(safe-area-inset-bottom)); }
  #aidePanel { position: fixed; right: 12px; left: 12px; bottom: calc(80px + env(safe-area-inset-bottom)); z-index: 16; margin-left: auto; max-width: 440px; max-height: min(72vh, 640px); display: flex; flex-direction: column; background: var(--card); color: var(--ink); border: 1px solid var(--line); border-radius: 20px; box-shadow: 0 18px 50px rgba(28,24,56,.28); overflow: hidden; transform-origin: bottom right; animation: aideIn .18s ease-out; }
  #aidePanel[hidden] { display: none; }
  @keyframes aideIn { from { opacity: 0; transform: translateY(10px) scale(.98); } to { opacity: 1; transform: none; } }
  #aidePanel .ah { background: var(--accent-soft); padding: 16px 18px 0; }
  #aidePanel .ah h2 { font-size: 1.15em; margin: 0 0 12px; }
  #aidePanel .atabs { display: flex; gap: 4px; }
  #aidePanel .atabs button { flex: 1; background: transparent; color: var(--muted); padding: 10px 8px; border-radius: 14px 14px 0 0; font-weight: 700; font-size: .92em; }
  #aidePanel .atabs button.on { background: var(--card); color: var(--ink); font-weight: 800; }
  #aidePanel .ab { overflow-y: auto; -webkit-overflow-scrolling: touch; padding: 14px 18px 18px; }
  #aidePanel .afilter, #aidePanel textarea, #aidePanel .amail { width: 100%; font: inherit; color: var(--ink); background: var(--card); border: 1.5px solid var(--line); border-radius: 12px; padding: 11px 14px; }
  #aidePanel textarea { min-height: 110px; resize: vertical; }
  #aidePanel .afilter:focus, #aidePanel textarea:focus, #aidePanel .amail:focus { outline: none; border-color: var(--accent); }
  #aidePanel .asec { margin: 16px 0 2px; font-size: .78em; font-weight: 900; letter-spacing: .06em; text-transform: uppercase; color: var(--muted); padding-bottom: 8px; border-bottom: 1px solid var(--line); }
  #aidePanel details.aq { border-bottom: 1px solid var(--line); }
  #aidePanel details.aq > summary { list-style: none; cursor: pointer; display: flex; gap: 10px; align-items: flex-start; padding: 12px 2px; font-weight: 700; }
  #aidePanel details.aq > summary::-webkit-details-marker { display: none; }
  #aidePanel details.aq > summary::before { content: '›'; font-size: 1.3em; line-height: 1; color: var(--muted); transition: transform .15s; width: 10px; flex: none; margin-top: 1px; }
  #aidePanel details.aq[open] > summary::before { transform: rotate(90deg); }
  #aidePanel details.aq .aa { margin: 0 0 12px 20px; font-size: .93em; }
  #aidePanel .aa a { color: var(--accent); }
  #aidePanel .asug { background: var(--bg); border-radius: 14px; padding: 4px 12px; margin-top: 12px; }
  #aidePanel .asug > p { margin: 10px 0 0; font-weight: 800; font-size: .9em; }
  #aidePanel .asug details.aq:last-child { border-bottom: 0; }
  #aidePanel .aok { text-align: center; padding: 18px 4px; }
  #aidePanel .aok .big { font-size: 40px; }
  @media (prefers-reduced-motion: reduce) { #aidePanel { animation: none; } }`;
  document.head.appendChild(css);

  const btn = document.createElement('button');
  btn.id = 'aideBtn'; btn.type = 'button'; btn.setAttribute('aria-label', 'Aide'); btn.setAttribute('aria-expanded', 'false');
  const ICON_Q = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9.5"/><path d="M9.3 9.2a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.4-2.7 4"/><circle cx="12" cy="17.4" r=".6" fill="currentColor"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
  btn.innerHTML = ICON_Q;
  const panel = document.createElement('div');
  panel.id = 'aidePanel'; panel.hidden = true; panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-label', 'Aide');
  document.body.append(panel, btn);

  const qa = (q, a, open) => `<details class="aq"${open ? ' open' : ''}><summary>${q}</summary><div class="aa">${a}</div></details>`;
  const all = () => AIDE[who()].flatMap(([, list]) => list);
  function match(text, max) {
    const ws = words(text); if (!ws.length) return [];
    return all().map(([q, a]) => {
      const hq = norm(q), ha = norm(a);
      let sc = 0; ws.forEach((w) => { const r = w.slice(0, Math.max(4, w.length - 2)); if (hq.includes(r)) sc += 3; else if (ha.includes(r)) sc += 1; });
      return { q, a, sc };
    }).filter((x) => x.sc >= 2).sort((x, y) => y.sc - x.sc).slice(0, max);
  }

  function browseHtml() {
    const f = norm(filter).trim();
    const secs = AIDE[who()].map(([title, list]) => {
      const items = f ? list.filter(([q, a]) => (norm(q) + ' ' + norm(a)).includes(f)) : list;
      return items.length ? `<div class="asec">${title}</div>${items.map(([q, a]) => qa(q, a, !!f && items.length === 1)).join('')}` : '';
    }).join('');
    return secs || `<p class="muted" style="margin-top:14px">Rien trouvé pour « ${esc(filter)} ». Essaie un autre mot, ou pose ta question dans l’autre onglet.</p>`;
  }
  function askHtml() {
    const w = who();
    if (sent) return `<div class="aok"><div class="big">✅</div><h3>Question envoyée</h3><p class="muted">${w === 'eleve' ? 'La réponse arrivera par e-mail à ton parent, en général sous 24 heures.' : 'La réponse arrivera par e-mail, en général sous 24 heures.'}</p><button class="btn ghost" id="aNew">Poser une autre question</button></div>`;
    return `<p class="small muted" style="margin:0 0 10px">${w === 'eleve' ? 'Une question sur l’appli, un exercice qui te semble faux, une idée ? Écris-la ici.' : 'Une question sur l’appli, un problème, une suggestion ? Écris-la ici.'}</p>
      <textarea id="aTxt" maxlength="2000" placeholder="${w === 'eleve' ? 'Ex. : comment je fais pour…' : 'Ta question'}">${esc(draft)}</textarea>
      <div id="aSug"></div>
      ${w === 'visiteur' ? `<input class="amail" id="aMail" type="email" inputmode="email" autocomplete="email" placeholder="Ton adresse e-mail (pour la réponse)" value="${esc(mail)}" style="margin-top:10px">` : ''}
      <button class="btn" id="aSend" style="width:100%;margin-top:12px">Envoyer ma question</button>
      <p class="small muted" style="margin:8px 0 0">${w === 'eleve' ? 'La réponse sera envoyée à ton parent par e-mail.' : 'Réponse par e-mail, en général sous 24 heures.'}</p>`;
  }
  function sugHtml() {
    const m = match(draft, 3);
    return m.length ? `<div class="asug"><p>Ces réponses peuvent t’aider</p>${m.map((x) => qa(x.q, x.a)).join('')}</div>` : '';
  }

  function draw() {
    panel.innerHTML = `<div class="ah"><h2>Aide</h2><div class="atabs" role="tablist">
        <button role="tab" data-t="browse" class="${tab === 'browse' ? 'on' : ''}" aria-selected="${tab === 'browse'}">Parcourir l’aide</button>
        <button role="tab" data-t="ask" class="${tab === 'ask' ? 'on' : ''}" aria-selected="${tab === 'ask'}">Poser ma question</button></div></div>
      <div class="ab">${tab === 'browse' ? `<input class="afilter" id="aFil" type="search" placeholder="Filtrer par mot-clé" value="${esc(filter)}" autocomplete="off">${'<div id="aList">' + browseHtml() + '</div>'}` : askHtml()}</div>`;
    panel.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { tab = b.dataset.t; draw(); });
    const fil = panel.querySelector('#aFil');
    if (fil) fil.oninput = () => { filter = fil.value; panel.querySelector('#aList').innerHTML = browseHtml(); };
    const t = panel.querySelector('#aTxt');
    if (t) {
      let tm; const sug = panel.querySelector('#aSug'); sug.innerHTML = sugHtml();
      t.oninput = () => { draft = t.value; clearTimeout(tm); tm = setTimeout(() => { sug.innerHTML = sugHtml(); }, 250); };
    }
    const m = panel.querySelector('#aMail'); if (m) m.oninput = () => { mail = m.value; };
    const nw = panel.querySelector('#aNew'); if (nw) nw.onclick = () => { sent = false; draw(); };
    const s = panel.querySelector('#aSend'); if (s) s.onclick = send;
  }

  function ctxOf() {
    const h = document.querySelector('#app h1, #app h2');
    return [who(), h ? h.textContent.trim().slice(0, 80) : ''].filter(Boolean).join(' · ');
  }
  async function send() {
    const s = panel.querySelector('#aSend');
    const txt = draft.trim();
    if (txt.length < 5) { toast('Écris ta question en quelques mots.'); return; }
    if (who() === 'visiteur' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(mail.trim())) { toast('Indique ton adresse e-mail pour recevoir la réponse.'); return; }
    s.disabled = true; s.textContent = 'Envoi…';
    try {
      const body = { action: 'question', text: txt, ctx: ctxOf() };
      if (token) body.token = token; else body.email = mail.trim();
      const r = await mailFn(body);
      if (r.ok) { sent = true; draft = ''; draw(); return; }
      toast(r.error === 'limite' ? 'Tu as déjà envoyé plusieurs questions : réessaie dans une heure.' : r.error === 'email' ? 'Cette adresse e-mail ne semble pas valide.' : 'Envoi impossible pour l’instant. Réessaie plus tard.');
    } catch (e) { toast('Pas de connexion : réessaie quand tu auras du réseau.'); }
    s.disabled = false; s.textContent = 'Envoyer ma question';
  }

  let lastWho = null;
  function open() {
    if (lastWho !== who()) { lastWho = who(); filter = ''; sent = false; }
    draw(); panel.hidden = false; btn.innerHTML = ICON_X; btn.setAttribute('aria-expanded', 'true'); btn.setAttribute('aria-label', 'Fermer l’aide');
  }
  function close() { panel.hidden = true; btn.innerHTML = ICON_Q; btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-label', 'Aide'); }
  btn.onclick = () => (panel.hidden ? open() : close());
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) close(); });
  document.addEventListener('pointerdown', (e) => { if (!panel.hidden && !panel.contains(e.target) && !btn.contains(e.target)) close(); });

  // Remonte la bulle au-dessus de la barre d'onglets de l'espace parent ; marge en bas de page pour ne rien masquer
  const sync = () => { document.body.classList.toggle('has-tabbar', !!document.querySelector('.tabbar')); };
  new MutationObserver(sync).observe(document.getElementById('app'), { childList: true, subtree: true });
  sync();
  const pad = document.createElement('style');
  pad.textContent = '#app { padding-bottom: calc(84px + env(safe-area-inset-bottom)); } #app.pz, #app .pz { padding-bottom: 150px; }';
  document.head.appendChild(pad);
})();
