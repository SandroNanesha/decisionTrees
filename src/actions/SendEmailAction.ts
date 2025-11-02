import { BaseAction } from "./BaseAction.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";

/**
 * Action to send an email
 * Takes sender and receiver email addresses as parameters
 */
export class SendEmailAction extends BaseAction {
  constructor(private sender: string, private receiver: string) {
    super();
  }

  async execute(context: ExecutionContext): Promise<void> {
    this.log("SendEmailAction: Sending Email", {
      sender: this.sender,
      receiver: this.receiver,
    });
  }

  getSender(): string {
    return this.sender;
  }

  getReceiver(): string {
    return this.receiver;
  }
}
