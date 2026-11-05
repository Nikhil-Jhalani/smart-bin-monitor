#!/bin/bash
# ==========================================================
# SmartBin Monitoring System - Quick 1-Click Launcher
# ==========================================================

# Navigate to this project directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

echo "=========================================================="
echo "🚀 Starting Smart Bin Monitoring System..."
echo "=========================================================="

# Open the site in your default browser after 2 seconds
(sleep 2 && open http://localhost:5001) &

# Run the backend and frontend
npm start
