#!/bin/bash

# AX86 Website Generator - Uvicorn Startup Script
# The Billion Dollar Project 🚀

echo "🚀 Starting AX86 Website Generator with Uvicorn..."
echo "   FastAPI + Uvicorn for maximum performance"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "app.py" ]; then
    echo "❌ Please run this script from the backend directory."
    echo "   Current directory: $(pwd)"
    echo "   Expected file: app.py"
    exit 1
fi

# Check for OpenAI API key
if [ -z "$OPENAI_API_KEY" ]; then
    echo ""
    echo "⚠️  OPENAI_API_KEY environment variable is not set!"
    echo ""
    echo "Please set your OpenAI API key:"
    echo "   export OPENAI_API_KEY='your-openai-api-key-here'"
    echo ""
    read -p "Do you want to set it now? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        read -p "Enter your OpenAI API key: " api_key
        export OPENAI_API_KEY="$api_key"
        echo "✅ API key set for this session"
    else
        echo "❌ Cannot start without API key. Exiting."
        exit 1
    fi
fi

# Install dependencies if needed
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
    source venv/bin/activate
    echo "📥 Installing dependencies..."
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Start with Uvicorn
echo ""
echo "🚀 Starting AX86 Website Generator API with Uvicorn..."
echo "   Access at: http://localhost:5000"
echo "   Interactive docs: http://localhost:5000/docs"
echo "   Health check: http://localhost:5000/api/health"
echo ""
echo "💡 Ready to generate billion-dollar websites!"
echo "   Press Ctrl+C to stop the server"
echo ""

uvicorn app:app --host 0.0.0.0 --port 5000 --reload --log-level info
