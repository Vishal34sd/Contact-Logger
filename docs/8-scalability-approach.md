# 8. Scalability Approach

As the user base and the volume of HubSpot contacts grow, the architecture must scale to maintain performance and reliability.

## 1. Database Scalability (MongoDB)
*   **Indexing**: Critical queries use indexes to prevent full collection scans (e.g., searching by `hubspotId`, filtering notes by `contactId`, querying `SyncCheckpoint`).
*   **Bulk Operations**: Upserting thousands of contacts is performed using `bulkWrite`. This groups operations into a single network request, drastically reducing overhead compared to sequential `.save()` calls.
*   **Pagination**: All API responses (Contacts, Notes) are paginated. This limits memory consumption on the server and provides a fast, snappy experience on the client.

## 2. API Scalability (Express)
*   **Statelessness**: The REST API is stateless (auth tokens are managed per request or via encrypted database references). This allows the Node.js backend to be horizontally scaled behind a load balancer without sticky sessions.
*   **Rate Limiting**: `express-rate-limit` prevents abuse and ensures stable performance under high concurrent loads.
*   **Payload Compression**: The `compression` middleware gzips API responses, significantly reducing bandwidth usage and accelerating client load times.

## 3. Worker Scalability (Future)
By decoupling the `SyncService` from the HTTP lifecycle, the architecture is primed for distributed background processing. Moving from in-memory processing to a Message Broker (BullMQ) allows horizontal scaling of standalone worker nodes dedicated exclusively to syncing data.
