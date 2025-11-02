import type { Action } from "../models/Action.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";

export class TreeExecutor {
  async executeAction(
    action: Action,
    context: ExecutionContext
  ): Promise<void> {
    await action.execute(context);
  }

  async executeChain(action: Action, context: ExecutionContext): Promise<void> {
    await this.executeAction(action, context);
  }
}
