# Meet AI - Technical Documentation

## Architecture Overview

Meet AI is a sophisticated AI-powered video meeting platform built on a modern full-stack architecture. The system integrates real-time video calls with intelligent AI agents that can participate in conversations and automatically process meeting content.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   External APIs │
│                 │    │                  │    │                 │
│ • React 19      │◄──►│ • Next.js 15     │◄──►│ • OpenAI        │
│ • Stream Video  │    │ • tRPC           │    │ • Stream Video  │
│ • TanStack      │    │ • Better Auth    │    │ • Neon DB       │
│   Query         │    │ • Webhooks       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Background Jobs  │
                       │                  │
                       │ • Inngest        │
                       │ • AI Processing  │
                       │ • Transcription  │
                       └──────────────────┘
```

## Core Components

### 1. Video Meeting System

**Stream Video SDK Integration**
- **Frontend**: `@stream-io/video-react-sdk` provides React components for video calls
- **Backend**: `@stream-io/node-sdk` manages call lifecycle and server-side operations
- **Real-time Communication**: WebRTC for peer-to-peer video/audio streaming

**Call Flow:**
1. User creates a meeting through the dashboard
2. Frontend initializes Stream Video client
3. AI agent automatically joins via webhook when call starts
4. Real-time transcription captures all audio
5. Call ends trigger transcript processing pipeline

### 2. AI Agent System

**Agent Architecture:**
```typescript
// Agent Entity
interface Agent {
  id: string;
  name: string;
  instructions: string;  // Custom personality/behavior
  userId: string;        // Owner
}
```

**AI Integration Points:**
- **Real-time Voice**: `@stream-io/openai-realtime-api` connects OpenAI's voice API to video calls
- **Agent Personality**: Custom instructions define how each agent behaves
- **Context Awareness**: Agents receive meeting context and participant information

### 3. Webhook Processing System

**Webhook Endpoint**: `/api/webhook/route.ts`

**Supported Events:**
- `call.session_started` - Triggers agent connection
- `call.session_participant_left` - Handles participant departures  
- `call.session_ended` - Initiates transcript processing
- `call.transcription_ready` - Processes meeting transcripts
- `call.recording_ready` - Handles meeting recordings

**Event Flow:**
```typescript
// Webhook Processing Pipeline
Stream Video → Webhook → Database Update → Inngest Event → AI Processing
```

### 4. Background Processing Pipeline

**Inngest Functions** (`src/inngest/functions.ts`):

**Meeting Processing Pipeline:**
1. **Transcript Fetch**: Download raw JSONL transcript from Stream
2. **Parse & Structure**: Convert JSONL to typed transcript items
3. **Speaker Enrichment**: Match speaker IDs to user/agent names
4. **AI Summarization**: Generate structured markdown summaries
5. **Database Update**: Save summary and mark meeting complete

```typescript
// Pipeline Steps
fetch → parse → enrich → summarize → save
```

**AI Summarizer Agent:**
- Uses GPT-4o for intelligent summarization
- Outputs structured markdown (Overview + Notes)
- Handles both human and AI agent participants

## Database Schema

### Core Entities

**Users & Authentication:**
```sql
-- User accounts
users (id, name, email, email_verified, image, created_at, updated_at)

-- OAuth sessions  
sessions (id, expires_at, token, user_id, ip_address, user_agent)

