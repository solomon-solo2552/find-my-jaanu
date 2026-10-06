@echo off
echo Running backend tests...
cd backend
call .venv\Scripts\activate.bat
pytest
if errorlevel 1 exit /b 1
cd ..

echo.
echo Running frontend tests...
cd frontend
call npm test
if errorlevel 1 exit /b 1
cd ..

echo.
echo All tests passed!