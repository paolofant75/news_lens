export type AgentStatus = 'running' | 'completed' | 'failed';

export type AgentInput = unknown;
export type AgentOutput = unknown;

export interface AgentRun {
  id: string;
  agentName: string;
  agentVersion: string;
  status: AgentStatus;
  input: AgentInput;
  output?: AgentOutput;
  errorMessage?: string;
  tokensIn: number;
  tokensOut: number;
  costUsd: number;
  latencyMs?: number;
  startedAt: Date;
  completedAt?: Date;
}

export interface AgentStep {
  id: string;
  runId: string;
  stepIndex: number;
  stepName: string;
  input: AgentInput;
  output?: AgentOutput;
  tokensIn: number;
  tokensOut: number;
  latencyMs?: number;
  model?: string;
  createdAt: Date;
}
