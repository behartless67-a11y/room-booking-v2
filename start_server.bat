@echo off
echo.
echo ========================================
echo  UVA Room Booking Dashboard Server
echo ========================================
echo.
echo Starting local server to avoid CORS issues...
echo.

REM Check if Python is available
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python from https://python.org
    echo.
    pause
    exit /b 1
)

REM Start the server
echo Starting server at http://localhost:8000
echo.
echo Available pages:
echo   - Main Dashboard: http://localhost:8000/room-dashboard.html
echo   - Simple Dashboard: http://localhost:8000/simple-dashboard.html
echo   - Basic View: http://localhost:8000/index.html
echo.
echo Press Ctrl+C to stop the server
echo.

python serve.py

pause

