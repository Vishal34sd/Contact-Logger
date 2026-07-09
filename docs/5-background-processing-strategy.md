# 5. Background Processing Strategy

Heavy operations, such as syncing 10,000+ contacts, cannot be handled synchronously within a standard HTTP request cycle without causing timeouts.

## Current In-Memory Approach

Currently, background processing is handled via asynchronous execution in the Node.js event loop:
1.  The HTTP request triggers a service method (e.g., `syncService.startContactSync()`) but does **not** `await` it.
2.  The API immediately responds with a `200 OK` (e.g., "HubSpot connected, sync started").
3.  The sync method continues running in the background.

## Architectural Decoupling

The `SyncService` is deliberately decoupled from the HTTP Request/Response context. It operates solely on `connectionId`. 

This design means the current "in-memory" background execution can be seamlessly replaced by an enterprise Message Broker (like BullMQ or RabbitMQ) in the future. A worker process could simply pull a job off a Redis queue and call `syncService.startContactSync(job.data.connectionId)` without needing to rewrite any of the core synchronization logic.

## State Management

Because processes run in the background, their state must be observable:
*   **SyncLog**: Tracks the start time, end time, and total records processed.
*   **SyncCheckpoint**: Indicates if a sync is currently `running` or `error`. This prevents concurrent sync loops for the same connection from clashing.
