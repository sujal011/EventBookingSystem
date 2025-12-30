import { Hono } from "hono";
import { AnalyticsService } from "../services/analytics";
import { authMiddleware, adminMiddleware } from "../middleware/auth";

type Variables = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};

const analytics = new Hono<{ Variables: Variables }>();

/**
 * GET /api/analytics/dashboard-stats - Get dashboard statistics (admin only)
 */
analytics.get(
  "/dashboard-stats",
  authMiddleware,
  adminMiddleware,
  async (c) => {
    try {
      const stats = await AnalyticsService.getDashboardStats();

      return c.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      return c.json(
        {
          error: {
            code: "INTERNAL_ERROR",
            message: "Failed to fetch dashboard statistics",
            timestamp: new Date().toISOString(),
          },
        },
        500
      );
    }
  }
);

export default analytics;
