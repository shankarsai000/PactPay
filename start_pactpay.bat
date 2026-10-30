@echo off
echo ==================================================================
echo ⚡ PACTPAY FULL-STACK VERIFICATION & LAUNCHER (WINDOWS)
echo ==================================================================

cd /d "%~dp0"

REM 1. Ensure package __init__.py files exist
type nul > backend\__init__.py 2>nul
type nul > backend\agents\__init__.py 2>nul
type nul > backend\guardrails\__init__.py 2>nul
type nul > backend\services\__init__.py 2>nul
type nul > backend\tests\__init__.py 2>nul

REM 2. Activate virtual environment
if not exist "backend\.venv\Scripts\python.exe" (
    echo Creating Python virtual environment...
    python -m venv backend\.venv
)

echo Installing / verifying backend dependencies...
backend\.venv\Scripts\python.exe -m pip install -q -r backend\requirements.txt

REM 3. Seed Elastic Cloud if credentials configured
if exist "backend\scripts\seed_elastic_cloud.py" (
    echo Seeding Elastic Cloud...
    backend\.venv\Scripts\python.exe backend\scripts\seed_elastic_cloud.py
)

REM 4. Run Pytest Suite & MCP Self-Test
echo.
echo 🧪 Running Pytest Test Suite...
backend\.venv\Scripts\python.exe -m pytest backend\tests\test_master_all_four.py -v

echo.
echo 🛡️ Running FastMCP Server Self-Test...
backend\.venv\Scripts\python.exe backend\mcp_server.py --self-test

echo.
echo 🚀 Starting FastAPI Backend in background on http://localhost:8000 ...
start "PactPay Backend (FastAPI)" cmd /k "cd backend && .venv\Scripts\activate.bat && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

echo 🖥️ Starting Next.js Frontend in background on http://localhost:3000 ...
start "PactPay Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo ==================================================================
echo ✅ PactPay Backend & Frontend launched in active terminals!
echo    - Backend:  http://localhost:8000
echo    - Frontend: http://localhost:3000
echo ==================================================================
