-- Deux parents (ou plus) pour suivre les mêmes enfants.
-- Chaque parent = un profil 'parent' de la famille, avec sa propre adresse e-mail et ses propres réglages d'e-mails.
-- Le « parent principal » est celui dont l'adresse est rv_families.email (créateur de l'espace).

alter table rv_profiles add column if not exists email text;
alter table rv_profiles add column if not exists notify text;
alter table rv_profiles add column if not exists weekly boolean;
alter table rv_profiles add column if not exists joined_at timestamptz;
alter table rv_profiles add column if not exists invited_by uuid;
create unique index if not exists rv_profiles_email_uq on rv_profiles (email) where email is not null;

-- Reprise : le premier profil parent de chaque famille devient le parent principal.
update rv_profiles p set email = f.email, notify = f.notify, weekly = f.weekly, joined_at = coalesce(p.created_at, now())
from rv_families f
where p.id = (select id from rv_profiles x where x.family_id = f.id and x.role = 'parent' order by created_at limit 1)
  and p.email is null;

-- Adresse déjà utilisée par un espace (parent principal ou second parent) ?
create or replace function rv_email_used(p_email text) returns uuid language sql stable security definer set search_path = public as $$
  select coalesce((select family_id from rv_profiles where email = lower(trim(p_email)) and role = 'parent' limit 1),
                  (select id from rv_families where email = lower(trim(p_email)) limit 1));
$$;

create or replace function rv_is_owner(p rv_profiles) returns boolean language sql stable security definer set search_path = public as $$
  select p.role = 'parent' and p.email is not null and p.email = (select email from rv_families where id = p.family_id);
$$;

