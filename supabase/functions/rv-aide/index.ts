// Assistant d'aide de l'appli « Je révise » (onglet « Poser ma question » de la bulle « ? »).
// Entrée  : { who: 'eleve'|'parent'|'visiteur', token?, messages: [{role, text}], kb: string, dest: [{go, label}] }
// Sortie  : { ok: true, answer: '<html simple>', links: [{go, label}], human: bool }
// Le client envoie l'aide de son profil (kb) et les pages où il peut renvoyer (dest) :
// l'assistant ne peut proposer que ces pages-là. Anti-abus : rv_aide_hit (40 messages / h par personne).
// Secret : ANTHROPIC_API_KEY (déjà utilisé par rv-copie).
const SB = Deno.env.get('SUPABASE_URL')!;
const SK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const AI_KEY = Deno.env.get('ANTHROPIC_API_KEY') || '';
const MODEL = 'claude-haiku-5-5';
const APP_NAME = 'Je révise';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const H = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' };

async function sha(s: string) {
  const d = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return Array.from(new Uint8Array(d)).slice(0, 12).map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function hit(key: string, who: string) {
  const r = await fetch(`${SB}/rest/v1/rpc/rv_aide_hit`, { method: 'POST', headers: H, body: JSON.stringify({ p_key: key, p_who: who }) });
  if (!r.ok) return 'ok'; // le compteur ne doit jamais bloquer l'aide
  return await r.json();
}

// Nettoyage de la réponse : seules quelques balises simples sont gardées
function clean(html: string) {
  return String(html || '')
    .replace(/<(?!\/?(b|i|br|ul|li|p)\b)[^>]*>/gi, '')
    .replace(/<(b|i|br|ul|li|p)\b[^>]*>/gi, '<$1>')
    .replace(/\n{2,}/g, '<br><br>').replace(/\n/g, '<br>')
    .replace(/\bClaude\b/g, 'l’application')
    .slice(0, 2500);
}

function system(who: string, kb: string, dest: { go: string; label: string }[]) {
  const pour = who === 'eleve' ? 'un ou une élève de 3e (13-15 ans) : tutoie, phrases courtes, ton encourageant'
    : who === 'parent' ? 'un parent d’élève : tutoie aussi (ton de l’appli), clair et concret'
    : 'un visiteur qui découvre l’appli (souvent un parent) : tutoie, clair et rassurant';
  return `Tu es l’assistant d’aide de l’application « ${APP_NAME} », une appli gratuite de révision de physique-chimie de 3e (programme français) : leçons courtes, exercices qui reviennent au bon moment, contrôles blancs, sujets type brevet, espace parent de suivi.
Tu réponds à ${pour}. Réponds toujours en français.

Ce que tu sais faire :
1. Expliquer le fonctionnement de l’appli, uniquement à partir de l’AIDE ci-dessous. N’invente aucun bouton, réglage ou fonction. Si l’aide ne contient pas la réponse, dis-le simplement et propose de transmettre la question (human = true).
2. Expliquer une notion de physique-chimie du niveau 3e (vitesse, conversions, énergie, atome, ions, réactions, pH…) avec un exemple chiffré simple, étape par étape. Pour un exercice en cours, donne la méthode et un exemple avec d’autres nombres, pas la réponse finale toute faite.
3. Renvoyer vers la bonne page de l’appli : choisis 0 à 3 destinations dans la liste PAGES (copie le champ "go" exactement). N’en invente jamais.

Règles :
- Réponse courte : 2 à 6 phrases, ou une petite liste. HTML simple autorisé : <b>, <br>, <ul><li>.
- Tu parles au nom de « l’application » ; ne te présente jamais sous un autre nom et ne parle pas d’intelligence artificielle sauf si on te le demande.
- Bug, erreur dans un exercice, problème de compte, demande commerciale, réclamation, données personnelles, ou question hors sujet sérieuse : réponds brièvement et mets human = true pour proposer d’écrire à l’équipe.
- Sujet sans rapport avec l’appli ou l’école : décline gentiment en une phrase.
- Ne demande jamais d’informations personnelles (nom de famille, adresse, téléphone…). Si un élève semble en détresse ou en danger, réponds avec douceur, conseille d’en parler tout de suite à un adulte de confiance (parent, professeur, CPE) et indique le 3020 (harcèlement) ou le 119 (enfance en danger), puis human = true.

Réponds UNIQUEMENT par un objet JSON, sans texte autour :
{"answer": "<ta réponse>", "links": ["<go>", ...], "human": false}

PAGES (destinations possibles) :
${dest.map((d) => `- go="${d.go}" : ${d.label}`).join('\n') || '(aucune)'}

AIDE de l’appli pour ce profil :
${kb}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ ok: false, error: 'methode' }, 405);
  try {
    const b = await req.json();
    const who = ['eleve', 'parent', 'visiteur'].includes(b.who) ? b.who : 'visiteur';
    const msgs = (Array.isArray(b.messages) ? b.messages : []).slice(-12)
      .map((m: any) => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: String(m.text || '').slice(0, 1500) }))
      .filter((m: any) => m.content.trim());
    if (!msgs.length || msgs[msgs.length - 1].role !== 'user') return json({ ok: false, error: 'vide' });
    // Les messages doivent alterner et commencer par l'utilisateur
    while (msgs.length && msgs[0].role !== 'user') msgs.shift();
    const alt: any[] = [];
    for (const m of msgs) { if (alt.length && alt[alt.length - 1].role === m.role) alt[alt.length - 1].content += '\n' + m.content; else alt.push(m); }
    const dest = (Array.isArray(b.dest) ? b.dest : []).slice(0, 60)
      .filter((d: any) => d && /^[a-z]+(:[A-Za-z0-9_-]+)?$/.test(String(d.go || '')))
      .map((d: any) => ({ go: String(d.go), label: String(d.label || '').slice(0, 120) }));
    const kb = String(b.kb || '').slice(0, 30000);

    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim();
    const key = await sha(b.token ? 't:' + String(b.token) : 'ip:' + ip);
    const lim = await hit(key, who);
    if (lim !== 'ok') return json({ ok: false, error: lim });
    if (!AI_KEY) return json({ ok: false, error: 'indispo' });

    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': AI_KEY, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: MODEL, max_tokens: 900, system: system(who, kb, dest), messages: alt }),
    });
    if (!r.ok) { console.error('ia', r.status, await r.text()); return json({ ok: false, error: 'indispo' }); }
    const out = await r.json();
    const txt = (out.content || []).filter((c: any) => c.type === 'text').map((c: any) => c.text).join('').trim();
    let p: any = null;
    try { p = JSON.parse(txt); } catch { const m = txt.match(/\{[\s\S]*\}/); if (m) { try { p = JSON.parse(m[0]); } catch { /* */ } } }
    if (!p || typeof p.answer !== 'string') p = { answer: txt, links: [], human: false };
    const ok = new Map(dest.map((d: any) => [d.go, d.label]));
    const links = (Array.isArray(p.links) ? p.links : []).map((x: any) => String(typeof x === 'object' && x ? x.go : x))
      .filter((g: string, i: number, a: string[]) => ok.has(g) && a.indexOf(g) === i).slice(0, 3)
      .map((g: string) => ({ go: g, label: ok.get(g) }));
    return json({ ok: true, answer: clean(p.answer), links, human: !!p.human });
  } catch (e) {
    console.error(e);
    return json({ ok: false, error: 'erreur' });
  }
});
