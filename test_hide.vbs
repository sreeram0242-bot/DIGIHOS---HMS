Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Kill old instances
WshShell.Run "powershell -NoProfile -ExecutionPolicy Bypass -Command ""Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }""", 0, True

' Run npm run all with 0 (SW_HIDE)
WshShell.Run "cmd.exe /c npm run all", 0, False
