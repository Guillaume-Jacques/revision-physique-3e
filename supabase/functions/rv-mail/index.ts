// E-mails de l'appli de révision : lien de connexion parent, alerte de séance, récap du soir, bilan hebdo.
// Envoi via l'API transactionnelle Brevo (secret BREVO_API_KEY).
const SB = Deno.env.get('SUPABASE_URL')!;
const SK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BREVO = Deno.env.get('BREVO_API_KEY') || '';
const APP_URL = 'https://physique.guillaumejacques.fr/';
const APP_NAME = 'Révisions physique';
const SENDER = { name: APP_NAME, email: 'contact@guillaumejacques.fr' };

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });

const ERR: Record<string, string> = {
  base100: 'compte 100 min dans une heure', sec100: 'écrit les secondes comme des centièmes', minutes: 'calcule avec des minutes au lieu d’heures',
  inverse: 'divise à l’envers', formule: 'se trompe de formule', conv36: 'se trompe de sens avec 3,6', noconv: 'oublie de convertir les unités',
  allerretour: 'oublie l’aller-retour de l’écho', oubli_df: 'oublie la distance de freinage', oubli_dr: 'oublie la distance de réaction',
  carre: 'oublie le carré de la vitesse', tr_faux: 'ne garde pas la donnée de l’énoncé', pct_total: 'confond pourcentage final et augmentation',
  question: 'ne répond pas à la question posée', notion: 'notion de cours pas encore sûre', p10: 'erreur de virgule ou de puissance de 10',
  conv60: 'se trompe avec ×60 / ÷60', arrondi: 'arrondit trop tôt', demi: 'oublie le ½ de Ec = ½ m v²', poidsmasse: 'confond poids et masse',
  unite: 'se trompe d’unité', copie: 'erreur relevée sur une copie', autre: 'autre erreur',
};

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, {
    method: 'POST', headers: { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' }, body: JSON.stringify(args),
  });
  if (!r.ok) throw new Error(`${fn} ${r.status} ${await r.text()}`);
  return r.json();
}

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

function layout(title: string, body: string, cta?: { href: string; label: string }) {
  return `<!doctype html><html lang="fr"><body style="margin:0;background:#f4f2ff;font-family:Arial,Helvetica,sans-serif;color:#1d1b2e">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:16px" cellpadding="0" cellspacing="0"><tr><td style="padding:28px 26px">
<p style="margin:0 0 14px;font-weight:bold;color:#5b3df5;font-size:15px">⚡ ${APP_NAME}</p>
<h1 style="margin:0 0 14px;font-size:21px;line-height:1.3">${title}</h1>
<div style="font-size:15px;line-height:1.55">${body}</div>
${cta ? `<p style="margin:24px 0 6px"><a href="${cta.href}" style="background:#5b3df5;color:#ffffff;text-decoration:none;padding:13px 22px;border-radius:12px;font-weight:bold;display:inline-block">${cta.label}</a></p>` : ''}
</td></tr></table>
<p style="font-size:12px;color:#77738f;margin:14px 0 0">Tu peux régler ou couper ces e-mails dans ton espace parent.</p>
</td></tr></table></body></html>`;
}

async function send(to: string, subject: string, html: string, text: string, tag: string) {
  if (!BREVO) throw new Error('BREVO_API_KEY manquante');
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html, textContent: text, tags: [tag] }),
  });
  if (!r.ok) throw new Error(`brevo ${r.status} ${await r.text()}`);
}

const hhmm = () => new Date().toLocaleTimeString('fr-FR', { timeZone: 'Europe/Paris', hour: '2-digit', minute: '2-digit' }).replace(':', ' h ');
const pct = (ok: number, n: number) => (n ? Math.round((ok / n) * 100) : 0);
const mins = (ms: number) => Math.max(1, Math.round(ms / 60000));

