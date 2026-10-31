// Copies de contrôles en photo : stockage privé, relecture automatique, e-mail au parent.
// Actions (jeton parent ou élève de la famille) :
//   add     : ajoute une photo (JPEG en base64) à une copie
//   photos  : liens temporaires (10 min) vers les photos d'une copie
//   del     : retire une photo (avant validation)
//   analyse : lance la relecture des photos (en arrière-plan) ; le parent reçoit un e-mail quand c'est prêt
//   remove  : supprime une copie et ses photos (parent)
//   purge   : ménage quotidien des photos orphelines (pg_cron, en-tête x-cron)
// Secrets : ANTHROPIC_API_KEY (relecture), BREVO_API_KEY (e-mails).
const SB = Deno.env.get('SUPABASE_URL')!;
const SK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const AI_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const BREVO = Deno.env.get('BREVO_API_KEY') || '';
const MODEL = 'claude-sonnet-5-5';
const APP_URL = 'https://physique.guillaumejacques.fr/';
const APP_NAME = 'Révisions physique-chimie';
const BUCKET = 'copies';
const MAX_PHOTOS = 8;

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const H = { apikey: SK, Authorization: `Bearer ${SK}` };
const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify(args) });
  if (!r.ok) throw new Error(`${fn} ${r.status} ${await r.text()}`);
  return r.json();
}
async function patchCopy(id: string, v: Record<string, unknown>) {
  const r = await fetch(`${SB}/rest/v1/rv_copies?id=eq.${id}`, { method: 'PATCH', headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=minimal' }, body: JSON.stringify(v) });
  if (!r.ok) throw new Error(`patch ${r.status} ${await r.text()}`);
}
async function getCopy(id: string) {
  const r = await fetch(`${SB}/rest/v1/rv_copies?id=eq.${id}&select=*`, { headers: H });
  return ((await r.json()) as any[])[0];
}
const enc = (p: string) => p.split('/').map(encodeURIComponent).join('/');
async function upload(path: string, bytes: Uint8Array, type: string) {
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${enc(path)}`, { method: 'POST', headers: { ...H, 'Content-Type': type, 'x-upsert': 'true' }, body: new Blob([bytes as BlobPart], { type }) });
  if (!r.ok) throw new Error(`upload ${r.status} ${await r.text()}`);
}
async function download(path: string) {
  const r = await fetch(`${SB}/storage/v1/object/${BUCKET}/${enc(path)}`, { headers: H });
  if (!r.ok) throw new Error(`download ${r.status}`);
  return new Uint8Array(await r.arrayBuffer());
}
async function sign(path: string) {
  const r = await fetch(`${SB}/storage/v1/object/sign/${BUCKET}/${enc(path)}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ expiresIn: 600 }) });
  const j = await r.json();
  return j.signedURL ? `${SB}/storage/v1${j.signedURL}` : null;
}
async function removeObjs(paths: string[]) {
  if (!paths.length) return;
  await fetch(`${SB}/storage/v1/object/${BUCKET}`, { method: 'DELETE', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefixes: paths }) });
}
async function list(prefix: string) {
  const r = await fetch(`${SB}/storage/v1/object/list/${BUCKET}`, { method: 'POST', headers: { ...H, 'Content-Type': 'application/json' }, body: JSON.stringify({ prefix, limit: 1000 }) });
  return r.ok ? ((await r.json()) as { name: string; id: string | null }[]) : [];
}
function b64ToBytes(b64: string) {
  const bin = atob(b64); const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function bytesToB64(u: Uint8Array) {
  let s = ''; const CH = 0x8000;
  for (let i = 0; i < u.length; i += CH) s += String.fromCharCode(...u.subarray(i, i + CH));
  return btoa(s);
}

async function mail(to: string[], subject: string, title: string, body: string) {
  if (!BREVO || !to.length) return;
  const html = `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f2ff;font-family:Arial,Helvetica,sans-serif;color:#1d1b2e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 26px">
<p style="margin:0 0 14px;font-weight:bold;color:#5b3df5;font-size:15px">⚡ ${APP_NAME}</p>
<h1 style="margin:0 0 14px;font-size:21px;line-height:1.3">${title}</h1>
<div style="font-size:15px;line-height:1.55">${body}</div>
<p style="margin:24px 0 6px"><a href="${APP_URL}" style="background:#5b3df5;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:12px;font-weight:bold;display:inline-block">Ouvrir l’espace parent</a></p>
</td></tr></table>
<p style="font-size:12px;color:#77738f;margin:14px 0 0">Tu peux régler ou couper ces e-mails dans ton espace parent.</p>
</td></tr></table></body></html>`;
  const text = `${title}\n\n${body.replace(/<[^>]+>/g, '')}\n\n${APP_URL}`;
  for (const t of to) {
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST', headers: { 'api-key': BREVO, 'Content-Type': 'application/json', accept: 'application/json' },
        body: JSON.stringify({ sender: { name: APP_NAME, email: 'contact@guillaumejacques.fr' }, to: [{ email: t }], subject, htmlContent: html, textContent: text, tags: ['copie'] }),
      });
    } catch (_) { /* e-mail facultatif */ }
  }
}

