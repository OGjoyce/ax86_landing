#!/usr/bin/env python3
"""
AX86 Website Generator - Startup Script
FastAPI + Uvicorn for maximum performance
"""

import os
import sys
import uvicorn
from config import config, Config

def setup_environment():
    """Setup environment variables and configuration"""
    # Load environment variables from .env file if it exists
    try:
        from dotenv import load_dotenv
        load_dotenv()
    except ImportError:
        print("python-dotenv not installed, skipping .env file loading")
    
    # Validate configuration
    try:
        Config.validate()
        print("✅ Configuration validated successfully")
    except ValueError as e:
        print(f"❌ Configuration error: {e}")
        print("\nPlease set the following environment variables:")
        print("export OPENAI_API_KEY='your-openai-api-key-here'")
        print("export GPT_MODEL='gpt-4'  # optional, defaults to gpt-4")
        print("export MAX_TOKENS='4000'  # optional, defaults to 4000")
        print("export TEMPERATURE='0.7'  # optional, defaults to 0.7")
        sys.exit(1)

def print_banner():
    """Print startup banner"""
    banner = """
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║    🚀 AX86 Website Generator API - Billion Dollar Project    ║
    ║                                                              ║
    ║    Real GPT-4 Integration for AI Website Generation         ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝
    """
    print(banner)

def print_api_info():
    """Print API information"""
    print("\n🔗 API Endpoints:")
    print("   POST /api/generate  - Generate website from prompt")
    print("   GET  /api/health    - Health check")
    print("   GET  /api/stats     - API statistics")
    print("   GET  /              - Frontend interface")
    
    print(f"\n🤖 AI Configuration:")
    print(f"   Model: {Config.GPT_MODEL}")
    print(f"   Max Tokens: {Config.MAX_TOKENS}")
    print(f"   Temperature: {Config.TEMPERATURE}")
    
    print(f"\n🌐 Server Configuration:")
    print(f"   Host: {Config.HOST}")
    print(f"   Port: {Config.PORT}")
    print(f"   Debug: {Config.DEBUG}")

def main():
    """Main startup function"""
    print_banner()
    setup_environment()
    print_api_info()
    
    print(f"\n🚀 Starting AX86 Website Generator API with Uvicorn...")
    print(f"   Access the API at: http://{Config.HOST}:{Config.PORT}")
    print(f"   Interactive docs: http://{Config.HOST}:{Config.PORT}/docs")
    print(f"   Health check: http://{Config.HOST}:{Config.PORT}/api/health")
    print(f"\n💡 Ready to generate billion-dollar websites!")
    print("   Press Ctrl+C to stop the server\n")
    
    try:
        uvicorn.run(
            "app:app",
            host=Config.HOST,
            port=Config.PORT,
            reload=Config.DEBUG,
            log_level="info",
            access_log=True
        )
    except KeyboardInterrupt:
        print("\n\n👋 AX86 Website Generator API stopped. Goodbye!")
    except Exception as e:
        print(f"\n❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
