import { BaseAction } from "./BaseAction.js";
import type { Action } from "../models/Action.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";
import type { TreeExecutor } from "../execution/TreeExecutor.js";

/**
 * Action that evaluates a JavaScript expression
 * Executes either trueAction or falseAction based on the result
 */
export class ConditionAction extends BaseAction {
  constructor(
    private expression: string,
    private trueAction: Action | null,
    private falseAction: Action | null,
    private executor: TreeExecutor
  ) {
    super();
  }

  async execute(context: ExecutionContext): Promise<void> {
    const result = this.evaluateExpression(this.expression, context);

    this.log("ConditionAction: Evaluating expression", {
      expression: this.expression,
      result: result,
    });

    if (result) {
      if (this.trueAction) {
        await this.executor.executeAction(this.trueAction, context);
      }
    } else {
      if (this.falseAction) {
        await this.executor.executeAction(this.falseAction, context);
      }
    }
  }

  private evaluateExpression(
    expression: string,
    context: ExecutionContext
  ): boolean {
    try {
      const variables = context.getVariables();
      const functionBody = `
        return (${expression});
      `;

      // Create a function with the variables in scope
      const fn = new Function(...Object.keys(variables), functionBody);
      const result = fn(...Object.values(variables));

      // Convert result to boolean
      return Boolean(result);
    } catch (error) {
      this.log("ConditionAction: Error evaluating expression", {
        expression,
        error: error instanceof Error ? error.message : String(error),
      });
      return false;
    }
  }
}
