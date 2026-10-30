-- Ouverture à plusieurs familles : familles, invitations, liens de connexion, appareils, e-mails
-- (appliqué sur Supabase mqxotaaqhonxbficrkgc le 30/10/2026)

create table if not exists rv_families (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  notify text not null default 'each' check (notify in ('each','evening','off')),
  weekly boolean not null default true,
  is_admin boolean not null default false,
  consent_at timestamptz,
  created_at timestamptz not null default now()
);
alter table rv_profiles add column if not exists family_id uuid references rv_families(id) on delete cascade;
alter table rv_profiles add column if not exists join_secret uuid not null default gen_random_uuid();
alter table rv_profiles add column if not exists pin4_hash text;
alter table rv_profiles add column if not exists last_notified timestamptz;
alter table rv_profiles alter column pin_hash drop not null;
alter table rv_sessions add column if not exists id bigserial;
alter table rv_sessions add column if not exists label text;
alter table rv_sessions add column if not exists last_seen timestamptz default now();
alter table rv_plan add column if not exists family_id uuid references rv_families(id) on delete cascade;

create table if not exists rv_invites (
  code text primary key,
  family_id uuid references rv_families(id) on delete cascade,
  note text,
  used_by uuid references rv_families(id) on delete set null,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '60 days'
);
create table if not exists rv_magic (
  token uuid primary key default gen_random_uuid(),
  email text not null,
  invite text,
  consent boolean not null default false,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes',
  used_at timestamptz
);
create table if not exists rv_join_codes (
  code text primary key,
  profile_id uuid not null references rv_profiles(id) on delete cascade,
  expires_at timestamptz not null default now() + interval '10 minutes'
);
create table if not exists rv_mail_log (
  id bigserial primary key,
  email text,
  family_id uuid,
  kind text not null,
  ts timestamptz not null default now()
);
create table if not exists rv_config (k text primary key, v text not null);
insert into rv_config(k, v) values ('cron_secret', encode(extensions.gen_random_bytes(24), 'hex')) on conflict do nothing;

alter table rv_families enable row level security;
alter table rv_invites enable row level security;
alter table rv_magic enable row level security;
alter table rv_join_codes enable row level security;
alter table rv_mail_log enable row level security;
alter table rv_config enable row level security;

-- Famille existante (Guillaume) : tous les profils actuels y sont rattachés
insert into rv_families(email, is_admin, weekly, consent_at) values ('contact@guillaumejacques.fr', true, false, now()) on conflict (email) do nothing;
update rv_profiles set family_id = (select id from rv_families where email = 'contact@guillaumejacques.fr') where family_id is null;
update rv_plan set family_id = (select id from rv_families where email = 'contact@guillaumejacques.fr') where family_id is null;

-- ---------- Outils ----------
create or replace function rv_device_label(p text) returns text language sql immutable as $$
  select left(coalesce(nullif(trim(p), ''), 'Appareil'), 40) $$;

create or replace function rv_new_session(p_profile uuid, p_label text) returns uuid
language plpgsql security definer set search_path = public as $$
declare v uuid;
begin
  insert into rv_sessions(profile_id, label, last_seen, expires_at) values (p_profile, rv_device_label(p_label), now(), now() + interval '400 days') returning token into v;
  return v;
end $$;

create or replace function rv_plan_rows(p_family uuid) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id',id,'kind',kind,'day',day,'label',label,'skills',skills,'level',level,'error_code',error_code,'created_at',created_at) order by day nulls last, created_at), '[]'::json)
  from rv_plan where family_id = p_family and (kind='copie' or day >= (now() at time zone 'Europe/Paris')::date - 1);
$$;
drop function if exists rv_plan_rows();

