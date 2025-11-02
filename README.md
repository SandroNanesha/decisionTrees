# Decision Tree Processing Backend

A TypeScript backend service that executes decision trees defined as JSON. Supports SMS, Email, Conditions, and Loops.

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server (http://localhost:3000)
npm test             # Run tests
npm run test:watch   # Run tests in watch mode
```

## Overview

POST JSON decision trees to `/execute`. Example: `{"type":"sms","params":{"phoneNumber":"+1234567890"}}`
# decisionTrees
