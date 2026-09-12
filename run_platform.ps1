# AeroVision PowerShell Launcher
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "      AeroVision Enterprise Aviation Intelligence       " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

$env:Path = [System.Environment]::GetEnvironmentVariable('Path','Machine') + ';' + [System.Environment]::GetEnvironmentVariable('Path','User')

Write-Host "`n[1/2] Starting FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python -m uvicorn main:app --host 0.0.0.0 --port 8000"

Write-Host "[2/2] Starting React + Vite Frontend on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm.cmd run dev"

Write-Host "`nPlatform running!" -ForegroundColor Green
Write-Host "👉 Frontend Web App: http://localhost:5173/" -ForegroundColor Cyan
Write-Host "👉 Backend Swagger:  http://localhost:8000/docs" -ForegroundColor Cyan
