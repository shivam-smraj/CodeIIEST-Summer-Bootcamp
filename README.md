# CodeIIEST CP & DSA Summer Bootcamp 2026 (Season 01)

<div align="center">

```text
   ______          __         ____  _____________________
  / ____/___  ____/ /__  ____/ / / / / ____/ ___/_  __/_/
 / /   / __ \/ __  / _ \/ __  / /_/ / __/  \__ \ / /  
/ /___/ /_/ / /_/ /  __/ /_/ / __  / /___ ___/ // /   
\____/\____/\__,_/\___/\__,_/_/ /_/_____//____//_/    
      ⚡ CP & DSA Summer Bootcamp Portal ⚡
```

[![Next.js Version](https://img.shields.io/badge/Next.js-16.2.6-blue?style=for-the-badge&logo=next.js&logoColor=white&labelColor=222)](https://nextjs.org)
[![React Version](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react&logoColor=white&labelColor=222)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=for-the-badge&logo=typescript&logoColor=white&labelColor=222)](https://typescriptlang.org)
[![Database](https://img.shields.io/badge/MongoDB-9.6.2-green?style=for-the-badge&logo=mongodb&logoColor=white&labelColor=222)](https://mongodb.com)
[![Vercel Analytics](https://img.shields.io/badge/Vercel_Analytics-Enabled-black?style=for-the-badge&logo=vercel&logoColor=white&labelColor=222)](https://vercel.com/analytics)
[![Licence](https://img.shields.io/badge/Licence-MIT-yellow?style=for-the-badge&labelColor=222)](LICENSE)

An elegant, high-performance, and feature-rich Web Portal and Admin Control Panel designed for **CodeIIEST** to conduct, manage, and track its annual **8-Week Competitive Programming and DSA Summer Bootcamp**.

[Explore Platform Features](#-key-features) • [Developer Setup](#%EF%B8%8F-local-development-setup) • [API Directory](#-api-endpoint-reference) • [Database Architecture](#%EF%B8%8F-core-database-schema-reference)

</div>

---

## 🌟 Key Features

### 🚀 Student Portal & User Experience
* **Secure Google OAuth Authentication:** Seamless login for IIEST Shibpur students using their institutional or personal Google accounts via **NextAuth.js**.
* **Smart Institutional Onboarding:** Automatically extracts student enrollment year, graduating batch, specific department code, and full department name from their institutional roll numbers (e.g., `2024EEB109` is parsed to 2024 entry year, 2028 batch, and Electrical Engineering).
* **One-Click Codeforces Handle Verification:** Simple authentication hook to verify participants' Codeforces handles using public API handshakes to prevent manual typos or handle impersonation.
* **Interactive Weekly Leaderboard:** Real-time search, filter, and pagination of participants. Ranks are dynamically evaluated, color-coded by performance thresholds, and sortable by total cumulative points.
* **Responsive Profile Cards & Gamified House Assignments:** Personalized participant dashboards highlighting current Codeforces ratings, peak rankings, Department stats, weekly standings, and assigned gamified houses (**Turing**, **Dijkstra**, **Lovelace**, **Von Neumann**).

### 🛠️ Administrative & CMS Suite
* **Automated Codeforces Standings Sync Engine:** Admins can query any Codeforces Contest ID, select the corresponding bootcamp week, specify a Group ID, and sync standings instantly.
* **Preview ── Edit ── Commit Flow:** A safety sync pipeline that fetches standings from Codeforces, matches handles against registered students, lists unregistered players, calculates delta totals, and allows the admin to edit or toggle participants before writing to the database.
* **Any-Time Score Manager Panel:** A comprehensive, grid-based interface showing all users × 8 weeks of scores, allowing admins to override individual scores, apply manual corrections, or zero/revert weekly scores instantly.
* **Interactive Sessions CMS:** Dynamic course curriculum scheduler enabling admins to unlock weekly contents, publish topic-specific editorials, set Google Meet/MS Teams links, and post contest problem-set guidelines.
* **Privileged RBAC (Role-Based Access Control):** Granular access tiers (`user`, `admin`, `superadmin`) to protect administrative routes and write API endpoints.

### 📊 System Analytics & Tracking
* **Vercel Web Analytics Integration:** Official `@vercel/analytics` integrated within the React tree to monitor site performance, page view distribution, and load speed.
* **Privacy-Preserving Unique Visitor Analytics:** A lightweight, self-hosted tracker that logs homepage hits. To ensure GDPR and strict user privacy compliance, visitor IP addresses are hashed using `SHA-256` in real-time. The raw IPs are never stored, and unique counts are dynamically updated.
* **Admin Analytics Dashboard:** A beautiful, visual analytics grid displaying real-time metrics, including:
  * **Page Views** (aggregated hits)
  * **Unique Visitors** (unique hashed IPs)
  * **Registered Participants** (total registered students)
  * **Contests Synced** (progress of synced weeks)
  * **Sessions Unlocked** (weeks published)

---

## 🏗️ Core Architecture & Flow Diagram

### Student Onboarding Flow
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

### Standings Sync Flow (Admin Control)
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

## 💻 Technical Stack & Environment

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

## 🗃️ Core Database Schema Reference

### 👤 User Schema (`src/models/User.ts`)
Tracks student profile information, verified handles, and weekly scores.
* **Identity:** Google Account associations, email, displayName.
* **Institutional:** Roll number, graduation batch year, automatic department string parsing.
* **Codeforces:** Verified CF handle, current CF rating, avatar URL.
* **Bootcamp Stats:**
  * `scores`: array of size 8 representing week 1 to 8 points.
  * `weeklyRanks`: standings rank of the student in each weekly contest.
  * `totalPoints`: computed cumulative score (sum of the top 6 scoring weeks).

### 📅 Session Schema (`src/models/Session.ts`)
Controls the CMS data for the weekly CP curriculum.
* `weekNumber`: number (1 through 8).
* `topic`: topic title (e.g., "Advanced Graphs & Flows").
* `isUnlocked`: boolean visibility control.
* `editorialUrl`, `editorialTitle`: resources for problem analysis.
* `meetUrl`: meeting link for live lectures.
* `contestId`: linked Codeforces contest ID.

### 📉 Analytics Schema (`src/models/Analytics.ts`)
Aggregates performance stats and site traffic.
* `views`: total website page views.
* `uniqueIpHashes`: array of SHA-256 anonymized client IP hashes to ensure unique visitor counting.

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
