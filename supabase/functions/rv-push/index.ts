// Rappels sur le téléphone de l'élève (Web Push, clés VAPID gardées dans rv_config).
// - daily : appelé chaque heure par pg_cron (rv_push_tick, seulement à 17 h Paris) → élèves avec des révisions qui attendent,
//           rien fait aujourd'hui, rappels autorisés par le parent ; au plus un rappel par jour.
// - test  : bouton « Envoyer un rappel test » de l'espace parent (jeton parent + enfant).
// - duel  : l'élève vient de lancer un défi → on prévient l'ami (une fois, si ses rappels sont actifs).
import webpush from 'npm:web-push@3.6.7';

const SB = Deno.env.get('SUPABASE_URL')!;
const SK = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type, apikey, authorization, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, 'Content-Type': 'application/json' } });
const H = { apikey: SK, Authorization: `Bearer ${SK}`, 'Content-Type': 'application/json' };

async function rpc(fn: string, args: Record<string, unknown>) {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, { method: 'POST', headers: H, body: JSON.stringify(args) });
  if (!r.ok) throw new Error(`${fn} ${r.status} ${await r.text()}`);
  return r.json();
}
let CFG: Record<string, string> | null = null;
async function cfg() {
  if (CFG) return CFG;
  const r = await fetch(`${SB}/rest/v1/rv_config?select=k,v&k=in.(cron_secret,vapid_public,vapid_private)`, { headers: H });
  const rows = (await r.json()) as { k: string; v: string }[];
  CFG = Object.fromEntries(rows.map((x) => [x.k, x.v]));
  webpush.setVapidDetails('mailto:contact@guillaumejacques.fr', CFG.vapid_public, CFG.vapid_private);
  return CFG;
}

type Sub = { token: string; endpoint: string; p256dh: string; auth: string };
async function sendAll(subs: Sub[], payload: Record<string, unknown>) {
  const sent: string[] = [], gone: string[] = [], errs: string[] = [];
  for (const s of subs || []) {
    try {
      await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, JSON.stringify(payload), { TTL: 6 * 3600, urgency: 'normal' });
      sent.push(s.token);
    } catch (e) {
      const code = (e as { statusCode?: number }).statusCode || 0;
      if (code === 404 || code === 410) gone.push(s.token); else errs.push(String(code || (e as Error).message).slice(0, 80));
    }
  }
  return { sent, gone, errs };
}

const plural = (n: number, a: string, b: string) => (n > 1 ? b : a);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  try {
    const body = await req.json().catch(() => ({}));
    const c = await cfg();
    if (body.action === 'daily') {
      if (!c.cron_secret || req.headers.get('x-cron') !== c.cron_secret) return json({ error: 'auth' }, 401);
      const rows = (await rpc('rv_push_targets', { p_secret: c.cron_secret, p_kind: 'daily' })) as any[];
      let n = 0;
      for (const r of rows) {
        const due = r.due as number;
        const res = await sendAll(r.subs, {
          title: `${r.name}, tes révisions t’attendent`,
          body: `🔁 ${due} ${plural(due, 'exercice à revoir', 'exercices à revoir')}. La séance du jour prend environ 15 minutes.`,
          url: '/', tag: 'rv-daily',
        });
        await rpc('rv_push_mark', { p_secret: c.cron_secret, p_profile: r.profile_id, p_sent: res.sent, p_gone: res.gone, p_daily: true });
        n += res.sent.length;
      }
      return json({ ok: true, children: rows.length, sent: n });
    }
    if (body.action === 'test') {
      const rows = await rpc('rv_push_targets', { p_secret: c.cron_secret, p_kind: 'test', p_token: String(body.token || ''), p_child: String(body.child || '') });
      if ((rows as any).error) return json(rows);
      const r = (rows as any[])[0];
      if (!r) return json({ ok: true, sent: 0 });
      const res = await sendAll(r.subs, { title: 'Rappel test', body: `🔔 Les rappels de révision arrivent bien sur ce téléphone, ${r.name} !`, url: '/', tag: 'rv-test' });
      await rpc('rv_push_mark', { p_secret: c.cron_secret, p_profile: r.profile_id, p_sent: res.sent, p_gone: res.gone, p_daily: false });
      return json({ ok: true, sent: res.sent.length, errors: res.errs });
    }
    if (body.action === 'duel') {
      const t = await rpc('rv_duel_push_target', { p_secret: c.cron_secret, p_token: String(body.token || ''), p_duel: String(body.duel || '') });
      if (t.error || !t.subs) return json({ ok: true, sent: 0 });
      const res = await sendAll(t.subs, { title: '⚔️ Nouveau défi', body: `${t.from} te lance un défi de 5 questions. À toi de jouer !`, url: '/', tag: 'rv-duel' });
      if (res.gone.length) await rpc('rv_push_mark', { p_secret: c.cron_secret, p_profile: null, p_sent: res.sent, p_gone: res.gone, p_daily: false });
      return json({ ok: true, sent: res.sent.length });
    }
    return json({ error: 'action' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e).slice(0, 300) }, 500);
  }
});
