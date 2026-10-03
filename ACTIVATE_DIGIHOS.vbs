Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir

' Launch hidden powershell daemon with WindowStyle Hidden (0 = SW_HIDE)
WshShell.Run "powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File """ & scriptDir & "\start_services.ps1""", 0, False
