@echo off
title Ary - Launcher
echo Starting tunnel and backend...
echo.

REM Ensure Cloudflare Tunnel service is running (dashboard-installed tunnel -> ary_mvp_backend.com)
net start cloudflared 2>nul
if errorlevel 1 net start "Cloudflare Tunnel" 2>nul

REM Start backend in a new window (production)
start "Ary Backend" cmd /k "cd /d %~dp0backend && (if not exist dist\index.js (echo Building... && call npm run build)) && set NODE_ENV=production && echo Ary V0 API on http://localhost:3001 && echo Public: https://ary_mvp_backend.com && node dist/index.js"

echo.
echo Backend is starting in the other window.
echo Tunnel (ary_mvp_backend.com) uses the Cloudflare service if installed.
echo Close the "Ary Backend" window to stop the API.
echo.
pause
