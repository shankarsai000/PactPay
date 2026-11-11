"""Root FastAPI entrypoint for Railway / Railpack / Cloud deployments.

Delegates directly to backend/main.py:app with backend/ added to sys.path.
"""
import os
import sys

# Ensure backend directory is in python search path
BACKEND_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from main import app  # Expose FastAPI application instance for uvicorn

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
