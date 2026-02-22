# Deployment

## Overview

AskAneeq ships as a Docker container. The multi-stage Dockerfile builds the web widget and server, then produces a minimal production image.

## Docker

### Local Dev with docker-compose

```bash
docker-compose up
```

This starts the server on port 8000 with a named volume (`analytics-data`) mounted at `/app/data`, so the SQLite database persists across restarts.

### Build and Run (manual)

```bash
# Build the image
docker build -t ask-aneeq .

# Run with persistent analytics volume
docker run -p 8000:8000 \
  -v analytics-data:/app/data \
  -e ANALYTICS_DB_PATH=/app/data/analytics.db \
  ask-aneeq

# Run with additional environment variables
docker run -p 8000:8000 \
  -v analytics-data:/app/data \
  -e ANALYTICS_DB_PATH=/app/data/analytics.db \
  -e SERVER_URL=https://your-domain.com \
  -e CORS_ORIGINS=https://custom-origin.com \
  ask-aneeq
```

### How the Dockerfile Works

| Stage | What it does |
|-------|-------------|
| **Build** | Installs all dependencies, builds the web widget (Vite) and compiles the server (tsc) |
| **Production** | Copies only compiled server code, built widget assets, and production dependencies |

The final image contains no source code, dev dependencies, or build tools.

## Platform Deployment

### Railway

1. Connect your GitHub repository
2. Railway auto-detects the Dockerfile
3. Set environment variables in the Railway dashboard:
   - `NODE_ENV=production`
   - `SERVER_URL=https://<your-railway-url>`
   - `PORT=8000` (Railway sets this automatically)
4. Add a persistent volume: Railway dashboard → your service → Volumes → Add Volume, mount path `/app/data`
5. Set `ANALYTICS_DB_PATH=/app/data/analytics.db`
6. Deploy

### Fly.io

```bash
# Install flyctl, then:
fly launch
fly volumes create analytics_data --size 1
fly secrets set NODE_ENV=production SERVER_URL=https://<your-app>.fly.dev ANALYTICS_DB_PATH=/app/data/analytics.db
fly deploy
```

Add to `fly.toml`:
```toml
[mounts]
  source = "analytics_data"
  destination = "/app/data"
```

### Render

1. Connect your GitHub repository
2. Select "Docker" as the environment
3. Set environment variables:
   - `NODE_ENV=production`
   - `SERVER_URL=https://<your-render-url>.onrender.com`
   - `ANALYTICS_DB_PATH=/app/data/analytics.db`
4. Add a Disk: Render dashboard → your service → Disks → Add Disk, mount path `/app/data`
5. Deploy

## Environment Variables

See `.env.example` for the full list. Key production variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | Set to `production` |
| `SERVER_URL` | Recommended | Public URL for startup logs |
| `PORT` | No | Server port (default: 8000, most platforms set this) |
| `CORS_ORIGINS` | No | Additional allowed CORS origins |
| `LOG_LEVEL` | No | Log verbosity (default: `info` in production) |
| `RATE_LIMIT_MAX` | No | Max requests per 15-min window (default: 100) |

## Auto-Deploy

All three platforms support auto-deploy on push to `main`:

- **Railway**: Enabled by default when connected to GitHub
- **Fly.io**: Add `fly deploy` to your CI pipeline
- **Render**: Enabled by default when connected to GitHub

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build for production image |
| `.dockerignore` | Excludes unnecessary files from Docker context |
| `.env.example` | Documents all environment variables |
