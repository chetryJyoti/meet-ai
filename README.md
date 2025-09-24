# Meet AI

**AI-Powered Customer Conversations with Intelligent Agents**

Meet AI enables businesses to create custom AI agents that can join video calls, engage in real-time conversations, and deliver personalized customer experiences. Whether it’s customer support, sales consultations, or specialized discussions, your AI agents act as reliable, intelligent team members.

## What It Does

* 🎯 **Custom AI Agents** – Tailored to your brand, product knowledge, and conversation style
* 📹 **Video Call Integration** – Real-time video conversations with human-like AI agents
* 🤖 **Conversational Intelligence** – Agents respond naturally using OpenAI’s Realtime API
* 📝 **Post-Call Insights** – Structured summaries, transcripts, and action points after each call
* ⚡ **Automation & Scale** – Handle multiple customer interactions seamlessly
* 💎 **Subscription Tiers** – Flexible usage-based pricing with Polar integration
* 🔍 **Agent & Call Dashboard** – Manage, search, and analyze customer conversations

## How It Works

1. **Create Your Agent** – Define its role, instructions, and knowledge base
2. **Start a Conversation** – Launch video calls powered by Stream Video SDK
3. **Agent Joins the Call** – The AI participates in real-time, handling queries or demos
4. **Get Insights** – Summaries, analytics, and transcripts automatically generated

## Key Features

* 🤖 **Customizable AI Agents** – For support, sales, or domain-specific expertise
* 📹 **Video Meetings** – Customers interact with AI in a natural face-to-face experience
* 🎙️ **Real-time Voice & Chat** – Smooth, interactive conversations
* 📊 **Call Analytics** – Summaries, transcripts, and customer insights
* 🔐 **Secure Platform** – Enterprise-ready authentication and data handling
* 💳 **Subscription Management** – Usage-based billing with Polar
* 📈 **Dashboard Analytics** – Track agent performance and call outcomes

## Perfect For

* **Customer Support** – 24/7 AI agents to resolve queries and escalate when needed
* **Sales Consultations** – Product demos and Q\&A with expert AI assistants
* **Specialized Conversations** – AI experts for healthcare, finance, education, and more

## Tech Stack

**Frontend & Backend**

* Next.js 15 (App Router)
* React 19, TypeScript
* Tailwind CSS v4 + Shadcn/ui

**AI & Video**

* OpenAI GPT-4o & Realtime API
* Stream Video SDK for real-time calls
* Stream Chat for messaging
* Inngest (background processing)

**Database & Auth**

* PostgreSQL (Neon)
* Drizzle ORM
* Better Auth (Google, GitHub, Discord)

**Infrastructure**

* tRPC (type-safe APIs)
* TanStack React Query
* Polar (subscription billing)
* Lucide React (icons)

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

* ✅ **Agent-Centric Dashboard** – Manage multiple agents and conversations in one place
* ✅ **Call Analytics** – Track meeting outcomes with real database counts
* ✅ **Polar Billing** – Flexible subscriptions with usage tracking
* ✅ **Real-time Video & Chat** – Seamless customer conversations with Stream SDK
* ✅ **Insights Engine** – Summaries and transcripts auto-generated after calls