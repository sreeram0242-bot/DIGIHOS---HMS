$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir

# 1. Kill any existing processes holding port 5000 or 5173
Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# 2. Launch Backend (node server/server.js) with CreateNoWindow = True
$psiServer = New-Object System.Diagnostics.ProcessStartInfo
$psiServer.FileName = "node.exe"
$psiServer.Arguments = "server/server.js"
$psiServer.WorkingDirectory = $scriptDir
$psiServer.CreateNoWindow = $true
$psiServer.UseShellExecute = $false
$psiServer.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
[System.Diagnostics.Process]::Start($psiServer) | Out-Null

# 3. Launch Frontend (npx vite --port 5173) with CreateNoWindow = True
$psiClient = New-Object System.Diagnostics.ProcessStartInfo
$psiClient.FileName = "cmd.exe"
$psiClient.Arguments = "/c npx vite --port 5173"
$psiClient.WorkingDirectory = $scriptDir
$psiClient.CreateNoWindow = $true
$psiClient.UseShellExecute = $false
$psiClient.WindowStyle = [System.Diagnostics.ProcessWindowStyle]::Hidden
[System.Diagnostics.Process]::Start($psiClient) | Out-Null
