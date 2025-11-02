export interface ActionNode {
  type: "sms" | "email" | "condition" | "loop";
  params?: Record<string, unknown>;
  next?: ActionNode; // For sequential chaining
  trueAction?: ActionNode; // For condition actions
  falseAction?: ActionNode; // For condition actions
  subtree?: ActionNode; // For loop actions
}