/* ---------- Relecture d'une copie ---------- */
function prompt(ctx: any, child: string, gender: string | null, copy: any) {
  const g = gender === 'f' ? 'une fille' : gender === 'm' ? 'un garçon' : 'un élève (accords neutres)';
  const skills = (Array.isArray(ctx?.skills) ? ctx.skills : []).slice(0, 80)
    .map((s: any) => `${String(s.id).slice(0, 8)} (${String(s.subj || 'physique').slice(0, 10)}) : ${String(s.name).slice(0, 80)}`).join('\n');
  const codes = Object.entries(ctx?.codes || {}).slice(0, 80).map(([k, v]) => `${String(k).slice(0, 24)} : ${String(v).slice(0, 90)}`).join('\n');
  return `Tu relis la copie corrigée d'un contrôle de physique-chimie de 3e (collège, France). Les photos ci-jointes sont les pages de la copie, avec en général les annotations rouges du professeur.
L'élève s'appelle ${child} ; c'est ${g}, en grande difficulté en physique-chimie. Titre indiqué : ${copy.label || 'non précisé'}. Note saisie : ${copy.note != null ? copy.note + '/' + (copy.note_max || 20) : 'non saisie'}.

Ta mission :
1. Retrouver chaque exercice ou question de la copie, ce que l'élève a écrit, et ce que le professeur a corrigé.
2. Pour chaque erreur : expliquer simplement ce qui n'allait pas, puis montrer pas à pas comment arriver au bon résultat (formule, conversion, calcul, phrase réponse avec l'unité), comme un bon professeur particulier. Phrases courtes, vocabulaire de 3e, tutoiement, ton encourageant, jamais moqueur.
3. Relier chaque erreur à UNE compétence et UN type d'erreur des listes ci-dessous (choisis le plus proche ; « autre » si rien ne colle ; null si la compétence n'existe pas encore dans la liste).
4. Dire ce qui est réussi et ce qu'il faut retravailler avant le prochain contrôle.

Si un passage est illisible ou incertain, dis-le (champ "incertain": true) au lieu d'inventer. Si les photos ne sont pas une copie de contrôle, mets "lisible": false.
Ne te présente pas, ne cite aucun nom d'outil ou d'IA : tu parles au nom de « l'application ».

Compétences (id (matière) : nom) :
${skills}

Types d'erreur (code : description) :
${codes}

Réponds UNIQUEMENT par un objet JSON valide, sans texte autour, de la forme :
{"lisible": true, "titre": "titre court du contrôle", "matiere": "physique" | "chimie" | "mix", "note": nombre ou null, "note_max": nombre ou null,
 "resume": "2 phrases pour l'élève : ce qui va, ce qui coince",
 "exercices": [{"num": "1a", "sujet": "de quoi parle la question (court)", "statut": "juste" | "partiel" | "faux" | "non_fait", "points": "1,5/3" ou null,
   "ecrit": "ce que l'élève a écrit, résumé", "erreur": "ce qui n'allait pas" ou null, "code": "code d'erreur" ou null, "competence": "id" ou null,
   "etapes": ["étape 1 de la bonne méthode", "étape 2", "..."], "reponse": "bonne réponse avec unité" ou null, "conseil": "astuce courte pour ne plus se tromper" ou null, "incertain": false}],
 "points_forts": ["..."], "a_retravailler": [{"competence": "id", "pourquoi": "phrase courte"}],
 "mot_parent": "1 ou 2 phrases pour le parent : où en est l'élève et comment l'aider cette semaine"}`;
}

