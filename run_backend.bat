@echo off
echo ========================================================
echo   Starting PactPay Backend (FastAPI + Z3 SMT Oracle)
echo ========================================================
cd /d "%~dp0backend"
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
)
python -m uvicorn main:app --reload --port 8000 2>nul || py -m uvicorn main:app --reload --port 8000
if %errorlevel% neq 0 (
    echo [ERROR] Failed to start uvicorn. Please ensure Python is installed.
    pause
)
