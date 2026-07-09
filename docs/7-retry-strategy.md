# 7. Retry Strategy

Network unreliability and API rate limits mandate a strong retry strategy, particularly for pushing data to external services like HubSpot.

## Axios Interceptor Retries (Automatic)

For transient issues (like expired tokens causing a `401`), the `hubspotClient` uses Axios interceptors to perform an immediate, automatic retry.
1. Request fails with 401.
2. Request is added to a `failedQueue`.
3. Token is refreshed.
4. `failedQueue` is flushed, and the original request is retried seamlessly.

## Notes Push Retries (Scheduled/Manual)

When a local note fails to push to HubSpot (e.g., due to a 500 server error on HubSpot's side, or a network timeout), it requires a deferred retry strategy.

1.  **Failure State**: The note is marked `syncStatus: 'failed'` in MongoDB.
2.  **Retry Count**: A `retryCount` field is incremented.
3.  **Triggering Retries**: 
    *   Currently, the system exposes a manual endpoint (`POST /api/notes/retry-failed`) to re-attempt syncing.
    *   In a production queue system, this would be handled via Exponential Backoff (e.g., retrying after 1 min, 5 mins, 15 mins).
4.  **Permanent Failure**: If the error is fatal (e.g., 400 Bad Request due to invalid data, or 403 Forbidden), or if `retryCount` exceeds a threshold (e.g., 3), the status is set to `perm_failed` to prevent infinite retries.
