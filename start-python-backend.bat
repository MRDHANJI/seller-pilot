@echo off
echo Starting Python Selenium API for SellerPilot...
cd /d %~dp0\python_backend

:: Check if fastapi and selenium are installed
python -m pip install fastapi uvicorn selenium pydantic

echo.
echo =======================================================
echo  API running at http://localhost:8000
echo  Keep this window open while using the Keyword Tracker!
echo =======================================================
echo.

python main.py
pause
