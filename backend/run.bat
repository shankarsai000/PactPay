@echo off
if exist ".venv\Scripts\activate.bat" (
    call .venv\Scripts\activate.bat
    python -m uvicorn main:app --reload --port 8000
) else (
    echo [ERROR] Virtual environment .venv not found.
    pause
)
