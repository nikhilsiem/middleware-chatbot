# Project Structure

This document outlines the folder architecture and organization of the AI Chatbot project.

## Backend Structure

```
backend/
├── src/
│   ├── config/
│   │   └── env.js                 # Environment configuration
│   ├── controllers/
│   │   ├── chat.controller.js     # Chat endpoint handlers
│   │   └── health.controller.js   # Health check handlers
│   ├── middleware/
│   │   ├── errorHandler.js        # Error handling middleware
│   │   └── rateLimit.js           # Rate limiting middleware
│   ├── routes/
│   │   ├── chat.routes.js         # Chat routes
│   │   ├── health.routes.js       # Health routes
│   │   └── index.js               # Route aggregator
│   ├── schemas/
│   │   └── chat.schema.js         # Request/Response schemas
│   ├── services/
│   │   ├── conversation.service.js # Conversation management
│   │   └── openai.service.js      # OpenAI API integration
│   ├── app.js                     # Express app configuration
│   └── server.js                  # Server entry point
├── tests/
│   └── backend.test.js            # Backend tests
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
└── package.json
```

### Backend Architecture Patterns

- **Controllers**: Handle HTTP requests and responses
- **Services**: Business logic and external API interactions
- **Middleware**: Request processing and validation
- **Routes**: API endpoint definitions
- **Schemas**: Data validation and type definitions
- **Config**: Application configuration

## Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ChatInput.jsx          # Message input component
│   │   ├── EmptyState.jsx         # Empty conversation state
│   │   ├── ErrorBanner.jsx        # Error display component
│   │   ├── Header.jsx             # App header with theme toggle
│   │   ├── LoadingIndicator.jsx   # Loading animation
│   │   └── Message.jsx            # Individual message component
│   ├── contexts/
│   │   └── ThemeContext.jsx       # Theme management context
│   ├── hooks/
│   │   ├── useLocalStorage.js     # localStorage hook
│   │   └── useOnlineStatus.js     # Online/offline detection
│   ├── services/
│   │   └── api.service.js         # API client
│   ├── utils/
│   │   ├── constants.js           # App constants
│   │   └── helpers.js             # Utility functions
│   ├── App.jsx                    # Main app component
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles
├── public/
├── index.html
├── .env                           # Environment variables
├── .env.example                   # Environment template
├── .gitignore
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── vite.config.js
```

### Frontend Architecture Patterns

- **Components**: Reusable UI components
- **Contexts**: Global state management (Theme)
- **Hooks**: Custom React hooks for reusable logic
- **Services**: API communication layer
- **Utils**: Helper functions and constants

## Key Features

### Backend

1. **Modular Architecture**: Separation of concerns with controllers, services, and middleware
2. **Schema Validation**: Type-safe request/response handling
3. **Error Handling**: Centralized error handling with specific OpenAI error handling
4. **Rate Limiting**: Per-user rate limiting to prevent abuse
5. **Configuration Management**: Environment-based configuration

### Frontend

1. **Component-Based**: Modular, reusable React components
2. **Theme Support**: Light/Dark mode with persistence
3. **Local Storage**: Conversation history persistence
4. **Offline Detection**: Network status monitoring
5. **Error Handling**: Comprehensive error handling with retry logic
6. **Custom Hooks**: Reusable logic for localStorage and online status

## Data Flow

### Sending a Message

```
User Input (ChatInput)
  ↓
App Component (handleSend)
  ↓
API Service (chatAPI.sendMessage)
  ↓
Backend Route (/api/chat)
  ↓
Chat Controller (sendMessage)
  ↓
Conversation Service (createUserMessage)
  ↓
OpenAI Service (generateCompletion)
  ↓
Conversation Service (createAssistantMessage)
  ↓
Response to Frontend
  ↓
Update Messages State
  ↓
Save to localStorage
  ↓
Render Message Component
```

## Environment Variables

### Backend (.env)
- `OPENAI_API_KEY`: OpenAI API key
- `OPENAI_MODEL`: Model to use (default: gpt-3.5-turbo)
- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `CORS_ORIGIN`: Allowed CORS origin

### Frontend (.env)
- `VITE_API_URL`: Backend API URL (default: http://localhost:3001)

## Best Practices Implemented

1. **Separation of Concerns**: Clear separation between layers
2. **Error Handling**: Comprehensive error handling at all levels
3. **Type Safety**: Schema validation for requests/responses
4. **Security**: Input sanitization, rate limiting, CORS configuration
5. **Performance**: Efficient state management, memoization
6. **Accessibility**: ARIA labels, keyboard navigation
7. **User Experience**: Loading states, error messages, offline detection
8. **Code Organization**: Logical folder structure, single responsibility
9. **Documentation**: JSDoc comments, clear naming conventions
10. **Testing**: Test structure in place for both frontend and backend

## Development Workflow

1. **Backend Development**: Start with `npm run dev` in backend folder
2. **Frontend Development**: Start with `npm run dev` in frontend folder
3. **Testing**: Run `npm test` in respective folders
4. **Building**: Run `npm run build` in frontend for production build

## Future Enhancements

- Database integration (PostgreSQL/MongoDB)
- User authentication and authorization
- WebSocket support for real-time updates
- Message search and filtering
- Export conversation history
- Multi-language support
- Voice input/output
- File attachments
- Conversation branching
- Analytics dashboard
