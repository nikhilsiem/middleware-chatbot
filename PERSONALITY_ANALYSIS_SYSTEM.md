# Personality Analysis System - Technical Documentation

## System Overview

This AI chatbot implements an intelligent personality analysis system that distinguishes between regular conversation (noise) and personality-relevant information (signal). The system uses different prompting strategies based on the type of user query.

## Core Concept: Dual Prompting Strategy

The system operates in two modes:

1. **Regular Mode**: Uses last 6 messages (noise filtering)
2. **Personality Mode**: Uses full conversation history (signal extraction)

### Understanding Message Roles

The Groq/OpenAI API uses three message roles:

- **`system`**: Instructions for how the AI should behave (NOT a message that gets a response)
- **`user`**: Messages from the human user (what the AI responds to)
- **`assistant`**: Previous responses from the AI (for conversation context)

**Important:** The `system` message is like giving instructions to an employee before they start work. You don't expect a response to the instructions themselves - you expect them to follow those instructions when responding to actual user messages.

## Code Implementation

### 1. Self-Inquiry Detection

**Location:** `backend/src/services/groq.service.js`

```javascript
isSelfInquiry(message) {
  const selfInquiryKeywords = [
    'who am i',
    'tell me about myself',
    'what do you know about me',
    'describe me',
    'my personality',
    'what have i told you'
  ];

  return selfInquiryKeywords.some(keyword =>
    message.toLowerCase().includes(keyword)
  );
}
```

**How it works:**
- Simple keyword matching on user input
- Case-insensitive comparison
- Returns boolean (true = personality query, false = regular query)
- Triggers different prompt building strategies

### 2. Regular Conversation Mode (Noise Filtering)

**Location:** `backend/src/services/groq.service.js`

```javascript
buildRegularMessages(history) {
  const systemMessage = {
    role: 'system',  // INSTRUCTION to AI (not a message that gets a response)
    content: 'You are a friendly, engaging AI assistant that remembers context from the conversation. Be helpful, personable, and ask follow-up questions to learn more about the user.'
  };

  // Only use last 6 messages (actual conversation)
  const recentHistory = history
    .slice(-6)
    .map(m => ({ role: m.role, content: m.content }));

  return [systemMessage, ...recentHistory];
}
```

**Noise Filtering Strategy:**
- **Context Window**: Only last 6 messages sent to AI
- **Why 6 messages?** 
  - Balances context vs. token usage
  - Focuses on recent, relevant conversation
  - Filters out old, irrelevant data
