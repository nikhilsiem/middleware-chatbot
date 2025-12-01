# Architecture Overview

## Design Principles

This project follows industry-standard architectural patterns and best practices:

### 1. Separation of Concerns
- **Backend**: Controllers, Services, Middleware, Routes, Schemas
- **Frontend**: Components, Contexts, Hooks, Services, Utils

### 2. Single Responsibility Principle
Each module has one clear purpose:
- Controllers handle HTTP requests/responses
- Services contain business logic
- Middleware processes requests
- Components render UI
- Hooks manage reusable logic

### 3. Dependency Injection
Services are instantiated once and exported as singletons, making them easy to test and mock.

## Backend Architecture

### Layered Architecture

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Middleware Layer            │
│  - Request Logging                  │
│  - JSON Parsing                     │
│  - Rate Limiting                    │
│  - Error Handling                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Routes Layer                │
│  - Endpoint Definitions             │
│  - Route Grouping                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Controllers Layer             │
│  - Request Validation               │
│  - Response Formatting              │
│  - Error Handling                   │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│        Services Layer               │
│  - Business Logic                   │
│  - External API Calls               │
│  - Data Management                  │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         HTTP Response               │
└─────────────────────────────────────┘
```

### Key Components

#### 1. Configuration (`config/`)
- Centralized environment variable management
- Validation of required configuration
- Default values and constants

#### 2. Controllers (`controllers/`)
- Handle HTTP request/response cycle
- Validate incoming data using schemas
- Call appropriate services
- Format responses
- Handle errors gracefully

#### 3. Services (`services/`)
- **OpenAI Service**: Manages OpenAI API interactions
  - Connection testing
  - Completion generation
  - Message building
  - Error handling
  
- **Conversation Service**: Manages conversation state
  - History storage (in-memory)
  - Message creation
  - Input sanitization
  - History trimming

#### 4. Middleware (`middleware/`)
- **Rate Limiter**: Prevents API abuse
- **Error Handler**: Centralized error processing
- **Request Logger**: Logs all incoming requests

#### 5. Schemas (`schemas/`)
- Define request/response structures
- Validation functions
- Type definitions (JSDoc)
- Error response formatting

#### 6. Routes (`routes/`)
- Define API endpoints
- Group related routes
- Apply middleware to specific routes

## Frontend Architecture

### Component-Based Architecture

```
┌─────────────────────────────────────┐
│            App.jsx                  │
│  - Main application logic           │
│  - State management                 │
│  - API integration                  │
└──────────────┬──────────────────────┘
               │
       ┌───────┴───────┐
       │               │
┌──────▼──────┐ ┌─────▼──────┐
│  Components │ │  Services  │
│  - Header   │ │  - API     │
│  - Message  │ └────────────┘
│  - Input    │
│  - etc.     │
└──────┬──────┘
       │
┌──────▼──────┐
│   Contexts  │
│  - Theme    │
└─────────────┘
       │
