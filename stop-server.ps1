$line = netstat -ano | Select-String ":5500" | Select-Object -First 1

if (-not $line) {
  Write-Host "No server found on port 5500."
  exit 0
}

$parts = ($line -split "\s+") | Where-Object { $_ -ne "" }
$procId = $parts[-1]

if ($procId) {
  taskkill /PID $procId /F | Out-Null
  Write-Host "Stopped process on port 5500 (PID $procId)."
}
