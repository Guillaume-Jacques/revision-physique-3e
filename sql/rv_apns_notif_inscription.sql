-- Notifications iPhone (APNs) : jetons d'appareil + alerte à l'administrateur à chaque nouvelle famille.
create table if not exists rv_apns (
  device text primary key,
  profile_id uuid not null references rv_profiles(id) on delete cascade,
  updated_at timestamptz not null default now()
);
alter table rv_apns enable row level security;

create or replace function rv_apns_save(p_token uuid, p_device text) returns json
language plpgsql security definer set search_path to 'public' as $$
declare v_prof uuid;
begin
  select profile_id into v_prof from rv_sessions where token = p_token and (expires_at is null or expires_at > now());
  if v_prof is null then return json_build_object('error', 'session'); end if;
  if p_device !~ '^[0-9a-fA-F]{32,200}$' then return json_build_object('error', 'device'); end if;
  insert into rv_apns(device, profile_id, updated_at) values (lower(p_device), v_prof, now())
    on conflict (device) do update set profile_id = excluded.profile_id, updated_at = now();
  return json_build_object('ok', true);
end $$;

create or replace function rv_apns_is_admin(p_token uuid) returns boolean
language sql security definer set search_path to 'public' as $$
  select coalesce((select f.is_admin from rv_sessions s join rv_profiles p on p.id = s.profile_id join rv_families f on f.id = p.family_id
                   where s.token = p_token and p.role = 'parent' and (s.expires_at is null or s.expires_at > now())), false);
$$;

create or replace function rv_apns_admin_devices() returns text[]
language sql security definer set search_path to 'public' as $$
  select coalesce(array_agg(a.device), '{}') from rv_apns a join rv_profiles p on p.id = a.profile_id join rv_families f on f.id = p.family_id where f.is_admin;
$$;
revoke all on function rv_apns_admin_devices() from public, anon, authenticated;

create or replace function rv_notify_signup() returns trigger
language plpgsql security definer set search_path to 'public', 'extensions' as $$
declare v_sec text;
begin
  if new.is_admin or new.email = (select v from rv_config where k = 'review_email') then return new; end if;
  select v into v_sec from rv_config where k = 'cron_secret';
  perform net.http_post(url := 'https://mqxotaaqhonxbficrkgc.supabase.co/functions/v1/rv-push',
    body := jsonb_build_object('action', 'signup', 'email', new.email),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-cron', v_sec));
  return new;
exception when others then return new;  -- l'inscription ne doit jamais échouer à cause de la notification
end $$;

drop trigger if exists rv_families_notify on rv_families;
create trigger rv_families_notify after insert on rv_families for each row execute function rv_notify_signup();
