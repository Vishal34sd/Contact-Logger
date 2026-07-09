# 6. Background Processing Strategy

## Current Implementation

In the current scope of the project, background processing is handled using Node.js's built-in asynchronous event loop.

When a long-running task is required—such as synchronizing thousands of contacts or pushing a note to the HubSpot API—the backend executes the service function without using the `await` keyword in the controller.

**Example (Auth Controller):**
```javascript
// Await the crucial OAuth exchange to respond to the client
const connection = await authService.handleOAuthCallback(code);

// Trigger sync asynchronously in the background
syncService.runInitialSync(connection._id).catch(err => {
    logger.error('Background sync failed', err);
});

// Immediately redirect the user
res.redirect(process.env.CLIENT_URL + '/dashboard');
```

This approach allows the API to remain highly responsive and avoids HTTP timeouts for operations that take minutes to complete. The `SyncCheckpoint` mechanism ensures that if the Node server restarts while these asynchronous loops are running, the progress is saved and can be resumed.

## Production Integration (Queues & Workers)

While relying on unhandled promises is sufficient for a minimum viable product or a low-traffic environment, it is not robust enough for a true production system (e.g., memory leaks if a process hangs, lack of process isolation, and loss of state on crash if the checkpoint wasn't saved in time).

The current architecture is intentionally designed to allow **Message Queues** (like BullMQ + Redis) to be introduced with minimal code changes.

### How queues would be introduced:

1.  **Infrastructure**: Deploy a Redis instance to act as the message broker.
2.  **Queue Creation**: Create a `SyncQueue` and a `NotesQueue`.
3.  **Controller Update**: Instead of invoking `syncService.runInitialSync()`, the controller will simply add a job to the queue:
    ```javascript
    await syncQueue.add('contact-sync', { connectionId: connection._id });
    ```
4.  **Worker Processes**: A separate Node.js worker process (or multiple processes) will listen to the queue and execute the `SyncService` logic. 

**Why the architecture supports this smoothly:**
Because the `SyncService` and `NoteService` encapsulate their logic cleanly and do not rely on Express `req`/`res` objects, their methods can be directly imported and executed by a queue worker without requiring any refactoring of the business logic.
