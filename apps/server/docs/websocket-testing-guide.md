# WebSocket Testing Guide

## 🧪 How to Test WebSockets

WebSockets are different from regular HTTP APIs, so you need special tools to test them.

## 📱 Method 1: Using Postman (Easiest)

### Step 1: Get Your JWT Token First
1. Open Postman
2. Make a POST request to login:
   ```
   POST http://localhost:3000/api/auth/login
   Body (JSON):
   {
     "email": "your@email.com",
     "password": "yourpassword"
   }
   ```
3. Copy the `token` from the response
   ```json
   {
     "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   }
   ```

### Step 2: Connect to WebSocket
1. In Postman, click **New** → **WebSocket Request**
2. Enter the URL:
   ```
   ws://localhost:3000/ws/events/1?token=YOUR_JWT_TOKEN_HERE
   ```
   Replace `YOUR_JWT_TOKEN_HERE` with the token from Step 1
   Replace `1` with an actual event ID from your database

3. Click **Connect**

### Step 3: You Should See
```json
{
  "type": "connection_established",
  "clientId": "ws_1699123456789_abc123",
  "eventId": 1,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

### Step 4: Send Messages
In the message box, send:

**Test 1: Ping**
```json
{
  "type": "ping"
}
```
You should receive:
```json
{
  "type": "pong",
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

**Test 2: Subscribe to Another Event**
```json
{
  "type": "subscribe_event",
  "eventId": 2
}
```
You should receive:
```json
{
  "type": "subscribed",
  "eventId": 2,
  "timestamp": "2024-11-11T10:30:00.000Z"
}
```

### Step 5: Test Real-Time Updates
1. Keep the WebSocket connection open in Postman
2. Open another Postman tab
3. Create a booking for the same event:
   ```
   POST http://localhost:3000/api/bookings
   Headers:
     Authorization: Bearer YOUR_JWT_TOKEN
   Body:
   {
     "eventId": 1
   }
   ```
4. Go back to your WebSocket tab
5. You should see a message appear automatically:
   ```json
   {
     "type": "booking_created",
     "eventId": 1,
     "bookingId": "BK-ABC123",
     "userId": 456,
     "availableSeats": 44,
     "timestamp": "2024-11-11T10:30:00.000Z"
   }
   ```

## 🌐 Method 2: Using Browser Console (Quick Test)

### Step 1: Get Your Token
Login via your app or Postman and copy the JWT token

### Step 2: Open Browser Console
1. Open your browser (Chrome/Firefox)
2. Press F12 to open Developer Tools
3. Go to the **Console** tab

### Step 3: Run This Code
```javascript
// Replace with your actual token
const token = 'YOUR_JWT_TOKEN_HERE';
const eventId = 1; // Replace with actual event ID

// Connect to WebSocket
const ws = new WebSocket(`ws://localhost:3000/ws/events/${eventId}?token=${token}`);

// When connection opens
ws.onopen = () => {
  console.log('✅ Connected to WebSocket!');
};

// When receiving messages
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('📨 Received:', message);
};

// When connection closes
ws.onclose = () => {
  console.log('❌ Disconnected');
};

// When error occurs
ws.onerror = (error) => {
  console.error('❌ Error:', error);
};

