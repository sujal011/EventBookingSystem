# 🔌 WebSocket Implementation - Quick Start

## 📚 Documentation Index

1. **[websocket-flow-explained.md](./websocket-flow-explained.md)** - Simple explanation of how WebSockets work
2. **[websocket-testing-guide.md](./websocket-testing-guide.md)** - How to test with Postman, Browser, etc.
3. **[websocket-code-walkthrough.md](./websocket-code-walkthrough.md)** - Line-by-line code explanation
4. **[websockets.md](./websockets.md)** - Complete API reference

## 🎯 Quick Summary

### What Are WebSockets?
Real-time, two-way communication between client and server. Like a phone call instead of sending letters.

### Why Do We Need Them?
So users can see seat availability updates INSTANTLY without refreshing the page.

### How Does It Work?

```
User Opens Event Page
        ↓
    Connects to WebSocket
        ↓
    Server: "Welcome! You're watching Event #1"
        ↓
    [Connection stays open]
        ↓
Someone Books a Ticket
        ↓
    Server → All Watchers: "Booking created! 49 seats left"
        ↓
    User's Page Updates Automatically ✨
```

## 🚀 Quick Test (5 Minutes)

### 1. Start Server
```bash
cd apps/server
bun run dev
```

### 2. Get JWT Token
```bash
# Login via Postman or your app
POST http://localhost:3000/api/auth/login
{
  "email": "test@example.com",
  "password": "password"
}

# Copy the token from response
```

### 3. Test in Browser Console
```javascript
// Paste this in browser console (F12)
const token = 'YOUR_TOKEN_HERE';
const ws = new WebSocket(`ws://localhost:3000/ws/events/1?token=${token}`);

ws.onmessage = (e) => {
  console.log('📨 Received:', JSON.parse(e.data));
};

ws.onopen = () => {
  console.log('✅ Connected!');
  ws.send(JSON.stringify({ type: 'ping' }));
};
```

### 4. Create a Booking
In another tab/Postman:
```bash
POST http://localhost:3000/api/bookings
Authorization: Bearer YOUR_TOKEN
{
  "eventId": 1
}
```

### 5. Watch the Console
You should see the update appear automatically! 🎉

## 📁 File Structure

```
apps/server/src/
├── index.ts                    # Exports WebSocket support
├── routes/
│   └── websocket.ts           # WebSocket endpoints
└── services/
    ├── websocket.ts           # Connection manager
    ├── booking.ts             # Triggers booking updates
    └── event.ts               # Triggers seat updates
```

## 🔗 Endpoints

### Connect to Specific Event
```
ws://localhost:3000/ws/events/{eventId}?token={jwt_token}
```

### Connect to General WebSocket
```
ws://localhost:3000/ws?token={jwt_token}
```

## 📨 Message Types

### You Send:
```json
{"type": "ping"}
{"type": "subscribe_event", "eventId": 123}
{"type": "unsubscribe_event", "eventId": 123}
```

### You Receive:
```json
{"type": "connection_established", "clientId": "ws_123_abc"}
{"type": "booking_created", "eventId": 1, "availableSeats": 49}
{"type": "booking_cancelled", "eventId": 1, "availableSeats": 50}
{"type": "seat_update", "eventId": 1, "availableSeats": 45}
{"type": "pong"}
```

## 🎨 Visual Flow

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ 1. Connect with JWT
       ↓
┌─────────────────────┐
│  WebSocket Routes   │
│  (Entry Point)      │
└──────┬──────────────┘
       │ 2. Authenticate
       │ 3. Register Client
       ↓
┌─────────────────────┐
│  WebSocket Manager  │
│  (The Brain)        │
│                     │
│  clients: Map       │
│  subscriptions: Map │
└──────┬──────────────┘
       │ 4. Subscribe to Event
       │
       │ [Connection stays open]
       │
       │ 5. Someone books ticket
       ↓
┌─────────────────────┐
│  Booking Service    │
│  (Triggers Update)  │
└──────┬──────────────┘
       │ 6. Broadcast update
       ↓
┌─────────────────────┐
│  WebSocket Manager  │
│  (Finds subscribers)│
└──────┬──────────────┘
       │ 7. Send to all clients
       ↓
┌─────────────┐
│   Client    │
│  (Receives) │
│  Updates UI │
└─────────────┘
```

## 🧪 Testing Tools

1. **Postman** - Best for beginners
2. **Browser Console** - Quick tests
3. **wscat** - Command line
4. **HTML Test Page** - Visual testing

See [websocket-testing-guide.md](./websocket-testing-guide.md) for details.

## 🔐 Security

- ✅ JWT authentication required
- ✅ Token verified on connection
- ✅ Users only see events they have access to
- ✅ Automatic cleanup on disconnect

## 🐛 Common Issues

### "Connection Refused"
→ Server not running. Run `bun run dev`

### "Authentication Failed"
→ Invalid/expired token. Login again

### "No Updates Received"
→ Check you're subscribed to correct event

## 💡 Pro Tips

1. **Keep Connection Alive**: Send ping every 30 seconds
2. **Handle Reconnection**: Auto-reconnect if connection drops
3. **Multiple Events**: Subscribe/unsubscribe dynamically
4. **Error Handling**: Always handle onError and onClose

## 🎓 Learning Path

1. Read: [websocket-flow-explained.md](./websocket-flow-explained.md)
2. Test: [websocket-testing-guide.md](./websocket-testing-guide.md)
3. Understand: [websocket-code-walkthrough.md](./websocket-code-walkthrough.md)
4. Reference: [websockets.md](./websockets.md)

## 🚀 Next Steps

- [ ] Test WebSocket connection in Postman
- [ ] Create a booking and watch the update
- [ ] Build a frontend component to display real-time updates
- [ ] Add reconnection logic
- [ ] Add visual indicators for connection status

## 📞 Need Help?

Check the troubleshooting sections in:
- [websocket-testing-guide.md](./websocket-testing-guide.md#-troubleshooting)
- [websockets.md](./websockets.md#troubleshooting)

---

**Remember**: WebSockets are just a way to keep a connection open so the server can send you updates anytime, not just when you ask! 🎉