# Analytics API Documentation

## Overview
The Analytics API provides real-time dashboard statistics for admin users, including event metrics, booking trends, and performance data.

## Endpoint

### GET `/api/analytics/dashboard-stats`

**Authentication:** Required (Admin only)

**Headers:**
```
Authorization: Bearer <admin_jwt_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalEvents": {
        "value": 12,
        "change": "+2 this month"
      },
      "totalBookings": {
        "value": 248,
        "change": "+18% from last month"
      },
      "attendanceRate": {
        "value": "94%",
        "change": "+5% from last month"
      }
    },
    "popularEvents": [
      {
        "name": "AI & Machine Learning Summit",
        "bookings": 45,
        "capacity": 50,
        "date": "2024-03-25",
        "fillPercentage": 90
      }
    ],
    "recentEvents": [
      {
        "name": "Digital Marketing Bootcamp",
        "bookings": 38,
        "capacity": 40,
        "date": "2024-03-28",
        "fillPercentage": 95
      }
    ]
  }
}
```

## Metrics Explained

### Total Events
- **Value:** Total number of events in the database
- **Change:** Number of events created in the current month

### Total Bookings
- **Value:** Total number of confirmed bookings
- **Change:** Percentage change compared to last month

### Attendance Rate
- **Value:** Overall attendance rate for past events (confirmed bookings / total capacity)
- **Change:** Percentage point difference from last month

### Popular Events
- Top 5 events by booking count (all time)
- Ordered by number of bookings (descending)

### Recent Events
- Last 5 past events (already occurred)
- Ordered by event date (most recent first)
- Shows actual attendance performance

## Error Responses

### 401 Unauthorized
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Missing or invalid authorization header",
    "timestamp": "2024-12-01T10:00:00.000Z"
  }
}
```

### 403 Forbidden
```json
{
  "error": {
    "code": "FORBIDDEN",
    "message": "Admin access required",
    "timestamp": "2024-12-01T10:00:00.000Z"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to fetch dashboard statistics",
    "timestamp": "2024-12-01T10:00:00.000Z"
  }
}
```
