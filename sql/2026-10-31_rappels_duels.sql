-- 31/10 : rappels sur le téléphone de l'enfant (Web Push) et défis entre amis.
-- Rappels : l'enfant autorise les notifications sur son appareil ; seul le parent peut les couper (rv_profiles.push_ok).
-- Envoi par la fonction rv-push, appelée chaque jour à 17 h (Paris) par la tâche pg_cron rv-push-daily, seulement si des révisions attendent
-- et que l'enfant n'a encore rien fait aujourd'hui (au plus un rappel par jour).

alter table rv_profiles add column if not exists push_ok boolean not null default true;
alter table rv_profiles add column if not exists push_last date;

create table if not exists rv_push (
  token uuid primary key,                -- jeton de session de l'appareil (rv_sessions.token)
  profile_id uuid not null,
  status text not null,                -- ok | denied | default | unsupported | noinstall
  endpoint text, p256dh text, auth text,
  updated_at timestamptz not null default now(), sent_at timestamptz, fails int not null default 0
);
alter table rv_push enable row level security;
create index if not exists rv_push_profile on rv_push(profile_id);

create table if not exists rv_duels (
  id uuid primary key default gen_random_uuid(),
  a uuid not null,   -- celui qui lance le défi (joue en premier)
  b uuid not null,
  seed int not null, skills text[] not null default '{}',
  a_score int, a_ms int, b_score int, b_ms int,
  notified boolean not null default false,
  created_at timestamptz not null default now()
);
alter table rv_duels enable row level security;
create index if not exists rv_duels_a on rv_duels(a);
create index if not exists rv_duels_b on rv_duels(b);

