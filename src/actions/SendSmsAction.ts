import { BaseAction } from "./BaseAction.js";
import type { ExecutionContext } from "../models/ExecutionContext.js";

/**
 * Action to send an SMS message
 * Takes a phone number as a parameter
 */
export class SendSmsAction extends BaseAction {
  constructor(private phoneNumber: string) {
    super();
  }

  async execute(context: ExecutionContext): Promise<void> {
    this.log("SendSmsAction: Sending SMS", {
      phoneNumber: this.phoneNumber,
    });
  }

  getPhoneNumber(): string {
    return this.phoneNumber;
  }
}