async function analyse(auth: any, ctx: any, tries: number) {
  const copy = auth.copy;
  try {
    const paths: string[] = (copy.photos || []).slice(0, 6);
    const imgs = [];
    for (const p of paths) imgs.push({ type: 'image', source: { type: 'base64', media_type: 'image/jpeg', data: bytesToB64(await download(p)) } });
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 8000, messages: [{ role: 'user', content: [...imgs, { type: 'text', text: prompt(ctx, auth.child || 'l’élève', auth.gender, copy) }] }] }),
    });
    if (!r.ok) throw new Error(`ai ${r.status} ${(await r.text()).slice(0, 300)}`);
    const j = await r.json();
    const txt = (j.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('');
    const m = txt.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('réponse sans JSON');
    const a = JSON.parse(m[0]);
    a.tries = tries;
    const upd: Record<string, unknown> = { analysis: a, status: a.lisible === false ? 'erreur' : 'a_valider', analysed_at: new Date().toISOString() };
    if (copy.note == null && typeof a.note === 'number') { upd.note = a.note; if (typeof a.note_max === 'number') upd.note_max = a.note_max; }
    if (!copy.label && a.titre) upd.label = String(a.titre).slice(0, 120);
    await patchCopy(copy.id, upd);
    if (a.lisible !== false) {
      const nErr = (a.exercices || []).filter((e: any) => e.statut !== 'juste').length;
      const who = copy.by_role === 'student' ? `${esc(auth.child)} a ajouté la copie de son contrôle` : `La copie de ${esc(auth.child)} a été relue`;
      await mail(auth.parents || [], `📸 Copie de ${auth.child} : correction prête à vérifier`, `${who}`,
        `<p>${esc(upd.label || copy.label || 'Contrôle')}${upd.note != null || copy.note != null ? ` — ${esc(upd.note ?? copy.note)}/${esc(upd.note_max ?? copy.note_max ?? 20)}` : ''}</p>
         <p>L’application a relevé <b>${nErr} point${nErr > 1 ? 's' : ''} à revoir</b>. Vérifie-les dans <b>Contrôles</b>, puis touche « Valider » : ${esc(auth.child)} retrouvera la correction pas à pas et les exercices pour s’entraîner.</p>
         ${a.mot_parent ? `<p style="background:#f4f2ff;border-radius:10px;padding:10px 12px">💡 ${esc(a.mot_parent)}</p>` : ''}`);
    }
  } catch (e) {
    console.error('analyse', copy.id, String(e));
    await patchCopy(copy.id, { status: 'erreur', analysis: { error: String(e).slice(0, 300), tries } }).catch(() => {});
  }
}

