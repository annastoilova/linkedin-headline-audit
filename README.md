# LinkedIn Headline Audit Tool

A free tool from The MVB Lab. Audits LinkedIn headlines and returns a score, specific feedback, and three AI-powered rewrites.

## What's in this folder

```
headline-audit-vercel/
├── api/
│   └── audit.js          ← Serverless function (handles the AI call)
├── index.html            ← The page
├── styles.css            ← All styling
├── app.js                ← Frontend logic
├── vercel.json           ← Vercel config
├── package.json          ← Project metadata
└── README.md             ← This file
```

## Deploy to Vercel — step by step

### 1. Get an Anthropic API key

Go to https://console.anthropic.com → API Keys → Create Key.

Top up $5 to $10 of credit. Each audit costs roughly $0.01 to $0.02, so $10 covers around 500 to 1,000 audits.

Copy the key. You'll paste it into Vercel in step 4.

### 2. Push this folder to GitHub

If you don't have a GitHub repo for this yet:

1. Go to github.com → New repository
2. Name it `linkedin-headline-audit` (or whatever)
3. Upload this whole folder, or use `git init` + `git push` if you're comfortable with that

### 3. Connect to Vercel

1. Go to vercel.com → log in (sign up with GitHub for the easiest setup)
2. Click "Add New Project"
3. Import the GitHub repo you just made
4. Don't change any build settings — Vercel auto-detects everything
5. **Stop before clicking Deploy.** Go to the next step first.

### 4. Add the API key as an environment variable

Still on the Vercel deploy screen:

1. Expand "Environment Variables"
2. Add a variable:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** the API key you copied in step 1
3. Click Deploy.

That's it. Vercel will give you a live URL like `linkedin-headline-audit.vercel.app`.

### 5. Test it

Open the URL. Run an audit on your own headline. Check it works.

## Adding a custom domain (optional)

In Vercel → your project → Settings → Domains. Add `audit.thmvblab.com` (or whatever subdomain you like) and follow Vercel's DNS instructions.

## Updating the tool later

Edit any file → push to GitHub → Vercel auto-deploys. No manual rebuild needed.

## Cost guardrails

The serverless function rejects oversized inputs (500-char headlines, 300-char audience/outcome) to prevent abuse. If you ever want to add stricter rate limiting, Vercel has a built-in `@vercel/edge-config` rate limiter you can add in 10 minutes.

## Troubleshooting

**404 NOT_FOUND on the deployed URL**
→ Make sure `index.html`, `styles.css`, and `app.js` are at the project root, not inside a subfolder. Vercel serves static files from the root automatically.

**"Something went wrong" on every audit**
→ The API key isn't set, or it's wrong. Re-check the environment variable in Vercel → Settings → Environment Variables. After changing it, redeploy from the Deployments tab.

**Function returns 500**
→ Open the Vercel dashboard → your project → Logs. Most likely an Anthropic API issue (no credit, wrong model name, etc.).

**Page loads but the button does nothing**
→ Open browser console (F12). If you see a 404 on `/api/audit`, the file isn't in the right place. Make sure `audit.js` is inside the `api/` folder at the project root.

---

Authenticity over polish. Clarity over noise.
THE MVB LAB · skool.com/mvb
