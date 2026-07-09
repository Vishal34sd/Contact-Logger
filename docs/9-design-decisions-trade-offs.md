# 9. Design Decisions & Trade-offs

This document outlines the rationale behind the technical choices and architectural decisions made for the Contact Logger.

## Technology Stack

*   **Backend Framework (Express.js)**: Chosen for its lightweight nature, massive ecosystem, and flexibility. While frameworks like NestJS offer stricter architectural enforcement, Express allows for rapid development of a custom, streamlined architecture perfectly suited for integrating middleware and third-party APIs like HubSpot.
*   **Database (MongoDB / Mongoose)**: HubSpot contacts often possess highly dynamic and nested custom properties. A NoSQL document database like MongoDB naturally maps to JSON payloads from APIs. Mongoose provides necessary schema validation at the application layer while maintaining flexibility.
*   **Frontend (React + Vite)**: React is the industry standard for component-driven UIs. Vite was chosen over Create React App or Webpack for its vastly superior development server startup time and Hot Module Replacement (HMR).

## Architectural Choices

### Authentication Approach
*   **JWT for Client Auth**: JSON Web Tokens were selected for stateless client-server authentication. This allows the API to scale horizontally without sticky sessions.
*   **OAuth for HubSpot**: Implementing the standard OAuth 2.0 flow is required by HubSpot for public apps. Encrypting the tokens at rest (AES-256) ensures that a database compromise does not lead to a breach of user HubSpot accounts.

### Synchronization Strategy
*   **Checkpointing over Cron**: Instead of relying solely on a timed Cron job to fetch "recent" contacts, the system utilizes HubSpot's native pagination cursors (`SyncCheckpoint`). This guarantees that no records are missed if the server is offline during a scheduled sync window.
*   **Local-First Writes**: Notes are written to the local database before being synced to HubSpot. This "Store and Forward" pattern guarantees low latency for the end-user. The trade-off is eventual consistency, meaning the data on HubSpot might be slightly delayed compared to the local UI.

### API Design and Validation
*   **Zod**: Used heavily for validating incoming requests. Zod provides TypeScript-like type safety and highly readable validation schemas, preventing malformed data from ever reaching the service layer.

### Folder Structure
The backend utilizes a Domain-Driven, Layered Architecture:
*   `controllers/`: Handle HTTP req/res mapping.
*   `services/`: Contain the core business logic.
*   `repositories/`: Isolate database queries (Mongoose) from the business logic.
*   `libs/`: Wrap third-party SDKs or API clients (e.g., `hubspotClient.js`).

This separation of concerns makes the codebase highly testable. You can mock a repository to unit test a service without hitting a real database.

## Trade-offs and Future Improvements

1.  **In-Memory Background Processing vs. Message Broker**
    *   *Trade-off*: To minimize infrastructure dependencies for this initial implementation, background tasks run asynchronously in the Node event loop. If the server crashes, running tasks are dropped.
    *   *Improvement*: Integrate BullMQ and Redis. The architecture is already decoupled enough that `SyncService` methods can be dropped into a queue worker with minimal friction.
2.  **Polling vs. Webhooks**
    *   *Trade-off*: Currently, the system must actively poll or fetch data from HubSpot to detect changes.
    *   *Improvement*: Implement HubSpot Webhooks. HubSpot can push an event to an endpoint when a contact is modified, drastically reducing API calls and improving data freshness.
3.  **Conflict Resolution**
    *   *Trade-off*: The current `upsert` strategy assumes HubSpot is always the source of truth, indiscriminately overwriting local data on sync.
    *   *Improvement*: Implement a Last-Write-Wins (LWW) conflict resolution strategy using `lastModifiedAt` timestamps to support true bi-directional synchronization.