-- ---------- Rappels : côté élève ----------
create or replace function rv_push_sub(p_token uuid, p_status text, p_sub jsonb default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_ep text := p_sub->>'endpoint';
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role not in ('student','test') then return json_build_object('error','auth'); end if;
  if p_status not in ('ok','denied','default','unsupported','noinstall') then return json_build_object('error','status'); end if;
  if p_status = 'ok' and (v_ep is null or left(v_ep, 8) <> 'https://' or length(v_ep) > 1000) then return json_build_object('error','sub'); end if;
  if p_status = 'ok' then update rv_push set status = 'moved', endpoint = null where endpoint = v_ep and token <> p_token; end if;
  insert into rv_push(token, profile_id, status, endpoint, p256dh, auth, updated_at)
  values (p_token, v_prof.id, p_status,
          case when p_status = 'ok' then v_ep end,
          case when p_status = 'ok' then left(p_sub->'keys'->>'p256dh', 200) end,
          case when p_status = 'ok' then left(p_sub->'keys'->>'auth', 100) end, now())
  on conflict (token) do update set status = excluded.status, endpoint = excluded.endpoint, p256dh = excluded.p256dh,
    auth = excluded.auth, updated_at = now(), fails = case when rv_push.endpoint is distinct from excluded.endpoint then 0 else rv_push.fails end;
  return json_build_object('ok', true, 'push_ok', v_prof.push_ok);
end $$;

-- ---------- Rappels : côté parent ----------
create or replace function rv_push_parent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  return json_build_object('children', (select coalesce(json_agg(json_build_object('id', p.id, 'push_ok', p.push_ok, 'last', p.push_last,
    'devices', (select coalesce(json_agg(json_build_object('label', s.label, 'status', x.status, 'at', x.updated_at, 'sent', x.sent_at) order by x.updated_at desc), '[]'::json)
                from rv_push x join rv_sessions s on s.token = x.token where x.profile_id = p.id and x.status not in ('moved','gone') and s.expires_at > now()))), '[]'::json)
    from rv_profiles p where p.family_id = v_prof.family_id and p.role = 'student'));
end $$;

create or replace function rv_push_set(p_token uuid, p_child uuid, p_ok boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  update rv_profiles set push_ok = coalesce(p_ok, true) where id = p_child and family_id = v_prof.family_id and role = 'student';
  if not found then return json_build_object('error','child'); end if;
  return json_build_object('ok', true);
end $$;

-- ---------- Rappels : réservé au serveur (fonction rv-push) ----------
create or replace function rv_push_targets(p_secret text, p_kind text, p_token uuid default null, p_child uuid default null)
returns json language plpgsql security definer set search_path = public as $$
declare v_today date := (now() at time zone 'Europe/Paris')::date; v_d0 timestamptz := ((now() at time zone 'Europe/Paris')::date)::timestamp at time zone 'Europe/Paris';
  v_prof rv_profiles;
begin
  if p_secret is null or p_secret is distinct from (select v from rv_config where k = 'cron_secret') then return json_build_object('error','secret'); end if;
  if p_kind = 'test' then
    v_prof := rv_profile_from_token(p_token);
    if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
    if not exists (select 1 from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student') then return json_build_object('error','child'); end if;
  end if;
  return (select coalesce(json_agg(t), '[]'::json) from (
    select p.id as profile_id, p.label as name, p.gender,
      (select count(*) from jsonb_array_elements(case when jsonb_typeof(st.state->'review') = 'array' then st.state->'review' else '[]'::jsonb end) r
         where r->>'due' <= v_today::text)::int as due,
      (select json_agg(json_build_object('token', x.token, 'endpoint', x.endpoint, 'p256dh', x.p256dh, 'auth', x.auth))
         from rv_push x join rv_sessions s on s.token = x.token where x.profile_id = p.id and x.status = 'ok' and x.endpoint is not null and s.expires_at > now()) as subs
    from rv_profiles p left join rv_state st on st.profile_id = p.id
    where p.role = 'student'
      and ((p_kind = 'test' and p.id = p_child)
        or (p_kind = 'daily' and p.push_ok and p.push_last is distinct from v_today
            and not exists (select 1 from rv_attempts a where a.profile_id = p.id and a.ts >= v_d0)))
  ) t where t.subs is not null and (p_kind = 'test' or t.due > 0));
end $$;

create or replace function rv_push_mark(p_secret text, p_profile uuid, p_sent uuid[], p_gone uuid[], p_daily boolean default true)
returns json language plpgsql security definer set search_path = public as $$
begin
  if p_secret is null or p_secret is distinct from (select v from rv_config where k = 'cron_secret') then return json_build_object('error','secret'); end if;
  if p_daily then update rv_profiles set push_last = (now() at time zone 'Europe/Paris')::date where id = p_profile; end if;
  update rv_push set sent_at = now(), fails = 0 where token = any(coalesce(p_sent, '{}'));
  update rv_push set status = 'gone', endpoint = null where token = any(coalesce(p_gone, '{}'));
  return json_build_object('ok', true);
end $$;

-- ---------- Défis entre amis ----------
create or replace function rv_duel_mates(p_token uuid)
returns table(id uuid, name text) language sql stable security definer set search_path = public as $$
  select distinct p.id, rv_team_display(p) from rv_team_members m1
    join rv_team_members m2 on m2.team_id = m1.team_id and m2.profile_id <> m1.profile_id
    join rv_profiles p on p.id = m2.profile_id join rv_families f on f.id = p.family_id
  where m1.profile_id = (rv_profile_from_token(p_token)).id and p.role = 'student' and f.teams_ok;
$$;

create or replace function rv_duel_mine(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_ok boolean;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  select teams_ok into v_ok from rv_families where id = v_prof.family_id;
  if not coalesce(v_ok, false) then return json_build_object('allowed', false, 'mates', '[]'::json, 'duels', '[]'::json); end if;
  return json_build_object('allowed', true,
    'mates', (select coalesce(json_agg(json_build_object('id', m.id, 'name', m.name) order by m.name), '[]'::json) from rv_duel_mates(p_token) m),
    'duels', (select coalesce(json_agg(json_build_object('id', d.id, 'mine', d.a = v_prof.id, 'other', rv_team_display(o), 'seed', d.seed, 'skills', d.skills,
        'my', case when d.a = v_prof.id then d.a_score else d.b_score end, 'my_ms', case when d.a = v_prof.id then d.a_ms else d.b_ms end,
        'their', case when (case when d.a = v_prof.id then d.a_score else d.b_score end) is null then null when d.a = v_prof.id then d.b_score else d.a_score end,
        'their_ms', case when (case when d.a = v_prof.id then d.a_score else d.b_score end) is null then null when d.a = v_prof.id then d.b_ms else d.a_ms end,
        'at', d.created_at) order by d.created_at desc), '[]'::json)
      from rv_duels d join rv_profiles o on o.id = case when d.a = v_prof.id then d.b else d.a end
      join rv_families fo on fo.id = o.family_id
      where (d.a = v_prof.id or d.b = v_prof.id) and d.created_at > now() - interval '14 days' and fo.teams_ok));
end $$;

create or replace function rv_duel_create(p_token uuid, p_to uuid, p_seed int, p_skills text[], p_score int, p_ms int)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  if not coalesce((select teams_ok from rv_families where id = v_prof.family_id), false) then return json_build_object('error','off'); end if;
  if not exists (select 1 from rv_duel_mates(p_token) m where m.id = p_to) then return json_build_object('error','mate'); end if;
  if (select count(*) from rv_duels where a = v_prof.id and created_at > now() - interval '1 day') >= 10 then return json_build_object('error','many'); end if;
  if (select count(*) from rv_duels where a = v_prof.id and b = p_to and b_score is null and created_at > now() - interval '7 days') >= 3 then return json_build_object('error','pending'); end if;
  insert into rv_duels(a, b, seed, skills, a_score, a_ms)
  values (v_prof.id, p_to, p_seed, (select coalesce(array_agg(left(s, 8)), '{}') from unnest(p_skills[1:8]) s), least(greatest(p_score, 0), 5), least(greatest(p_ms, 0), 3600000))
  returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function rv_duel_score(p_token uuid, p_duel uuid, p_score int, p_ms int)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; d rv_duels;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  update rv_duels set b_score = least(greatest(p_score, 0), 5), b_ms = least(greatest(p_ms, 0), 3600000)
    where id = p_duel and b = v_prof.id and b_score is null returning * into d;
  if d.id is null then return json_build_object('error','duel'); end if;
  return json_build_object('ok', true, 'their', d.a_score, 'their_ms', d.a_ms);
end $$;

-- Prévenir l'ami défié (réservé au serveur) : une seule fois par défi, dans les 10 minutes
create or replace function rv_duel_push_target(p_secret text, p_token uuid, p_duel uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; d rv_duels;
begin
  if p_secret is null or p_secret is distinct from (select v from rv_config where k = 'cron_secret') then return json_build_object('error','secret'); end if;
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null then return json_build_object('error','auth'); end if;
  update rv_duels set notified = true where id = p_duel and a = v_prof.id and not notified and created_at > now() - interval '10 minutes' returning * into d;
  if d.id is null then return json_build_object('error','duel'); end if;
  return (select json_build_object('from', rv_team_display(v_prof), 'gender', v_prof.gender, 'subs',
      (select json_agg(json_build_object('token', x.token, 'endpoint', x.endpoint, 'p256dh', x.p256dh, 'auth', x.auth))
       from rv_push x join rv_sessions s on s.token = x.token join rv_profiles p on p.id = x.profile_id
       where x.profile_id = d.b and p.push_ok and x.status = 'ok' and x.endpoint is not null and s.expires_at > now())));
end $$;

-- ---------- Cron : rappel quotidien à 17 h (Paris), tâche pg_cron à part ----------
create or replace function rv_push_tick()
returns void language plpgsql security definer set search_path = public, extensions as $function$
declare v_loc timestamp := now() at time zone 'Europe/Paris'; v_sec text;
begin
  if extract(hour from v_loc) <> 17 then return; end if;
  select v into v_sec from rv_config where k = 'cron_secret';
  perform net.http_post(url := 'https://mqxotaaqhonxbficrkgc.supabase.co/functions/v1/rv-push', body := jsonb_build_object('action','daily'),
    headers := jsonb_build_object('Content-Type','application/json','x-cron', v_sec));
end $function$;
select cron.schedule('rv-push-daily', '2 * * * *', 'select rv_push_tick()');
