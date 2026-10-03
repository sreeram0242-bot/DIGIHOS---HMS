@echo off
start "" powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0start_services.ps1"
exit
