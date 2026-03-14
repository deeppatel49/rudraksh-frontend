@echo off
echo Cleaning up old processes and lock files...
taskkill /F /IM node.exe 2>nul
timeout /t 1 /nobreak >nul
if exist ".next\dev\lock" del /F ".next\dev\lock"

echo Starting Next.js development server...
npm run dev
