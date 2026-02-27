@echo off
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :3016') do taskkill /F /PID %%a >nul 2>&1
if exist .next\cache rd /s /q .next\cache >nul 2>&1
start "" http://localhost:3016
call npm run dev -- --port 3016
