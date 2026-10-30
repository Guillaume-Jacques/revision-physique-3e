-- Équipes entre élèves et classement de la semaine (30/10)
-- Principe : un parent autorise une fois les équipes pour sa famille (rv_families.teams_ok).
-- Un élève crée une équipe (code de 6 lettres) ou en rejoint une ; 8 élèves au plus par équipe.
-- Seuls le prénom, l'initiale du nom (saisie par le parent) et les points de la semaine sont visibles des autres.

alter table rv_families add column if not exists teams_ok boolean not null default false;
alter table rv_profiles add column if not exists initial text;

create table if not exists rv_teams (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  owner uuid references rv_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists rv_team_members (
  team_id uuid not null references rv_teams(id) on delete cascade,
  profile_id uuid not null references rv_profiles(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (team_id, profile_id)
);
create index if not exists rv_team_members_profile on rv_team_members(profile_id);
alter table rv_teams enable row level security;
alter table rv_team_members enable row level security;

-- Points d'effort sur une période : 10 par exercice réussi du premier coup sans aide, 5 sinon,
-- rien pour une réponse « au hasard » ; 150 points d'exercices au plus par jour ;
-- +20 par jour avec au moins 5 exercices (régularité).
create or replace function rv_team_points(p_profile uuid, p_from timestamptz, p_to timestamptz)
returns int language sql stable security definer set search_path = public as $$
  with a as (
    select (ts at time zone 'Europe/Paris')::date as d,
      case when correct and coalesce(conf,'') <> 'hasard' and coalesce(error_code,'') <> 'hasard'
           then case when coalesce(tries,1) <= 1 and coalesce(hints,0) = 0 then 10 else 5 end else 0 end as p
    from rv_attempts where profile_id = p_profile and ts >= p_from and ts < p_to
  ), j as (select d, least(sum(p), 150) + case when count(*) >= 5 then 20 else 0 end as pts from a group by d)
  select coalesce(sum(pts), 0)::int from j;
$$;
revoke all on function rv_team_points(uuid, timestamptz, timestamptz) from public, anon, authenticated;

create or replace function rv_team_display(p rv_profiles)
returns text language sql immutable as $$
  select p.label || coalesce(' ' || upper(left(nullif(trim(p.initial), ''), 1)) || '.', '');
$$;

-- Classement d'une équipe (pour la semaine en cours, lundi 0 h heure de Paris)
create or replace function rv_team_board(p_team uuid, p_me uuid)
returns json language plpgsql stable security definer set search_path = public as $$
declare w0 timestamptz := (date_trunc('week', now() at time zone 'Europe/Paris')) at time zone 'Europe/Paris';
begin
  return (select coalesce(json_agg(x order by x.pts desc, x.name), '[]'::json) from (
    select rv_team_display(p) as name, p.id = p_me as me, p.id as pid,
      rv_team_points(p.id, w0, now() + interval '1 minute') as pts,
      rv_team_points(p.id, w0 - interval '7 days', w0) as prev
    from rv_team_members m join rv_profiles p on p.id = m.profile_id
    where m.team_id = p_team and p.role = 'student') x);
end $$;
revoke all on function rv_team_board(uuid, uuid) from public, anon, authenticated;

-- Côté élève : mes équipes et leurs classements
create or replace function rv_team_mine(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_ok boolean;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  select teams_ok into v_ok from rv_families where id = v_prof.family_id;
  return json_build_object('allowed', coalesce(v_ok, false), 'teams', (
    select coalesce(json_agg(json_build_object('id', t.id, 'code', t.code, 'name', t.name, 'owner', t.owner = v_prof.id,
      'board', (select json_agg(json_build_object('name', b->>'name', 'me', (b->>'me')::boolean, 'pts', (b->>'pts')::int, 'prev', (b->>'prev')::int))
                from json_array_elements(rv_team_board(t.id, v_prof.id)) b)) order by m.joined_at), '[]'::json)
    from rv_team_members m join rv_teams t on t.id = m.team_id where m.profile_id = v_prof.id));
end $$;

create or replace function rv_team_code()
returns text language plpgsql volatile set search_path = public as $$
declare a text := 'ABCDEFGHJKLMNPQRSTUVWXYZ'; c text;
begin
  loop
    c := '';
    for i in 1..6 loop c := c || substr(a, 1 + floor(random() * length(a))::int, 1); end loop;
    exit when not exists (select 1 from rv_teams where code = c);
  end loop;
  return c;
end $$;
revoke all on function rv_team_code() from public, anon, authenticated;

-- Ajout d'un élève dans une équipe (contrôles communs)
create or replace function rv_team_add(p_child rv_profiles, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_team rv_teams; n int;
begin
  select * into v_team from rv_teams where code = upper(regexp_replace(coalesce(p_code,''), '[^A-Za-z]', '', 'g'));
  if v_team.id is null then return json_build_object('error','code'); end if;
  if exists (select 1 from rv_team_members where team_id = v_team.id and profile_id = p_child.id) then
    return json_build_object('ok', true, 'name', v_team.name, 'already', true); end if;
  select count(*) into n from rv_team_members where team_id = v_team.id;
  if n >= 8 then return json_build_object('error','full'); end if;
  if (select count(*) from rv_team_members where profile_id = p_child.id) >= 5 then return json_build_object('error','many'); end if;
  insert into rv_team_members(team_id, profile_id) values (v_team.id, p_child.id);
  return json_build_object('ok', true, 'name', v_team.name);
end $$;
revoke all on function rv_team_add(rv_profiles, text) from public, anon, authenticated;

create or replace function rv_team_create(p_token uuid, p_name text)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_code text; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  if not coalesce((select teams_ok from rv_families where id = v_prof.family_id), false) then return json_build_object('error','off'); end if;
  if (select count(*) from rv_teams where owner = v_prof.id) >= 3 then return json_build_object('error','many'); end if;
  v_code := rv_team_code();
  insert into rv_teams(code, name, owner) values (v_code, coalesce(left(nullif(trim(p_name), ''), 30), 'L’équipe de ' || v_prof.label), v_prof.id) returning id into v_id;
  insert into rv_team_members(team_id, profile_id) values (v_id, v_prof.id);
  return json_build_object('ok', true, 'code', v_code);
end $$;

create or replace function rv_team_join(p_token uuid, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  if not coalesce((select teams_ok from rv_families where id = v_prof.family_id), false) then return json_build_object('error','off'); end if;
  return rv_team_add(v_prof, p_code);
end $$;

create or replace function rv_team_leave(p_token uuid, p_team uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  delete from rv_team_members where team_id = p_team and profile_id = v_prof.id;
  delete from rv_teams t where t.id = p_team and not exists (select 1 from rv_team_members m where m.team_id = t.id);
  return json_build_object('ok', true);
end $$;

-- Côté parent : réglage, initiale, équipes de chaque enfant, retrait, inscription avec un code
create or replace function rv_team_parent(p_token uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  return json_build_object('allowed', (select teams_ok from rv_families where id = v_prof.family_id), 'children', (
    select coalesce(json_agg(json_build_object('id', c.id, 'initial', c.initial, 'display', rv_team_display(c), 'teams', (
      select coalesce(json_agg(json_build_object('id', t.id, 'code', t.code, 'name', t.name,
        'board', (select json_agg(json_build_object('name', b->>'name', 'me', (b->>'me')::boolean, 'pts', (b->>'pts')::int, 'prev', (b->>'prev')::int))
                  from json_array_elements(rv_team_board(t.id, c.id)) b)) order by m.joined_at), '[]'::json)
      from rv_team_members m join rv_teams t on t.id = m.team_id where m.profile_id = c.id))), '[]'::json)
    from rv_profiles c where c.family_id = v_prof.family_id and c.role = 'student'));
end $$;

create or replace function rv_team_allow(p_token uuid, p_ok boolean)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  update rv_families set teams_ok = coalesce(p_ok, false) where id = v_prof.family_id;
  if not coalesce(p_ok, false) then
    delete from rv_team_members m using rv_profiles c where c.id = m.profile_id and c.family_id = v_prof.family_id;
    delete from rv_teams t where not exists (select 1 from rv_team_members m where m.team_id = t.id);
  end if;
  return json_build_object('ok', true);
end $$;

create or replace function rv_team_initial(p_token uuid, p_child uuid, p_initial text)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  update rv_profiles set initial = nullif(upper(left(regexp_replace(coalesce(p_initial,''), '[^[:alpha:]]', '', 'g'), 1)), '')
  where id = p_child and family_id = v_prof.family_id and role = 'student';
  return json_build_object('ok', found);
end $$;

create or replace function rv_team_kick(p_token uuid, p_child uuid, p_team uuid)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  delete from rv_team_members m using rv_profiles c
    where m.team_id = p_team and m.profile_id = p_child and c.id = p_child and c.family_id = v_prof.family_id;
  delete from rv_teams t where t.id = p_team and not exists (select 1 from rv_team_members m where m.team_id = t.id);
  return json_build_object('ok', true);
end $$;

-- Le parent inscrit son enfant avec un code reçu (cela vaut autorisation des équipes pour sa famille)
create or replace function rv_team_join_child(p_token uuid, p_child uuid, p_code text)
returns json language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_child rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_child from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student';
  if v_child.id is null then return json_build_object('error','child'); end if;
  update rv_families set teams_ok = true where id = v_prof.family_id;
  return rv_team_add(v_child, p_code);
end $$;

grant execute on function rv_team_mine(uuid), rv_team_create(uuid, text), rv_team_join(uuid, text), rv_team_leave(uuid, uuid),
  rv_team_parent(uuid), rv_team_allow(uuid, boolean), rv_team_initial(uuid, uuid, text), rv_team_kick(uuid, uuid, uuid),
  rv_team_join_child(uuid, uuid, text) to anon;

-- Version installée le 30/10 (sans suppression) : rv_team_allow change seulement teams_ok,
-- et rv_team_board n'affiche que les élèves dont la famille a teams_ok = true.
-- rv_team_leave et rv_team_kick restent à installer (confirmation Supabase requise).
