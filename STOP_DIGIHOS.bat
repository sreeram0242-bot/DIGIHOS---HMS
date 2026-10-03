@echo off
title Stop DIGIHOS
echo Stopping DIGIHOS processes on ports 5000 and 5173...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }"
echo All DIGIHOS server instances have been stopped cleanly.
ping 127.0.0.1 -n 2 >nul
exit
