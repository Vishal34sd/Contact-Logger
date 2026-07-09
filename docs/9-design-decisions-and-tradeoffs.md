# 9. Design Decisions and Tradeoffs

Every architectural choice involves tradeoffs. Below are the key decisions made during the development of the Contact Logger.

## 1. Relational vs. NoSQL (MongoDB)
*   **Decision**: MongoDB (NoSQL) was chosen over a relational database like PostgreSQL.
*   **Tradeoff**: 
    *   *Pros*: Flexible schema design allows easy adaptation to HubSpot's dynamic custom properties in the future. Faster iteration speed.
    *   *Cons*: Lacks built-in referential integrity (foreign key cascades). We must manually handle the deletion of associated notes if a contact is deleted.

## 2. Monorepo vs. Multi-repo
*   **Decision**: A single repository containing both `client` and `server` directories.
*   **Tradeoff**:
    *   *Pros*: Easier to review, single source of truth for the project, simplified local setup.
    *   *Cons*: Deployments require careful configuration (e.g., pointing Vercel to `client/` and Render to `server/`).

## 3. In-Memory Background Sync vs. Message Queue
*   **Decision**: Background syncing is currently handled via asynchronous Node.js execution rather than a dedicated message broker like RabbitMQ or BullMQ (Redis).
*   **Tradeoff**:
    *   *Pros*: Drastically simplifies deployment and local development (no Redis required). Satisfies immediate requirements.
    *   *Cons*: Susceptible to data loss if the Node process crashes mid-sync. Addressed partially via the `SyncCheckpoint` mechanism, but a true queue is much more resilient.

## 4. Single-Tenant Architecture
*   **Decision**: The current database schema stores one active connection globally.
*   **Tradeoff**:
    *   *Pros*: Faster MVP delivery, simpler database queries.
    *   *Cons*: Not ready for SaaS. To support multiple users connecting their own HubSpot accounts, the schema needs a `tenantId` field on Connections, Contacts, and Notes to isolate data properly.

## 5. Unidirectional Contacts vs. Bidirectional
*   **Decision**: Contacts sync one-way (HubSpot → Local). Notes sync one-way (Local → HubSpot).
*   **Tradeoff**:
    *   *Pros*: Avoids complex conflict resolution logic (e.g., Last-Write-Wins, vector clocks).
    *   *Cons*: Users cannot edit a contact's email or name locally and have it reflect in HubSpot.
