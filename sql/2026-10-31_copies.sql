-- Copies de contrôles en photo (31/10/2026)
-- Parent ou enfant charge les photos d'une copie corrigée ; l'application relève les erreurs ;
-- le parent valide ; les erreurs validées partent dans la file « À revoir » (rv_plan kind = 'copie').
-- L'élève peut aussi saisir ses contrôles à venir (rv_plan kind = 'exam', pour lui seul).

create table if not exists public.rv_copies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references public.rv_families(id) on delete cascade,
  student_id uuid not null references public.rv_profiles(id) on delete cascade,
  exam_id uuid references public.rv_plan(id) on delete set null,
  label text,
  exam_day date,
  note numeric,
  note_max numeric default 20,
  photos text[] not null default '{}',
  status text not null default 'photos', -- photos | analyse | a_valider | validee | erreur
  analysis jsonb,
  by_role text,
  created_at timestamptz not null default now(),
  analysed_at timestamptz,
  validated_at timestamptz
);
create index if not exists rv_copies_student on public.rv_copies(student_id, created_at desc);
alter table public.rv_copies enable row level security;

-- Stockage privé des photos (accès uniquement par la fonction rv-copie, URL signées de courte durée)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('copies', 'copies', false, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

-- L'élève peut saisir un contrôle annoncé (pour lui seul) et le retirer (archivé en 'exam_off', le parent garde la trace)
create or replace function public.rv_exam_add_self(p_token uuid, p_day date, p_label text, p_skills text[])
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' or p_day is null then return json_build_object('error','auth'); end if;
  if (select count(*) from rv_plan where student_id = v_prof.id and kind = 'exam' and created_at > now() - interval '1 day') >= 10 then return json_build_object('error','limit'); end if;
  insert into rv_plan(kind, day, label, skills, level, family_id, student_id)
  values ('exam', p_day, left(nullif(trim(p_label),''),120), coalesce(p_skills,'{}'), 2, v_prof.family_id, v_prof.id) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;
create or replace function public.rv_exam_off_self(p_token uuid, p_id uuid)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'student' then return json_build_object('error','auth'); end if;
  update rv_plan set kind = 'exam_off' where id = p_id and family_id = v_prof.family_id and student_id = v_prof.id and kind = 'exam';
  return json_build_object('ok', found);
end $$;
grant execute on function public.rv_exam_add_self(uuid, date, text, text[]) to anon;
grant execute on function public.rv_exam_off_self(uuid, uuid) to anon;

-- Contrôles passés gardés 60 jours dans le plan (pour rattacher une copie), 'exam_off' exclus
create or replace function public.rv_plan_rows(p_family uuid, p_student uuid default null)
returns json language sql stable security definer set search_path to 'public' as $$
  select coalesce(json_agg(json_build_object('id',id,'kind',kind,'day',day,'label',label,'skills',skills,'level',level,'error_code',error_code,'created_at',created_at,'student',student_id) order by day nulls last, created_at), '[]'::json)
  from rv_plan where family_id = p_family and (p_student is null or student_id is null or student_id = p_student)
    and kind <> 'exam_off'
    and (kind in ('copie','reglage') or day >= (now() at time zone 'Europe/Paris')::date - 60);
$$;

-- Liste des copies : toutes celles de la famille pour un parent, les siennes pour un élève
-- (l'élève ne voit le détail de l'analyse qu'une fois validée par le parent)
create or replace function public.rv_copies_list(p_token uuid)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role not in ('parent','student') then return json_build_object('error','auth'); end if;
  return json_build_object('copies', coalesce((select json_agg(json_build_object(
      'id', c.id, 'student', c.student_id, 'exam', c.exam_id, 'label', c.label, 'day', c.exam_day,
      'note', c.note, 'max', c.note_max, 'n', cardinality(c.photos), 'status', c.status, 'by', c.by_role,
      'created_at', c.created_at, 'validated_at', c.validated_at,
      'analysis', case when v_prof.role = 'parent' or c.status = 'validee' then c.analysis else null end
    ) order by coalesce(c.exam_day, c.created_at::date) desc, c.created_at desc)
    from rv_copies c where c.family_id = v_prof.family_id and (v_prof.role = 'parent' or c.student_id = v_prof.id)), '[]'::json));
end $$;

-- Créer une copie (le parent choisit l'enfant ; l'élève la crée pour lui)
create or replace function public.rv_copy_create(p_token uuid, p_child uuid, p_label text, p_day date, p_note numeric, p_max numeric, p_exam uuid default null)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role not in ('parent','student') then return json_build_object('error','auth'); end if;
  if v_prof.role = 'student' then p_child := v_prof.id; end if;
  if not exists (select 1 from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student') then return json_build_object('error','child'); end if;
  if (select count(*) from rv_copies where student_id = p_child and created_at > now() - interval '1 day') >= 10 then return json_build_object('error','limit'); end if;
  if p_exam is not null and not exists (select 1 from rv_plan where id = p_exam and family_id = v_prof.family_id) then p_exam := null; end if;
  insert into rv_copies(family_id, student_id, exam_id, label, exam_day, note, note_max, by_role)
  values (v_prof.family_id, p_child, p_exam, left(nullif(trim(p_label),''),120), p_day,
          case when p_note between 0 and 100 then p_note end, coalesce(nullif(p_max,0),20), v_prof.role)
  returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

-- Modifier titre / note (parent, ou l'élève tant que ce n'est pas validé)
create or replace function public.rv_copy_set(p_token uuid, p_id uuid, p_label text, p_note numeric, p_max numeric)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null then return json_build_object('error','auth'); end if;
  update rv_copies set label = coalesce(left(nullif(trim(p_label),''),120), label),
    note = case when p_note between 0 and 100 then p_note else note end, note_max = coalesce(nullif(p_max,0), note_max)
  where id = p_id and family_id = v_prof.family_id
    and (v_prof.role = 'parent' or (v_prof.role = 'student' and student_id = v_prof.id and status <> 'validee'));
  return json_build_object('ok', found);
end $$;

-- Validation par le parent : les erreurs cochées partent en révision (rv_plan kind = 'copie')
-- p_items : [{ "skill": "V3", "code": "conv36", "label": "Exercice 2 : ..." }, ...]
create or replace function public.rv_copy_validate(p_token uuid, p_id uuid, p_items jsonb, p_keep int[] default '{}')
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_c rv_copies; v_it jsonb; v_n int := 0;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_c from rv_copies where id = p_id and family_id = v_prof.family_id;
  if v_c.id is null then return json_build_object('error','copy'); end if;
  if v_c.status = 'validee' then return json_build_object('ok', true, 'n', 0); end if;
  for v_it in select * from jsonb_array_elements(coalesce(p_items,'[]'::jsonb)) loop
    exit when v_n >= 15;
    insert into rv_plan(kind, label, skills, level, error_code, family_id, student_id)
    values ('copie', left(coalesce(v_it->>'label', v_c.label, 'Copie'),120), array[left(v_it->>'skill',8)], 2,
            left(coalesce(v_it->>'code','copie'),24), v_c.family_id, v_c.student_id);
    v_n := v_n + 1;
  end loop;
  update rv_copies set status = 'validee', validated_at = now(),
    analysis = coalesce(analysis,'{}'::jsonb) || jsonb_build_object('kept', to_jsonb(coalesce(p_keep,'{}'::int[])))
  where id = p_id;
  return json_build_object('ok', true, 'n', v_n);
end $$;

-- Réservé à la fonction rv-copie (clé serveur) : qui appelle, et sur quelle copie
create or replace function public.rv_copy_auth(p_token uuid, p_id uuid default null)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_c rv_copies;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role not in ('parent','student') then return json_build_object('error','auth'); end if;
  if p_id is not null then
    select * into v_c from rv_copies where id = p_id and family_id = v_prof.family_id and (v_prof.role = 'parent' or student_id = v_prof.id);
    if v_c.id is null then return json_build_object('error','copy'); end if;
  end if;
  return json_build_object('role', v_prof.role, 'profile', v_prof.id, 'family', v_prof.family_id,
    'child', case when v_c.id is null then null else (select label from rv_profiles where id = v_c.student_id) end,
    'gender', case when v_c.id is null then null else (select gender from rv_profiles where id = v_c.student_id) end,
    'copy', case when v_c.id is null then null else row_to_json(v_c) end,
    'parents', (select coalesce(json_agg(distinct x.email), '[]'::json) from (
        select f.email from rv_families f where f.id = v_prof.family_id and coalesce(f.notify,'each') not in ('off','none') and f.email is not null
        union select p.email from rv_profiles p where p.family_id = v_prof.family_id and p.role = 'parent' and p.email is not null and coalesce(p.notify,'each') not in ('off','none')) x));
end $$;

revoke all on function public.rv_copy_auth(uuid, uuid) from public, anon, authenticated;
grant execute on function public.rv_copy_auth(uuid, uuid) to service_role;
grant execute on function public.rv_copies_list(uuid) to anon;
grant execute on function public.rv_copy_create(uuid, uuid, text, date, numeric, numeric, uuid) to anon;
grant execute on function public.rv_copy_set(uuid, uuid, text, numeric, numeric) to anon;
grant execute on function public.rv_copy_validate(uuid, uuid, jsonb, int[]) to anon;

-- Ménage quotidien des photos orphelines (copie ou enfant supprimés), 3 h 05
create or replace function public.rv_copies_purge_tick()
returns void language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_sec text;
begin
  select v into v_sec from rv_config where k = 'cron_secret';
  perform net.http_post(url := 'https://mqxotaaqhonxbficrkgc.supabase.co/functions/v1/rv-copie', body := jsonb_build_object('action','purge'),
    headers := jsonb_build_object('Content-Type','application/json','x-cron', v_sec));
end $$;
revoke all on function public.rv_copies_purge_tick() from public, anon, authenticated;
select cron.schedule('rv-copies-purge', '5 3 * * *', 'select public.rv_copies_purge_tick()');

-- Aperçu « Voir son appli » : le parent récupère ce que voit l'enfant (équipes, défis, rappels)
create or replace function public.rv_preview_child(p_token uuid, p_child uuid)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_tok uuid; v_kid rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_kid from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student';
  if v_kid.id is null then return json_build_object('error','child'); end if;
  select token into v_tok from rv_sessions where profile_id = v_kid.id and expires_at > now() order by last_seen desc nulls last, created_at desc limit 1;
  return json_build_object(
    'team', case when v_tok is null then json_build_object('allowed', (select coalesce(teams_ok,false) from rv_families where id = v_prof.family_id), 'teams', '[]'::json) else rv_team_mine(v_tok) end,
    'duels', case when v_tok is null then json_build_object('allowed', false, 'mates', '[]'::json, 'duels', '[]'::json) else rv_duel_mine(v_tok) end,
    'push', json_build_object('push_ok', v_kid.push_ok,
       'active', exists(select 1 from rv_push x join rv_sessions s on s.token = x.token where x.profile_id = v_kid.id and x.status = 'ok' and s.expires_at > now())));
end $$;
grant execute on function public.rv_preview_child(uuid, uuid) to anon;
