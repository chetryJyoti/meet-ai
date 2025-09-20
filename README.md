# Meet AI

**AI-Powered Video Meetings with Intelligent Agents**

Meet AI transforms video calls by bringing custom AI agents directly into your meetings. Create personalized AI assistants that can join video calls, participate in conversations, and automatically generate detailed meeting summaries.

## What It Does

🎯 **AI Agents in Video Calls** - Your custom AI agents join meetings as virtual participants
📹 **Live Video Integration** - Real-time video calls powered by Stream Video SDK
🤖 **Smart Conversation** - AI agents respond naturally using OpenAI's Realtime API
📝 **Auto Meeting Summaries** - AI generates structured summaries after each meeting
🎙️ **Transcription & Processing** - Full meeting transcripts with speaker identification
⚡ **Real-time Processing** - Background processing pipeline handles everything automatically
💎 **Premium Subscriptions** - Flexible pricing tiers with usage limits via Polar integration
🔍 **Smart Dashboard Search** - Quickly find meetings and agents with intelligent command palette

## How It Works

1. **Create Your Agent** - Design custom AI assistants with specific instructions
2. **Start a Meeting** - Launch video calls with integrated Stream Video
3. **Agent Joins Automatically** - Your AI agent connects and participates in real-time
4. **Get Smart Summaries** - Receive detailed meeting notes and insights after each call

## Key Features

- 🤖 **Custom AI Agents** - Personalized assistants with specific roles and knowledge
- 📹 **Video Meetings** - HD video calls with AI participant integration
- 🎙️ **Real-time Voice** - Natural voice conversations with AI agents
- 📊 **Meeting Analytics** - Detailed summaries, transcripts, and insights
- 🔐 **Secure Platform** - Enterprise-grade security with multi-provider auth
- 🎨 **Modern Interface** - Clean, intuitive design for seamless user experience
- 💳 **Subscription Management** - Polar-powered billing with flexible pricing tiers
- 🔍 **Command Palette** - Quick search across all meetings and agents
- 📈 **Usage Analytics** - Track meeting counts and agent utilization
- 🎯 **Free Tier** - Get started with 1 meeting and 2 agents at no cost

## Perfect For

- **Customer Support** - AI agents that can handle support calls and escalate when needed
- **Sales Demos** - AI assistants that know your product inside and out
- **Team Meetings** - AI note-takers and meeting facilitators
- **Training Sessions** - AI coaches and interactive learning companions

## Tech Stack

**Frontend & Backend**
- Next.js 15 with App Router
- React 19, TypeScript
- Tailwind CSS v4 + Shadcn/ui

**AI & Video**
- OpenAI GPT-4o & Realtime API
- Stream Video SDK for HD video calls
- Stream Chat for real-time messaging
- Inngest (background processing)

**Database & Auth**
- PostgreSQL (Neon) with full schema
- Drizzle ORM with type-safe queries
- Better Auth (Google, GitHub, Discord)

**Infrastructure**
- tRPC (type-safe APIs)
- TanStack React Query (caching)
- Polar (subscription billing)
- Lucide React (icons)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/meet-ai.git
cd meet-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys:
# - OpenAI API key
# - Stream Video API key & secret
# - Database URL (Neon PostgreSQL)
# - Better Auth secret
# - Polar API key

# Push database schema
npm run db:push

# Start development server
npm run dev

# Set up webhook tunnel (in another terminal)
npm run dev:webhook

# Open Drizzle Studio (optional)
npm run db:studio
```

## Recent Updates

**🔧 Latest Improvements**
- ✅ **Enhanced Dashboard Search** - Implemented intelligent command palette with debounced search, loading states, and error handling
- ✅ **Fixed Meeting Counts** - Replaced hardcoded values with real database counts using Drizzle's `$count()` method
- ✅ **Polar Integration** - Full subscription management with usage limits and billing
- ✅ **Meeting Management** - Complete CRUD operations with status tracking (upcoming, active, completed, processing, cancelled)
- ✅ **Real-time Chat** - Stream Chat integration for in-meeting communication
- ✅ **Premium Features** - Usage-based restrictions with upgrade prompts

## Documentation

📚 [Technical Documentation](./TECHNICAL.md) - Deep dive into architecture and implementation
🔧 [Development Guide](./CLAUDE.md) - Development setup and project structure
