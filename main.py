"""Root FastAPI entrypoint for Railway / Railpack / Cloud deployments.

Directly instantiates `app = FastAPI()` so Railpack automatically detects
FastAPI and executes `uvicorn main:app --host 0.0.0.0 --port $PORT`.
"""
import os
import sys
import importlib.util
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure backend directory is in python search path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load backend/main.py
_spec = importlib.util.spec_from_file_location("backend_main", os.path.join(BACKEND_DIR, "main.py"))
_bm = importlib.util.module_from_spec(_spec)
sys.modules["backend_main"] = _bm
_spec.loader.exec_module(_bm)

# Railpack AST pattern match requires exact `app = FastAPI(...)`
app = FastAPI(
    title="PactPay Autonomous A2A Procurement & SMT Guardrail Engine",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount the backend application
app.mount("/", _bm.app)

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, workers=1)
