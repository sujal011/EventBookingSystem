import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { db } from './db';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';

const app = new Hono();


app.use(logger());
app.use(
	"/*",
	cors({
		origin: process.env.CORS_ORIGIN || "",
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

// Export database for other modules
export { db };

export default app;