-- OAuth provider accounts
accounts (id, account_id, provider_id, user_id, access_token, refresh_token)
```

**Agent Management:**
```sql
-- Custom AI agents
agents (
  id,           -- Unique agent identifier
  name,         -- Display name
  user_id,      -- Owner reference
  instructions, -- AI personality/behavior
  created_at,
  updated_at
)
```

**Meeting Data:**
```sql
-- Meeting records
meetings (
  id,             -- Meeting identifier (used in Stream calls)
  name,           -- Meeting title
  user_id,        -- Meeting owner
  agent_id,       -- Associated AI agent
  status,         -- upcoming|active|completed|processing|cancelled
  started_at,     -- Call start timestamp
  ended_at,       -- Call end timestamp
  transcript_url, -- Stream transcription URL
  recording_url,  -- Stream recording URL
  summary,        -- AI-generated summary
  created_at,
  updated_at
)
```

## API Architecture

### tRPC Router Structure

**Agent Procedures** (`src/modules/agents/server/procedures.ts`):
- `agents.list` - Fetch user's agents with pagination/filtering
- `agents.create` - Create new AI agent
- `agents.update` - Modify agent instructions
- `agents.delete` - Remove agent

**Meeting Procedures**:
- `meetings.list` - Fetch user's meetings
- `meetings.create` - Initialize new meeting
- `meetings.start` - Begin video call session

**Authentication:**
- `protectedProcedure` - Requires valid user session
- Better Auth middleware handles session validation

## Frontend Architecture

### Component Organization

**Module-Based Structure:**
```
src/modules/
├── agents/          # Agent management
│   ├── hooks/       # React hooks  
│   ├── schemas.ts   # Zod validation
│   ├── server/      # tRPC procedures
│   └── ui/          # Components & views
├── dashboard/       # Navigation & layout
├── auth/            # Authentication flows
└── home/           # Landing page
```

**Key Hooks:**
- `useAgents()` - Agent CRUD operations
- `useMeetings()` - Meeting management
- `useCreateMeeting()` - Meeting initialization

### State Management

**TanStack React Query:**
- Automatic caching and background refetching
- Optimistic updates for responsive UX
- Integrated with tRPC for type-safe data fetching

**Session Management:**
- Better Auth handles authentication state
- React Context provides user session across components

## Deployment & Infrastructure

### Environment Variables

**Required Configuration:**
```bash
# Database
DATABASE_URL=""

# Authentication  
BETTER_AUTH_SECRET=""
BETTER_AUTH_URL="http://localhost:3000"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""  
GOOGLE_CLIENT_SECRET=""

# AI & Video
OPENAI_API_KEY=""
NEXT_PUBLIC_STREAM_VIDEO_API_KEY=""
STREAM_VIDEO_API_KEY=""

# Application
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Development Workflow

**Database Management:**
```bash
npm run db:push    # Deploy schema changes
npm run db:studio  # Open Drizzle Studio
```

**Development Server:**
```bash
npm run dev        # Start Next.js server
npm run dev:webhook # Start ngrok tunnel for webhooks
```

**Code Quality:**
```bash
npm run lint       # ESLint checking
npm run build      # Production build
```

### Webhook Configuration

**ngrok Setup:**
- Development webhook tunnel via ngrok
- Custom domain: `unbluffing-myeloid-tiffany.ngrok-free.app`
- Stream Video webhook URL: `https://{domain}/api/webhook`

**Production Considerations:**
- Replace ngrok with permanent webhook URL
- Configure Stream Video dashboard with production webhook endpoint
- Implement webhook signature verification

## Security Considerations

### Authentication
- OAuth-only authentication (no passwords)
- Session-based auth with database persistence  
- Multi-provider support (GitHub, Google, Discord)

### API Security
- tRPC provides runtime type checking
- Protected procedures require authentication
- Webhook signature verification prevents unauthorized calls

### Data Privacy
- User data isolated by ownership
- Agent instructions encrypted in transit
- Meeting transcripts processed server-side only

## Monitoring & Observability

### Error Handling
- React Error Boundaries catch component errors
- tRPC error handling with custom error types
- Inngest automatic retry on failed background jobs

### Logging
- Console logging in webhook processing
- Inngest dashboard provides job execution visibility
- Stream Video dashboard shows call analytics

## Performance Optimizations

### Frontend
- React 19 automatic batching
- TanStack Query caching reduces API calls
- Code splitting with Next.js dynamic imports

### Backend  
- Connection pooling with Neon database
- tRPC batch requests
- Background processing offloads heavy operations

### Video Performance
- WebRTC peer-to-peer connections reduce server load
- Stream Video global CDN for optimal latency
- Automatic quality adjustment based on bandwidth

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for consistent formatting
- Modular architecture with clear separation of concerns

### Database Patterns
- Drizzle ORM for type-safe database operations
- Foreign key relationships maintain data integrity
- Enum types for status fields

### Testing Strategy
- Type-safe APIs reduce runtime errors
- Manual testing with video call scenarios
- Database schema validation via Drizzle

## Future Enhancements

### Scalability
- Multi-tenant architecture for enterprise use
- Horizontal scaling with load balancers
- Caching layer (Redis) for high-traffic scenarios

### Features
- Screen sharing integration
- Meeting scheduling system
- Advanced AI agent personalities
- Real-time collaboration tools

### Performance
- WebSocket connections for real-time updates
- CDN distribution for global performance
- Database read replicas for scaling queries