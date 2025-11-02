import type { Action } from "../models/Action.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";

/**
 * Base abstract class for all actions
 * Provides common functionality like logging
 */
export abstract class BaseAction implements Action {
  protected log(message: string, data?: Record<string, unknown>): void {
    const timestamp = new Date().toISOString();
    if (data) {
      console.log(`[${timestamp}] ${message}`, data);
    } else {
      console.log(`[${timestamp}] ${message}`);
    }
  }

  abstract execute(context: ExecutionContext): Promise<void>;
}
