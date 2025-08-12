@echo off
REM Auto BPMN Setup Script for Windows

echo 🚀 Setting up Auto BPMN...

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    exit /b 1
)

echo ✅ Node.js is available

REM Install root dependencies
echo 📦 Installing root dependencies...
call npm install

REM Install server dependencies
echo 📦 Installing server dependencies...
cd server
call npm install
cd ..

REM Install client dependencies
echo 📦 Installing client dependencies...
cd client
call npm install
cd ..

REM Copy environment files
echo ⚙️ Setting up environment files...
if not exist server\.env (
    copy server\.env.example server\.env
    echo ✅ Created server\.env from template
    echo 🔧 Please edit server\.env to add your API keys
) else (
    echo ✅ server\.env already exists
)

REM Create necessary directories
echo 📁 Creating necessary directories...
if not exist logs mkdir logs
if not exist data mkdir data

echo.
echo 🎉 Setup complete!
echo.
echo 📋 Next steps:
echo 1. Edit server\.env to add your API keys (OpenAI, HuggingFace)
echo 2. Start MongoDB (or use Docker Compose)
echo 3. Run the application:
echo.
echo    Development mode:
echo    npm run dev
echo.
echo    Or with Docker:
echo    docker-compose up
echo.
echo 4. Open http://localhost:3000 in your browser
echo.
echo 📚 For more information, see README.md

pause
