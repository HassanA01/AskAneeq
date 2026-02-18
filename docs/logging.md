# Logging & Observability

## Overview

AskAneeq uses [pino](https://getpino.io/) for structured JSON logging. Every request gets a unique ID for end-to-end traceability.

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `LOG_LEVEL` | `info` (production), `debug` (development) | Log verbosity: `fatal`, `error`, `warn`, `info`, `debug`, `trace` |
| `NODE_ENV` | — | Set to `production` for JSON output; otherwise human-readable |

## Request Logging

Every HTTP request is automatically logged on completion with:

```json
{
  "level": 30,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "url": "/mcp",
  "statusCode": 200,
  "responseTimeMs": 42,
  "msg": "request completed"
}
```

## Request IDs

Each request receives a UUID via the `X-Request-Id` response header. This ID is:

- Included in all log entries for that request
- Returned in error responses for debugging
- Propagated to child loggers in the MCP handler

## Error Handling

Errors are captured at two levels:

1. **MCP handler** — catches tool/transport errors, logs with request context
2. **Express error middleware** — catches unhandled errors, logs stack trace + request metadata

Error responses include the `requestId` for correlation:

```json
{
  "error": "Internal server error",
  "requestId": "550e8400-e29b-41d4-a716-446655440000"
}
```

## Health Endpoint

`GET /health` returns server status for uptime monitoring:

```json
{
  "status": "ok",
  "service": "ask-aneeq",
  "version": "1.0.0",
  "uptime": 3600.123,
  "timestamp": "2026-02-18T12:00:00.000Z"
}
```

## Usage in Code

```typescript
import { logger } from "./logger.js";

// Basic logging
logger.info("Server started");
logger.error({ err: error }, "Something failed");

// Child logger with context
const reqLogger = logger.child({ requestId: "abc-123" });
reqLogger.info("Processing request");
```

## Files

| File | Purpose |
|------|---------|
| `server/src/logger.ts` | Pino logger instance and configuration |
| `server/src/logger.test.ts` | Logger unit tests |
| `server/src/server.ts` | Request logging middleware, error handler |
