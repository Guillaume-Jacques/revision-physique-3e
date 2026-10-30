-- Suppression d'un enfant : si des exercices existent, le prénom doit être retapé (p_confirm)
drop function if exists public.rv_child_del(uuid, uuid);
create or replace function public.rv_child_del(p_token uuid, p_child uuid, p_confirm text default null)
returns json language plpgsql security definer set search_path to 'public' as $$
declare v_prof rv_profiles; v_child rv_profiles; v_n int;
  a text := 'àâäáãéèêëíìîïóòôöõúùûüçñ'; b text := 'aaaaaeeeeiiiiooooouuuucn';
begin
  v_prof := rv_profile_from_token(p_token);
  if v_prof.id is null or v_prof.role <> 'parent' then return json_build_object('error','auth'); end if;
  select * into v_child from rv_profiles where id = p_child and family_id = v_prof.family_id and role = 'student';
  if v_child.id is null then return json_build_object('ok', false); end if;
  select count(*) into v_n from rv_attempts where profile_id = v_child.id;
  if v_n > 0 and translate(lower(trim(coalesce(p_confirm,''))), a, b) <> translate(lower(trim(v_child.label)), a, b) then
    return json_build_object('error','confirm');
  end if;
  delete from rv_profiles where id = v_child.id;
  return json_build_object('ok', true);
end $$;
revoke all on function public.rv_child_del(uuid, uuid, text) from public;
grant execute on function public.rv_child_del(uuid, uuid, text) to anon, authenticated;