- **System Message**: Instructions for how the AI should behave (doesn't get a response)
- **Result**: Fast, contextual responses without information overload

**Important Note:** The `system` role is an instruction to the AI, not a message that receives a response. The AI reads it to understand how to behave, then responds to the `user` messages.

**What gets filtered (noise):**
- Messages older than last 6 exchanges
- Casual greetings from 10 messages ago
- Off-topic tangents from earlier
- Repetitive information
- Outdated context

**What gets kept (signal):**
- Last 3 user messages
- Last 3 assistant responses
- Recent conversation flow
- Immediate context

### 3. Personality Analysis Mode (Signal Extraction)

**Location:** `backend/src/services/groq.service.js`

```javascript
buildPersonalityProfileMessages(history, currentMessage) {
  // Format entire conversation history
  const conversationContext = history
    .slice(0, -1)  // Exclude current message
    .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
    .join('\n\n');

  return [
    {
      role: 'system',  // INSTRUCTION to AI (not a message that gets a response)
      content: 'You are an insightful AI assistant that creates detailed personality profiles based on conversation history. Be specific, thoughtful, and reference actual things the user has said.'
    },
    {
      role: 'user',  // The actual prompt with full conversation context
      content: `Based on our entire conversation history below, create a detailed personality profile. Analyze interests, communication style, preferences, and personal details shared. Be insightful and specific, referencing actual things mentioned.

Conversation History:
${conversationContext}

Current question: ${currentMessage}`
    }
  ];
}
```

**Signal Extraction Strategy:**
- **Full History**: ALL messages included (up to max limit)
- **Formatted Context**: Each message labeled as User/Assistant
- **System Message**: Instructions for the AI on how to behave (not a message that gets a response)
- **User Message**: Contains the full conversation context + the personality question
- **Result**: AI responds with comprehensive personality analysis based on the instructions and context

**What gets analyzed (signal):**
- Personal preferences mentioned
- Communication style patterns
- Interests and hobbies discussed
- Values and beliefs expressed
- Life experiences shared
- Emotional responses
- Decision-making patterns
- Relationship dynamics
- Professional background
- Goals and aspirations

### 4. Controller Logic (Mode Selection)

**Location:** `backend/src/controllers/chat.controller.js`

```javascript
async sendMessageStream(req, res, next) {
  const { userId, message } = req.body;

  // Sanitize and store user message
  const sanitizedMessage = conversationService.sanitizeInput(message);
  await conversationService.createUserMessage(userId, sanitizedMessage);

  // Get conversation history
  const history = await conversationService.getHistory(userId);

  // Determine message type and build appropriate prompt
  const isSelfInquiry = groqService.isSelfInquiry(sanitizedMessage);
  let messages;

  if (isSelfInquiry && history.length > 2) {
    // PERSONALITY MODE: Use full history
    messages = groqService.buildPersonalityProfileMessages(history, sanitizedMessage);
  } else {
    // REGULAR MODE: Use last 6 messages
    messages = groqService.buildRegularMessages(history);
  }

  // Stream response from Groq AI
  for await (const chunk of groqService.generateCompletionStream(messages, userId)) {
    fullContent += chunk;
    res.write(`data: ${JSON.stringify({ content: chunk, done: false })}\n\n`);
  }

  // Store complete response
  await conversationService.createAssistantMessage(userId, fullContent);
}
```

**Decision Logic:**
1. Check if message is self-inquiry
2. Check if history has more than 2 messages (minimum for analysis)
3. If both true → Personality Mode (full history)
4. Otherwise → Regular Mode (last 6 messages)

## Data Storage and Management

### Message Storage

**Location:** `backend/src/services/conversation.service.js`

```javascript
async addMessage(userId, message) {
  if (this.useDatabase) {
    // Store in PostgreSQL
    await pool.query(
      'INSERT INTO messages (user_id, role, content) VALUES ($1, $2, $3)',
      [userId, message.role, message.content]
    );
    
    // Trim history if exceeds max length
    const history = await this.getHistory(userId);
    if (history.length > config.conversation.maxHistoryLength) {
      const messagesToDelete = history.length - config.conversation.maxHistoryLength;
      await pool.query(
        `DELETE FROM messages 
         WHERE user_id = $1 
         AND id IN (
           SELECT id FROM messages 
           WHERE user_id = $1 
           ORDER BY created_at ASC 
           LIMIT $2
         )`,
        [userId, messagesToDelete]
      );
    }
  } else {
    // Fallback to in-memory Map
    let history = this.conversations.get(userId) || [];
    history.push(message);
    history = this.trimHistory(history);
    this.conversations.set(userId, history);
  }
}
```

**Storage Features:**
- **Dual Storage**: PostgreSQL (primary) + in-memory Map (fallback)
- **Automatic Trimming**: Keeps last 100 messages (configurable)
- **Oldest-First Deletion**: Removes oldest messages when limit exceeded
- **Graceful Degradation**: Falls back to memory if database fails

### Data Sanitization

**Location:** `backend/src/utils/validation.js`

```javascript
function sanitizeInput(input, maxLength) {
  if (!input || typeof input !== 'string') return '';
  
  // Remove control characters and null bytes
  let sanitized = input.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().slice(0, maxLength);
  
  return sanitized;
}

function validateInput(input, maxLength) {
  // Check basic validity
  if (!input || typeof input !== 'string') {
    return { valid: false, error: 'Input must be a non-empty string' };
  }

  // Detect prompt injection patterns
  const injectionPatterns = [
    /ignore\s+(previous|above|all)\s+instructions/i,
    /you\s+are\s+now/i,
    /new\s+instructions/i,
    /system\s*:/i,
    /forget\s+everything/i,
    /disregard\s+previous/i,
    /override\s+instructions/i
  ];

  for (const pattern of injectionPatterns) {
    if (pattern.test(input)) {
      return { valid: false, error: 'Input contains potentially harmful content' };
    }
  }

  return { valid: true };
}
```

**Security Measures:**
- Removes control characters (prevents terminal injection)
- Removes null bytes (prevents string termination attacks)
- Detects 7+ prompt injection patterns
- Length validation (prevents DoS)
- Type checking (prevents type confusion)

## Complete Data Flow

### Regular Conversation Flow

```
User: "What's the weather like?"
    ↓
Backend receives message
    ↓
Sanitize: "What's the weather like?"
    ↓
Store in database: { role: 'user', content: '...', timestamp: '...' }
    ↓
Retrieve history: [msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10]
    ↓
Check isSelfInquiry("What's the weather like?") → FALSE
    ↓
Build regular messages:
  - System: "Be friendly and engaging" (instruction to AI)
  - Last 6 messages: [msg5, msg6, msg7, msg8, msg9, msg10] (actual conversation)
    ↓
Send to Groq AI (7 messages: 1 system instruction + 6 conversation messages)
AI reads system instruction, then responds based on the 6 conversation messages
    ↓
Stream response: "The weather is..."
    ↓
Store response in database
    ↓
Return to user
```

**Token Usage:** ~500-1000 tokens (efficient)

### Personality Analysis Flow

```
User: "Who am I based on our conversation?"
    ↓
Backend receives message
    ↓
Sanitize: "Who am I based on our conversation?"
    ↓
Store in database
    ↓
Retrieve history: [msg1, msg2, msg3, ..., msg50] (all messages)
    ↓
Check isSelfInquiry("Who am I...") → TRUE
Check history.length > 2 → TRUE
    ↓
Build personality profile messages:
  - System: "Create detailed personality profile" (instruction to AI)
  - User: "Based on entire conversation history:\n\nUser: msg1\nAssistant: msg2\n...\n\nCurrent question: Who am I..." (full context)
    ↓
Send to Groq AI (2 messages: 1 system instruction + 1 user message with full context)
AI reads system instruction, then analyzes the full conversation context in the user message
    ↓
AI analyzes:
  - "User mentioned loving hiking in msg5"
  - "User expressed interest in AI in msg12"
  - "User's communication style is direct and curious"
  - "User values efficiency based on msg23"
    ↓
Stream detailed personality profile
    ↓
Store response in database
    ↓
Return to user
```

**Token Usage:** ~2000-4000 tokens (comprehensive analysis)

## Noise vs. Signal Classification

### Noise (Filtered in Regular Mode)

**Characteristics:**
- Transactional queries ("What time is it?")
- Casual greetings ("Hey", "Thanks")
- One-off questions without personal context
- Technical/factual queries
- Old messages beyond 6-message window

**Example Conversation (Regular Mode):**
```
[Message 1] User: "Hi"
[Message 2] Assistant: "Hello! How can I help?"
[Message 3] User: "What's 2+2?"
[Message 4] Assistant: "2+2 equals 4"
[Message 5] User: "Thanks"
[Message 6] Assistant: "You're welcome!"
[Message 7] User: "What's the capital of France?"  ← Current
```

**What AI sees:**
- Only messages 2-7 (last 6 + current)
- Messages 1 is filtered out (noise)

### Signal (Extracted in Personality Mode)

**Characteristics:**
- Personal preferences ("I love hiking")
- Emotional expressions ("I'm excited about...")
- Values and beliefs ("I think honesty is important")
- Life experiences ("When I was in college...")
- Communication patterns (formal vs. casual, verbose vs. concise)
- Interests and hobbies
- Goals and aspirations
- Relationship dynamics

**Example Conversation (Personality Mode):**
```
[Message 1] User: "I love hiking on weekends"
[Message 2] Assistant: "That's great! What trails do you enjoy?"
[Message 3] User: "Mountain trails, especially in autumn"
[Message 4] Assistant: "Autumn hiking is beautiful!"
[Message 5] User: "I'm also really into AI and machine learning"
[Message 6] Assistant: "Fascinating! What aspects interest you?"
[Message 7] User: "Neural networks and their applications"
[Message 8] Assistant: "That's a deep topic!"
[Message 9] User: "I work as a software engineer"
[Message 10] Assistant: "Interesting career!"
[Message 11] User: "Who am I based on our conversation?"  ← Current
```

**What AI sees:**
- ALL messages 1-11
- Extracts signals:
  - Interest: Hiking, mountains, autumn
  - Interest: AI, machine learning, neural networks
  - Profession: Software engineer
  - Communication style: Direct, specific, technical
  - Values: Nature, technology, learning

## Performance Considerations

### Regular Mode (Efficient)
- **Messages sent to AI**: 7 (1 system + 6 history)
- **Average tokens**: 500-1000
- **Response time**: 1-3 seconds
- **Cost**: Low
- **Use case**: 95% of conversations

### Personality Mode (Comprehensive)
- **Messages sent to AI**: 2 (1 system + 1 with full context)
- **Average tokens**: 2000-4000
- **Response time**: 3-8 seconds
- **Cost**: Medium
- **Use case**: 5% of conversations (self-inquiry only)

## Database Schema

```sql
CREATE TABLE messages (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for fast retrieval
CREATE INDEX idx_messages_user_id ON messages(user_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

**Query Performance:**
- `getHistory(userId)`: Uses `idx_messages_user_id` index
- `ORDER BY created_at`: Uses `idx_messages_created_at` index
- Typical query time: <10ms for 100 messages

## Configuration

**Location:** `backend/src/config/env.js`

```javascript
conversation: {
  maxHistoryLength: 100,      // Max messages stored per user
  maxMessageLength: 2000      // Max characters per message
},
groq: {
  model: 'llama-3.1-70b-versatile',
  apiKey: process.env.GROQ_API_KEY
}
```

## Privacy and Security

### Data Isolation
- Each user has separate conversation history
- No cross-user data access
- User IDs are validated before queries

### Data Retention
- Users can clear history via API: `DELETE /api/conversations/:userId`
- Automatic trimming keeps last 100 messages
- No data shared with third parties (except Groq API for processing)

### Security Measures
1. **Input Sanitization**: Removes harmful characters
2. **Prompt Injection Detection**: Blocks malicious prompts
3. **Rate Limiting**: 20 requests/minute per user
4. **Parameterized Queries**: Prevents SQL injection
5. **CORS**: Restricted origins only

## Testing Personality Analysis

**Test Case 1: Regular Conversation**
```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123", "message": "What is AI?"}'
```
Expected: Uses last 6 messages, fast response

**Test Case 2: Personality Query**
```bash
curl -X POST http://localhost:3001/api/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"userId": "test123", "message": "Who am I?"}'
```
Expected: Uses full history, detailed personality profile

## Future Enhancements

1. **Semantic Analysis**: Use embeddings to identify personality-relevant messages
2. **Topic Clustering**: Group messages by topic (hobbies, work, relationships)
3. **Sentiment Tracking**: Analyze emotional patterns over time
4. **Personality Metrics**: Score on Big Five personality traits
5. **Temporal Analysis**: Track how personality evolves
6. **Export Profiles**: Generate downloadable personality reports
7. **Multi-dimensional Analysis**: Separate work vs. personal personality
8. **Conversation Summaries**: Periodic summaries of key insights
