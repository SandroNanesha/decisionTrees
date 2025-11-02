import type { ExecutionContext } from "./ExecutionContext.js";

export interface Action {
  //Execute the action with the given execution context
  execute(context: ExecutionContext): Promise<void>;
}
