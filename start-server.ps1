$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

Write-Host "Starting Articulate AI local server on http://localhost:5500"
Write-Host "Press Ctrl+C to stop the server."

& 'C:\Python314\python.exe' -m http.server 5500 --bind 127.0.0.1
