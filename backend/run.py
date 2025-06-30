#!/usr/bin/env python3
"""
Threadist Backend Server
Run this script to start the FastAPI server
"""

import uvicorn
from threadist_backend.main import app
from threadist_backend.config import Config

if __name__ == "__main__":
    print("🚀 Starting Threadist Backend Server...")
    print(f"📍 Server will run on http://{Config.HOST}:{Config.PORT}")
    print(f"📚 API Documentation will be available at http://{Config.HOST}:{Config.PORT}/docs")
    
    uvicorn.run(
        "threadist_backend.main:app",
        host=Config.HOST,
        port=Config.PORT,
        reload=Config.DEBUG,
        log_level="info"
    ) 