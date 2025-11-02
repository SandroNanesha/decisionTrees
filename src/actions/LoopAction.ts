import { BaseAction } from "./BaseAction.js";
import type { Action } from "../models/Action.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";
import type { TreeExecutor } from "../execution/TreeExecutor.js";

/**
 * Action that executes a subtree multiple times
 * Takes a subtree and an integer count
 */
export class LoopAction extends BaseAction {
  constructor(
    private count: number,
    private subtree: Action | null,
    private executor: TreeExecutor
  ) {
    super();
  }

  async execute(context: ExecutionContext): Promise<void> {
    this.log("LoopAction: Starting loop", {
      count: this.count,
    });

    if (!this.subtree) {
      this.log("LoopAction: No subtree provided, skipping");
      return;
    }

    for (let i = 0; i < this.count; i++) {
      this.log("LoopAction: Iteration", { iteration: i + 1, of: this.count });
      await this.executor.executeAction(this.subtree, context);
    }

    this.log("LoopAction: Loop completed", {
      totalIterations: this.count,
    });
  }

  getCount(): number {
    return this.count;
  }
}
