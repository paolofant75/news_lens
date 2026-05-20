import type { ZodSchema } from 'zod';

export abstract class BaseAgent<I, O> {
  abstract readonly name: string;
  abstract readonly version: string;
  abstract readonly systemPrompt: string;

  abstract execute(input: I): Promise<O>;

  // Override in subclasses to provide Zod validation for the output.
  getSchema(): ZodSchema<O> | null {
    return null;
  }
}