-- Demande de code : une adresse de second parent est une adresse connue (pas de case de consentement).
create or replace function rv_magic_create(p_email text, p_invite text, p_consent boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_email text := lower(trim(p_email)); v_exists boolean; v_tok uuid; v_code text;
begin
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 160 then return json_build_object('error','email'); end if;
  if (select count(*) from rv_mail_log where kind = 'magic' and email = v_email and ts > now() - interval '1 hour') >= 3 then return json_build_object('error','wait'); end if;
  if (select count(*) from rv_mail_log where kind = 'magic' and ts > now() - interval '1 hour') >= 40 then return json_build_object('error','wait'); end if;
  v_exists := rv_email_used(v_email) is not null;
  if not v_exists and not coalesce(p_consent, false) then return json_build_object('error','need_consent'); end if;
  v_code := lpad((floor(random() * 1000000))::int::text, 6, '0');
  insert into rv_magic(email, invite, consent, code) values (v_email, upper(nullif(trim(p_invite), '')), coalesce(p_consent, false), v_code) returning token into v_tok;
  insert into rv_mail_log(email, kind) values (v_email, 'magic');
  return json_build_object('token', v_tok, 'code', v_code, 'email', v_email, 'new', not v_exists);
end $$;

-- Connexion : on retrouve le profil parent par son adresse ; sinon création d'un nouvel espace.
create or replace function rv_magic_use(p_token uuid, p_label text) returns json
language plpgsql security definer set search_path = public as $$
declare v_m rv_magic; v_fam uuid; v_par uuid; v_tok uuid; v_f rv_families;
begin
  select * into v_m from rv_magic where token = p_token for update;
  if v_m.token is null then return json_build_object('error','bad_link'); end if;
  if v_m.used_at is not null and v_m.used_at < now() - interval '2 minutes' then return json_build_object('error','used_link'); end if;
  if v_m.expires_at < now() then return json_build_object('error','old_link'); end if;
  select id, family_id into v_par, v_fam from rv_profiles where role = 'parent' and email = v_m.email limit 1;
  if v_par is null then
    select id into v_fam from rv_families where email = v_m.email;
    if v_fam is null then
      if not v_m.consent then return json_build_object('error','consent'); end if;
      insert into rv_families(email, consent_at) values (v_m.email, now()) returning id into v_fam;
      if v_m.invite is not null then
        update rv_invites set used_at = now(), used_by = v_fam where code = v_m.invite and used_at is null;
      end if;
    end if;
    select * into v_f from rv_families where id = v_fam;
    select id into v_par from rv_profiles where family_id = v_fam and role = 'parent' and (email is null or email = v_m.email) order by created_at limit 1;
    if v_par is null then
      insert into rv_profiles(label, role, family_id, email, notify, weekly) values ('Parent', 'parent', v_fam, v_m.email, v_f.notify, v_f.weekly) returning id into v_par;
    else
      update rv_profiles set email = v_m.email, notify = coalesce(notify, v_f.notify), weekly = coalesce(weekly, v_f.weekly) where id = v_par;
    end if;
  end if;
  update rv_profiles set joined_at = coalesce(joined_at, now()) where id = v_par;
  update rv_magic set used_at = coalesce(used_at, now()) where token = p_token;
  v_tok := rv_new_session(v_par, p_label);
  return json_build_object('token', v_tok, 'role', 'parent', 'name', 'Parent');
end $$;

-- Invitation de l'autre parent (même famille, mêmes enfants).
create or replace function rv_parent_invite(p_token uuid, p_email text) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_email text := lower(trim(p_email)); v_used uuid; v_id uuid; v_kids text;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' or length(v_email) > 160 then return json_build_object('error','email'); end if;
  if v_email = v_prof.email then return json_build_object('error','self'); end if;
  v_used := rv_email_used(v_email);
  if v_used = v_prof.family_id then return json_build_object('error','already'); end if;
  if v_used is not null then return json_build_object('error','taken'); end if;
  if (select count(*) from rv_profiles where family_id = v_prof.family_id and role = 'parent') >= 4 then return json_build_object('error','max'); end if;
  if (select count(*) from rv_mail_log where family_id = v_prof.family_id and kind = 'coparent' and ts > now() - interval '1 hour') >= 5 then return json_build_object('error','wait'); end if;
  insert into rv_profiles(label, role, family_id, email, notify, weekly, invited_by)
    values ('Parent', 'parent', v_prof.family_id, v_email, 'evening', true, v_prof.id) returning id into v_id;
  insert into rv_mail_log(family_id, email, kind) values (v_prof.family_id, v_email, 'coparent');
  select string_agg(coalesce(s.state->>'pseudo', p.label), ', ' order by p.created_at) into v_kids
    from rv_profiles p left join rv_state s on s.profile_id = p.id where p.family_id = v_prof.family_id and p.role = 'student';
  return json_build_object('ok', true, 'id', v_id, 'email', v_email, 'from', v_prof.email, 'kids', coalesce(v_kids, ''));
end $$;

-- Réglages d'e-mails : propres à chaque parent.
create or replace function rv_family_set(p_token uuid, p_notify text, p_weekly boolean) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if p_notify is not null and p_notify not in ('each','evening','off') then return json_build_object('error','notify'); end if;
  update rv_profiles set notify = coalesce(p_notify, notify), weekly = coalesce(p_weekly, weekly) where id = v_prof.id;
  if rv_is_owner(v_prof) then
    update rv_families set notify = coalesce(p_notify, notify), weekly = coalesce(p_weekly, weekly) where id = v_prof.family_id;
  end if;
  return json_build_object('ok', true);
end $$;

-- Alerte de séance : à chaque parent qui l'a demandée.
create or replace function rv_notify_session(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_to json;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('send', false); end if;
  select json_agg(email) into v_to from rv_profiles where family_id = v_prof.family_id and role = 'parent' and email is not null and notify = 'each';
  if v_to is null then return json_build_object('send', false); end if;
  if v_prof.last_notified is not null and v_prof.last_notified > now() - interval '30 minutes' then return json_build_object('send', false); end if;
  update rv_profiles set last_notified = now() where id = v_prof.id;
  insert into rv_mail_log(family_id, email, kind) select v_prof.family_id, e, 'session' from json_array_elements_text(v_to) e;
  return json_build_object('send', true, 'to', v_to, 'child', coalesce((select state->>'pseudo' from rv_state where profile_id = v_prof.id), v_prof.label));
end $$;

-- Récap du soir / bilan du dimanche : une ligne par parent et par enfant.
create or replace function rv_digest(p_kind text) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x), '[]'::json) from (
    select par.email, p.id, coalesce(s.state->>'pseudo', p.label) as child,
      count(a.id) as n, count(a.id) filter (where a.correct) as ok, coalesce(sum(a.ms), 0) as ms,
      count(a.id) filter (where a.skill like 'K%') as n_chim, count(a.id) filter (where a.correct and a.skill like 'K%') as ok_chim,
      count(distinct (a.ts at time zone 'Europe/Paris')::date) as days,
      (select coalesce(json_agg(e), '[]'::json) from (select error_code as code, count(*) as n from rv_attempts e2
        where e2.profile_id = p.id and e2.error_code is not null and e2.error_code not in ('nsp','hasard')
          and e2.ts > case when p_kind = 'weekly' then now() - interval '7 days' else date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' end
        group by 1 order by 2 desc limit 3) e) as errors,
      jsonb_array_length(coalesce(s.state->'review', '[]'::jsonb)) as review
    from rv_profiles par join rv_profiles p on p.family_id = par.family_id and p.role = 'student'
    left join rv_state s on s.profile_id = p.id
    left join rv_attempts a on a.profile_id = p.id and a.ts > case when p_kind = 'weekly' then now() - interval '7 days' else date_trunc('day', now() at time zone 'Europe/Paris') at time zone 'Europe/Paris' end
    where par.role = 'parent' and par.email is not null
      and ((p_kind = 'evening' and par.notify = 'evening') or (p_kind = 'weekly' and par.weekly))
    group by par.email, p.id, s.state, p.label
    having p_kind = 'weekly' or count(a.id) > 0
  ) x;
