import { Router, type Request, type Response } from "express";
import type { ActionNode } from "../models/ActionNode.js";
import { ExecutionContext } from "../models/ExecutionContext.js";
import { TreeExecutor } from "../execution/TreeExecutor.js";
import { ActionFactory } from "../serialization/ActionFactory.js";

const router = Router();
const executor = new TreeExecutor();
const factory = new ActionFactory(executor);

/**
 * POST /execute
 * Accepts a JSON representation of a decision tree and executes it
 */
router.post("/execute", async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("\n=== NEW REQUEST RECEIVED ===");
    console.log("Request body:", req.body);
    console.log("Request body type:", typeof req.body);
    console.log(
      "Request body keys:",
      req.body ? Object.keys(req.body) : "null/undefined"
    );
    console.log("Content-Type header:", req.headers["content-type"]);

    // Check if body is empty or undefined
    if (!req.body || typeof req.body !== "object") {
      console.error("ERROR: req.body is invalid:", req.body);
      res.status(400).json({
        error:
          "Invalid request body. Expected an ActionNode with a 'type' property.",
        received: req.body,
        bodyType: typeof req.body,
      });
      return;
    }

    const actionNode = req.body as ActionNode;

    // Validate input
    if (!actionNode.type) {
      console.error(
        "ERROR: Missing 'type' property. Body:",
        JSON.stringify(req.body, null, 2)
      );
      res.status(400).json({
        error:
          "Invalid request body. Expected an ActionNode with a 'type' property.",
        received: req.body,
      });
      return;
    }

    // Create execution context
    const context = new ExecutionContext();

    // Deserialize and create action tree
    console.log("Creating action tree from:", actionNode.type);
    const action = factory.createActionTree(actionNode);
    if (!action) {
      res.status(400).json({
        error: "Failed to create action from the provided decision tree.",
      });
      return;
    }

    // Execute the decision tree
    console.log("Executing decision tree...\n");
    await executor.executeAction(action, context);
    console.log("\n=== EXECUTION COMPLETE ===\n");

    // Return success response
    res.status(200).json({
      success: true,
      message: "Decision tree executed successfully",
      variables: context.getVariables(),
    });
  } catch (error) {
    console.error("Error executing decision tree:", error);
    res.status(500).json({
      error: "An error occurred while executing the decision tree",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
router.get("/health", (_req: Request, res: Response): void => {
  res.status(200).json({ status: "ok" });
});

export default router;
