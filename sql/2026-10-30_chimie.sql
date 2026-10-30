-- 30/10/2026 : module chimie
-- 1. Réglages par enfant posés par le parent (ex. : calculatrice) : rv_plan kind = 'reglage', label = nom du réglage, error_code = valeur
-- 2. Récap / bilan e-mail : nombre d'exercices et réussites en chimie (compétences K*)

alter table rv_plan drop constraint if exists rv_plan_kind_check;
alter table rv_plan add constraint rv_plan_kind_check check (kind in ('exam', 'copie', 'reglage'));

create or replace function rv_plan_add(p_token uuid, p_kind text, p_day date, p_label text, p_skills text[], p_level integer, p_error_code text, p_child uuid default null) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_id uuid;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  if p_kind not in ('exam','copie','reglage') then return json_build_object('error','kind'); end if;
  if p_child is not null and not exists (select 1 from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student') then
    return json_build_object('error','child'); end if;
  if p_kind = 'reglage' then
    if p_child is null then return json_build_object('error','child'); end if;
    delete from rv_plan where family_id = v_prof.family_id and kind = 'reglage' and student_id = p_child and label = left(p_label,120);
  end if;
  insert into rv_plan(kind, day, label, skills, level, error_code, family_id, student_id)
  values (p_kind, p_day, left(p_label,120), coalesce(p_skills,'{}'), least(greatest(coalesce(p_level,2),1),3), left(p_error_code,24), v_prof.family_id, p_child) returning id into v_id;
  return json_build_object('ok', true, 'id', v_id);
end $$;

create or replace function rv_plan_rows(p_family uuid, p_student uuid default null) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(json_build_object('id',id,'kind',kind,'day',day,'label',label,'skills',skills,'level',level,'error_code',error_code,'created_at',created_at,'student',student_id) order by day nulls last, created_at), '[]'::json)
  from rv_plan where family_id = p_family and (p_student is null or student_id is null or student_id = p_student)
    and (kind in ('copie','reglage') or day >= (now() at time zone 'Europe/Paris')::date - 1);
$$;

create or replace function rv_digest(p_kind text) returns json
language sql stable security definer set search_path = public as $$
  select coalesce(json_agg(x), '[]'::json) from (
    select f.email, p.id, coalesce(s.state->>'pseudo', p.label) as child,
      count(a.id) as n, count(a.id) filter (where a.correct) as ok, coalesce(sum(a.ms), 0) as ms,
      count(a.id) filter (where a.skill like 'K%') as n_chim, count(a.id) filter (where a.correct and a.skill like 'K%') as ok_chim,
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
