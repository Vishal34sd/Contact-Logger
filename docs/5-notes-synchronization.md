# 5. Notes Synchronization

Contact notes operate on a "Local First" approach, prioritizing immediate UI feedback while handling the network synchronization asynchronously.

## Notes Creation Flow

1.  **Local Save**: When a user submits a note via the API, the backend immediately saves the note to the MongoDB `ContactNote` collection with a `syncStatus` of `pending`.
2.  **Immediate Response**: The API responds with `201 Created` instantly, ensuring the frontend feels incredibly fast and responsive.
3.  **Asynchronous Sync**: Behind the scenes (without `await`), the backend initiates an API call to the HubSpot Engagements API to create the note on the corresponding remote contact.

## Synchronization Back to HubSpot

*   **Success**: If the HubSpot API call succeeds, the local note is updated: `syncStatus` becomes `synced`, and the resulting `hubspotEngagementId` is stored.
*   **Failure**: If the API call fails (e.g., network timeout, HubSpot outage):
    *   The note's `syncStatus` changes to `failed`.
    *   The `retryCount` is incremented.
    *   The error message is saved in `lastError` for debugging.

## Failure Recovery and Data Consistency

To maintain data consistency when external systems fail, the system implements a manual retry mechanism. 
*   **Retry Endpoint**: The `/api/notes/retry-failed` endpoint queries the database for all notes where `syncStatus` is `failed` and attempts to push them to HubSpot again.
*   **Permanent Failure**: If an error is unrecoverable (e.g., the contact was deleted on HubSpot), the note can be marked as `perm_failed` to prevent infinite, useless retry loops.

## Data Consistency Approach

By decoupling the local write from the remote network request, the system ensures that user data is never lost, even if HubSpot is temporarily unavailable. The local database acts as the source of truth for pending outbound mutations.
