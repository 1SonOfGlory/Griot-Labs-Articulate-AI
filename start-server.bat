@echo off
cd /d "%~dp0"
echo Starting Articulate AI local server on http://localhost:5500
echo Press Ctrl+C to stop the server.
"C:\Python314\python.exe" -m http.server 5500 --bind 127.0.0.1
if errorlevel 1 (
  echo.
  echo Server failed to start. Check if another app is using port 5500.
  pause
)