async function digest(kind: 'evening' | 'weekly') {
  const rows = (await rpc('rv_digest', { p_kind: kind })) as any[];
  const byMail: Record<string, any[]> = {};
  rows.forEach((r) => (byMail[r.email] = byMail[r.email] || []).push(r));
  let sent = 0;
  for (const [to, kids] of Object.entries(byMail)) {
    const blocks = kids.map((k) => {
      const errs = (k.errors || []).map((e: any) => `${esc(ERR[e.code] || e.code)} (${e.n} fois)`);
      if (kind === 'weekly' && !k.n) return `<p><b>${esc(k.child)}</b> n’a pas révisé cette semaine. Un petit mot d’encouragement peut suffire : 10 minutes par jour, c’est déjà bien.</p>`;
      return `<p style="margin:0 0 6px"><b>${esc(k.child)}</b></p><ul style="margin:0 0 14px;padding-left:20px">
        ${kind === 'weekly' ? `<li>${k.days} jour${k.days > 1 ? 's' : ''} de révision sur 7 ${k.days >= 4 ? '✅' : '(objectif : 4)'}</li>` : ''}
        <li>${k.n} exercice${k.n > 1 ? 's' : ''}, ${pct(k.ok, k.n)} % de réussite, environ ${mins(k.ms)} min</li>
        ${errs.length ? `<li>À travailler : ${errs.join(' ; ')}</li>` : '<li>Pas d’erreur qui se répète.</li>'}
        <li>${k.review} exercice${k.review > 1 ? 's' : ''} dans la file « À revoir »</li></ul>`;
    }).join('');
    const names = kids.map((k) => k.child).join(' et ');
    const subject = kind === 'evening' ? `Les révisions du jour de ${names}` : `La semaine de révisions de ${names}`;
    const title = kind === 'evening' ? 'Les révisions d’aujourd’hui' : 'Le bilan de la semaine';
    try {
      await send(to, subject, layout(title, blocks, { href: APP_URL, label: 'Ouvrir le tableau de bord' }), `${title}\n\n${kids.map((k) => `${k.child} : ${k.n} exercices, ${pct(k.ok, k.n)} % de réussite.`).join('\n')}\n\n${APP_URL}`, kind);
      sent++;
    } catch (e) { console.error(e); }
  }
  return sent;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body: any = {};
  try { body = await req.json(); } catch (_) { return json({ error: 'body' }, 400); }

  try {
    if (body.action === 'magic') {
      const r = await rpc('rv_magic_create', { p_email: String(body.email || ''), p_invite: body.invite ? String(body.invite) : null, p_consent: !!body.consent });
      if (r.error) return json({ error: r.error });
      const link = `${APP_URL}#m=${r.token}`;
      await send(r.email, r.new ? `Bienvenue sur ${APP_NAME} – code ${r.code}` : `${r.code} : ton code de connexion à ${APP_NAME}`,
        layout(r.new ? 'Bienvenue ! Confirme ton adresse' : 'Ton lien de connexion',
          `<p>Touche le bouton ci-dessous pour ouvrir ton espace parent. Il fonctionne pendant <b>30 minutes</b>, une seule fois.</p>
           <p style="margin:18px 0 6px"><b>Tu utilises l’appli installée sur ton téléphone ?</b> Tape plutôt ce code dans l’appli :</p>
           <p style="font-size:30px;font-weight:bold;letter-spacing:6px;margin:0 0 6px;color:#5b3df5">${r.code}</p>
           <p style="color:#77738f;font-size:13px">Si tu n’as rien demandé, ignore simplement cet e-mail.</p>`,
          { href: link, label: r.new ? 'Créer mon espace parent' : 'Me connecter' }),
        `Ton code de connexion : ${r.code} (à taper dans l'appli). Ou ton lien (valable 30 minutes) : ${link}`, 'magic');
      return json({ ok: true, new: r.new });
    }

    if (body.action === 'session') {
      const r = await rpc('rv_notify_session', { p_token: String(body.token || '') });
      if (!r.send) return json({ ok: true, sent: false });
      await send(r.to, `${r.child} révise en ce moment`,
        layout(`${esc(r.child)} a commencé une séance`, `<p><b>${esc(r.child)}</b> a ouvert l’appli à <b>${hhmm()}</b> pour réviser.</p><p>Tu retrouveras le détail de sa séance dans ton tableau de bord.</p>`,
          { href: APP_URL, label: 'Voir le tableau de bord' }),
        `${r.child} a commencé une séance à ${hhmm()}. ${APP_URL}`, 'session');
      return json({ ok: true, sent: true });
    }

    if (body.action === 'evening' || body.action === 'weekly') {
      const r = await fetch(`${SB}/rest/v1/rv_config?k=eq.cron_secret&select=v`, { headers: { apikey: SK, Authorization: `Bearer ${SK}` } });
      const [cfg] = await r.json();
      if (!cfg || req.headers.get('x-cron') !== cfg.v) return json({ error: 'auth' }, 401);
      return json({ ok: true, sent: await digest(body.action) });
    }
    return json({ error: 'action' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: 'server' }, 500);
  }
});
