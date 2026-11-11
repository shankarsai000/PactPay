"""Root FastAPI entrypoint for Railway / Railpack / Cloud deployments.

Delegates directly to backend/main.py:app with backend/ added to sys.path.
"""
import os
import sys
import importlib.util
from fastapi import FastAPI

# Ensure backend directory is in python search path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

# Load backend/main.py without circular naming collision
_spec = importlib.util.spec_from_file_location("backend_main", os.path.join(BACKEND_DIR, "main.py"))
_bm = importlib.util.module_from_spec(_spec)
sys.modules["backend_main"] = _bm
_spec.loader.exec_module(_bm)

# Expose FastAPI application instance for Railpack static detection and uvicorn
app: FastAPI = _bm.app

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, workers=1)
