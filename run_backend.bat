@echo off
echo ========================================================
echo   Starting PactPay Backend (FastAPI + Z3 SMT Oracle)
echo ========================================================
cd /d "%~dp0backend"
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    python -m uvicorn main:app --reload --port 8000
) else (
    echo [ERROR] Virtual environment not found in backend\.venv
    echo Please create it with: py -3.11 -m venv .venv
    pause
)
