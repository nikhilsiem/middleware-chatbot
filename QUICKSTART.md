# 🚀 Quick Start Guide

Get your AI Chatbot running in 5 minutes!

## Prerequisites

- Node.js 16+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Installation

### Option 1: Automated Setup (Recommended)

**On macOS/Linux:**
```bash
chmod +x setup.sh
./setup.sh
```

**On Windows:**
```bash
setup.bat
```

### Option 2: Manual Setup

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add your OpenAI API key
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
```

## Configuration

Edit `backend/.env`:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
```

## Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

## Access the App

- **Frontend:** http://localhost:5173
- **Backend Health:** http://localhost:3001/health
- **Test OpenAI:** http://localhost:3001/api/test-openai

## First Steps

1. Open http://localhost:5173 in your browser
2. Start chatting with the AI
3. After a few messages, ask "Who am I?" for your personality profile

## Troubleshooting

### Backend won't start
```bash
# Check if port 3001 is in use
# On Windows:
netstat -ano | findstr :3001

# On macOS/Linux:
lsof -i :3001
```

### 500 Error when sending messages
1. Visit http://localhost:3001/api/test-openai
2. Check if your API key is valid
3. Verify you have OpenAI credits
4. Try changing model to `gpt-3.5-turbo` in `.env`

### Frontend can't connect
- Ensure backend is running on port 3001
- Check browser console for errors
- Verify `VITE_API_URL` in frontend/.env

## Common Issues

**"Invalid API Key"**
- Get a new key at https://platform.openai.com/api-keys
- Update `OPENAI_API_KEY` in backend/.env
- Restart the backend server

**"Insufficient Quota"**
- Add billing at https://platform.openai.com/account/billing
- Check your usage at https://platform.openai.com/usage

**"Model Not Found"**
- Change `OPENAI_MODEL=gpt-3.5-turbo` in backend/.env
- Restart the backend server

## Need Help?

Check the full [README.md](README.md) for detailed documentation.

---

Happy chatting! 🤖✨
