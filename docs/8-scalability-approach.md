# 8. Scalability Approach

Scaling a system to synchronize large volumes of data (e.g., 100,000 contacts per minute) requires a shift from single-process event loop handling to a distributed, horizontally scalable architecture.

This document outlines what is currently implemented to handle moderate loads and what structural additions are required to achieve enterprise-scale throughput.

## Currently Implemented

The current architecture establishes a foundational pattern for scalability without introducing complex infrastructure dependencies (like Redis) right away.

1.  **Idempotent Operations**: The use of MongoDB `bulkWrite` with `upsert: true` ensures that database writes are efficient (batching multiple operations into a single network round-trip) and perfectly idempotent. Processing the same record 10 times results in the same database state.
2.  **Stateless API**: The Express API server holds no session state in memory (relying on JWT and the database). This allows the API to be horizontally scaled behind a load balancer immediately.
3.  **Pagination & Checkpointing**: The synchronization process fetches data in pages (limiting memory consumption) and saves a `nextPageCursor` to the database. This allows the system to process massive datasets in small, manageable chunks over time.
4.  **Local-First Notes**: By saving notes locally first and syncing asynchronously, the system prevents the UI from becoming blocked during traffic spikes or HubSpot API latency.

## Production Scaling Recommendations (To support 100k contacts/min)

To handle massive volume, the architecture must transition the heavy lifting out of the API servers and into dedicated worker pools.

### 1. Queue-Based Processing (BullMQ/RabbitMQ)
Instead of invoking `syncService.runInitialSync` asynchronously on the API server, the system should push a message to a durable message broker.
*   **Decoupling**: API servers respond instantly; workers consume the queue at their own pace.
*   **Backpressure**: The queue naturally handles traffic spikes by storing jobs until workers are free.

### 2. Background Workers & Horizontal Scaling
Dedicated Node.js (or Go/Rust) worker processes will listen to the queue.
*   **Horizontal Scaling**: If 100k contacts/min are queued, you can spin up 50 worker containers simultaneously to process the queue in parallel.

### 3. Parallel Processing & Sharding
Currently, a single user's sync operates sequentially. 
*   **Chunking**: To speed up a single massive sync, the worker could fetch the total count of contacts, divide the dataset by `id` or `date` ranges, and push 10 separate "Sync Chunk" jobs to the queue. This allows 10 workers to fetch from HubSpot and write to MongoDB for the same user in parallel.

### 4. Rate Limiting and Backoff strategies
At 100k records/min, the system will hit HubSpot's API Rate Limits (e.g., 150 requests per 10 seconds).
*   **Smart Queues**: The message broker must enforce rate limits on outgoing requests. If a `429 Too Many Requests` is received, the worker should apply Exponential Backoff before retrying.

### 5. Efficient Database Writes (Batching)
While `bulkWrite` is implemented, at high scale, the worker should accumulate records in memory (e.g., up to 1000) and execute a single massive `bulkWrite` rather than writing smaller pages of 100.

### 6. Monitoring and Observability
At this scale, `console.log` is insufficient. 
*   Implement Application Performance Monitoring (APM) like Datadog or New Relic.
*   Monitor Queue Depth (to know when to auto-scale workers).
*   Monitor Database I/O to ensure MongoDB isn't becoming a bottleneck.
