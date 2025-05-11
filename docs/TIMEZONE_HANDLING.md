# Timezone Handling in RoutineMate

This document describes the approach used to handle different timezones in the RoutineMate application.

## Overview

RoutineMate supports users from different geographical locations and timezones by:

1. Capturing the client's timezone information on the frontend
2. Sending timezone details with every API request
3. Using timezone-aware SQL operations for date/time handling
4. Properly formatting dates for display on the client

## Implementation Details

### Frontend

The frontend captures the user's timezone information and includes it in all API requests:

```javascript
// In api.js interceptor
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/New_York"
const offsetInMinutes = new Date().getTimezoneOffset() * -1;

config.headers['x-timezone'] = timezone;
config.headers['x-timezone-offset'] = offsetInMinutes.toString();
```

### Backend Middleware

A middleware captures timezone information from request headers:

```javascript
// timezoneMiddleware.js
const timezone = req.headers['x-timezone'] || 'UTC';
const timezoneOffset = parseInt(req.headers['x-timezone-offset'] || '0');

req.clientTimezone = {
  name: timezone,
  offset: timezoneOffset
};
```

### Database Operations

Timestamped operations in PostgreSQL use timezone-adjusted expressions:

```sql
-- Instead of NOW()
NOW() AT TIME ZONE 'UTC' AT TIME ZONE 'America/New_York'

-- Instead of CURRENT_TIMESTAMP
CURRENT_TIMESTAMP AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Karachi'

-- Instead of CURRENT_DATE
CURRENT_DATE AT TIME ZONE 'UTC' AT TIME ZONE 'Europe/London'
```

### Utility Functions

Centralized utility functions simplify timezone handling:

```javascript
// For SQL timestamp expressions
const { now, today, timestamp } = getClientAdjustedTime(req.clientTimezone?.name);

// For parsing client-provided dates
const formattedDate = parseClientDate(dateStr);
```

## Key Files

- `Backend/utils/timeUtils.js` - Utility functions for timezone handling
- `Backend/middleware/timezoneMiddleware.js` - Express middleware for timezone capture
- `Frontend/src/utils/api.js` - API client with timezone interceptors

## Dashboard Weekly Activity Chart

The weekly activity chart shows completed routines, tasks, and habits over the past 7 days. Timezone handling ensures that users see their data correctly regardless of where they are located:

1. The dashboard controller uses the client's timezone to calculate the correct 7-day range
2. Database queries for tasks and routines are adjusted using `adjustColumn` to convert stored UTC timestamps to the client's local timezone
3. This ensures that activity appears on the correct day in the chart, even if completed near midnight

For example, if a user in New York completes a task at 11:30 PM their time, and a user in Tokyo views this activity, it will appear on the correct day for both users - the day it was completed in New York.

```javascript
// Example of timezone-aware query in the weekly activity chart
const query = `
  SELECT 
    DATE(${adjustColumn('updated_at')}) AS day,
    COUNT(*) AS count
  FROM tasks
  WHERE user_id = $1
    AND status = 'completed'
    AND updated_at >= ($2::date - INTERVAL '1 day')::timestamp
    AND updated_at <= ($3::date + INTERVAL '1 day')::timestamp
  GROUP BY day
`;
```

## Common Timezone Scenarios

### 1. Timestamp Creation

When creating records with timestamps:

```javascript
// Using timestamp from utility function
const { timestamp } = getClientAdjustedTime(req.clientTimezone?.name);

await db.query(
  `UPDATE tasks 
   SET status = 'completed', updated_at = ${timestamp}
   WHERE task_id = $1`,
  [taskId]
);
```

### 2. Date Comparisons

When comparing dates for streaks or daily tasks:

```javascript
// Using today from utility function
const { today } = getClientAdjustedTime(req.clientTimezone?.name);

const query = `
  SELECT * FROM tasks 
  WHERE due_date = ${today}
  AND user_id = $1
`;
```

### 3. Client Date Input

When accepting dates from client:

```javascript
// Parse client-provided date
const formattedDate = parseClientDate(req.body.dueDate);

// Use in query
await db.query(
  'INSERT INTO tasks (title, due_date) VALUES ($1, $2)',
  [title, formattedDate]
);
```

## Best Practices

1. Always use the utility functions for timezone operations
2. Never use raw `NOW()` or `CURRENT_TIMESTAMP` without timezone adjustment
3. Format dates on the server before sending to the client
4. Use ISO format (YYYY-MM-DD) for date storage where possible
5. Include timezone debugging information in development logs

## Troubleshooting

If dates appear incorrect:

1. Check request headers contain correct timezone information
2. Verify database timestamps are being created with proper timezone adjustments
3. Ensure dates are being parsed correctly between client and server
4. For streak calculations, confirm timezone adjusted dates are being used

## Resources

- [PostgreSQL Timezone Documentation](https://www.postgresql.org/docs/current/datatype-datetime.html#DATATYPE-TIMEZONES)
- [JavaScript Date Internationalization](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) 