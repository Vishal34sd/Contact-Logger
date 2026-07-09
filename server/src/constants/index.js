export const SYNC_STATUS = Object.freeze({
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  PARTIAL: 'partial',
});

export const CONNECTION_STATUS = Object.freeze({
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  EXPIRED: 'expired',
  ERROR: 'error',
});

export const NOTE_SYNC_STATUS = Object.freeze({
  PENDING: 'pending',
  SYNCED: 'synced',
  FAILED: 'failed',
});

export const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
});

export const HUBSPOT_CONTACT_PROPERTIES = [
  'firstname',
  'lastname',
  'email',
  'phone',
  'company',
  'jobtitle',
  'lifecyclestage',
  'hs_lead_status',
  'lastmodifieddate',
  'createdate',
];

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
export const HUBSPOT_PAGE_SIZE = 100;
export const MAX_RETRY_COUNT = 3;

export const HUBSPOT_NOTE_TO_CONTACT_TYPE_ID = 202;
