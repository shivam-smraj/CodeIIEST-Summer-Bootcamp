# CodeIIEST CP & DSA Summer Bootcamp 2026 (Season 01)

<div align="center">

```text
 ██████╗  ██████╗ ██████╗ ███████╗██╗██╗███████╗███████╗████████╗
██╔════╝ ██╔═══██╗██╔══██╗██╔════╝██║██║██╔════╝██╔════╝╚══██╔══╝
██║      ██║   ██║██║  ██║█████╗  ██║██║█████╗  ███████╗   ██║   
██║      ██║   ██║██║  ██║██╔══╝  ██║██║██╔══╝  ╚════██║   ██║   
╚██████╗ ╚██████╔╝██████╔╝███████╗██║██║███████╗███████║   ██║   
 ╚═════╝  ╚═════╝ ╚═════╝ ╚══════╝╚═╝╚═╝╚══════╝╚══════╝   ╚═╝   
              ⚡ CP & DSA Summer Bootcamp Portal ⚡
```

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-blue?style=for-the-badge&logo=next.js&logoColor=white&labelColor=222)](https://nextjs.org)
[![React Version](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react&logoColor=white&labelColor=222)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white&labelColor=222)](https://typescriptlang.org)
[![Database](https://img.shields.io/badge/MongoDB-9.6.2-green?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=222)](https://mongodb.com)
[![Vercel Analytics](https://img.shields.io/badge/Vercel_Analytics-Enabled-black?style=for-the-badge&logo=vercel&logoColor=white&labelColor=222)](https://vercel.com/analytics)
[![Licence](https://img.shields.io/badge/Licence-MIT-yellow?style=for-the-badge&labelColor=222)](LICENSE)

An elegant, high-performance, and feature-rich Web Portal and Admin Control Panel designed for **CodeIIEST** to conduct, manage, and track its annual **8-Week Competitive Programming and DSA Summer Bootcamp**.

[Explore Platform Features](#-key-features-overview) • [Developer Setup](#%EF%B8%8F-local-development-setup) • [System Design Diagrams](#%EF%B8%8F-system-design--workflows) • [API Directory](#-api-endpoint-reference)

</div>

---

## 🌟 Key Features Overview

### 🚀 Student Portal & User Experience
* **Secure Google OAuth:** Real-time session generation via **NextAuth.js** (Auth.js v5) supporting institutional domains.
* **Auto Institutional Onboarding:** Instant roll identifier parsing (e.g., `2024EEB109` automatically yields batch 2028, enrollment 2024, and Electrical Engineering).
* **One-Click Codeforces handshake:** Secure, instant validation of participant handles via public Codeforces API checks.
* **Responsive Leaderboard:** Highly responsive, paginated, and real-time scoreboard with inline search filters.
* **Gamified Profiles:** Dynamic user cards with Codeforces ratings, current milestones, and allocated bootcamp houses (**Turing**, **Dijkstra**, **Lovelace**, **Von Neumann**).

---

### 🛠️ Administrative & CMS Control Suite
* **Automated Standings Sync:** Live contest pulling using Codeforces standing endpoints and group structures.
* **Preview ── Edit ── Commit Flow:** Visual verification panel comparing raw CF data with matched bootcamp players before writing changes.
* **Multi-Week Score Manager:** Administrative spreadsheet grid for manual adjustments, reverts, or score overrides.
* **Curriculum CMS:** Timing locks, editorial upload interfaces, and Google Meet integration for weekly bootcamp topics.
* **Privileged RBAC:** Role-based access control protecting secure APIs and admin routes with high-priority check layers.

---

## 🗺️ System Design & Workflows

### 1. Overall System Architecture
Diagram detailing client web layers, authentication frameworks, backend controllers, external Codeforces APIs, and database caches:

```mermaid
graph TD
    %% Clients
    Browser[Student Browser] -->|HTTPS Requests| Next[Next.js App Server]
    AdminBrowser[Admin Dashboard] -->|Auth Token + POST| Next
    
    %% Middleware & Auth
    Next -->|Session Validation| Auth[NextAuth.js]
    Auth -->|OAuth Handshake| Google[Google Identity Provider]
    
    %% Databases
    Next -->|Mongoose ODM| DB[(MongoDB Atlas Database)]
    
    %% Third-party APIs
    Next -->|Poll Standings| CF[Codeforces REST API]
    Browser -->|Usage Metrics| Vercel[Vercel Web Analytics]
```

---

### 2. Student Onboarding Workflow
Dynamic workflow showing how student data is validated and parsed automatically on first registration:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Browser
    participant App as Next.js App
    participant Auth as NextAuth Google
    participant DB as MongoDB Database
    participant CF as Codeforces API

    Student->>App: Click "Sign In with Google"
    App->>Auth: Request Authentication
    Auth-->>App: Return Google Session Profile
    App->>DB: Check if Profile Registered
    alt Not Registered
        App->>Student: Redirect to Onboarding Wizard
        Student->>App: Input Roll ID (e.g., 2024EEB109)
        App->>App: Automatically parse Dept (EE), Year (2024), Grad Batch (2028)
        Student->>App: Connect Codeforces Handle (e.g., Anon_thefool)
        App->>CF: Verify handle validity via Codeforces OAuth Handshake
        CF-->>App: Handle verified successfully
        App->>DB: Write user profile with default "User" role
    else Already Registered
        App->>Student: Load Profile Dashboard
    end
```

---

### 3. Role-Based Access Control (RBAC) Guard Pipeline
Security sequence depicting NextAuth token validation and MongoDB role checks protecting admin operations:

```mermaid
sequenceDiagram
    autonumber
    actor Admin as Admin Browser
    participant Router as Next.js API Middleware
    participant Auth as NextAuth.js (Session)
    participant DB as MongoDB (User Role)
    participant API as Target Admin API Route

    Admin->>Router: HTTPS POST /api/admin/... (with Cookie)
    Router->>Auth: Check Active Session Auth
    alt Session Missing
        Auth-->>Admin: 401 Unauthorized Response
    else Session Valid
        Auth->>Router: Session Data (Email)
        Router->>DB: Fetch User Role from Database
        DB-->>Router: User Role (e.g., 'user', 'admin')
        alt Role is NOT admin or superadmin
            Router-->>Admin: 403 Forbidden Response
        else Role IS Admin / Superadmin
            Router->>API: Forward Authorized Request
            API->>DB: Execute Action & Commit
            DB-->>API: Success Response
            API-->>Admin: 200 OK Response
        end
    end
```

---

### 4. Standings Sync & Score Calculator Workflow
Flow highlighting the dry-run standings parser, delta comparisons, and score sorting formulas:

```mermaid
graph TD
    A[Admin inputs Codeforces Contest ID & Selects Week] --> B(Query Codeforces API /contest.standings)
    B --> C{Verify Standing Rows}
    C -->|Match verified students| D[Preview Grid: Show Calculated Week Scores]
    C -->|Unregistered Handles| E[Preview Grid: Flag Unmatched Codeforces Users]
    D --> F[Admin Edits/Overwrites and approves Sync]
    F --> G[Atomic Commit to MongoDB]
    G --> H[Update User totalPoints = Sum of top 6 weeks]
```

---

### 5. Best-N (Top 6 of 8 Weeks) Points Model
Formula mapping how the top scoring weeks are isolated and compiled dynamically to compile total points:

```mermaid
graph LR
    subgraph "Weekly Points Collected (Example)"
        W1[Week 1: 100]
        W2[Week 2: 85]
        W3[Week 3: 0]
        W4[Week 4: 90]
        W5[Week 5: 95]
        W6[Week 6: 80]
        W7[Week 7: 100]
        W8[Week 8: 70]
    end

    W1 & W2 & W4 & W5 & W6 & W7 & W8 --> Sort[Sort Descending]
    W3 -->|Lowest Score Dropped| Drop1[Unused Week]
    W8 -->|Lowest Score Dropped| Drop2[Unused Week]
    
    Sort --> Top6[Select Top 6 Scores]
    Top6 -->|Sum: 100+100+95+90+85+80| Total[totalPoints: 550]
```

---

### 6. Codeforces API Data Normalization Pipeline
Data mapping detailing how CF JSON fields are parsed, normalized, and mapped to internal models:

```mermaid
graph TD
    Raw[Codeforces /contest.standings JSON] --> Parser[Standings Parser]
    Parser --> Filter[Filter: Group ID & Registered Handles Only]
    Filter --> Math[Compute Week Points based on Solve Count & Penalty]
    Math --> DBCompare[Load Existing DB User Scores]
    DBCompare --> Delta[Compute Deltas & Total Rank Shift]
    Delta --> Visual[Generate Preview Standings Table]
```

---

### 7. Real-Time Visitor Metrics & Logging
Private tracking architecture detailing asynchronous client hits and unique IP hashing updates:

```mermaid
graph TD
    Visitor[Site Visitor] -->|Access Page| Hit[POST /api/analytics]
    Hit -->|Extract IP & Hash| SHA[SHA-256 Generator]
    SHA -->|Hash String| DBUpdate[MongoDB Atomic Update]
    DBUpdate -->|Increment Views & $addToSet IP| Stats[(Analytics Collection)]
    
    Admin[Admin Panel] -->|Load Dashboard| Metric[GET /api/admin/analytics]
    Metric -->|Read Stats| Stats
    Metric -->|Display UI| Cards[Page Views & Unique Visitor Cards]
```

---

### 8. Mongoose Serverless Connection Cache Flow
Database caching scheme that safeguards Atlas from connection exhaustion across dynamic lambdas:

```mermaid
graph TD
    subgraph "Next.js Lambda Containers (Vercel)"
        L1[Lambda instance 1]
        L2[Lambda instance 2]
        L3[Lambda instance 3]
    end

    subgraph "Global Variable Cache Block"
        GC1[global.__mongooseCache]
        GC2[global.__mongooseCache]
        GC3[global.__mongooseCache]
    end

    subgraph "MongoDB Atlas Cluster"
        Pool[(Pooled Connection Instance)]
    end

    L1 -->|Reuses Connection| GC1
    L2 -->|Reuses Connection| GC2
    L3 -->|Reuses Connection| GC3
    
    GC1 & GC2 & GC3 -->|Single active pool channel| Pool
```

---

## 🗃️ Database Entity Relationship (ER) Schema

Blueprint detailing keys, indexes, and primary structural schemas within the MongoDB database:

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        string email UK
        string displayName
        string cfHandle UK
        string rollId
        string role
        number totalPoints
        array scores
    }
    SESSION {
        ObjectId _id PK
        number weekNumber UK
        string topic
        boolean isUnlocked
        string editorialUrl
        number contestId
    }
    CONTEST {
        ObjectId _id PK
        number contestId UK
        string name
        array standings
        Date syncedAt
    }
    ANALYTICS {
        ObjectId _id PK
        number views
        array uniqueIpHashes
    }
    
    USER ||--o[0..8] CONTEST : "participates in"
    CONTEST ||--|| SESSION : "associated with"
```

---

## 🏗️ Technical Stack

* **Core Framework:** Next.js 16.2.6 (App Router), React 19.2.4, TypeScript 5.x
* **Database & ORM:** MongoDB, Mongoose ODM 9.6.2
* **Authentication:** NextAuth.js (Auth.js v5 Beta) with Google OAuth 2.0
* **Styling & Aesthetics:** Vanilla CSS with glassmorphism panels, dark mode palette, micro-animations, and Geist typography.
* **Component Library:** Customized Radix UI primitives (`Avatar`, `Dialog`, `Dropdown`, `Select`, `Tooltip`, `Toaster` by Sonner).
* **Integrations:** Codeforces public API, Vercel Web Analytics

---

## 📂 Folder Structure

```text
codeiiest-bootcamp/
├── src/
│   ├── app/                      # Next.js App Router Pages & API Routes
│   │   ├── admin/                # Admin Panel pages (Sync, Scores, Contests, CMS)
│   │   ├── api/                  # Backend endpoints
│   │   │   ├── admin/            # Role-protected admin actions
│   │   │   │   ├── analytics/    # Admin metrics retriever (GET)
│   │   │   │   ├── contests/     # Manage synchronized contests (GET/DELETE)
│   │   │   │   ├── scores/       # Batch score management (GET/DELETE)
│   │   │   │   └── sync-contest/ # Handshake preview and DB commit pipeline (POST)
│   │   │   ├── analytics/        # Public visitor log hit endpoint (POST)
│   │   │   └── sessions/         # Public course CMS info (GET)
│   │   ├── leaderboard/          # Public participant scoreboard
│   │   ├── onboarding/           # New student profile creation wizard
│   │   └── profile/              # User dashboard & statistics page
│   ├── components/               # React components
│   │   ├── admin/                # Admin layouts, grids, and controllers
│   │   ├── home/                 # Hero elements, timelines, and feature panels
│   │   ├── layout/               # Global Navbar, Footer, and Page wrappers
│   │   └── ui/                   # Shared primitives (Logo, Splash intro, Avatar)
│   ├── lib/                      # Core helpers (Mongoose client, CF handshakes, parsers)
│   └── models/                   # Mongoose Database Models (User, Session, Contest, Analytics)
├── scripts/                      # DB administration scripts (Seeding, Promotion)
├── public/                       # Static media, icons, and verification files
└── package.json                  # NPM dependencies & task configurations
```

---

## 🛠️ Local Development Setup

### 1. Prerequisites
Ensure you have **Node.js** (v18 or higher) and **NPM** installed on your workstation. A running instance of **MongoDB** (local server or MongoDB Atlas cluster) is required.

### 2. Clone the Repository
```bash
git clone https://github.com/CodeIIEST/CodeIIEST-Summer_Bootcamp.git
cd CodeIIEST-Summer_Bootcamp/codeiiest-bootcamp
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Setup Environment Variables
Create a `.env.local` file in the root directory and populate the required parameters:

```env
# Database
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net
MONGODB_DB_NAME=codeiiest_bootcamp

# NextAuth.js Configuration
# Generate a secure secret using: openssl rand -base64 32
AUTH_SECRET=your_auth_secret_key_here
NEXTAUTH_URL=http://localhost:3000

# Google OAuth Credentials (obtain from Google Cloud Console)
AUTH_GOOGLE_ID=your_google_client_id_here
AUTH_GOOGLE_SECRET=your_google_client_secret_here

# App Deployment URLs
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. Run Database Seeding
Populate the database with the default weekly curriculum topics, timing bounds, and session templates:
```bash
npm run seed
```

### 6. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser to view the application.

---

## 🚀 Database Management Scripts

The repository includes custom Node.js utility scripts located under the `scripts/` directory for database administration:

### 🌟 Promote User to Admin/Superadmin
Elevate any registered user profile to administrative status by running:
```bash
npm run promote:superadmin
# You will be prompted to provide the registered student email address.
```

### 🔄 Reset Synced Contests
Roll back score synchronization states or wipe contest histories safely:
```bash
npm run reset:contest
```

---

## 🔌 API Endpoint Reference

### Public API Endpoints

#### 📈 Log Visitor Hit
* **Endpoint:** `POST /api/analytics`
* **Description:** Atomically logs a home page hit. Extracts the user's IP address from headers, hashes it with standard `SHA-256` to secure visitor privacy, and logs it.
* **Response:**
```json
{ "success": true }
```

#### 📅 Fetch Weekly Curriculum Sessions
* **Endpoint:** `GET /api/sessions`
* **Description:** Retrieves all course sessions for the 8-week curriculum.
* **Response:**
```json
{
  "sessions": [
    {
      "weekNumber": 1,
      "topic": "Time Complexity & STL Basics",
      "isUnlocked": true,
      "editorialUrl": "https://codeiiest.in/editorials/week1",
      "meetUrl": "https://meet.google.com/abc-defg-hij",
      "contestId": 521458
    }
  ]
}
```

---

### Admin-Protected API Endpoints (Requires Admin Session)

#### 📊 Fetch Visitor and Metrics Statistics
* **Endpoint:** `GET /api/admin/analytics`
* **Description:** Fetches real-time total page views and unique visitor statistics.
* **Response:**
```json
{
  "views": 15420,
  "uniqueVisitors": 1289
}
```

#### 🎛️ Preview Codeforces Standings
* **Endpoint:** `POST /api/admin/sync-contest/preview`
* **Description:** Performs a dry-run sync. Fetches standing rows from the Codeforces API, matches user handles, computes scores, and flags unregistered handles.
* **Payload:**
```json
{
  "contestId": 521458,
  "weekNumber": 1,
  "groupId": 10245
}
```
* **Response:**
```json
{
  "contestName": "Bootcamp Contest 01",
  "syncedRows": 45,
  "unmatchedHandles": ["fake_handle_123"],
  "bootcampParticipants": [
    {
      "email": "2024eeb109@iiests.ac.in",
      "displayName": "Shivam",
      "cfHandle": "Anon_thefool",
      "solved": 5,
      "penalty": 140,
      "score": 100
    }
  ]
}
```

---

## 🔒 Security Practices
* **Anonymized IP Analytics:** IP hashes are generated in memory using standard SHA-256 before writing to the database. Raw IP coordinates are immediately discarded and never stored.
* **NextAuth Security Hooks:** Administrative APIs and private pages execute NextAuth server-side session checks to guarantee authorization before loading database contents.
* **Connection Pooling:** Integrates mongoose caching globally across lambdas to prevent Mongo server connection exhaustion.

---

## 💡 Troubleshooting & Common Issues

### 1. MongoDB Connection Exhaustion
If you encounter `MongooseError: Connection timed out` on dev reloads or serverless functions:
> **Solution:** Ensure your code imports `connectToDatabase` from `@/lib/mongoose`. This helper utilizes a global cache pointer that pools connections across hot-reloads in development and serverless container warmups.

### 2. NextAuth Google Authentication Fails
If login triggers an OAuth error or authentication redirects to a mismatch landing page:
> **Solution:** Confirm that your production domains or `http://localhost:3000` are added to the **Authorized JavaScript origins** and **Authorized redirect URIs** (`/api/auth/callback/google`) in the Google Cloud API Console credentials dashboard.

---

*Made with ♥ by the **CodeIIEST Dev Team**.*