-- ---------- Lecture / écriture de l'élève ----------
create or replace function rv_get_state(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_state jsonb;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null then return json_build_object('error','auth'); end if;
  update rv_sessions set last_seen = now() where token = p_token;
  select state into v_state from rv_state where profile_id = v_prof.id;
  return json_build_object('role', v_prof.role, 'name', v_prof.label, 'state', coalesce(v_state, '{}'::jsonb), 'plan', rv_plan_rows(v_prof.family_id));
end $$;

-- ---------- Tableau de bord parent (limité à sa famille) ----------
create or replace function rv_dashboard(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_out json; v_fam rv_families;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  update rv_sessions set last_seen = now() where token = p_token;
  select * into v_fam from rv_families where id = v_prof.family_id;
  select json_agg(json_build_object(
    'id', p.id, 'label', p.label, 'has_pin', p.pin4_hash is not null or p.pin_hash is not null,
    'state', coalesce(s.state, '{}'::jsonb), 'updated_at', s.updated_at,
    'devices', (select coalesce(json_agg(json_build_object('id', d.id, 'label', d.label, 'last', coalesce(d.last_seen, d.created_at)) order by d.created_at), '[]'::json)
               from rv_sessions d where d.profile_id = p.id and d.expires_at > now()),
    'totals', (select json_build_object('n', count(*), 'ok', count(*) filter (where correct), 'ms', coalesce(sum(ms),0), 'last', max(ts),
                 'n7', count(*) filter (where ts > now() - interval '7 days'), 'ok7', count(*) filter (where correct and ts > now() - interval '7 days'),
                 'lucky7', count(*) filter (where correct and conf = 'hasard' and ts > now() - interval '7 days'),
                 'surewrong7', count(*) filter (where not correct and conf = 'sure' and ts > now() - interval '7 days'),
                 'redac7', count(*) filter (where mode = 'redac' and ts > now() - interval '7 days'),
                 'redacok7', count(*) filter (where mode = 'redac' and correct and ts > now() - interval '7 days'))
               from rv_attempts a where a.profile_id = p.id),
    'errors', (select coalesce(json_agg(e order by e.n desc), '[]'::json) from (select error_code as code, count(*) as n from rv_attempts a
               where a.profile_id = p.id and error_code is not null and ts > now() - interval '30 days' group by error_code) e),
    'days', (select coalesce(json_agg(d order by d.day), '[]'::json) from (select (ts at time zone 'Europe/Paris')::date as day, count(*) as n, sum(ms) as ms
               from rv_attempts a where a.profile_id = p.id and ts > now() - interval '14 days' group by 1) d),
    'recent', (select coalesce(json_agg(r), '[]'::json) from (select ts, mode, skill, level, correct, tries, hints, error_code, answer, question, conf
               from rv_attempts a where a.profile_id = p.id order by ts desc limit 25) r)
  ) order by p.created_at) into v_out
  from rv_profiles p left join rv_state s on s.profile_id = p.id where p.role = 'student' and p.family_id = v_prof.family_id;
  return json_build_object('students', coalesce(v_out, '[]'::json), 'plan', rv_plan_rows(v_prof.family_id),
    'family', json_build_object('email', v_fam.email, 'notify', v_fam.notify, 'weekly', v_fam.weekly, 'admin', v_fam.is_admin),
    'invites', case when v_fam.is_admin then (select coalesce(json_agg(json_build_object('code', code, 'note', note, 'used', used_at is not null, 'expires', expires_at) order by created_at desc), '[]'::json)
                 from rv_invites where family_id = v_fam.id) else null end);
end $$;

create or replace function rv_plan_add(p_token uuid, p_kind text, p_day date, p_label text, p_skills text[], p_level integer, p_error_code text) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if p_kind not in ('exam','copie') then return json_build_object('error','kind'); end if;
  insert into rv_plan(kind, day, label, skills, level, error_code, family_id)
  values (p_kind, p_day, left(p_label,120), coalesce(p_skills,'{}'), least(greatest(coalesce(p_level,2),1),3), left(p_error_code,24), v_prof.family_id) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function rv_plan_del(p_token uuid, p_id uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  delete from rv_plan where id = p_id and family_id = v_prof.family_id;
  return json_build_object('ok', true);
end $$;

-- ---------- Connexion du parent par lien reçu par e-mail ----------
-- appelée uniquement par la fonction d'envoi (rôle service)
create or replace function rv_magic_create(p_email text, p_invite text, p_consent boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email)); v_exists boolean; v_tok uuid; v_inv rv_invites;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 160 then return json_build_object('error','email'); end if;
  if (select count(*) from rv_mail_log where kind = 'magic' and email = v_email and ts > now() - interval '1 hour') >= 3 then return json_build_object('error','wait'); end if;
  if (select count(*) from rv_mail_log where kind = 'magic' and ts > now() - interval '1 hour') >= 40 then return json_build_object('error','wait'); end if;
  select exists(select 1 from rv_families where email = v_email) into v_exists;
  if not v_exists then
    if coalesce(trim(p_invite), '') = '' then return json_build_object('error','need_invite'); end if;
    select * into v_inv from rv_invites where code = upper(trim(p_invite)) and used_at is null and expires_at > now();
    if v_inv.code is null then return json_build_object('error','bad_invite'); end if;
    if not coalesce(p_consent, false) then return json_build_object('error','consent'); end if;
  end if;
  insert into rv_magic(email, invite, consent) values (v_email, upper(nullif(trim(p_invite), '')), coalesce(p_consent, false)) returning token into v_tok;
  insert into rv_mail_log(email, kind) values (v_email, 'magic');
  return json_build_object('token', v_tok, 'email', v_email, 'new', not v_exists);
end $$;

create or replace function rv_magic_use(p_token uuid, p_label text) returns json
language plpgsql security definer set search_path = public as $$
declare v_m rv_magic; v_fam uuid; v_par uuid; v_tok uuid;
begin
  select * into v_m from rv_magic where token = p_token for update;
  if v_m.token is null then return json_build_object('error','bad_link'); end if;
  if v_m.used_at is not null and v_m.used_at < now() - interval '2 minutes' then return json_build_object('error','used_link'); end if;
  if v_m.expires_at < now() then return json_build_object('error','old_link'); end if;
  select id into v_fam from rv_families where email = v_m.email;
  if v_fam is null then
    if not exists(select 1 from rv_invites where code = v_m.invite and used_at is null and expires_at > now()) or not v_m.consent then
      return json_build_object('error','bad_invite');
    end if;
    insert into rv_families(email, consent_at) values (v_m.email, now()) returning id into v_fam;
    update rv_invites set used_at = now(), used_by = v_fam where code = v_m.invite;
  end if;
  select id into v_par from rv_profiles where family_id = v_fam and role = 'parent' order by created_at limit 1;
  if v_par is null then
    insert into rv_profiles(label, role, family_id) values ('Parent', 'parent', v_fam) returning id into v_par;
  end if;
  update rv_magic set used_at = coalesce(used_at, now()) where token = p_token;
  v_tok := rv_new_session(v_par, p_label);
  return json_build_object('token', v_tok, 'role', 'parent', 'name', 'Parent');
end $$;

-- ---------- Enfants ----------
create or replace function rv_child_add(p_token uuid, p_name text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if coalesce(trim(p_name), '') = '' then return json_build_object('error','name'); end if;
  if p_pin is not null and p_pin !~ '^\d{4}$' then return json_build_object('error','pin'); end if;
  if (select count(*) from rv_profiles where family_id = v_prof.family_id and role = 'student') >= 6 then return json_build_object('error','too_many'); end if;
  insert into rv_profiles(label, role, family_id, pin4_hash)
  values (left(trim(p_name), 30), 'student', v_prof.family_id, case when p_pin is null then null else crypt(p_pin, gen_salt('bf')) end) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function rv_child_set(p_token uuid, p_child uuid, p_name text, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if p_pin is not null and p_pin !~ '^\d{4}$' then return json_build_object('error','pin'); end if;
  update rv_profiles set label = coalesce(left(nullif(trim(p_name), ''), 30), label),
    pin4_hash = case when p_pin is null then pin4_hash else crypt(p_pin, gen_salt('bf')) end
  where id = p_child and family_id = v_prof.family_id and role = 'student';
  return json_build_object('ok', found);
end $$;

create or replace function rv_child_link(p_token uuid, p_child uuid, p_renew boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_sec uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if coalesce(p_renew, false) then
    update rv_profiles set join_secret = gen_random_uuid() where id = p_child and family_id = v_prof.family_id and role = 'student';
  end if;
  select join_secret into v_sec from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student';
  if v_sec is null then return json_build_object('error','child'); end if;
  return json_build_object('secret', v_sec);
end $$;

create or replace function rv_child_code(p_token uuid, p_child uuid) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_prof rv_profiles; v_code text; a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; b bytea; i int;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if not exists(select 1 from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student') then return json_build_object('error','child'); end if;
  delete from rv_join_codes where expires_at < now() or profile_id = p_child;
  loop
    b := gen_random_bytes(6); v_code := '';
    for i in 0..5 loop v_code := v_code || substr(a, (get_byte(b, i) % 24) + 1, 1); end loop;
    exit when not exists(select 1 from rv_join_codes where code = v_code);
  end loop;
  insert into rv_join_codes(code, profile_id) values (v_code, p_child);
  return json_build_object('code', v_code, 'minutes', 10);
end $$;

create or replace function rv_child_del(p_token uuid, p_child uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  delete from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student';
  return json_build_object('ok', found);
end $$;

-- ouverture de l'appli de l'enfant sur un appareil : lien (une fois) ou code de 6 lettres
create or replace function rv_join(p_secret uuid, p_label text) returns json
language plpgsql security definer set search_path = public as $$
declare v_p rv_profiles;
begin
  select * into v_p from rv_profiles where join_secret = p_secret and role = 'student';
  if v_p.id is null then return json_build_object('error','bad_link'); end if;
  return json_build_object('token', rv_new_session(v_p.id, p_label), 'role', 'student', 'name', v_p.label, 'pin', v_p.pin4_hash is not null);
end $$;

create or replace function rv_join_code(p_code text, p_label text) returns json
language plpgsql security definer set search_path = public as $$
declare v_c rv_join_codes; v_p rv_profiles;
begin
  if (select count(*) from rv_login_fails where ts > now() - interval '15 minutes') >= 15 then return json_build_object('error','locked'); end if;
  select * into v_c from rv_join_codes where code = upper(regexp_replace(coalesce(p_code, ''), '\s', '', 'g')) and expires_at > now();
  if v_c.code is null then
    insert into rv_login_fails default values;
    return json_build_object('error','bad_code');
  end if;
  delete from rv_join_codes where code = v_c.code;
  select * into v_p from rv_profiles where id = v_c.profile_id;
  return json_build_object('token', rv_new_session(v_p.id, p_label), 'role', 'student', 'name', v_p.label, 'pin', v_p.pin4_hash is not null);
end $$;

-- appareil partagé : l'enfant tape son code à 4 chiffres
create or replace function rv_unlock(p_token uuid, p_pin text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_prof rv_profiles;
begin
  if (select count(*) from rv_login_fails where ts > now() - interval '15 minutes') >= 15 then return json_build_object('error','locked'); end if;
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null then return json_build_object('error','auth'); end if;
  if v_prof.pin4_hash is null or v_prof.pin4_hash = crypt(coalesce(p_pin, ''), v_prof.pin4_hash) then return json_build_object('ok', true); end if;
  insert into rv_login_fails default values;
  return json_build_object('error','bad_pin');
end $$;

create or replace function rv_device_del(p_token uuid, p_device bigint) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  delete from rv_sessions s using rv_profiles p where s.id = p_device and p.id = s.profile_id and p.family_id = v_prof.family_id and p.role = 'student';
  return json_build_object('ok', found);
end $$;

-- ---------- Réglages, invitations, suppression ----------
create or replace function rv_family_set(p_token uuid, p_notify text, p_weekly boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if p_notify is not null and p_notify not in ('each','evening','off') then return json_build_object('error','notify'); end if;
  update rv_families set notify = coalesce(p_notify, notify), weekly = coalesce(p_weekly, weekly) where id = v_prof.family_id;
  return json_build_object('ok', true);
end $$;

create or replace function rv_invite_create(p_token uuid, p_note text) returns json
language plpgsql security definer set search_path = public, extensions as $$
declare v_prof rv_profiles; v_code text; a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; b bytea; i int;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' or not (select is_admin from rv_families where id = v_prof.family_id) then return json_build_object('error','auth'); end if;
  loop
    b := gen_random_bytes(8); v_code := '';
    for i in 0..7 loop v_code := v_code || substr(a, (get_byte(b, i) % 32) + 1, 1); end loop;
    exit when not exists(select 1 from rv_invites where code = v_code);
  end loop;
  insert into rv_invites(code, family_id, note) values (v_code, v_prof.family_id, left(nullif(trim(p_note), ''), 60));
  return json_build_object('code', v_code);
end $$;

create or replace function rv_family_delete(p_token uuid, p_confirm text) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_fam rv_families;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_fam from rv_families where id = v_prof.family_id;
  if v_fam.is_admin then return json_build_object('error','admin'); end if;
  if lower(trim(coalesce(p_confirm, ''))) <> v_fam.email then return json_build_object('error','confirm'); end if;
  delete from rv_families where id = v_fam.id;  -- profils, états, réponses, appareils et contrôles supprimés en cascade
  return json_build_object('ok', true);
end $$;

-- ---------- E-mails (rôle service uniquement) ----------
create or replace function rv_notify_session(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_fam rv_families;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('send', false); end if;
  select * into v_fam from rv_families where id = v_prof.family_id;
  if v_fam.notify <> 'each' then return json_build_object('send', false); end if;
  if v_prof.last_notified is not null and v_prof.last_notified > now() - interval '30 minutes' then return json_build_object('send', false); end if;
  update rv_profiles set last_notified = now() where id = v_prof.id;
  insert into rv_mail_log(family_id, email, kind) values (v_fam.id, v_fam.email, 'session');
  return json_build_object('send', true, 'to', v_fam.email, 'child', coalesce((select state->>'pseudo' from rv_state where profile_id = v_prof.id), v_prof.label));
end $$;

create or replace function rv_digest(p_kind text) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x), '[]'::json) from (
    select f.email, p.id, coalesce(s.state->>'pseudo', p.label) as child,
      count(a.id) as n, count(a.id) filter (where a.correct) as ok, coalesce(sum(a.ms), 0) as ms,
      count(distinct (a.ts at time zone 'Europe/Paris')::date) as days,
      (select coalesce(json_agg(e), '[]'::json) from (select error_code as code, count(*) as n from rv_attempts e2
        where e2.profile_id = p.id and e2.error_code is not null and e2.error_code not in ('nsp','hasard')
          and e2.ts > case when p_kind = 'weekly' then now() - interval '7 days' else date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' end
        group by 1 order by 2 desc limit 3) e) as errors,
      jsonb_array_length(coalesce(s.state->'review', '[]'::jsonb)) as review
    from rv_families f join rv_profiles p on p.family_id = f.id and p.role = 'student'
    left join rv_state s on s.profile_id = p.id
    left join rv_attempts a on a.profile_id = p.id and a.ts > case when p_kind = 'weekly' then now() - interval '7 days' else date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' end
    where (p_kind = 'evening' and f.notify = 'evening') or (p_kind = 'weekly' and f.weekly)
    group by f.email, p.id, s.state, p.label
    having p_kind = 'weekly' or count(a.id) > 0
  ) x;
$$;

-- droits : les fonctions d'e-mail ne sont pas accessibles depuis le navigateur
revoke all on function rv_magic_create(text, text, boolean) from public, anon, authenticated;
revoke all on function rv_notify_session(uuid) from public, anon, authenticated;
revoke all on function rv_digest(text) from public, anon, authenticated;
revoke all on function rv_new_session(uuid, text) from public, anon, authenticated;
revoke all on function rv_plan_rows(uuid) from public, anon, authenticated;
grant execute on function rv_magic_create(text, text, boolean), rv_notify_session(uuid), rv_digest(text) to service_role;

-- ---------- 30/10 : code à 6 chiffres dans l'e-mail de connexion (appli installée sur l'écran d'accueil) ----------
-- migration Supabase « magic_code_appli_installee » : colonnes rv_magic.code / tries,
-- rv_magic_create renvoie aussi `code`, nouvelle RPC publique rv_magic_code(p_email, p_code, p_label)
-- (5 essais max par e-mail, puis il faut redemander un e-mail ; réutilise rv_magic_use).
