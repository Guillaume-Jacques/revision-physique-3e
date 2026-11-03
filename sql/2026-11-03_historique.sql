-- Historique des exercices côté élève (onglet « Exercices ») — 03/11/2026
-- 1) garder la correction complète de chaque exercice ; 2) lecture de l'historique par l'élève (ou son parent en aperçu)
alter table rv_attempts add column if not exists detail jsonb;

create or replace function public.rv_log(p_token uuid, p_items jsonb)
 returns json language plpgsql security definer set search_path to 'public' as $function$
declare v_prof rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role not in ('student','test') then return json_build_object('error','auth'); end if;
  if v_prof.role = 'test' then return json_build_object('ok', true); end if;
  if jsonb_array_length(p_items) > 50 then return json_build_object('error','too_many'); end if;
  insert into rv_attempts(profile_id, ts, mode, skill, item_id, level, correct, tries, hints, error_code, answer, question, ms, conf, detail)
  select v_prof.id, coalesce((i->>'ts')::timestamptz, now()), left(i->>'mode',16), left(i->>'skill',8), left(i->>'item_id',40),
         (i->>'level')::int, (i->>'correct')::boolean, (i->>'tries')::int, (i->>'hints')::int,
         left(i->>'error_code',24), left(i->>'answer',60), left(i->>'question',400), least((i->>'ms')::int, 3600000), left(i->>'conf',8),
         case when jsonb_typeof(i->'detail') = 'object' and octet_length((i->'detail')::text) <= 12000 then i->'detail' end
  from jsonb_array_elements(p_items) i;
  return json_build_object('ok', true);
end $function$;

create or replace function public.rv_history(p_token uuid, p_child uuid default null, p_days int default 30)
 returns json language plpgsql stable security definer set search_path to 'public' as $function$
declare v_prof rv_profiles; v_kid uuid; v_child rv_profiles;
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null then return json_build_object('error','auth'); end if;
  if v_prof.role = 'student' then v_kid := v_prof.id;
  elsif v_prof.role = 'parent' and p_child is not null then
    select * into v_child from rv_profiles where id = p_child;
    if v_child.id is null or v_child.family_id is distinct from v_prof.family_id or v_child.role <> 'student' then return json_build_object('error','auth'); end if;
    v_kid := v_child.id;
  else return json_build_object('items', '[]'::json);
  end if;
  return json_build_object('items', coalesce((
    select json_agg(x order by x.ts desc) from (
      select a.ts, a.mode, a.skill, a.item_id, a.level, a.correct, a.tries, a.hints, a.error_code, a.answer, a.question, a.conf, a.detail
      from rv_attempts a
      where a.profile_id = v_kid and a.mode <> 'sprint'
        and a.ts > now() - make_interval(days => greatest(1, least(coalesce(p_days,30), 60)))
      order by a.ts desc limit 400) x), '[]'::json));
end $function$;
