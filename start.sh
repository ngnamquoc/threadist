#!/bin/bash

# Threadist Startup Script
# This script starts both the backend and frontend servers

echo "🚀 Starting Threadist Application..."

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check if Python is installed
if ! command_exists python3; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

# Check if Node.js is installed
if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

# Check if npm is installed
if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Function to start backend
start_backend() {
    echo "🔧 Starting Backend Server..."
    cd backend
    
    # Install dependencies with Poetry
    echo "📦 Installing backend dependencies with Poetry..."
    poetry install
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "⚠️  Warning: .env file not found in backend directory."
        echo "   Please create a .env file with your environment variables."
        echo "   You can copy env.example to .env and edit it."
    fi
    
    # Start backend server using Poetry
    echo "🚀 Starting FastAPI server..."
    poetry run python run.py &
    BACKEND_PID=$!
    echo "✅ Backend server started (PID: $BACKEND_PID)"
    
    cd ..
}

# Function to start frontend
start_frontend() {
    echo "📱 Starting Frontend Server..."
    cd frontend
    
    # Install dependencies
    echo "📦 Installing frontend dependencies..."
    npm install
    
    # Check if .env file exists
    if [ ! -f ".env" ]; then
        echo "⚠️  Warning: .env file not found in frontend directory."
        echo "   Please create a .env file with your environment variables."
    fi
    
    # Start frontend server
    echo "🚀 Starting Expo development server..."
    npm start &
    FRONTEND_PID=$!
    echo "✅ Frontend server started (PID: $FRONTEND_PID)"
    
    cd ..
}

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo "✅ Backend server stopped"
    fi
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo "✅ Frontend server stopped"
    fi
    exit 0
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Start servers
start_backend
sleep 3  # Give backend time to start
start_frontend

echo ""
echo "🎉 Threadist is starting up!"
echo ""
echo "📍 Backend API: http://localhost:8000"
echo "📚 API Documentation: http://localhost:8000/docs"
echo "📱 Frontend: Check the Expo CLI output for the URL"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user to stop
wait 