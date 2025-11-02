/**
 * Execution context that flows through the decision tree
 * Allows variables to be set and accessed during execution
 */
export class ExecutionContext {
  private variables: Map<string, unknown> = new Map();

  setVariable(name: string, value: unknown): void {
    this.variables.set(name, value);
  }

  getVariable(name: string): unknown {
    return this.variables.get(name);
  }

  getVariables(): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    for (const [key, value] of this.variables.entries()) {
      result[key] = value;
    }
    return result;
  }

  hasVariable(name: string): boolean {
    return this.variables.has(name);
  }
}
