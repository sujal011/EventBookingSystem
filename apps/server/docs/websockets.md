# WebSocket API Documentation

## Overview

The Event Booking System provides real-time WebSocket connections for live updates on seat availability and booking changes. This enables clients to receive instant notifications when bookings are created or cancelled, ensuring users always see the most current seat availability.

## Architecture

### WebSocket Manager
The `WebSocketManager` class handles all WebSocket connections, client management, and message broadcasting. It maintains:
- Active client connections with user authentication
- Event-specific subscriptions for targeted updates
- Message broadcasting to subscribed clients

### Authentication
All WebSocket connections require JWT authentication via query parameter. The same JWT tokens used for HTTP API authentication are used for WebSocket connections.

## Endpoints

### 1. General WebSocket Connection
```
ws://localhost:3000/ws?token=<jwt_token>
```

**Purpose**: General WebSocket connection that allows subscribing to multiple events dynamically.

**Authentication**: JWT token required as query parameter.

**Connection Flow**:
1. Client connects with valid JWT token
2. Server authenticates and generates unique client ID
3. Server sends connection confirmation
4. Client can subscribe/unsubscribe to events via messages

### 2. Event-Specific WebSocket Connection
```
ws://localhost:3000/ws/events/{eventId}?token=<jwt_token>
```

**Purpose**: Direct connection to a specific event for immediate subscription.

**Parameters**:
- `eventId` (path): The ID of the event to subscribe to
- `token` (query): JWT authentication token

**Connection Flow**:
1. Client connects with valid JWT token and event ID
2. Server authenticates and automatically subscribes client to the specified event
3. Server sends connection confirmation with event subscription

## Message Types

### Client to Server Messages

#### 1. Subscribe to Event
```json
{
  "type": "subscribe_event",
  "eventId": 123
}
```

#### 2. Unsubscribe from Event
```json
{
  "type": "unsubscribe_event",
  "eventId": 123
}
```

#### 3. Ping (Keep-Alive)
```json
{
  "type": "ping"
}
```

#### 4. Get Connection Statistics
```json
{
  "type": "get_stats"
}
```

### Server to Client Messages

