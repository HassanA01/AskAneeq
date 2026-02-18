# Security

## Overview

AskAneeq applies defense-in-depth with HTTP security headers, CORS restrictions, and rate limiting.

## HTTP Security Headers (Helmet)

[Helmet](https://helmetjs.github.io/) sets secure HTTP headers automatically, including:

- `Content-Security-Policy` — restricts resource loading sources
- `X-Content-Type-Options: nosniff` — prevents MIME sniffing
- `X-Frame-Options: SAMEORIGIN` — prevents clickjacking
- `Strict-Transport-Security` — enforces HTTPS
- `X-XSS-Protection` — legacy XSS filter

## CORS

CORS behavior depends on the environment:

| Environment | Behavior |
|-------------|----------|
| Production (`NODE_ENV=production`) | Only allows ChatGPT domains (`chatgpt.com`, `cdn.oaistatic.com`) + any origins in `CORS_ORIGINS` |
| Development | Allows all origins (permissive for local testing) |

### Adding Custom Origins

Set `CORS_ORIGINS` as a comma-separated list:

```bash
CORS_ORIGINS=https://my-staging.example.com,https://my-other-app.com
```

### Exposed Headers

The `Mcp-Session-Id` header is exposed to allow clients to track MCP sessions.

## Rate Limiting

The `/mcp` endpoint is rate-limited to prevent abuse:

| Setting | Default | Environment Variable |
|---------|---------|---------------------|
| Window | 15 minutes | — |
| Max requests per IP | 100 | `RATE_LIMIT_MAX` |
| Headers | Standard (`RateLimit-*`) | — |

When the limit is exceeded, the server returns:

```json
HTTP 429 Too Many Requests

{
  "error": "Too many requests, please try again later"
}
```

## Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `NODE_ENV` | — | Set to `production` for strict CORS |
| `CORS_ORIGINS` | — | Additional allowed origins (comma-separated) |
| `RATE_LIMIT_MAX` | `100` | Max requests per 15-minute window per IP |

## Files

| File | Purpose |
|------|---------|
| `server/src/server.ts` | Helmet, CORS, and rate limiting middleware |
| `.env.example` | Environment variable documentation |
