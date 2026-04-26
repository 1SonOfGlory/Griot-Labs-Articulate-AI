# Testing the Website Locally

## Quickest option (no server)
1. Open this file directly in your browser:
   - `C:\Users\MINGOBLOX_AI\Documents\Codex\2026-04-25-the-articulate-ai-system-prompt-role\index.html`

## Better option (local server)
1. Double-click:
   - `C:\Users\MINGOBLOX_AI\Documents\Codex\2026-04-25-the-articulate-ai-system-prompt-role\start-server.bat`
2. Keep the terminal window open during the demo.
3. Open:
   - `http://127.0.0.1:5500`
4. If needed, also try:
   - `http://localhost:5500`

## What to check
- Desktop + mobile responsiveness
- Navigation links scroll correctly
- Animations are smooth and not janky
- Form renders and submit interaction works
- Typography loads (Google Fonts)

## Optional mobile check
- In browser dev tools, toggle device toolbar and test widths:
  - 390px
  - 768px
  - 1024px

## Stop the server
- Run:
  - `powershell -ExecutionPolicy Bypass -File "C:\Users\MINGOBLOX_AI\Documents\Codex\2026-04-25-the-articulate-ai-system-prompt-role\stop-server.ps1"`
