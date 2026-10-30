# PactPay Full-Stack Verification & Launcher (PowerShell)
Write-Host "==================================================================" -ForegroundColor Cyan
Write-Host "⚡ PACTPAY FULL-STACK VERIFICATION & LAUNCHER (POWERSHELL)" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $Root

# 1. Ensure __init__.py files exist
New-Item -ItemType File -Force -Path "backend\__init__.py" | Out-Null
New-Item -ItemType File -Force -Path "backend\agents\__init__.py" | Out-Null
New-Item -ItemType File -Force -Path "backend\guardrails\__init__.py" | Out-Null
New-Item -ItemType File -Force -Path "backend\services\__init__.py" | Out-Null
New-Item -ItemType File -Force -Path "backend\tests\__init__.py" | Out-Null

# 2. Virtual environment setup
if (-not (Test-Path "backend\.venv\Scripts\python.exe")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv backend\.venv
}

Write-Host "Verifying backend dependencies..."
& "backend\.venv\Scripts\python.exe" -m pip install -q -r backend\requirements.txt

# 3. Seed Elastic Cloud
if (Test-Path "backend\scripts\seed_elastic_cloud.py") {
    Write-Host "Seeding Elastic Cloud vendor telemetry..."
    & "backend\.venv\Scripts\python.exe" "backend\scripts\seed_elastic_cloud.py"
}

# 4. Pytest & FastMCP Self-Test
Write-Host "`n🧪 Running Pytest Test Suite..." -ForegroundColor Yellow
& "backend\.venv\Scripts\python.exe" -m pytest backend\tests\test_master_all_four.py -v

Write-Host "`n🛡️ Running FastMCP Server Self-Test..." -ForegroundColor Yellow
& "backend\.venv\Scripts\python.exe" "backend\mcp_server.py" --self-test

# 5. Launch Backend & Frontend
Write-Host "`n🚀 Launching FastAPI Backend on http://localhost:8000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\backend'; .\.venv\Scripts\Activate.ps1; uvicorn main:app --host 0.0.0.0 --port 8000 --reload"

Write-Host "🖥️ Launching Next.js Frontend on http://localhost:3000 ..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$Root\frontend'; npm run dev"

Write-Host "`n==================================================================" -ForegroundColor Cyan
Write-Host "✅ PactPay Full Stack Launched Successfully!" -ForegroundColor Green
Write-Host "   - Backend API & Swagger: http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host "   - Trading Floor UI:      http://localhost:3000" -ForegroundColor Cyan
Write-Host "==================================================================" -ForegroundColor Cyan
