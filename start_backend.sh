#!/bin/bash
echo "Starting Fake Account Detector Backend..."
echo
cd backend
echo "Installing dependencies..."
pip install -r requirements.txt
echo
echo "Starting Flask API server on http://localhost:5000"
python api.py


