@echo off
title Sharanabasava - Portfolio Server
echo ========================================================
echo   Launching Sharanabasava Royal Portfolio Ledger...
echo ========================================================
echo.
echo Opening browser at http://localhost:4180 ...
start "" "http://localhost:4180"
node server.js
pause
