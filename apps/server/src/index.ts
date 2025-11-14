import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { websocket } from "hono/bun";
import { db } from './db';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import bookingRoutes from './routes/bookings';
import wsRoutes from './routes/websocket';

const app = new Hono();


app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || ["http://localhost:8080","https://preview--pure-front-focus.lovable.app"],
		allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
	}),
);

app.get("/", (c) => {
	return c.text("OK");
});

// Authentication routes
app.route('/api/auth', authRoutes);

// Event routes
app.route('/api/events', eventRoutes);

// Booking routes
app.route('/api/bookings', bookingRoutes);

// WebSocket routes
app.route('/ws', wsRoutes);

// Export database for other modules
export { db };

export default {
  fetch: app.fetch,
  websocket,
};
