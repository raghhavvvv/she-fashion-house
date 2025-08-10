@echo off
echo Starting She Fashion House Server... please keep this window open.
echo.
start node app.js
timeout /t 3 /nobreak > nul
start http://localhost:3000
exit