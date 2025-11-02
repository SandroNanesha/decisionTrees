import type { ActionNode } from "../models/ActionNode.js";
import type { Action } from "../models/Action.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";
import { SendSmsAction } from "../actions/SendSmsAction.js";
import { SendEmailAction } from "../actions/SendEmailAction.js";
import { ConditionAction } from "../actions/ConditionAction.js";
import { LoopAction } from "../actions/LoopAction.js";
import type { TreeExecutor } from "../execution/TreeExecutor.js";

/**
 * Factory class to deserialize JSON ActionNode into concrete Action instances
 * Follows the Factory pattern for extensibility
 */
export class ActionFactory {
  constructor(private executor: TreeExecutor) {}

  /**
   * Create an Action instance from an ActionNode
   */
  createAction(node: ActionNode): Action | null {
    switch (node.type) {
      case "sms":
        return this.createSendSmsAction(node);
      case "email":
        return this.createSendEmailAction(node);
      case "condition":
        return this.createConditionAction(node);
      case "loop":
        return this.createLoopAction(node);
      default:
        console.error(`Unknown action type: ${(node as ActionNode).type}`);
        return null;
    }
  }

  /**
   * Create a complete action tree from a root node
   * Handles sequential chaining via 'next' property
   */
  createActionTree(rootNode: ActionNode): Action | null {
    const rootAction = this.createAction(rootNode);
    if (!rootAction) {
      return null;
    }

    if (rootNode.next) {
      const nextAction = this.createActionTree(rootNode.next);
      if (!nextAction) {
        return rootAction;
      }
      return new SequentialAction(rootAction, nextAction);
    }

    return rootAction;
  }

  /**
   * Create an action that may have a next chain
   * Used for nested actions (trueAction, falseAction, subtree)
   */
  private createActionWithNext(node: ActionNode | undefined): Action | null {
    if (!node) {
      return null;
    }

    const action = this.createAction(node);
    if (!action) {
      return null;
    }

    if (node.next) {
      const nextAction = this.createActionTree(node.next);
      if (!nextAction) {
        return action;
      }
      return new SequentialAction(action, nextAction);
    }

    return action;
  }

  private createSendSmsAction(node: ActionNode): SendSmsAction {
    const phoneNumber = node.params?.phoneNumber as string;
    if (!phoneNumber) {
      throw new Error("SendSmsAction requires 'phoneNumber' parameter");
    }
    return new SendSmsAction(phoneNumber);
  }

  private createSendEmailAction(node: ActionNode): SendEmailAction {
    const sender = node.params?.sender as string;
    const receiver = node.params?.receiver as string;

    if (!sender || !receiver) {
      throw new Error(
        "SendEmailAction requires 'sender' and 'receiver' parameters"
      );
    }
    return new SendEmailAction(sender, receiver);
  }

  private createConditionAction(node: ActionNode): ConditionAction {
    const expression = node.params?.expression as string;
    if (!expression) {
      throw new Error("ConditionAction requires 'expression' parameter");
    }

    const trueAction = this.createActionWithNext(node.trueAction);
    const falseAction = this.createActionWithNext(node.falseAction);

    return new ConditionAction(
      expression,
      trueAction,
      falseAction,
      this.executor
    );
  }

  private createLoopAction(node: ActionNode): LoopAction {
    const count = node.params?.count as number;
    if (typeof count !== "number" || count < 0) {
      throw new Error(
        "LoopAction requires 'count' parameter as a non-negative number"
      );
    }

    const subtree = this.createActionWithNext(node.subtree);

    return new LoopAction(count, subtree, this.executor);
  }
}

/**
 * Helper action to chain multiple actions sequentially
 */
class SequentialAction implements Action {
  constructor(private first: Action, private next: Action) {}

  async execute(context: ExecutionContext): Promise<void> {
    await this.first.execute(context);
    await this.next.execute(context);
  }
}
