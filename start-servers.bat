@echo off
echo ====================================
echo Medical Management System
echo Starting Development Servers...
echo ====================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

REM Check if PHP is installed
where php >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] PHP is not installed or not in PATH
    echo Please install PHP or add it to PATH
    pause
    exit /b 1
)

echo [1/2] Starting PHP Server (localhost:8000)...
start "MMS - PHP Server" cmd /k "pushd %~dp0php && php -S localhost:8000 router.php"

REM Wait a bit for PHP server to start
timeout /t 2 /nobreak >nul

echo [2/2] Starting React Dev Server (localhost:3000)...
start "MMS - React Dev Server" cmd /k "npm run dev"

REM Wait for React dev server to start (usually takes 3-5 seconds)
echo.
echo Waiting for servers to start...
timeout /t 5 /nobreak >nul

REM Open browser to Front-End URL
echo [3/3] Opening browser...
start http://localhost:3000

echo.
echo ====================================
echo Both servers are running!
echo.
echo PHP API Server:  http://localhost:8000
echo React App:       http://localhost:3000
echo.
echo Browser opened automatically.
echo.
echo Press any key to close this window
echo (Servers will continue running in separate windows)
echo ====================================
pause >nul
