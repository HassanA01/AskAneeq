# Design: /privacy and /terms Static Pages

**Date:** 2026-02-24
**Status:** Approved

## Goal

Add hosted `/privacy` and `/terms` pages to the AskAneeq server to satisfy OpenAI ChatGPT Apps submission requirements.

## Approach

Static HTML files placed in `web/public/` so Vite copies them to `/assets` at build time. The existing `express.static` middleware in `app.ts` serves them automatically. Two explicit Express routes (`/privacy`, `/terms`) serve the files directly for clean URLs (no `.html` extension).

## Files

| File | Purpose |
|------|---------|
| `web/public/privacy.html` | Privacy policy page |
| `web/public/terms.html` | Terms of service page |
| `server/src/app.ts` | Add `/privacy` and `/terms` routes |

## Content

### Privacy Policy
- What data is collected: anonymized query logs (tool name, category, timestamp, user message) stored in SQLite on the server
- No personal data collected beyond what users voluntarily type into ChatGPT
- No third-party sharing
- Contact: hassan.aneeq01@gmail.com
- Website: aneeqhassan.com

### Terms of Service
- App provided as-is for informational purposes about Aneeq Hassan
- No warranties on availability or accuracy
- Contact for disputes: hassan.aneeq01@gmail.com

## Style

- Light background, clean professional typography
- Max-width container (~700px), centered
- Readable font size, good line height
- No dark theme — legal pages should be easy to read

## URLs (production)

- `https://ask-aneeq-server-production.up.railway.app/privacy`
- `https://ask-aneeq-server-production.up.railway.app/terms`

## Testing

No automated tests needed — static assets verified manually after deploy.
