link;



supabase

https://lqdtezmuwerkdmlhdytc.supabase.co



sb\_publishable\_Ld8GCHu2nMCHlcGXex3P6A\_jTlxTuci



password database

/Qu,z4!KmbbG\_-c



antrophik per News\_lens

sk-ant-api03-jEmekIxdhnePDdI8Pq8Nvs\_WPZQC5Gstx-RYOh2V-tg6KGE\_z7Z3Z65dD0JJhF23oNodbRUF6bvTqabptAfdGw-f8iQBQAA



upstach endpoin

https://simple-cougar-91030.upstash.io

gQAAAAAAAWOWAAIgcDI5YWQ1Y2U4YWIxMDM0MjQ2OTJhOGM1OGUwMjY5MGUxMw







\# Database (Supabase PostgreSQL)

\# Ottieni questi valori dal dashboard Supabase:

\# 1. Vai su https://supabase.com/dashboard

\# 2. Seleziona il tuo progetto

\# 3. Vai su Settings → Database → Connection string

\# 4. Scegli "URI" e copia (include la password del database)

DATABASE\_URL="postgresql://user:password@host:port/database"



\# Direct URL per Prisma (senza connection pooling)

\# Solitamente uguale a DATABASE\_URL

DIRECT\_URL="postgresql://user:password@host:port/database"



\# Anthropic API Key (Claude)

\# Ottieni da https://console.anthropic.com/

\# Settings → API Keys → Create Key

\# Format: sk-ant-xxxxxxxxxxxxxxxxxxxxxxxx

ANTHROPIC\_API\_KEY="sk-ant-..."



\# Supabase Anon Key (pubblico, usato nel browser)

\# Supabase Dashboard → Settings → API → anon key

NEXT\_PUBLIC\_SUPABASE\_ANON\_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."



\# Supabase URL

\# Supabase Dashboard → Settings → API → Project URL

NEXT\_PUBLIC\_SUPABASE\_URL="https://your-project.supabase.co"



\# Upstash Redis (cache)

\# Ottieni da https://upstash.com/ → Dashboard → Redis → Connection

UPSTASH\_REDIS\_REST\_URL="https://xxx.upstash.io"

UPSTASH\_REDIS\_REST\_TOKEN="xxx"



\# Ambiente (development / production)

NODE\_ENV="development"

