Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Terminate node and vite processes listening on ports 5000 and 5173
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -Command ""Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }""", 0, True

MsgBox "DIGIHOS Hospital Backend and Frontend have been completely stopped.", 64, "DIGIHOS Controller"
