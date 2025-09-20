# Meet AI - Technical Documentation

**Last Updated:** September 20, 2025

## Architecture Overview

Meet AI is a sophisticated AI-powered video meeting platform built on a modern full-stack architecture. The system integrates real-time video calls with intelligent AI agents that can participate in conversations and automatically process meeting content.

### High-Level Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend API    │    │   External APIs │
│                 │    │                  │    │                 │
│ • React 19      │◄──►│ • Next.js 15     │◄──►│ • OpenAI        │
│ • Stream Video  │    │ • tRPC           │    │ • Stream Video  │
│ • Stream Chat   │    │ • Better Auth    │    │ • Stream Chat   │
│ • TanStack      │    │ • Webhooks       │    │ • Polar API     │
│   Query         │    │ • Premium Limits │    │ • Neon DB       │
│ • Command Pal.  │    │                  │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │ Background Jobs  │
                       │                  │
                       │ • Inngest        │
                       │ • AI Processing  │
                       │ • Transcription  │
                       │ • Billing Hooks  │
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
- **Agent Entity**: Unique ID, name, custom instructions, and user ownership
- **AI Integration Points:**
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
Stream Video → Webhook → Database Update → Inngest Event → AI Processing

### 4. Background Processing Pipeline

**Inngest Functions** (`src/inngest/functions.ts`):

**Meeting Processing Pipeline:**
1. **Transcript Fetch**: Download raw JSONL transcript from Stream
2. **Parse & Structure**: Convert JSONL to typed transcript items
3. **Speaker Enrichment**: Match speaker IDs to user/agent names
4. **AI Summarization**: Generate structured markdown summaries
5. **Database Update**: Save summary and mark meeting complete

**Pipeline Steps:** fetch → parse → enrich → summarize → save

**AI Summarizer Agent:**
- Uses GPT-4o for intelligent summarization
- Outputs structured markdown (Overview + Notes)
- Handles both human and AI agent participants

## Database Schema

### Core Entities

**Users & Authentication:**
- **users**: User accounts with Better Auth integration
- **sessions**: OAuth sessions with expiration and device tracking
- **accounts**: OAuth provider accounts (Google, GitHub, Discord)
- **verification**: Email verification tokens

**Agent Management:**
- **agents**: Custom AI agents with instructions, user ownership, and timestamps

**Meeting Data:**
- **meetings**: Meeting records with agent association, status tracking, transcript/recording URLs, AI summaries, and duration tracking
- **Status Types**: upcoming, active, completed, processing, cancelled

## API Architecture

### tRPC Router Structure

**Agent Procedures** (`src/modules/agents/server/procedures.ts`):
- `agents.list` - Fetch user's agents with pagination/filtering
- `agents.create` - Create new AI agent
- `agents.update` - Modify agent instructions
- `agents.delete` - Remove agent

**Meeting Procedures** (`src/modules/meetings/server/procedures.ts`):
- `meetings.getMany` - Fetch user's meetings with filtering, search, and pagination
- `meetings.getOne` - Get detailed meeting info with agent and duration
- `meetings.create` - Initialize new meeting (premium procedure)
- `meetings.update` - Update meeting details and status
- `meetings.remove` - Delete meeting
- `meetings.getTranscript` - Fetch processed meeting transcript
- `meetings.generateToken` - Create Stream Video authentication token
- `meetings.generateChatToken` - Create Stream Chat authentication token

**Premium Procedures** (`src/modules/premium/server/procedures.ts`):
- `premium.getCurrentSubscription` - Get active Polar subscription
- `premium.getProducts` - List available subscription plans
- `premium.getFreeUsage` - Calculate current usage for free tier users

**Authentication & Authorization:**
- `baseProcedure` - No authentication required
- `protectedProcedure` - Requires valid user session
- `premiumProcedure` - Enforces subscription limits (agents/meetings)
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
├── meetings/        # Meeting management & video calls
│   ├── hooks/       # Meeting-specific hooks
│   ├── server/      # Meeting procedures
│   ├── types.ts     # Meeting status types
│   └── ui/          # Meeting components
├── premium/         # Subscription & billing
│   ├── constants.ts # Usage limits
│   ├── server/      # Polar integration
│   └── ui/          # Pricing & upgrade UI
├── dashboard/       # Navigation & command palette
│   └── ui/components/
│       └── dashboard-command.tsx # Smart search
├── auth/            # Authentication flows
└── home/           # Landing page
```

**Key Hooks:**
- `useAgents()` - Agent CRUD operations
- `useMeetings()` - Meeting management
- `useCreateMeeting()` - Meeting initialization
- `useMeetingsFilters()` - Meeting filtering and search
- `useAgentFilters()` - Agent filtering and pagination


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
- **Database**: PostgreSQL connection URL (Neon)
- **Authentication**: Better Auth secret and OAuth provider credentials
- **AI & Video**: OpenAI API key, Stream Video API keys
- **Payments**: Polar API configuration
- **Application**: Base URL and environment settings

### Development Workflow

**Database Management:**
- `npm run db:push` - Deploy schema changes
- `npm run db:studio` - Open Drizzle Studio

**Development Server:**
- `npm run dev` - Start Next.js server
- `npm run dev:webhook` - Start ngrok tunnel for webhooks

**Code Quality:**
- `npm run lint` - ESLint checking
- `npm run build` - Production build

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

## Premium Features

### Subscription Management
- **Polar Integration**: Subscription billing and management
- **Usage Limits**: Free tier restrictions (1 meeting, 2 agents)
- **Premium Procedures**: tRPC middleware enforces subscription limits
- **Real-time Usage Tracking**: Accurate meeting and agent counts

### Command Palette
- **Intelligent Search**: Debounced search across meetings and agents
- **Performance Optimized**: Parallel queries with loading states
- **Accessibility**: ARIA labels and keyboard navigation
- **User Experience**: Error handling and empty states