// E-mails de l'appli de révision : lien de connexion parent, alerte de séance, récap du soir, bilan hebdo.
// Envoi via l'API transactionnelle Brevo (secret BREVO_API_KEY).
const SB = Deno.env.get('SUPABASE_URL')!;
const SK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const BREVO = Deno.env.get('BREVO_API_KEY') || '';
const APP_URL = 'https://physique.guillaumejacques.fr/';
const APP_NAME = 'Révisions physique-chimie';
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
  neutA: 'prend A pour le nombre de neutrons', zA: 'inverse A et Z', expSigne: 'se trompe de signe dans l’exposant',
  saisie: 'puissance de dix fausse (calculatrice)', sciNon: 'n’écrit pas en écriture scientifique', indice: 'lit mal une formule chimique',
  signeIon: 'confond perte et gain d’électrons (ions)', noyauIon: 'change le noyau dans un ion',
  ajuste: 'écrit une équation non ajustée', coefIndice: 'confond coefficient et petit chiffre d’une formule',
  masseConso: 'oublie la conservation de la masse', reacProd: 'confond réactifs et produits', testIon: 'se trompe dans un test d’ion ou de gaz',
  phSens: 'lit le pH à l’envers (pH bas = très acide)', dilution: 'se trompe sur l’effet d’une dilution sur le pH',
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

async function send(to: string, subject: string, html: string, text: string, tag: string, replyTo?: string) {
  if (!BREVO) throw new Error('BREVO_API_KEY manquante');
  const r = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: { 'api-key': BREVO, 'Content-Type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ sender: SENDER, to: [{ email: to }], subject, htmlContent: html, textContent: text, tags: [tag], ...(replyTo ? { replyTo: { email: replyTo } } : {}) }),
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
      if (kind === 'weekly' && !k.n) return `<p><b>${esc(k.child)}</b> n’a pas révisé cette semaine. Un petit mot d’encouragement peut suffire : 15 minutes par jour, c’est déjà bien.</p>`;
      return `<p style="margin:0 0 6px"><b>${esc(k.child)}</b></p><ul style="margin:0 0 14px;padding-left:20px">
        ${kind === 'weekly' ? `<li>${k.days} jour${k.days > 1 ? 's' : ''} de révision sur 7 ${k.days >= 4 ? '✅' : '(objectif : 4)'}</li>` : ''}
        <li>${k.n} exercice${k.n > 1 ? 's' : ''}, ${pct(k.ok, k.n)} % de réussite, environ ${mins(k.ms)} min</li>
        ${k.n ? `<li>⚡ Physique : ${k.n - (k.n_chim || 0)} exercice${k.n - (k.n_chim || 0) > 1 ? 's' : ''}${k.n - (k.n_chim || 0) ? `, ${pct(k.ok - (k.ok_chim || 0), k.n - (k.n_chim || 0))} %` : ''} • ⚗️ Chimie : ${k.n_chim || 0} exercice${(k.n_chim || 0) > 1 ? 's' : ''}${k.n_chim ? `, ${pct(k.ok_chim, k.n_chim)} %` : ''}</li>` : ''}
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
      const dests: string[] = Array.isArray(r.to) ? r.to : [r.to];
      let n = 0;
      for (const to of dests) {
        try {
          await send(to, `${r.child} révise en ce moment`,
            layout(`${esc(r.child)} a commencé une séance`, `<p><b>${esc(r.child)}</b> a ouvert l’appli à <b>${hhmm()}</b> pour réviser.</p><p>Tu retrouveras le détail de sa séance dans ton tableau de bord.</p>`,
              { href: APP_URL, label: 'Voir le tableau de bord' }),
            `${r.child} a commencé une séance à ${hhmm()}. ${APP_URL}`, 'session');
          n++;
        } catch (e) { console.error(e); }
      }
      return json({ ok: true, sent: n > 0 });
    }

    if (body.action === 'coparent') {
      // Invitation de l'autre parent de la même famille (mêmes enfants, même suivi).
      const r = await rpc('rv_parent_invite', { p_token: String(body.token || ''), p_email: String(body.email || '') });
      if (r.error) return json({ error: r.error });
      const kids = r.kids ? esc(r.kids) : 'vos enfants';
      await send(r.email, `${r.from} t’invite à suivre les révisions de ${r.kids || 'vos enfants'}`,
        layout(`Suis les révisions de ${kids}`,
          `<p><b>${esc(r.from)}</b> t’a ajouté(e) comme parent dans ${APP_NAME}. Tu verras le même suivi : séances, réussite, erreurs à travailler et dates de contrôle de <b>${kids}</b>.</p>
           <p style="margin:16px 0 6px"><b>Pour entrer, c’est simple :</b></p>
           <ol style="margin:0 0 10px;padding-left:20px"><li>Touche le bouton ci-dessous puis « Je suis parent ».</li>
           <li>Entre cette adresse : <b>${esc(r.email)}</b></li>
           <li>Tape le code à 6 chiffres que tu recevras par e-mail.</li></ol>
           <p style="color:#77738f;font-size:13px">Pas besoin de mot de passe ni de créer de compte. Si tu ne connais pas ${esc(r.from)}, ignore cet e-mail.</p>`,
          { href: APP_URL, label: 'Ouvrir l’espace parent' }),
        `${r.from} t'invite à suivre les révisions de ${r.kids || 'vos enfants'} dans ${APP_NAME}. Ouvre ${APP_URL}, touche « Je suis parent », entre ${r.email} et tape le code reçu par e-mail.`, 'coparent', r.from);
      return json({ ok: true, email: r.email });
    }

    if (body.action === 'question') {
      const r = await rpc('rv_question_add', { p_token: body.token || null, p_email: body.email ? String(body.email) : null, p_text: String(body.text || ''), p_ctx: body.ctx ? String(body.ctx) : null });
      if (r.error) return json({ error: r.error });
      const who = r.role === 'parent' ? 'Un parent' : r.role === 'visiteur' ? 'Un visiteur' : `${r.child || 'Un élève'} (élève)`;
      const q = esc(String(body.text || '').trim()).replace(/\n/g, '<br>');
      await send(r.to, `Question d’aide – ${r.role === 'parent' ? 'parent' : r.role === 'visiteur' ? 'visiteur' : r.child || 'élève'}`,
        layout('Nouvelle question dans l’appli',
          `<p><b>${esc(who)}</b> (${esc(r.reply)}) a posé une question depuis la bulle d’aide :</p>
           <blockquote style="margin:12px 0;padding:12px 14px;background:#f4f2fb;border-radius:10px">${q}</blockquote>
           ${body.ctx ? `<p style="color:#77738f;font-size:13px">Écran : ${esc(String(body.ctx))}</p>` : ''}
           <p>Réponds simplement à cet e-mail : la réponse partira à ${esc(r.reply)}${r.role === 'student' ? ' (adresse du parent)' : ''}.</p>`),
        `${who} (${r.reply}) : ${String(body.text || '').trim()}`, 'question', r.reply);
      return json({ ok: true });
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
