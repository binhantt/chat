@echo off
cd /d d:\chat\Frontend
echo Building...
call node node_modules\next\dist\bin\next build --webpack
echo Done.
pause
