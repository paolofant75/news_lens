import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runAgent } from '../runtime';
import { BaseAgent } from '../base';

// Hoisted mock — prevents real PrismaClient from being instantiated.
vi.mock('@news-lens-veritas/db', () => {
  const agentRunCreate = vi.fn();
  const agentRunUpdate = vi.fn();
  const agentStepCreate = vi.fn();

  return {
    prisma: {
      agentRun: { create: agentRunCreate, update: agentRunUpdate },
      agentStep: { create: agentStepCreate },
    },
  };
});

// Import after mock is registered.
const { prisma } = await import('@news-lens-veritas/db');

// ── EchoAgent ───────────────────────────────────────────────────────────────

type EchoInput = { message: string };
type EchoOutput = { echo: string };

class EchoAgent extends BaseAgent<EchoInput, EchoOutput> {
  readonly name = 'EchoAgent';
  readonly version = '0.1.0';
  readonly systemPrompt = 'Echo the input.';

  async execute(input: EchoInput): Promise<EchoOutput> {
    return { echo: input.message };
  }
}

class SlowAgent extends BaseAgent<EchoInput, EchoOutput> {
  readonly name = 'SlowAgent';
  readonly version = '0.1.0';
  readonly systemPrompt = 'Always slow.';

  async execute(_input: EchoInput): Promise<EchoOutput> {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    return { echo: 'too late' };
  }
}

class BrokenAgent extends BaseAgent<EchoInput, EchoOutput> {
  readonly name = 'BrokenAgent';
  readonly version = '0.1.0';
  readonly systemPrompt = 'Always throws.';

  async execute(_input: EchoInput): Promise<EchoOutput> {
    throw new Error('intentional failure');
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function mockRunId(id = 'run-123') {
  vi.mocked(prisma.agentRun.create).mockResolvedValue({ id } as never);
  vi.mocked(prisma.agentRun.update).mockResolvedValue({} as never);
  vi.mocked(prisma.agentStep.create).mockResolvedValue({ id: 'step-1' } as never);
}

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Tests ────────────────────────────────────────────────────────────────────

describe('runAgent', () => {
  it('salva AgentRun su DB prima dell\'esecuzione', async () => {
    mockRunId();

    await runAgent(new EchoAgent(), { message: 'ciao' });

    expect(prisma.agentRun.create).toHaveBeenCalledOnce();
    expect(prisma.agentRun.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          agentName: 'EchoAgent',
          status: 'running',
        }),
      })
    );
  });

  it('run completato ha status="completed"', async () => {
    mockRunId();

    const result = await runAgent(new EchoAgent(), { message: 'hello' });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.output).toEqual({ echo: 'hello' });
      expect(result.runId).toBe('run-123');
    }
    expect(prisma.agentRun.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'completed' }),
      })
    );
  });

  it('timeout funziona — restituisce { ok: false } senza throw', async () => {
    mockRunId('run-timeout');

    const result = await runAgent(new SlowAgent(), { message: 'slow' }, {
      timeoutMs: 50,
      retries: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/timed out/i);
      expect(result.runId).toBe('run-timeout');
    }
  }, 10_000);

  it('errori non vengono throwati ma restituiti come { ok: false }', async () => {
    mockRunId('run-broken');

    const result = await runAgent(new BrokenAgent(), { message: 'boom' }, {
      retries: 0,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe('intentional failure');
      expect(result.runId).toBe('run-broken');
    }
  });

  it('salva AgentStep per ogni esecuzione andata a buon fine', async () => {
    mockRunId();

    await runAgent(new EchoAgent(), { message: 'step-test' });

    expect(prisma.agentStep.create).toHaveBeenCalledOnce();
    expect(prisma.agentStep.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          runId: 'run-123',
          stepName: 'execute',
          stepIndex: 0,
        }),
      })
    );
  });
});
