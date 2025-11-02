import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import type { ActionNode } from "../models/ActionNode.js";
import { ExecutionContext } from "../models/ExecutionContext.js";
import { TreeExecutor } from "../execution/TreeExecutor.js";
import { ActionFactory } from "../serialization/ActionFactory.js";

// Mock console.log to capture logs
const originalLog = console.log;
let logOutput: string[] = [];

beforeEach(() => {
  logOutput = [];
  console.log = (...args: unknown[]) => {
    const formatted = args
      .map((arg) => {
        if (typeof arg === "object" && arg !== null) {
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return String(arg);
      })
      .join(" ");
    logOutput.push(formatted);
    // Also print to console so logs are visible during tests
    originalLog(...args);
  };
});

afterEach(() => {
  console.log = originalLog;
});

describe("Decision Tree Processing", () => {
  const executor = new TreeExecutor();
  const factory = new ActionFactory(executor);

  describe("1. Simple SMS Action", () => {
    it("should execute a simple SMS action", async () => {
      const actionNode: ActionNode = {
        type: "sms",
        params: {
          phoneNumber: "+1234567890",
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify SMS was logged
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("SendSmsAction");
      expect(logStr).toContain("+1234567890");
    });
  });

  describe("2. Simple Email Action", () => {
    it("should execute a simple email action", async () => {
      const actionNode: ActionNode = {
        type: "email",
        params: {
          sender: "sender@example.com",
          receiver: "receiver@example.com",
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify Email was logged
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("SendEmailAction");
      expect(logStr).toContain("sender@example.com");
      expect(logStr).toContain("receiver@example.com");
    });
  });

  describe("3. Condition - True Branch (Example 1)", () => {
    it("should execute trueAction when condition is true", async () => {
      const actionNode: ActionNode = {
        type: "condition",
        params: {
          expression: "true",
        },
        trueAction: {
          type: "sms",
          params: {
            phoneNumber: "+1234567890",
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify condition was evaluated and SMS was sent
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("ConditionAction");
      expect(logStr).toContain("SendSmsAction");
      expect(logStr).toContain("+1234567890");
    });
  });

  describe("4. Condition - True & False Branches", () => {
    it("should execute falseAction when condition is false", async () => {
      const actionNode: ActionNode = {
        type: "condition",
        params: {
          expression: "false",
        },
        trueAction: {
          type: "sms",
          params: {
            phoneNumber: "+1234567890",
          },
        },
        falseAction: {
          type: "email",
          params: {
            sender: "system@example.com",
            receiver: "user@example.com",
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify condition was evaluated and email was sent (false branch)
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("ConditionAction");
      expect(logStr).toContain("SendEmailAction");
      expect(logStr).toContain("system@example.com");
      expect(logStr).not.toContain("SendSmsAction");
    });
  });

  describe("5. Chained Actions (Example 2)", () => {
    it("should execute actions in sequence", async () => {
      const actionNode: ActionNode = {
        type: "email",
        params: {
          sender: "sender1@example.com",
          receiver: "receiver1@example.com",
        },
        next: {
          type: "sms",
          params: {
            phoneNumber: "+1234567890",
          },
          next: {
            type: "email",
            params: {
              sender: "sender2@example.com",
              receiver: "receiver2@example.com",
            },
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify all actions were executed in order
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("SendEmailAction");
      expect(logStr).toContain("sender1@example.com");
      expect(logStr).toContain("SendSmsAction");
      expect(logStr).toContain("sender2@example.com");
    });
  });

  describe("6. Loop (Example 3)", () => {
    it("should execute loop 10 times", async () => {
      const actionNode: ActionNode = {
        type: "loop",
        params: {
          count: 10,
        },
        subtree: {
          type: "condition",
          params: {
            expression: "true",
          },
          trueAction: {
            type: "sms",
            params: {
              phoneNumber: "+1234567890",
            },
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify loop executed 10 times
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("LoopAction");
      expect(logStr).toContain('"count": 10');

      // Count SMS executions (should be 10)
      const smsMatches = logStr.match(/SendSmsAction/g);
      expect(smsMatches).toHaveLength(10);
    });
  });

  describe("7. Complex - Nested Conditions with Loops", () => {
    it("should execute nested loop when condition is true", async () => {
      const actionNode: ActionNode = {
        type: "condition",
        params: {
          expression: "true",
        },
        trueAction: {
          type: "loop",
          params: {
            count: 3,
          },
          subtree: {
            type: "email",
            params: {
              sender: "nested@example.com",
              receiver: "user@example.com",
            },
          },
        },
        falseAction: {
          type: "sms",
          params: {
            phoneNumber: "+1234567890",
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify nested structure was executed
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("ConditionAction");
      expect(logStr).toContain("LoopAction");
      expect(logStr).toContain('"count": 3');

      // Count email executions (should be 3)
      const emailMatches = logStr.match(/SendEmailAction/g);
      expect(emailMatches).toHaveLength(3);
      expect(logStr).not.toContain("SendSmsAction");
    });
  });

  describe("8. Complex - Loop with Chained Actions", () => {
    it("should execute chained actions within loop", async () => {
      const actionNode: ActionNode = {
        type: "loop",
        params: {
          count: 2,
        },
        subtree: {
          type: "sms",
          params: {
            phoneNumber: "+1234567890",
          },
          next: {
            type: "email",
            params: {
              sender: "loop@example.com",
              receiver: "user@example.com",
            },
          },
        },
      };

      const action = factory.createActionTree(actionNode);
      expect(action).not.toBeNull();

      const context = new ExecutionContext();
      await executor.executeAction(action!, context);

      // Verify loop executed 2 times with chained actions
      const logStr = logOutput.join("\n");
      expect(logStr).toContain("LoopAction");
      expect(logStr).toContain('"count": 2');

      // Count SMS and Email executions (should be 2 each)
      const smsMatches = logStr.match(/SendSmsAction/g);
      const emailMatches = logStr.match(/SendEmailAction/g);
      expect(smsMatches).toHaveLength(2);
      expect(emailMatches).toHaveLength(2);
    });
  });

  describe("9. Error Test - Missing Parameter", () => {
    it("should throw error when required parameter is missing", () => {
      const actionNode: ActionNode = {
        type: "sms",
        params: {},
      };

      expect(() => {
        factory.createActionTree(actionNode);
      }).toThrow("SendSmsAction requires 'phoneNumber' parameter");
    });
  });

  describe("10. Error Test - Invalid Action Type", () => {
    it("should return null for invalid action type", () => {
      const actionNode = {
        type: "invalid_type",
        params: {},
      } as unknown as ActionNode;

      const action = factory.createActionTree(actionNode);
      expect(action).toBeNull();
    });
  });

  describe("API Integration Tests", () => {
    it("should handle empty request body", () => {
      const actionNode = null as unknown as ActionNode;
      expect(() => {
        factory.createActionTree(actionNode);
      }).toThrow();
    });

    it("should handle missing type property", () => {
      const actionNode = {
        params: {},
      } as unknown as ActionNode;

      const action = factory.createActionTree(actionNode);
      expect(action).toBeNull();
    });
  });
});
