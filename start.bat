@echo off
title AeroVision Platform Launcher
color 0B
echo ========================================================
echo       AeroVision Enterprise Aviation Intelligence       
echo ========================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8000 ...
start "AeroVision Backend" cmd /k "cd backend && python -m uvicorn main:app --host 0.0.0.0 --port 8000"

echo [2/2] Starting React + Vite Frontend on http://localhost:5173 ...
start "AeroVision Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo Platform is launching!
echo Frontend: http://localhost:5173/
echo Backend:  http://localhost:8000/docs
echo ========================================================
pause
