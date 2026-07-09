# Contact Logger

A production-grade, full-stack application that integrates with HubSpot via OAuth to automatically synchronize contacts and manage contact notes. Built with React (Vite) for the frontend and Node.js/Express for the backend.

## Features

### Frontend (Client)
*   **Modern UI**: Built with React 19 and Tailwind CSS for a responsive, clean interface.
*   **Form Management & Validation**: Uses React Hook Form with Zod for robust client-side validation.
*   **Routing**: React Router DOM for seamless single-page navigation.
*   **API Communication**: Axios with central interceptors for error handling and toast notifications.
*   **Icons & Notifications**: Lucide React for iconography and React Toastify for user feedback.

### Backend (Server)
*   **HubSpot OAuth 2.0**: Implements the latest `2026-03` token endpoints.
*   **Automatic Resumable Sync**: Fetches contacts securely with pagination and checkpointing. If the sync crashes, it resumes from the last cursor.
*   **Contact Notes**: Create notes locally and sync them to HubSpot asynchronously. Includes a retry mechanism for failed syncs.
*   **Clean Architecture**: Separation of concerns across Controllers, Services, Repositories, and Models.
*   **Production Ready**: Includes centralized error handling, Zod validation, rate limiting, Winston structured logging, NoSQL injection prevention, and token encryption.

## Tech Stack & Libraries Used

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
*   **Security & Middleware**: `cors`, `cookie-parser`, `compression`, `express-rate-limit`, `express-mongo-sanitize`, `jsonwebtoken`
*   **Validation**: `zod`
*   **Logging**: `winston`, `morgan`
*   **Utilities**: `uuid`, `dotenv`


## Getting Started

### Prerequisites

*   Node.js v18+
*   MongoDB Instance
*   HubSpot Developer Account & Public App

### 1. Installation

Install dependencies for both the client and server:

```bash
# Install Server dependencies
cd server
npm install

# Install Client dependencies
cd ../client
npm install
```

### 2. Configuration & Environment Variables

The frontend relies on Vite's proxy to communicate with the backend, so it does not require a `.env` file by default (it proxies `/api` to `http://localhost:5000`).

For the backend, copy the example environment file and configure it:

```bash
cd server
cp .env.example .env
```

**Required Environment Variables (`server/.env`):**
*   `PORT`: The port the server runs on (default: `5000`).
*   `NODE_ENV`: The environment (default: `development`).
*   `MONGODB_URI`: Your MongoDB connection string (e.g., `mongodb://localhost:27017/contact-logger`).
*   `JWT_SECRET`: A secure string for JSON Web Token signing.
*   `JWT_EXPIRES_IN`: Expiration time for JWT (e.g., `7d`).
*   `CLIENT_URL`: URL of the frontend app (e.g., `http://localhost:5173`).
*   `HUBSPOT_CLIENT_ID`: Your HubSpot Public App Client ID.
*   `HUBSPOT_CLIENT_SECRET`: Your HubSpot Public App Client Secret.
*   `HUBSPOT_REDIRECT_URI`: Your HubSpot Redirect URI (e.g., `http://localhost:5000/api/auth/hubspot/callback`).
*   `ENCRYPTION_KEY`: A 64-character hex string used to encrypt OAuth tokens at rest. Generate one using: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

### 3. Running the Application

You need to run both the frontend and backend servers.

**Run the Backend:**
```bash
cd server
npm run dev # or npm start for production
```

**Run the Frontend:**
```bash
cd client
npm run dev
```

The frontend will be available at `http://localhost:5173` and the backend API at `http://localhost:5000/api`.

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
