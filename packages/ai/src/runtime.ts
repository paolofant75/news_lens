import { prisma } from '@news-lens-veritas/db';
import type { BaseAgent } from './base';

function withTimeout<T>(fn: () => Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    fn(),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`Agent timed out after ${ms}ms`)), ms)
    ),
  ]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const BACKOFF_DELAYS = [1_000, 3_000];

export async function runAgent<I, O>(
  agent: BaseAgent<I, O>,
  input: I,
  opts?: { timeoutMs?: number; retries?: number }
): Promise<
  | { ok: true; output: O; runId: string }
  | { ok: false; error: string; runId: string }
> {
  const timeoutMs = opts?.timeoutMs ?? 30_000;
  const maxRetries = opts?.retries ?? 2;
  const totalAttempts = maxRetries + 1;

  // Create the run record before execution.
  const run = await prisma.agentRun.create({
    data: {
      agentName: agent.name,
      agentVersion: agent.version,
      status: 'running',
      input: input as never,
    },
  });

  const runId = run.id;
  const wallStart = Date.now();
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 0; attempt < totalAttempts; attempt++) {
    if (attempt > 0) {
      await sleep(BACKOFF_DELAYS[attempt - 1] ?? BACKOFF_DELAYS.at(-1)!);
    }

    const stepStart = Date.now();

    try {
      const output = await withTimeout(() => agent.execute(input), timeoutMs);
      const latencyMs = Date.now() - stepStart;

      await prisma.agentStep.create({
        data: {
          runId,
          stepIndex: attempt,
          stepName: 'execute',
          input: input as never,
          output: output as never,
          latencyMs,
        },
      });

      await prisma.agentRun.update({
        where: { id: runId },
        data: {
          status: 'completed',
          output: output as never,
          latencyMs: Date.now() - wallStart,
          completedAt: new Date(),
        },
      });

      return { ok: true, output, runId };
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      // Best-effort step record for the failed attempt.
      prisma.agentStep
        .create({
          data: {
            runId,
            stepIndex: attempt,
            stepName: 'execute',
            input: input as never,
            latencyMs: Date.now() - stepStart,
          },
        })
        .catch(() => undefined);
    }
  }

  // All attempts exhausted.
  const errorMessage = lastError.message;

  prisma.agentRun
    .update({
      where: { id: runId },
      data: {
        status: 'failed',
        errorMessage,
        latencyMs: Date.now() - wallStart,
        completedAt: new Date(),
      },
    })
    .catch(() => undefined);

  return { ok: false, error: errorMessage, runId };
}
