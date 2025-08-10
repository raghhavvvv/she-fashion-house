@echo off
echo ========================================
echo She Fashion House - Debug Launcher
echo ========================================
echo.

echo Checking if port 3000 is available...
netstat -an | findstr :3000
if %errorlevel% equ 0 (
    echo WARNING: Port 3000 is already in use!
    echo This might cause the app to fail to start.
    echo.
    echo Press any key to continue anyway...
    pause >nul
)

echo.
echo Starting She Fashion House...
echo.
echo If you see a white screen:
echo 1. Press Ctrl+Shift+I to open DevTools
echo 2. Check the Console tab for error messages
echo 3. Check the Network tab for failed requests
echo.

"She Fashion House.exe"

echo.
echo Application closed. Press any key to exit...
pause >nul
