$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location -Path $scriptDir

# 1. Cleanly free old instances on ports 5000 and 5173
Get-NetTCPConnection -LocalPort 5000, 5173 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
}

# 2. Wait for server to become ready and automatically launch default browser
Start-Job -ScriptBlock {
    for ($i = 0; $i -lt 30; $i++) {
        try {
            $r = Invoke-WebRequest -Uri 'http://localhost:5173' -UseBasicParsing -TimeoutSec 1
            if ($r.StatusCode -eq 200) { break }
        } catch {}
        Start-Sleep -Milliseconds 400
    }
    Start-Process 'http://localhost:5173'
} | Out-Null

# 3. Run npm run all in 100% invisible mode (0 = SW_HIDE, zero console window)
$wsh = New-Object -ComObject WScript.Shell
$wsh.CurrentDirectory = $scriptDir
$wsh.Run("cmd.exe /c npm run all", 0, $true)
