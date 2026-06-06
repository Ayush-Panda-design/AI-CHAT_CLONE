# AduraAI – Full-Stack AI Chat Application

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb)
![OpenRouter](https://img.shields.io/badge/OpenRouter-API-06b6d4?style=for-the-badge)

> A production-grade AI chat application built with Next.js 15 App Router, demonstrating real-world full-stack patterns including SSR, SSG, ISR, REST API Routes, Server Actions, and MongoDB integration.

---

## Project Overview

AduraAI is a ChatGPT-inspired AI chat application where users can register, log in, and have real-time streamed conversations with 100+ AI models via the OpenRouter API. Each conversation is persisted to MongoDB Atlas, allowing users to revisit, rename, pin, and delete their chat history.

The core purpose of this project is to demonstrate **every major Next.js full-stack concept** — not as isolated examples, but wired together into a working, coherent product.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS, Framer Motion |
| State Management | Zustand + TanStack Query v5 |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT (HttpOnly cookies) + Google OAuth |
| AI Provider | OpenRouter API (100+ models) |
| Forms | React Hook Form + Zod |
| Markdown | react-markdown, rehype-highlight, remark-gfm |
| Deployment | Vercel + MongoDB Atlas |

---

## Features

- **Real-time streaming** – SSE token streaming from OpenRouter with abort support
- **100+ AI models** – GPT-4o, Claude 3.5, Gemini 1.5, Llama 3, Mistral, and more
- **JWT + Google OAuth** – Secure cookie-based auth with access and refresh tokens
- **Persistent chat history** – Full CRUD: create, read, rename, pin, and delete chats
- **Rich markdown rendering** – Syntax-highlighted code blocks with copy button, tables, task lists
- **Optimistic UI updates** – TanStack Query for instant client-side feedback
- **Fully responsive** – Mobile-first layout with collapsible sidebar
- **Dark theme** – Black base with cyan/teal accents

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx                    # Root layout — fonts, providers, metadata
│   ├── page.tsx                      # Landing page (SSG)
│   ├── auth/
│   │   ├── login/page.tsx            # Login page
│   │   └── register/page.tsx         # Register page
│   ├── chat/
│   │   ├── layout.tsx                # Chat shell layout (auth guard, sidebar)
│   │   ├── page.tsx                  # Chat welcome screen (SSR)
│   │   └── [id]/
│   │       └── page.tsx              # Individual chat page (SSR, dynamic)
│   ├── settings/
│   │   └── page.tsx                  # User settings page (SSR)
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts     # POST – register user
│       │   ├── login/route.ts        # POST – login
│       │   ├── logout/route.ts       # POST – logout, clear cookies
│       │   ├── me/route.ts           # GET  – current user
│       │   ├── refresh/route.ts      # POST – refresh access token
│       │   └── google/
│       │       ├── route.ts          # GET  – initiate Google OAuth
│       │       └── callback/route.ts # GET  – handle OAuth callback
│       ├── chats/
│       │   ├── route.ts              # GET (list), POST (create)
│       │   └── [id]/
│       │       └── route.ts          # GET, PATCH, DELETE for one chat
│       ├── messages/
│       │   └── [chatId]/route.ts     # GET – fetch messages for a chat
│       ├── chat/
│       │   └── route.ts              # POST – send message, stream AI response
│       └── models/
│           └── route.ts              # GET – list available AI models (ISR)
├── actions/
│   ├── chatActions.ts                # Server Actions: rename, pin, delete chat
│   └── userActions.ts               # Server Actions: update profile, preferences
├── components/
│   ├── ui/                           # Reusable primitives (Button, Input, Modal…)
│   └── chat/                         # ChatInput, MessageBubble, Sidebar, ModelSelector
├── hooks/                            # useChat, useAuth, useModels (custom React hooks)
├── store/                            # Zustand: chatStore, uiStore
├── models/                           # Mongoose schemas: User, Chat, Message
├── lib/
│   ├── db.ts                         # MongoDB connection singleton
│   ├── auth.ts                       # JWT sign/verify helpers
│   └── utils.ts                      # cn(), formatDate, etc.
├── providers/                        # QueryClientProvider, ThemeProvider
└── types/                            # Shared TypeScript interfaces
```

---

## Routes and Pages

| Route | Type | Rendering Strategy | Description |
|---|---|---|---|
| `/` | Page | **SSG** | Marketing landing page, no dynamic data |
| `/auth/login` | Page | SSG | Login form |
| `/auth/register` | Page | SSG | Registration form |
| `/chat` | Page | **SSR** | Chat welcome screen — reads user session at request time |
| `/chat/[id]` | Page | **SSR** | Individual conversation — loads messages fresh per request |
| `/settings` | Page | **SSR** | User settings — requires auth, reads user data from DB |

---

## API Routes

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Create account (bcrypt password, return JWT) |
| `POST` | `/api/auth/login` | Verify credentials, set HttpOnly cookie |
| `POST` | `/api/auth/logout` | Clear access + refresh token cookies |
| `GET` | `/api/auth/me` | Return current user from JWT |
| `POST` | `/api/auth/refresh` | Rotate access token using refresh token |
| `GET` | `/api/auth/google` | Redirect to Google OAuth consent screen |
| `GET` | `/api/auth/google/callback` | Exchange code for token, create/find user |

### Chats

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/chats` | List all chats for authenticated user |
| `POST` | `/api/chats` | Create a new chat with optional title and model |
| `GET` | `/api/chats/:id` | Get single chat with its messages |
| `PATCH` | `/api/chats/:id` | Update chat title, pinned status, or active model |
| `DELETE` | `/api/chats/:id` | Delete chat and all associated messages |

### Messages & AI

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/messages/:chatId` | Paginated message history for a chat |
| `POST` | `/api/chat` | Send message and stream AI response via SSE |

### Models

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/models` | List available OpenRouter models **(ISR — revalidates every 3600s)** |

All API responses follow a consistent shape:

```ts
// Success
{ success: true, data: <payload> }

// Error
{ success: false, error: "<message>", code?: "<ERROR_CODE>" }
```

---

## Server Actions

Server Actions are used for **user-initiated mutations that do not need a separate network round-trip** and that benefit from running directly on the server. This keeps the client bundle smaller and avoids an extra fetch layer.

### `src/actions/chatActions.ts`

```ts
"use server";

// Rename a chat — user edits title inline in the sidebar
export async function renameChat(chatId: string, title: string) { ... }

// Toggle pinned status — user clicks pin icon in sidebar
export async function togglePinChat(chatId: string) { ... }

// Delete a chat — called from a confirm dialog
export async function deleteChat(chatId: string) { ... }
```

### `src/actions/userActions.ts`

```ts
"use server";

// Save display name, avatar preference — settings form submission
export async function updateProfile(data: ProfileFormData) { ... }

// Set default model preference — saved from settings dropdown
export async function updateDefaultModel(model: string) { ... }
```

### Server Actions vs API Routes — Why the Distinction Matters

| | Server Actions | API Routes |
|---|---|---|
| **Used for** | Form submissions, sidebar mutations, settings saves | AI streaming, auth flows, external consumers |
| **Triggered by** | Direct React component calls (`action={…}` or `onClick`) | `fetch()` / `axios` from client |
| **Response** | Returns plain data or throws | Returns `NextResponse` with HTTP status |
| **Streaming** | Not suitable (no SSE) | Used for `/api/chat` streaming |
| **Auth** | Reads cookies directly on server | Reads cookies from request headers |

In this project: chat **sidebar actions** (rename, pin, delete) are Server Actions because they are form-driven mutations with no streaming or external consumer requirement. The AI **streaming endpoint** and **auth flows** are API Routes because they require fine-grained HTTP control (SSE headers, status codes, cookies).

---

## Rendering Strategies

### Static Site Generation (SSG)

Used for pages that contain no user-specific or frequently-changing data.

- `app/page.tsx` — Landing page. Built at compile time. Never needs re-rendering per request.
- `app/auth/login/page.tsx` and `app/auth/register/page.tsx` — Pure forms, fully static.

```ts
// No export const dynamic or revalidate needed — Next.js defaults to static
export default function LandingPage() { ... }
```

### Server-Side Rendering (SSR)

Used for pages that display user-specific or request-time data.

- `app/chat/page.tsx` — Must read the user's session cookie to show their name and recent chats.
- `app/chat/[id]/page.tsx` — Must fetch messages for the specific chat ID from MongoDB on each request, so fresh data is always shown.
- `app/settings/page.tsx` — Reads current user preferences from DB.

```ts
// Forces SSR — data must be fresh per request
export const dynamic = "force-dynamic";

export default async function ChatPage({ params }: { params: { id: string } }) {
  const messages = await getMessages(params.id); // server-side DB fetch
  return <ChatView messages={messages} />;
}
```

### Incremental Static Regeneration (ISR)

Used for data that is mostly static but should refresh periodically.

- `app/api/models/route.ts` — The list of available OpenRouter models does not change every minute, but does update when new models are released. ISR revalidates the cached response every hour without rebuilding the whole app.

```ts
export const revalidate = 3600; // revalidate every 1 hour

export async function GET() {
  const models = await fetchModelsFromOpenRouter();
  return NextResponse.json({ success: true, data: models });
}
```

---

## Database Integration

### Connection (`src/lib/db.ts`)

A singleton connection pattern prevents multiple Mongoose connections during hot reloads in development.

```ts
import mongoose from "mongoose";

let cached = global.mongoose;

export async function connectDB() {
  if (cached?.conn) return cached.conn;
  cached.conn = await mongoose.connect(process.env.MONGODB_URI!);
  return cached.conn;
}
```

### Schemas (`src/models/`)

**User** — `email`, `passwordHash`, `displayName`, `googleId`, `defaultModel`, `createdAt`

**Chat** — `userId` (ref User), `title`, `model`, `pinned`, `createdAt`, `updatedAt`

**Message** — `chatId` (ref Chat), `role` (`user` | `assistant`), `content`, `model`, `createdAt`

All DB logic is confined to `src/models/` and `src/lib/`. API routes and Server Actions call these helpers — no raw Mongoose queries leak into page or component files.

---

## How to Run Locally

```bash
# 1. Clone the repo
git clone https://github.com/Ayush-Panda-design/AI-CHAT_CLONE.git
cd AI-CHAT_CLONE

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Open .env.local and fill in all values (see section below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Copy `.env.example` to `.env.local` and fill in:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ai-chat?retryWrites=true&w=majority

# JWT secrets — use random strings of at least 32 characters
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Google OAuth credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# OpenRouter API key (https://openrouter.ai)
OPENROUTER_API_KEY=sk-or-v1-your-openrouter-key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Public app URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret

NODE_ENV=development
```

---

## Database Setup

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) and create a free cluster (M0).
2. Under **Database Access**, add a user with read/write permissions.
3. Under **Network Access**, add `0.0.0.0/0` to allow connections (or add your IP and Vercel's IP range).
4. Click **Connect → Drivers** and copy the connection string.
5. Replace `<user>` and `<password>` in the string and set it as `MONGODB_URI` in `.env.local`.
6. Mongoose will automatically create the `users`, `chats`, and `messages` collections on first use — no manual schema migration needed.

---

## Google OAuth Setup

1. Go to [console.cloud.google.com](https://console.cloud.google.com).
2. Create a new project (or use an existing one).
3. Navigate to **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**.
4. Set **Application type** to "Web application".
5. Add to **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/google/callback` (development)
   - `https://your-domain.vercel.app/api/auth/google/callback` (production)
6. Copy the **Client ID** and **Client Secret** into `.env.local`.

---

## OpenRouter Setup

1. Sign up at [openrouter.ai](https://openrouter.ai).
2. Go to **Keys** and generate an API key.
3. Set `OPENROUTER_API_KEY` in `.env.local`.
4. Models are fetched dynamically — no additional config needed.

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

After deploying, go to the **Vercel Dashboard → Your Project → Settings → Environment Variables** and add all values from `.env.local`. Redeploy once to apply.

---

## Concepts Covered from Class

| Concept | Where in This Project |
|---|---|
| **Next.js project setup** | `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, App Router in `src/app/` |
| **File-based routing** | Every folder inside `app/` maps to a URL segment |
| **Layouts** | `app/layout.tsx` (root), `app/chat/layout.tsx` (chat shell with sidebar + auth guard) |
| **Multiple pages/routes** | `/`, `/auth/login`, `/auth/register`, `/chat`, `/chat/[id]`, `/settings` |
| **SSR** | `/chat`, `/chat/[id]`, `/settings` — all use `force-dynamic` |
| **SSG** | `/`, `/auth/login`, `/auth/register` — built at compile time |
| **ISR** | `/api/models` — `export const revalidate = 3600` |
| **API Routes (GET)** | `/api/chats`, `/api/auth/me`, `/api/messages/:chatId`, `/api/models` |
| **API Routes (POST)** | `/api/auth/register`, `/api/auth/login`, `/api/chat` (streaming) |
| **API Routes (PATCH)** | `/api/chats/:id` — update title, pin, model |
| **API Routes (DELETE)** | `/api/chats/:id` — remove chat and messages |
| **Database connection** | `src/lib/db.ts` — Mongoose singleton |
| **Structured API responses** | All routes return `{ success, data }` or `{ success, error }` |
| **Error handling** | try/catch in every route, HTTP status codes (400, 401, 404, 500) |
| **Server Actions** | `src/actions/chatActions.ts`, `src/actions/userActions.ts` with `"use server"` |
| **`use server` directive** | Top of every file in `src/actions/` |
| **Server Actions vs API Routes** | Actions for sidebar mutations; API Routes for streaming and external flows |

---

## Assumptions and Limitations

- Google OAuth requires the callback URL to be registered in Google Cloud Console. Local and production URLs must both be added.
- The `/api/models` route caches the OpenRouter model list for 1 hour. If a model is removed from OpenRouter mid-session, the client may still show it until the cache refreshes.
- Chat history is stored per-user in MongoDB; there is no anonymous session support.
- The streaming endpoint (`/api/chat`) uses ReadableStream with SSE — this works on Vercel Edge-compatible runtimes but may need adjustment for non-Vercel Node deployments.
- No rate limiting is implemented on API routes in this version.

---

## License

MIT — free to use for personal and educational projects.
