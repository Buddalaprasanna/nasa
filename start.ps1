# start.ps1 - One-Click PowerShell Launcher for FIELD SHIFT
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  FIELD SHIFT - Smart Farming & Crop Rotation App" -ForegroundColor Green
Write-Host "  Smart farming. Better seasons. Stronger future." -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Green
Write-Host ""

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$backendDir = Join-Path $baseDir "backend"
$frontendDir = Join-Path $baseDir "frontend"

Write-Host "[1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$backendDir'; python -m uvicorn app.main:app --reload --port 8000"

Start-Sleep -Seconds 3

Write-Host "[2/3] Starting React Frontend on http://localhost:5173 ..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$frontendDir'; npm run dev -- --host"

Start-Sleep -Seconds 2

Write-Host "[3/3] Opening FIELD SHIFT in your default browser..." -ForegroundColor Cyan
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "========================================================" -ForegroundColor Green
Write-Host "  FIELD SHIFT is now running!" -ForegroundColor Green
Write-Host "  Frontend : http://localhost:5173" -ForegroundColor White
Write-Host "  Backend  : http://127.0.0.1:8000" -ForegroundColor White
Write-Host "  API Docs : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Green
Write-Host "Close the opened PowerShell windows to stop servers." -ForegroundColor Yellow