#### 1. Connection Established
```json
{
  "type": "connection_established",
  "clientId": "ws_1699123456789_abc123",
  "eventId": 123,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 2. Subscription Confirmed
```json
{
  "type": "subscribed",
  "eventId": 123,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 3. Unsubscription Confirmed
```json
{
  "type": "unsubscribed",
  "eventId": 123,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 4. Seat Availability Update
```json
{
  "type": "seat_update",
  "eventId": 123,
  "availableSeats": 45,
  "seatCapacity": 100,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 5. Booking Created
```json
{
  "type": "booking_created",
  "eventId": 123,
  "availableSeats": 44,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```
**Note**: For privacy and security, `bookingId` and `userId` are NOT broadcast to all clients.

#### 6. Booking Cancelled
```json
{
  "type": "booking_cancelled",
  "eventId": 123,
  "availableSeats": 45,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```
**Note**: For privacy and security, `bookingId` and `userId` are NOT broadcast to all clients.

#### 7. Pong Response
```json
{
  "type": "pong",
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 8. Connection Statistics
```json
{
  "type": "stats",
  "data": {
    "totalClients": 15,
    "eventSubscriptions": 8
  },
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

#### 9. Error Messages
```json
{
  "type": "error",
  "message": "Invalid message format",
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

## Client Implementation Examples

### JavaScript/TypeScript Client

```javascript
class EventBookingWebSocket {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
    this.ws = null;
  }

  // Connect to general WebSocket
  connect() {
    this.ws = new WebSocket(`${this.baseUrl}/ws?token=${this.token}`);
    this.setupEventHandlers();
  }

  // Connect directly to specific event
  connectToEvent(eventId) {
    this.ws = new WebSocket(`${this.baseUrl}/ws/events/${eventId}?token=${this.token}`);
    this.setupEventHandlers();
  }

  setupEventHandlers() {
    this.ws.onopen = () => {
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      this.handleMessage(message);
    };

    this.ws.onclose = () => {
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  handleMessage(message) {
    switch (message.type) {
      case 'connection_established':
        console.log('Connected with client ID:', message.clientId);
        break;
      
      case 'seat_update':
        this.onSeatUpdate(message);
        break;
      
      case 'booking_created':
        this.onBookingCreated(message);
        break;
      
      case 'booking_cancelled':
        this.onBookingCancelled(message);
        break;
      
      default:
        console.log('Received message:', message);
    }
  }

  subscribeToEvent(eventId) {
    this.send({
      type: 'subscribe_event',
      eventId: eventId
    });
  }

  unsubscribeFromEvent(eventId) {
    this.send({
      type: 'unsubscribe_event',
      eventId: eventId
    });
  }

  ping() {
    this.send({ type: 'ping' });
  }

  send(message) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  // Event handlers (override these in your implementation)
  onSeatUpdate(message) {
    console.log(`Event ${message.eventId}: ${message.availableSeats}/${message.seatCapacity} seats available`);
  }

  onBookingCreated(message) {
    console.log(`New booking created: ${message.bookingId} for event ${message.eventId}`);
  }

  onBookingCancelled(message) {
    console.log(`Booking cancelled: ${message.bookingId} for event ${message.eventId}`);
  }
}

// Usage
const wsClient = new EventBookingWebSocket('ws://localhost:3000', 'your-jwt-token');
wsClient.connect();
wsClient.subscribeToEvent(123);
```

### React Hook Example

```javascript
import { useEffect, useRef, useState } from 'react';

export function useEventWebSocket(eventId, token) {
  const [isConnected, setIsConnected] = useState(false);
  const [seatData, setSeatData] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    if (!token || !eventId) return;

    // Connect to event-specific WebSocket
    ws.current = new WebSocket(`ws://localhost:3000/ws/events/${eventId}?token=${token}`);

    ws.current.onopen = () => {
      setIsConnected(true);
    };

    ws.current.onmessage = (event) => {
      const message = JSON.parse(event.data);
      
      if (message.type === 'seat_update' || 
          message.type === 'booking_created' || 
          message.type === 'booking_cancelled') {
        setSeatData({
          availableSeats: message.availableSeats,
          seatCapacity: message.seatCapacity || seatData?.seatCapacity
        });
        setLastUpdate(new Date(message.timestamp));
      }
    };

    ws.current.onclose = () => {
      setIsConnected(false);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [eventId, token]);

  return {
    isConnected,
    seatData,
    lastUpdate
  };
}
```

## Error Handling

### Connection Errors
- **1008 - Authentication Required**: No token provided
- **1008 - Invalid Token**: JWT token is invalid or expired

### Message Errors
- Invalid JSON format in client messages
- Unknown message types
- Missing required fields

## Security Considerations

1. **Authentication**: All connections require valid JWT tokens
2. **Authorization**: Users can only receive updates for events they have access to
3. **Rate Limiting**: Consider implementing connection limits per user
4. **Token Validation**: Tokens are validated on connection and can be revoked

## Performance Notes

1. **Connection Management**: Automatic cleanup of disconnected clients
2. **Memory Usage**: Efficient client tracking with Map data structures
3. **Broadcasting**: Targeted message delivery to subscribed clients only
4. **Scalability**: Current implementation is single-server; consider Redis for multi-server deployments

## Integration with Booking System

The WebSocket system is integrated with the booking service to automatically broadcast updates when:

1. **Booking Created**: Triggers `booking_created` and `seat_update` messages
2. **Booking Cancelled**: Triggers `booking_cancelled` and `seat_update` messages
3. **Seat Changes**: Any direct seat availability changes trigger `seat_update` messages

## Testing

### Manual Testing with wscat
```bash
# Install wscat
npm install -g wscat

# Connect to general WebSocket
wscat -c "ws://localhost:3000/ws?token=your-jwt-token"

# Connect to specific event
wscat -c "ws://localhost:3000/ws/events/123?token=your-jwt-token"

# Send subscription message
{"type": "subscribe_event", "eventId": 123}

# Send ping
{"type": "ping"}
```

### Browser Testing
```javascript
// Open browser console and run:
const ws = new WebSocket('ws://localhost:3000/ws?token=your-jwt-token');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
ws.send(JSON.stringify({type: 'subscribe_event', eventId: 123}));
```

## Troubleshooting

### Common Issues

1. **Connection Refused**: Ensure server is running and WebSocket is properly exported
2. **Authentication Failures**: Verify JWT token is valid and not expired
3. **No Messages Received**: Check event subscription and ensure booking operations are triggering updates
4. **Memory Leaks**: Ensure proper client cleanup on disconnection

### Debug Logging
The WebSocket manager includes console logging for:
- Client connections/disconnections
- Event subscriptions/unsubscriptions
- Message broadcasting statistics
- Authentication failures