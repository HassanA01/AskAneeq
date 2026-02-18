# CI/CD Pipeline

## Overview

GitHub Actions runs on every push to `main` and every pull request targeting `main`. The pipeline validates code quality, correctness, and buildability.

## Pipeline Steps

```
Install dependencies → Lint → Type check → Test server → Test web → Build
```

Each step must pass before the next runs. The pipeline tests against Node.js 20 and 22.

## Configuration

File: `.github/workflows/ci.yml`

### Jobs

| Step | Command | What it checks |
|------|---------|----------------|
| Install | `npm ci` | Dependencies resolve cleanly from lockfile |
| Lint | `npm run lint` | ESLint rules pass (TypeScript-aware) |
| Type check | `npm run typecheck` | Both server and web compile without type errors |
| Test server | `npm run test:server` | All server tool unit tests pass |
| Test web | `npm run test:web` | All widget component tests pass |
| Build | `npm run build` | Web widget builds (Vite) and server compiles (tsc) |

### Node.js Matrix

Tests run on Node 20 (LTS) and Node 22 (current LTS) to ensure compatibility.

## Local Validation

Run the full CI pipeline locally before pushing:

```bash
npm run ci
```

This runs lint, typecheck, test, and build sequentially — the same checks as the GitHub Actions workflow.

## Branch Protection (Recommended)

To enforce CI on PRs, enable branch protection on `main`:

1. Go to repo Settings → Branches → Add rule
2. Branch name pattern: `main`
3. Enable "Require status checks to pass before merging"
4. Select the `ci` workflow checks
5. Enable "Require branches to be up to date before merging"