$$;

-- Tableau de bord : réglages du parent connecté + liste des parents de la famille.
do $$ begin
  if not exists (select 1 from pg_proc where proname = 'rv_dashboard_core') then
    alter function rv_dashboard(uuid) rename to rv_dashboard_core;
  end if;
end $$;
revoke execute on function rv_dashboard_core(uuid) from public, anon, authenticated;

create or replace function rv_dashboard(p_token uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v jsonb; v_f rv_families;
begin
  v := rv_dashboard_core(p_token)::jsonb;
  if v ? 'error' then return v::json; end if;
  v_prof := rv_profile_from_token(p_token);
  select * into v_f from rv_families where id = v_prof.family_id;
  v := jsonb_set(v, '{family}', (v->'family') || jsonb_build_object(
    'email', coalesce(v_prof.email, v_f.email),
    'notify', coalesce(v_prof.notify, v_f.notify),
    'weekly', coalesce(v_prof.weekly, v_f.weekly),
    'owner', rv_is_owner(v_prof),
    'me', v_prof.id,
    'parents', (select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'email', p.email, 'owner', rv_is_owner(p), 'me', p.id = v_prof.id,
                  'joined', p.joined_at is not null, 'since', coalesce(p.joined_at, p.created_at)) order by rv_is_owner(p) desc, p.created_at), '[]'::jsonb)
                from rv_profiles p where p.family_id = v_prof.family_id and p.role = 'parent' and p.email is not null)));
  return v::json;
end $$;

-- Retirer un parent (appliqué en migrations deux_parents_2 / _3 / _renvoi) :
-- le profil est désactivé (role 'removed', sessions expirées) plutôt qu'effacé.
alter table rv_profiles drop constraint if exists rv_profiles_role_check;
alter table rv_profiles add constraint rv_profiles_role_check check (role = any (array['student','parent','test','removed']));

create or replace function rv_parent_remove(p_token uuid, p_parent uuid) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_t rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_t from rv_profiles where id = p_parent and family_id = v_prof.family_id and role = 'parent';
  if v_t.id is null then return json_build_object('ok', false); end if;
  if rv_is_owner(v_t) then return json_build_object('error','owner'); end if;
  if v_t.id <> v_prof.id and not rv_is_owner(v_prof) then return json_build_object('error','owner_only'); end if;
  update rv_sessions set expires_at = now() - interval '1 second' where profile_id = v_t.id;
  update rv_profiles set role = 'removed', email = null, notify = 'off', weekly = false where id = v_t.id;
  return json_build_object('ok', true, 'self', v_t.id = v_prof.id);
end $$;

-- Suppression d'un enfant / de l'espace : réservée au parent principal (enveloppe des fonctions existantes).
do $$ begin
  if not exists (select 1 from pg_proc where proname = 'rv_child_del_core') then alter function rv_child_del(uuid, uuid, text) rename to rv_child_del_core; end if;
  if not exists (select 1 from pg_proc where proname = 'rv_family_delete_core') then alter function rv_family_delete(uuid, text) rename to rv_family_delete_core; end if;
end $$;
create or replace function rv_child_del(p_token uuid, p_child uuid, p_confirm text default null) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if not rv_is_owner(v_prof) then return json_build_object('error','owner_only'); end if;
  return rv_child_del_core(p_token, p_child, p_confirm);
end $$;
create or replace function rv_family_delete(p_token uuid, p_confirm text) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if not rv_is_owner(v_prof) then return json_build_object('error','owner_only'); end if;
  return rv_family_delete_core(p_token, p_confirm);
end $$;

grant execute on function rv_dashboard(uuid), rv_parent_invite(uuid, text), rv_parent_remove(uuid, uuid), rv_child_del(uuid, uuid, text), rv_family_delete(uuid, text) to anon, authenticated;
revoke execute on function rv_dashboard_core(uuid), rv_child_del_core(uuid, uuid, text), rv_family_delete_core(uuid, text), rv_email_used(text), rv_is_owner(rv_profiles) from public, anon, authenticated;
-- NB : rv_parent_invite a ensuite été remplacée (migration deux_parents_renvoi) pour permettre de renvoyer une invitation non acceptée.
