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
- Stream Video SDK
- Inngest (background processing)

**Database & Auth**
- PostgreSQL (Neon)
- Drizzle ORM
- Better Auth (Google, GitHub, Discord)

**Infrastructure**
- tRPC (type-safe APIs)
- TanStack React Query
- Polar (payments)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/yourusername/meet-ai.git
cd meet-ai

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your API keys (OpenAI, Stream Video, Database URL)

# Push database schema
npm run db:push

# Start development server
npm run dev

# Set up webhook tunnel (in another terminal)
npm run dev:webhook
```

## Documentation

📚 [Technical Documentation](./TECHNICAL.md) - Deep dive into architecture and implementation
