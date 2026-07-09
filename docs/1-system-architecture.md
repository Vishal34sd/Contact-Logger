# 1. System Architecture

## High-Level Architecture

The Contact Logger is a full-stack web application designed to integrate securely with HubSpot. It consists of three main tiers:

1.  **Frontend (Client)**: A Single Page Application (SPA) built with React and Vite. It serves as the presentation layer, handling user interactions, form validations (via React Hook Form and Zod), and communicating with the backend via RESTful APIs using Axios.
2.  **Backend (Server)**: A Node.js application built on the Express.js framework. It acts as the intermediary, securely managing OAuth flows, orchestrating business logic, exposing APIs for the frontend, and communicating with external services (HubSpot).
3.  **Database**: A MongoDB database (interfaced via Mongoose) used for persistent storage of synced contacts, notes, synchronization logs, and encrypted OAuth tokens.

## Application Flow

*   **Frontend → Backend**: The frontend communicates with the backend exclusively via standard HTTP/JSON requests. All sensitive operations (like OAuth and token management) are abstracted away from the client.
*   **Backend → Database**: The backend interacts with MongoDB using the Repository pattern. Repositories abstract the Mongoose models, providing a clean API for the service layer to perform CRUD operations.
*   **Backend → HubSpot**: The backend acts as an API client to HubSpot, using Axios. A dedicated HubSpot client library handles injecting authentication tokens, refreshing expired tokens, and structuring API requests.

## Architecture Diagram

```mermaid
flowchart TD
    subgraph Client [Frontend (React + Vite)]
        UI[User Interface]
        API_Service[Axios API Client]
        UI --> API_Service
    end

    subgraph Server [Backend (Node.js + Express)]
        Controllers[API Controllers]
        Services[Business Logic / Services]
        Repositories[Data Access / Repositories]
        HubSpot_Client[HubSpot Axios Client]
        
        Controllers --> Services
        Services --> Repositories
        Services --> HubSpot_Client
    end

    subgraph External [External Systems]
        DB[(MongoDB)]
        HubSpot((HubSpot API))
    end

    API_Service -- HTTP REST --> Controllers
    Repositories -- Mongoose --> DB
    HubSpot_Client -- HTTPS / OAuth --> HubSpot
```
