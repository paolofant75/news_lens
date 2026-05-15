-- Log persistente di ogni chiamata AI (DeepSeek/Anthropic) per dashboard
-- consumi e calcolo costi. Solo service role puo' scrivere/leggere.
create table if not exists public.ai_usage_log (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  provider text not null,            -- 'deepseek' | 'anthropic'
  model text not null,               -- 'deepseek-chat', 'claude-haiku-4-5-20251001', ...
  tier text not null,                -- 'fast' | 'smart'
  context text,                      -- 'translate' | 'veritas' | 'expand-query' | 'intelligence'
  input_tokens integer not null default 0,
  output_tokens integer not null default 0,
  latency_ms integer not null default 0,
  success boolean not null default true,
  error_message text
);

create index if not exists idx_ai_usage_created on public.ai_usage_log(created_at desc);
create index if not exists idx_ai_usage_provider on public.ai_usage_log(provider, created_at desc);
create index if not exists idx_ai_usage_context on public.ai_usage_log(context, created_at desc);

-- RLS attivo, nessuna policy = accesso negato di default
-- L'unico accesso e' via service role (route /api/admin/dashboard)
alter table public.ai_usage_log enable row level security;

-- Cleanup: log piu' vecchi di 90 giorni eliminati periodicamente
create or replace function purge_old_ai_usage()
returns void language sql as $$
  delete from public.ai_usage_log where created_at < now() - interval '90 days';
$$;
