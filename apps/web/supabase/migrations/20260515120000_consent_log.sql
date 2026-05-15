-- Registro consensi GDPR (art. 7(1) — onere della prova)
create table if not exists public.consent_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  session_id text not null, -- identificativo sessione (anche per utenti non loggati)
  consent_version text not null, -- es. "2026-05-15"
  accepted_categories text[] not null, -- es. ['technical', 'analytics']
  rejected_categories text[] not null default '{}',
  ip_address inet, -- IP per audit (cancellato dopo 12 mesi)
  user_agent text,
  created_at timestamptz not null default now(),
  withdrawn_at timestamptz, -- timestamp revoca consenso
  withdrawal_reason text
);

create index if not exists idx_consent_log_user on public.consent_log(user_id);
create index if not exists idx_consent_log_session on public.consent_log(session_id);
create index if not exists idx_consent_log_created on public.consent_log(created_at desc);

-- RLS: solo il proprio user può leggere i propri consensi, scrittura via service role
alter table public.consent_log enable row level security;

drop policy if exists "users read own consents" on public.consent_log;
create policy "users read own consents"
  on public.consent_log for select
  using (auth.uid() = user_id);

-- Cleanup automatico IP dopo 12 mesi (anonimizzazione)
create or replace function anonymize_old_consents()
returns void language sql as $$
  update public.consent_log
  set ip_address = null, user_agent = null
  where created_at < now() - interval '12 months'
    and ip_address is not null;
$$;
