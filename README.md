# Sentinels of Truth — Real-Time Evidence-Based Fact Verification Engine

[![React](https://img.shields.io/badge/React-19.2-blue?logo=react&logoColor=white)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.2-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-8E75B2?logo=google&logoColor=white)](https://ai.google.dev/)
[![Pinecone](https://img.shields.io/badge/Pinecone-Vector_DB-000000?logo=pinecone&logoColor=white)](https://www.pinecone.io/)
[![Tavily](https://img.shields.io/badge/Tavily-Live_Search_API-4285F4?logo=google-chrome&logoColor=white)](https://tavily.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9.1-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Clerk](https://img.shields.io/badge/Clerk-Authentication-6C47FF?logo=clerk&logoColor=white)](https://clerk.com/)

**Sentinels of Truth** is a high-throughput, low-latency fact-verification engine engineered to dissect suspicious claims, viral rumors, and forwarded media at network speed. Beneath an editorial, calm newsroom interface lies an autonomous dual-agent architecture powered by Google Gemini, live multi-source web retrieval via Tavily, and a sub-second semantic vector cache via Pinecone.

[Live Demo](https://sentinels-of-truth-93j9.vercel.app) • [Architecture](#-system-architecture) • [Dual-Agent Design](#-why-dual-agent-architecture) • [Engineering Highlights](#-engineering-highlights--guardrails) • [Local Setup](#-local-development--setup-guide)

---

## 🧭 The Problem & Product Philosophy

### The Misinformation Problem
In modern social networks and private messaging apps (WhatsApp, Telegram, X), misinformation travels exponentially faster than investigative journalism can produce debunks. Traditional fact-checking workflows require tedious manual cross-referencing across archives, national statistical registries, and institutional records—a high-friction process that everyday readers cannot perform in real time.

### The Design Philosophy: Editorial Simplicity Over Technical Jargon
Most AI applications overwhelm users with robotic chat interfaces, streaming markdown tables, and exposed token metrics. Sentinels of Truth intentionally rejects this paradigm:
- **Surface Layer (Consumer Experience)**: Clean, typography-first newsroom aesthetic (*Newsreader serif* and *Inter sans*). Zero AI buzzwords, zero prompt engineering exposure. Every breakdown delivers an editorial verdict (`True`, `False`, `Unclear`), confidence score, plain-language summary, and clickable primary citations.
- **Deep Layer (System Engineering)**: A resilient, asynchronous pipeline built for production scale. Combines real-time Server-Sent Events (SSE), instant stream cancellation, strict temporal query guards, sub-second semantic vector retrieval (~0.5s vs 15-20s live web search), and an asynchronous audit agent that protects against vector database poisoning.

---

## 🏗 System Architecture

The following diagram illustrates the complete, end-to-end lifecycle of a verification request:

```mermaid
flowchart TD
    A["User Submits Claim"] --> B["API Gateway: Helmet, CORS, Global Limiter"]
    B --> C["Verify Quota & Cooldown<br/>(One-Way Salted SHA-256 IP Hash)"]
    C --> D{"Temporal Marker Check<br/>(today, now, latest, etc.)"}
    
    %% Semantic Cache Route
    D -- "Contains Temporal Markers" --> H["Bypass Cache<br/>(Prevent Stale Verdicts)"]
    D -- "Static / Historical Claim" --> E["Pinecone Semantic Cache<br/>(gemini-embedding-2: 768-dim)"]
    
    E --> F{"Similarity Score >= 0.85 &<br/>Polarity Check Passed?"}
    F -- "Cache Hit (<1s)" --> G["Format Verdict Payload<br/>(Origin: verified_db)"]
    G --> L["Emit SSE Event: 'result'"]
    
    %% Live Verification Route
    F -- "Cache Miss" --> H
    H --> I["Alpha Agent: Live Research Loop"]
    I --> J["Tavily Search API<br/>(Live Primary Source Extraction)"]
    J --> K["Gemini 2.5 Flash Synthesis<br/>(Evidence Cross-Examination & Confidence Calculation)"]
    K --> L
    
    %% Stream & Post-Processing
    L --> M["Client Displays ResponseCard<br/>& Updates Local State"]
    
    %% Asynchronous Gatekeeper
    K -.->|"Async Background Trigger"| N["Beta Agent: Quality Gatekeeper"]
    N --> O["Pinecone k-NN Search (topK=5)"]
    O --> P{"Gemini Audit Decision"}
    P -- "Genuinely New Evidence" --> Q["Save to Pinecone Vector DB"]
    P -- "Duplicate / Redundant" --> R["Reject (Prevent Bloat)"]
    P -- "Contradiction / Conflict" --> S["Queue to MongoDB 'Review' Collection<br/>(Human-in-the-Loop Audit)"]
```

### End-to-End Request Lifecycle Stages
1. **Gateway Ingestion & Rate Verification**: Request passes through `helmet`, CORS validation, and a salted SHA-256 IP hash lookup to enforce anti-spam cooldowns (30s backend gap) and quota bounds.
2. **Temporal Marker Triage**: The query is evaluated by `TIME_SENSITIVE_REGEX` (`today`, `now`, `current`, `latest`, `aaj`, `abhi`). If temporal markers are detected, the semantic cache is immediately bypassed to ensure rapidly evolving events are never answered with stale cached verdicts.
3. **Semantic Vector Cache Retrieval**: For non-temporal queries, the claim is vectorized into a 768-dimensional space via `gemini-embedding-2` and compared against Pinecone vector records. If a cosine similarity match exceeds `0.85` and passes a strict polarity check (ensuring negated statements like *"Earth is round"* vs *"Earth is flat"* never match), the verified record is served in sub-second latency (~0.5s).
4. **Live Multi-Source Investigation (Alpha Agent)**: On a cache miss, the Alpha Agent initiates parallel web retrieval via the Tavily Search API. It extracts raw source documents, cross-examines evidence across reputable domains, computes an evidence-weighted confidence score, and structures the verdict into a strict Zod schema.
5. **Real-Time SSE Streaming**: Progression updates (`checking_cache`, `searching`, `analyzing`) and the final structured payload stream over Server-Sent Events (SSE). The stream is bound to a client-side `AbortController`, enabling users to instantly halt backend execution without orphaned worker processes.
6. **Asynchronous Quality Audit (Beta Agent)**: Upon successful Alpha execution, a decoupled worker process invokes the Beta Agent. It evaluates the new verdict against existing vector clusters to prevent vector cache poisoning, automatically routing contradictory findings into a MongoDB `Review` queue for human review.

---

## 🤖 Why Dual-Agent Architecture?

Most LLM pipelines rely on a single agent prompt to handle both user delivery and database persistence. In production, this creates severe failure modes: hallucinations are written directly into persistent storage, redundant duplicates inflate vector indexing costs, and conflicting verdicts silently degrade system accuracy over time.

Sentinels of Truth decouples these concerns into a specialized **Dual-Agent Architecture**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          SYNCHRONOUS USER PATH                         │
│                                                                        │
│   [User Input] ──► [Alpha Agent] ──► [Tavily Web Search + Gemini]     │
│                           │                                            │
│                           ▼                                            │
│            [Real-Time SSE Stream Response] ──► User Screen (Fast UX)   │
└───────────────────────────┬────────────────────────────────────────────┘
                            │ (Asynchronous Non-Blocking Hand-off)
┌───────────────────────────▼────────────────────────────────────────────┐
│                        ASYNCHRONOUS AUDIT PATH                         │
│                                                                        │
│                    [Beta Agent Gatekeeper]                             │
│                           │                                            │
│              [Pinecone k-NN Cluster Query]                             │
│                           │                                            │
│     ┌─────────────────────┼─────────────────────┐                      │
│     ▼                     ▼                     ▼                      │
│  [INSERT]              [REJECT]          [HUMAN_REVIEW]                │
│  Genuinely New       Duplicate / Same    Contradicts Existing Evidence │
│  Vector Saved to     Meaning. Zero       Quarantined in Mongo Review   │
│  Pinecone            DB Pollution.       Queue for Audit               │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Alpha Agent (User-Facing Research Specialist)
- **Role**: Synchronous evidence gathering and synthesis.
- **Execution Mode**: Real-time streaming.
- **Responsibilities**:
  - Classifies user intent (factual claim vs. casual greeting).
  - Queries Tavily API for primary sources across established institutions and news desks.
  - Synthesizes findings into a strict JSON payload containing `claim`, `verification_status` (`verified` | `fake`), `summary`, `sources`, and `confidence`.
  - Prioritizes speed and clarity so the user receives a verdict with minimal latency.

### 2. Beta Agent (Asynchronous Vector Gatekeeper)
- **Role**: Decoupled quality assurance, deduplication, and vector database integrity guard.
- **Execution Mode**: Asynchronous background process (executes after client response completes).
- **Responsibilities**:
  - Embeds the Alpha payload and queries Pinecone for the top 5 nearest vector neighbors.
  - Prompts an independent reasoning model to compare the new verdict with existing vector matches under strict deterministic rules:
    - **`reject`**: If the claim asserts the same factual meaning and verdict as an existing record, the write is suppressed. This eliminates duplicate vector clutter and saves storage costs.
    - **`human_review`**: If the new verdict contradicts an existing high-confidence vector entry, the record is quarantined and pushed to MongoDB's `Review` collection with a `pending` status. It is **never** written to Pinecone automatically, preventing cache corruption.
    - **`insert`**: Only verified, non-redundant, and non-contradictory claims are committed to Pinecone vector storage.

---

## 🛡 Dual-Storage Privacy Architecture

User privacy and public information must never live in the same database table. Sentinels of Truth enforces a strict architectural boundary between verified public facts and private user records:

| Architectural Dimension | Public Knowledge Layer | Private User Layer |
| :--- | :--- | :--- |
| **Storage Technology** | **Pinecone Serverless Vector DB** | **MongoDB Atlas + Clerk Auth** |
| **Data Scope** | Verified claims, embeddings, summaries, source links | User profiles, private search history, rate quotas |
| **PII & User Identity** | **Strictly Zero PII**. No user IDs, no IP logs, no auth tokens | Tied exclusively to Clerk `userId` (`u:user_...`) |
| **Data Retention** | Permanent vector index (unless revoked during audit) | Ephemeral / user-controlled (delete item / clear all) |
| **Access Control** | Read by all users (cached lookups), written only by Beta Agent | Authenticated JWT read/write per user scope |
| **Anonymous Fallback** | Global public availability | Temporary browser UUID stored in `localStorage` |

### Guest-to-Authenticated History Adoption Flow
When an unauthenticated visitor uses the platform, their search results are temporarily recorded in MongoDB under an ephemeral browser UUID (`X-Guest-Id`) for up to 5 items:
1. The client generates and persists a cryptographically random UUID in `localStorage`.
2. Every unauthenticated verification request attaches this token via the `X-Guest-Id` HTTP header.
3. Upon signing in or creating an account via Clerk, `Layout.jsx` detects an active session and automatically dispatches a single background POST request to `/history/adopt`.
4. The backend atomically migrates all temporary guest records to the permanent authenticated `History` collection under the user's `userId`, and purges the temporary entries from `GuestResult`.
5. The guest token is cleared from `localStorage`. The transition from guest to registered user is completely seamless with zero data loss.

---

## ⚡ Engineering Highlights & Guardrails

### 1. Real-Time SSE & Token-Safe Cancellation
Long-running AI verification processes (10–25s) risk wasting expensive LLM generation tokens if a user navigates away or cancels.
- **Client-Side**: A dedicated `AbortController` is bound to the fetch stream. Clicking the **"Stop"** button triggers `abort()`, immediately closing the connection.
- **Server-Side**: The Express route listens to the `res.on("close")` event. If the client disconnects before completion, the server terminates the streaming loop, signals the Gemini SDK abort controller, and cleans up timers, preventing runaway token expenditure.
- **Heartbeat & Dead-Connection Reaping**: A 15-second SSE heartbeat (`: ping\n\n`) keeps intermediary reverse proxies from dropping idle connections, paired with a global 60-second watchdog timer.

### 2. Multi-Tier Rate Limiting & Abuse Prevention
To protect against automated scraping and DDoS attacks while remaining completely accessible to genuine users:
- **One-Way Salted IP Hashing**: Guest IPs are never stored in plain text. Backend computes `sha256(req.ip + ":" + process.env.IP_SALT)` to produce an irreversible lookup key (`ip:<hash>`).
- **Anti-Spam Cooldown Gap (`GAP_MS = 30s`)**: Consecutive queries from the same identity must respect a 30-second cooldown gap. Violations trigger an immediate `HTTP 429` with `Retry-After` headers, which the frontend translates into an interactive button countdown (`Wait 20s`).
- **Tiered Quotas**:
  - **Guest Tier**: 2 verified queries per rolling 24 hours (tracked via IP hash in MongoDB with TTL auto-expiration).
  - **Registered Tier**: 20 comprehensive verifications per rolling 24 hours (tracked via Clerk User ID).
- **Fair Quota Refund**: If an internal server error or API quota exhaustion occurs during verification, the backend automatically calls `req.refundQuota()`, restoring the user's quota balance.
- **Global Server Limiters**: Express rate limiters enforce a maximum of 60 requests/minute per IP across standard routes and 40 requests/minute on the live suggestion endpoint.

### 3. Frontend Performance & Accessibility
- **Accessible High-Contrast Theme Tokens**: Full semantic color system implemented via Tailwind CSS v4 variables supporting seamless system-aware dark and light modes.
- **Fluid Typography**: Self-hosted variable fonts (`@fontsource-variable/newsreader` for editorial authority and `@fontsource-variable/inter` for high-legibility UI microcopy).
- **Accessible Slide-Over Drawers (`Sheet`)**: Keyboard-navigable (`Escape` to dismiss), focus-trapped history drawer portal preventing background scroll bleed.
- **Route-Level Code Splitting**: Heavy auxiliary views (`AboutPage`, `PrivacyPage`, `ResultPreview`) are dynamically loaded via `React.lazy()` and `React.Suspense`, keeping initial bundle size minimal (~170 kB gzipped).
- **Native & WhatsApp Sharing**: Integrated Web Share API with an automated fallback that generates clean, pre-encoded WhatsApp debrief links for one-tap forward debunking.

---

## 🛠 Tech Stack Breakdown

| Layer | Technology | Primary Function |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19.2 + Vite 8.0** | High-performance SPA with concurrent rendering and instant HMR |
| **Styling & Design** | **Tailwind CSS v4.0** | Modern theme token architecture with zero CSS runtime overhead |
| **Typography** | **Newsreader & Inter (Variable)** | Editorial newsroom aesthetic optimized for readability |
| **Animation Engine** | **Motion 14.2 (Framer Motion)** | Physics-based micro-interactions, layout transitions, and progress pills |
| **Icons** | **Hugeicons React** | Modern, accessible stroke icons |
| **Client Authentication**| **@clerk/clerk-react 5.61** | Secure authentication modals, session tokens, and user profile management |
| **HTTP Client** | **Axios & Fetch API** | REST API communication and native ReadableStream SSE consumption |
| **Backend Runtime** | **Node.js 20+ & Express 5.2** | High-concurrency event-driven web server |
| **Server Authentication**| **@clerk/express 2.1** | JWT bearer token verification and session extraction |
| **API Validation** | **Zod 3.25** | Runtime request body and agent output schema validation |
| **Security Middleware** | **Helmet 8.3 & CORS** | HTTP security headers, CSP, and strict origin filtering |
| **Rate Limiting** | **express-rate-limit** | IP-level DDoS defense and sliding window request throttling |
| **AI Reasoning** | **Google Gemini 2.5 Flash** | Multi-step evidence synthesis, verdict generation, and contradiction analysis |
| **Vector Embeddings** | **Google Gemini Embedding 2** | 768-dimensional dense semantic vector representation |
| **Live Web Search** | **Tavily Core Search API** | High-precision factual web retrieval with primary citation extraction |
| **Vector Database** | **Pinecone Serverless 5.1** | Low-latency approximate nearest neighbor (ANN) semantic vector search |
| **Document Database** | **MongoDB Atlas + Mongoose 9.1** | User check history, temporary guest results, and human review queue |

---

## 📁 Project Directory Structure

```text
Sentinels_of_Truth/
├── Backend/
│   ├── src/
│   │   ├── agent/
│   │   │   ├── alpha.js               # Alpha Agent: live web search + Gemini reasoning
│   │   │   └── beta.js                # Beta Agent: vector deduplication & contradiction gatekeeper
│   │   ├── config/
│   │   │   ├── dataBase.js            # Pinecone Vector DB client configuration
│   │   │   └── mongo.js               # MongoDB Mongoose connection manager
│   │   ├── controllers/
│   │   │   ├── history.js             # User search history retrieval, deletion, and clear all
│   │   │   ├── query_suggestion.js    # Autocomplete suggestion generator
│   │   │   └── verify.js              # SSE streaming verification controller (Alpha + Cache)
│   │   ├── middleware/
│   │   │   ├── auth.js                # Clerk optionalAuth and requireAuth middleware
│   │   │   ├── rateLimiters.js        # Salted IP hashing, 30s gap cooldown, and quota enforcement
│   │   │   └── validate.js            # Zod validation middleware for incoming request payloads
│   │   ├── models/
│   │   │   ├── GuestResult.js         # Ephemeral guest check storage for post-login adoption
│   │   │   ├── History.js             # Permanent user search history records
│   │   │   ├── Review.js              # Contradictory claims queued for human verification
│   │   │   └── Usage.js               # Daily rate quota tracking records with TTL index
│   │   ├── routes/
│   │   │   ├── history_route.js       # Authenticated history endpoints (/history)
│   │   │   ├── response_route.js      # Primary verification endpoints (/get/validate-stream)
│   │   │   └── suggestion_route.js    # Live autocomplete suggestion endpoints (/sug)
│   │   ├── utils/
│   │   │   ├── adoptGuestHistory.js   # Atomic guest-to-authenticated history migration
│   │   │   ├── Date_time.js           # Timestamp formatting utilities
│   │   │   ├── embedded.js            # Gemini 768-dimensional vector embedding generator
│   │   │   ├── get_suggestion.js      # Pinecone-assisted suggestion match generator
│   │   │   ├── resultPayload.js       # Standardized response payload builder
│   │   │   ├── SaveResponse.js        # Pinecone upsert helper function
│   │   │   ├── semanticCache.js       # Vector similarity cache check with polarity validation
│   │   │   └── web_search_tool.js     # Tavily Search API client wrapper
│   │   ├── index.js                   # Express server entry point, middleware stack, routes
│   │   └── .env.example               # Backend environment variable template
│   └── package.json
│
├── Frontend/
│   ├── src/
│   │   ├── assets/                    # Project brand assets and logos
│   │   ├── auth/
│   │   │   └── useAppAuth.js          # Unified Clerk authentication hook and modal controls
│   │   ├── components/
│   │   │   ├── reactbits/
│   │   │   │   ├── ThoughtLine.css    # Animated reasoning stage pulse styling
│   │   │   │   └── ThoughtLine.jsx    # Live progress indicator during SSE streaming
│   │   │   ├── ui/
│   │   │   │   ├── Badge.jsx          # Reusable categorical badge component
│   │   │   │   ├── Button.jsx         # Accessible button component with loading states
│   │   │   │   ├── Card.jsx           # Semantic content card container
│   │   │   │   ├── Chip.jsx           # Interactive example query chips
│   │   │   │   ├── ConfidenceMeter.jsx# Evidence confidence score visualizer
│   │   │   │   ├── Sheet.jsx          # Focus-trapped accessible slide-over drawer
│   │   │   │   ├── SourceList.jsx     # Credible publisher domain and citation renderer
│   │   │   │   └── VerdictBadge.jsx   # Verdict status badge (Verified, Fake, Unclear)
│   │   │   ├── Footer.jsx             # Editorial footer with navigation links
│   │   │   ├── HistorySheet.jsx       # User history drawer with in-place clear confirmation
│   │   │   ├── Layout.jsx             # Root layout with progress bar, nav, guest adoption
│   │   │   ├── QueryForm.jsx          # Primary claim submission form, cooldown timer, chips
│   │   │   ├── ResponseCard.jsx       # Comprehensive verdict card with source receipts & share
│   │   │   ├── SuggestionDropdown.jsx # Real-time autocomplete suggestions dropdown
│   │   │   └── ThemeToggle.jsx        # System / Light / Dark mode toggle switch
│   │   ├── config/
│   │   │   └── site.js                # Global application metadata and social links
│   │   ├── context/
│   │   │   └── ToastContext.jsx       # Global notification toast context provider
│   │   ├── dev/
│   │   │   └── ResultPreview.jsx      # Development mode result visualizer
│   │   ├── Navigatiaon/
│   │   │   └── Nav_bar.jsx            # Editorial header with active pill indicator & mobile drawer
│   │   ├── pages/
│   │   │   ├── About_page.jsx         # About page with editorial standards & usage quotas
│   │   │   ├── Landing_page.jsx       # Main landing page, hero verifier, FAQs, step guide
│   │   │   ├── NotFound_page.jsx      # 404 handler with fallback route recovery
│   │   │   └── Privacy_page.jsx       # Data transparency and privacy policy disclosures
│   │   ├── theme/
│   │   │   └── ThemeProvider.jsx      # Theme state management and local storage persistence
│   │   ├── utils/
│   │   │   ├── authToken.js           # Clerk JWT token retrieval helper
│   │   │   ├── axiosClient.js         # Configured Axios instance with backend base URL
│   │   │   ├── guestId.js             # Client-side anonymous guest token manager
│   │   │   ├── publishers.js          # Domain-to-publisher mapping for citation cards
│   │   │   ├── streamVerify.js        # SSE stream consumer with AbortController lifecycle
│   │   │   ├── usePageTitle.js        # Dynamic HTML document title manager
│   │   │   └── verdict.js             # Verdict status formatting and color helper
│   │   ├── App.jsx                    # Route configuration and lazy-loaded views
│   │   ├── index.css                  # Tailwind CSS v4 directives and typography variables
│   │   └── main.jsx                   # Application bootstrap with Clerk and Theme providers
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🚀 Local Development & Setup Guide

### 1. Prerequisites
Ensure you have the following installed on your machine:
- **Node.js**: `v20.0.0` or higher
- **npm** or **pnpm**
- **Git**

You will also need free-tier developer accounts and API keys from:
1. [Google AI Studio](https://aistudio.google.com/) — for Gemini API access (`GOOGLE_API_KEY`).
2. [Tavily AI](https://tavily.com/) — for real-time web search (`TAVILY_API_KEY`).
3. [Pinecone](https://www.pinecone.io/) — for serverless vector indexing (`PINECONE_API_KEY`, `PINECONE_INDEX_NAME`). Index must be created with **Dimension: 768** and **Metric: Cosine**.
4. [MongoDB Atlas](https://www.mongodb.com/atlas) — for user records and quota storage (`MONGODB_URI`).
5. [Clerk](https://clerk.com/) — for user authentication (`CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`).

---

### 2. Repository Cloning & Installation

```bash
# Clone the repository
git clone https://github.com/Brijesh667/Sentinels_of_Truth.git
cd Sentinels_of_Truth

# Install Backend dependencies
cd Backend
npm install

# Install Frontend dependencies
cd ../Frontend
npm install
```

---

### 3. Environment Configuration

#### Backend Environment Variables
Create a `.env` file inside the `Backend/` directory:

```bash
# Backend/.env
PORT=5000
FRONTEND_URL=http://localhost:5173

# Google Gemini API
GOOGLE_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash

# Tavily Search API
TAVILY_API_KEY=your_tavily_search_api_key_here

# Pinecone Vector Database (Dimension: 768, Metric: Cosine)
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=sentinels-claims
PINECONE_ENVIRONMENT=us-east-1

# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sentinels_of_truth?retryWrites=true&w=majority

# Clerk Authentication (Backend Secret)
CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
CLERK_SECRET_KEY=sk_test_your_clerk_secret_key

# Security & Rate Limits
IP_SALT=your_custom_secret_salt_here
GUEST_LIMIT=2
USER_LIMIT=20

# Semantic Cache Configuration
SEMANTIC_CACHE=on
CACHE_MIN_SCORE=0.85
CACHE_MIN_CONFIDENCE=80
CACHE_TTL_DAYS=30
```

#### Frontend Environment Variables
Create a `.env` file inside the `Frontend/` directory:

```bash
# Frontend/.env
VITE_BACKEND_URL=http://localhost:5000
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_clerk_publishable_key
```

---

### 4. Running the Development Servers

Open two terminal tabs:

**Terminal 1: Start Backend**
```bash
cd Backend
npm run dev
# Server will start on http://localhost:5000
```

**Terminal 2: Start Frontend**
```bash
cd Frontend
npm run dev
# Vite client will launch on http://localhost:5173
```

Navigate to `http://localhost:5173` in your browser to interact with the platform.

---

### 5. Production Build Verification

To verify that the frontend builds without type or bundling errors:

```bash
cd Frontend
npm run build
```

The production assets will be output to `Frontend/dist/`.

---

## 👨‍💻 Author & Acknowledgements

**Sentinels of Truth** is architected and maintained as an independent open-source initiative by **Brijesh Kumar**.

- **GitHub**: [@Brijesh667](https://github.com/Brijesh667)
- **Repository**: [https://github.com/Brijesh667/Sentinels_of_Truth](https://github.com/Brijesh667/Sentinels_of_Truth)
- **Live Production URL**: [https://sentinels-of-truth-93j9.vercel.app](https://sentinels-of-truth-93j9.vercel.app)

---


<p align="center">
  <b>Built for truth, source transparency, and media literacy.</b>
</p>