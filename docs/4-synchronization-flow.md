# 4. Synchronization Flow

The application manages two primary types of synchronization with HubSpot: fetching Contacts (HubSpot to Local) and pushing Notes (Local to HubSpot).

## 1. Contact Synchronization (Inbound)

**Goal:** Ensure the local MongoDB database holds an up-to-date, paginated copy of HubSpot contacts without overwhelming memory or API limits.

**Mechanism:**
1.  **Trigger**: Sync is triggered immediately after OAuth callback, or manually via a cron job (future improvement).
2.  **Checkpointing**: The system checks `SyncCheckpoint` for the last known `nextPageCursor`. If a previous sync failed midway, it resumes from this cursor.
3.  **Fetching**: The `hubspotClient` fetches a chunk of contacts (e.g., 100).
4.  **Upserting**: The `ContactRepository` performs a MongoDB `bulkWrite` with `upsert: true` on the `hubspotId`. This ensures existing contacts are updated and new ones are inserted efficiently in a single database roundtrip.
5.  **Iteration**: The checkpoint is updated with the new cursor, and the loop repeats until `paging.next.after` is undefined.

## 2. Notes Synchronization (Outbound)

**Goal:** Allow users to write notes locally immediately and push them to HubSpot asynchronously, handling network errors gracefully.

**Mechanism:**
1.  **Local Creation**: A user creates a note. It is immediately saved to MongoDB with `syncStatus: 'pending'`. The API returns a 201 Success to the frontend instantly.
2.  **Asynchronous Push**: The backend fires an asynchronous event to push the note to HubSpot's Engagements API.
3.  **Success**: If HubSpot accepts the note, the local note is updated to `syncStatus: 'synced'` and the `hubspotEngagementId` is stored.
4.  **Failure**: If the push fails, the status is updated to `failed` and the `lastError` is logged. This sets the stage for the Retry Strategy.
