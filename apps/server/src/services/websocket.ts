import type { WSContext } from "hono/ws";
import { AuthService } from "./auth";

export interface WebSocketClient {
  ws: WSContext;
  userId: number;
  eventId?: number;
}

export interface SeatUpdateMessage {
  type: "seat_update";
  eventId: number;
  availableSeats: number;
  seatCapacity: number;
  timestamp: string;
}

export interface BookingUpdateMessage {
  type: "booking_created" | "booking_cancelled";
  eventId: number;
  bookingId: string;
  userId: number;
  availableSeats: number;
  timestamp: string;
}

export type WebSocketMessage = SeatUpdateMessage | BookingUpdateMessage;

export class WebSocketManager {
  private static clients = new Map<string, WebSocketClient>();
  private static eventSubscriptions = new Map<number, Set<string>>();

  /**
   * Add a new WebSocket client
   */
  static addClient(clientId: string, client: WebSocketClient): void {
    this.clients.set(clientId, client);
    console.log(
      `WebSocket client connected: ${clientId}, userId: ${client.userId}`
    );
  }

  /**
   * Remove a WebSocket client
   */
  static removeClient(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client && client.eventId) {
      this.unsubscribeFromEvent(clientId, client.eventId);
    }
    this.clients.delete(clientId);
    console.log(`WebSocket client disconnected: ${clientId}`);
  }

  /**
   * Subscribe a client to event updates
   */
  static subscribeToEvent(clientId: string, eventId: number): void {
    const client = this.clients.get(clientId);
    if (!client) return;

    // Unsubscribe from previous event if any
    if (client.eventId) {
      this.unsubscribeFromEvent(clientId, client.eventId);
    }

    // Subscribe to new event
    client.eventId = eventId;
    if (!this.eventSubscriptions.has(eventId)) {
      this.eventSubscriptions.set(eventId, new Set());
    }
    this.eventSubscriptions.get(eventId)!.add(clientId);

    console.log(`Client ${clientId} subscribed to event ${eventId}`);
  }

  /**
   * Unsubscribe a client from event updates
   */
  static unsubscribeFromEvent(clientId: string, eventId: number): void {
    const eventClients = this.eventSubscriptions.get(eventId);
    if (eventClients) {
      eventClients.delete(clientId);
      if (eventClients.size === 0) {
        this.eventSubscriptions.delete(eventId);
      }
    }

    const client = this.clients.get(clientId);
    if (client) {
      client.eventId = undefined;
    }

    console.log(`Client ${clientId} unsubscribed from event ${eventId}`);
  }

  /**
   * Broadcast a message to all clients subscribed to an event
   */
  static broadcastToEvent(eventId: number, message: WebSocketMessage): void {
    const eventClients = this.eventSubscriptions.get(eventId);
    if (!eventClients) return;

    const messageStr = JSON.stringify(message);
    let sentCount = 0;

    for (const clientId of eventClients) {
      const client = this.clients.get(clientId);
      if (client) {
        try {
          client.ws.send(messageStr);
          sentCount++;
        } catch (error) {
          console.error(`Failed to send message to client ${clientId}:`, error);
          // Remove client if send fails
          this.removeClient(clientId);
        }
      }
    }

    console.log(
      `Broadcasted ${message.type} to ${sentCount} clients for event ${eventId}`
    );
  }

  /**
   * Broadcast seat availability update
   */
  static broadcastSeatUpdate(
    eventId: number,
    availableSeats: number,
    seatCapacity: number
  ): void {
    const message: SeatUpdateMessage = {
      type: "seat_update",
      eventId,
      availableSeats,
      seatCapacity,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToEvent(eventId, message);
  }

  /**
   * Broadcast booking creation
   */
  static broadcastBookingCreated(
    eventId: number,
    bookingId: string,
    userId: number,
    availableSeats: number
  ): void {
    const message: BookingUpdateMessage = {
      type: "booking_created",
      eventId,
      bookingId,
      userId,
      availableSeats,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToEvent(eventId, message);
  }

  /**
   * Broadcast booking cancellation
   */
  static broadcastBookingCancelled(
    eventId: number,
    bookingId: string,
    userId: number,
    availableSeats: number
  ): void {
    const message: BookingUpdateMessage = {
      type: "booking_cancelled",
      eventId,
      bookingId,
      userId,
      availableSeats,
      timestamp: new Date().toISOString(),
    };

    this.broadcastToEvent(eventId, message);
  }

  /**
   * Authenticate WebSocket connection using JWT token
   */
  static async authenticateConnection(
    token: string
  ): Promise<{ userId: number } | null> {
    try {
      const user = await AuthService.verifyToken(token);
      if (user) {
        return { userId: user.id };
      }
      return null;
    } catch (error) {
      console.error("WebSocket authentication failed:", error);
      return null;
    }
  }

  /**
   * Generate unique client ID
   */
  static generateClientId(): string {
    return `ws_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get connection statistics
   */
  static getStats(): { totalClients: number; eventSubscriptions: number } {
    return {
      totalClients: this.clients.size,
      eventSubscriptions: this.eventSubscriptions.size,
    };
  }
}
