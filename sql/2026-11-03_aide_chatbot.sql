-- Assistant d'aide (fonction rv-aide) : compteur anti-abus, sans aucun texte de conversation stocké
create table if not exists public.rv_aide_log (
  id bigserial primary key,
  k text not null,
  who text,
  at timestamptz not null default now()
);
create index if not exists rv_aide_log_k_at on public.rv_aide_log (k, at);
create index if not exists rv_aide_log_at on public.rv_aide_log (at);
alter table public.rv_aide_log enable row level security;

create or replace function public.rv_aide_hit(p_key text, p_who text)
returns text language plpgsql security definer set search_path = public as $$
declare n_k int; n_all int;
begin
  delete from rv_aide_log where at < now() - interval '2 days';
  select count(*) into n_k from rv_aide_log where k = p_key and at > now() - interval '1 hour';
  if n_k >= 40 then return 'limite'; end if;
  select count(*) into n_all from rv_aide_log where at > now() - interval '1 hour';
  if n_all >= 600 then return 'charge'; end if;
  insert into rv_aide_log (k, who) values (p_key, left(p_who, 10));
  return 'ok';
end $$;
revoke all on function public.rv_aide_hit(text, text) from public, anon, authenticated;