┌──────▼──────┐
│    Hooks    │
│  - Storage  │
│  - Online   │
└─────────────┘
```

### Key Components

#### 1. Components (`components/`)
Reusable, focused UI components:
- **Header**: App header with theme toggle and clear button
- **Message**: Individual message display
- **ChatInput**: Message input with character count
- **LoadingIndicator**: Loading animation
- **EmptyState**: Initial conversation prompt
- **ErrorBanner**: Error message display

#### 2. Contexts (`contexts/`)
- **ThemeContext**: Global theme state (light/dark)
  - Persists to localStorage
  - Applies to document root
  - Provides toggle function

#### 3. Hooks (`hooks/`)
- **useLocalStorage**: Persistent state management
  - Automatic serialization
  - Error handling
  - Quota management
  
- **useOnlineStatus**: Network status detection
  - Real-time updates
  - Event listeners

#### 4. Services (`services/`)
- **API Service**: Centralized API communication
  - Axios instance configuration
  - Request/response interceptors
  - Error handling
  - Typed API methods

#### 5. Utils (`utils/`)
- **Constants**: Application constants
- **Helpers**: Utility functions
  - User ID generation
  - Error message formatting
  - Timestamp formatting

## Data Flow

### Message Sending Flow

```
1. User types message in ChatInput
2. ChatInput calls App.handleSend()
3. App validates message length
4. App creates user message object
5. App updates local state (optimistic update)
6. App calls chatAPI.sendMessage()
7. API service sends POST to /api/chat
8. Backend route receives request
9. Rate limiter checks limits
10. Controller validates request
11. Controller calls ConversationService
12. ConversationService stores user message
13. Controller calls OpenAIService
14. OpenAIService builds prompt
15. OpenAIService calls OpenAI API
16. OpenAI returns completion
17. ConversationService stores assistant message
18. Controller formats response
19. Response sent to frontend
20. App updates state with assistant message
21. useLocalStorage persists to localStorage
22. Message component renders new messages
```

## State Management

### Backend State
- **In-Memory Storage**: Map of userId → conversation history
- **Rate Limiting**: Map of userId → request timestamps
- **Singleton Services**: Single instance per service

### Frontend State
- **React State**: Component-level state (input, loading, error)
- **localStorage**: Persistent conversation history
- **Context**: Global theme state
- **Custom Hooks**: Reusable stateful logic

## Error Handling Strategy

### Backend
1. **Validation Errors** (400): Invalid input, schema violations
2. **Authentication Errors** (401): Invalid API key
3. **Payment Errors** (402): Quota exceeded
4. **Rate Limit Errors** (429): Too many requests
5. **Server Errors** (500): Unexpected errors, OpenAI failures

### Frontend
1. **Network Errors**: Retry with exponential backoff
2. **Validation Errors**: Display user-friendly message
3. **Offline Errors**: Disable input, show status
4. **Server Errors**: Display error, allow retry

## Security Measures

1. **Input Sanitization**: All user input is sanitized
2. **Rate Limiting**: Per-user request limits
3. **CORS Configuration**: Restricted origins
4. **Environment Variables**: Sensitive data in .env
5. **Error Messages**: No sensitive data in production errors
6. **User ID Validation**: Regex validation, length limits
7. **Message Length Limits**: Prevent abuse

## Performance Optimizations

1. **Memoization**: useCallback for stable function references
2. **Lazy Loading**: Components loaded on demand
3. **Efficient Re-renders**: Proper key usage, state updates
4. **Request Timeouts**: 30-second timeout on API calls
5. **History Trimming**: Limit conversation history length
6. **Debouncing**: Input validation debounced

## Testing Strategy

### Backend Tests
- Unit tests for services
- Integration tests for controllers
- API endpoint tests
- Error handling tests

### Frontend Tests
- Component unit tests
- Hook tests
- Integration tests
- E2E tests (future)

## Scalability Considerations

### Current Limitations
- In-memory storage (not persistent across restarts)
- Single server instance
- No load balancing

### Future Improvements
1. **Database Integration**: PostgreSQL/MongoDB for persistence
2. **Redis**: For session management and caching
3. **Load Balancing**: Multiple server instances
4. **WebSocket**: Real-time updates
5. **CDN**: Static asset delivery
6. **Microservices**: Separate services for different concerns

## Deployment Architecture

```
┌─────────────────────────────────────┐
│         Frontend (Vercel)           │
│  - Static files served via CDN      │
│  - Environment variables configured │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│       Backend (Railway/Render)      │
│  - Node.js server                   │
│  - Environment variables configured │
│  - Health checks enabled            │
└──────────────┬──────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────┐
│         OpenAI API                  │
│  - GPT-3.5-turbo / GPT-4           │
└─────────────────────────────────────┘
```

## Monitoring & Logging

### Current Implementation
- Console logging for all requests
- Error logging with stack traces
- Request/response logging

### Future Enhancements
- Structured logging (Winston/Pino)
- Log aggregation (ELK stack)
- Application monitoring (New Relic/Datadog)
- Error tracking (Sentry)
- Analytics (Google Analytics/Mixpanel)

## Documentation Standards

1. **JSDoc Comments**: All functions documented
2. **README Files**: Setup and usage instructions
3. **Architecture Docs**: This file
4. **API Documentation**: Endpoint descriptions
5. **Code Comments**: Complex logic explained
6. **Type Definitions**: TypeScript-style JSDoc

---

This architecture provides a solid foundation for a production-ready application while maintaining flexibility for future enhancements.
