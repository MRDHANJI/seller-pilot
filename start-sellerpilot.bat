@echo off
echo Starting SellerPilot AI...
cd /d %~dp0
start "" http://localhost:3000
npm run dev
pause
