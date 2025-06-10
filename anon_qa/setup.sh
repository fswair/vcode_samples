#!/bin/bash

# Script to manually set up the Anonymous Q&A Website project

echo "Setting up Anonymous Q&A Website"

# Check if Python 3.11 is installed
if ! command -v python3 &> /dev/null
then
    echo "Python 3 is not installed. Please install Python 3.11 first."
    exit 1
fi

# Create a virtual environment
cd backend
echo "Creating a virtual environment..."
python3.11 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Run the backend server
echo "Starting the backend server..."
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Instructions for the user
echo "Backend server is running on http://localhost:8000"
echo "Please open the 'frontend/index.html' file in your browser to access the frontend."
echo "Alternatively, you can serve the frontend folder using a static file server like 'python -m http.server' from the frontend directory on a different port."
