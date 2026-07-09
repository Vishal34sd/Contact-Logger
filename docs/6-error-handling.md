# 6. Error Handling

A robust, centralized error handling strategy ensures the application fails gracefully, provides meaningful feedback, and prevents sensitive stack traces from leaking to the frontend.

## API Error Handling

1.  **Custom Error Classes**: The application uses custom classes extending `Error` (e.g., `BadRequestError`, `UnauthorizedError`, `NotFoundError`). Each class sets its own HTTP status code.
2.  **Async Wrapper**: A higher-order function (`asyncHandler`) wraps all controller methods. This eliminates the need for repetitive `try/catch` blocks. If a promise rejects, the `asyncHandler` automatically passes the error to `next()`.
3.  **Global Error Middleware**: All errors eventually reach `src/middlewares/errorHandler.js`.
    *   In **development**, it returns the error message and the full stack trace.
    *   In **production**, it strips the stack trace and returns standardized, user-friendly JSON messages.
4.  **Mongoose & Zod Errors**: The error middleware specifically intercepts Mongoose validation errors, MongoDB unique constraint errors (code 11000), and Zod schema validation errors, converting them into clean `400 Bad Request` formats.

## HubSpot Integration Errors

*   **Token Expiration**: Intercepted globally by Axios. A 401 triggers an automatic token refresh and request retry.
*   **Rate Limiting**: If HubSpot returns a `429 Too Many Requests`, the Axios interceptor logs the failure. In a more advanced implementation, it would read the `Retry-After` header and delay the queue.
*   **Permissions**: If scopes are missing (403 Forbidden), the sync logs the permanent failure, stopping further retries to prevent endless loops.
