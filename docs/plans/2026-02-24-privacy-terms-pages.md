# Privacy & Terms Pages Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `/privacy` and `/terms` routes to the AskAneeq server serving professional static HTML pages for OpenAI ChatGPT Apps submission.

**Architecture:** Two static HTML files placed in `web/public/` are copied to `/assets` by Vite at build time. Two new Express routes in `app.ts` serve them with `res.sendFile`, matching the pattern used by the `/admin` route.

**Tech Stack:** Express.js, plain HTML/CSS, Vite (copies public/ to assets/)

---

### Task 1: Create privacy.html

**Files:**
- Create: `web/public/privacy.html`

**Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Privacy Policy — AskAneeq</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
      padding: 3rem 1.5rem;
    }
    .container { max-width: 700px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2.5rem; }
    h2 { font-size: 1.1rem; font-weight: 600; margin: 2rem 0 0.5rem; }
    p { margin-bottom: 1rem; }
    a { color: #0066cc; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2.5rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Privacy Policy</h1>
    <p class="meta">Last updated: February 24, 2026 &nbsp;·&nbsp; <a href="/">AskAneeq</a></p>

    <p>AskAneeq is a personal ChatGPT app that lets you learn about Aneeq Hassan — his experience, projects, skills, and availability. This policy explains what data is collected when you use the app.</p>

    <h2>What We Collect</h2>
    <p>When you interact with AskAneeq, the app may log the following anonymized data:</p>
    <ul style="margin: 0 0 1rem 1.5rem;">
      <li>The tool or category you queried (e.g., "experience", "projects")</li>
      <li>A timestamp of the request</li>
      <li>The message you typed, if provided to the analytics tool</li>
    </ul>
    <p>This data is stored in a private SQLite database on the server and is used solely to understand how the app is being used.</p>

    <h2>What We Don't Collect</h2>
    <p>We do not collect your name, email address, IP address, or any other identifying information. We do not use cookies or tracking pixels. We do not share any data with third parties.</p>

    <h2>Data Retention</h2>
    <p>Analytics data is retained indefinitely on the server but is never shared publicly or sold.</p>

    <h2>Third-Party Services</h2>
    <p>The app may link to <a href="https://calendly.com" target="_blank" rel="noopener">Calendly</a> for scheduling. Calendly's own privacy policy applies when you use their service.</p>

    <hr>

    <h2>Contact</h2>
    <p>Questions about this policy? Reach out:</p>
    <p>
      Email: <a href="mailto:hassan.aneeq01@gmail.com">hassan.aneeq01@gmail.com</a><br>
      Website: <a href="https://aneeqhassan.com" target="_blank" rel="noopener">aneeqhassan.com</a>
    </p>
  </div>
</body>
</html>
```

**Step 2: Verify file exists**

```bash
ls web/public/privacy.html
```
Expected: file listed.

**Step 3: Commit**

```bash
git add web/public/privacy.html
git commit -m "feat: add privacy policy static page"
```

---

### Task 2: Create terms.html

**Files:**
- Create: `web/public/terms.html`

**Step 1: Create the file**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terms of Service — AskAneeq</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 16px;
      line-height: 1.7;
      color: #1a1a1a;
      background: #fff;
      padding: 3rem 1.5rem;
    }
    .container { max-width: 700px; margin: 0 auto; }
    h1 { font-size: 2rem; font-weight: 700; margin-bottom: 0.25rem; }
    .meta { color: #666; font-size: 0.9rem; margin-bottom: 2.5rem; }
    h2 { font-size: 1.1rem; font-weight: 600; margin: 2rem 0 0.5rem; }
    p { margin-bottom: 1rem; }
    a { color: #0066cc; }
    hr { border: none; border-top: 1px solid #e5e5e5; margin: 2.5rem 0; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Terms of Service</h1>
    <p class="meta">Last updated: February 24, 2026 &nbsp;·&nbsp; <a href="/">AskAneeq</a></p>

    <p>By using AskAneeq, you agree to these terms. AskAneeq is a personal app built and operated by Aneeq Hassan.</p>

    <h2>Use of the App</h2>
    <p>AskAneeq is provided for informational purposes — to help you learn about Aneeq Hassan's professional background, skills, and availability. You may use the app for personal and professional research purposes.</p>

    <h2>No Warranties</h2>
    <p>The app is provided "as is" without warranties of any kind. We make no guarantees about uptime, accuracy, or availability. Information about Aneeq Hassan may not always be current.</p>

    <h2>Limitation of Liability</h2>
    <p>To the fullest extent permitted by law, Aneeq Hassan shall not be liable for any damages arising from your use of this app.</p>

    <h2>Changes</h2>
    <p>These terms may be updated at any time. Continued use of the app constitutes acceptance of the updated terms.</p>

    <hr>

    <h2>Contact</h2>
    <p>Questions or concerns?</p>
    <p>
      Email: <a href="mailto:hassan.aneeq01@gmail.com">hassan.aneeq01@gmail.com</a><br>
      Website: <a href="https://aneeqhassan.com" target="_blank" rel="noopener">aneeqhassan.com</a>
    </p>
  </div>
</body>
</html>
```

**Step 2: Verify file exists**

```bash
ls web/public/terms.html
```
Expected: file listed.

**Step 3: Commit**

```bash
git add web/public/terms.html
git commit -m "feat: add terms of service static page"
```

---

### Task 3: Add /privacy and /terms routes to app.ts

**Files:**
- Modify: `server/src/app.ts` (after the `/admin` route, around line 184)

**Step 1: Add the two routes**

In `server/src/app.ts`, after the `/admin` route block, add:

```typescript
// Privacy policy
app.get("/privacy", (_req, res) => {
  const privacyPath = join(__dirname, "../../assets/privacy.html");
  if (existsSync(privacyPath)) {
    res.sendFile(privacyPath);
  } else {
    res.status(503).send("<p style='font-family:sans-serif;padding:2rem'>Page not available. Run: <code>npm run build</code></p>");
  }
});

// Terms of service
app.get("/terms", (_req, res) => {
  const termsPath = join(__dirname, "../../assets/terms.html");
  if (existsSync(termsPath)) {
    res.sendFile(termsPath);
  } else {
    res.status(503).send("<p style='font-family:sans-serif;padding:2rem'>Page not available. Run: <code>npm run build</code></p>");
  }
});
```

**Step 2: Run typecheck**

```bash
npm run typecheck
```
Expected: no errors.

**Step 3: Build and verify files are in assets**

```bash
npm run build
ls assets/ | grep -E "privacy|terms"
```
Expected: `privacy.html` and `terms.html` listed.

**Step 4: Smoke test locally**

```bash
npm start &
curl -s http://localhost:8000/privacy | grep "<title>"
curl -s http://localhost:8000/terms | grep "<title>"
```
Expected:
```
<title>Privacy Policy — AskAneeq</title>
<title>Terms of Service — AskAneeq</title>
```

Kill the server after testing.

**Step 5: Commit**

```bash
git add server/src/app.ts
git commit -m "feat: add /privacy and /terms routes"
```

---

### Task 4: Create GitHub issue and PR

**Step 1: Create GitHub issue**

```bash
gh issue create \
  --title "Add /privacy and /terms pages for ChatGPT App submission" \
  --body "Add hosted privacy policy and terms of service pages required for OpenAI ChatGPT Apps Directory submission." \
  --repo HassanA01/AskAneeq
```

**Step 2: Push branch and open PR**

```bash
git push -u origin tier-3.6/analytics-persistence-user-prompts
gh pr create \
  --title "feat: add /privacy and /terms static pages" \
  --body "Adds privacy policy and terms of service pages served from the Express server at \`/privacy\` and \`/terms\`. Required for OpenAI ChatGPT Apps Directory submission." \
  --base main
```
