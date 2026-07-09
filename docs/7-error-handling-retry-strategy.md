# 7. Error Handling & Retry Strategy

Robust error handling is critical when integrating with rate-limited, external APIs like HubSpot.

## Global Error Handling

The Express application uses a centralized error-handling middleware (`errorHandler.js`).
*   **Operational Errors**: Handled using a custom `AppError` class that specifies HTTP status codes and user-friendly messages.
*   **Catch-All**: Unhandled exceptions are caught by the middleware, logged via Winston, and a generic `500 Internal Server Error` is returned to prevent leaking stack traces to the client.
*   **Async Wrapper**: An `asyncHandler` utility wraps all controller functions to automatically forward rejected promises to the global error middleware, eliminating the need for repetitive `try/catch` blocks in controllers.

## OAuth and HubSpot API Failures

The system anticipates and mitigates common API issues:

### 1. Token Expiration (`401 Unauthorized`)
As detailed in the OAuth Implementation, the Axios client uses interceptors to catch `401` errors, transparently refresh the OAuth token, and retry the request without failing the operation.

### 2. Network Timeouts
All outbound HTTP requests to HubSpot are configured with explicit timeouts. If a timeout occurs, it is caught and logged. 

### 3. Rate Limiting (`429 Too Many Requests`)
While not explicitly handled with a backoff algorithm in the current codebase, the `axios` client is structured to allow easy integration of libraries like `axios-retry` to handle `429` responses with an exponential backoff.

## Retry Strategy for Operations

### Contact Synchronization
Because the `SyncService` uses the `SyncCheckpoint` collection, a failure in the middle of a massive sync is inherently recoverable. When the sync is re-triggered (manually or via a cron job), it reads the last successful cursor from the database and resumes fetching from HubSpot.

### Notes Synchronization
Notes creation utilizes a "Store and Forward" retry pattern:
1.  Notes are saved locally first as `pending`.
2.  If the HubSpot API fails, the note is marked as `failed`.
3.  A dedicated API endpoint (`/api/notes/retry-failed`) exists to find all `failed` notes and re-attempt the HTTP request. This can be manually invoked by the user or hooked up to a scheduled cron job.

## Logging Approach

The application uses `winston` for structured logging.
*   **Levels**: Employs varying log levels (`error`, `warn`, `info`, `debug`).
*   **Formats**: Logs include timestamps and contextual metadata (like `connectionId` or `error.stack`).
*   **Transports**: Logs are output to the console for development and can easily be configured to write to files or external aggregation services (like Datadog/Splunk) in production.
