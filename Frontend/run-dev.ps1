# PowerShell script to run the development server
# Since PowerShell doesn't support && operator like bash, we use separate commands

Set-Location -Path $PSScriptRoot  # Navigate to the script's directory
Write-Host "Starting development server..." -ForegroundColor Cyan
npm run dev 