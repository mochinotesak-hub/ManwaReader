@echo off
echo Stopping ManwaReader servers (ports 3001 and 7890)...

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do (
    if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :7890') do (
    if not "%%a"=="0" taskkill /F /PID %%a >nul 2>&1
)

echo ManwaReader backend (3001) and frontend (7890) stopped successfully.
pause
