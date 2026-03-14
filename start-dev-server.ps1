# Start Next.js Development Server
Write-Host "Cleaning up old processes and lock files..." -ForegroundColor Yellow

# Stop any existing node processes
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 1

# Remove lock file if it exists
$lockFile = ".\.next\dev\lock"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force -ErrorAction SilentlyContinue
    Write-Host "Lock file removed" -ForegroundColor Green
}

Write-Host "Starting Next.js development server..." -ForegroundColor Cyan
npm run dev
