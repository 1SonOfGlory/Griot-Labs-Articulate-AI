$listener = netstat -ano | Select-String 'LISTENING' | Select-String ':5500'
if ($listener) {
  Write-Host 'Port 5500 is listening:'
  $listener
} else {
  Write-Host 'Port 5500 is NOT listening.'
}

try {
  $resp = Invoke-WebRequest -Uri 'http://localhost:5500' -UseBasicParsing -TimeoutSec 3
  Write-Host "HTTP status: $($resp.StatusCode)"
} catch {
  Write-Host "HTTP check failed: $($_.Exception.Message)"
}
