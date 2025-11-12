# WebSocket Flow - Simple Explanation

## 🎬 The Complete Flow

### Step 1: User Connects to WebSocket
```
User Browser/App
    ↓
    Opens WebSocket connection with JWT token
    ws://localhost:3000/ws/events/123?token=YOUR_JWT_TOKEN
    ↓
Server receives connection request
```

### Step 2: Server Authenticates
```
Server checks:
1. Is there a token? ✓
2. Is the token valid? ✓
3. Which user is this? → User ID: 456
    ↓
Server creates a unique client ID: "ws_1699123456789_abc123"
    ↓
Server stores: {
  clientId: "ws_1699123456789_abc123",
  userId: 456,
  eventId: 123
}
    ↓
Server sends back: "You're connected! Your client ID is ws_1699123456789_abc123"
```

### Step 3: User is Now Subscribed
```
User is now listening to Event #123
Any changes to Event #123 will be sent to this user automatically
```

### Step 4: Someone Books a Ticket
```
Another User (User #789) books a ticket for Event #123
    ↓
Booking Service creates the booking
    ↓
Booking Service calls: WebSocketManager.broadcastBookingCreated()
    ↓
WebSocketManager finds all users subscribed to Event #123
    ↓
Sends message to ALL subscribed users:
{
  "type": "booking_created",
  "eventId": 123,
  "bookingId": "BK-ABC123",
  "userId": 789,
  "availableSeats": 44,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

### Step 5: User Receives Real-Time Update
```
User's browser/app receives the message
    ↓
User's app updates the UI:
"⚠️ Only 44 seats left! (was 45)"
    ↓
User sees the update INSTANTLY without refreshing!
```

## 🏗️ Architecture - The Main Components

### 1. WebSocketManager (The Brain)
**Location**: `apps/server/src/services/websocket.ts`

**What it does**:
- Keeps track of all connected users
- Knows which users are watching which events
- Sends messages to the right users

**Think of it as**: A radio station manager who knows which listeners are tuned to which channels

```typescript
// Simplified version
class WebSocketManager {
  // Storage
  clients = new Map()           // All connected users
  eventSubscriptions = new Map() // Which users watch which events
  
  // When someone connects
  addClient(clientId, client) {
    this.clients.set(clientId, client)
  }
  
  // When someone wants to watch an event
  subscribeToEvent(clientId, eventId) {
    // Add this client to the event's subscriber list
  }
  
  // When something happens (booking created/cancelled)
  broadcastToEvent(eventId, message) {
    // Find all clients watching this event
    // Send them the message
  }
}
```

### 2. WebSocket Routes (The Entry Point)
**Location**: `apps/server/src/routes/websocket.ts`

**What it does**:
- Handles incoming WebSocket connections
- Authenticates users
- Manages the connection lifecycle

**Think of it as**: The receptionist who checks your ID and lets you in

```typescript
// Simplified version
app.get('/ws/events/:eventId', upgradeWebSocket((c) => {
  return {
    // When connection opens
    onOpen: async (event, ws) => {
      // 1. Check token
      // 2. Create client ID
      // 3. Subscribe to event
      // 4. Send confirmation
    },
    
    // When client sends a message
    onMessage: (event, ws) => {
      // Handle: subscribe, unsubscribe, ping
    },
    
    // When connection closes
    onClose: () => {
      // Clean up
    }
  }
}))
```

### 3. Integration with Booking Service
**Location**: `apps/server/src/services/booking.ts`

**What it does**:
- After creating a booking → Broadcasts update
- After cancelling a booking → Broadcasts update

```typescript
// In createBooking()
const booking = await createBookingInDatabase()

// 🔔 Broadcast to everyone watching this event!
WebSocketManager.broadcastBookingCreated(
  eventId,
  bookingId,
  userId,
  availableSeats
)
```

## 📨 Message Types Explained

### Messages Client Can Send:
```json
// 1. Subscribe to an event
{
  "type": "subscribe_event",
  "eventId": 123
}

// 2. Unsubscribe from an event
{
  "type": "unsubscribe_event",
  "eventId": 123
}

// 3. Check if connection is alive
{
  "type": "ping"
}
```

### Messages Server Sends:
```json
// 1. Welcome message
{
  "type": "connection_established",
  "clientId": "ws_1699123456789_abc123",
  "eventId": 123
}

// 2. Someone booked a ticket
{
  "type": "booking_created",
  "eventId": 123,
  "availableSeats": 44
}

// 3. Someone cancelled
{
  "type": "booking_cancelled",
  "eventId": 123,
  "availableSeats": 45
}

// 4. Seats changed (admin updated capacity)
{
  "type": "seat_update",
  "eventId": 123,
  "availableSeats": 50,
  "seatCapacity": 100
}
```

## 🎯 Real-World Example

Imagine a concert ticket booking:

1. **Alice** opens the event page for "Rock Concert"
   - Her browser connects: `ws://localhost:3000/ws/events/1?token=alice_token`
   - Server: "Welcome Alice! You're watching Event #1"

2. **Bob** also opens the same event page
   - His browser connects: `ws://localhost:3000/ws/events/1?token=bob_token`
   - Server: "Welcome Bob! You're watching Event #1"

3. **Charlie** books a ticket via the API
   - POST `/api/bookings` → Creates booking
   - Server broadcasts to Alice and Bob:
     ```json
     {
       "type": "booking_created",
       "eventId": 1,
       "availableSeats": 99
     }
     ```

4. **Alice and Bob** see the update INSTANTLY
   - Alice's screen: "⚠️ 99 seats left!"
   - Bob's screen: "⚠️ 99 seats left!"
   - No refresh needed!

## 🔐 Security Flow

```
1. User logs in → Gets JWT token
2. User connects to WebSocket with token
3. Server verifies token using same JWT secret
4. If valid → Connection allowed
5. If invalid → Connection rejected (code 1008)
```

## 💾 Data Storage

```
WebSocketManager stores:

clients Map:
{
  "ws_123_abc": {
    ws: <WebSocket connection>,
    userId: 456,
    eventId: 1
  },
  "ws_456_def": {
    ws: <WebSocket connection>,
    userId: 789,
    eventId: 1
  }
}

eventSubscriptions Map:
{
  1: Set["ws_123_abc", "ws_456_def"],  // Event 1 has 2 subscribers
  2: Set["ws_789_ghi"]                  // Event 2 has 1 subscriber
}
```

## 🔄 Connection Lifecycle

```
1. CONNECT
   ↓
2. AUTHENTICATE
   ↓
3. SUBSCRIBE (automatically or manually)
   ↓
4. RECEIVE UPDATES (as they happen)
   ↓
5. DISCONNECT (when user closes page)
   ↓
6. CLEANUP (remove from all maps)
```

## 🎨 Why This is Useful

**Without WebSockets:**
```
User sees: "50 seats available"
(Someone books)
User still sees: "50 seats available" ❌
User refreshes page
User now sees: "49 seats available" ✓
```

**With WebSockets:**
```
User sees: "50 seats available"
(Someone books)
User INSTANTLY sees: "49 seats available" ✓
No refresh needed!
```

## 🚀 Performance Benefits

- **No Polling**: Don't need to check server every second
- **Instant Updates**: Users see changes immediately
- **Efficient**: One connection, many messages
- **Scalable**: Server only sends to subscribed users