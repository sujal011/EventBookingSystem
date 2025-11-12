# WebSocket Code Walkthrough

## 🗺️ Code Flow Map

Let me walk you through the actual code, line by line.

## 📁 File Structure

```
apps/server/src/
├── index.ts                    # Main server file (WebSocket export)
├── routes/
│   └── websocket.ts           # WebSocket endpoints
├── services/
│   ├── websocket.ts           # WebSocket manager (the brain)
│   ├── booking.ts             # Booking service (triggers updates)
│   └── event.ts               # Event service (triggers updates)
```

## 1️⃣ Main Server Setup (index.ts)

```typescript
// Import WebSocket support from Hono for Bun
import { websocket } from "hono/bun";

// Import WebSocket routes
import wsRoutes from './routes/websocket';

// Add WebSocket routes to app
app.route('/ws', wsRoutes);

// Export for Bun runtime
export default {
  fetch: app.fetch,    // Regular HTTP requests
  websocket,           // WebSocket upgrade handler
};
```

**What this does:**
- Tells Bun: "Hey, this app supports WebSockets!"
- Maps `/ws/*` URLs to WebSocket handlers
- Bun automatically upgrades HTTP connections to WebSocket when needed

## 2️⃣ WebSocket Routes (routes/websocket.ts)

### Connection Handler - The Entry Point

```typescript
import { upgradeWebSocket } from 'hono/bun';

// Event-specific endpoint
wsRoutes.get('/events/:eventId',
  upgradeWebSocket((c) => {
    // Get event ID from URL
    const eventId = parseInt(c.req.param('eventId'));
    
    // Get JWT token from query string
    const token = c.req.query('token');
    
    // Variables to track this connection
    let clientId = null;
    let authenticated = false;

    return {
      // 🔵 When connection opens
      async onOpen(_event, ws) {
        // Step 1: Check if token exists
        if (!token) {
          ws.close(1008, 'Authentication token required');
          return;
        }

        // Step 2: Verify the token
        const auth = await WebSocketManager.authenticateConnection(token);
        if (!auth) {
          ws.close(1008, 'Invalid authentication token');
          return;
        }

        // Step 3: Generate unique ID for this connection
        clientId = WebSocketManager.generateClientId();
        authenticated = true;

        // Step 4: Register this client
        WebSocketManager.addClient(clientId, {
          ws,                    // The WebSocket connection
          userId: auth.userId,   // Who is this user?
          eventId: undefined     // Not subscribed yet
        });

        // Step 5: Subscribe to the event from URL
        if (!isNaN(eventId)) {
          WebSocketManager.subscribeToEvent(clientId, eventId);
        }

        // Step 6: Send welcome message
        ws.send(JSON.stringify({
          type: 'connection_established',
          clientId,
          eventId: !isNaN(eventId) ? eventId : null,
          timestamp: new Date().toISOString()
        }));
      },

      // 🟢 When client sends a message
      onMessage(event, ws) {
        if (!authenticated || !clientId) return;

        try {
          // Parse the JSON message
          const message = JSON.parse(event.data.toString());
          
          // Handle different message types
          switch (message.type) {
            case 'subscribe_event':
              // Client wants to watch a different event
              WebSocketManager.subscribeToEvent(clientId, message.eventId);
              ws.send(JSON.stringify({
                type: 'subscribed',
                eventId: message.eventId,
                timestamp: new Date().toISOString()
              }));
              break;

            case 'ping':
              // Client checking if connection is alive
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;
          }
        } catch (error) {
          // Invalid JSON or other error
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format'
          }));
        }
      },

      // 🔴 When connection closes
      onClose() {
        if (clientId) {
          // Clean up: remove from all tracking
          WebSocketManager.removeClient(clientId);
        }
      },

      // ⚠️ When error occurs
      onError(_event) {
        console.error('WebSocket error for client:', clientId);
        if (clientId) {
          WebSocketManager.removeClient(clientId);
        }
      }
    };
  })
);
```

