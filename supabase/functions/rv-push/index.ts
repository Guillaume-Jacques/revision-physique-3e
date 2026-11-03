// Rappels sur le téléphone de l'élève (Web Push, clés VAPID gardées dans rv_config).
// - daily : appelé chaque heure par pg_cron (rv_push_tick, seulement à 17 h Paris) → élèves avec des révisions qui attendent,
//           rien fait aujourd'hui, rappels autorisés par le parent ; au plus un rappel par jour.
// - test  : bouton « Envoyer un rappel test » de l'espace parent (jeton parent + enfant).
// - duel  : l'élève vient de lancer un défi → on prévient l'ami (une fois, si ses rappels sont actifs).
// - signup: déclenché par la base à chaque nouvelle famille → notification iPhone (APNs) à l'administrateur.
// - apns_test : bouton de test depuis l'espace parent de l'administrateur.
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


/* ---------- Notifications natives iPhone (APNs, clé .p8 dans le secret APNS_KEY_P8) ---------- */
const APNS_TOPIC = 'fr.guillaumejacques.revisions';
const TEAM_ID = '5XMBG5V5C3';
let APNS_JWT: { t: string; at: number } | null = null;
const b64u = (b: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof b === 'string' ? new TextEncoder().encode(b) : new Uint8Array(b as ArrayBuffer);
  let s = ''; bytes.forEach((x) => (s += String.fromCharCode(x)));
  return btoa(s).replace(/=+$/, '').replace(/\+/g, '-').replace(/\//g, '_');
};
async function apnsJwt(keyId: string) {
  if (APNS_JWT && Date.now() - APNS_JWT.at < 40 * 60000) return APNS_JWT.t;
  const raw = (Deno.env.get('APNS_KEY_P8') || '').replace(/-----(BEGIN|END)[^-]*-----/g, '').replace(/[^A-Za-z0-9+/=]/g, '');
  if (!raw) throw new Error('APNS_KEY_P8 manquante');
  const der = Uint8Array.from(atob(raw), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('pkcs8', der, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const head = b64u(JSON.stringify({ alg: 'ES256', kid: keyId })), claims = b64u(JSON.stringify({ iss: TEAM_ID, iat: Math.floor(Date.now() / 1000) }));
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, new TextEncoder().encode(`${head}.${claims}`));
  APNS_JWT = { t: `${head}.${claims}.${b64u(sig)}`, at: Date.now() };
  return APNS_JWT.t;
}
async function apnsSend(devices: string[], title: string, text: string, keyId: string) {
  const jwt = await apnsJwt(keyId);
  let sent = 0; const gone: string[] = [], errs: string[] = [];
  for (const d of devices) {
    const r = await fetch(`https://api.push.apple.com/3/device/${d}`, {
      method: 'POST',
      headers: { authorization: `bearer ${jwt}`, 'apns-topic': APNS_TOPIC, 'apns-push-type': 'alert', 'apns-priority': '10' },
      body: JSON.stringify({ aps: { alert: { title, body: text }, sound: 'default' } }),
    });
    if (r.ok) sent++; else { const t = await r.text(); if (r.status === 410 || /BadDeviceToken|Unregistered/.test(t)) gone.push(d); errs.push(`${r.status} ${t}`.slice(0, 120)); }
  }
  return { sent, gone, errs };
}
async function adminDevices() {
  const r = await fetch(`${SB}/rest/v1/rpc/rv_apns_admin_devices`, { method: 'POST', headers: H, body: '{}' });
  return r.ok ? ((await r.json()) as string[]) : [];
}
async function apnsKeyId() {
  const r = await fetch(`${SB}/rest/v1/rv_config?select=v&k=eq.apns_key_id`, { headers: H });
  const [row] = await r.json(); return row ? row.v as string : '';
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
    if (body.action === 'signup') {
      if (!c.cron_secret || req.headers.get('x-cron') !== c.cron_secret) return json({ error: 'auth' }, 401);
      const kid = await apnsKeyId(), devs = await adminDevices();
      if (!kid || !devs.length) return json({ ok: true, sent: 0, reason: !kid ? 'no_key' : 'no_device' });
      const res = await apnsSend(devs, '👋 Nouveau parent inscrit', `${String(body.email || 'Un parent')} vient de créer son espace dans Je révise.`, kid);
      if (res.gone.length) await fetch(`${SB}/rest/v1/rv_apns?device=in.(${res.gone.map((g) => `"${g}"`).join(',')})`, { method: 'DELETE', headers: H });
      return json({ ok: true, sent: res.sent, errors: res.errs });
    }
    if (body.action === 'apns_test') {
      const ok = await rpc('rv_apns_is_admin', { p_token: String(body.token || '') });
      if (ok !== true) return json({ error: 'auth' }, 401);
      const kid = await apnsKeyId(), devs = await adminDevices();
      if (!kid || !devs.length) return json({ ok: true, sent: 0, reason: !kid ? 'no_key' : 'no_device' });
      const res = await apnsSend(devs, 'Notification test', '🔔 Les notifications de Je révise arrivent bien sur cet iPhone.', kid);
      return json({ ok: true, sent: res.sent, errors: res.errs });
    }
    return json({ error: 'action' }, 400);
  } catch (e) {
    return json({ error: String((e as Error).message || e).slice(0, 300) }, 500);
  }
});
