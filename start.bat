@echo off
title FIELD SHIFT - Launcher
color 0A

echo ========================================================
echo   FIELD SHIFT - Smart Farming ^& Crop Rotation App
echo   Smart farming. Better seasons. Stronger future.
echo ========================================================
echo.

set SCRIPT_DIR=%~dp0
echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "FIELD SHIFT - Backend (FastAPI)" cmd /k "cd /d %SCRIPT_DIR%backend && python -m uvicorn app.main:app --reload --port 8000"

timeout /t 3 /nobreak >nul

echo [2/3] Starting React Frontend on http://localhost:5173 ...
start "FIELD SHIFT - Frontend (Vite React)" cmd /k "cd /d %SCRIPT_DIR%frontend && npm run dev -- --host"

timeout /t 2 /nobreak >nul

echo [3/3] Opening FIELD SHIFT in your default browser...
start http://localhost:5173

echo.
echo ========================================================
echo   FIELD SHIFT is now running!
echo   Frontend : http://localhost:5173
echo   Backend  : http://127.0.0.1:8000
echo   API Docs : http://127.0.0.1:8000/docs
echo ========================================================
echo.
echo To stop the application, simply close the two command windows.
pause

