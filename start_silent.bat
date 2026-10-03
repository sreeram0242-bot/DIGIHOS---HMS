@echo off
cd /d "%~dp0"

:: 1. Clear any stuck processes on ports 5000 and 5173 to ensure clean start
powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"

:: 2. Launch the backend server and frontend concurrently in the background
start /B npm run all > "%~dp0server_output.log" 2>&1

:: 3. Polling check until system is ready, then automatically launch browser
powershell -NoProfile -Command "for ($i = 0; $i -lt 40; $i++) { try { $r = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 1; if ($r.StatusCode -eq 200) { break } } catch {}; Start-Sleep -Milliseconds 500 }; Start-Process 'http://localhost:5173'"
