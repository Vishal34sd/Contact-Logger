# Contact Logger Backend

A production-grade Node.js/Express backend that integrates with HubSpot via OAuth to automatically synchronize contacts and manage contact notes.

## Features

*   **HubSpot OAuth 2.0**: Implements the latest `2026-03` token endpoints.
*   **Automatic Resumable Sync**: Fetches contacts securely with pagination and checkpointing. If the sync crashes, it resumes from the last cursor.
*   **Contact Notes**: Create notes locally and sync them to HubSpot asynchronously. Includes a retry mechanism for failed syncs.
*   **Clean Architecture**: Separation of concerns across Controllers, Services, Repositories, and Models.
*   **Production Ready**: Includes centralized error handling, Zod validation, rate limiting, Winston structured logging, NoSQL injection prevention, and token encryption.

## Tech Stack

*   Node.js (ES Modules)
*   Express.js
*   MongoDB (Mongoose)
*   Axios (HubSpot API)
*   Zod (Validation)
*   Winston (Logging)

*Note: As per requirements, BullMQ and Redis are NOT used, but the architecture (specifically `SyncService`) is designed so background jobs can be plugged in later with minimal changes.*

## Getting Started

### Prerequisites

*   Node.js v18+
*   MongoDB Instance
*   HubSpot Developer Account & Public App

### 1. Installation

```bash
npm install
```

### 2. Configuration

Copy the example environment file and configure it:

```bash
cp .env.example .env
```

**Important Environment Variables:**
*   `MONGODB_URI`: Your MongoDB connection string.
*   `HUBSPOT_CLIENT_ID` & `HUBSPOT_CLIENT_SECRET`: From your HubSpot Public App.
*   `ENCRYPTION_KEY`: A 64-character hex string used to encrypt OAuth tokens at rest. Generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Running the Server

**Development Mode:**
```bash
npm run dev
```

**Production Mode:**
```bash
npm start
```

## API Documentation

### Auth Endpoints

*   `GET /api/auth/hubspot`: Returns the HubSpot Authorization URL.
*   `GET /api/auth/hubspot/callback`: Handles the OAuth redirect, exchanges code for tokens, and **triggers the automatic background sync**.
*   `GET /api/auth/hubspot/status`: Returns current connection status and last sync metrics.
*   `POST /api/auth/hubspot/disconnect`: Disconnects the active HubSpot integration.

### Contact Endpoints

*   `GET /api/contacts`: Retrieves a paginated list of synchronized contacts.
    *   Query params: `page`, `limit`, `search`, `sort`
*   `GET /api/contacts/:id`: Retrieves a single contact by local MongoDB ID.

### Note Endpoints

*   `GET /api/contacts/:id/notes`: Retrieves paginated notes for a contact.
*   `POST /api/contacts/:id/notes`: Creates a note locally and initiates a sync to HubSpot.
*   `POST /api/notes/retry-failed`: Manually triggers a retry for notes that failed to sync to HubSpot.

## Architecture Highlights

1.  **Repository Pattern**: Mongoose models are wrapped in repository classes (`src/repositories`) to abstract database queries from business logic.
2.  **HubSpot Client**: `src/libs/hubspotClient.js` utilizes Axios interceptors to automatically decrypt and inject the Access Token. It also intercepts `401 Unauthorized` errors to proactively refresh the token and retry the failed request transparently.
3.  **Idempotent Sync**: `src/services/syncService.js` uses `SyncCheckpoint` to store HubSpot's pagination cursors. If a sync fails midway, it will pick up exactly where it left off on the next run.
