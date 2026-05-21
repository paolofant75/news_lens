-- ─────────────────────────────────────────────────────────────────────────────
-- MIGRATION: add_agent_runs
-- Crea le tabelle AgentRun + AgentStep usate dal runtime degli agenti AI
-- (packages/ai/src/runtime.ts). Generato da `prisma migrate diff` offline
-- perche' il DB Supabase non e' raggiungibile direttamente dalla CLI.
--
-- COME APPLICARE
-- 1. Apri https://supabase.com/dashboard -> seleziona il tuo progetto
-- 2. SQL Editor (icona sulla sinistra) -> New query
-- 3. Copia e incolla TUTTO il contenuto qui sotto -> Run
-- 4. Verifica che siano apparse 2 nuove tabelle in Database -> Tables:
--    "AgentRun" e "AgentStep"
--
-- IDEMPOTENZA
-- Tutti i CREATE usano IF NOT EXISTS: puoi rilanciare questo script senza
-- danni. Se le tabelle gia' esistono, lo script non fa nulla.
--
-- NOTA: la tabella "articles" del placeholder e' stata RIMOSSA da questo
-- script per evitare conflitti con eventuali tabelle articles preesistenti
-- su Supabase. Se devi crearla, gestiscila separatamente.
-- ─────────────────────────────────────────────────────────────────────────────

-- CreateTable: AgentRun
CREATE TABLE IF NOT EXISTS "AgentRun" (
    "id" TEXT NOT NULL,
    "agentName" TEXT NOT NULL,
    "agentVersion" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "errorMessage" TEXT,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "costUsd" DECIMAL(10,6) NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "AgentRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AgentStep
CREATE TABLE IF NOT EXISTS "AgentStep" (
    "id" TEXT NOT NULL,
    "runId" TEXT NOT NULL,
    "stepIndex" INTEGER NOT NULL,
    "stepName" TEXT NOT NULL,
    "input" JSONB NOT NULL,
    "output" JSONB,
    "tokensIn" INTEGER NOT NULL DEFAULT 0,
    "tokensOut" INTEGER NOT NULL DEFAULT 0,
    "latencyMs" INTEGER,
    "model" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AgentStep_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: AgentRun(agentName, startedAt)
CREATE INDEX IF NOT EXISTS "AgentRun_agentName_startedAt_idx"
    ON "AgentRun"("agentName", "startedAt");

-- CreateIndex: AgentRun(status)
CREATE INDEX IF NOT EXISTS "AgentRun_status_idx"
    ON "AgentRun"("status");

-- CreateIndex: AgentStep(runId, stepIndex)
CREATE INDEX IF NOT EXISTS "AgentStep_runId_stepIndex_idx"
    ON "AgentStep"("runId", "stepIndex");

-- AddForeignKey: AgentStep.runId -> AgentRun.id (ON DELETE CASCADE)
-- Wrappato in DO block per gestire l'idempotenza (CONSTRAINT IF NOT EXISTS non
-- esiste in tutte le versioni di Postgres).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'AgentStep_runId_fkey'
    ) THEN
        ALTER TABLE "AgentStep"
            ADD CONSTRAINT "AgentStep_runId_fkey"
            FOREIGN KEY ("runId") REFERENCES "AgentRun"("id")
            ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