// Send a ping after 1 second
setTimeout(() => {
  ws.send(JSON.stringify({ type: 'ping' }));
  console.log('📤 Sent ping');
}, 1000);
```

### Step 4: Test Real-Time Updates
1. Keep the console open
2. In another tab, create a booking for the same event
3. Watch the console - you'll see the update appear!

## 🔧 Method 3: Using wscat (Command Line)

### Step 1: Install wscat
```bash
npm install -g wscat
```

### Step 2: Connect
```bash
wscat -c "ws://localhost:3000/ws/events/1?token=YOUR_JWT_TOKEN_HERE"
```

### Step 3: Send Messages
Once connected, type:
```json
{"type": "ping"}
```
Press Enter

You should see:
```json
{"type":"pong","timestamp":"2024-11-11T10:30:00.000Z"}
```

## 🎨 Method 4: Create a Simple HTML Test Page

Create a file `test-websocket.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <title>WebSocket Test</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 800px;
      margin: 50px auto;
      padding: 20px;
    }
    .message {
      background: #f0f0f0;
      padding: 10px;
      margin: 5px 0;
      border-radius: 5px;
    }
    .sent { background: #e3f2fd; }
    .received { background: #f1f8e9; }
    .error { background: #ffebee; }
    input, button {
      padding: 10px;
      margin: 5px;
    }
    #messages {
      height: 400px;
      overflow-y: auto;
      border: 1px solid #ccc;
      padding: 10px;
      margin: 10px 0;
    }
  </style>
</head>
<body>
  <h1>🔌 WebSocket Test</h1>
  
  <div>
    <input type="text" id="token" placeholder="Enter JWT Token" style="width: 400px">
    <input type="number" id="eventId" placeholder="Event ID" value="1">
    <button onclick="connect()">Connect</button>
    <button onclick="disconnect()">Disconnect</button>
  </div>
  
  <div>
    <button onclick="sendPing()">Send Ping</button>
    <button onclick="subscribe()">Subscribe to Event 2</button>
    <button onclick="getStats()">Get Stats</button>
  </div>
  
  <div id="messages"></div>
  
  <script>
    let ws = null;
    
    function addMessage(text, type = 'received') {
      const div = document.createElement('div');
      div.className = `message ${type}`;
      div.textContent = text;
      document.getElementById('messages').appendChild(div);
      document.getElementById('messages').scrollTop = 999999;
    }
    
    function connect() {
      const token = document.getElementById('token').value;
      const eventId = document.getElementById('eventId').value;
      
      if (!token) {
        alert('Please enter a JWT token');
        return;
      }
      
      const url = `ws://localhost:3000/ws/events/${eventId}?token=${token}`;
      addMessage(`Connecting to ${url}...`, 'sent');
      
      ws = new WebSocket(url);
      
      ws.onopen = () => {
        addMessage('✅ Connected!', 'received');
      };
      
      ws.onmessage = (event) => {
        const message = JSON.parse(event.data);
        addMessage(`📨 ${JSON.stringify(message, null, 2)}`, 'received');
      };
      
      ws.onclose = () => {
        addMessage('❌ Disconnected', 'error');
      };
      
      ws.onerror = (error) => {
        addMessage(`❌ Error: ${error.message}`, 'error');
      };
    }
    
    function disconnect() {
      if (ws) {
        ws.close();
        ws = null;
      }
    }
    
    function sendPing() {
      if (!ws) {
        alert('Not connected');
        return;
      }
      const message = { type: 'ping' };
      ws.send(JSON.stringify(message));
      addMessage(`📤 Sent: ${JSON.stringify(message)}`, 'sent');
    }
    
    function subscribe() {
      if (!ws) {
        alert('Not connected');
        return;
      }
      const message = { type: 'subscribe_event', eventId: 2 };
      ws.send(JSON.stringify(message));
      addMessage(`📤 Sent: ${JSON.stringify(message)}`, 'sent');
    }
    
    function getStats() {
      if (!ws) {
        alert('Not connected');
        return;
      }
      const message = { type: 'get_stats' };
      ws.send(JSON.stringify(message));
      addMessage(`📤 Sent: ${JSON.stringify(message)}`, 'sent');
    }
  </script>
</body>
</html>
```

**How to use:**
1. Save this as `test-websocket.html`
2. Open it in your browser
3. Enter your JWT token
4. Click Connect
5. Try the buttons!

## 🧪 Complete Testing Scenario

### Scenario: Test Real-Time Booking Updates

**Setup:**
1. Start your server: `bun run dev` (in apps/server)
2. Create a test user and login to get JWT token
3. Create a test event with some seats

**Test Steps:**

**Step 1: Open Two WebSocket Connections**
- Connection 1 (Postman): Connect to `ws://localhost:3000/ws/events/1?token=TOKEN1`
- Connection 2 (Browser Console): Connect to same event with different user token

**Step 2: Both Should Receive Welcome Message**
```json
{
  "type": "connection_established",
  "clientId": "ws_...",
  "eventId": 1
}
```

**Step 3: Create a Booking (Third Tab/Window)**
```bash
POST http://localhost:3000/api/bookings
Authorization: Bearer TOKEN3
Body: { "eventId": 1 }
```

**Step 4: Watch Both WebSocket Connections**
Both should receive:
```json
{
  "type": "booking_created",
  "eventId": 1,
  "bookingId": "BK-...",
  "availableSeats": 49
}
```

**Step 5: Cancel the Booking**
```bash
DELETE http://localhost:3000/api/bookings/BK-...
Authorization: Bearer TOKEN3
```

**Step 6: Watch Both WebSocket Connections Again**
Both should receive:
```json
{
  "type": "booking_cancelled",
  "eventId": 1,
  "bookingId": "BK-...",
  "availableSeats": 50
}
```

## 🐛 Troubleshooting

### Problem: "Connection Refused"
**Solution**: Make sure your server is running
```bash
cd apps/server
bun run dev
```

### Problem: "Authentication Failed" (Code 1008)
**Solution**: 
1. Check your JWT token is valid
2. Make sure you're using the correct token format
3. Token might be expired - login again

### Problem: "No Messages Received"
**Solution**:
1. Make sure you're subscribed to the correct event
2. Try creating a booking for that event
3. Check server console for errors

### Problem: "Invalid Token"
**Solution**:
1. Get a fresh token by logging in
2. Make sure there are no extra spaces in the token
3. Check the token is not expired

## 📊 Expected Results Summary

| Action | Expected WebSocket Message |
|--------|---------------------------|
| Connect | `connection_established` |
| Send ping | `pong` |
| Subscribe to event | `subscribed` |
| Someone books ticket | `booking_created` |
| Someone cancels | `booking_cancelled` |
| Admin updates capacity | `seat_update` |
| Invalid message | `error` |

## 🎯 Quick Test Checklist

- [ ] Can connect with valid token
- [ ] Cannot connect without token
- [ ] Receive welcome message on connect
- [ ] Can send and receive ping/pong
- [ ] Can subscribe to events
- [ ] Receive booking_created when someone books
- [ ] Receive booking_cancelled when someone cancels
- [ ] Connection closes cleanly
- [ ] Multiple clients can connect to same event
- [ ] All clients receive the same updates