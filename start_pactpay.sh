#!/usr/bin/env bash
set -e

echo "=================================================================="
echo "⚡ PACTPAY FULL-STACK VERIFICATION & LAUNCHER"
echo "=================================================================="

# 1. Ensure Python package __init__.py files exist
touch backend/__init__.py \
      backend/agents/__init__.py \
      backend/guardrails/__init__.py \
      backend/services/__init__.py \
      backend/tests/__init__.py

# 2. Setup Backend Virtual Environment & Dependencies
cd backend
if [ ! -d ".venv" ]; then
  python3 -m venv .venv || python -m venv .venv
fi
if [ -f ".venv/bin/activate" ]; then
  source .venv/bin/activate
elif [ -f ".venv/Scripts/activate" ]; then
  source .venv/Scripts/activate
fi
pip install -q -r requirements.txt

# 3. Seed Elastic Cloud if credentials are configured
if [ -f "scripts/seed_elastic_cloud.py" ]; then
  python scripts/seed_elastic_cloud.py
fi

# 4. Run Automated 19-Test Pytest Suite + MCP Self-Test
echo -e "\n🧪 Running 19-Test Master Pytest Suite..."
pytest tests/test_master_all_four.py -v

echo -e "\n🛡️ Running FastMCP Server Self-Test..."
python mcp_server.py --self-test

# 5. Start FastAPI Backend in background
echo -e "\n🚀 Starting FastAPI Backend on http://localhost:8000 ..."
uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# 6. Install & Start Next.js AG Grid Frontend
cd frontend
if [ ! -d "node_modules" ]; then
  npm install
fi
echo -e "\n🖥️ Starting Next.js AG Grid Trading Floor on http://localhost:3000 ..."
npm run dev &
FRONTEND_PID=$!
cd ..

trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true" EXIT
wait
