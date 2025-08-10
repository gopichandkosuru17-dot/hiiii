@echo off
echo Starting Fake Account Detector Frontend...
echo.
cd frontend
echo Starting HTTP server on http://localhost:8000
echo.
echo LOCAL ACCESS: http://localhost:8000
echo NETWORK ACCESS: http://192.168.81.157:8000
echo.
echo Share the NETWORK link with others on your WiFi!
echo.
python -m http.server 8000 --bind 0.0.0.0
pause
