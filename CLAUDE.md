# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Development server**: `npm run dev`
- **Build**: `npm run build` 
- **Production server**: `npm start`
- **Linting**: `npm run lint`
- **Database push**: `npm run db:push` - Push database schema changes to Neon
- **Database studio**: `npm run db:studio` - Open Drizzle Studio for database management

## Project Architecture

**Meet AI** is a Next.js 15 application for creating custom AI agents with customer support capabilities.

### Tech Stack
- **Framework**: Next.js 15 with App Router, React 19, TypeScript
- **Database**: PostgreSQL (Neon) with Drizzle ORM
- **Authentication**: Better Auth with Google, GitHub, Discord providers
- **API Layer**: tRPC for type-safe API calls
- **State Management**: TanStack React Query
- **Styling**: Tailwind CSS v4 with Shadcn/ui components
- **Payments**: Polar integration with subscription management
- **AI Integration**: OpenAI GPT-4o and Realtime API
- **Video/Chat**: Stream Video SDK and Stream Chat for real-time communication
- **Background Processing**: Inngest for webhook handling and async tasks

### Directory Structure

- `src/app/` - Next.js App Router pages and API routes
  - `(auth)/` - Authentication pages (sign-in, sign-up)
  - `(dashboard)/` - Protected dashboard pages and agent management
  - `api/auth/` - Better Auth API routes
  - `api/trpc/` - tRPC API endpoints

- `src/modules/` - Feature-based module organization
  - `agents/` - Agent management (CRUD, filtering, forms)
  - `auth/` - Authentication views and components
  - `dashboard/` - Dashboard navigation, command palette, and layout
  - `meetings/` - Meeting management, video calls, and chat integration
  - `premium/` - Subscription management and usage limits
  - `home/` - Landing page

- `src/components/` - Reusable UI components
  - `ui/` - Shadcn/ui component library

- `src/trpc/` - tRPC configuration and routers
- `src/db/` - Database schema and connection
- `src/lib/` - Utility functions and configurations

### Module Architecture

Each feature module follows this structure:
- `hooks/` - Custom React hooks
- `schemas.ts` - Zod validation schemas  
- `server/procedures.ts` - tRPC procedures
- `types.ts` - TypeScript type definitions
- `ui/components/` - Feature-specific components
- `ui/views/` - Page-level views
- `params.ts` - URL parameter handling (if needed)

### Database Schema

Key entities:
- `user` - User accounts with Better Auth integration
- `session` - User sessions and authentication tokens
- `account` - OAuth provider accounts
- `verification` - Email verification tokens
- `agents` - Custom AI agents with instructions and user ownership
- `meetings` - Video meetings with status tracking, recording URLs, and transcripts
  - Status enum: upcoming, active, completed, processing, cancelled
  - Links to agents and users
  - Stores transcriptUrl, recordingUrl, summary, duration
  - Automatic timestamps for created/updated

### Authentication Flow

Uses Better Auth with:
- Email/password authentication
- OAuth providers (GitHub, Google)
- Protected routes using tRPC middleware
- Session management with database persistence

### tRPC Setup

- Base procedures: `baseProcedure`, `protectedProcedure`, `premiumProcedure`
- Authentication middleware enforces user sessions
- Premium middleware checks subscription status and usage limits
- Type-safe client-server communication
- Integrated with TanStack React Query for caching
- Routers: agents, meetings, premium, auth

### Development Notes

- All database operations use Drizzle ORM with type-safe queries
- Components use Radix UI primitives with Tailwind styling
- Form handling with React Hook Form + Zod validation
- Error boundaries and loading states implemented
- Responsive design with mobile-first approach
- Real-time features using Stream Video and Chat SDKs
- Background processing with Inngest for webhooks and async tasks
- Meeting counts use efficient `db.$count()` method for better performance
- Command palette with debounced search and proper error handling

### Premium Features

- **Free Tier**: 1 meeting, 2 agents maximum
- **Subscription Management**: Powered by Polar
- **Usage Tracking**: Real-time count of meetings and agents
- **Premium Procedures**: tRPC middleware enforces limits
- **Upgrade Flow**: Seamless subscription management