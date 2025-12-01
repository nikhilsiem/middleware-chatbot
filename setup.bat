@echo off
echo 🚀 Setting up AI Chatbot...
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 16+ first.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js %NODE_VERSION% detected
echo.

REM Setup Backend
echo 📦 Setting up backend...
cd backend

if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit backend\.env and add your OpenAI API key!
) else (
    echo ✅ .env file already exists
)

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install backend dependencies
    pause
    exit /b 1
)

echo ✅ Backend dependencies installed
cd ..

REM Setup Frontend
echo.
echo 📦 Setting up frontend...
cd frontend

if not exist ".env" (
    echo ⚠️  Creating .env file from template...
    copy .env.example .env
    echo ✅ Frontend .env created
) else (
    echo ✅ .env file already exists
)

echo Installing frontend dependencies...
call npm install

if %ERRORLEVEL% NEQ 0 (
    echo ❌ Failed to install frontend dependencies
    pause
    exit /b 1
)

echo ✅ Frontend dependencies installed
cd ..

REM Final instructions
echo.
echo =================================
echo ✅ Setup complete!
echo =================================
echo.
echo 📝 Next steps:
echo.
echo 1. Add your OpenAI API key to backend\.env:
echo    OPENAI_API_KEY=sk-your-actual-key-here
echo.
echo 2. Start the backend (in one terminal):
echo    cd backend ^&^& npm run dev
echo.
echo 3. Start the frontend (in another terminal):
echo    cd frontend ^&^& npm run dev
echo.
echo 4. Open your browser to:
echo    http://localhost:5173
echo.
echo 🧪 To test OpenAI connection:
echo    http://localhost:3001/api/test-openai
echo.
echo =================================
pause
