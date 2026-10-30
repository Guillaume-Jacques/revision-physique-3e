-- Bulle d'aide : questions envoyées depuis « Poser ma question » (élève, parent ou visiteur)
-- (appliqué sur Supabase mqxotaaqhonxbficrkgc le 30/10/2026, migration « aide_questions »)

create table if not exists rv_questions (
  id bigserial primary key,
  family_id uuid references rv_families(id) on delete cascade,
  profile_id uuid references rv_profiles(id) on delete set null,
  role text,
  email text,
  question text not null,
  ctx text,
  created_at timestamptz not null default now()
);
alter table rv_questions enable row level security;

-- Réservée au serveur (fonction rv-mail) : enregistre la question et renvoie à qui l'envoyer.
-- Limites : 5 questions par heure par profil ou par adresse, 30 au total par heure.
create or replace function rv_question_add(p_token uuid, p_email text, p_text text, p_ctx text) returns json
language plpgsql security definer set search_path = public as $$
declare v_prof rv_profiles; v_fam rv_families; v_mail text; v_admin text; v_child text;
begin
  p_text := left(btrim(coalesce(p_text, '')), 2000);
  if length(p_text) < 5 then return json_build_object('error', 'court'); end if;
  if p_token is not null then v_prof := rv_profile_from_token(p_token); end if;
  if v_prof.id is not null then
    select * into v_fam from rv_families where id = v_prof.family_id;
    v_mail := v_fam.email;
    if v_prof.role <> 'parent' then v_child := coalesce((select state->>'pseudo' from rv_state where profile_id = v_prof.id), v_prof.label); end if;
  else
    v_mail := lower(btrim(coalesce(p_email, '')));
    if v_mail !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then return json_build_object('error', 'email'); end if;
  end if;
  if (select count(*) from rv_questions where created_at > now() - interval '1 hour'
      and ((v_prof.id is not null and profile_id = v_prof.id) or (v_prof.id is null and email = v_mail))) >= 5
     or (select count(*) from rv_questions where created_at > now() - interval '1 hour') >= 30 then
    return json_build_object('error', 'limite');
  end if;
  insert into rv_questions(family_id, profile_id, role, email, question, ctx)
    values (v_fam.id, v_prof.id, coalesce(v_prof.role, 'visiteur'), v_mail, p_text, left(p_ctx, 300));
  select email into v_admin from rv_families where is_admin order by created_at limit 1;
  return json_build_object('ok', true, 'to', coalesce(v_admin, 'contact@guillaumejacques.fr'), 'reply', v_mail,
    'role', coalesce(v_prof.role, 'visiteur'), 'child', v_child);
end $$;
revoke all on function rv_question_add(uuid, text, text, text) from public, anon, authenticated;
grant execute on function rv_question_add(uuid, text, text, text) to service_role;