**What this does:**
- Creates a WebSocket endpoint at `/ws/events/:eventId`
- Authenticates users with JWT
- Manages connection lifecycle (open, message, close, error)
- Subscribes users to specific events

## 3️⃣ WebSocket Manager (services/websocket.ts)

### The Brain - Managing All Connections

```typescript
export class WebSocketManager {
  // 📦 Storage
  private static clients = new Map<string, WebSocketClient>();
  private static eventSubscriptions = new Map<number, Set<string>>();

  // 🆔 Generate Unique Client ID
  static generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // ➕ Add New Client
  static addClient(clientId: string, client: WebSocketClient): void {
    this.clients.set(clientId, client);
    console.log(`WebSocket client connected: ${clientId}`);
  }

  // ➖ Remove Client
  static removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    
    // If subscribed to an event, unsubscribe first
    if (client && client.eventId) {
      this.unsubscribeFromEvent(clientId, client.eventId);
    }
    
    // Remove from clients map
    this.clients.delete(clientId);
    console.log(`WebSocket client disconnected: ${clientId}`);
  }

  // 🔔 Subscribe to Event Updates
  static subscribeToEvent(clientId: string, eventId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Unsubscribe from previous event if any
    if (client.eventId) {
      this.unsubscribeFromEvent(clientId, client.eventId);
    }

    // Update client's event
    client.eventId = eventId;

    // Add to event's subscriber list
    if (!this.eventSubscriptions.has(eventId)) {
      this.eventSubscriptions.set(eventId, new Set());
    }
    this.eventSubscriptions.get(eventId)!.add(clientId);
    
    console.log(`Client ${clientId} subscribed to event ${eventId}`);
  }

  // 📢 Broadcast to All Subscribers of an Event
  static broadcastToEvent(eventId: number, message: WebSocketMessage): void {
    // Get all clients watching this event
    const eventClients = this.eventSubscriptions.get(eventId);
    if (!eventClients) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    // Send to each client
    for (const clientId of eventClients) {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send to ${clientId}`);
          this.removeClient(clientId);
        }
      }
    }

    console.log(`Broadcasted to ${sentCount} clients for event ${eventId}`);
  }

  // 🎫 Broadcast Booking Created
  static broadcastBookingCreated(
    eventId: number, 
    bookingId: string, 
    userId: number, 
    availableSeats: number
  ): void {
    const message = {
      type: 'booking_created',
      eventId,
      bookingId,
      userId,
      availableSeats,
      timestamp: new Date().toISOString()
    };

    this.broadcastToEvent(eventId, message);
  }

  // 🔙 Broadcast Booking Cancelled
  static broadcastBookingCancelled(
    eventId: number, 
    bookingId: string, 
    userId: number, 
    availableSeats: number
  ): void {
    const message = {
      type: 'booking_cancelled',
      eventId,
      bookingId,
      userId,
      availableSeats,
      timestamp: new Date().toISOString()
    };

    this.broadcastToEvent(eventId, message);
  }

  // 🔐 Authenticate JWT Token
  static async authenticateConnection(token: string): Promise<{ userId: number } | null> {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        throw new Error('JWT_SECRET not configured');
      }

      // Verify token using Hono's JWT
      const payload = await verify(token, jwtSecret);
      
      if (payload && typeof payload.sub === 'string') {
        return { userId: parseInt(payload.sub) };
      }
      return null;
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      return null;
    }
  }
}
```

**What this does:**
- Keeps track of all connected clients
- Manages event subscriptions
- Broadcasts messages to the right people
- Handles authentication

**Data Structure Example:**
```javascript
// After 3 users connect to Event #1
clients = {
  "ws_123_abc": { ws: <connection>, userId: 10, eventId: 1 },
  "ws_456_def": { ws: <connection>, userId: 20, eventId: 1 },
  "ws_789_ghi": { ws: <connection>, userId: 30, eventId: 2 }
}

