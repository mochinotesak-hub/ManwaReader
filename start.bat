@echo off
echo Starting ManwaReader Backend and Frontend on port 7890...
start cmd /k "cd /d "%~dp0" && node server.js"
start cmd /k "cd /d "%~dp0" && npm run dev"
timeout /t 2 >nul
start http://localhost:7890/