/* ---------- Ménage : photos dont la copie n'existe plus ---------- */
async function purge() {
  const r = await fetch(`${SB}/rest/v1/rv_copies?select=id`, { headers: H });
  const ids = new Set(((await r.json()) as any[]).map((x) => x.id));
  let n = 0;
  for (const f of await list('')) {
    for (const s of await list(f.name + '/')) {
      for (const c of await list(`${f.name}/${s.name}/`)) {
        if (c.id === null && !ids.has(c.name)) {
          const files = (await list(`${f.name}/${s.name}/${c.name}/`)).map((x) => `${f.name}/${s.name}/${c.name}/${x.name}`);
          await removeObjs(files); n += files.length;
        }
      }
    }
  }
  return n;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const act = String(body.action || '');
    if (act === 'purge') {
      const c = await fetch(`${SB}/rest/v1/rv_config?k=eq.cron_secret&select=v`, { headers: H }).then((r) => r.json());
      if (!c[0] || req.headers.get('x-cron') !== c[0].v) return json({ error: 'auth' }, 401);
      return json({ ok: true, removed: await purge() });
    }
    const auth = await rpc('rv_copy_auth', { p_token: String(body.token || ''), p_id: body.id ? String(body.id) : null });
    if (auth.error) return json({ error: auth.error });
    const copy = auth.copy;
    if (!copy) return json({ error: 'copy' });
    const locked = copy.status === 'validee' && auth.role !== 'parent';

    if (act === 'add') {
      if (locked) return json({ error: 'locked' });
      if ((copy.photos || []).length >= MAX_PHOTOS) return json({ error: 'max' });
      const data = String(body.data || '').replace(/^data:image\/\w+;base64,/, '');
      const bytes = b64ToBytes(data);
      if (bytes.length < 2000 || bytes.length > 5_000_000) return json({ error: 'size' });
      if (!(bytes[0] === 0xff && bytes[1] === 0xd8)) return json({ error: 'type' });
      const path = `${copy.family_id}/${copy.student_id}/${copy.id}/${Date.now()}.jpg`;
      await upload(path, bytes, 'image/jpeg');
      const fresh = await getCopy(copy.id);
      const photos = [...(fresh.photos || []), path];
      await patchCopy(copy.id, { photos, status: fresh.status === 'validee' ? 'validee' : 'photos' });
      return json({ ok: true, n: photos.length });
    }
    if (act === 'photos') {
      const urls = [];
      for (const p of copy.photos || []) urls.push(await sign(p));
      return json({ ok: true, urls });
    }
    if (act === 'del') {
      if (locked) return json({ error: 'locked' });
      const i = Number(body.index), p = (copy.photos || [])[i];
      if (!p) return json({ error: 'index' });
      await removeObjs([p]);
      await patchCopy(copy.id, { photos: copy.photos.filter((_: string, k: number) => k !== i) });
      return json({ ok: true });
    }
    if (act === 'analyse') {
      if (copy.status === 'validee') return json({ error: 'locked' });
      if (!(copy.photos || []).length) return json({ error: 'nophoto' });
      if (!AI_KEY) {
        if (copy.by_role === 'student' || auth.role === 'student')
          await mail(auth.parents || [], `📸 ${auth.child} a ajouté une copie`, `${esc(auth.child)} a ajouté la copie d’un contrôle`,
            `<p>${esc(copy.label || 'Contrôle')} — ${(copy.photos || []).length} photo(s). Tu la retrouves dans <b>Contrôles</b>.</p>`);
        return json({ error: 'nokey' });
      }
      const tries = Number((copy.analysis || {}).tries || 0);
      if (tries >= 4) return json({ error: 'tries' });
      await patchCopy(copy.id, { status: 'analyse', analysis: { tries: tries + 1 } });
      // @ts-ignore EdgeRuntime existe sur Supabase
      EdgeRuntime.waitUntil(analyse(auth, body.ctx || {}, tries + 1));
      return json({ ok: true, started: true });
    }
    if (act === 'remove') {
      if (auth.role !== 'parent' && !(auth.role === 'student' && copy.by_role === 'student' && copy.status !== 'validee')) return json({ error: 'auth' });
      await removeObjs(copy.photos || []);
      await fetch(`${SB}/rest/v1/rv_copies?id=eq.${copy.id}`, { method: 'DELETE', headers: H });
      return json({ ok: true });
    }
    return json({ error: 'action' });
  } catch (e) {
    console.error(String(e));
    return json({ error: 'server' }, 500);
  }
});
