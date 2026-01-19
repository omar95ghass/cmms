@echo off
echo ====================================
echo Stopping Development Servers...
echo ====================================
echo.

REM Kill Node.js processes (npm/vite)
echo Stopping React Dev Server...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq MMS*" >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo [OK] React Dev Server stopped
) else (
    echo [INFO] React Dev Server was not running
)

REM Kill PHP server processes
echo Stopping PHP Server...
for /f "tokens=2" %%a in ('netstat -ano ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>nul
)
echo [OK] PHP Server stopped

echo.
echo All servers have been stopped.
echo.
pause
