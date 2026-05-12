-- Esegui questo SQL nel Supabase Dashboard → SQL Editor

-- Tabella preferenze utente
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  lang    TEXT DEFAULT 'it',
  palette TEXT DEFAULT 'noir',
  font    TEXT DEFAULT 'geist',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_prefs" ON user_preferences FOR ALL USING (auth.uid() = user_id);

-- Tabella articoli letti
CREATE TABLE IF NOT EXISTS user_reads (
  id           BIGSERIAL PRIMARY KEY,
  user_id      UUID REFERENCES auth.users ON DELETE CASCADE,
  article_title TEXT NOT NULL,
  article_link  TEXT NOT NULL,
  category      TEXT,
  geo           TEXT,
  source        TEXT,
  read_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_reads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_reads" ON user_reads FOR ALL USING (auth.uid() = user_id);
CREATE INDEX user_reads_uid_idx ON user_reads(user_id);
CREATE INDEX user_reads_at_idx  ON user_reads(read_at DESC);

-- Tabella ricerche Veritas
CREATE TABLE IF NOT EXISTS user_searches (
  id         BIGSERIAL PRIMARY KEY,
  user_id    UUID REFERENCES auth.users ON DELETE CASCADE,
  query      TEXT NOT NULL,
  searched_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE user_searches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own_searches" ON user_searches FOR ALL USING (auth.uid() = user_id);
CREATE INDEX user_searches_uid_idx ON user_searches(user_id);
