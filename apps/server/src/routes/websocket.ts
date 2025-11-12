import { Hono } from 'hono';
import { upgradeWebSocket } from 'hono/bun';
import { WebSocketManager } from '../services/websocket';

const wsRoutes = new Hono();

wsRoutes.get('/events/:eventId',
  upgradeWebSocket((c) => {
    const eventId = parseInt(c.req.param('eventId'));
    const token = c.req.query('token');
    let clientId: string | null = null;
    let authenticated = false;

    return {
      async onOpen(_event, ws) {
        // Authenticate the connection
        if (!token) {
          ws.close(1008, 'Authentication token required');
          return;
        }

        const auth = await WebSocketManager.authenticateConnection(token);
        if (!auth) {
          ws.close(1008, 'Invalid authentication token');
          return;
        }

        // Generate client ID and add to manager
        clientId = WebSocketManager.generateClientId();
        authenticated = true;

        WebSocketManager.addClient(clientId, {
          ws,
          userId: auth.userId,
          eventId: undefined
        });

        // Subscribe to the specific event
        if (!isNaN(eventId)) {
          WebSocketManager.subscribeToEvent(clientId, eventId);
        }

        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connection_established',
          clientId,
          eventId: !isNaN(eventId) ? eventId : null,
          timestamp: new Date().toISOString()
        }));
      },

      onMessage(event, ws) {
        if (!authenticated || !clientId) return;

        try {
          const message = JSON.parse(event.data.toString());
          
          switch (message.type) {
            case 'subscribe_event':
              if (typeof message.eventId === 'number') {
                WebSocketManager.subscribeToEvent(clientId, message.eventId);
                ws.send(JSON.stringify({
                  type: 'subscribed',
                  eventId: message.eventId,
                  timestamp: new Date().toISOString()
                }));
              }
              break;

            case 'unsubscribe_event':
              if (typeof message.eventId === 'number') {
                WebSocketManager.unsubscribeFromEvent(clientId, message.eventId);
                ws.send(JSON.stringify({
                  type: 'unsubscribed',
                  eventId: message.eventId,
                  timestamp: new Date().toISOString()
                }));
              }
              break;

            case 'ping':
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: new Date().toISOString()
              }));
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      },

      onClose() {
        if (clientId) {
          WebSocketManager.removeClient(clientId);
        }
      },

      onError(_event) {
        console.error('WebSocket error for client:', clientId);
        if (clientId) {
          WebSocketManager.removeClient(clientId);
        }
      }
    };
  })
);

// General WebSocket endpoint (no specific event)
wsRoutes.get('/',
  upgradeWebSocket((c) => {
    const token = c.req.query('token');
    let clientId: string | null = null;
    let authenticated = false;

    return {
      async onOpen(_event, ws) {
        // Authenticate the connection
        if (!token) {
          ws.close(1008, 'Authentication token required');
          return;
        }

        const auth = await WebSocketManager.authenticateConnection(token);
        if (!auth) {
          ws.close(1008, 'Invalid authentication token');
          return;
        }

        // Generate client ID and add to manager
        clientId = WebSocketManager.generateClientId();
        authenticated = true;

        WebSocketManager.addClient(clientId, {
          ws,
          userId: auth.userId,
          eventId: undefined
        });

        // Send connection confirmation
        ws.send(JSON.stringify({
          type: 'connection_established',
          clientId,
          timestamp: new Date().toISOString()
        }));
      },

      onMessage(event, ws) {
        if (!authenticated || !clientId) return;

        try {
          const message = JSON.parse(event.data.toString());
          
          switch (message.type) {
            case 'subscribe_event':
              if (typeof message.eventId === 'number') {
                WebSocketManager.subscribeToEvent(clientId, message.eventId);
                ws.send(JSON.stringify({
                  type: 'subscribed',
                  eventId: message.eventId,
                  timestamp: new Date().toISOString()
                }));
              }
              break;

            case 'unsubscribe_event':
              if (typeof message.eventId === 'number') {
                WebSocketManager.unsubscribeFromEvent(clientId, message.eventId);
                ws.send(JSON.stringify({
                  type: 'unsubscribed',
                  eventId: message.eventId,
                  timestamp: new Date().toISOString()
                }));
              }
              break;

            case 'ping':
              ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
              }));
              break;

            case 'get_stats':
              const stats = WebSocketManager.getStats();
              ws.send(JSON.stringify({
                type: 'stats',
                data: stats,
                timestamp: new Date().toISOString()
              }));
              break;

            default:
              ws.send(JSON.stringify({
                type: 'error',
                message: 'Unknown message type',
                timestamp: new Date().toISOString()
              }));
          }
        } catch (error) {
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Invalid message format',
            timestamp: new Date().toISOString()
          }));
        }
      },

      onClose() {
        if (clientId) {
          WebSocketManager.removeClient(clientId);
        }
      },

      onError(_event) {
        console.error('WebSocket error for client:', clientId);
        if (clientId) {
          WebSocketManager.removeClient(clientId);
        }
      }
    };
  })
);

export default wsRoutes;