eventSubscriptions = {
  1: Set["ws_123_abc", "ws_456_def"],  // 2 users watching Event 1
  2: Set["ws_789_ghi"]                  // 1 user watching Event 2
}
```

## 4️⃣ Integration with Booking Service (services/booking.ts)

### Triggering Real-Time Updates

```typescript
import { WebSocketManager } from "./websocket";

export class BookingService {
  
  // When creating a booking
  static async createBooking(bookingData, userId) {
    // ... database operations ...
    
    // Create the booking in database
    const booking = await createBookingInDatabase();
    
    // 🔔 BROADCAST TO WEBSOCKET CLIENTS!
    if (booking.event) {
      WebSocketManager.broadcastBookingCreated(
        booking.eventId,           // Which event?
        booking.bookingId,         // Which booking?
        userId,                    // Who booked?
        booking.event.availableSeats  // How many seats left?
      );
    }
    
    return booking;
  }

  // When cancelling a booking
  static async cancelBooking(bookingId, userId, userRole) {
    // ... validation and database operations ...
    
    // Cancel in database
    await cancelBookingInDatabase(bookingId);
    
    // Get updated seat count
    const updatedEvent = await EventService.getEventById(eventId);
    
    // 🔔 BROADCAST TO WEBSOCKET CLIENTS!
    if (updatedEvent) {
      WebSocketManager.broadcastBookingCancelled(
        eventId,
        bookingId,
        userId,
        updatedEvent.availableSeats
      );
    }
  }
}
```

**What this does:**
- After creating/cancelling a booking in the database
- Immediately broadcasts the update to all WebSocket clients
- Clients watching that event get notified instantly

## 🎬 Complete Flow Example

Let's trace what happens when Alice books a ticket:

### Step 1: Bob is Watching Event #1
```
Bob's Browser → WebSocket Connection
    ↓
Server: "Welcome Bob! (clientId: ws_123_abc)"
    ↓
WebSocketManager.clients = {
  "ws_123_abc": { ws: <Bob's connection>, userId: 5, eventId: 1 }
}
WebSocketManager.eventSubscriptions = {
  1: Set["ws_123_abc"]
}
```

### Step 2: Alice Books a Ticket
```
Alice's App → POST /api/bookings
    ↓
BookingService.createBooking()
    ↓
Database: INSERT INTO bookings...
    ↓
Database: UPDATE events SET available_seats = available_seats - 1
    ↓
WebSocketManager.broadcastBookingCreated(1, "BK-123", 10, 49)
    ↓
WebSocketManager finds: eventSubscriptions[1] = ["ws_123_abc"]
    ↓
WebSocketManager sends to ws_123_abc:
{
  "type": "booking_created",
  "eventId": 1,
  "bookingId": "BK-123",
  "availableSeats": 49
}
    ↓
Bob's Browser receives message
    ↓
Bob's UI updates: "⚠️ 49 seats left!"
```

### Step 3: Charlie Also Watching
```
Charlie connects → ws_456_def
    ↓
WebSocketManager.eventSubscriptions = {
  1: Set["ws_123_abc", "ws_456_def"]  // Now 2 subscribers
}
    ↓
Next booking → Both Bob AND Charlie get notified!
```

## 🎯 Key Takeaways

1. **WebSocket Routes** = Entry point, handles connections
2. **WebSocket Manager** = Brain, tracks who's watching what
3. **Booking/Event Services** = Trigger updates after database changes
4. **Broadcasting** = Send message to all subscribers of an event

## 🔍 Debugging Tips

### See All Connected Clients
Add this to your WebSocket route:
```typescript
case 'get_stats':
  const stats = WebSocketManager.getStats();
  ws.send(JSON.stringify({ type: 'stats', data: stats }));
  break;
```

### Log Every Broadcast
In `WebSocketManager.broadcastToEvent()`:
```typescript
console.log(`Broadcasting to event ${eventId}:`, message);
console.log(`Subscribers:`, Array.from(eventClients));
```

### Test Without Frontend
Use the browser console or Postman to connect and test!