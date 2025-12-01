# 🤖 AI Chatbot with Personality Profiling

A full-stack AI chatbot application that learns from conversations and generates personality profiles using OpenAI's GPT models.

## ✨ Features

- 💬 Real-time conversational AI
- 🧠 Conversation memory and context awareness
- 👤 Personality profiling based on chat history
- 🎨 Modern, responsive UI with Tailwind CSS
- 🌓 **Light/Dark theme support** with persistence
- 💾 **localStorage integration** for conversation history
- 🔒 Input validation and sanitization
- ⚡ Rate limiting and error handling
- 🔄 Automatic retry logic
- 📱 Offline detection
- 🏗️ **Modular architecture** with proper separation of concerns
- 📋 **Request/Response schemas** for type safety
- 🧪 Comprehensive test coverage

## 🏗️ Tech Stack

### Backend
- **Node.js** with Express
- **OpenAI API** (GPT-3.5-turbo / GPT-4)
- **CORS** for cross-origin requests
- **dotenv** for environment configuration
- **Jest** & **Supertest** for testing

### Frontend
- **React 18** with Hooks
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Axios** for API requests
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js 16+ and npm
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Modern web browser

## 🚀 Quick Start

### 1. Clone or Download the Project

```bash
cd ai-chatbot
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

Edit `.env` and add your OpenAI API key:
```env
OPENAI_API_KEY=sk-your-actual-api-key-here
OPENAI_MODEL=gpt-3.5-turbo
PORT=3001
NODE_ENV=development
```

Start the backend:
```bash
npm run dev
```

The server will start on `http://localhost:3001`

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create `.env` file:
```bash
cp .env.example .env
```

The default configuration should work:
```env
VITE_API_URL=http://localhost:3001
```

Start the frontend:
```bash
npm run dev
```

The app will open at `http://localhost:5173`

## 🧪 Testing

### Backend Tests
```bash
cd backend
npm test
```

### Test OpenAI Connection
Visit: `http://localhost:3001/api/test-openai`

This will verify your API key and model access.

## 📚 API Documentation

### Endpoints

#### Health Check
```
GET /health
```
Returns server status and uptime.

#### Test OpenAI Connection
```
GET /api/test-openai
```
Tests the OpenAI API connection.

#### Get Conversation History
```
GET /api/conversations/:userId
```
Retrieves conversation history for a user.

#### Send Message
```
POST /api/chat
Body: {
  "userId": "string",
  "message": "string"
}
```
Sends a message and receives AI response.

#### Clear History
```
DELETE /api/conversations/:userId
```
Clears conversation history for a user.

#### Get All Users
```
GET /api/users
```
Returns list of all users (admin/testing).

## 🔧 Configuration

### Backend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | Required |
| `OPENAI_MODEL` | Model to use | `gpt-3.5-turbo` |
| `PORT` | Server port | `3001` |
| `NODE_ENV` | Environment | `development` |
| `CORS_ORIGIN` | Allowed CORS origin | `*` |

### Frontend Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:3001` |

## 🎯 Usage

1. **Start a Conversation**: Type a message and press Enter or click Send
2. **Build Context**: Chat naturally about your interests, work, hobbies
3. **Get Your Profile**: Ask "Who am I?" or "Tell me about myself"
4. **Clear History**: Click the Clear button to start fresh

### Example Prompts

- "I'm a software developer who loves hiking"
- "Tell me about machine learning"
- "What are your thoughts on climate change?"
- "Who am I?" (after several messages)

## 🛡️ Security Features

- Input validation and sanitization
- Rate limiting (20 requests per minute per user)
- Maximum message length enforcement
- SQL injection prevention
- XSS protection
- CORS configuration
- Environment variable protection

## ⚠️ Error Handling

The application handles various error scenarios:

- **Network errors**: Automatic retry with exponential backoff
- **API quota exceeded**: Clear error message with billing link
- **Invalid API key**: Configuration error message
- **Rate limiting**: Retry-after indication
- **Offline detection**: UI feedback and disabled input
- **Timeout errors**: 30-second timeout with retry

## 🔍 Troubleshooting

### Backend won't start
- Check if port 3001 is available
- Verify `OPENAI_API_KEY` is set in `.env`
- Run `npm install` to ensure dependencies are installed

### 500 Internal Server Error
- Check backend console for detailed error logs
- Visit `/api/test-openai` to test OpenAI connection
- Verify your API key is valid and has credits
- Check if the model is available for your account

### Frontend can't connect to backend
- Ensure backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env`
- Verify CORS is properly configured

### OpenAI API Errors

**Insufficient Quota**
- Add billing information at https://platform.openai.com/account/billing

**Model Not Found**
- Change `OPENAI_MODEL` to `gpt-3.5-turbo` in backend `.env`
- Verify your account has access to the model

**Invalid API Key**
- Generate a new key at https://platform.openai.com/api-keys
- Update `OPENAI_API_KEY` in backend `.env`

## 📦 Project Structure

```
ai-chatbot/
├── backend/
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   ├── schemas/        # Request/Response schemas
│   │   ├── services/       # Business logic
│   │   ├── app.js          # Express app setup
│   │   └── server.js       # Server entry point
│   ├── tests/              # Backend tests
│   ├── package.json
│   ├── .env.example
│   └── .gitignore
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── contexts/       # React contexts (Theme)
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── utils/          # Utility functions
│   │   ├── App.jsx         # Main component
│   │   ├── main.jsx        # Entry point
│   │   └── index.css       # Global styles
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── .env.example
│   └── .gitignore
├── README.md
└── PROJECT_STRUCTURE.md    # Detailed architecture docs
```

## 🚢 Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Set environment variables in your hosting platform
2. Deploy the `backend` folder
3. Note the deployed URL

### Frontend Deployment (e.g., Vercel, Netlify)

1. Update `VITE_API_URL` to your backend URL
2. Build the frontend: `npm run build`
3. Deploy the `dist` folder

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

- OpenAI for the GPT API
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Lucide for the beautiful icons

## 📞 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review backend console logs
3. Test the OpenAI connection endpoint
4. Verify environment variables are set correctly

## 🔮 Future Enhancements

- [ ] Database integration (PostgreSQL/MongoDB)
- [ ] User authentication
- [ ] Multiple conversation threads
- [ ] Export conversation history
- [ ] Voice input/output
- [ ] Multi-language support
- [ ] Custom personality settings
- [ ] Analytics dashboard

---

Made with ❤️ using React, Node.js, and OpenAI
