# Griot Labs_Articulate AI

Portfolio + product demo for **Articulate AI** by Griot Labs.

## Live App Scope
- Student practice arena
- Word Lab with pronunciation + popover details
- Practice Ground with live transcript + feedback flow
- Coach Vault / Coach Insights views
- Community and journey leaderboard flow

## Local Run
```powershell
cd "C:\Users\MINGOBLOX_AI\Documents\Codex\2026-04-25-the-articulate-ai-system-prompt-role"
python -m http.server 5500 --bind 127.0.0.1
```
Then open: `http://localhost:5500/`

## Deploy (Vercel via GitHub)
1. Push this repo to GitHub (recommended repo name: `griot-labs-articulate-ai`).
2. In Vercel: **Add New Project** -> Import the GitHub repo.
3. Framework preset: **Other** (static site).
4. Root Directory: project root.
5. Deploy.

`vercel.json` is already included for SPA routes.
