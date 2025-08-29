#!/bin/bash

echo ""
echo "========================================"
echo " UVA Room Booking Dashboard Server"
echo "========================================"
echo ""
echo "Starting local server to avoid CORS issues..."
echo ""

# Check if Python is available
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "ERROR: Python is not installed or not in PATH"
    echo "Please install Python from https://python.org"
    echo ""
    exit 1
fi

# Use python3 if available, otherwise python
if command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

echo "Starting server at http://localhost:8000"
echo ""
echo "Available pages:"
echo "  - Main Dashboard: http://localhost:8000/room-dashboard.html"
echo "  - Simple Dashboard: http://localhost:8000/simple-dashboard.html"
echo "  - Basic View: http://localhost:8000/index.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

$PYTHON_CMD serve.py

