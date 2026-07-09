# Contact Logger

**Live Demo URLs:**
- **Frontend**: [https://contact-logger-alpha.vercel.app/](https://contact-logger-alpha.vercel.app/)
- **Backend API**: [https://contact-logger.onrender.com](https://contact-logger.onrender.com)

## Project overview

A production-grade, full-stack application that integrates with HubSpot via OAuth to automatically synchronize contacts and manage contact notes. Built with React (Vite) for the frontend and Node.js/Express for the backend. The application provides a responsive UI to view paginated contacts, add notes locally, and syncs data to and from HubSpot in the background.

## Architecture

The system utilizes a clean 3-tier architecture:
1. **Frontend**: A React/Vite Single Page Application (SPA) providing a modern user interface.
2. **Backend**: A Node.js/Express REST API that acts as an intermediary, orchestrating the OAuth flow and background syncs. It uses a Domain-Driven Layered Architecture (Controllers, Services, Repositories, Models).
3. **Database**: MongoDB handles persistent storage of synced contacts, notes, and encrypted OAuth tokens.

**Architecture Highlights:**
* **Repository Pattern**: Mongoose models are wrapped in repository classes (`src/repositories`) to abstract database queries from business logic.
* **HubSpot Client**: `src/libs/hubspotClient.js` utilizes Axios interceptors to automatically decrypt and inject the Access Token, intercepting `401 Unauthorized` errors to proactively refresh the token.
* **Idempotent Sync**: `src/services/syncService.js` uses `SyncCheckpoint` to store HubSpot's pagination cursors. If a sync fails midway, it picks up exactly where it left off on the next run.

*For detailed architectural documentation, please see the [docs/](docs/README.md) folder.*

## Technology choices

### Frontend (Client)
*   **Core**: React 19, Vite
*   **Routing**: `react-router-dom`
*   **Styling**: Tailwind CSS, `tailwind-merge`, `clsx`
*   **Forms & Validation**: `react-hook-form`, `@hookform/resolvers`, `zod`
*   **Networking**: `axios`
*   **UI Assets**: `lucide-react`, `react-toastify`

### Backend (Server)
*   **Core**: Node.js (v18+), Express.js
*   **Database**: MongoDB (`mongoose`)
*   **HubSpot API**: `axios`
*   **Security & Middleware**: `cors`, `cookie-parser`, `compression`, `express-rate-limit`, `express-mongo-sanitize`
*   **Validation**: `zod`
*   **Logging**: `winston`, `morgan`
*   **Utilities**: `dotenv`

## Setup instructions

### Prerequisites

*   Node.js v18+
*   MongoDB Instance
*   HubSpot Developer Account & Public App

### Installation

Install dependencies for both the client and server:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

## Environment variables

For the backend, create a `.env` file in the `server` directory.

**Required Environment Variables (`server/.env`):**
*   `PORT`: The port the server runs on (e.g., `5000`).
*   `MONGODB_URI`: Your MongoDB connection string.
*   `HUBSPOT_CLIENT_ID`: Your HubSpot Public App Client ID.
*   `HUBSPOT_SECRET`: Your HubSpot Public App Client Secret.
*   `HUBSPOT_REDIRECT_URL`: Your HubSpot Redirect URI.
*   `ENCRYPTION_KEY`: A 64-character hex string used to encrypt OAuth tokens at rest. Generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

*Note: The frontend does not require a `.env` for local development as it uses Vite's proxy, but in production, Vite uses `VITE_API_URL` to point to the hosted backend.*

## Local development instructions

You need to run both the frontend and backend servers simultaneously.

**Run the Backend:**
```bash
cd server
npm run dev
```

**Run the Frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000`.

## Deployment instructions

### Backend Deployment (Render/Heroku)
1. Deploy the `server` directory as a Node web service.
2. Ensure the Build Command is `npm install` and the Start Command is `npm start`.
3. Populate all Environment Variables (including the MongoDB connection string) in the host's dashboard.

### Frontend Deployment (Vercel/Netlify)
1. Deploy the `client` directory.
2. Set the Build Command to `npm run build` and Output Directory to `dist`.
3. Add the `VITE_API_URL` environment variable pointing to the deployed backend.
4. *Important*: Vercel requires the `vercel.json` file (included in the `client/` folder) to properly route SPA traffic to `index.html` and prevent 404 errors on refresh.

## Features implemented

*   **HubSpot OAuth 2.0**: Secure authentication using the latest `2026-03` token endpoints.
*   **Automatic Resumable Sync**: Asynchronous fetching of contacts with pagination and cursor-based checkpointing.
*   **Local-First Contact Notes**: Notes are created instantly in the local UI and synced to HubSpot in the background.
*   **Retry Mechanism**: Notes that fail to sync (e.g., due to network issues) are queued and can be retried.
*   **Modern SPA UI**: Clean, responsive frontend with form validation, error handling, and toast notifications.
*   **Security Best Practices**: Includes centralized Express error handling, Zod validation, rate limiting, Winston structured logging, NoSQL injection prevention, and AES-256 token encryption at rest.

## Assumptions

*   **Single Tenant Architecture**: The current schema and background sync loops assume a single organizational tenant using the application.
*   **Source of Truth**: HubSpot is treated as the primary source of truth for contact data. On synchronization, local contact modifications are overwritten by HubSpot's data.
*   **Availability**: It is assumed the local MongoDB database is highly available.

## Limitations

*   **In-Memory Background Processing**: Currently, heavy tasks (like initial contact syncing) run asynchronously in the Node event loop. If the server crashes during a sync, the running task is lost (though gracefully recoverable on next boot due to Checkpointing).
*   **Polling-Based Sync**: The system relies on polling (fetching pages of data) rather than real-time webhooks, meaning data might not be instantly synchronized if a contact is updated directly in HubSpot.
*   **Unidirectional Sync**: Contacts sync *from* HubSpot *to* the local database. Only notes sync *to* HubSpot. True bidirectional conflict resolution for contacts is not implemented.

## Future improvements

*   **Message Broker Integration**: Implement BullMQ and Redis to handle background synchronization jobs and note retries instead of relying on the Node event loop. The `SyncService` is already architecturally decoupled to support this smoothly.
*   **HubSpot Webhooks**: Replace full polling syncs with real-time webhook subscriptions for immediate local updates when a HubSpot contact is modified.
*   **Bi-directional Conflict Resolution**: Implement a Last-Write-Wins (LWW) strategy using timestamps to allow contacts to be safely edited locally and pushed back to HubSpot.
*   **Multi-tenant Support**: Expand the `HubSpotConnection` and `Contact` schemas to support a `tenantId`, isolating data for a multi-user SaaS platform.
